# V11.4 camera and main menu corrections

## Main menu
- The menu formerly had conflicting `overflow-y:auto` and `overflow:visible` styles.
- The menu is now strictly non-scrollable and the added Resume/Leave seat controls use a compact responsive layout.
- The background 3D viewer retains its existing orbit interaction.

## Arrival camera
- Dragging/orbiting during 3–2–1 no longer switches the camera into a fixed world-position mode.
- Camera and OrbitControls target translate together along the actual car approach path; the chosen angle remains editable.
- After GO the target settles over the pit work bay during 600ms and the camera returns to normal pit-view distance bounds, retaining the angle.
- At the next round the automatic view resets to the default follow camera.
- Authoritative task timings, bot schedules, animations, role selection and score logic are unchanged.

## Verification notes
- Requires a Vite build to deploy; changes are editable TS/TSX/CSS source.
- Test short-height screens with a saved team and manual camera orbit during countdown on desktop and mobile.
