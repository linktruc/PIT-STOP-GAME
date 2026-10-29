# V21 — role-family priority + UI follow-ups

Based on V20. Animation, audio, bots, camera, timers and scoring are not modified.

- Reaffirm current V15 / V20 five-role-family rule on the multiplayer server using `supabase/009_v21_confirm_family_roles.sql`, without rerolling existing players. 1 Jack starts; 2–5 cover the other four families, 6–9 prioritize remaining Gunners/Jacks, then wheel positions.
- Close/Leave Team controls use red styling (menus, modals, replay, Event Log).
- Replay transport centered in desktop and mobile widths.
- Separate team-name header from workflow in narrow desktop layouts.
- Remove admin “Account setup checks” from sign-in UI.
- Add persistent round numbering to Watch Live running cards and finished records using `leaderboard.rounds` order; fallback to visible replays if leaderboard unavailable.
- Rename Watch Live section `JUST FINISHED` → `FINISHED`.
- Leaderboard heading now “Teams are ranked by their pit stop time across completed rounds”; delete redundant footer copy.
- Main menu uses larger title and more breathing room when space permits.
- The desktop “Your Role” label allows two lines without ellipsis.

## Deployment

Build using `npm ci && npm run build` from source then deploy `dist`. Run 009 in Supabase SQL editor only if the updated assignment rule isn't yet installed; run prior migrations through 008 first. Do NOT run `SUPABASE_SETUP.sql` to update an existing database, because that is a new-project setup script.

## Verification limits

Static source / syntax checks and deterministic assignment scenarios completed. No connection to the actual user's Supabase or an interactive WebGL device in this environment.
