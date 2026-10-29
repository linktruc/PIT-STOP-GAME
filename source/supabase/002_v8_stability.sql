-- PIT STOP SIMULATOR V8: apply to an existing V7 project in Supabase SQL Editor.
-- Additive and idempotent. Does not delete rooms, members, rounds or results.
begin;
select pg_advisory_xact_lock(734012981);
-- V8 additive lobby stability configuration. Owner-only; values are milliseconds.
alter table pit_private.members alter column role set default '';
alter table pit_private.members add column if not exists role_notice text;
create table if not exists pit_private.settings (
  id boolean primary key default true check(id),
  lobby_grace_ms integer not null default 900000 check(lobby_grace_ms between 180000 and 86400000),
  disconnected_after_ms integer not null default 45000 check(disconnected_after_ms between 15000 and 180000)
);
insert into pit_private.settings(id) values(true) on conflict do nothing;
alter table pit_private.settings enable row level security;
revoke all on pit_private.settings from public,anon,authenticated;
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
        order by case when cardinality(v_seen)=0 and x in ('FRONT_JACK','REAR_JACK') then 0 else 1 end,random() limit 1;
      update pit_private.members set role=v_role,ready=false where id=v_player.id;
      v_seen:=array_append(v_seen,v_role);
    end if;
  end loop;
  if v_n>0 and not('FRONT_JACK'=any(v_seen) or 'REAR_JACK'=any(v_seen)) then
    select id into v_player from pit_private.members where room_id=p_room and active order by joined_at,id limit 1;
    v_role:=case when random()<0.5 then 'FRONT_JACK' else 'REAR_JACK' end;
    update pit_private.members set role=v_role,ready=false,
      role_notice='The last human jack left. You are now the '||case when v_role='FRONT_JACK' then 'front' else 'rear' end||' jack operator. Mark Ready again.' where id=v_player.id;
  end if;
end
$fn$;

create or replace function pit_private.remove_member(p_player uuid,p_reason text,p_now numeric) returns void
language plpgsql set search_path = pg_catalog
as $fn$
declare v_room uuid; v_next uuid; v_round uuid; v_status text;
begin
  update pit_private.members set active=false,ready=false,removed_reason=p_reason where id=p_player and active returning room_id into v_room;
  if not found then return; end if;
  select current_round_id,status into v_round,v_status from pit_private.rooms where id=v_room for update;
  if v_status in ('COUNTDOWN','RUNNING') then
    update pit_private.rounds set status='ABANDONED' where id=v_round and status in ('COUNTDOWN','RUNNING');
    update pit_private.rooms set status='WAITING',current_round_id=null where id=v_room;
    update pit_private.members set ready=false where room_id=v_room and active;
  end if;
  select id into v_next from pit_private.members where room_id=v_room and active order by joined_at,id limit 1;
  if v_next is null then
    update pit_private.rooms set status='CLOSED',host_id=null,updated_at=p_now where id=v_room;
  else
    update pit_private.rooms set host_id=case when host_id=p_player then v_next else host_id end,updated_at=p_now where id=v_room;
    if v_status<>'COMPLETED' then perform pit_private.assign_roles(v_room); end if;
  end if;
end
$fn$;

create or replace function pit_private.public_snapshot(p_now numeric) returns jsonb
language sql stable set search_path = pg_catalog
as $fn$
select jsonb_build_object(
  'rooms',coalesce((select jsonb_agg(jsonb_build_object(
    'id',r.id,'teamId',r.team_id,'name',team.name,'color',team.color,'code',r.code,'hostId',r.host_id,'status',r.status,'updatedAt',r.updated_at,
    'players',coalesce((select jsonb_agg(jsonb_build_object('id',m.id,'nickname',m.nickname,'role',m.role,'ready',m.ready,
      'joinedAt',m.joined_at,'roleNotice',m.role_notice,'connected',m.last_seen_at>=p_now-coalesce((select disconnected_after_ms from pit_private.settings where id),45000)) order by m.joined_at,m.id)
      from pit_private.members m where m.room_id=r.id and m.active),'[]'::jsonb),
    'round',(select jsonb_build_object('id',rd.id,'status',rd.status,'goAt',rd.go_at,'finishedAt',rd.finished_at,'elapsedMs',rd.elapsed_ms,
      'tasks',coalesce((select jsonb_agg(jsonb_build_object('id',t.id,'role',t.role,'cohort',t.cohort,'dependencies',to_jsonb(t.dependencies),
        'ownerId',t.owner_id,'status',t.status,'enabledAt',t.enabled_at,'completedAt',t.completed_at,'baselineMeanMs',t.baseline_mean_ms,'dueAt',t.due_at,'reason',t.reason) order by
        case t.cohort when 'LIFT' then 1 when 'GUN_LOOSEN' then 2 when 'WHEEL_OFF' then 3 when 'WHEEL_ON' then 4 when 'GUN_TIGHTEN' then 5 when 'LOWER' then 6 else 7 end,t.id)
        from pit_private.tasks t where t.round_id=rd.id),'[]'::jsonb),
      'samples',coalesce((select jsonb_agg(jsonb_build_object('taskId',s.task_id,'ms',s.ms,'at',s.at) order by s.at,s.task_id)
        from pit_private.samples s where s.round_id=rd.id),'[]'::jsonb),
      'events',coalesce((select jsonb_agg(jsonb_build_object('taskId',e.task_id,'at',e.at,'reason',e.reason) order by e.at,e.id)
        from pit_private.events e where e.round_id=rd.id),'[]'::jsonb)
      ) from pit_private.rounds rd where rd.id=r.current_round_id)
    ) order by r.created_at,r.id) from pit_private.rooms r join pit_private.teams team on team.id=r.team_id where r.status<>'CLOSED'),'[]'::jsonb),
  'leaderboard',coalesce((select jsonb_agg(entry order by average_ms,best_ms,team_id) from (
    select team.id team_id,avg(s.elapsed_ms) average_ms,min(s.elapsed_ms) best_ms,
      jsonb_build_object('teamId',team.id,'name',team.name,'color',team.color,'averageMs',avg(s.elapsed_ms),'bestMs',min(s.elapsed_ms),
        'rounds',jsonb_agg(jsonb_build_object('id',s.id,'roundId',s.round_id,'teamId',s.team_id,'elapsedMs',s.elapsed_ms,'finishedAt',s.finished_at) order by s.finished_at,s.id)) entry
      from pit_private.results s join pit_private.teams team on team.id=s.team_id group by team.id,team.name,team.color
    ) ranked),'[]'::jsonb)
)
$fn$;

create or replace function public.pit_call(p_op text,p_room uuid default null,p_payload jsonb default '{}'::jsonb) returns jsonb
language plpgsql security definer set search_path = pg_catalog set row_security = off
as $fn$
declare
  v_uid uuid:=auth.uid(); v_now numeric; v_room pit_private.rooms%rowtype; v_member pit_private.members%rowtype;
  v_team uuid; v_player uuid; v_round uuid; v_count integer; v_ready integer; v_name text; v_nick text; v_color text;
  v_target uuid; v_result uuid; v_deleted integer; v_snapshot jsonb; v_admin boolean; v_row record;
begin
  if p_op is null or p_op not in ('create','join','ready','start','action','kick','leave','replay','heartbeat','admin_delete') then raise exception 'Unknown operation'; end if;
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
  elsif p_op in ('ready','start','action','kick','leave','replay') then
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
      if not exists(select 1 from pit_private.members where room_id=p_room and active and role in ('FRONT_JACK','REAR_JACK')) then raise exception 'A human jack operator is required'; end if;
      insert into pit_private.rounds(room_id,status,go_at) values(p_room,'COUNTDOWN',v_now+3000) returning id into v_round;
      perform pit_private.make_tasks(v_round,p_room);
      update pit_private.rooms set status='COUNTDOWN',current_round_id=v_round,updated_at=v_now where id=p_room;
    elsif p_op='action' then
      if v_room.current_round_id is null then raise exception 'Start a round before acting'; end if;
      perform pit_private.apply_action(v_room.current_round_id,v_member.id,p_payload->>'taskId',v_now,p_payload->>'requestId');
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
revoke all on all functions in schema pit_private from public,anon,authenticated;
revoke all on function public.pit_call(text,uuid,jsonb) from public;
grant execute on function public.pit_call(text,uuid,jsonb) to anon,authenticated;
commit;
