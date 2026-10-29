# V10.3 reference implementation, governed by V10.4

The full [V10.3 master specification](docs/v10-spec/Codex_Pit_Stop_Simulator_V10_3_Audited_Master_Spec_EN.txt) and [V10.4 clarification](docs/v10-spec/Codex_Pit_Stop_Simulator_V10_4_SupportCrew_Clarification_EN.txt) are included for maintainers. V10.3 supplies the main scope. V10.4 overrides the earlier broad photographic crew-staging direction: the real F1 photos guide **environment/background, pit-box markings, lane context and arrival/departure**. They do not justify a rewrite of playable crew blocking, action poses or task-to-animation mapping.

The retained car, crew silhouettes, gold YOU/cyan selection, rigs and task-driven interactions originate in V9.1. Only nose support and center-side support receive the requested localized staging adjustments. All racing identity remains fictional. Uploaded photographs are reference material, not UI imagery, textures or included commercial assets.

## Photo-to-scene mapping

| Uploaded file | Environmental correspondence under V10.4 | Crew interpretation |
| --- | --- | --- |
| **IMG_1251.jpeg** | Yellow rectangular stop-box guides, concrete apron and paired overhead air booms. | Used to assess readable working space; existing playable roles remain staged as before. |
| **IMG_1247.jpeg** | Secondary reference for stop-box markings and the pair of overhead air booms. | No wholesale photo-based repositioning. |
| **IMG_1250.jpeg** | Outdoor apron/fast-lane separation, painted lane edges and high diagonal framing. | Existing task-driven poses retained. |
| **IMG_1252.jpeg** | High diagonal framing and the separated work apron beside a longer lane. | Existing wheel/jack staging retained. |
| **IMG_1253.jpeg** | Distant one-sided garage fronts, booms and low front-camera context. | Contact/clearance review only; middle support stays close with body outside the car. |
| **IMG_1248.jpeg** | Tarmac/equipment spacing and stored tires outside the driving lane. | No restaging of the main crew. |
| **IMG_1249.jpeg** | Open service area and stored equipment outside the lane. | V8-style front support placement is the explicit game reference, rather than a new photographic pose. |
| **IMG_1246.jpeg** | Longitudinal approach/exit direction, painted arrows and a clear driving corridor. | Retained retreat choreography must clear that corridor. |
| **IMG_1244.webp** | 158-unit surface/road depth, garage-front row, pit wall/fence, visible circuit, stands and fog depth. | Background reference only. |
| **IMG_1222.jpeg** | Low-poly indie style, contrast, readable silhouettes and material treatment. | Style only; its indoor location is not restored. |

Earlier game screenshots IMG_1242/IMG_1243 identify crowded HUD patterns to avoid. The actual legacy V7 `src/ChainHUD.tsx` from the attached archive is the source for the branching board's layout qualities, not for old multiplayer behavior or large below-board assignment lists.

## Localized support implementation

`src/scene/environment.ts` authors the new surroundings around the unchanged stop origin. `crew.ts` keeps the 15 playable actor positions and the three already acceptable outer ambient actors. Nose support moves back near V8: from V8 x=±1.62/z=−3.2 to x=±1.78/z=−3.45, with a small foot/front-wing allowance. Middle support is x=±1.37/z=0.19, close to the sidepods, with hands anchored near x=±0.9/y=0.71 rather than placing the torso inside the car. Clearance uses component chassis/wing/wheel footprints and body envelopes; hands may contact the car. This is a localized rig/placement adjustment, not a photo-driven restaging of the whole team.

## Acceptance boundary

The scene is authored as procedural geometry; no reference photo is pasted into the game. The intended correspondence is structural: an open work bay connects to a longer lane, markings establish the stop position and travel direction, and trackside props frame rather than enclose the car. Photos do not impose an exact real-team diorama or identifiable sponsor branding.

Actual V9 WebGL baseline captures are `docs/v10-evidence/before-v9-top.png`, `before-v9-diagonal.png` and `before-v9-front.png`. These are manually chosen camera approximations, not pixel-identical presets. V10 captures are `after-top.png`, `after-diagonal.png` and `after-front.png`; [comparison.html](docs/v10-evidence/comparison.html) places each next to its V9 baseline. The visible change removes the nearby indoor walls/cabinets and replaces them with a long concrete/asphalt work apron, painted lane direction and stop guides, open booms and distant garage fronts. Geometry timing/support diagnostics are in `scene-geometry-report.json`; that controlled software-WebGL harness is separate from online multi-device acceptance. The final evidence inventory and verified results are recorded in `V10_3_CHANGELOG.md` and `TEST_REPORT.md`; a source-code mapping alone is not evidence of a rendered visual match.
