# V24.7 - Attached wheels, balanced handlers and stable release

The previous wheel mesh interpolation and speed-limited crew roots used separate clocks and positions. A fast completion could move or replace a tyre before its handler touched it. Opposite axle-face grips, a 90-degree carried-wheel rotation and deep torso bending also forced a slow handler into the tyre.

WheelHandling now drives contact preparation, pickup, fitting, carry and hand release together. It requires a rendered contact frame before pickup, waits for the old tyre to clear before fitting and only releases the replacement tyre after fitting reaches exactly 1. Both gloves grip the exterior axle face; wheel orientation remains stable. Staged contact stations, a shallow half-kneel with compact feet and separate outgoing/incoming paths keep tyres outside the handler and adjacent crew. Placed-wheel glove positions are frozen during release so lowering the car cannot pull the hands back.

Work state, scores and eligibility remain authoritative. Known BOT intervals can prepare in advance. An unpredictable instant human input uses a short bounded physical handoff (100ms pickup, 80ms fitting, plus a contact frame) instead of teleporting the mesh; carrying and setting down remain independent follow-through. No extra wait is added to official tasks or BOT reference arithmetic.

The release controller stands at a fixed clear station. The signal arm and turn ease continuously from the completion timestamp. Zero-duration lower/release receipts no longer skip straight to full retreat/departure. A departure latch waits for actual crew clearance, positions the car before solving wheel/tool contacts and never snaps it back into the bay after a later collision check. Late joins and Replay seeks settle to the appropriate phase and continue smoothly.

## Verification

116 targeted tests across 16 suites cover contact-before-pickup, extraction-before-fitting, exterior grips, departure continuity, zero-ms release, late joins, all 15 roles, adaptive BOT timing, audio, Replay and multiplayer SQL. Browser checks sample actual Three transforms and hand IK at 20ms intervals across eight rounds with 0ms, 36ms, 2s and 8s human reactions. They assert attached gloves, tyre clearance from torso/head/knees/feet and other crew, separate old/new tyres, fixed signal position, monotonic car departure and unchanged official round data. The checks use conservative cylinder/sphere clearance samples and a stub renderer; they do not constitute general collision physics or device FPS measurements. Real WebGL close-ups verify slow removal, fitting preparation and the release pose.

Reports and screenshots: docs/v24-7-evidence/. Optional Playwright checks with the dev server running: node scripts/v24_7_wheel_check.mjs and node scripts/v24_7_visual_check.mjs.

Build: npm run build; python scripts/package_v24_7.py. Production connection settings, Supabase setup, engine timing, team palette and gray support colors are preserved. No backend migration is required.
