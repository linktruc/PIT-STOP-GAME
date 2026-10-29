# V7 visual overhaul

- Replaced the scrolling website with a fixed-viewport indie-game shell: garage scene, compact HUD, contextual action console, drawers and overlays.
- Rebuilt the original low-poly garage with a red formula car, angular crew, workstations, monitors, overhead structure, tools, tyre stacks, yellow lane markings and contrasting warm/cyan light.
- Added manual orbit, limited zoom, reset and keyboard camera controls.
- Added a projected gold YOU label, ground ring and stronger readiness/accepted-action feedback on the assigned character.
- Mapped lift/lower, loosen/tighten, tyre removal/fitting and release to independent crew/vehicle animations; parallel branches animate concurrently.
- Rebuilt all 21 task nodes as a compact branching sequence with animated causal connectors, own-role emphasis and expanded task/owner details.
- Replaced quiet generic audio with distinct synthesized mechanics, countdown/ready/availability/completion/UI/release cues and quiet garage ambience; added shared saved volume and gesture/reconnect recovery.
- Redesigned room entry, roster, readiness, host controls, results, standings/admin and public observer overview/focus in the same game shell.
- Added ECO quality, static geometry batching, reduced-motion behavior and an SVG fallback that retains player identity and playable controls.

The game engine, bot rules, authoritative timer, Supabase schema/RPCs, player identity, public runtime config format and Netlify routing remain unchanged. No database migration is needed for an existing installation. Reuse its public config.js and deploy to the existing Netlify site to keep the same origin.

See TEST_REPORT.md for executed tests and deployment/device limits.
