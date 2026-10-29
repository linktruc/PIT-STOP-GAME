# V24 - Tool grips, crew clearance and Solo reference

Based on V23 plus the 700ms Solo bootstrap update.

## Changes
- Front jack and its trolley stay together before arrival. Both jack operators hold the handle during countdown, work and retreat.
- Both gunner hands are solved against the actual rigid gun grips in all states. Reach constraints move the tool as one object; no detached gloves or floating gun.
- Wider carrier waiting positions, separate gunner handoff lanes, outward ambient stations, body clearance resolution and dedicated old-wheel drop locations.
- Jacks pull away from their axles during retreat before moving sideways, avoiding wheel handlers and the release controller.
- Solo Jack with no human Gunner: bot loosen jobs each take 700ms from their own enabledAt. They run in parallel. Only after a bot Gunner completes does the reference include ONE 700ms cohort observation: (Jack reaction + 700)/2. Subsequent human actions continue updating the reference. Bot observations are not inserted into human samples or counted four times.
- Scheduled Solo bot animation uses enabledAt through authoritative dueAt/completedAt; it adds no extra post-completion animation delay. AVAILABLE receipts never mark a bot done. Multiplayer animation and first-human-Gunner sync stay unchanged.
- A real human Gunner, including a mixed local test roster, retains V23 first-Gunner synchronization. Other Solo roles retain the 700ms bootstrap and adaptation to human observations.

## Verification
- 50 targeted engine, bot timing, V23 multiplayer SQL, choreography and replay tests passed.
- All 15 Solo roles complete a causal 21-event round in the added tests.
- 367 WebGL frames across Front/Rear Jack, FL/RR Gunner, Wheel Off, Wheel On and Release: zero detected tool/body contacts or tool/tool bounding-box overlaps. Maximum measured Jack/Gunner grip error below 0.000001 scene units.
- TypeScript build, ESLint and Vite production build passed.
- The unchanged legacy engine suite has five previously reproduced baseline assertion failures; two legacy scene tests also assert older animation durations/tap thresholds. These are outside this patch. The targeted current-version suites above pass.
- WebGL collision checks use conservative tool AABBs and body centre samples; they are a regression screen, not an exhaustive proof for every possible mixed-human timing.

## Build and deploy
npm ci
npm run build
python scripts/package_v24.py

Drop the contents of the Netlify ZIP onto Netlify (index.html is at the ZIP root).
The source ZIP contains editable sources, assets, tests and this report, without node_modules or dist.
No Supabase migration is required for this local Solo change. public/config.js retains the supplied empty Supabase connection fields; configure public Supabase URL and anon/publishable key for multiplayer as usual.
Historical V7-V23 documents remain as historical references; this file describes the current release.

## Browser regression check (optional)
Install Playwright separately if needed, start npm run dev, then run node scripts/v24_scene_check.mjs.
On Windows the script uses the installed Edge browser. Other platforms need Playwright Chromium installed.
Evidence is saved under docs/v24-evidence/.
