# Pit Stop. Simulator. — V8 targeted fix report

V8 retains V7's garage art, orbit camera, procedural audio and authoritative 21-action DAG. Online matches still require 4–15 real authenticated humans, distinct core roles and at least one human jack. Human reaction samples, parallel bot scheduling, server clocks, room-host permissions and private global-admin authorization remain authoritative. Source files are editable; no screenshot substitutes for a live scene.

## Issue matrix

| Issue / root cause | Change and source | Verification |
|---|---|---|
| A. Props followed independent offsets; single arm pivots could not grip/aim. Car departed during release while jacks/crew remained in its path. | `src/PitScene.tsx`: body carry frames, hub transforms, sidewall grips, two-bone arm IK, gun muzzle aimed at each actual hub, jack handle grip transforms; front/rear operators stand behind handles. Old tires travel to discard positions; new tires travel from their fitter to the hub. `src/scene/rig.ts`: independent visual retreat clock. Both jacks move sideways and nearby crew clear the car's corridor before departure. Actual crew/jack clearance also gates car motion. First/reconnected completed snapshots settle without replay. A newly accepted human action settles its queued visual prerequisites first, so an immediate lower cannot leave old wheel-removal animation playing on the lowered car. This catch-up changes presentation receipts only, never server timestamps. | Scene receipt/departure tests; local solo lift/lower/wheel screenshots; four camera inspection angles and sampled departure clearance in browser runner. Numerical debug attributes expose current grip error, lane clearance and departure phase. Not a general physics engine or exhaustive mesh-intersection proof. |
| B/C. Website-like masthead/footer and too many persistent navigation items. | `src/App.tsx`, `src/v8.css`, `index.html`: exact two-line title; compact top controls; no game-owned bottom navigation; viewport safe areas; essential actions above a 90px external overlay. External platform DOM is untouched. | Browser checks at 390×844, 430×932, 1440×900, including simulated external overlay; no document scrolling. |
| D. Role briefing buried the actual job under essays and unlock text. | Compact bold role, one sentence, small state, optional details. No YOU UNLOCK block. | Local browser lobby/action screens. |
| E. Full graph overwhelmed the main view and repeated player names. | `src/ChainHUD.tsx`, `src/chain.css`: persistent personal prerequisite → YOU → successor paths; grouped front/rear 21-step graph in overlay; real dependency/status metadata; no player assignment list; separate generic All Roles reference before/after joining. | SSR test verifies all 21 nodes exactly once and actual personal paths. Engine tests preserve both gunner and jack actions. |
| F. Leave was buried and Menu confused membership. | Visible Leave crew at top; waiting leave in one tap; running/countdown abandonment confirmation; Menu retains seat. Finished results are retained. | Local solo leave and backend leave/abandon permission tests. |
| G. `assign_roles` randomized all seats/reset Ready; 90s cleanup removed suspended mobile users; global 250ms polling caused excessive serialized RPC load. | `SUPABASE_SETUP.sql`, `supabase/001_pit_crew.sql`, additive `002_v8_stability.sql`: preserve incumbent valid roles and Ready; fill unused slots; reassign only one seat if last human jack leaves, with role notice/Ready reset only on that seat. 45s disconnected indicator, 15min configurable waiting grace. `src/useGame.ts`, `src/syncPolicy.ts`: coalesced realtime, recursive fallback, leader bot/countdown wakeups, jittered exponential error backoff, foreground recovery, session refresh, out-of-order protection, missing-membership confirmation and stable action retry tokens. | V7-schema upgrade applied twice with existing crew, identity and historical result preserved; stable join/leave Ready, minimal jack replacement, two-minute return; fake-timer realtime burst/backoff tests; existing PostgreSQL fairness/idempotency suite. |
| H. Administration/public standings were unclear. | Leaderboard remains publicly readable. Real Supabase email/password sign-in requires private `pit_private.admins` allowlist; non-allowlisted account is rejected/signed out. No privileged shortcut or bundled admin password. Guide includes trusted owner SQL. | Existing SQL tests deny unauthorized deletions, enforce allowlist and audit authorized deletion. No live Auth account was provisioned or tested. |
| I. No isolated one-person diagnostic mode. | `src/solo.ts`, `src/api.ts`: temporary Solo Test, one human + 14 bots, uses existing engine locally; explicit NOT RANKED; no online mutation/result submission. Disable through `enableSoloTest:false` in public config. It is in-memory and ends on page reload. | Automated full completion, no leaderboard result, feature flag rejection; local browser end-to-end. Online minimum remains unchanged. |
| J. Models could not identify teammates. | Crew hit boxes, camera raycast with car/jack occlusion, 7px/500ms tap discrimination, lightweight name/role tooltip near selected figure, empty-space close; own YOU figure is excluded. | Pure tap/drag/long-press tests and local browser model/empty-space checks. |
| K. Notices stayed indefinitely. | `src/useTimedNotice.ts`: information 12s, errors 15s; timer cancellation on replacement/unmount; manual dismissal retained. | Fake-timer boundary checks. |
| L. Observer cards had only text/segments. | `src/TeamPreviews.tsx`: one shared offscreen 3D renderer across active cards, low-poly live state, at most four visible cards per 250ms tick, IntersectionObserver/background suspension and live 2D fallback. Waiting/finished cards allocate no preview. Main garage render pauses behind overview; focus restores interactive scene. | Active-filter test; local synthetic rooms show two genuine 3D previews and no waiting preview. Renderer class owns one context per overview, not per team. |

## Validation and evidence

Final automated suite: **103 tests across 8 files**. Typecheck, lint and production build passed using a clean `npm ci` dependency installation. Package verification results are recorded in `docs/v8-evidence/validation.txt`.

- `npm ci` completed in a clean dependency directory using the shipped package and lockfile. Final typecheck/lint/tests/build use those installed dependencies.
- Automated suite includes existing PostgreSQL/engine/API/practice/audio/animation tests plus V8 migration, stability, scheduling, notices, Solo Test, workflow, tap discrimination and safe-departure tests.
- `scripts/v8_browser_smoke.py` runs real Chromium with software WebGL against local Vite. It uses local engine simulation and explicitly synthetic spectator fixtures, not connected remote teams.
- A separate production-static smoke on port 4181 with WebGL disabled verified the fallback, YOU marker, Solo Ready/Start and available action at 390×844, with no runtime errors.
- Browser evidence and machine-readable results are in `docs/v8-evidence/` in the source delivery. Screenshots are acceptance evidence only; the deployed game renders live geometry.
- Source and Netlify ZIPs are checked by `scripts/verify_packages.py`: archive integrity and root layout, runtime config order, bundled assets/fonts/licenses, complete source/migrations, matching setup SQL, excluded credentials/dependencies, SHA-256 manifests.
- V7 `TEST_REPORT.md` and the longer deployment/design documents are retained as historical baseline documentation. This report and `SHORT_DEPLOY_GUIDE.md` describe V8 changes.

## Deployment

Existing V7 database: owner runs `supabase/002_v8_stability.sql` in Supabase SQL Editor before deploying the V8 frontend. New database: use complete `SUPABASE_SETUP.sql` instead. Static ZIP upload does not execute database migrations. The additive upgrade changes functions/defaults and adds owner-only settings; it does not delete rooms, rounds, scores or historical results.

No external database or Netlify production deployment was performed. Public runtime configuration is intentionally blank, so the packaged app defaults to clearly marked browser-only practice until configured. See the short Vietnamese deploy guide for exact steps.

## Limits and remaining real-device checks

No production Supabase credentials or physical phones were supplied. Hosted Realtime/Auth session refresh, multiple real devices, Safari background suspension, project-specific rate limits, network partitions and actual speakers remain unverified. Web Audio checks verify resumed/nonzero output and unit-level gain/mute behavior, not perceptual loudness on a phone.

The scene uses deterministic hand/prop IK and staged clearance rather than a physics engine. Software Chromium screenshots/sample checks do not establish zero intersection for every triangle at every camera angle or every accessibility setting. Inspect the included angles and perform the real-device sequence below before an event. Shared card previews intentionally use a simplified scene and are throttled; with many visible teams, each card updates less often.

Presence becomes disconnected after 45s but a waiting seat persists up to 15min, unless explicitly removed by its host. Returning after that grace can require joining again. A participant leaving an active round abandons it; this preserves the original scoring rules. Poll fallback is approximately 12–14s in lobbies, 2.5–2.9s for running nonleaders, 1.8–2.1s for public active observers, and timed wakeups for the active leader. Network failures back off with jitter, capped at approximately 69s; hidden tabs use 60s fallback. Realtime invalidations are coalesced over 180ms.

## Reproducible hosted acceptance

1. Apply upgrade, configure public keys, deploy; open two phones plus two additional independent browser sessions.
2. Ready two players, join another, remove a non-jack; check incumbent roles and Ready remain unchanged.
3. Remove the only human jack; verify exactly one survivor gets a jack notice and Ready reset.
4. Background two phones for over two minutes; return, confirm same seats/roles/Ready, then Ready all and start.
5. Complete both jack actions and both gunner actions where assigned; inspect all four tire grips and both gun tips while orbiting. Observe operator/tool withdrawal before the car moves.
6. Run a second team concurrently; public Watch Live must show both active previews. Focus/orbit each; waiting/finished cards remain compact.
7. Confirm public leaderboard access; nonadmin deletion fails, allowlisted real admin deletion succeeds and leaves an audit entry.
8. Try Solo Test, finish it, leave; verify online results unchanged. Disable the flag and redeploy; entry disappears and the local Solo API rejects entry.
