# PIT STOP SIMULATOR — V11.4 Bot Timing Source Review

## Result
The current TypeScript local engine and bundled reference Supabase SQL implement adaptive bot deadlines. A 5,000ms front-jack reaction produces a 5,000ms mean; the other opening jack synchronizes at that same completion, and each newly unlocked wheel-gunner bot has dueAt = enabledAt + 5,000ms. This was independently run against the supplied TypeScript using global `tsc` and Node (250ms, 4,000ms, 5,000ms fixtures).

## Important expected exceptions
- Opening front/rear jack bot syncs to the human jack immediately at completion rather than waiting an extra mean.
- Human-cohort cap lets a parallel bot finish with the final human in that cohort even if its nominal due time is later.
- Existing scheduled bot tasks do not shift retroactively when a new human reaction sample arrives; newly enabled tasks use the updated mean.
- Solo Test with a role other than a jack uses an initial 400ms bootstrap before the first real reaction is available. Future tasks unlocked after the first observed reaction use the observed mean. Online ranked play does not use this Solo bootstrap.

## Reproduced visual bug / patch
`src/scene/animation.ts` originally reconstructed visual receipts at authoritative completedAt timestamps. Physical action animations run only ~650–1,000ms. A desktop that receives a task completion 1+ seconds late could show no motion at all, even though the bot has correctly waited several seconds in the engine. Also, successive snapshots could replace an animation currently playing.

Added `TaskAnimationTimeline.ingestLive(round, nowMs)` to preserve in-flight animations across fresh snapshots and show a short catch-up for newly received late events. `src/scene/garage.ts` uses `ingestLive` for live games and retains exact `ingestRecorded` for Replay. No game logic, backend SQL, official completion time, countdown, leaderboard or bot deadline was modified. Very large stale batches after a long suspension settle instead of animating an old backlog.

## Deterministic verification
- Compiled `src/types.ts`, `src/engine.ts` and `src/scene/animation.ts` using global TypeScript 5.8.3 successfully.
- Ran local first FRONT_JACK click with 250 / 4,000 / 5,000 ms reactions and verified bot dueAt and completion times matched the reaction.
- Reproduced old late event: FL_GUN_LOOSEN enabled at 6,000, due and completed at 11,000; live observation at 12,000 originally had no phase/animation.
- Verified patched live timeline retains a catch-up receipt; original exact-time replay timeline behavior remains unchanged, and official dueAt is unaffected.
- Reviewed `supabase/001_pit_crew.sql`; its reconciliation uses `avg(ms)` from human samples with `at <= enabledAt`, opening-jack sync and parallel caps. Existing bundled historical reports claim PostgreSQL-equivalence tests, but those hosted database tests were NOT independently rerun in this environment.

## Remaining verification / limitation
Could not install `npm` dependencies (registry DNS error: EAI_AGAIN); therefore did NOT run the full Vite build, Vitest suite or WebGL browser test. The uploaded source cannot prove which SQL definition the live Supabase project currently runs. Compare the actual function in the Supabase SQL Editor:

```sql
SELECT pg_get_functiondef('pit_private.reconcile_round(uuid,numeric)'::regprocedure);
```

Verify it uses `avg(ms)` from `pit_private.samples` filtered to `at<=v_enabled`, `due_at=v_enabled+v_mean` for new non-lift bots, and opening-jack/parallel cohort logic. If the hosted function differs, apply a reviewed additive migration; uploading a Netlify ZIP alone cannot fix old hosted SQL.

To build this patched source when dependencies are available: `npm ci && npm run build && npm run package`.
