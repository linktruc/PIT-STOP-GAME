# V24.8 — gunner contact, reserved lanes and player cameras

Players can switch between Overview, First person and Third person during Solo Test or multiplayer. The latter two follow the player's current role. First person hides the player's own helmet; third person sits above and behind the rendered actor. Overview keeps orbit, zoom and the arrival camera. Re-center returns to Overview.

Gunners now use a reserved contact/standby corridor instead of repeated collision pushes. The tool's held direction and position blend together, arms use a stable elbow pole, and both gloves remain attached to their grips. The socket reaches the nut and visibly rotates during loosen/tighten. If completion arrives before contact can be shown, one bounded 140 ms stroke is retained. Tightening waits for the fitted wheel and for the outgoing tyre to clear the return corridor. Gunner audio cues are emitted after the frame that actually shows socket contact and rotation. No task timestamps or input eligibility are changed by these visual gates.

Wheel handlers keep their prepared grip while a gunner clears the work area. Stabilizers leave through a separate sidepod lane after the tyre follow-through. The rear jack waits farther behind the rear-left handler so its trolley clears that worker's feet, then approaches on GO.

## Validation

- TypeScript build and ESLint.
- 123 targeted regression tests across 17 files: bot reference timing, Solo roles, multiplayer database, replay, audio, fast input, work readiness, wheel contact and the new camera/gunner controller.
- Native scene checks at 20 ms intervals: 4 fast/slow rounds; two-bone arm lengths, rigid tool grips, contact strokes in all four corners, bounded movement and body clearances. All scores and event timestamps remain unchanged.
- 45 camera combinations across all 15 roles.
- 8 tyre/departure regressions, including instant actions and 8 second wheel tasks.
- Real WebGL screenshots and desktop/mobile camera button checks in `docs/v24-8-evidence/`.

The clearance checks use sampled body probes and tyre geometry, not a full physics solver. Screenshots cover representative early, loosen and tighten poses.

## Reproduction

Install dependencies with `npm ci`, run `npm run dev`, and open the fixture at `/scripts/v24-8-gunner-camera-qa.html?sceneDebug=1`. The browser checks require Playwright and an installed Chromium browser. `scripts/v24-8-browser-qa.mjs` and `scripts/v24-8-visual-qa.mjs` use localhost port 5173. Use `npm run build` and `python scripts/package_v24_8.py` to create Source and Netlify ZIPs.

Deploy the contents of the Netlify ZIP as the site root. Editable code is in the Source ZIP and this repository's `source/` folder. Existing Supabase config, 10 team colors and gray support uniforms are preserved.
