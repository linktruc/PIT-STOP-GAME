# V11.3 architecture

V11.3 continues the V10.3 React/Three.js/Supabase application. The presentation can interpolate authoritative state, but cannot set task eligibility, bot completion timestamps, ownership, penalties or official scores. Earlier architecture notes are retained in `docs/history/ARCHITECTURE_V10_3.md`.

## Rules and time

`src/engine.ts` is the deterministic TypeScript reference engine used by Solo/practice and fixtures. PostgreSQL `pit_private.reconcile_round` remains the online authority. The 21-task DAG includes concurrent wheel branches; human samples measure actual unlock-to-click response. A newly eligible bot snapshots the valid human arithmetic mean at eligibility, then keeps its scheduled deadline. Opening-jack synchronization and the parallel-human cohort cap can finish a bot earlier. Solo roles with no initial human prerequisite sample have an explicitly scoped bootstrap; future eligible tasks use real samples as soon as causally available.

`src/solo.ts` has an unranked in-memory round and role picker. `src/practice.ts` is browser-only rehearsal. Neither owns online administration privileges. Official score is GREEN_RELEASE minus GO. Animation tails, task durations summed together, and arrival before GO are excluded.

## Transport and administration

`src/api.ts` handles configured Supabase Auth, username-to-email alias resolution, server snapshots, commands and replay reads. Existing passwords are passed to Auth without an arbitrary frontend minimum. Admin identity is accepted only after the server verifies `pit_private.admins`. Missing backend access yields a backend-required state. `src/useGame.ts` serializes commands, estimates server-relative time, coalesces realtime invalidations and recovers full snapshots. A separate global snapshot persists while Solo/practice snapshots are marked client-local. Global Auth/delete revisions and monotonic serverNow checks discard stale reads and queue a fresh refresh. During Solo, global fallback polling is 2.5 seconds while watching, 15 seconds idle and 60 seconds hidden; realtime refreshes coalesce at one second with one request in flight.

Returning to the main menu retains an online membership. A user must explicitly Leave Team before an Auth identity transition, either separately or through the form's acknowledged **Leave Team & sign in** transition; the API must not silently reassign a seat. Solo does not require a new online player identity. Every online destructive RPC rechecks authorization, requires confirmation and records an audit row. Related result/replay/finished/event data is removed together.

Fresh setup is root `SUPABASE_SETUP.sql`, byte-identical to `supabase/001_pit_crew.sql`. Additive migrations 002/003/004 are for the corresponding older schemas; use the deployment guide's sequence. Uploading Netlify cannot migrate a database.

## Shared scene and deterministic playback

`src/scene/garage.ts` creates the full procedural scene used by the main player, focused spectator, replay and desktop previews. `src/PitScene.tsx` owns the main React host. `src/TeamPreviews.tsx` shares a bounded preview renderer and excludes heavyweight previews from the mobile overview.

`src/scene/environment.ts` describes the pit lane and arrival path. Arrival seeks from server-relative GO/replay time and does not unlock tasks. `src/scene/crew.ts` defines playable/support staging and body/contact envelopes. The existing procedural rig supplies localized support contact and gunner kneeling corrections; wheel-carrier choreography remains the baseline.

`src/scene/animation.ts` separates logical task timestamps from physical-action presentation. Waiting for a delayed bot must remain visibly waiting until the appropriate event time. Playback and reconnect settle/seek from recorded data, without replaying a long queue of stale cosmetic receipts. Short visual work poses never change official completion time. Player gold YOU and cyan inspection remain separate.

## Workflow and responsive HUD

`src/workflow.ts` derives truthful task/owner/dependency state. `src/ChainHUD.tsx` presents a width-aware horizontal mobile milestone summary, a vertical desktop workflow at the left edge and the full 21-node DAG. Total completion interpolation is a monotonic count/21 instrument, not a claim that concurrent DAG tasks are serial. Bursts coalesce to one display target; the displayed frontier does not queue one transition per event. Gold ownership remains attached to actual assigned tasks, wherever they appear.

At widths of 1100px and above, `src/v11-desktop.css` places `.scene-instruments` in a 252–304px left column. Workflow capacity follows its measured height, and `src/DesktopLiveLog.tsx` sits below it. Narrower screens keep the 62px horizontal summary. The desktop log uses the existing `replayEvents` and `eventSeconds` data/formatting helpers, not a separately timed event list.

Mobile constraints reserve safe areas and a protected platform-badge zone, then place the compact role/action stack at the lowest usable position with a 10px clearance. With `PIT_CONFIG.hudHostingBadge: "netlify"`, the unreadable-overlay fallback allows a 48px badge and the larger of its 28px edge offset or the safe area. Detectable badge bounds replace that fallback so the dock can move lower when safe. Use `"none"` only on hosting with no external badge. The app never removes or modifies the third-party overlay. `src/useHudClearance.ts` reads visible badge bounds and listens to layout, orientation and visual-viewport resize/scroll changes; an optional `PIT_CONFIG.hudOverlaySelector` supports a custom hosting wrapper. Coarse-pointer landscape devices with short viewports retain mobile protection. Desktop information stays in the left workflow/log column, with gameplay controls on the right and the scene in the center. The main gameplay document does not scroll; optional lists/drawers may scroll internally.

`src/ReplayEventLog.tsx` renders Task / By / Step Time / Team Time from real events. The desktop dock reuses that event data and formatting; it is not a second event authority. Rows update on authoritative snapshots, with recent entries first and bounded internal scrolling. The overview opens each card's log directly, independently from Watch/Focus or Replay. A completed recording remains tied to the retained result and is invalidated with its deletion.

## Assets and validation

Fonts are self-hosted; procedural assets need no image/model hotlinks. `src/audio.ts` uses original synthesized effects and gesture-resumed Web Audio. `tests/` covers reference-engine and actual SQL/RPC rules; browser scripts exercise rendered components and scenes. `TEST_REPORT.md` records executed scope and `V11_FIX_REPORT.md` maps root causes, changed files and limitations. Test fixtures and software WebGL are not proof of hosted multi-device or physical Safari behavior.
