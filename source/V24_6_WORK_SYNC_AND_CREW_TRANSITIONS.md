# V24.6 - All-role work readiness and crew transitions

## Work clock and follow-through

The old presentation timeline queued later work behind an outgoing wheel carrier and enforced long removal intervals. The UI could therefore unlock tightening while the picture still showed removal. Every role now has an authoritative work phase on the same clock as Action eligibility. Lifting/lowering reaches the correct chassis height on the work deadline; the hub is clear for fitting, the replacement wheel is fitted when tightening unlocks, and release turns green on completion. A completed human input updates the work state immediately, with a short 120ms body/tool follow-through instead of holding the next operation.

Scheduled BOT gestures span their actual enabledAt-to-dueAt/completedAt interval, for Solo and multiplayer. Outgoing-wheel removal reaches the BOT deadline; the independent carry, lowering and release continue afterwards. Human wheel handlers can prepare at the hub while awaiting input, then make a short pull/confirmation gesture. New-wheel crew prepare closer while the old-wheel crew works. Carry and retreat no longer postpone another operator's work. Late live snapshots retain body receipts, while work states immediately catch up with the UI. Replay uses the same work clock and task intervals. Scores, event logs, Step Time, Team Time and adaptive reference calculations are unchanged.

## Rear Jack and Gunner

Rear Jack waits at (-2.2, 4.03), outside the car's arriving left-hand envelope, removing the old six-metre detour after GO. The trolley follows the operator and both hands remain on its grip.

The Gunner body and gun share one timestamp-based stance, including preparation and held endpoints. A human Gunner prepares while Action is available and retracts over 180ms after completion, rather than starting a late work gesture. Scheduled BOT withdrawal reaches the planned work deadline. The final pose holds the gun low in body-local space. Waiting for DONE and subsequent car lowering preserve that pose; hands do not switch back to a wheel target. Gray support uniforms and the ten-color team palette are unchanged.

## Validation

110 targeted tests passed across 15 suites, including all 15 playable roles, the 36ms Gunner case, adaptive reference timing, work deadlines, delayed ACK handling, motion continuity, wheel carry, audio, Replay and actual multiplayer SQL. The new work-deadline tests verify that every predecessor is visually complete at each dependent task's enabledAt, without changing round data. In the 36ms Gunner case, old-wheel work ends at 2104ms and fitting ends at 2472ms; tightening is eligible at 2472ms while the old carrier is still walking to storage.

TypeScript, ESLint and the production build passed. Browser reports in docs/v24-6-evidence/ exercise actual Three meshes and hand IK with a stub renderer. Work-readiness checks cover all roles, including actual chassis heights, fitted hub meshes, release lamp and next-action prerequisites. Transition checks measure Rear Jack approach, gunner hand displacement and grip attachment. The optional real WebGL screenshot shows the final Gunner pose. These checks do not measure hardware FPS or output-device audio latency.

Build: npm run build; python scripts/package_v24_6.py. Optional Playwright checks: node scripts/v24_6_crew_check.mjs and node scripts/v24_6_readiness_check.mjs with the dev server running. No backend migration or connection configuration change is required.
