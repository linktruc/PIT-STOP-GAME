# V11.4 regression fix using V10.3 as reference

Scope: restores V10.3 event-based visual scheduling in the V11.4 scene, removes per-frame DOM JSON debugging of bot state, and adds a bounded screen-space fallback to crew raycasting. Keeps the current graphics, menu, HUD, Supabase and no-Local-Practice setup. Keeps support labels Stabilizer and Front Wing Adjuster.

## Changes
- `src/scene/garage.ts`: Use signature-deduplicated `ingestRecorded` as V10.3 for live and replay; no speculative bot animation or catch-up loop. Remove 50fps `data-bot-cues` writes. Crew pointer picking attempts raycast first, then nearest visible figure within 27–44px, ignoring drags.
- `src/v11-4-ui.css`: Ensure tooltip renders above scene effects.
- Deploy JS/CSS: identical three changes applied to the supplied built V11.4 bundle, without changing other behavior.

## Known limitations
- **Not browser/GPU tested:** no full Three.js interaction or PC frame-rate measurement could be performed here.
- This is a regression rollback with limited targeted fixes, not proof that all animation issues have been eliminated.
- No Supabase SQL changes; online bot timing and scores remain server authoritative.
- Deploy's public `config.js` may require the existing Supabase URL and publishable key.
- Vite build was unavailable because npm packages were not installed; the deploy bundle has been patched directly with the same logic. Validate a fresh Vite build when the dependencies are available.
