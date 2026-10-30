# PIT STOP GAME - V24.11

The repository root contains the production build for static hosting. Keep the Netlify publish directory at the repository root.

Editable source, tests and build scripts are in `source/`. See [V24.11 release notes](source/docs/V24_11_COMPACT_MOBILE_HUD.md).

Phone players get a smaller in-game HUD and a compact camera switch beside Main Menu and Leave Team. Desktop layout, motion, multiplayer action transport and official timing remain unchanged. No SQL migration is required.

Rebuild with `npm ci` and `npm run build` from `source/`; publish `source/dist/`. Existing Supabase configuration is preserved. The Windows multiplayer tester source is in `tools/multiplayer-tester/`.
