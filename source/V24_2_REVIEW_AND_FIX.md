# V24.2 - Smooth motion review and fixes

## Assessment of the supplied V24.1
The FPS limiter fix is valid on a 60Hz display. Caching mobile categories, rejecting distant collision pairs before sqrt, and disabling unused grip diagnostics are useful optimizations. They are retained.
However, the render-rate change does not fix temporal or positional discontinuities. V24.1 deliberately retains the V24 clearance solver's final positions, including abrupt changes as crowd constraints switch.

## Reproduced causes and changes
- A scheduled Solo receipt expired before the authoritative completion snapshot arrived. phase became null, and the actor returned to its waiting station before jumping back on ACK. posePhase now holds the endpoint while isDone still requires authoritative DONE. No score or bot task is completed speculatively.
- Carriers retain their endpoint pose after a task rather than resetting their root and arms to the idle station.
- The 50ms React HUD clock was repeatedly treated as a fresh server clock sample, rewinding the visual clock between updates. The scene now receives the stable clock offset and advances from a monotonic frame clock with bounded server corrections.
- The clearance solver still provides safe destination positions, but rendered roots follow bounded, damped movement and steer around occupied body space. They no longer adopt multi-metre clearance corrections in one frame. Dropped live frames do not reset roots.
- Explicit Replay seek/restart resets the follower immediately to the selected timeline pose; normal playback and pauses retain continuous positions. Reverse timeline movement also settles directly.
- Jack tools follow the final operator roots. The rear jack's approach passes behind wheel handlers rather than cutting through their feet. Guns are held upright while yielding to wheel carriers.
- Carrier/tightening/release visuals wait for preceding physical receipt tails when necessary, within the already scheduled bot deadline. The opening 700ms fallback interval is unchanged. No official event timestamp is edited.
- The YOU marker now follows the final corrected crew position.
- Frame pacing uses accumulated deadlines at 60 FPS (30 in Eco/reduced-motion) rather than fixed cutoffs that alias on 90/144Hz displays. These are pacing targets, not guaranteed device performance.
- Cached role task groups, shared grip anchors and early exit once both gun handles are reachable reduce frame allocations and redundant IK work.

## Validation
- 62 targeted tests passed: motion/clock/pacing, supplied V24.1 regressions, all 15 Solo roles, bot timing, V23 human-Gunner synchronization and multiplayer SQL, choreography and replay.
- TypeScript, ESLint and Vite production build passed.
- Continuous geometry comparison sampled five complete role scenarios at 10ms intervals. The supplied V24.1 had 261 body-centre jumps above 0.12 scene units per sample; V24.2 had zero in these scenarios. Maximum sample displacement changed from about 1.681 to 0.0873 scene units. The delayed-ACK case changed from about 1.467 to 0.000034 scene units.
- These dense geometry checks execute the real Three.js scene transforms with rendering stubbed out. They test continuity and conservative collision bounds, not GPU frame rate. They found no tool/body or tool/tool overlaps in the sampled scenarios. They are not an exhaustive proof for every human timing.
- A separate real WebGL check on the production build completed Solo through the actual UI, then opened Replay, paused and sought to both ends. No JavaScript errors, no backwards live scene clock, and Jack/Gunner grip error below 0.000001 scene units were observed. See docs/v24-2-evidence/production-browser.json and production-result.png.
- GPU performance on the user's own hardware is not measured. Software-rendered browser checks with sceneDebug enabled are not an FPS benchmark.
- Engine, Solo actions, API, runtime config and Supabase SQL are byte-identical to the supplied V24.1; hashes are included. The 700ms fallback/reference formula, actual task clocks, log, official time and multiplayer rules are preserved.
- Historical engine/scene test assertions documented in V24 remain outside this change; the 62-test selection above is the verified current-version set, not a claim that every historical test passes.

## Build / deploy
npm ci
npm run build
python scripts/package_v24_2.py

The Netlify ZIP contains index.html at its root. Retain/configure public/config.js as usual; no SQL migration is required. The supplied Supabase connection fields remain unchanged.

## Reproduce the geometry comparison (optional)
Install Playwright separately, start npm run dev, then run node scripts/v24_2_motion_check.mjs.
The baseline fixture under tests/fixtures/v24-1-scene contains the supplied V24.1 scene with only diagnostics enabled for manual rendering. It is not imported by the production app.
The browser HTML harness is scripts/v24-2-motion-qa.html. Explicit sceneDebug/contactDebug flags enable measurements. Evidence is under docs/v24-2-evidence/.
