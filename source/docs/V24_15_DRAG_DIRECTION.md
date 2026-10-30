# V24.15: drag scene horizontally in Cam 1 / Cam 3

Based on the provided V24.14 source. Requested gesture mapping:

- Drag/swipe **right to left**: camera looks/orbits **right** (positive yaw).
- Drag/swipe **left to right**: camera looks/orbits **left** (negative yaw).
- Swipe upward: camera tilts upward; downward: tilts downward (unchanged).
- Same exact mapping on mouse, touch and pen; scrolling/pinching zoom in Cam 3 remains unchanged.
- Overview mode uses its existing OrbitControls and is not modified.
- Keyboard Left/Right still turn toward the corresponding arrow, independently of dragging.

Changed only `PlayerCameraRig.drag`, gesture hint, and expectations in the existing camera tests. No game, bot, animation, UI layout, or Supabase changes.
