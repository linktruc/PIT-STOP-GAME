-- V12 rule change: Loosen nuts -> Lift -> Remove -> Fit -> Lower -> Tighten -> Release.
-- Apply AFTER 004_v10_recorded_replays.sql, to an EXISTING Supabase project.
-- Only future rounds use the new dependency graph. All completed and running
-- rounds retain their original tasks/events/results/replays and timestamps.
-- Existing WAITING rooms preserve unaffected roles/Ready; a single role is
-- repaired when an opening gunner is missing. All ranked starts require one.
begin;
select pg_advisory_xact_lock(734012981);

create or replace function pit_private.assign_roles(p_room uuid) returns void
language plpgsql set search_path = pg_catalog
as $fn$
declare
  v_roles text[]:=array['FRONT_JACK','REAR_JACK','RELEASE_CONTROLLER','FL_GUNNER','FL_WHEEL_OFF','FL_WHEEL_ON','FR_GUNNER','FR_WHEEL_OFF','FR_WHEEL_ON','RL_GUNNER','RL_WHEEL_OFF','RL_WHEEL_ON','RR_GUNNER','RR_WHEEL_OFF','RR_WHEEL_ON'];
  v_seen text[]:='{}'; v_player record; v_role text; v_n integer;
begin
  select count(*) into v_n from pit_private.members where room_id=p_room and active;
  if v_n>15 then raise exception 'A room supports at most 15 players'; end if;
  for v_player in select id,role from pit_private.members where room_id=p_room and active order by joined_at,id loop
    if v_player.role=any(v_roles) and not(v_player.role=any(v_seen)) then
      v_seen:=array_append(v_seen,v_player.role);
    else
      select x into v_role from unnest(v_roles) x where not(x=any(v_seen))
        order by case when cardinality(v_seen)=0 and x like '%_GUNNER' then 0 else 1 end,random() limit 1;
      update pit_private.members set role=v_role,ready=false where id=v_player.id;
      v_seen:=array_append(v_seen,v_role);
    end if;
  end loop;
  if v_n>0 and not exists(select 1 from unnest(v_seen) x where x like '%_GUNNER') then
    select id into v_player from pit_private.members where room_id=p_room and active order by joined_at,id limit 1;
    select x into v_role from unnest(v_roles) x where x like '%_GUNNER' order by random() limit 1;
    update pit_private.members set role=v_role,ready=false,
      role_notice='A wheel gunner is needed to open the stop. You are now the wheel gunner. Mark Ready again.' where id=v_player.id;
  end if;
end
$fn$;

create or replace function pit_private.make_tasks(p_round uuid,p_room uuid) returns void
language plpgsql set search_path = pg_catalog
as $fn$
declare v_corner text; v_axle text;
begin
  -- Opening wheel gunners loosen first; each jack waits for both axle nuts.
  foreach v_corner in array array['FL','FR','RL','RR'] loop
    insert into pit_private.tasks(round_id,id,role,cohort,dependencies)
      values(p_round,v_corner||'_GUN_LOOSEN',v_corner||'_GUNNER','GUN_LOOSEN','{}');
  end loop;
  insert into pit_private.tasks(round_id,id,role,cohort,dependencies) values
    (p_round,'FRONT_LIFT','FRONT_JACK','LIFT',array['FL_GUN_LOOSEN','FR_GUN_LOOSEN']),
    (p_round,'REAR_LIFT','REAR_JACK','LIFT',array['RL_GUN_LOOSEN','RR_GUN_LOOSEN']);
  foreach v_corner in array array['FL','FR','RL','RR'] loop
    v_axle := case when left(v_corner,1)='F' then 'FRONT' else 'REAR' end;
    insert into pit_private.tasks(round_id,id,role,cohort,dependencies) values
      (p_round,v_corner||'_WHEEL_OFF',v_corner||'_WHEEL_OFF','WHEEL_OFF',array[v_axle||'_LIFT']),
      (p_round,v_corner||'_WHEEL_ON',v_corner||'_WHEEL_ON','WHEEL_ON',array[v_corner||'_WHEEL_OFF']),
      (p_round,v_corner||'_GUN_TIGHTEN',v_corner||'_GUNNER','GUN_TIGHTEN',array[v_axle||'_LOWER']);
  end loop;
  insert into pit_private.tasks(round_id,id,role,cohort,dependencies) values
    (p_round,'FRONT_LOWER','FRONT_JACK','LOWER',array['FL_WHEEL_ON','FR_WHEEL_ON']),
    (p_round,'REAR_LOWER','REAR_JACK','LOWER',array['RL_WHEEL_ON','RR_WHEEL_ON']),
    (p_round,'GREEN_RELEASE','RELEASE_CONTROLLER','GREEN_RELEASE',array['FRONT_LOWER','REAR_LOWER','FL_GUN_TIGHTEN','FR_GUN_TIGHTEN','RL_GUN_TIGHTEN','RR_GUN_TIGHTEN']);
  update pit_private.tasks t set owner_id=m.id
  from pit_private.members m where t.round_id=p_round and m.room_id=p_room and m.active and m.role=t.role;
end
$fn$;

create or replace function pit_private.reconcile_round(p_round uuid,p_now numeric) returns void
language plpgsql set search_path = pg_catalog
as $fn$
declare
  v_round pit_private.rounds%rowtype; v_task record; v_next record;
  v_enabled numeric; v_mean numeric; v_humans integer; v_pending integer;
  v_last_human numeric; v_effective numeric; v_reason text;
  v_best_time numeric; v_best_id text; v_best_reason text;
  v_finished numeric; v_room uuid; v_team uuid; v_opening_cohort text; v_changed boolean:=false; v_iterations integer:=0;
begin
  select * into v_round from pit_private.rounds where id=p_round for update;
  if not found or v_round.status in ('COMPLETED','ABANDONED') or p_now<v_round.go_at then return; end if;
  v_room:=v_round.room_id;
  -- Existing rounds created under the earlier jack-first rules keep their
  -- old synchronization, while newly created rounds use opening gunners.
  select case when cardinality(t.dependencies)=0 then 'LIFT' else 'GUN_LOOSEN' end
    into v_opening_cohort from pit_private.tasks t
    where t.round_id=p_round and t.id='FRONT_LIFT';
  v_opening_cohort:=coalesce(v_opening_cohort,'GUN_LOOSEN');
  if v_round.status='COUNTDOWN' then
    update pit_private.rounds set status='RUNNING' where id=p_round;
    update pit_private.rooms set status='RUNNING',updated_at=p_now where id=v_room;
    v_changed:=true;
  end if;
  loop
    v_iterations:=v_iterations+1;
    if v_iterations>100 then raise exception 'Task graph failed to settle'; end if;
    -- Only children of already completed predecessors can become eligible.
    for v_task in select * from pit_private.tasks t where t.round_id=p_round and t.status='LOCKED'
      and not exists(select 1 from unnest(t.dependencies) d where not exists(
        select 1 from pit_private.tasks x where x.round_id=p_round and x.id=d and x.status='DONE'))
      order by t.id
    loop
      select greatest(v_round.go_at,coalesce(max(completed_at),v_round.go_at)) into v_enabled
      from pit_private.tasks where round_id=p_round and id=any(v_task.dependencies);
      if v_enabled>p_now then continue; end if;
      select avg(ms) into v_mean from pit_private.samples where round_id=p_round and at<=v_enabled;
      update pit_private.tasks set status='AVAILABLE',enabled_at=v_enabled,
        baseline_mean_ms=case when owner_id is null and cohort<>v_opening_cohort then v_mean else null end,
        due_at=case when owner_id is null and cohort<>v_opening_cohort then v_enabled+v_mean else null end,
        reason=case when owner_id is null and cohort=v_opening_cohort then case when v_opening_cohort='LIFT' then 'WAIT_FOR_HUMAN_JACK_SYNC' else 'WAIT_FOR_HUMAN_GUNNER_SYNC' end else null end
      where round_id=p_round and id=v_task.id;
      v_changed:=true;
    end loop;

    v_best_time:=null; v_best_id:=null; v_best_reason:=null;
    for v_task in select * from pit_private.tasks where round_id=p_round and status='AVAILABLE' and owner_id is null order by id
    loop
      v_effective:=v_task.due_at; v_reason:='BASELINE_DUE';
      select count(*),count(*) filter(where status<>'DONE'),max(completed_at)
        into v_humans,v_pending,v_last_human
      from pit_private.tasks where round_id=p_round and cohort=v_task.cohort and owner_id is not null;
      if v_humans>0 and v_pending=0 then
        if v_task.cohort=v_opening_cohort then
          v_effective:=greatest(v_task.enabled_at,v_last_human);v_reason:=case when v_opening_cohort='LIFT' then 'OPENING_JACK_SYNC' else 'OPENING_GUNNER_SYNC' end;
        elsif v_task.cohort<>'GREEN_RELEASE' and
          (v_effective is null or greatest(v_task.enabled_at,v_last_human)<=v_effective) then
          v_effective:=greatest(v_task.enabled_at,v_last_human);
          v_reason:=case when v_last_human<=v_task.enabled_at then 'COHORT_ALREADY_FINISHED' else 'PARALLEL_HUMAN_CAP' end;
        end if;
      end if;
      if v_effective is not null and v_effective<=p_now and
        (v_best_time is null or v_effective<v_best_time or (v_effective=v_best_time and v_task.id<v_best_id)) then
        v_best_time:=v_effective;v_best_id:=v_task.id;v_best_reason:=v_reason;
      end if;
    end loop;
    exit when v_best_id is null;
    update pit_private.tasks set status='DONE',completed_at=v_best_time,reason=v_best_reason
      where round_id=p_round and id=v_best_id;
    insert into pit_private.events(round_id,task_id,at,reason) values(p_round,v_best_id,v_best_time,v_best_reason)
      on conflict(round_id,task_id) do nothing;
    v_changed:=true;
  end loop;
  select completed_at into v_finished from pit_private.tasks where round_id=p_round and id='GREEN_RELEASE' and status='DONE';
  if v_finished is not null then
    update pit_private.rounds set status='COMPLETED',finished_at=v_finished,elapsed_ms=v_finished-go_at where id=p_round;
    update pit_private.rooms set status='COMPLETED',updated_at=p_now where id=v_room returning team_id into v_team;
    insert into pit_private.results(round_id,team_id,elapsed_ms,finished_at)
      values(p_round,v_team,v_finished-v_round.go_at,v_finished) on conflict(round_id) do nothing;
  elsif v_changed then
    update pit_private.rooms set updated_at=p_now where id=v_room;
  end if;
end
$fn$;

create or replace function public.pit_call(p_op text,p_room uuid default null,p_payload jsonb default '{}'::jsonb) returns jsonb
language plpgsql security definer set search_path = pg_catalog set row_security = off
as $fn$
declare
  v_uid uuid:=auth.uid(); v_now numeric; v_room pit_private.rooms%rowtype; v_member pit_private.members%rowtype;
  v_team uuid; v_player uuid; v_round uuid; v_count integer; v_ready integer; v_name text; v_nick text; v_color text;
  v_target uuid; v_result uuid; v_deleted integer; v_snapshot jsonb; v_admin boolean; v_row record;
begin
  if p_op is null or p_op not in ('create','join','ready','start','action','early_action','kick','leave','replay','heartbeat','admin_delete') then raise exception 'Unknown operation'; end if;
  if p_payload is null or jsonb_typeof(p_payload)<>'object' or octet_length(p_payload::text)>8192 then raise exception 'Invalid request payload'; end if;
  -- One short transaction serializes state transitions across the classroom.
  -- It makes capacity, cohort caps, admin deletion and global snapshots atomic.
  perform pg_advisory_xact_lock(734012981);
  v_now:=pit_private.clock_ms();
  if v_uid is null and p_op<>'heartbeat' then raise exception 'Sign in before joining or playing'; end if;
  select exists(select 1 from pit_private.admins where user_id=v_uid) into v_admin;

  if v_uid is not null and p_room is not null then
    update pit_private.members set last_seen_at=v_now where user_id=v_uid and room_id=p_room and active;
  end if;
  -- An unattended waiting host cannot strand a room. Running players keep their
  -- exact roles when disconnected; reconnect can recover without a score change.
  for v_row in select m.id from pit_private.members m join pit_private.rooms r on r.id=m.room_id
    where m.active and r.status='WAITING' and m.last_seen_at<v_now-coalesce((select lobby_grace_ms from pit_private.settings where id),900000) order by m.joined_at,m.id
  loop perform pit_private.remove_member(v_row.id,'DISCONNECTED',v_now); end loop;
  for v_row in select id from pit_private.rounds where status in ('COUNTDOWN','RUNNING') order by id
  loop perform pit_private.reconcile_round(v_row.id,v_now); end loop;

  if p_op='create' then
    perform pit_private.rate_limit(v_uid,'create',v_now);
    if exists(select 1 from pit_private.members where user_id=v_uid and active) then raise exception 'Leave your current room before creating another'; end if;
    v_name:=btrim(coalesce(p_payload->>'name',''));v_nick:=btrim(coalesce(p_payload->>'nickname',''));v_color:=coalesce(p_payload->>'color','#ff334f');
    if length(v_name) not between 1 and 40 then raise exception 'Team name must contain 1–40 characters'; end if;
    if length(v_nick) not between 1 and 24 then raise exception 'Nickname must contain 1–24 characters'; end if;
    if v_color!~'^#[0-9A-Fa-f]{6}$' then raise exception 'Choose a valid team color'; end if;
    insert into pit_private.teams(name,color) values(v_name,v_color) returning id into v_team;
    insert into pit_private.rooms(team_id,code,updated_at) values(v_team,upper(replace(gen_random_uuid()::text,'-','')),v_now) returning * into v_room;
    insert into pit_private.members(room_id,user_id,nickname,joined_at,last_seen_at) values(v_room.id,v_uid,v_nick,v_now,v_now) returning id into v_player;
    update pit_private.rooms set host_id=v_player where id=v_room.id;
    perform pit_private.assign_roles(v_room.id);
  elsif p_op='join' then
    perform pit_private.rate_limit(v_uid,'join',v_now);
    select * into v_room from pit_private.rooms where id=p_room for update;
    if not found then raise exception 'Room not found'; end if;
    select * into v_member from pit_private.members where user_id=v_uid and active;
    if found then
      if v_member.room_id<>p_room then raise exception 'Leave your current room before joining another'; end if;
      -- Joining the same room again is a reconnect, never a second seat.
    else
      if v_room.status<>'WAITING' then raise exception 'This room is not accepting players'; end if;
      if exists(select 1 from pit_private.members where room_id=p_room and user_id=v_uid and removed_reason='KICKED') then raise exception 'You were removed from this room'; end if;
      select count(*) into v_count from pit_private.members where room_id=p_room and active;
      if v_count>=15 then raise exception 'This room is full (15 players)'; end if;
      v_nick:=btrim(coalesce(p_payload->>'nickname',''));
      if length(v_nick) not between 1 and 24 then raise exception 'Nickname must contain 1–24 characters'; end if;
      insert into pit_private.members(room_id,user_id,nickname,joined_at,last_seen_at) values(p_room,v_uid,v_nick,v_now,v_now);
      perform pit_private.assign_roles(p_room);
      update pit_private.rooms set updated_at=v_now where id=p_room;
    end if;
  elsif p_op in ('ready','start','action','early_action','kick','leave','replay') then
    select * into v_room from pit_private.rooms where id=p_room for update;
    if not found then raise exception 'Room not found'; end if;
    select * into v_member from pit_private.members where user_id=v_uid and room_id=p_room and active;
    if not found then
      if exists(select 1 from pit_private.members where user_id=v_uid and room_id=p_room and removed_reason='KICKED') then raise exception 'You were removed from this room'; end if;
      raise exception 'You are not a member of this room';
    end if;
    if p_op in ('start','kick','replay') and v_room.host_id is distinct from v_member.id then raise exception 'Only this room’s host can do that'; end if;
    if p_op='ready' then
      if v_room.status<>'WAITING' then raise exception 'Readiness is locked during a round'; end if;
      if jsonb_typeof(p_payload->'ready') is distinct from 'boolean' then raise exception 'Ready must be true or false'; end if;
      update pit_private.members set ready=(p_payload->>'ready')::boolean,role_notice=null where id=v_member.id;
      update pit_private.rooms set updated_at=v_now where id=p_room;
    elsif p_op='start' then
      if v_room.status<>'WAITING' then raise exception 'This room is not waiting to start'; end if;
      select count(*),count(*) filter(where ready) into v_count,v_ready from pit_private.members where room_id=p_room and active;
      if v_count<4 or v_count>15 then raise exception 'Start requires 4–15 real players'; end if;
      if v_ready<>v_count then raise exception 'Every player, including the host, must be Ready'; end if;
      if exists(select 1 from pit_private.members where room_id=p_room and active and last_seen_at<v_now-coalesce((select disconnected_after_ms from pit_private.settings where id),45000)) then raise exception 'A player is disconnected. Wait for reconnect or remove that player before starting'; end if;
      if not exists(select 1 from pit_private.members where room_id=p_room and active and role like '%_GUNNER') then raise exception 'A human wheel gunner is required'; end if;
      insert into pit_private.rounds(room_id,status,go_at) values(p_room,'COUNTDOWN',v_now+3000) returning id into v_round;
      perform pit_private.make_tasks(v_round,p_room);
      update pit_private.rooms set status='COUNTDOWN',current_round_id=v_round,updated_at=v_now where id=p_room;
    elsif p_op in ('action','early_action') then
      if v_room.current_round_id is null then raise exception 'Start a round before acting'; end if;
      if p_op='early_action' then
        perform pit_private.apply_early_action(v_room.current_round_id,v_member.id,p_payload->>'taskId',v_now,p_payload->>'requestId');
      else
        perform pit_private.apply_action(v_room.current_round_id,v_member.id,p_payload->>'taskId',v_now,p_payload->>'requestId');
      end if;
    elsif p_op='kick' then
      if v_room.status<>'WAITING' then raise exception 'Players can only be removed in the lobby'; end if;
      v_target:=(p_payload->>'playerId')::uuid;
      if v_target is null or v_target=v_member.id then raise exception 'Choose another player to remove'; end if;
      if not exists(select 1 from pit_private.members where id=v_target and room_id=p_room and active) then raise exception 'Player not found in this room'; end if;
      perform pit_private.remove_member(v_target,'KICKED',v_now);
    elsif p_op='leave' then
      perform pit_private.remove_member(v_member.id,'LEFT',v_now);
    elsif p_op='replay' then
      if v_room.status<>'COMPLETED' then raise exception 'Finish this round before playing again'; end if;
      update pit_private.rooms set status='WAITING',current_round_id=null,updated_at=v_now where id=p_room;
      update pit_private.members set ready=false where room_id=p_room and active;
      perform pit_private.assign_roles(p_room);
    end if;
  elsif p_op='admin_delete' then
    if not v_admin then raise exception 'Global administrator permission is required'; end if;
    if p_payload->>'confirm' is distinct from 'DELETE' then raise exception 'Confirm deletion with DELETE'; end if;
    v_team:=(p_payload->>'teamId')::uuid;v_result:=(p_payload->>'resultId')::uuid;
    delete from pit_private.results where (v_team is null or team_id=v_team) and (v_result is null or id=v_result);
    get diagnostics v_deleted=row_count;
    insert into pit_private.audit(user_id,operation,payload) values(v_uid,'DELETE_RESULTS',jsonb_build_object('teamId',v_team,'resultId',v_result,'deletedCount',v_deleted));
  end if;

  v_snapshot:=pit_private.public_snapshot(v_now);
  insert into public.pit_public_state(id,state,updated_at) values('global',v_snapshot,clock_timestamp())
    on conflict(id) do update set state=excluded.state,updated_at=excluded.updated_at
      where public.pit_public_state.state is distinct from excluded.state;
  select id into v_player from pit_private.members where user_id=v_uid and active;
  return v_snapshot||jsonb_build_object('serverNow',pit_private.clock_ms(),'identity',jsonb_build_object('playerId',v_player,'isAdmin',v_admin));
end
$fn$;

create or replace function pit_private.round_snapshot(p_round uuid) returns jsonb
language sql stable set search_path = pg_catalog
as $fn$
select jsonb_build_object('id',rd.id,'players',rd.roster,'status',rd.status,'goAt',rd.go_at,
 'finishedAt',rd.finished_at,'elapsedMs',rd.elapsed_ms,
 'penalties',coalesce((select jsonb_object_agg(p.player_id::text,jsonb_build_object('until',p.until_ms,'at',p.at_ms))
  from pit_private.penalties p where p.round_id=rd.id),'{}'::jsonb),
 'tasks',coalesce((select jsonb_agg(jsonb_build_object('id',t.id,'role',t.role,'cohort',t.cohort,
  'dependencies',to_jsonb(t.dependencies),'ownerId',t.owner_id,'status',t.status,'enabledAt',t.enabled_at,
  'completedAt',t.completed_at,'baselineMeanMs',t.baseline_mean_ms,'dueAt',t.due_at,'reason',t.reason)
  order by case t.cohort when 'GUN_LOOSEN' then 1 when 'LIFT' then 2 when 'WHEEL_OFF' then 3
   when 'WHEEL_ON' then 4 when 'LOWER' then 5 when 'GUN_TIGHTEN' then 6 else 7 end,t.id)
  from pit_private.tasks t where t.round_id=rd.id),'[]'::jsonb),
 'samples',coalesce((select jsonb_agg(jsonb_build_object('taskId',s.task_id,'ms',s.ms,'at',s.at) order by s.at,s.task_id)
  from pit_private.samples s where s.round_id=rd.id),'[]'::jsonb),
 'events',coalesce((select jsonb_agg(jsonb_build_object('taskId',e.task_id,'at',e.at,'reason',e.reason,
  'enabledAt',e.enabled_at,'ownerId',e.owner_id,'nickname',e.nickname,'role',e.role) order by e.at,e.task_id)
  from pit_private.events e where e.round_id=rd.id),'[]'::jsonb))
from pit_private.rounds rd where rd.id=p_round
$fn$;

-- Repair only incomplete waiting rosters that still lack an opening gunner.
-- Any directly reassigned player is notified and must mark Ready again.
do $repair$
declare v_room record;
begin
  for v_room in select r.id from pit_private.rooms r
    where r.status='WAITING'
      and exists(select 1 from pit_private.members m where m.room_id=r.id and m.active)
      and not exists(select 1 from pit_private.members m
                     where m.room_id=r.id and m.active and m.role like '%_GUNNER')
  loop
    perform pit_private.assign_roles(v_room.id);
  end loop;
end
$repair$;

-- The single public invalidation row keeps public room/replay viewers in sync.
insert into public.pit_public_state(id,state,updated_at)
 values('global',pit_private.public_snapshot(pit_private.clock_ms()),clock_timestamp())
 on conflict(id) do update set state=excluded.state,updated_at=excluded.updated_at;
commit;
