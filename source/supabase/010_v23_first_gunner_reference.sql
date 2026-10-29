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

-- Avoid changing any already-completed result or reassigning joined members.
commit;
