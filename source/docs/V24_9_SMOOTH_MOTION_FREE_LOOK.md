# V24.9 — smooth motion and player free look

Crew movement now eases into and out of contact and standby poses. Wheel preparation, removal and fitting preserve velocity through updates instead of moving at a fixed speed and stopping abruptly. Grips remain attached to the actual wheel/tool. Gun socket rotation accumulates continuously rather than jumping to a wall-clock angle when it restarts.

Accepted human actions retain a 350–450 ms presentation interval, with bounded contact strokes and independent carrying/set-down follow-through. Batched lift/lower completions still show both poses. Physical axle movement drives the jack posture, handle and audio cues. These visual intervals do not change task eligibility, bot reference timing, event timestamps or scoring.

The live scene uses one monotonic clock for body, wheel, tool and camera motion. Eco mode allows 60 Hz rendering; High mode follows display refresh up to 144 Hz. Actual frame rate depends on the device. Reduced-motion mode retains its 30 Hz limit.

First-person and third-person cameras now use a damped follow anchor and a player-controlled world heading. Animated head/shoulder turns no longer steer the view, and overview OrbitControls no longer update the follow cameras.

| Camera | Mouse / touch | Keyboard |
| --- | --- | --- |
| First person | Drag or swipe to look around | Arrow keys look around |
| Third person | Drag or swipe to orbit 360°; wheel or pinch to zoom | Arrow keys orbit; + / - zoom |
| Overview | Existing orbit and zoom | Existing controls |

Home or Re-center returns to Overview. Pitch and zoom limits keep the follow camera above the floor and outside the actor. Dragging or pinching does not select crew accidentally. Camera hints are shown above the mode buttons.

Validation includes targeted timing/audio/replay and animation suites; new tests for velocity continuity at 30/60/144 Hz, instant work, batched lift/lower and independent camera heading; native fast/slow scene checks, all 45 role/camera combinations and 8 wheel/departure regressions; real mouse, keyboard, wheel, touchscreen swipe and pinch events; and WebGL screenshots on desktop/mobile. Evidence is in `docs/v24-9-evidence/`. Body-clearance checks use sampled probes, not a full physics solver.

Run `npm ci`, `npm run dev` and the scripts `v24-9-browser-qa.mjs`, `v24-9-camera-input-qa.mjs` and `v24-9-visual-qa.mjs` from the source directory. Browser scripts require Playwright and Chromium (Edge on Windows) and expect localhost port 5173. Build with `npm run build`; package with `python scripts/package_v24_9.py`.
