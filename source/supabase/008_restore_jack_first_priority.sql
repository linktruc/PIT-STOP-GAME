-- V15: restore jack-first pit stop while retaining V14 role-family priority.
-- Apply after 007_role_family_priority.sql to EXISTING Supabase projects.
-- Only new rounds receive this graph; old rounds/events/replays/results remain untouched.
-- Existing unique player roles and Ready flags remain unchanged unless the room
-- has no opening jack at all; then exactly one player is reassigned and notified.
begin;
select pg_advisory_xact_lock(734012981);

create or replace function pit_private.assign_roles(p_room uuid) returns void
language plpgsql set search_path = pg_catalog
as $fn$
declare
  v_roles text[]:=array['FRONT_JACK','REAR_JACK','RELEASE_CONTROLLER','FL_GUNNER','FL_WHEEL_OFF','FL_WHEEL_ON','FR_GUNNER','FR_WHEEL_OFF','FR_WHEEL_ON','RL_GUNNER','RL_WHEEL_OFF','RL_WHEEL_ON','RR_GUNNER','RR_WHEEL_OFF','RR_WHEEL_ON'];
  v_seen text[]:='{}'; v_families text[]:='{}';
  v_player record; v_role text; v_family text; v_n integer;
begin
  select count(*) into v_n from pit_private.members where room_id=p_room and active;
  if v_n>15 then raise exception 'A room supports at most 15 players'; end if;
  -- Keep all existing unique role assignments and Ready states. Assign only empty/duplicate slots.
  -- Joined order is authoritative, not incoming snapshot order or a full reroll.
  for v_player in select id,role from pit_private.members where room_id=p_room and active order by joined_at,id loop
    if v_player.role=any(v_roles) and not(v_player.role=any(v_seen)) then
      v_role:=v_player.role;
    else
      select x into v_role from unnest(v_roles) x where not(x=any(v_seen))
      order by
        case
          when cardinality(v_seen)=0 then
            case when x in ('FRONT_JACK','REAR_JACK') then 0 else 1 end
          when cardinality(v_families)<5 then
            case when (case
              when x like '%_GUNNER' then 'GUNNER'
              when x in ('FRONT_JACK','REAR_JACK') then 'JACK'
              when x like '%_WHEEL_OFF' then 'WHEEL_OFF'
              when x like '%_WHEEL_ON' then 'WHEEL_ON'
              else 'RELEASE'
            end)=any(v_families) then 1 else 0 end
          else
            case when x like '%_GUNNER' or x in ('FRONT_JACK','REAR_JACK') then 0 else 1 end
        end,
        random()
      limit 1;
      update pit_private.members set role=v_role,ready=false where id=v_player.id;
    end if;
    v_seen:=array_append(v_seen,v_role);
    v_family:=case
      when v_role like '%_GUNNER' then 'GUNNER'
      when v_role in ('FRONT_JACK','REAR_JACK') then 'JACK'
      when v_role like '%_WHEEL_OFF' then 'WHEEL_OFF'
      when v_role like '%_WHEEL_ON' then 'WHEEL_ON'
      else 'RELEASE'
    end;
    if not(v_family=any(v_families)) then
      v_families:=array_append(v_families,v_family);
    end if;
  end loop;
  -- Repair only legacy waiting lobbies with no opening jack.
  -- Repair only one role, preserving the other members' roles and Ready state.
  if v_n>0 and not exists(select 1 from unnest(v_seen) x where x in ('FRONT_JACK','REAR_JACK')) then
    select id into v_player from pit_private.members where room_id=p_room and active order by joined_at,id limit 1;
    select x into v_role from unnest(v_roles) x where x in ('FRONT_JACK','REAR_JACK') order by random() limit 1;
    update pit_private.members set role=v_role,ready=false,
      role_notice='An opening jack is required. You are now a jack operator. Mark Ready again.'
      where id=v_player.id;
  end if;
end
$fn$;


create or replace function pit_private.make_tasks(p_round uuid,p_room uuid) returns void
language plpgsql set search_path = pg_catalog
as $fn$
declare v_corner text; v_axle text;
begin
  insert into pit_private.tasks(round_id,id,role,cohort,dependencies)
  values (p_round,'FRONT_LIFT','FRONT_JACK','LIFT','{}'),
         (p_round,'REAR_LIFT','REAR_JACK','LIFT','{}');
  foreach v_corner in array array['FL','FR','RL','RR'] loop
    v_axle := case when left(v_corner,1)='F' then 'FRONT' else 'REAR' end;
    insert into pit_private.tasks(round_id,id,role,cohort,dependencies) values
      (p_round,v_corner||'_GUN_LOOSEN',v_corner||'_GUNNER','GUN_LOOSEN',array[v_axle||'_LIFT']),
      (p_round,v_corner||'_WHEEL_OFF',v_corner||'_WHEEL_OFF','WHEEL_OFF',array[v_corner||'_GUN_LOOSEN']),
      (p_round,v_corner||'_WHEEL_ON',v_corner||'_WHEEL_ON','WHEEL_ON',array[v_corner||'_WHEEL_OFF']),
      (p_round,v_corner||'_GUN_TIGHTEN',v_corner||'_GUNNER','GUN_TIGHTEN',array[v_corner||'_WHEEL_ON']);
  end loop;
  insert into pit_private.tasks(round_id,id,role,cohort,dependencies) values
    (p_round,'FRONT_LOWER','FRONT_JACK','LOWER',array['FL_GUN_TIGHTEN','FR_GUN_TIGHTEN']),
    (p_round,'REAR_LOWER','REAR_JACK','LOWER',array['RL_GUN_TIGHTEN','RR_GUN_TIGHTEN']),
    (p_round,'GREEN_RELEASE','RELEASE_CONTROLLER','GREEN_RELEASE',array['FRONT_LOWER','REAR_LOWER','FL_GUN_TIGHTEN','FR_GUN_TIGHTEN','RL_GUN_TIGHTEN','RR_GUN_TIGHTEN']);
  update pit_private.tasks t set owner_id=m.id
  from pit_private.members m where t.round_id=p_round and m.room_id=p_room and m.active and m.role=t.role;
end
$fn$;

-- Deterministic event processor. Effective event times, not wakeup times, score
-- bots. Every due event is processed chronologically; newly unlocked descendants
-- sample only human observations already completed at their eligibility time.

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
      if not exists(select 1 from pit_private.members where room_id=p_room and active and role in ('FRONT_JACK','REAR_JACK')) then raise exception 'A human jack operator is required'; end if;
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

commit;
