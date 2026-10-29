# Local Practice removal (V11.4)

Removed the automatic browser fallback which generated three synthetic human players when Supabase was not configured. The `src/practice.ts` adapter and its tests were deleted; `api.call(create|join|start...)` now requires a real configured Supabase backend.

- Create Team / Join Team work **only with Supabase**; each member is a real signed-in device. Standard multiplayer start requires 4–15 humans.
- **Unfilled roles are still adaptive task bots** and remain visible as the pit crew. They are not lobby members and never create fake timing samples.
- Offline Solo Test remains an explicitly selected, independent unranked mode with one human and 14 adaptive bots. It is enabled via `enableSoloTest: true`.
- When `config.js` is blank, the menu shows an online-unavailable message and the team creation form is disabled. Replays/leaderboard from online games require Supabase.
- No Supabase SQL migration is required for this change. Existing live online results are preserved.
- Old README/browser QA screenshots describing browser Local Practice are historical and are not valid current behavior.

To connect: edit `config.js` **inside the Netlify deploy folder** (or `public/config.js` before build) with your actual Supabase URL and public anon/publishable key. Never insert secret/service_role credentials into the browser. Deploy this site's rebuilt files.
