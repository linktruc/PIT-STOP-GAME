-- V10.3 upgrade: run AFTER 003_v9_early_tap_penalty.sql on an existing project.
-- Additive and idempotent. No live result is removed by applying this migration.
-- Old rounds retain the exact recorded task times; old roster names can only be
-- recovered from retained memberships. New round-start identity is immutable.
begin;
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
  order by case t.cohort when 'LIFT' then 1 when 'GUN_LOOSEN' then 2 when 'WHEEL_OFF' then 3
   when 'WHEEL_ON' then 4 when 'GUN_TIGHTEN' then 5 when 'LOWER' then 6 else 7 end,t.id)
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
  insert into pit_private.penalties(round_id,player_id,until_ms,at_ms) values(p_round,p_player,greatest(v_round.go_at,p_now)+2000,p_now)
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
