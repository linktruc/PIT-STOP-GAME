# V11 choreography proof

Actual shared Three.js factory, with deterministic authoritative-clock seeks. The minimal `scripts/scene-qa.html` harness prevents an unrelated hidden main-menu renderer from consuming the software GPU. Frames come directly from the real WebGL framebuffer and are encoded with ffmpeg; the captures do not reconstruct poses independently.

- `report.json`: 24 gunner action/angle captures, 12 support captures, 11 actual slow/fast bot-cue observations, exit clearance, reverse-seek determinism, source-verified V8/V10/V11 nose coordinates and root causes.
- `gunners-loosen-handoff-tighten.mp4`: original four carrier routes, refined half-kneels, transient gunner handoff and return to tightening.
- `bot-4000-wait-then-work.mp4`: four-second measured wait, then event-timed work.
- `bot-250-wait-then-work.mp4`: short wait and corresponding event-timed work.
- `exit-clear.png`: all crew/jacks clear before the car completes departure.

Measured support contact error rounds to 0.000m in all close-up views. The minimum sampled gunner/carrier body-centreline distance is 0.658059m, above the 0.48m body-centreline separation threshold used by the check. Unit tests additionally sample both complete carrier routes at 1,001 phases, all corners and adjacent static crew.

V8 nose geometry was inspected in preserved source. V10 whole-scene before captures are retained in the parent evidence directory; this pass does not claim a new V8 close-up render. Software Chromium/WebGL was used, without a physical iPhone/GPU or production multi-device session. These clips prove presentation against actual full-round engine events, not a live production deployment.
