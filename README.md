# PIT STOP GAME - V24.6

The repository root contains the production build for static hosting. Keep the Netlify publish directory at the repository root.

Editable application source, tests, build scripts and version reports are in `source/`. See `source/V24_6_WORK_SYNC_AND_CREW_TRANSITIONS.md` for the latest change and validation details.

V24.6 aligns every work state with Action readiness, shortens the Rear Jack approach after GO and keeps completed Gunners holding their tools continuously through car lowering. The ten team colors, gray support uniforms and Solo reference correction are retained. This release includes the V24.2 animation and V24.3 old-wheel placement fixes.

The existing deployed public connection settings are preserved in `config.js` and `source/public/config.js`.

To rebuild, run `npm ci` and `npm run build` from `source/`. Publish the contents of `source/dist/`.
