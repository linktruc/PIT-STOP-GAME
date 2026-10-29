# V24.4 - Live action sound follows the rendered animation

## Cause
Live App audio was driven by newly received authoritative DONE tasks, while the physical animation timeline can defer an action until preceding work and old-wheel carry clear the space. A fast click therefore played the operation sound immediately even when that animation was still queued. Replay already used the visual receipt start and did not have this mismatch.

## Fix
- Remove physical task sounds and the generic completion chirp from the snapshot-DONE effect.
- The live scene consumes the same TaskAnimationTimeline receipts it draws. Once renderer.render succeeds, it emits each newly visible receipt start at most once.
- Scheduled Solo bot work sounds when the scheduled work is actually shown, without waiting for the later DONE polling acknowledgement.
- Duplicate snapshots do not repeat effects. Reconnecting/focusing/rebuilding a scene settles old starts quietly. Hidden/inactive/disposed scenes do not run audio timers; expired work is consumed without a catch-up burst.
- Muting remains handled by the existing audio module; a cue consumed while muted is not replayed on unmute. UI clicks, accepted-input confirmation, availability, countdown and GO cues retain their existing behavior.
- Focused live watching uses the same visual callback. Preview cards, the menu and the live scene behind Replay do not produce mechanical effects.
- The 2D fallback retains task audio after its immediate SVG task changes; it has no queued 3D physical work.
- ReplayView.tsx and audio.ts are byte-identical to V24.3. Sound envelopes, volume, ambience and Replay scheduling are unchanged. Engine, Solo actions, API, config and backend setup SQL are also unchanged.

## Verification
- 81 targeted tests passed, including the existing audio synthesis/mute checks, eight new live scheduling cases, fast queued actions, scheduled bots, duplicate/rescheduled receipts, joins, reconnect age filtering, parallel work and round identity; plus V24.3 choreography, Solo roles, V23 timing/SQL and Replay checks.
- TypeScript, ESLint and production build passed.
- The actual scene callback was exercised with fast 20ms human reactions for Jack, Gunner and Wheel On. Every round emitted exactly 21 unique task cues, none before the matching visual start or before the renderer call, no duplicate or post-disposal cues, and no changes to official scores. These scene-transform tests stub the GPU render call and do not measure speaker latency or device FPS.
- A separate production-browser check instruments native Web Audio oscillator starts while playing fast Solo Wheel On through the UI. The saved native-live-audio.json report records the physical sound metadata and rendered scene clock. This verifies application wiring and actual Web Audio scheduling; it does not measure the user's output-device latency.

## Build
npm ci
npm run build
python scripts/package_v24_4.py

Deploy Netlify ZIP contents with index.html at the root. No SQL migration or new service configuration is needed. Historical V24-V24.3 reports remain as references.

## Optional browser checks
Install Playwright separately, start npm run dev and run node scripts/v24_4_audio_check.mjs for the scene-render scheduling check. For the native Web Audio production check, run npm run build and npm run preview (port 4173), then node scripts/v24_4_native_audio_check.mjs. Windows checks use installed Edge; other platforms need Playwright Chromium.
