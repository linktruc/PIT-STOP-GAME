-- PIT CREW authoritative multiplayer backend, PostgreSQL 15+ / Supabase.
-- Run this complete file once in the Supabase SQL Editor as the project owner.
-- It is safe to re-run: existing teams, members, rounds and results are preserved.
-- Enable Anonymous Sign-Ins in Authentication > Providers before playing.
-- Only public.pit_call and public.pit_state are client entry points.
-- No service-role key belongs in the website. See supabase/README.md.

begin;

create schema if not exists pit_private;
revoke all on schema pit_private from public, anon, authenticated;

create table if not exists pit_private.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 1 and 40),
  color text not null check (color ~ '^#[0-9A-Fa-f]{6}$'),
  created_at timestamptz not null default now()
);
create table if not exists pit_private.rooms (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references pit_private.teams(id),
  code text not null unique,
  host_id uuid,
  status text not null default 'WAITING' check (status in ('WAITING','COUNTDOWN','RUNNING','COMPLETED','CLOSED')),
  current_round_id uuid,
  updated_at numeric not null,
  created_at timestamptz not null default now()
);
create table if not exists pit_private.members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references pit_private.rooms(id),
  user_id uuid not null,
  nickname text not null check (length(nickname) between 1 and 24),
  role text not null default 'FRONT_JACK',
  ready boolean not null default false,
  active boolean not null default true,
  removed_reason text,
  joined_at numeric not null,
  last_seen_at numeric not null
);
create unique index if not exists pit_one_active_membership on pit_private.members(user_id) where active;
create index if not exists pit_room_members on pit_private.members(room_id, active);
create table if not exists pit_private.rounds (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references pit_private.rooms(id),
  status text not null check (status in ('COUNTDOWN','RUNNING','COMPLETED','ABANDONED')),
  go_at numeric not null,
  finished_at numeric,
  elapsed_ms numeric check (elapsed_ms >= 0)
);
create table if not exists pit_private.tasks (
  round_id uuid not null references pit_private.rounds(id),
  id text not null,
  role text not null,
  cohort text not null,
  dependencies text[] not null default '{}',
  owner_id uuid references pit_private.members(id),
  status text not null default 'LOCKED' check (status in ('LOCKED','AVAILABLE','DONE')),
  enabled_at numeric,
  completed_at numeric,
  baseline_mean_ms numeric,
  due_at numeric,
  reason text,
  primary key (round_id,id),
  check (completed_at is null or completed_at >= enabled_at)
);
create table if not exists pit_private.samples (
  round_id uuid not null,
  task_id text not null,
  player_id uuid not null references pit_private.members(id),
  ms numeric not null check (ms between 0 and 120000),
  at numeric not null,
  primary key (round_id,task_id),
  foreign key(round_id,task_id) references pit_private.tasks(round_id,id)
);
create table if not exists pit_private.events (
  id bigint generated always as identity primary key,
  round_id uuid not null,
  task_id text not null,
  at numeric not null,
  reason text not null,
  unique (round_id,task_id),
  foreign key(round_id,task_id) references pit_private.tasks(round_id,id)
);
create table if not exists pit_private.requests (
  round_id uuid not null references pit_private.rounds(id),
  player_id uuid not null references pit_private.members(id),
  token text not null,
  task_id text not null,
  primary key(round_id,player_id,token)
);
create table if not exists pit_private.results (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null unique references pit_private.rounds(id),
  team_id uuid not null references pit_private.teams(id),
  elapsed_ms numeric not null check (elapsed_ms >= 0),
  finished_at numeric not null
);
create index if not exists pit_team_results on pit_private.results(team_id,finished_at);
create table if not exists pit_private.admins (
  user_id uuid primary key,
  created_at timestamptz not null default now()
);
create table if not exists pit_private.audit (
  id bigint generated always as identity primary key,
  user_id uuid not null,
  operation text not null,
  payload jsonb not null,
  created_at timestamptz not null default now()
);
create table if not exists pit_private.rate_limits (
  user_id uuid not null,
  operation text not null,
  window_at numeric not null,
  count integer not null,
  primary key(user_id,operation)
);

-- All private tables are inaccessible through REST, even if this schema is
-- accidentally added to exposed schemas. No client write policies are created.
do $block$
declare t text;
begin
  foreach t in array array['teams','rooms','members','rounds','tasks','samples','events','requests','results','admins','audit','rate_limits'] loop
    execute format('alter table pit_private.%I enable row level security',t);
    execute format('revoke all on pit_private.%I from public, anon, authenticated',t);
  end loop;
end
$block$;

create table if not exists public.pit_public_state (
  id text primary key check (id = 'global'),
  state jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.pit_public_state enable row level security;
revoke all on public.pit_public_state from public, anon, authenticated;
grant select on public.pit_public_state to anon, authenticated;
drop policy if exists pit_public_read on public.pit_public_state;
create policy pit_public_read on public.pit_public_state for select to anon, authenticated using (true);

create or replace function pit_private.clock_ms() returns numeric
language sql volatile set search_path = pg_catalog
as $$ select floor(extract(epoch from clock_timestamp()) * 1000) $$;

-- A changed roster changes role ownership, so everybody explicitly readies again.
create or replace function pit_private.assign_roles(p_room uuid) returns void
language plpgsql set search_path = pg_catalog
as $fn$
declare v_roles text[]; v_n integer; v_i integer := 1; v_player record; v_jack text;
begin
  select count(*) into v_n from pit_private.members where room_id=p_room and active;
  if v_n = 0 then return; end if;
  if v_n > 15 then raise exception 'A room supports at most 15 players'; end if;
  select array_agg(role order by random()) into v_roles from unnest(array[
    'FRONT_JACK','REAR_JACK','RELEASE_CONTROLLER',
    'FL_GUNNER','FL_WHEEL_OFF','FL_WHEEL_ON','FR_GUNNER','FR_WHEEL_OFF','FR_WHEEL_ON',
    'RL_GUNNER','RL_WHEEL_OFF','RL_WHEEL_ON','RR_GUNNER','RR_WHEEL_OFF','RR_WHEEL_ON'
  ]) role;
  if not ('FRONT_JACK'=any(v_roles[1:v_n]) or 'REAR_JACK'=any(v_roles[1:v_n])) then
    -- Exchange rather than duplicate the chosen jack slot.
    v_jack:=case when random()<0.5 then 'FRONT_JACK' else 'REAR_JACK' end;
    v_i := array_position(v_roles,v_jack);
    v_roles[v_i] := v_roles[1];
    v_roles[1] := v_jack;
  end if;
  v_i:=1;
  for v_player in select id from pit_private.members where room_id=p_room and active order by random() loop
    update pit_private.members set role=v_roles[v_i],ready=false where id=v_player.id;
    v_i:=v_i+1;
  end loop;
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
create or replace function pit_private.reconcile_round(p_round uuid,p_now numeric) returns void
language plpgsql set search_path = pg_catalog
as $fn$
declare
  v_round pit_private.rounds%rowtype; v_task record; v_next record;
  v_enabled numeric; v_mean numeric; v_humans integer; v_pending integer;
  v_last_human numeric; v_effective numeric; v_reason text;
  v_best_time numeric; v_best_id text; v_best_reason text;
  v_finished numeric; v_room uuid; v_team uuid; v_changed boolean:=false; v_iterations integer:=0;
begin
  select * into v_round from pit_private.rounds where id=p_round for update;
  if not found or v_round.status in ('COMPLETED','ABANDONED') or p_now<v_round.go_at then return; end if;
  v_room:=v_round.room_id;
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
        baseline_mean_ms=case when owner_id is null and cohort<>'LIFT' then v_mean else null end,
        due_at=case when owner_id is null and cohort<>'LIFT' then v_enabled+v_mean else null end,
        reason=case when owner_id is null and cohort='LIFT' then 'WAIT_FOR_HUMAN_JACK_SYNC' else null end
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
        if v_task.cohort='LIFT' then
          v_effective:=greatest(v_task.enabled_at,v_last_human);v_reason:='OPENING_JACK_SYNC';
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

-- Internal only. Public callers cannot supply p_now or impersonate p_player.
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
      'joinedAt',m.joined_at,'connected',m.last_seen_at>=p_now-90000) order by m.joined_at,m.id)
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

create or replace function pit_private.rate_limit(p_user uuid,p_operation text,p_now numeric) returns void
language plpgsql set search_path = pg_catalog
as $fn$
declare v_count integer; v_max integer;
begin
  v_max:=case when p_operation='create' then 12 else 100 end;
  insert into pit_private.rate_limits(user_id,operation,window_at,count) values(p_user,p_operation,p_now,1)
  on conflict(user_id,operation) do update set
    count=case when excluded.window_at-pit_private.rate_limits.window_at>=60000 then 1 else pit_private.rate_limits.count+1 end,
    window_at=case when excluded.window_at-pit_private.rate_limits.window_at>=60000 then excluded.window_at else pit_private.rate_limits.window_at end
  returning count into v_count;
  if v_count>v_max then raise exception 'Please wait before trying this operation again'; end if;
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
    where m.active and r.status='WAITING' and m.last_seen_at<v_now-90000 order by m.joined_at,m.id
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
      update pit_private.members set ready=(p_payload->>'ready')::boolean where id=v_member.id;
      update pit_private.rooms set updated_at=v_now where id=p_room;
    elsif p_op='start' then
      if v_room.status<>'WAITING' then raise exception 'This room is not waiting to start'; end if;
      select count(*),count(*) filter(where ready) into v_count,v_ready from pit_private.members where room_id=p_room and active;
      if v_count<4 or v_count>15 then raise exception 'Start requires 4–15 real players'; end if;
      if v_ready<>v_count then raise exception 'Every player, including the host, must be Ready'; end if;
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

create or replace function public.pit_state() returns jsonb
language sql security definer set search_path = pg_catalog set row_security = off
as $$ select public.pit_call('heartbeat',null,'{}'::jsonb) $$;

-- Function defaults grant PUBLIC execute, so revoke explicitly, including every
-- helper accepting a timestamp or player ID. Helpers remain owner-only.
revoke all on all functions in schema pit_private from public, anon, authenticated;
revoke all on all sequences in schema pit_private from public, anon, authenticated;
revoke all on function public.pit_call(text,uuid,jsonb) from public;
revoke all on function public.pit_state() from public;
grant execute on function public.pit_call(text,uuid,jsonb) to anon, authenticated;
grant execute on function public.pit_state() to anon, authenticated;

insert into public.pit_public_state(id,state) values('global','{"rooms":[],"leaderboard":[]}'::jsonb) on conflict(id) do nothing;

-- Safe aggregate only: never publish auth IDs, private membership or admin data.
do $block$
begin
  if exists(select 1 from pg_publication where pubname='supabase_realtime') and
    not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='pit_public_state') then
    alter publication supabase_realtime add table public.pit_public_state;
  end if;
end
$block$;

commit;

-- Admin setup (trusted SQL Editor only; substitute the signed-in admin's UUID):
-- insert into pit_private.admins(user_id) values ('YOUR-AUTH-USER-UUID') on conflict do nothing;
