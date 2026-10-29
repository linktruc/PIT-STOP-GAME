# V17 visual layout corrections

- Procedural pit-lane floor arrows now use a single filled shaft plus triangular head pointing along the car's travel (-Z), not 3 intersecting bars.
- Result HUD never uses scroll/overflow for interaction buttons. Responsive shrink and flexible controls instead.
- Only mobile pre-round action console is compressed; in-round buttons and mobile badge clearance remain intact.
- Mobile detailed workflow permits two-line names instead of ellipsis/cropping.
- Mini-workflow preserves all 7 phase nodes while its viewport slides horizontally on phones and vertically on desktops; no remounting on completion. Total 0/21 progress remains independent of these grouped phases.
- No Supabase/SQL or timer, bot, camera, animation-event logic modified.
- Verify in browser at mobile 375x667, 390x844, and desktops 750x650, 1024x768, 1440x900. Run npm ci && npm run build locally.
