# PIT STOP GAME - V24.12

The repository root contains the production build for static hosting. Keep the Netlify publish directory at the repository root.

Editable source, tests and build scripts are in `source/`. See [V24.12 release notes](source/docs/V24_12_CAMERAS_WATCH_PRESENCE.md).

Player camera drag axes are reversed, Watch Live thumbnails update smoothly, red lockout highlights return, and blue human markers appear only while waiting. Offline room memberships expire after five minutes. Run [the backend migration](source/supabase/V24_12_OFFLINE_CLEANUP.sql) once in the Supabase SQL Editor to enable server cleanup; static deployment alone does not apply it.

Rebuild with `npm ci` and `npm run build` from `source/`; publish `source/dist/`. Existing Supabase configuration is preserved. The Windows multiplayer tester source is in `tools/multiplayer-tester/`.
