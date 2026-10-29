# PIT STOP GAME - V24.9

The repository root contains the production build for static hosting. Keep the Netlify publish directory at the repository root.

Editable source, tests and build scripts are in `source/`. See [V24.9 release notes](source/docs/V24_9_SMOOTH_MOTION_FREE_LOOK.md).

V24.9 smooths crew, wheel, jack and tool transitions while preserving fast action strokes. First person now supports free look; third person supports full orbit and zoom. Both cameras use a smooth follow anchor independent of body rotations.

Official timing, bot references, ten crew colors, gray support uniforms and public connection settings are preserved. Rebuild with `npm ci` and `npm run build` from `source/`; publish `source/dist/`.
