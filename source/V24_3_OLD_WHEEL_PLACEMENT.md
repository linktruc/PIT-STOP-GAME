# V24.3 - Carry and set down the old wheel

The old tyre previously interpolated from the mechanic carry frame to a distant discard point during the final 18% of the task. The mechanic never walked to that point, and hand IK stopped before placement. This produced a flying/sliding tyre and no set-down action.

## Fix
- Dedicated approach, grip/extract, carry, lower and release phases for all four old-wheel handlers.
- The mechanic walks to a station adjacent to the old-wheel drop point. During carry the wheel stays in the actor-local carry frame and both hands grip its sidewalls.
- During lowering the mechanic bends over, lowers the tyre centre to its grounded 0.44 height, then smoothly releases and returns the empty hands to rest.
- The grounded wheel stays at the drop point even if the mechanic retreats or the car leaves.
- A minimum 1600ms physical removal interval gives the mechanic time to reach the hub before gripping it. Carry/lower/release continue as a visual follow-through after hub clearance. This does not add to official task time or score.
- New-wheel staff wait for the outgoing carrier to clear their shared corridor. Following visual receipts retain their full motion durations rather than being compressed into a near-instant animation. They may follow through after the official event time; official event timestamps and human/BOT reaction samples are unchanged.
- Two peripheral ambient crew stations moved slightly outward to leave room at the old-wheel drop stations.

## Verification
- 67 targeted tests passed, including phase order, all four corners, grounded coordinates, visual corridor clearance, official clock preservation, all 15 Solo roles, V23 human-Gunner synchronization and SQL, motion/pacing and replay.
- TypeScript, ESLint and the Vite production build passed.
- Continuous 10ms geometry sampling in five complete role scenarios: no large body jumps, no detected tool/body or tool/tool overlaps, maximum old-wheel displacement about 0.06 scene units per sample, old-wheel hand error below 0.000001 while held, and zero grounded-position error after placement. These sampled bounds are regression evidence, not an exhaustive proof for every timing.
- A real WebGL preview renders the carry/lower/release phases. The preview is not an FPS benchmark.
- Gameplay engine, Solo action implementation, API, runtime config and setup SQL match V24.2 byte-for-byte. The Solo 700ms fallback, adaptive reference, Event Log, Team Time and Step Time calculations remain unchanged.
- The existing V23 SQL test was made robust to either valid initial Jack assignment (Front or Rear), and submits the matching lift action. No SQL was edited.

## Build
npm ci
npm run build
python scripts/package_v24_3.py

Deploy the Netlify ZIP contents with index.html at the root. Configure public/config.js as usual; no backend migration is needed.

The previous V24/V24.1/V24.2 reports are retained as history. This report describes the new old-wheel choreography. Conservative geometry evidence is in docs/v24-3-evidence/old-wheel-motion.json.
