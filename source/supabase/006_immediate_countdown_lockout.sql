-- V13: An early tap always locks for exactly 2 seconds from the server-observed press.
-- Apply AFTER 005; additive CREATE OR REPLACE only. No historic results or replay data are altered.
-- Re-running is safe. The server still validates ownership, requests and current action status.

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
