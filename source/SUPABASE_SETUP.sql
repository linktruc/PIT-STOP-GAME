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

-- V8 additive lobby stability configuration. Owner-only; values are milliseconds.
alter table pit_private.members alter column role set default '';
alter table pit_private.members add column if not exists role_notice text;
create table if not exists pit_private.settings (
  id boolean primary key default true check(id),
  lobby_grace_ms integer not null default 300000 check(lobby_grace_ms between 180000 and 86400000),
  disconnected_after_ms integer not null default 45000 check(disconnected_after_ms between 15000 and 180000)
);
insert into pit_private.settings(id) values(true) on conflict do nothing;
alter table pit_private.settings enable row level security;
revoke all on pit_private.settings from public,anon,authenticated;

-- V8 assigns only unused roles. Unaffected roles and readiness remain stable.
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
      when v_role in ('FRONT_JACK','REAR_JACK') then 'GUNNER'
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
  insert into pit_private.penalties(round_id,player_id,until_ms,at_ms) values(p_round,p_player,p_now+2000,p_now)
  on conflict(round_id,player_id) do update set until_ms=excluded.until_ms,at_ms=excluded.at_ms;
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
    'round',(select jsonb_build_object('penalties',coalesce((select jsonb_object_agg(p.player_id::text,jsonb_build_object('until',p.until_ms,'at',p.at_ms)) from pit_private.penalties p where p.round_id=rd.id),'{}'::jsonb),'id',rd.id,'status',rd.status,'goAt',rd.go_at,'finishedAt',rd.finished_at,'elapsedMs',rd.elapsed_ms,
      'tasks',coalesce((select jsonb_agg(jsonb_build_object('id',t.id,'role',t.role,'cohort',t.cohort,'dependencies',to_jsonb(t.dependencies),
        'ownerId',t.owner_id,'status',t.status,'enabledAt',t.enabled_at,'completedAt',t.completed_at,'baselineMeanMs',t.baseline_mean_ms,'dueAt',t.due_at,'reason',t.reason) order by
        case t.cohort when 'GUN_LOOSEN' then 1 when 'LIFT' then 2 when 'WHEEL_OFF' then 3 when 'WHEEL_ON' then 4 when 'LOWER' then 5 when 'GUN_TIGHTEN' then 6 else 7 end,t.id)
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


-- V10 recorded-round persistence and atomic result cleanup.
select pg_advisory_xact_lock(734012981);

alter table pit_private.rounds add column if not exists roster jsonb not null default '[]'::jsonb;
alter table pit_private.rounds add column if not exists team_name text;
alter table pit_private.rounds add column if not exists team_color text;
alter table pit_private.events add column if not exists enabled_at numeric;
alter table pit_private.events add column if not exists owner_id uuid;
alter table pit_private.events add column if not exists nickname text;
alter table pit_private.events add column if not exists role text;

create or replace function pit_private.capture_round_identity() returns trigger
language plpgsql set search_path = pg_catalog
as $fn$
begin
 select t.name,t.color into new.team_name,new.team_color
 from pit_private.rooms r join pit_private.teams t on t.id=r.team_id where r.id=new.room_id;
 select coalesce(jsonb_agg(jsonb_build_object('id',m.id,'nickname',m.nickname,'role',m.role,
   'ready',m.ready,'joinedAt',m.joined_at,'connected',true) order by m.joined_at,m.id),'[]'::jsonb)
 into new.roster from pit_private.members m where m.room_id=new.room_id and m.active;
 return new;
end
$fn$;
drop trigger if exists pit_round_identity on pit_private.rounds;
create trigger pit_round_identity before insert on pit_private.rounds
 for each row execute function pit_private.capture_round_identity();

-- A retained task's owner/role is better historical evidence than a member's
-- current role after subsequent Play again. Do not invent absent timestamps.
update pit_private.rounds rd set roster=coalesce((select jsonb_agg(p.player order by p.joined_at,p.id) from (
 select distinct m.id,m.joined_at,jsonb_build_object('id',m.id,'nickname',m.nickname,'role',t.role,
   'ready',false,'joinedAt',m.joined_at,'connected',false) player
 from pit_private.tasks t join pit_private.members m on m.id=t.owner_id where t.round_id=rd.id
 ) p),'[]'::jsonb) where rd.roster='[]'::jsonb;
update pit_private.rounds rd set team_name=coalesce(rd.team_name,t.name),team_color=coalesce(rd.team_color,t.color)
 from pit_private.rooms r join pit_private.teams t on t.id=r.team_id where rd.room_id=r.id
 and (rd.team_name is null or rd.team_color is null);

create or replace function pit_private.capture_event_identity() returns trigger
language plpgsql set search_path = pg_catalog
as $fn$
declare v_task pit_private.tasks%rowtype;
begin
 select * into v_task from pit_private.tasks where round_id=new.round_id and id=new.task_id;
 new.enabled_at:=v_task.enabled_at;new.owner_id:=v_task.owner_id;new.role:=v_task.role;
 select person->>'nickname' into new.nickname from pit_private.rounds rd,
   lateral jsonb_array_elements(rd.roster) person where rd.id=new.round_id and person->>'id'=v_task.owner_id::text;
 return new;
end
$fn$;
drop trigger if exists pit_event_identity on pit_private.events;
create trigger pit_event_identity before insert on pit_private.events
 for each row execute function pit_private.capture_event_identity();
update pit_private.events e set enabled_at=t.enabled_at,owner_id=t.owner_id,role=t.role,
 nickname=(select person->>'nickname' from pit_private.rounds rd,lateral jsonb_array_elements(rd.roster) person
 where rd.id=e.round_id and person->>'id'=t.owner_id::text limit 1)
 from pit_private.tasks t where t.round_id=e.round_id and t.id=e.task_id and e.role is null;

-- One canonical recorded round payload for player, spectator and replay.
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

create or replace function public.pit_replay(p_round uuid) returns jsonb
language plpgsql security definer set search_path = pg_catalog set row_security = off
as $fn$
declare v_record jsonb;
begin
 select jsonb_build_object('roundId',rd.id,'teamId',r.team_id,'teamName',rd.team_name,'color',rd.team_color,
  'players',rd.roster,'round',pit_private.round_snapshot(rd.id)) into v_record
 from pit_private.results result join pit_private.rounds rd on rd.id=result.round_id
 join pit_private.rooms r on r.id=rd.room_id where rd.id=p_round and rd.status='COMPLETED';
 if v_record is null then raise exception 'Replay is no longer available'; end if;
 return v_record;
end
$fn$;
revoke all on function public.pit_replay(uuid) from public;
grant execute on function public.pit_replay(uuid) to anon,authenticated;

-- Result deletion and every related replay/Just Finished reference disappear in
-- the SAME authorized pit_call transaction. Audit rows and unrelated rounds stay.
create or replace function pit_private.delete_result_replay() returns trigger
language plpgsql set search_path = pg_catalog
as $fn$
declare v_room uuid;
begin
 if exists(select 1 from pit_private.rounds where id=old.round_id and status='COMPLETED') then
  for v_room in select id from pit_private.rooms where current_round_id=old.round_id loop
   update pit_private.members set ready=false where active and room_id=v_room;
   update pit_private.rooms set current_round_id=null,status=case when status='COMPLETED' then 'WAITING' else status end,
    updated_at=pit_private.clock_ms() where id=v_room;
   -- A completed room may have lost its only human jack before the clear.
   -- Reuse V8's minimal assignment repair when it becomes a waiting room.
   if exists(select 1 from pit_private.rooms where id=v_room and status='WAITING') then
    perform pit_private.assign_roles(v_room);
   end if;
  end loop;
  delete from pit_private.events where round_id=old.round_id;
  delete from pit_private.samples where round_id=old.round_id;
  delete from pit_private.requests where round_id=old.round_id;
  delete from pit_private.penalties where round_id=old.round_id;
  delete from pit_private.early_requests where round_id=old.round_id;
  delete from pit_private.tasks where round_id=old.round_id;
  delete from pit_private.rounds where id=old.round_id;
 end if;
 return old;
end
$fn$;
drop trigger if exists pit_result_replay_cleanup on pit_private.results;
create trigger pit_result_replay_cleanup after delete on pit_private.results
 for each row execute function pit_private.delete_result_replay();

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
  insert into pit_private.penalties(round_id,player_id,until_ms,at_ms) values(p_round,p_player,p_now+2000,p_now)
  on conflict(round_id,player_id) do update set until_ms=excluded.until_ms,at_ms=excluded.at_ms;
 elsif v_task.status='AVAILABLE' then
  -- A stale client intent is accepted when the task unlocked before arrival.
  perform pit_private.apply_action(p_round,p_player,p_task,p_now,p_request);
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
    'round',pit_private.round_snapshot(r.current_round_id)
    ) order by r.created_at,r.id) from pit_private.rooms r join pit_private.teams team on team.id=r.team_id where r.status<>'CLOSED'),'[]'::jsonb),
  'replays',coalesce((select jsonb_agg(jsonb_build_object('roundId',rd.id,'teamId',r.team_id,
    'teamName',rd.team_name,'color',rd.team_color,'elapsedMs',result.elapsed_ms,'finishedAt',result.finished_at)
    order by result.finished_at desc,rd.id)
    from pit_private.results result join pit_private.rounds rd on rd.id=result.round_id
    join pit_private.rooms r on r.id=rd.room_id where rd.status='COMPLETED'),'[]'::jsonb),
  'leaderboard',coalesce((select jsonb_agg(entry order by average_ms,best_ms,team_id) from (
    select team.id team_id,avg(s.elapsed_ms) average_ms,min(s.elapsed_ms) best_ms,
      jsonb_build_object('teamId',team.id,'name',team.name,'color',team.color,'averageMs',avg(s.elapsed_ms),'bestMs',min(s.elapsed_ms),
        'rounds',jsonb_agg(jsonb_build_object('id',s.id,'roundId',s.round_id,'teamId',s.team_id,'elapsedMs',s.elapsed_ms,'finishedAt',s.finished_at) order by s.finished_at,s.id)) entry
      from pit_private.results s join pit_private.teams team on team.id=s.team_id group by team.id,team.name,team.color
    ) ranked),'[]'::jsonb)
)
$fn$;

revoke all on all functions in schema pit_private from public,anon,authenticated;
-- Refresh the safe public invalidation row immediately on upgrade, too.
insert into public.pit_public_state(id,state,updated_at)
 values('global',pit_private.public_snapshot(pit_private.clock_ms()),clock_timestamp())
 on conflict(id) do update set state=excluded.state,updated_at=excluded.updated_at;

commit;

-- Admin setup (trusted SQL Editor only; substitute the signed-in admin's UUID):
-- insert into pit_private.admins(user_id) values ('YOUR-AUTH-USER-UUID') on conflict do nothing;


-- V23 fresh-install final role/timing overrides.
-- V23: first Jack then first Gunner, reference mean starts after both human
-- samples. The synchronous opening bot cohorts hold for real human actions.
-- Apply once after 009_v21_confirm_family_roles.sql, on existing projects.
-- Existing teams/results/replays are NOT deleted or redistributed.
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
          when cardinality(v_seen)=1 then
            case when x like '%_GUNNER' then 0 else 1 end
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

create or replace function pit_private.reconcile_round(p_round uuid,p_now numeric) returns void
language plpgsql set search_path = pg_catalog
as $fn$
declare
  v_round pit_private.rounds%rowtype; v_task record; v_next record;
  v_enabled numeric; v_mean numeric; v_humans integer; v_pending integer;
  v_last_human numeric; v_effective numeric; v_reason text;
  v_best_time numeric; v_best_id text; v_best_reason text;
  v_finished numeric; v_room uuid; v_team uuid; v_has_human_gunner boolean; v_first_gunner numeric;
  v_changed boolean:=false; v_iterations integer:=0;
begin
  select * into v_round from pit_private.rounds where id=p_round for update;
  if not found or v_round.status in ('COMPLETED','ABANDONED') or p_now<v_round.go_at then return; end if;
  v_room:=v_round.room_id;
  -- The first Jack is a prerequisite, not the bot reference clock.
  -- Preexisting rounds without a human Gunner retain a legacy fallback to
  -- avoid stranding active teams when the migration is applied.
  select exists(select 1 from pit_private.tasks t where t.round_id=p_round
    and t.cohort='GUN_LOOSEN' and t.owner_id is not null)
    into v_has_human_gunner;
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
        baseline_mean_ms=case when owner_id is null and not (
          cohort='LIFT' or (cohort='GUN_LOOSEN' and v_has_human_gunner)) then v_mean else null end,
        due_at=case when owner_id is null and not (
          cohort='LIFT' or (cohort='GUN_LOOSEN' and v_has_human_gunner)) then v_enabled+v_mean else null end,
        reason=case when owner_id is null and cohort='LIFT' then 'WAIT_FOR_HUMAN_JACK_SYNC'
          when owner_id is null and cohort='GUN_LOOSEN' and v_has_human_gunner then 'WAIT_FOR_HUMAN_GUNNER_SYNC'
          else null end
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
      if v_task.cohort='GUN_LOOSEN' and v_has_human_gunner then
        -- First completed human Gunner drives EVERY parallel bot Gunner.
        -- Never complete bot Gunner from the Jack-only sample.
        select min(completed_at) into v_first_gunner from pit_private.tasks
          where round_id=p_round and cohort='GUN_LOOSEN'
            and owner_id is not null and status='DONE';
        if v_first_gunner is not null then
          v_effective:=greatest(v_task.enabled_at,v_first_gunner);
          v_reason:='OPENING_GUNNER_SYNC';
        else
          v_effective:=null;
        end if;
      elsif v_humans>0 and v_pending=0 then
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

-- Avoid changing any already-completed result or reassigning joined members.
commit;
