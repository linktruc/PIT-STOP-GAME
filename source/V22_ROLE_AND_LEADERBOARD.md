# V22 — Desktop role readability & leaderboard label

- Desktop RoleCard auto-sizes vertically to show complete multi-line role names and the details button, overriding the legacy 43px height restriction. No button-area scroll is introduced; portrait mobile styling is unchanged.
- Leaderboard caption explicitly says teams are ranked by their **average** pit stop time across completed rounds, matching `entry.averageMs` in the calculation/display.
- No game engine, Supabase, animation, bot logic, replay, camera, or SQL changes.
