# Pit Stop. Simulator. V11.3 — Asset credits and licensing

PIT CREW uses a fictional racing identity. No official Formula 1 logo, team mark, driver likeness, broadcast footage, soundtrack, radio recording, or third-party 3D model is supplied.

## Original application assets

- The procedural outdoor pit lane and retained formula-style car, tyres, jacks, tools, pit signal, low-poly crew characters, floor markings, fictional signage, and environment dressing are built in code from procedural Three.js geometry and materials. No downloaded mesh or texture pack is required.
- Crew motion, axle lifting/lowering, wheel removal/fitting, gun operation, release, player highlights, and scene effects are original application code driven by game state.
- Task sounds and UI feedback use original Web Audio oscillator/noise envelopes. V20 background ambience is a separately credited user-supplied racetrack crowd recording, not part of the synthetic SFX. No new voice imitation or music is generated.
- The application title, interface layout, and CSS artwork are original to this package. Locally bundled typefaces provide the display, interface, and telemetry text, with system font fallbacks.

These descriptions identify the origin of the supplied assets; they do not grant rights in any real racing organization's branding.

The uploaded real-world pit-stop photographs guide outdoor pit-lane surfaces, markings, booms, lane depth and trackside atmosphere. The V11.3 specification retains that environment-only interpretation and asks only for focused support and gunner corrections. The earlier low-poly reference guides style only. Reference photographs and their branded text, logos, models and textures are not copied into the public application or distributed as game assets. All in-game team identity is fictional. See `REFERENCE_IMPLEMENTATION_REPORT.md` for the current reference boundary and historical mapping location.

## Bundled typefaces

The unmodified Latin WOFF2 files below are bundled in `public/fonts/` and copied to `/fonts/` in the static build. No font service request or external hotlink is required at runtime.

| Typeface | Copyright | Source | License |
| --- | --- | --- | --- |
| Barlow (400–800) | © 2017 The Barlow Project Authors | [Google Fonts / Barlow](https://github.com/google/fonts/tree/main/ofl/barlow) | SIL Open Font License 1.1 |
| Barlow Condensed (500–800) | © 2017 The Barlow Project Authors | [Google Fonts / Barlow Condensed](https://github.com/google/fonts/tree/main/ofl/barlowcondensed) | SIL Open Font License 1.1 |
| IBM Plex Mono (400–600) | © 2017 IBM Corp., Reserved Font Name “Plex” | [Google Fonts / IBM Plex Mono](https://github.com/google/fonts/tree/main/ofl/ibmplexmono) | SIL Open Font License 1.1 |

The full copyright and license notices are included as `public/fonts/Barlow-OFL.txt`, `public/fonts/BarlowCondensed-OFL.txt`, and `public/fonts/IBMPlexMono-OFL.txt`. Preserve these notices with the font files. Font binaries were retrieved from Google Fonts' `fonts.gstatic.com` distribution; their original SIL licenses apply.

## Open-source software

Dependency license declarations and upstream notices remain applicable. The versions and declarations below were checked against the installed packages and `package-lock.json`. Full installed runtime license/copyright texts are included in `THIRD_PARTY_NOTICES.txt`, including transitive runtime dependencies and Vite's build-helper notices. Keep that file with the static distribution.

| Package | Installed version | Use | License |
| --- | --- | --- | --- |
| `react`, `react-dom` | 19.3.1 | User interface | MIT |
| `three` | 0.180.0 | Procedural 3D rendering | MIT |
| `lucide-react` | 0.468.0 | Interface icons | ISC |
| `@supabase/supabase-js` | 2.118.0 | Supabase Auth, RPC, and Realtime client | MIT |
| `vite` | 7.3.7 | Static frontend build and local server | MIT |
| `vitest` | 3.2.7 | Automated test runner | MIT |
| `typescript` | 5.9.3 | Static type checking | Apache-2.0 |
| `@electric-sql/pglite` | 0.3.16 | Local PostgreSQL-compatible database test harness | Apache-2.0 |

Additional production dependencies retained in the notice file are `@supabase/auth-js`, `@supabase/functions-js`, `@supabase/postgrest-js`, `@supabase/realtime-js`, and `@supabase/storage-js` (2.118.0, MIT); `@supabase/phoenix` (0.4.5, MIT); `iceberg-js` (0.8.1, MIT); `scheduler` (0.28.0, MIT); and `tslib` (2.8.1, 0BSD). Lucide's supplied notice also credits portions originating in Feather under MIT.

The table covers primary direct dependencies, not every development-tool transitive package. Build/test tools are installed from the lockfile for source development; their original installed license files remain applicable. Retain package license files and notices when distributing dependency code. Supabase and Netlify are separately operated services with their own service terms; their inclusion in the deployment instructions does not imply affiliation or a license to their trademarks.

No external asset hotlink is required: the user-supplied crowd ambience is bundled locally. Publication rights for this recording should be checked by the owner. Online multiplayer still requires requests to the configured Supabase service.

### V20 crowd ambience (user-supplied recording)

`public/audio/pit-crowd-loop.wav` is a loop-edited version of the MP3 supplied in this conversation, titled
"Crowd Cheering For Leclerc On The Last Lap Of The Australian GP - Nuhadracingcar.mp3".
The edit crossfades the beginning and end into a continuous, 11.694-second, 32 kHz stereo PCM loop.
It plays on a quiet ambience bus through the Web Audio API with sample-accurate looping;
procedural wheel-gun/jack/task sounds remain separate.
**Public use rights for this recording have not been verified.** The project owner should confirm
permission/license before publishing the sound in a public website, or replace it with a licensed recording.
