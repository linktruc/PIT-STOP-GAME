# V16 Animation Polish — Source Changes

This update starts from the V15 source ZIP and modifies **only scene presentation**. It leaves all 21 game tasks, dependencies, bot timing, role assignments, Supabase SQL, penalties, and official leaderboard times unchanged.

## Changed

- `src/scene/crew.ts`: added a smoothly eased crouch factor for both wheel carriers; a gunner now also stows their tool and withdraws after the tighten task.
- `src/scene/garage.ts`: Old-wheel removers and new-wheel fitters share the gunner's articulated two-leg half-kneel (standing → kneeling → standing) instead of stiff leg rotations. Ready-but-not-yet-actioned crew show slight anticipation/idle movements; these cannot physically advance a job before its recorded event. Gun operators keep their wheel gun visible and held even after loosening, while making room for carriers, and show an aiming/torque pulse on **both** loosen and tighten. After tightening, operator and gun retreat together.
- `src/scene/animation.ts`: presentation-only motion lengths for gun (1100ms) and wheel (1250ms), with at least 450ms for extremely fast recorded events. This is NOT the real player reaction time. Existing event deduplication/snapshot semantics are preserved.
- Added `tests/v16-animation-polish.test.ts` and updated older presentation-test timing expectations to reflect longer visuals; existing production scoring expectations remain untouched.

## Performance

The knee positions are calculated from one reusable base pose and shared `THREE.Vector3` scratch objects, rather than allocating new vectors per actor every frame. No second animation engine, ad-hoc timers, or replay triggers have been added.

## Verification and limitations

- TypeScript syntax transpilation and Node-based focused logic tests passed.
- Could not run full Vite build or browser/WebGL visual QA because the dependency set is unavailable in this runtime.
- Review all four corners from several orbit angles, especially loosen → waiting/hand-off → tighten, a wheel carrier's knees/feet while gripping a wheel, and concurrent bot work on desktop and mobile.
- `npm ci && npm run typecheck && npm test && npm run build` before deploying.
