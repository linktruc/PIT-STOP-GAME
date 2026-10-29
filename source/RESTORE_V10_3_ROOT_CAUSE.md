# V10.3 restoration in the V11.4 source

## Confirmed regressions in source diffs
1. `src/PitScene.tsx` in V10.3 rendered a React-owned `crew-tooltip` with `selected` state. V11.4 removed it and changed the picker to a detached DOM button created by `garage.ts`. The detached implementation did not visibly work for the owner, despite the cyan ring showing selection.
2. V11.3/V11.4 introduced bot deadline prediction, late-sync compensation, and additional animation scheduling paths not present in V10.3. The original V10.3 `TaskAnimationTimeline` class has now been restored **verbatim**; the later test-only helper is retained separately. This removes those later paths from the active timeline.
3. V11.4 still had countdown camera tracking code, but it could stay disabled after user-controlled orbit (`userCamera=true`) on later rounds. Re-arm the follow camera at every new `round.id`, while still allowing manual drag to take over during that round.

## Restored behavior
- Raycast (plus the widened hitboxes from V11.4) -> `setSelected` React callback -> tooltip inside the PitScene component -> ring updates from the same selected actor.
- Floating label displays human nickname or Bot and compact role, including the requested Front Wing Adjuster / Stabilizer labels.
- V10.3 `TaskAnimationTimeline` handles live and replay without predicting future bot animation or creating delayed duplicate cues. Bot *gameplay* step time and scoring are unchanged.
- Countdown camera follows the incoming car by default for each new round, until manually rotated.

## Preserved newer features
Current V11.4 UI, pit lane, altered gunner posing, adaptive bot gameplay, solo role chooser, online multiplayer, removal of Local Practice, and the requested support-crew labels remain. The whole 3D scene model from V10.3 was NOT copied wholesale: doing so would lose the requested newer staging, pit-lane approach and role behavior. The animation *timeline class* and click-tooltip UI are fully restored, not the entire V10.3 game.

## Verification / limitations
- TypeScript/TSX syntax: checked.
- Exact V10.3 timeline source is present and has no speculative `ingestLive` path.
- Test: a completed task from a second snapshot does not create an additional animation receipt; passed.
- React selection and camera reset wiring: statically checked.
- **Not verified in a real browser or with live Supabase.** This environment cannot fetch the npm dependencies. A matching new Netlify ZIP cannot safely be built here.

## Build/deploy (on a machine with Node.js and network)
```
npm ci
npm run typecheck
npm test
npm run build
```
Upload the generated `dist/` folder through Netlify. Configure your existing Supabase URL and publishable key before publishing; do not put private keys in the public bundle. Test live animation, selecting a model, the countdown camera, and replays on both desktop and mobile.
