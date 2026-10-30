# V24.12: camera input, Watch Live, highlights and offline expiry

First-person and third-person pointer drag now reverse both axes. Mouse and touch share the same input conversion; keyboard turning and pinch/wheel zoom retain their behavior.

Watch Live thumbnails previously rendered on a 250 ms interval, at most two rooms per tick. They now share one WebGL context and a display-synchronized scheduler targeting 30 FPS per card for one/two visible rooms, 20 for three/four, and 12 for larger lists, subject to device capacity. At most two rooms render per animation frame. Resolution adapts gradually to measured rendering cost. Invisible views are evicted before visible ones so large lists cannot continuously reconstruct a visible room. Hidden pages stop drawing; mobile overview continues to omit thumbnail GPU contexts. Focused Watch Live retains the full scene.

The v11.4 red lockout floor ring/glow and above-head countdown are restored using the current immediate penalty timestamps. Ring materials are independent per actor, so one penalty cannot color another character. A separate blue floor ring identifies human roles only in WAITING; it disappears at COUNTDOWN. The existing gold YOU marker remains. Gray support characters keep their suit colors and receive no human ring. The 2D fallback reflects the same states.

## Apply the backend change

Upload the new Netlify build, and run [`../supabase/V24_12_OFFLINE_CLEANUP.sql`](../supabase/V24_12_OFFLINE_CLEANUP.sql) in the existing project's Supabase SQL Editor as project owner. This migration is safe to rerun and immediately clears existing stale rooms. ZIP deployment alone cannot update PostgreSQL functions or install the scheduled cleanup.

Offline means no successful room heartbeat for 300,000 ms. All room phases use the same timeout. Public RPCs expire memberships before accepting a heartbeat, preventing a stale returning client from reviving its seat. The existing departure rules transfer host to a remaining active member, close an empty room, and abandon/reset an interrupted round. Saved results and replay records remain. Expiry removes room membership rather than signing out the user's Supabase identity.

The owner-only `cleanup_presence()` function also refreshes the public snapshot. The migration registers the named `pit-offline-cleanup` pg_cron job once per minute, using the same transaction lock as gameplay. Thus expiry is checked at the five-minute boundary on requests; an unattended room is cleaned on the next minute tick (five to six minutes after its last heartbeat). No browser needs to remain open. If pg_cron is unavailable, SQL emits a notice; enable [Supabase Cron](https://supabase.com/docs/guides/cron/install) for unattended cleanup. Clients cannot execute either private cleanup helper or supply its timestamp.

## Validation

40 selected tests pass, covering camera axes, fair cadence at 60/144 Hz, per-player highlights, exact expiry boundary, stale-heartbeat rejection, host transfer, empty-room cleanup, interrupted-round reset, repeated migration and preservation of saved results. Existing Solo Jack/Gunner timing, multiplayer first-Gunner synchronization and five backend access/roster checks pass. The migration was additionally applied twice to the actual V24.11 schema, successfully closing a stale room. TypeScript and ESLint checks pass.

Browser QA uses real mouse and touch events in both camera modes, real WebGL highlight captures, and shared-context Watch Live rendering. Evidence is in `v24-12-evidence/`; the two cards measured 10.9 and 10.6 FPS using Edge's SwiftShader software GPU, with zero page errors. Actual FPS depends on the device. These controlled local fixtures do not join an online room or verify live Supabase deployment.

Run the dev server and `node scripts/v24-12-browser-qa.mjs` with Playwright/Edge installed. Build with `npm run build`; package with `python scripts/package_v24_12.py`.
