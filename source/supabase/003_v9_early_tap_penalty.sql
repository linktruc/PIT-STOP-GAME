-- V9.1 upgrade: apply AFTER 002_v8_stability.sql on an existing V7/V8 project.
-- Additive/idempotent; keeps rooms and all historical results. No password is stored here.
begin;
select pg_advisory_xact_lock(734012981);
-- V9 additive per-round personal early-tap locks and owner-managed login aliases.
create table if not exists pit_private.penalties (
 round_id uuid not null references pit_private.rounds(id),
 player_id uuid not null references pit_private.members(id),
 until_ms numeric not null, at_ms numeric not null,
 primary key(round_id,player_id)
);
create table if not exists pit_private.early_requests (
 round_id uuid not null references pit_private.rounds(id),
 player_id uuid not null references pit_private.members(id),
 token text not null check(length(token) between 1 and 128), task_id text not null,
 primary key(round_id,player_id,token),
 foreign key(round_id,task_id) references pit_private.tasks(round_id,id)
);
create table if not exists pit_private.admin_aliases (
 username text primary key check(username ~ '^[a-z0-9_-]{1,40}$'),
 user_id uuid not null references pit_private.admins(user_id)
);
alter table pit_private.penalties enable row level security;
alter table pit_private.early_requests enable row level security;
alter table pit_private.admin_aliases enable row level security;
revoke all on pit_private.penalties,pit_private.early_requests,pit_private.admin_aliases from public,anon,authenticated;


create or replace function pit_private.apply_early_action(p_round uuid,p_player uuid,p_task text,p_now numeric,p_request text) returns void
language plpgsql set search_path = pg_catalog
as $fn$
declare v_task pit_private.tasks%rowtype; v_round pit_private.rounds%rowtype; v_prior text; v_until numeric;
begin
 if p_request is null or length(p_request) not between 1 and 128 then raise exception 'A valid early action request ID is required'; end if;
 select * into v_round from pit_private.rounds where id=p_round for update;
 if not found or not exists(select 1 from pit_private.members where id=p_player and room_id=v_round.room_id and active) then raise exception 'Not a member of this round'; end if;
 select * into v_task from pit_private.tasks where round_id=p_round and id=p_task;
 if not found or v_task.owner_id is distinct from p_player then raise exception 'This action belongs to another role'; end if;
 select task_id into v_prior from pit_private.early_requests where round_id=p_round and player_id=p_player and token=p_request;
 if found then
  if v_prior<>p_task then raise exception 'Request ID was already used for a different early action'; end if;
  return;
 end if;
 perform pit_private.reconcile_round(p_round,p_now);
 select * into v_round from pit_private.rounds where id=p_round;
 select * into v_task from pit_private.tasks where round_id=p_round and id=p_task;
 insert into pit_private.early_requests(round_id,player_id,token,task_id) values(p_round,p_player,p_request,p_task);
 if v_task.status='DONE' or v_round.status not in ('COUNTDOWN','RUNNING') then return; end if;
 select until_ms into v_until from pit_private.penalties where round_id=p_round and player_id=p_player;
 if v_until>p_now then return; end if;
 if v_round.status='COUNTDOWN' or v_task.status='LOCKED' then
  insert into pit_private.penalties(round_id,player_id,until_ms,at_ms) values(p_round,p_player,greatest(v_round.go_at,p_now)+2000,p_now)
  on conflict(round_id,player_id) do update set until_ms=excluded.until_ms,at_ms=excluded.at_ms;
 end if;
end
$fn$;

create or replace function pit_private.apply_action(p_round uuid,p_player uuid,p_task text,p_now numeric,p_request text) returns void
language plpgsql set search_path = pg_catalog
as $fn$
declare v_task pit_private.tasks%rowtype; v_prior text; v_room uuid; v_status text;
begin
  if p_request is null or length(p_request)<1 or length(p_request)>128 then raise exception 'A valid action request ID is required'; end if;
  select room_id,status into v_room,v_status from pit_private.rounds where id=p_round;
  if not exists(select 1 from pit_private.members where id=p_player and room_id=v_room and active) then
    raise exception 'You are no longer a member of this room';
  end if;
  select task_id into v_prior from pit_private.requests where round_id=p_round and player_id=p_player and token=p_request;
  if found then
    if v_prior<>p_task then raise exception 'Request ID was already used for a different action'; end if;
    return;
  end if;
  perform pit_private.reconcile_round(p_round,p_now);
  select status into v_status from pit_private.rounds where id=p_round;
  if v_status<>'RUNNING' then raise exception 'The round is not running'; end if;
  select * into v_task from pit_private.tasks where round_id=p_round and id=p_task for update;
  if not found or v_task.owner_id is distinct from p_player then raise exception 'This action belongs to another role'; end if;
  if v_task.status='DONE' then raise exception 'Action already completed'; end if;
  if exists(select 1 from pit_private.penalties where round_id=p_round and player_id=p_player and until_ms>p_now) then raise exception 'Personal lockout is still active'; end if;
  if v_task.status<>'AVAILABLE' or v_task.enabled_at>p_now then raise exception 'Action is locked until its prerequisites are complete'; end if;
  if p_now-v_task.enabled_at>120000 then raise exception 'Action expired after two minutes; leave this round and start again'; end if;
  update pit_private.tasks set status='DONE',completed_at=p_now,reason='HUMAN_ACTION' where round_id=p_round and id=p_task;
  insert into pit_private.samples(round_id,task_id,player_id,ms,at) values(p_round,p_task,p_player,p_now-v_task.enabled_at,p_now);
  insert into pit_private.events(round_id,task_id,at,reason) values(p_round,p_task,p_now,'HUMAN_ACTION');
  insert into pit_private.requests(round_id,player_id,token,task_id) values(p_round,p_player,p_request,p_task);
  update pit_private.rooms set updated_at=p_now where id=v_room;
  perform pit_private.reconcile_round(p_round,p_now);
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
    'round',(select jsonb_build_object('penalties',coalesce((select jsonb_object_agg(p.player_id::text,jsonb_build_object('until',p.until_ms,'at',p.at_ms)) from pit_private.penalties p where p.round_id=rd.id),'{}'::jsonb),'id',rd.id,'status',rd.status,'goAt',rd.go_at,'finishedAt',rd.finished_at,'elapsedMs',rd.elapsed_ms,
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
-- Resolves only a configured allowlisted alias. Password verification stays in Supabase Auth.
create or replace function public.pit_admin_login_identity(p_username text) returns jsonb
language plpgsql security definer set search_path = pg_catalog set row_security = off
as $fn$
declare v_email text;
begin
 if p_username is null or length(p_username)>40 then raise exception 'Invalid admin username'; end if;
 select u.email into v_email from pit_private.admin_aliases a
 join pit_private.admins ad on ad.user_id=a.user_id join auth.users u on u.id=a.user_id
 where a.username=lower(btrim(p_username));
 if v_email is null then raise exception 'Admin username is not configured. Ask the project owner to set up the admin account'; end if;
 return jsonb_build_object('email',v_email);
end
$fn$;
revoke all on function public.pit_admin_login_identity(text) from public;
grant execute on function public.pit_admin_login_identity(text) to anon,authenticated;

revoke all on all functions in schema pit_private from public,anon,authenticated;
revoke all on function public.pit_call(text,uuid,jsonb) from public;
grant execute on function public.pit_call(text,uuid,jsonb) to anon,authenticated;
commit;
