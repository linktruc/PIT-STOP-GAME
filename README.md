# PIT STOP GAME - V24.4

The repository root contains the production build for static hosting. Keep the Netlify publish directory at the repository root.

Editable application source, tests, build scripts and version reports are in `source/`. See `source/V24_4_LIVE_AUDIO_SYNC.md` for the latest change and validation details.

V24.4 synchronizes live mechanical sounds with rendered animation starts, preserving Replay and BOT timing. This release includes the V24.2 animation and V24.3 old-wheel placement fixes.

The existing deployed public connection settings are preserved in `config.js` and `source/public/config.js`.

To rebuild, run `npm ci` and `npm run build` from `source/`. Publish the contents of `source/dist/`.
