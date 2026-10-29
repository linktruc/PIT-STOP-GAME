# V14 — Unique role-family coverage before role repeats

**The first five arrivals:** 1 Jack, 1 Gunner, 1 Old Wheel Remover, 1 New Wheel Fitter, 1 Release Controller. First entrant is Jack so the restored lift-first graph always has at least one real opener; next four families are shuffled. All 15 actual positions remain unique.

**Arrivals 6–9:** Remaining 3 Gunner and 1 Jack slots in randomized order.

**Arrivals 10–15:** Remaining Old/New Wheel positions.

Roles already assigned in a waiting room stay stable when somebody joins/leaves; unchanged members do not lose Ready. On a legacy waiting room with no jack, only the first member is reassigned as the required opener. This rule governs assignments made after migration, not a forced reshuffle of historical rooms or running rounds. Bots fill unassigned task roles within the fixed 21-task chain; they never occupy human player slots or count as human reactions. Solo Test still supports selecting any of the 15 concrete roles.

## Database upgrade
Run `supabase/007_role_family_priority.sql` in Supabase SQL Editor **after** 005 and 006, for existing sites. This replaces `pit_private.assign_roles` only; it does not change results, replay history or the countdown lockout. Fresh installers can use `SUPABASE_SETUP.sql` (now includes this allocator) and then the sequence migrations as needed.

## Testing
`tests/v14-role-priority.test.ts` tries 100 seeds and validates each of the 15 prefix lengths. The existing tests still require an opening human gunner. Use additional live multiplayer joins/leaves to validate actual Supabase synchronization and server permissions.
