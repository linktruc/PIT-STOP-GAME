# V19 — Fluid, aspect-aware UI (based on V18 with V15 animation)

## What changed

- Added `src/v19-fluid-layout.css`, imported **last** in `src/main.tsx`. It distinguishes landscape touch from desktop, and uses proportional widths, `clamp()`, and independent panel layout instead of forcing every viewport wider than 600px into the PC HUD.
- Desktop with a narrow/short window retains vertical mini-workflow + log on the left and compact controls on the right. Mini-workflow titles may wrap; the active task is prioritized.
- Landscape touch: main menu becomes a two-column layout; gameplay has a compact horizontal workflow on the left and control dock on the right; the desktop Event Log is hidden in this cramped mode (full log remains accessible elsewhere).
- Portrait touch tablets get a horizontal workflow and a wide bottom control dock.
- Replay controls become a bounded compact dock instead of a near-full-width strip on short desktop or landscape touch devices.
- `rollingWorkflow()` no longer shows *only the previous completed group* when just one group fits. It prioritizes the current Ready group and the earliest available task in a non-linear parallel status frontier.
- The MiniChain measurement now reacts to window resize, orientation changes and Safari visualViewport resizing in addition to ResizeObserver.

## Tests performed

1. `tests/visual/run_visual_check.py` renders representative CSS/DOM fixtures in Chromium using Playwright at 9 form factors × 3 views = **27 scenarios**. No tested main menu, crew mini workflow, action dock or replay control panel crossed the viewport bounds; landscape touch panels remained compact. These are **layout fixtures**, not full game/WebGL tests.
2. TypeScript transpilation syntax checks passed for `src/workflow.ts`, `src/ChainHUD.tsx` and `src/main.tsx`.
3. Parsed `src/v19-fluid-layout.css` successfully with `tinycss2` (no syntax errors).
4. Verified `src/scene/animation.ts`, `src/scene/crew.ts` and `src/scene/garage.ts` still match **V15 byte-for-byte**.
5. Verified both one-slot Ready edge cases by executing the transpiled `src/workflow.ts` with synthetic tasks. Added `tests/v19-workflow-viewport.test.ts` for the same behavior; the Vitest suite itself was **not executed**, because npm dependencies were unavailable in this container.

## Deployment

This is an editable **source ZIP**, not the built `dist/`. Run `npm ci`, `npm run test`, then `npm run build` on a system with dependencies installed. Deploy `dist/` to Netlify. No Supabase migration required. Test on actual mobile Safari, especially browser chrome and platform floating buttons, before public use.
