# PIT STOP GAME - V24.8

The repository root contains the production build for static hosting. Keep the Netlify publish directory at the repository root.

Editable application source, tests and build scripts are in `source/`. See [V24.8 release notes](source/docs/V24_8_GUNNER_CAMERAS.md).

V24.8 restores gun contact strokes, fixes gunner/support/rear jack clearance, and adds first-person and elevated third-person player cameras alongside Overview. Official game timing, the ten crew colors and gray support uniforms are preserved.

The existing public connection settings remain in `config.js` and `source/public/config.js`. Rebuild with `npm ci` and `npm run build` from `source/`; publish the contents of `source/dist/`.
