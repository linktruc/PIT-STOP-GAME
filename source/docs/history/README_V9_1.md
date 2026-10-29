# Pit Stop. Simulator. — V9.1

Start with [V9_SHORT_DEPLOY_GUIDE.md](V9_SHORT_DEPLOY_GUIDE.md) for the complete Vietnamese upgrade guide and [V9_FIX_REPORT.md](V9_FIX_REPORT.md) for changes, evidence and limits. Existing V8 databases need migration 003 before deploying.

V9.1 adds a small rolling global workflow, V7 connected graph, tiny role strip, server-enforced personal 2s early-tap lockouts, all 15 Solo roles, cyan model selection, support clearance and full-fidelity shared garage previews. Online rules and historical scoring are retained.

Older V8/V7 notes below are preserved background documentation.

# Pit Stop. Simulator. — V8

V8 preserves V7 art and multiplayer rules, stabilizes roles/Ready, adds an additive database upgrade, anchored crew equipment and safe departure, simpler HUD/workflows, temporary local Solo Test, and shared live team previews.

Start with [SHORT_DEPLOY_GUIDE.md](SHORT_DEPLOY_GUIDE.md) (Vietnamese), [V8_FIX_REPORT.md](V8_FIX_REPORT.md) and `supabase/002_v8_stability.sql` for an existing V7 database. Static ZIP deployment alone does not upgrade Supabase.

The V7 implementation notes below remain background documentation; V8 changes and validation are recorded in the V8 report.

# PIT CREW V7 — The 2-Second Challenge

A fictional formula-racing teamwork game for **4–15 human players per team**. V7 rebuilds the presentation around a full-screen, low-poly pit garage with an overlay HUD, while retaining the existing multiplayer rules, adaptive bots, server timing, rooms, hosts, spectators, and leaderboard.

## V7 presentation

- A large, orbitable Three.js garage diorama with original car, crew, tools, lighting, and fictional branding.
- Crew motions tied to each jack, wheel-gun, tire removal, tire fitting, and release task, including simultaneous wheel branches.
- A gold **YOU** marker on your assigned character and matching role/chain highlights.
- A branching Chain display, compact role instructions, Crew drawer, game lobby browser, results, and spectator overview/focus views.
- Synthesized garage ambience and task-specific sounds with a visible mute toggle and volume control.
- One-screen layouts for desktop/projector and compact drawers on mobile. App text is in English.

## Run locally

Use Node.js **22.12+** or a newer supported LTS release, npm, and Python 3 for packaging.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. To test the production build locally:

```sh
npm run preview:local
```

Blank Supabase settings open **Local Practice**. Its simulated teammates run in one browser; they do not connect devices or publish online scores.

## Controls

| Control | Action |
| --- | --- |
| Drag the scene | Rotate the camera |
| Mouse wheel / two-finger pinch | Zoom within the camera limits |
| Reset View | Return to the cinematic starting camera |
| Contextual action button / Space | Perform your available task |
| Chain / Crew | Open progress or player details |
| Fullscreen | Expand the game or spectator presentation |
| Sound toggle + volume slider | Enable/mute audio and set loudness |

Review the role panel before marking Ready. It explains prerequisites, the next action, and what your role unlocks. Audio starts after a browser interaction; check device volume as well as the in-game control.

## Deploy to Netlify

See [NETLIFY_DEPLOY_GUIDE.md](NETLIFY_DEPLOY_GUIDE.md) for the complete setup.

- **Existing installation:** V7 uses the same SQL and runtime fields. Keep your existing Supabase project and public configuration; no database migration is needed.
- **New installation:** create Supabase, enable Anonymous Sign-Ins, and run the complete `SUPABASE_SETUP.sql`.
- Extract **`pit-stop-v7-netlify-ready.zip`**, edit its `config.js`, and upload the extracted folder containing `index.html` to [Netlify Drop](https://app.netlify.com/drop).
- For a Git-based deployment, use `npm run build` and publish `dist`.

Runtime configuration remains:

```js
window.PIT_CONFIG = {
  supabaseUrl: "https://YOUR_PROJECT.supabase.co",
  supabaseAnonKey: "YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY"
};
```

The supplied template has both values blank. Use only a public anon/publishable key. Never add a `service_role` key, database password, or admin credential. Edit `public/config.js` before building, or the extracted build's `config.js` after building; runtime edits need no rebuild.

## Multiplayer rules retained

The host is also a player. Four to fifteen real players must all be Ready before the host starts. Unfilled roles use adaptive bots. Each wheel independently follows **loosen → remove → fit → tighten** after its axle lifts; each jack lowers only when its axle is secure. Release requires all four wheels secure and both jacks down. The server records one final `GREEN_RELEASE − GO` time and averages completed rounds under the persistent team identity.

Watch Live shows teams without taking a seat. Select a team for its 3D focus view or monitor the overview on a projector. Room names, nicknames, roles, progress, and results are public.

Supabase validates commands, roles, readiness, dependencies, host privileges, bot timing, and scores. Realtime invalidations trigger fresh snapshots. Keep a player or spectator page connected during rounds for heartbeat reconciliation. An explicit Leave during a countdown/round abandons that attempt without a score; reconnecting with the same browser identity can restore the current session. Room hosts cannot delete leaderboard results; a separately authenticated, allowlisted global admin can.

## Source, assets, and delivery

| Location | Purpose |
| --- | --- |
| `src/App.tsx`, `src/GamePanels.tsx`, `src/game.css` | Full-screen game states, HUD, lobbies, spectator and admin UI |
| `src/ChainHUD.tsx`, `src/chain.css`, `src/useGame.ts` | Compact DAG, role guidance, synchronized presentation transport |
| `src/PitScene.tsx` | Procedural garage, camera, player marker, task animations |
| `src/audio.ts` | Original synthesized sound and ambience |
| `src/api.ts`, `src/engine.ts`, `src/practice.ts` | Multiplayer transport, game rules, local simulation |
| `SUPABASE_SETUP.sql`, `supabase/` | Unchanged authoritative backend |
| `public/config.js`, `public/fonts/` | Public runtime template and bundled fonts |
| `tests/`, `scripts/` | Automated checks, browser checks, packaging |

React, Three.js, Lucide, and Supabase provide the UI, rendering, icons, and online service client; Vite builds the static site. Geometry, animation, interface artwork, and Web Audio sounds are original. Barlow, Barlow Condensed, and IBM Plex Mono are bundled under SIL OFL. See [ASSET_CREDITS.md](ASSET_CREDITS.md) and `THIRD_PARTY_NOTICES.txt` for licenses. The style reference informed art direction; its image, logos, and branded assets are not included in the game.

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run package
npm run verify:packages
```

Packaging creates **`artifacts/pit-stop-v7-netlify-ready.zip`**, **`artifacts/pit-stop-v7-source.zip`**, copied delivery documents, and `SHA256SUMS.json`. The source archive includes editable frontend, backend, tests, and packaging scripts, and excludes installed dependencies, credentials, and QA output. Read [TEST_REPORT.md](TEST_REPORT.md) for checks actually executed and remaining hosted/device verification.

PIT CREW has no affiliation with Formula 1, its teams, or its drivers.
