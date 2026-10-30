# Current release: V24.13

See [cross-device cameras and room feedback notes](docs/V24_13_CROSS_DEVICE_ROOM_FEEDBACK.md). This release adds no SQL migration.

# Previous release: V24.12

See [camera, Watch Live, highlight and offline cleanup notes](docs/V24_12_CAMERAS_WATCH_PRESENCE.md). Apply `supabase/V24_12_OFFLINE_CLEANUP.sql` in Supabase SQL Editor once to expire offline memberships and schedule unattended cleanup.

# Previous release: V24.11

See [compact mobile HUD notes](docs/V24_11_COMPACT_MOBILE_HUD.md) for the smaller phone HUD and top-row camera switch.

# Current release: V24.10

See [multiplayer latency notes](docs/V24_10_MULTIPLAYER_ACTION_LATENCY.md) for direct action dispatch, realtime room updates and responsive action feedback. No SQL migration is required.

# Current release: V24.9

See [V24_9_SMOOTH_MOTION_FREE_LOOK.md](docs/V24_9_SMOOTH_MOTION_FREE_LOOK.md) for smooth motion, preserved fast actions and freely rotatable player cameras.

# Current release: V24.8

See [V24_8_GUNNER_CAMERAS.md](docs/V24_8_GUNNER_CAMERAS.md) for gunner contact strokes, reserved crew/tool lanes and the three player camera modes.

# Current release: V24.7

See [V24_7_WHEEL_CONTACT_AND_RELEASE.md](V24_7_WHEEL_CONTACT_AND_RELEASE.md) for contact-driven wheel handling, clear handler poses and stable fast release.

# Current release: V24.6

See [V24_6_WORK_SYNC_AND_CREW_TRANSITIONS.md](V24_6_WORK_SYNC_AND_CREW_TRANSITIONS.md) for all-role work readiness, quicker Rear Jack approach and continuous Gunner finish/lowering poses.

# Current release: V24.5

See [V24_5_FAST_ANIMATION_AND_CREW_COLOR.md](V24_5_FAST_ANIMATION_AND_CREW_COLOR.md) for faster animation, the Solo Gunner reference correction and 3D team uniforms.

# Current release: V24.4

See [V24_4_LIVE_AUDIO_SYNC.md](V24_4_LIVE_AUDIO_SYNC.md) for live audio/animation synchronization and validation. Replay and gameplay clocks are unchanged.

# Current release: V24.3

See [V24_3_OLD_WHEEL_PLACEMENT.md](V24_3_OLD_WHEEL_PLACEMENT.md) for the old-wheel carry/lower/release fix and build instructions.

# Current release: V24.2

See [V24_2_REVIEW_AND_FIX.md](V24_2_REVIEW_AND_FIX.md) for the review of V24.1, continuity fixes, validation and build instructions.

# Current release: V24

See [V24_CHANGES.md](V24_CHANGES.md) for tool grips, crew clearance, Solo timing, validation and deployment. No backend migration is required.

# Pit Stop. Simulator. — V11.4

A focused continuation of the current V11.3 source. [V11.4 release notes](V11_4_FIX_REPORT.md) cover menu spacing, restored contextual navigation and visible, functional all-role Solo selection. [Vietnamese update guide](V11_4_DEPLOY_GUIDE.md).

The retained V11.3 feature work began with the editable V10.3 game. The [merged V11.3 specification](docs/v11-spec/Codex_Pit_Stop_Simulator_V11_3_Merged_Master_Prompt_EN.txt) governs this release, including its final priority on gunner kneeling posture. The outdoor low-poly pit lane, multiplayer rules, 15 playable roles, 21-task DAG, recorded replays and public leaderboard remain the basis of the game. Racing photographs guide the environment; they do not replace the approved crew choreography.

The owner's [additional layout requirements](docs/v11-spec/OWNER_LAYOUT_CLARIFICATION.md) refine this same update: a compact horizontal mobile workflow, a left-side vertical desktop workflow with a live Event Log below it, and bottom controls above the external Netlify badge. The current implementation is continued in place; the center remains an interactive 3D scene.

Start with [V11_3_DEPLOY_GUIDE.md](V11_3_DEPLOY_GUIDE.md) for the complete Vietnamese update guide. [V11_FIX_REPORT.md](V11_FIX_REPORT.md) explains root causes and changed paths; [TEST_REPORT.md](TEST_REPORT.md) separates executed checks from deployment checks. New before/after proof belongs to `docs/v11-evidence/`. Earlier reports are retained in `docs/history/`; bulky earlier evidence remains in the original version archives and is excluded from this delivery.

## Run and edit

Use Node.js **22.12+**, npm and Python 3.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite. Blank Supabase settings **do not create multiplayer rooms**: Create/Join are unavailable until you supply the public Supabase URL/key. No fake teammates are added. Solo Test alone remains available offline and is always unranked; `enableSoloTest: false` hides/disables it.

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run package
npm run verify:packages
```

Packaging creates `artifacts/pit-stop-v11-4-source.zip`, `artifacts/pit-stop-v11-4-netlify.zip`, the current delivery documents, applicable SQL files and `SHA256SUMS.json`. The static ZIP has `index.html` directly at its root. Source includes editable code, tests, backend, documents and final new evidence; it excludes installed dependencies, credentials, temporary QA output, raw encoder frame sequences and duplicate intermediate videos.

## Deploy and authenticate

Keep the current Supabase project, runtime URL/public key, Auth users, admin UUID/alias and configured timeouts. Follow the guide's version-specific SQL sequence before replacing the frontend. A Netlify upload cannot run database migrations. Fresh projects use the current complete `SUPABASE_SETUP.sql` once.

Extract the Netlify ZIP, edit its root `config.js`, and upload the folder containing `index.html` to the existing site's Deploys page. For a Git deployment, build with `npm run build` and publish `dist`.

```js
window.PIT_CONFIG = {
  supabaseUrl: "https://YOUR_PROJECT.supabase.co",
  supabaseAnonKey: "YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY",
  enableSoloTest: true,
  hudHostingBadge: "netlify"
};
```

The mobile dock reserves a protected Netlify-badge zone even if platform UI cannot be inspected from the game document. Measurable badge bounds replace that fallback, so controls can use the lowest safe position; safe areas and a small clearance still apply. Keep `hudHostingBadge: "netlify"` on this Netlify deployment. Use `"none"` only on hosting with no external badge. The optional `hudOverlaySelector` identifies a custom visible wrapper; the game reads its bounds without changing the badge.

Only public publishable/anon credentials belong in this file. Never include an admin password, database password or secret/service-role key in a static build.

Administration always authenticates against Supabase Auth and verifies the private server allowlist. Open **Admin Access** from the main menu or leaderboard, enter the existing username alias and its actual current Auth password. Existing valid passwords are submitted to Supabase without a frontend length restriction. A strong private password is recommended; this update does not reset credentials. With no backend connection, the form explains that global administration requires Supabase. Viewing the leaderboard remains public. An online seat must be explicitly left before an Auth change. You can Leave Team first or acknowledge the Admin Access warning and choose **Leave Team & sign in**; an active attempt ends. Returning to the menu alone retains the seat. Sign-out also protects any remaining online membership.

## Rules and controls

Online teams contain 4–15 humans with stable roles and Ready state. Bots fill unassigned playable positions. Seven visual support actors do not add tasks. Front/rear lifts, four parallel wheel chains, both lowers and release form exactly 21 tasks. Official score is authoritative **release − GO**; the leaderboard ranks team averages of completed rounds. A premature input locks only that player's action for two seconds while the team clock continues.

| Control | Action |
| --- | --- |
| Drag / pinch / wheel | Rotate or zoom the scene |
| Main action / Space | Attempt the current personal action |
| Progress rail / desktop vertical workflow | Open the complete branching workflow |
| Role card | Open concise role instructions |
| Resume Team / Leave Team | Return to the saved seat / leave explicitly |
| Sound / volume | Unlock, mute and adjust procedural effects plus the quiet, gapless user-provided crowd ambience |
| Desktop Event Log / Event Log on a Watch Live card | Read actual events; card logs open without focus or replay |
| Replay | View the completed recording; Play again starts a new round |

Audio requires a browser gesture and audible device volume. Spectating occupies no player seat. Temporary disconnection retains the existing reconnect policy; explicit leaving during an active round abandons it. Heartbeat and lobby-grace details are in the deployment guide.

## Source map

| Location | Purpose |
| --- | --- |
| `src/App.tsx`, `src/GamePanels.tsx` | Player/observer menus, global admin form and HUD composition |
| `src/ChainHUD.tsx`, `src/workflow.ts`, `src/v11-desktop.css` | Horizontal mobile/vertical desktop workflow and truthful 21-task board |
| `src/RoleCard.tsx`, `src/ActionControl.tsx` | Role details, actions and penalty states |
| `src/PitScene.tsx`, `src/scene/` | Shared pit lane, actors, arrival, contacts and event playback |
| `src/TeamPreviews.tsx`, `src/ReplayEventLog.tsx`, `src/DesktopLiveLog.tsx`, `src/ReplayView.tsx` | Live cards, shared event rows, desktop log and recorded playback |
| `src/engine.ts`, `src/solo.ts`, `src/api.ts`, `src/useGame.ts` | Reference rules, unranked Solo, transport and synchronization |
| `SUPABASE_SETUP.sql`, `supabase/` | Authoritative online state and additive upgrades |
| `tests/`, `scripts/`, `docs/v11-evidence/` | Regression checks, acceptance tools and actual evidence |

See [ASSET_CREDITS.md](ASSET_CREDITS.md) and `THIRD_PARTY_NOTICES.txt` for procedural asset origins and bundled software/font licenses. This fictional game has no affiliation with Formula 1, its teams or drivers.
