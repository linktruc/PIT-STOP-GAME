# V24.13: cross-device cameras and room feedback

Camera input is selected by pointer type, so a phone/tablet touch gesture and desktop mouse drag can use different directions even at the same viewport size. Relative to V24.12:

| Camera | Mouse drag | Touch swipe |
| --- | --- | --- |
| First person | Retained | Both axes reversed |
| Third person | Both axes reversed | Vertical axis reversed; horizontal retained |

Arrow keys, wheel zoom and two-finger pinch keep their behavior.

Lockout now adds red emission to the affected crew member's suit/helmet in addition to the existing floor ring and countdown label. The countdown follows the animated head height, including kneeling. Every viewer renders these states from the room's public penalty map, regardless of the viewer's player ID or camera. The material returns to the normal selection/YOU appearance as soon as the penalty expires. Gray support uniforms remain unchanged.

The previous 2.5-second active fallback poll could miss another player's entire 2-second lockout if Realtime was unavailable or delayed. Active online rooms now use a 1,000-1,200 ms fallback, shortened to 650-800 ms when the subscription is disconnected. The leader's due-time scheduler is bounded to 1,000/650 ms respectively. Realtime updates remain immediate and reset the fallback timer. Retry backoff, hidden-tab presence and Solo scheduling retain their policies. Official penalty duration and timestamps are unchanged.

Existing teammates receive a notice when new player IDs join their room. Initial room loads, Ready changes and reconnects with the same seat do not replay join notices. When ownership changes, the new host receives “You are now the host”; other teammates see the new host's name. Join, host and role changes arriving together are combined rather than overwriting one another.

The multiplayer Ready box and completed-result box display a small persistent host/permission line. Hosts see “You are the host.” Other members see “Only the host can start the round.” or “Only the host can choose Play again.” The line also remains visible in compact phone layouts. Start/Play again remain host-only controls and still depend on server authorization.

This release adds no SQL migration. Existing five-minute offline cleanup requires the V24.12 migration if it has not yet been applied to Supabase. No hosted database is modified by building or uploading the static ZIP.

## Validation

65 selected unit/regression tests pass, covering all four swipe directions for both cameras and input types, room membership notices, simultaneous host/role changes, host permission text, transport health, multiplayer timing and Solo timing. TypeScript and ESLint checks pass.

`scripts/v24-13-browser-qa.mjs` passes 16 real mouse/touch directions and uses separate desktop/phone browser contexts connected to a local PostgreSQL engine through the real game RPC functions. Realtime delivery is deliberately disabled: a peer's lockout reached the desktop in 1.61 seconds and the phone in 1.71 seconds, within the unchanged two-second penalty. Both clients received join notices; departure/offline host transfer and Ready/Play again permissions passed. The headless fixture limits WebGL pixel count and frame rate to bound SwiftShader load while keeping CSS layout and game clocks real. Controlled result snapshots exercise the result UI; engine tests cover official timing. It does not enter a production room. Evidence is stored in `v24-13-evidence/`.

`scripts/v24-13-lockout-qa.mjs` separately checks the peer's red body/ring in all three camera modes at HIGH and ECO, verifies expiry and captures a frozen native WebGL frame so the two-second label cannot expire while the screenshot is being read.

Run both scripts with Node 24, installed source dependencies and Playwright/Edge, while the dev server runs at port 5173. Build with `npm run build`; package with `python scripts/package_v24_13.py`.
