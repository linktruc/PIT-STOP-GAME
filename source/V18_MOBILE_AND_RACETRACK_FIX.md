# V18 mobile workflow + menu + racetrack audio fix

Base: V17 with V15 animation restored. No changes to engine, task durations, replay, SQL, actor motion or camera.

- Mini workflow: fixed 36px clipping by fitting icon / sublabels / task name in a 40px content track within the original 62px HUD.
- Mobile detailed DAG: both axle boards have a strict flexible row grid without minimum row heights that overflow the screen. Release and rear axle no longer overlap the previous section.
- Main menu: Resume explicitly shows player and team, Leave Team uses a clearly red destructive-style button.
- Audio: removed repeating band-pass ventilation white noise and periodic radio hiss from the ambience; replaced with two-tone filtered engine pass-bys, panning left/right. Wheel gun, jack and other gameplay sound effects remain unchanged. Synthetic, no copyrighted samples.

Validation completed:
- TypeScript syntax/transpilation on the three edited source files and the audio test: PASS.
- Mobile detailed-layout browser mock, at 375x667 / 390x844 / 430x932: front and rear boards do not intersect, and release starts below rear lower jack.
- Mini ribbon browser mock, at 375 / 390 / 430 widths: task title bottoms stay within the rail viewport, without increasing overall 62px HUD height.
- Web Audio fake browser context: enabling sound, pass-by generation, task gun SFX and muting all work.
- Complete Vite build and real Three.js scene on a user's device: NOT verified; npm dependencies unavailable offline in this runtime.

Test at mobile and desktop sizes before publishing. Sound still requires browser interaction (existing audio unlock behavior). No SQL migration required.
