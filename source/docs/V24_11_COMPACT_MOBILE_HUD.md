# V24.11 — compact phone HUD

The phone crew HUD now uses a compact top navigation row. A single camera button sits beside Main Menu and Leave Team and cycles Overview → First person → Third person. The desktop three-button selector remains unchanged. Short landscape layouts also move the camera control into the top row.

Room title/timer, workflow ribbon, role card and action console occupy less vertical space. The ribbon retains phase labels and individual corner state markers; redundant large lock icons are hidden on phones. Role details remain available through the Info button. Action press, early-lockout and official time behavior are unchanged. The primary action target remains at least 44 CSS pixels high; top navigation controls are 32 pixels high. The Solo role selector uses 16 px text to avoid focus zoom on iOS.

The mobile rules are scoped to the crew view and loaded after the existing responsive layers. Safe-area and hosting-overlay reservations are retained. Camera movement, game timing, multiplayer transport and bot references are unchanged.

Validation: TypeScript and ESLint, real WebGL before/after captures, 320/360/390/430 px portrait layouts across waiting/countdown/action/lockout/result states, camera cycling, role details, desktop selector visibility and landscape top navigation. Evidence and measured layout bounds are in `docs/v24-11-evidence/`. Browser QA uses controlled game snapshots and does not join an online room.

Run the local dev server and `node scripts/v24-11-mobile-check.mjs` with Playwright and Edge/Chromium installed. Build with `npm run build`; package with `python scripts/package_v24_11.py`. No SQL migration is required. Use the new deployment to test; a deploy-specific Netlify URL remains pinned to that deployment.
