# V15 – Workflow / Event Log / UI corrections

- Uses V14 as the base and keeps its first-five-distinct role family priority.
- Restores the original **Lift → Loosen → Remove → Fit → Tighten → Lower → Release** dependencies for **new** rounds, in TypeScript and SQL. Existing rounds, scores and replay task graphs are untouched. First human is assigned a jack to seed adaptive bot timing. Assignments of existing waiting users are kept unless no jack is present.
- Solo-role dropdown options are shortened under their respective wheel labels.
- Mini and detailed workflows: local player red, locked gray, ready yellow, completed green check. Larger square state symbols replace dim circles.
- Event Log now includes all 21 detailed workflow tasks and their owners in a single centered dialog everywhere (Replay, Watch Live, Just Finished); each historical replay uses its own original recorded timing/status and prior task order.
- Reverses the 3D ground-arrowhead direction, removes the top-left no-team `PIT LANE 07` text, adds All Roles icon, shrinks desktop control dock at small desktop widths.

## Supabase deployment
On existing projects apply `supabase/008_restore_jack_first_priority.sql` **after** migrations 001–007. This does not delete historical results. Rebuild frontend separately with `npm ci && npm run build`; deploy the output of `dist/` to Netlify. If a source build isn't available, this source ZIP is **not** a Netlify deployment ZIP.

## Validation limits
Static TypeScript syntax and independent engine simulations were checked (1500 assignments, 4–15 player teams, all Solo roles). React/DOM tests are included but could not be executed here without npm dependencies. Real multiplayer SQL execution and visual browser QA still require a connected Supabase project and a browser/GPU test environment.
