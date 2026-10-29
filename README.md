# PIT STOP GAME - V24.5

The repository root contains the production build for static hosting. Keep the Netlify publish directory at the repository root.

Editable application source, tests, build scripts and version reports are in `source/`. See `source/V24_5_FAST_ANIMATION_AND_CREW_COLOR.md` for the latest change and validation details.

V24.5 speeds up animation while preserving visible fast actions, includes the BOT Jack in Solo Gunner reference timing, and applies team colors to 3D crew uniforms. This release includes the V24.2 animation and V24.3 old-wheel placement fixes.

The existing deployed public connection settings are preserved in `config.js` and `source/public/config.js`.

To rebuild, run `npm ci` and `npm run build` from `source/`. Publish the contents of `source/dist/`.
