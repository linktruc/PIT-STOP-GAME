# V17 verification checklist

Automated checks available in this environment:
- TypeScript transpilation diagnostics for all edited .ts/.tsx files.
- CSS parse and balance check for V17 responsive overrides.
- Static assertion: old three-box arrow is removed, new arrow is one filled ShapeGeometry silhouette.
- Static assertion: result UI no-scroll rule overrides historic result overflow and max-height.
- Static assertion: mini ribbon always maps `flow.stream` with stable keys, rather than a sliced `flow.slots` DOM list.
- Static assertion: mobile pre-round CSS is scoped to `.action-console:has(.ready-status)`.

Manual visual checks REQUIRED before production rollout:
- 375x667, 390x844 and 430x932 iPhone screens: no clipped detailed nodes; pre-round still fully above Netlify badge.
- Desktop 700x650, 1024x768 and 1440x900: post-round buttons fully visible without internal scroll at all sizes.
- Play through all seven workflow phases with fast successive task completions: rail moves continuously sideways on phone / up on desktop; no blink/remount.
- Floor markings from game camera: one continuous shaft, triangular arrowhead points along travel.
- Confirm no regressions in 3D animation, multiplayer, role assignment or time calculation.

No SQL migration needed for these visual changes.
