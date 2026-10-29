# V11.3 browser acceptance

Browser acceptance is separate from `npm test`. Current proof and exact executed commands are recorded in `docs/v11-evidence/`, `TEST_REPORT.md` and `V11_FIX_REPORT.md`. Use those reports to distinguish real local Solo actions, controlled snapshot/component fixtures, actual SQL/RPC tests and untested hosted transport.

Use Python Playwright with Chromium at `/usr/bin/chromium`; WebM recording also requires `ffmpeg`. Start `npm run dev -- --port 4190` for development-module fixtures. Start `npm run preview -- --port 4191` after `npm run build` for static-output smoke checks. Respect each script's documented URL/environment options. Run browser capture against a frozen source tree so Vite HMR cannot change module instances during a fixture.

The new acceptance checks cover mobile role/action placement with a simulated third-party badge, protected fallback when the badge cannot be inspected, changing viewport heights, a left-side vertical desktop workflow and live Event Log, a compact mobile rail and rapid snapshots, a single-screen 21-task board, direct card Event Log/Replay, backend-required global Admin Access, server-relative curved arrival, localized support/gunner poses and slow/fast bot timing versus playback. Required final layouts include 390×844, 430×932, 1366×768 and 1920×1080. Evidence must identify any controlled timestamp or synthetic-room setup.

Legacy `v8_*`, `v9_*` and `v10_*` scripts remain in source as historical tooling. Their old UI expectations and evidence paths are not current V11.3 acceptance and may need adaptation before being rerun against the new interface.

Software Chromium and placeholder safe areas/badges do not establish physical iPhone Safari address-bar/background behavior, device GPU FPS, audible speaker volume or hosted Supabase multi-device operation. Those remain deployment checks unless explicitly marked executed in the current report.
