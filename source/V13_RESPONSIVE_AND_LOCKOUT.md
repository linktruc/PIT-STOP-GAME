# V13 — Desktop responsive HUD + immediate early-tap lockout

- Desktop workflow and Event Log remain vertical on the left for browser window widths of **601px and up**, rather than switching to the phone's horizontal workflow at 1099px.
- Desktop HUD uses narrower width-scaled instruments and compact role/Ready/action controls below 1200px, keeping the center of the 3D scene free.
- At shorter browser heights, the vertical rail shows fewer milestones automatically (ResizeObserver / existing verticalRibbonCapacity); the Event Log retains internal scrolling, rather than overlapping other panels.
- Mobile layouts **600px and below** are unchanged, including Netlify badge clearance.
- A too-early action press now incurs a **2,000ms penalty starting at the server-observed press timestamp**, whether the round is in COUNTDOWN or RUNNING. The red-button countdown starts immediately. It is not postponed until GO.
- Solo and multiplayer reference engine updated, along with the existing canonical SQL baseline.
- For an **already deployed Supabase** database, run `supabase/006_immediate_countdown_lockout.sql` **after** migration 005. This replaces only `pit_private.apply_early_action`, without deleting rounds or results.
- Existing in-progress penalties retain their originally stored `until_ms`; only newly incurred penalties use the new formula.
- **Important:** No animation scheduler, camera behavior, task ordering, bot timings or player selection code changed in this patch.

- **Build limitation in this environment:** npm dependencies were not available offline, so full Vite build/browser tests have not been executed. Compile source with `npm ci && npm run build` on a machine with access to npm, then deploy the `dist` output.
