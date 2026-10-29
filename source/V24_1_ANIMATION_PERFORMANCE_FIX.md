# V24.1 – targeted animation frame pacing fix

Compared `src/scene/garage.ts` between V23 and V24. V24 introduced an animated collision solver and rigid gun grip IK that runs each rendered frame. These operations are more expensive than V23, but are needed for correct hand/tool contact.

## Changes
- Fix the **50 FPS cutoff on a 60Hz monitor**: threshold 20 ms accidentally skips alternating 16.67 ms refreshes and yields roughly 30 rendered frames per second. The high-quality limiter now uses a 15 ms threshold (~60 frames on 60Hz and 120Hz displays). Low quality and reduced-motion target 30 ms (~30Hz on a 60Hz display).
- Speed up the new V24 crowd collision solver without changing its final positions: cache which crew can move, skip non-movable pairs, use an axis-aligned distance check before sqrt/hypot, and retain the **same 32-pass convergence limit**.
- Compute tool grip error metrics only when the explicit sceneDebug URL flag is present. The hand/grip IK itself remains unchanged.
- Preserve all V24 Solo 700 ms bot timing, V23 multiplayer behavior, 3D character positioning, rig poses, front jack placement, replay behavior and scoring.

## Verification
- TypeScript syntax check of edited file passed.
- 400 simulated crew layout cases in the regression test: broadphase optimization keeps the same V24 positions; all 32 passes retained.
- 60Hz timeline arithmetic verifies the old high-quality frame limiter skips alternate frames while the new 15ms threshold doesn't.
- Full WebGL runtime benchmarking on the user's hardware has not been run. Dependencies were unavailable for npm ci offline, so production build and complete test suite are **not verified in this environment**.

Run `npm ci`, `npm run test`, and `npm run build` in a development environment. Compare FPS in live Solo / live multiplayer and Replay, with the same browser window and device pixel ratio. If there are still hitches, profile main-thread `scene.updateMatrixWorld`, poseHands/grip IK and GPU frame time. Do not use `?sceneDebug=1` during performance comparisons because it adds expensive per-frame instrumentation.
