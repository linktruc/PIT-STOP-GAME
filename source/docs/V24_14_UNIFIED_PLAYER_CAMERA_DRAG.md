# V24.14 — Natural Cam 1 / Cam 3 dragging on desktop and mobile

This patch changes **only camera input**; gameplay timing, multiplayer, bot synchronization, visual actor animations, replay, camera overview presets, and Supabase are untouched.

## Original cause

`PlayerCameraRig.drag` had a combination of mode- and device-dependent sign inversions:

- Cam 1 (first person): mouse was `yaw +, pitch -`, touch was `yaw -, pitch +`.
- Cam 3 (third person): mouse was `yaw -, pitch +`, touch was `yaw +, pitch +`.

A swipe in the same direction therefore rotated differently across platforms.

## New behavior

- In **Cam 1** and **Cam 3**, on **mouse, touch, and pen**: drag right => negative heading (look left), drag left => positive heading (look right), up => tilt upward, down => tilt downward.
- Sensitivity scales with the *height of the 3D canvas*, not whether the browser reports a mouse or touch. Equivalent fractions of a screen swipe yield equivalent angular movement on a phone and a PC.
- Cam 3 retains scroll-wheel / two-finger pinch zoom.
- Drag remains smoothed using the existing camera rig and preserves follow tracking. A single unusually large frame delta is capped to prevent snapping after pointer capture resumes.
- Overview (Cam 0) / OrbitControls remain unchanged.

## Code / tests

- `src/scene/playerCamera.ts`: one shared camera-space sign convention and viewport-sensitive drag gain.
- `src/scene/garage.ts`: feeds the current canvas height into the drag method.
- `src/App.tsx`: adjusts the small gesture hints.
- `tests/v24-12-presentation.test.ts`, `tests/v24-13-feedback.test.tsx`: update their old inverted-axis expectations.
- `tests/v24-14-camera-controls.test.ts`: mode/device equivalence, directions, screen-relative sensitivity, and stale deltas.

No database migration required.

**V24.15 update:** Reversed horizontal drag for Cam 1 and Cam 3 as requested (drag LEFT → look RIGHT; drag RIGHT → look LEFT), on mouse/touch/pen consistently. Vertical drag and overview remain unchanged.
