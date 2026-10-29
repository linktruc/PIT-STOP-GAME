# V7 verification results

Executed on 18 October 2026.

- PASS: 89 automated tests in six files.
- PASS: final TypeScript/build and zero-warning ESLint.
- PASS: extracted source ZIP, clean lockfile npm ci and production build.
- PASS: archive structure, local JS/CSS/fonts/licenses, source exclusions, ZIP integrity and SHA-256 manifest.
- PASS: core engine/API/practice/types/SQL/config/routing/headers remain byte-identical to the previous release.
- PASS: production Chromium acceptance (14 checks), with no page JavaScript errors or external asset requests.

## Production browser checks actually passed

- PASS: 1440×900 game shell: one WebGL canvas, explicit local-practice disclosure, dominant 3D viewport, no page scroll
- PASS: Create team: role intro, gold YOU marker, two own jack nodes in 21-step chain and readiness-gated Start
- PASS: Manual drag rotates the 3D camera while the room HUD remains interactive
- PASS: Audio resumes after a user gesture; visible mute/unmute and Master volume controls change live audio state
- PASS: Countdown → front lift → parallel bot wheel actions → front lower → 21 completed tasks → finished result
- PASS: Front of car visibly raises and lowers; scene reports simultaneous action-matched animations
- PASS: Chromium Web Audio renders nonzero samples and multiple synthesized gameplay cues
- PASS: Leaderboard average and round detail remain available; room host has no global-delete control
- PASS: Observer overview shows both completed and countdown teams; selected team opens a dominant 3D focus view and returns
- PASS: Replay resets readiness and page reload restores the practice team
- PASS: 1280×720 desktop and 390×844 mobile: home, room browser and lobby remain inside one viewport
- PASS: Forced WebGL failure preserves the SVG pit map, gold YOU marker, ready/start controls and reduced-motion mobile layout
- PASS: Focused 390×844 lobby capture confirms visible role, gold YOU marker and ready/start controls with all overlays closed

## Measurements

- Camera yaw changed from 2.554 to 2.171 radians after dragging.
- Actual front axle offset rose to 0.270 scene units and returned to 0.000.
- Four crew tasks animated concurrently.
- Web Audio resumed, started 254 synthetic sources across the test and produced nonzero final output.
- Document dimensions matched the viewport with no scrolling at 1440×900, 1280×720 and 390×844.

Browser checks used local practice and a synthetic observer fixture. They do not certify hosted Supabase Realtime, physical multi-device play or physical speaker loudness. See TEST_REPORT.md.

## Final-build follow-up

PASS against `/assets/index-CsEj5qDb.js`: actual 390×844 lobby with role, YOU, Ready and Start visible; direct hash navigation closes the browser overlay; running WebAudio at volume 1 produces 29 sources and nonzero output below 1; zero page errors. See `final-followup.json`.

PASS: extracted source archive rebuild emitted byte-identical final production JS/CSS assets.
