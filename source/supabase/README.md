# Authoritative backend — V13

V11.3 reuses the V10.3 SQL schema/functions. From V10.3/V10.4, no new database migration is required. Keep existing Auth users/aliases, admin allowlist, scores/replays and configured timeouts. A frontend deployment cannot run SQL.

| Existing project | Apply in the trusted SQL Editor before V11.3 frontend |
| --- | --- |
| V10.3 / V10.4 | No new SQL |
| V9 / V9.1 | `004_v10_recorded_replays.sql` |
| V8 | `003_v9_early_tap_penalty.sql`, then 004 |
| V7 | `002_v8_stability.sql`, then 003, then 004 |
| Fresh | Current root `SUPABASE_SETUP.sql` only |

`SUPABASE_SETUP.sql` and `001_pit_crew.sql` are byte-identical complete fresh setup scripts; use either once. Additive upgrades retain existing data/configuration. Never apply a historical setup after a newer migration. The complete Vietnamese update guide is [V11_3_DEPLOY_GUIDE.md](../V11_3_DEPLOY_GUIDE.md).

## Configuration and real admin

Enable Anonymous Sign-Ins for players. Configure the project URL and **public** publishable/anon key in runtime `config.js`, and the Netlify origin in Auth Site URL/Redirect URLs. Verify `public.pit_public_state` is in `supabase_realtime`; never publish private tables. No secret key, database password or admin password belongs in static files.

Reuse the existing confirmed Auth user, UUID, username alias and actual password. The frontend submits existing credentials to Supabase without a length gate and does not reset them. A strong private password is recommended as account hygiene. If setup is missing, create/confirm the Auth user, allowlist its UUID in `pit_private.admins` and point `pit_private.admin_aliases` to the same UUID. [V11_ADMIN_SETUP.md](../V11_ADMIN_SETUP.md) gives exact setup/check steps. An alias grants no privilege by itself; every destructive command checks the server allowlist and records an audit row. Hosts have no implicit global admin privileges. Public leaderboard/replay viewing does not require an admin session.

## State, events and recorded rounds

`public.pit_state()` returns safe rooms, leaderboard, replay summaries, server time and the caller identity. `public.pit_call(...)` validates commands and returns a refreshed snapshot. Global realtime invalidations use one read-only public row; clients coalesce refetches. Private locks, Auth UUIDs and secrets are not published.

Migration 004 preserves completed-round roster/team metadata, actual unlock/completion ownership and public `pit_replay(uuid)` reads for retained completed results. New rounds freeze names/roles at creation. Old rounds retain real saved timing; unavailable historical ownership is not fabricated. Step Time is completion minus unlock; Team Time is completion minus GO. Parallel events can share Team Time. Official score is release minus GO, never a sum of steps.

Authorized deletion removes related result/round/tasks/events/samples/requests/penalties together, clears replay/Just Finished/Event Log references and refreshes public state. A current completed room referencing the deleted round returns to WAITING with Ready cleared. Unrelated teams and audit history remain.

## Timing and membership

Online bot deadlines use the valid human reaction mean at the task's eligibility time, with the existing human-jack synchronization and parallel-cohort cap. Reconciliation reconstructs due events at effective timestamps; transport latency does not add a new reaction delay. Task display/animation cannot modify the server result. Scoped bootstrap for non-jack Solo roles is a local prerequisite accommodation, not an online scoring change.

Defaults remain **45 seconds** without heartbeat to show disconnected and **15 minutes** of lobby-seat grace from the last heartbeat. Existing settings are preserved. Stable roles/Ready remain, with only the necessary repair when the last human jack leaves. Returning to menu retains the seat; explicit Leave during countdown/play abandons the round. Reconnect downloads current authority and cannot invent a missing human input.

Private normalized tables retain RLS, no client table grants and owner-only helpers. Public RPCs retain fixed search paths, fully qualified relations, transactional ownership/membership/host/dependency checks and idempotency. Deterministic SQL tests invoke internal timing helpers only through the owner test harness; they are not public client APIs. The global consistency lock suits classroom-sized play. Hosted Auth/Realtime, abuse controls and larger-scale load checks remain deployment responsibilities.

## V12 rule-order update — apply only to existing projects

To change the 21-step game graph from **lift → loosen → remove → fit → tighten → lower → release** to **loosen → lift → remove → fit → lower → tighten → release**, run `005_nuts_before_lift_lower_before_tighten.sql` in the trusted Supabase SQL Editor AFTER migration 004. It changes only future rounds; historical and in-progress rounds keep their previously saved dependencies. A waiting room with no human wheel gunner has one affected role reassigned with a Ready reset. New ranked rooms require at least one real opening gunner. Fresh projects can use the root `SUPABASE_SETUP.sql` instead. See `V12_GAMEPLAY_ORDER.md`.

## V12 and V13 upgrades

For a deployed project that has already applied migrations 001–004, apply **005_nuts_before_lift_lower_before_tighten.sql** to change the new-round work sequence, then **006_immediate_countdown_lockout.sql** for the countdown penalty. Migration 006 makes the 2-second lockout start at the tap's server-observed time rather than at GO. Neither migration deletes leaderboard/replay history.

For a fresh project, `SUPABASE_SETUP.sql` is the current baseline (includes immediate penalty timing); apply the additional work-order migration 005 as directed in V12 documentation. Do not rerun fresh setup on a production database.

## V14 role-family allocation (current)

Run `007_role_family_priority.sql` AFTER migration 006 on an existing project. In newly created rooms: person 1 is a Gunner; persons 2–5 fill the remaining distinct families (Jack, old-wheel remover, new-wheel fitter, Release) in random order; persons 6–9 fill the remaining Gunner/Jack positions (random); persons 10–15 fill remaining wheel-on/off slots (random). Each person still receives one UNIQUE corner-specific role; joining/leaving never rerolls unaffected members, and Ready is preserved for unaffected people. Legacy waiting rooms retain valid assignments; they are not forcibly redistributed. Bot-operated jobs and actual gameplay sequence are unchanged.

Fresh installs use current `SUPABASE_SETUP.sql`, or the current `001_pit_crew.sql` baseline followed by applicable migrations in ascending order; the latest 007 procedure should win. SQL migration does not run when only the Netlify frontend is redeployed.

## V23 opening Gunner timing (migration 010)

After `009_v21_confirm_family_roles.sql`, apply `010_v23_first_gunner_reference.sql` once
for the online Jack-first/Gunner-second rule and first-real-Gunner synchronization.
The Jack-only timing sample no longer schedules bot Gunners; bot Gunners follow
the first completed human Gunner. Subsequent bot deadlines are the mean of all
completed human reactions at task eligibility. Existing scores and roles are
not cleared. Fresh installs use the updated root `SUPABASE_SETUP.sql`.
See `V23_GUNNER_REFERENCE_AND_FRONT_JACK.md` for diagrams and deployment notes.
