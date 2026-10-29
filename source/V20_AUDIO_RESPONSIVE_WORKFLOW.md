# V20 — Background ambience and mobile presentation

Base: V19; gameplay, task schedule, bot rules, Supabase SQL, camera, and original V15 character animation files unchanged.

## Audio
- Replaced the procedural passing-car ambient sound with the user-provided Australian GP crowd recording.
- A 2.25-second equal-power circular crossfade joins beginning/end into 11.694 s of 32-kHz stereo WAV PCM.
- Background source is decoded once and looped in Web Audio (`AudioBufferSourceNode.loop = true`), not restarted on an HTML audio `ended` event.
- Background bus volume is just 0.14 before master gain (the gun/jack/ready SFX stay on an independent bus).
- Muting invalidates pending async loads and stops all live sources. Playback begins only after the user allows audio.
- See ASSET_CREDITS.md concerning use rights for the user-supplied recording.

## Layout
- Phone portrait: reduces pre-round Role and Ready/Start vertical footprint while preserving 42-pixel control targets. Moves the stack toward the bottom with a lower bound respecting the actual hosting overlay and safe-area.
- Landscape under 560 CSS px high: mobile-first two-column menu, left compact workflow, and right gameplay control panel, even if a browser requests a desktop site / reports fine pointer.
- Detailed workflow portrait: narrows the 21 task nodes, increases spacing and elevates connector paths so dependencies remain visible between boxes.
- Detailed workflow landscape: two axle columns with flexible rows rather than fixed minimums that overlap the Lower/Release nodes in short viewports.

## Checks
- Chromium fixture: desktop wide/narrow/short, phone portrait and landscape, tablet portrait and landscape, menus/crew/replay all within viewport (27 variants).
- Detailed flow fixture: 375×667, 390×844, 430×932, 768×1024, 844×390 — all 21 nodes, no node collisions in simulated layout.
- WAV loop seam: first/last PCM sample exactly equal; duration 11.694 s.
- TypeScript syntactic transpilation: audio.ts, main.tsx, ChainHUD.tsx passed.
- Full Vite/3D multiplayer regression suite not run: npm cache lacks some dependencies. Audio runtime local-browser test was blocked from opening localhost in this environment; loop sample continuity and source-level checks passed.
