# PIT STOP GAME - V24.15

The repository root contains the production build for static hosting. Keep the Netlify publish directory at the repository root.

Editable source, tests and build scripts are in `source/`. See [V24.15 release notes](source/docs/V24_15_DRAG_DIRECTION.md).

Built from the supplied V24.15 Natural Drag Camera source. First/third-person mouse, touch and pen gestures use the same drag-the-scene direction and viewport-adjusted sensitivity. This update adds no SQL migration. Existing runtime Supabase and hosting configuration is preserved.

Rebuild with `npm ci` and `npm run build` from `source/`; publish `source/dist/`. Existing Supabase configuration is preserved. The Windows multiplayer tester source is in `tools/multiplayer-tester/`.
