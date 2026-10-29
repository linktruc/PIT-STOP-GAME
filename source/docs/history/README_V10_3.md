# Pit Stop. Simulator. — V10.3 + V10.4 clarification

An editable continuation of V9.1: an outdoor low-poly pit lane, a responsive global task ribbon, a branching 21-task board, compact replay/live views and persistent round events. The complete [V10.3 master spec](docs/v10-spec/Codex_Pit_Stop_Simulator_V10_3_Audited_Master_Spec_EN.txt) and [V10.4 override](docs/v10-spec/Codex_Pit_Stop_Simulator_V10_4_SupportCrew_Clarification_EN.txt) are retained in source. **V10.4 takes precedence** for support/background interpretation. V10.4 governs support placement: keep the existing playable crew choreography, restore the V8-style nose support positions and refine only the center-side support clearance. Uploaded racing photographs guide the environment; their logos, images and branded assets are not game assets.

Start with [V10_3_DEPLOY_GUIDE.md](V10_3_DEPLOY_GUIDE.md) for the complete short Vietnamese update guide. [V10_3_CHANGELOG.md](V10_3_CHANGELOG.md), [REFERENCE_IMPLEMENTATION_REPORT.md](REFERENCE_IMPLEMENTATION_REPORT.md) and [TEST_REPORT.md](TEST_REPORT.md) record changes, references, evidence and limits. Older reports and `docs/history/` describe earlier versions, not current acceptance. Full V10 evidence, including three V9 before captures, is included; bulky V8/V9 evidence folders remain in their original version ZIPs and are excluded from this delivery.

## Run and edit

Use Node.js **22.12+**, npm and Python 3.

```sh
npm ci
npm run dev
```

Open Vite's printed URL. Blank Supabase settings use local practice. Solo Test is a separate local, unranked mode with any of 15 roles; `enableSoloTest: false` hides/disables it. Neither mode connects several devices or writes public results.

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run package
npm run verify:packages
```

Packaging produces `artifacts/pit-stop-v10-3-source.zip`, `artifacts/pit-stop-v10-3-netlify.zip`, delivery documents, migration copies and `SHA256SUMS.json`. The Netlify ZIP has `index.html` at its root. Source includes editable app/backend/tests/docs and excludes installed dependencies, credentials and local QA output.

## Deploy

Update Supabase **before** the frontend using the version-specific sequence in the Vietnamese guide; uploading a static ZIP cannot run SQL migrations. Keep the current Supabase project to retain teams and scores. Fresh projects use the current complete `SUPABASE_SETUP.sql` once.

Extract the Netlify ZIP, edit its root `config.js`, then upload the folder containing `index.html` to the existing Netlify site's Deploys page. For Git deployments build with `npm run build` and publish `dist`.

```js
window.PIT_CONFIG = {
  supabaseUrl: "https://YOUR_PROJECT.supabase.co",
  supabaseAnonKey: "YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY",
  enableSoloTest: true
};
```

Only public publishable/anon credentials belong in this file. Configure the separately authenticated admin account in Supabase; never place an admin password, database password or service-role/secret key in the build. Public leaderboard viewing requires no admin login. The explicitly labeled `admin/1234` shortcut works only in unconfigured Local Practice, with memory-only local data and no Supabase destructive privileges. Online admin uses the private strong password.

## Rules and controls

Online teams contain 4–15 humans with stable roles and Ready state. Bots fill unassigned playable positions; visual support bots have no invented graph tasks. Four parallel wheel chains, front/rear lifts and lowers, then release form exactly 21 tasks. The server records `release − GO`; the leaderboard ranks each team's average of its completed rounds. The individual early-input lockout lasts two seconds and the team clock keeps running.

| Control | Action |
| --- | --- |
| Drag / pinch / wheel | Rotate or zoom the scene |
| Reset View | Restore the starting camera |
| Main action / Space | Attempt the current personal action |
| Workflow ribbon | Open the full branching task board |
| Role card | Open concise role instructions |
| Resume Team / Leave Team | Return to the saved seat / leave explicitly |
| Sound / volume | Unlock, mute and adjust original synthesized audio |
| Watch replay | View the recorded round; Play again starts a new round |

Audio requires a browser gesture and audible device volume. Spectating occupies no player seat. Returning to the menu retains membership; explicitly leaving an active round abandons it. Temporary disconnection preserves the existing reconnect policy; see the guide for heartbeat and timeout details.

## Source map

| Location | Purpose |
| --- | --- |
| `src/App.tsx`, `src/GamePanels.tsx` | Menus, player/spectator/replay presentation, help and admin |
| `src/ChainHUD.tsx`, `src/workflow.ts`, `src/chain.css` | Width-aware task ribbon and full DAG |
| `src/RoleCard.tsx`, `src/ActionControl.tsx` | Compact role information and input/penalty states |
| `src/PitScene.tsx`, `src/scene/` | Shared procedural pit lane, actors, contacts and task animation |
| `src/TeamPreviews.tsx` | Desktop previews of the same scene; mobile status cards |
| `src/engine.ts`, `src/solo.ts`, `src/api.ts`, `src/useGame.ts` | Local rules, unranked Solo, server transport and synchronization |
| `SUPABASE_SETUP.sql`, `supabase/` | Authoritative online state and additive upgrades |
| `tests/`, `scripts/`, `docs/` | Regression checks, browser/packaging tools and evidence |

See [ASSET_CREDITS.md](ASSET_CREDITS.md) and `THIRD_PARTY_NOTICES.txt` for original procedural assets and bundled font/software licenses. This fictional game has no affiliation with Formula 1, its teams or its drivers.
