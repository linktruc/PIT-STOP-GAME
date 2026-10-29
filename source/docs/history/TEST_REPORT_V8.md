# PIT CREW V7 — Test report

Executed on 18 October 2026 in Linux with Node.js 24.19.0, npm 11.9.0, Vitest 3.2.7, PostgreSQL/PGlite 0.3.16 and Chromium using software WebGL.

## Checks actually executed

| Check | Result | Scope |
| --- | --- | --- |
| Automated suite | PASS | `npm test`: **89 tests across six files**. |
| Existing gameplay engine | PASS | 46 tests; role assignment, causal DAG, bot timing, score and idempotency. |
| Actual PostgreSQL backend | PASS | 26 tests execute production SQL with stubbed Supabase identities and client roles. |
| Existing API boundaries | PASS | Five tests: spectator identity, action auth, admin switching guards, timeouts and public configuration. |
| Existing practice adapter | PASS | Two tests: explicit simulation, full round, persistent team/replay and actual elapsed score. |
| New audio implementation | PASS | Six tests: gesture initialization, volume, mute/source cleanup, task sound routing, cue synthesis and browser failure. |
| New animation timeline | PASS | Four tests: initial snapshot settling, parallel causal timelines, duplicate receipts and round resets without mutating game state. |
| TypeScript | PASS | `npm run typecheck`; `npm run build` also runs `tsc -b`. |
| ESLint | PASS | `npm run lint`, zero warnings permitted. |
| Production build | PASS | Vite emits prebuilt static `dist/` with runtime config, local scripts/styles/fonts, redirects and headers. |
| Core preservation | PASS | Engine, API, practice adapter, types, SQL setup/migration, config and Netlify headers/redirects are byte-identical to the previous release. |
| English UI scan | PASS | No Vietnamese-specific diacritics found in UI source; English UI also inspected during browser QA. |
| V7 package and clean source rebuild | PASS | `npm run package` / `npm run verify:packages` verified archive roots, local resources, complete source, exclusions, ZIP integrity and SHA-256. Extracted the actual source ZIP to `/tmp/pit-v7-source-check`; clean lockfile `npm ci` and production build both passed. |
| Final production browser acceptance | PASS | 14 checks completed against prebuilt `dist/` at port 4178, plus final output-headroom/navigation follow-up. Zero page JavaScript errors or external asset requests. |

## Gameplay and backend coverage

The executed tests verify:

- Multiple independent rooms and safe global snapshots; creator membership; duplicate nicknames with distinct opaque player IDs; one seat per Auth identity; reconnect without duplicate seats.
- Host/member/outsider/spectator permissions, cross-room attempts, protected private tables/helpers, no exposed Auth IDs, host-only kicks/starts, kicked-player rejection, waiting host transfer and stale waiting-member removal.
- Start rejection for three players, a deliberately injected invalid sixteen-member roster, and unready players; capacity rejects the sixteenth join. Competing join requests are queued on one embedded database connection, rather than a real cross-connection concurrency stress test.
- Exactly fifteen core roles and twenty-one tasks; unique human roles for every size 4–15; at least one human jack; ambient roles excluded; independent wheel prerequisites and two-step gunner/jack ownership.
- Opening bot jack completion at the human jack's **exact timestamp**; independent human jacks; three human wheel-on completions at +150/+200/+250 ms cap an eligible bot at +250 ms while preserving its original baseline schedule.
- Bot deadlines before slower humans; baseline delays for all-bot cohorts; late eligibility without broken prerequisites; mixed lower caps; ordinary singleton release; effective chronological reconstruction; no future-human sample leakage, including equal-timestamp ordering.
- Wrong-role, early, duplicate, reused-token and stale actions; nonnegative bounded human samples; idempotent reconciliation; every completed task respects eligibility and predecessors; each accepted event appears once.
- Score equals release minus GO and is recorded once; incomplete/abandoned rounds excluded; replay keeps team identity; two actual SQL rounds of 2114 and 4228 ms yield a 3171 ms arithmetic mean.
- Global admin authorization, literal deletion confirmation, per-result/team/full-board scope and audit records. Ordinary room hosts cannot delete results.
- Forged client timestamps and identity fields cannot change authoritative action times or ownership.

## V7 browser verification scope

`scripts/browser_smoke.py` exercises the actual V7 game shell in Chromium, with local practice and an explicitly synthetic second observer team. It checks a dominant full-viewport canvas, no document scrolling, room creation and readiness gate, gold YOU marker, camera drag, all 21 chain nodes, contextual lift/lower, simultaneous animations, frozen score, standings, observer overview/focus, replay and recovery, compact desktop and mobile layouts.

A Web Audio analyser observes the final mixed output and verifies nonzero rendered audio samples, multiple synthesized sources, resumed playback, mute/unmute and volume changes. This establishes generated browser audio, not loudness through physical speakers. Scene data attributes observe actual camera, animation and axle transforms.

The fixture is test-only browser storage. It never contacts Supabase and does not prove hosted multiplayer delivery. HIGH-quality screenshots document the art direction; ECO mode reduces software-rendering cost for repeated interaction checks. The final results are recorded in `docs/VERIFICATION_RESULTS.md` and `docs/browser-acceptance.json`. Raw reports and screenshots are generated under `qa-output/`. The focused follow-up passed against the final `index-CsEj5qDb.js` build: direct-hash navigation closes the overlay, the mobile lobby is unobscured, and final mixed audio at full volume produces nonzero output below clipping; all six audio tests, ESLint and production build passed again after those fixes.

## External verification not performed

No new Supabase or Netlify deployment was performed. V7 retains the compatible backend and public config fields. The following remain NOT EXECUTED:

- Live hosted Supabase Auth/Realtime delivery and four physical player devices.
- Actual simultaneous teams over the network, real multi-client reconnect/out-of-order delivery or browser background throttling.
- Cross-connection PostgreSQL locking stress, public deployment/load/abuse testing.
- Physical iOS Safari, Android Chrome, target GPU/speakers and a 4K projector.

Supabase SQL tests run against actual local PostgreSQL functions with stubbed identity, while browser tests use simulation. Follow the deployment guide for real classroom acceptance.

## Operational boundaries

The backend remains authoritative. Animation and audio are presentation only; neither modifies bot schedules, task eligibility or score. Short cosmetic wheel handling may finish after its logical server event. The current player's accepted action receives immediate visual acknowledgement. Completed initial/reconnect snapshots settle instead of replaying the whole round.

Any connected player or spectator can request heartbeat reconciliation. There is no separately provisioned always-on worker. Late bot events use stored effective deadlines; network travel still affects human server receipt time. Waiting members use the existing 90-second lease. Active-round membership is retained for reconnect; explicit Leave abandons an active round. Human actions beyond 120 seconds after eligibility are rejected without clamping or scoring.
