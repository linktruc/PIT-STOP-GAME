# V23 — Gunner-gated bot timing, first-two roles and front-jack staging

Based on V22. The 21-task graph, official elapsed time (GO to release),
leaderboard averages, rank ordering, UI, audio, camera and V15 animations
remain unchanged apart from the **front jack's pre-arrival staging**.

## Online bot timing

1. First human Jack lifts the car. The missing second jack is a bot and
   finishes in sync with the real Jack, exactly as before. This **does not**
   establish the bot reaction baseline for the Gunner cohort.
2. The first **human Gunner** completes a wheel nut loosen task. All waiting
   bot Gunners with their axle prerequisites satisfied complete at the same
   authoritative timestamp. If a second human Gunner is still working, their
   task remains under that human's control. No bot Gunner completes based on
   the Jack's time alone.
3. The mean reference for downstream bot tasks is now first observed once the
   Jack *and* first Gunner have completed. Example: Jack step 400ms, first
   Gunner step 2000ms => initial baseline (400+2000)/2 = 1200ms. Each subsequent
   real player task updates the mean for **newly unlocked** bot tasks.
   Previously scheduled deadlines remain fixed; existing later parallel-cohort
   caps remain in effect.
4. Solo testing without a real Gunner retains its local seed fallback so it
   remains playable. Legacy online rounds without a real Gunner also retain
   the former Jack-reference fallback to avoid stalling during migration.

## Multiplayer role assignment

- Person 1: Jack (the server's existing first player is FRONT_JACK).
- Person 2: one unique Gunner position.
- Persons 3–5: distinct old-wheel, new-wheel and release roles, randomly ordered.
- Persons 6–9: remaining Jack and Gunner positions, randomized.
- Persons 10–15: remaining wheel-on / wheel-off positions, randomized.
- Existing valid/unique player assignments are NOT shuffled by a new join.

## Front Jack staging

The front operator now stands at x=0 ahead of the nose (z=-4.78) throughout
pre-arrival and countdown. Their jack trolley stays clear of the incoming car
until GO, then arrives in front of the operator. Pre-arrival hand IK is paused
for the front operator so their arms don't stretch toward the off-centre trolley.
Both operator and trolley retreat as normal after the stop. Rear jack behavior
and every other crew position remain unchanged.

## Deploy

- Existing Supabase project with earlier migrations through 009: run
  `supabase/010_v23_first_gunner_reference.sql` **ONCE** in Supabase SQL Editor.
  It replaces only the two private functions, without clearing leaderboard,
  replay, saved rounds, or active player roles.
- New project: run the root `SUPABASE_SETUP.sql` (now contains the final V23
  overrides at its end). Do not rerun setup on a live project.
- On the frontend, `npm ci && npm run build` and deploy `dist/` to Netlify.
- `tests/v23-first-gunner.test.ts` and
  `tests/v23-multiplayer-database.test.ts` document full regression checks.

## Verification

- Ran 1000 seeded pure role assignments, both 1-human-Gunner and 2-human-Gunner
  synchronization examples, an initial mean example, and Solo fallback.
- TypeScript syntax passed for changed files and test cases.
- SQL function structure and static timing-rule checks passed.
- Could NOT run PGlite/PostgreSQL regression or Vite build here: dependency
  installation was blocked by unavailable network/cache. Run `npm test` after
  installing dependencies and verify real devices/network timing before use.
