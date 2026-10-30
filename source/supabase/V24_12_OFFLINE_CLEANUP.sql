-- Run once in Supabase SQL Editor as project owner. Safe to rerun.
begin;
select pg_advisory_xact_lock(734012981);

-- Offline membership expires in every room phase, before a returning client renews it.
create or replace function pit_private.expire_offline_members(p_now numeric) returns void
language plpgsql set search_path = pg_catalog
as $fn$
declare v_member record;
begin
  for v_member in select m.id from pit_private.members m
    where m.active and m.last_seen_at<=p_now-300000 order by m.joined_at,m.id
  loop perform pit_private.remove_member(v_member.id,'DISCONNECTED',p_now); end loop;
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

  perform pit_private.expire_offline_members(v_now);
  if v_uid is not null and p_room is not null then
    update pit_private.members set last_seen_at=v_now where user_id=v_uid and room_id=p_room and active;
  end if;
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

-- V24.12: autonomous cleanup also runs when nobody opens the game.
alter table pit_private.settings alter column lobby_grace_ms set default 300000;
update pit_private.settings set lobby_grace_ms=300000 where id;

create or replace function pit_private.cleanup_presence() returns void
language plpgsql security definer set search_path = pg_catalog set row_security = off
as $fn$
declare v_now numeric; v_snapshot jsonb;
begin
  perform pg_advisory_xact_lock(734012981);
  v_now:=pit_private.clock_ms();
  perform pit_private.expire_offline_members(v_now);
  v_snapshot:=pit_private.public_snapshot(v_now);
  insert into public.pit_public_state(id,state,updated_at) values('global',v_snapshot,clock_timestamp())
    on conflict(id) do update set state=excluded.state,updated_at=excluded.updated_at
      where public.pit_public_state.state is distinct from excluded.state;
end
$fn$;
revoke all on function pit_private.expire_offline_members(numeric) from public,anon,authenticated;
revoke all on function pit_private.cleanup_presence() from public,anon,authenticated;

-- Supabase SQL Editor (project owner): https://supabase.com/docs/guides/cron/install
-- Local PostgreSQL runtimes without pg_cron still clean up on every public RPC.
do $cron$
begin
  if exists(select 1 from pg_available_extensions where name='pg_cron') then
    execute 'create extension if not exists pg_cron with schema pg_catalog';
    execute $job$select cron.schedule('pit-offline-cleanup','* * * * *',
      'select pit_private.cleanup_presence();')$job$;
  else
    raise notice 'pg_cron unavailable: enable Supabase Cron for unattended cleanup';
  end if;
end
$cron$;
select pit_private.cleanup_presence();

commit;
