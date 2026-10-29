# PIT STOP GAME - V24.7

The repository root contains the production build for static hosting. Keep the Netlify publish directory at the repository root.

Editable application source, tests, build scripts and version reports are in `source/`. See `source/V24_7_WHEEL_CONTACT_AND_RELEASE.md` for the latest change and validation details.

V24.7 couples wheel movement to actual hand contact, keeps tyres outside crew bodies and stabilizes the release controller and car departure. The ten team colors, gray support uniforms and Solo reference correction are retained. This release includes the V24.2 animation and V24.3 old-wheel placement fixes.

The existing deployed public connection settings are preserved in `config.js` and `source/public/config.js`.

To rebuild, run `npm ci` and `npm run build` from `source/`. Publish the contents of `source/dist/`.
