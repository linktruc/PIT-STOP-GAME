# Workflow grouping and pit-stop signal fix

Base: Pit_Stop_V11_4_Camera_Follow_Menu_NoScroll_Source.zip (camera and menu fixes preserved).

## Red / green lights
- `src/scene/garage.ts`: Both signal bulbs now use unlit, non-tone-mapped color materials so the green bulb cannot blow out to white due to emissive HDR exposure.
- While servicing: red lamp is bright; green lamp is dark.
- After release: green lamp is bright; red lamp is dark. Neither material emits additional white HDR light.
- The timing of the actual release event is unchanged.

## Grouped mini workflow
- `src/workflow.ts`: The 21 tasks are now mapped into **seven visual groups** only:
  1. Lift car — Front, Rear.
  2. Loosen wheel nuts — FL, FR, RL, RR.
  3. Remove old wheels — FL, FR, RL, RR.
  4. Fit new wheels — FL, FR, RL, RR.
  5. Tighten wheel nuts — FL, FR, RL, RR.
  6. Lower car — Front, Rear.
  7. Release car.
- Each mini marker retains its own completed/ready/blocked status. A group is marked done ONLY after all of its real tasks are done, while the continuous progress bar still counts 0–21 individual tasks.
- `src/ChainHUD.tsx`, `src/v11-workflow.css`: compact markers above each one-time group label in both mobile horizontal and desktop vertical workflow. Existing scene/HUD dimensions preserved.
- The detailed workflow remains the original 21-task dependency diagram with player names. No gameplay dependency, bot timing, lobby, animation, camera-follow, tooltip or leaderboard behavior was modified.

## Validation
- TypeScript source transpilation syntax checks passed for the changed TS/TSX files.
- An independent local test of the pure workflow logic confirmed 21 unique tasks grouped into seven phases; Front/Rear checkmarks update separately; individual wheel statuses remain independent; total task count remains correct.
- Updated existing workflow tests and added `tests/v11-workflow-groups.test.ts`.
- Browser GPU/visual tests and full npm/Vite build could not be run here because node dependencies were not installed and access to npm registry returned DNS errors.

## How to deploy
From this extracted editable source, run `npm ci`, `npm test`, `npm run build`, then deploy **contents of dist/** to Netlify. Do not deploy the source ZIP itself via Netlify Drop.
