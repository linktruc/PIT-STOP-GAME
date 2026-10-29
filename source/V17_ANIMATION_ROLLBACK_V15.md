# Animation reverted to V15 (V17 UI retained)

This package is based on **V17**. Only the **V16 animation-polish** changes have been reverted to their exact **V15** implementation:

- `src/scene/animation.ts` — restored V15 task presentation timings (gun 750ms, wheel 850ms) and the original 120ms minimal visual tail.
- `src/scene/crew.ts` — restored the V15 gunner handoff behavior and removed the V16 carrier-kneel helper.
- `src/scene/garage.ts` — restored V15 gunner / wheel-carrier rigs, poses, and tool staging; removed the V16 idle-ready and sustained gun animation changes.
- `tests/v11-choreography.test.ts` — restored the correct assertions from V15.
- Replaced the now-obsolete `tests/v16-animation-polish.test.ts` with `tests/v17-animation-rollback.test.ts` verifying the V15 values and event deduplication.

**Intentionally preserved from V17:** V17 workflow smooth scroll, menu and responsive layout, new ground arrow, role assignment, multiplayer/Solo logic, camera, backend / SQL, and all other gameplay/UI updates.

No SQL migration is required. The original V16 notes in the source remain as historical records; this rollback note takes precedence.

**Verification performed:** Three animation source files byte-for-byte identical to V15 ZIP; TypeScript syntax transpilation check; no stale references to V16-only exports; regression test source updated. Full Vite build / WebGL rendering require installed project dependencies and browser testing.
