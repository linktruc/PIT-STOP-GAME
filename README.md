# PIT STOP GAME - V24.10

The repository root contains the production build for static hosting. Keep the Netlify publish directory at the repository root.

Editable source, tests and build scripts are in `source/`. See [V24.10 release notes](source/docs/V24_10_MULTIPLAYER_ACTION_LATENCY.md).

Multiplayer actions bypass background reads. Server realtime updates confirm actions and unlock subsequent work without a second state RPC. Immediate sent feedback replaces the action spinner while official timing and validation remain server-controlled. V24.9 motion and free-look cameras are retained. No SQL migration is required.

Rebuild with `npm ci` and `npm run build` from `source/`; publish `source/dist/`. Existing Supabase configuration is preserved.
