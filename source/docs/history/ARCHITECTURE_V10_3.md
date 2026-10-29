# V9.1 implementation additions

- `src/scene/garage.ts`: one full-world factory for the player and preview pool; independent receipts per instance.
- `src/scene/crew.ts`: shared 22-actor placement and support envelope.
- `src/workflow.ts`: deterministic rolling DAG viewport; real statuses, stable frontier.
- `src/ActionControl.tsx`: early-tappable HOLD, local penalty display, standard action path.
- `supabase/003_v9_early_tap_penalty.sql`: private personal locks/idempotency and admin alias mapping.
- `createSoloRound`: explicit local seed; production creation rules remain unchanged.

The earlier architecture notes follow as background.

# V7 architecture

V7 replaces the presentation layer. The authoritative game, Supabase schema/RPCs, public runtime configuration, player identities and scoring remain compatible with the previous release.

## Presentation boundaries

- `src/App.tsx`: single-screen game states, role/action HUD, audio event delivery, observer overview/focus, menus and drawers.
- `src/GamePanels.tsx`: room entry, roster, standings, administration, instructions and accessible overlay focus management.
- `src/useGame.ts`: serialized requests, global subscriptions, full-state recovery, member presence and midpoint server-clock estimation. It calls the existing API and never chooses action timestamps.
- `src/ChainHUD.tsx`, `src/chain.css`: all 21 DAG tasks, causal connectors, ownership, gold player nodes and expanded dependency details. Selecting a node only inspects it.
- `src/PitScene.tsx`: original procedural Three.js garage, 22 articulated crew, car, OrbitControls, projected gold YOU marker and quality/fallback rendering.
- `src/scene/animation.ts`: receipt-driven cosmetic timelines, parallel events and reconnect poses. Animation duration never changes gameplay availability, bot deadlines or score.
- `src/audio.ts`: original synthesized mechanical effects and a separate quiet ambience bus, compressor, gesture resume, mute and shared volume.
- `src/styles.css`, `src/game.css`: self-hosted fonts and fixed-viewport HUD layout. Large lists scroll inside overlays; the document itself does not scroll.

## Preserved systems

`src/engine.ts` remains the deterministic reference engine. `src/practice.ts` remains the explicitly labelled browser-only rehearsal. `src/api.ts` retains Supabase anonymous player authentication, public spectator reads, protected commands, snapshots, Realtime invalidation and identity-switch guards.

`SUPABASE_SETUP.sql` and `supabase/001_pit_crew.sql` are unchanged. Do not run a new migration merely to install the visual update. Preserve your existing deployed public `config.js` when replacing the static frontend.

All official times and action ownership come from transactional PostgreSQL RPCs. A receipt may arrive after its effective server event timestamp; cosmetic animation and sound cannot revise that event. A spectator consumes no player seat.

## Rendering and sound

The Three.js canvas fills the game shell. HUD panels intercept pointer events only over their controls; uncovered canvas remains draggable. Arrow keys rotate a focused camera, Home/R resets it, and the visible Reset view button dispatches `pit-camera-reset`.

Initial completed snapshots settle at their current pose instead of replaying the whole round. Fresh accepted actions animate the correct role. Own-character acknowledgement is immediate, while dependent wheel handling remains visually ordered. Reduced motion keeps task feedback concise. WebGL failure falls back to a live SVG map, retaining task controls and the gold YOU marker.

Audio starts after a pointer or keyboard gesture unless the user explicitly muted it. Background/suspended contexts can resume on the next gesture. Mute stops active sources and ambience; one saved volume applies to all sound. Old reconnect events are quiet rather than replaying a burst of stale sounds.

## Verification

`npm test` runs the preserved gameplay/security suites plus audio and animation tests. `scripts/browser_smoke.py` checks the actual browser scene, camera, marker, task transitions, audio output, observers, overlays and viewport bounds. See `TEST_REPORT.md` for executed results and external service limitations.
