-- V21: reaffirm server-side distinct role-family coverage and priority order.
-- Apply AFTER 008_restore_jack_first_priority.sql on EXISTING projects.
-- Only replaces the role-assignment function; does not touch player data,
-- already assigned roles, leaderboards, current rounds or replay history.
-- First entrant must be a JACK to preserve the jack-first starting graph.
-- Players 2-5 fill the four other distinct role families. Positions 6-9
-- fill remaining GUNNER/JACK slots. 10-15 fill available tyre roles.
-- Existing roles and Ready state are preserved except unavoidable repairs.
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


-- Avoid changing live game state on migration. New room joins/replays will
-- use the updated function. No bulk rerolls on currently occupied rooms.
commit;
