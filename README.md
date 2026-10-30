# PIT STOP GAME - V24.13

The repository root contains the production build for static hosting. Keep the Netlify publish directory at the repository root.

Editable source, tests and build scripts are in `source/`. See [V24.13 release notes](source/docs/V24_13_CROSS_DEVICE_ROOM_FEEDBACK.md).

Camera drag directions are tailored to mouse and touch. Peer lockouts remain visible during Realtime interruptions; joins and host transfers produce room notices. Ready and Play again show host-only permissions. This release adds no SQL migration. For existing five-minute offline expiry, apply [the V24.12 backend migration](source/supabase/V24_12_OFFLINE_CLEANUP.sql) once if not already installed.

Rebuild with `npm ci` and `npm run build` from `source/`; publish `source/dist/`. Existing Supabase configuration is preserved. The Windows multiplayer tester source is in `tools/multiplayer-tester/`.
