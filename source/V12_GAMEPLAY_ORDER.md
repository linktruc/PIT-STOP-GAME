# V12 gameplay order update

**Requested simulated sequence:** Loosen wheel nuts → Lift car → Remove old wheels → Fit new wheels → Lower car → Tighten wheel nuts → Release car.

- These are grouped *display* stages, not one global serial queue. All four wheel corners remain independent. Each axle lifts after its two nuts are loosened; each axle lowers after its two new wheels are fitted; that axle's two nuts can then be tightened.
- All 21 task IDs, role names, multiplayer synchronization, bot averaging, replay timestamps, penalty and ranking rules are retained.
- Multiplayer now reserves at least one real wheel gunner to provide the first reaction sample. The opener's parallel bot gunners complete with the human gunner. Previously a human jack was required; this is replaced by the gunner requirement.
- Solo Test still supports all 15 role choices. If the selected Solo role is not an opening gunner, only that local unranked mode uses the original 400 ms bootstrap speed for opening bots until a real response exists.
- A new `supabase/005_nuts_before_lift_lower_before_tighten.sql` migration applies the new rules to future rounds on an existing Supabase project. Do NOT run a full fresh setup over an upgraded project. Existing saved results/replays and the actual dependency graph of in-progress rounds remain intact. The server reconciler explicitly recognizes old opening-jack rounds to prevent a mid-round deadlock.
- For brand-new Supabase instances, `SUPABASE_SETUP.sql` / `supabase/001_pit_crew.sql` contain the new rules.
- The engine, grouped mini workflow, detailed DAG board, descriptions and authoritative SQL all use the new sequence.
- Running the legacy test suite unchanged will produce failures in tests that explicitly assert V11's former jack-first rules; the added `tests/v12-order.test.ts` covers the new rules. Revise those old version-specific expectations before claiming the entire historic suite is green.
- Build instructions on a computer with dependencies: `npm ci && npm run build`. The publish folder for Netlify is `dist/`. Apply migration 005 in Supabase SQL Editor separately from the frontend deployment.

This is the requested *gameplay simulation rule*, not a description of the standard real-world pit crew operating procedure.
