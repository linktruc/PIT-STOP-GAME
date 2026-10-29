# Additional owner requirements for the V11.3 continuation

These additions refine the merged V11.3 specification. Continue the existing working files and keep the current appearance and gameplay systems.

- Mobile: keep the role and action panels compact and as low as practical, with a small gap above the externally displayed Powered by Netlify badge. Do not return to the overly raised layout. Use dynamic viewport and safe-area constraints, including a protected fallback when external UI cannot be measured. Never remove or interfere with the badge.
- Desktop only: replace the horizontal mini workflow with a vertical left-side panel. Give task labels enough width, connect progress vertically, show surrounding tasks and preserve yellow/gold ownership highlighting and smooth updates. Mobile keeps its compact horizontal design.
- Desktop: show a compact live Event Log below the workflow, reusing existing authoritative event data and formatting. Display task, player/Bot, step time and team elapsed time, with recent rows, subtle entry motion and bounded internal scrolling.
- Keep role/action controls at the right or bottom-right of desktop and preserve the central interactive 3D scene. Avoid large decorative panels and duplicate labels.
- Finish remaining V11.3 gameplay, adaptive timing, choreography, real admin, spectator and regression work; visible UI alone is not behavioral proof.
- Validate 390×844, 430×932, 1366×768 and 1920×1080, plus different mobile heights and an accurately represented badge. Run existing relevant tests and build checks. Deliver editable source and a Netlify-ready ZIP.

Source: the owner's continuation messages and attached mobile/desktop screenshots in this session. The images are layout references, not replacement scene assets.
