-- V14: First five members span 5 distinct playable role families.
-- Then fill remaining Gunner/Jack slots before filling unused old/new wheel slots.
-- Deploy AFTER 006_immediate_countdown_lockout.sql for existing projects.
-- Preserves all existing unique roles, member Ready states, live rounds, scores and replays.
-- Does NOT add bot members to lobby seats; only humans occupy 1–15.
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
  -- Legacy waiting lobbies created before this migration may have no gunner.
  -- Repair only one role, preserving the other members' roles and Ready state.
  if v_n>0 and not exists(select 1 from unnest(v_seen) x where x like '%_GUNNER') then
    select id into v_player from pit_private.members where room_id=p_room and active order by joined_at,id limit 1;
    select x into v_role from unnest(v_roles) x where x like '%_GUNNER' order by random() limit 1;
    update pit_private.members set role=v_role,ready=false,
      role_notice='An opening wheel gunner is required. You are now a gunner. Mark Ready again.'
      where id=v_player.id;
  end if;
end
$fn$;

commit;
