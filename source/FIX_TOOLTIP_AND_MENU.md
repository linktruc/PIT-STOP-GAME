V11.4 focused repair
- Crew selection now displays a persistent top-layer name/role card, synchronized with the 3D ring.
- Main menu no longer scrolls; responsive sizing shrinks menu content where needed.
- Scene-only diagnostics generating large JSON data each render are gated behind ?sceneDebug.
- Live task timeline, game timers, Supabase, solo mode and all animations are unchanged.
- Netlify bundle patched directly since offline Vite dependencies are unavailable; run normal build from source when possible.
