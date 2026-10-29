# PIT CREW V7 — Netlify + Supabase

Netlify hosts the game files. Supabase provides online rooms, player identity, authoritative timing, bots, and scores. Without configured Supabase settings, the app runs browser-only **Local Practice**.

## 1. Choose your setup

- **Upgrading the previous PIT CREW deployment:** reuse its Supabase project, Project URL, and public key. V7 keeps the existing backend SQL and multiplayer rules. **No database migration or score reset is needed.**
- **Starting a new project:** follow step 2 before configuring the game.

## 2. Prepare Supabase for a new installation

- Create a project at [supabase.com](https://supabase.com) and wait for it to finish initializing.
- Open **Authentication → Sign In / Providers** and enable **Anonymous Sign-Ins**. Each player browser gets its own identity.
- Open **SQL Editor → New query**.
- Copy the **entire** supplied `SUPABASE_SETUP.sql`, paste it, and run it using the project's administrative database access.
- Wait for **Success**. Resolve any SQL error before continuing.
- Copy the **Project URL** and **public anon key** or **Publishable key** from the project's API settings.

Supabase may warn about destructive operations or tables without RLS. The complete supplied script enables RLS itself, including a dynamic loop for private tables. Its policy replacement can trigger the destructive-operation warning. For this complete, unmodified script, **Run without RLS** lets the script apply its own RLS setup. Do not apply this guidance to unrelated or partial SQL.

Do not use a `service_role` key, Secret key, database password, or personal access token. All files deployed to Netlify are publicly readable.

## 3. Edit the runtime configuration

- Extract **`pit-stop-v7-netlify-ready.zip`**.
- Open the extracted **`config.js`** in a text editor.
- Enter your Project URL and public key, keeping the field names and quotes:

```js
window.PIT_CONFIG = {
  supabaseUrl: "https://YOUR_PROJECT.supabase.co",
  supabaseAnonKey: "YOUR_PUBLIC_ANON_OR_PUBLISHABLE_KEY"
};
```

- Save the file. No npm installation or rebuild is needed.
- For an upgrade, copy only these two public settings from the previous deployed `config.js`; the delivered template is intentionally blank.

If working from source, edit `public/config.js` before `npm run build`. A new build replaces `dist/config.js` with that template. You can also edit `dist/config.js` after building.

## 4. Upload to Netlify

- Open [Netlify Drop](https://app.netlify.com/drop) and sign in.
- Drag in the **extracted folder containing `index.html` directly**.
- Wait for deployment, then open the HTTPS link Netlify provides.
- When updating an existing Netlify site, upload to that site's **Deploys** page to keep its URL.

The uploaded folder should contain:

```text
index.html
config.js
_redirects
_headers
assets/
fonts/
ASSET_CREDITS.md
THIRD_PARTY_NOTICES.txt
```

For deployment from source through Git, use **Build command: `npm run build`** and **Publish directory: `dist`** with Node.js 22.12+ or a newer supported LTS release. Set the public runtime configuration in `public/config.js` before building.

## 5. Test the deployed game

- Confirm the site connects to Supabase. **Local Practice** means the public runtime settings are blank.
- Use at least **four real devices with separate sessions** on the same deployed site.
- On the first device, create a room. On three others, browse and join that room.
- Check unique roles, visible Host, gold **YOU** markers, and shared roster updates.
- Have everyone mark Ready, then let the host start the countdown.
- Complete a round; check the independent wheel branches, jack motions, audible feedback, final frozen time, and one leaderboard result.
- Open **Watch Live** on another laptop/projector. Check team overview, focus view, camera rotation, and fullscreen without adding a player seat.
- Start another team while observing; confirm both update without refreshing.
- Replay and verify that the same team's average includes both completed rounds.
- Check phone layout, drag rotation, pinch zoom, Chain/Crew drawers, and audio on the actual devices.

Local Practice is useful for checking presentation, but does not verify hosted Auth, Realtime, or cross-device gameplay. See `TEST_REPORT.md` for checks completed with this delivery.

## 6. Controls and sound

- Drag the scene to rotate; use the mouse wheel or two-finger pinch to zoom.
- Use **Reset View** to restore the starting camera.
- Click the contextual action button or press **Space** when your action is ready.
- Open **Chain** for dependencies and **Crew** for player details.
- Use the sound toggle and volume slider after your first interaction; also check browser/device volume.
- Use **Fullscreen** for projection. The spectator overview and focus view share the same game shell.

## Optional: global leaderboard administrator

A room host has room-only privileges. To allow a separate administrator to delete results:

- In Supabase **Authentication → Users**, create and confirm an email/password account.
- Copy its Auth user UUID.
- Run this in the trusted SQL Editor, replacing the placeholder:

```sql
insert into pit_private.admins (user_id)
values ('AUTH-USER-UUID'::uuid)
on conflict do nothing;
```

- In a separate browser profile/private window, open the game's Admin sign-in and use that account.
- Select the intended deletion scope and enter the exact confirmation **`DELETE`**. Deletion is audited and permanent.
- Keep admin passwords out of game files. The browser cannot add itself to the allowlist.

## Operational notes

- Keep a player or spectator page connected during rounds. Heartbeat requests and human commands reconcile persisted bot deadlines; this static deployment does not provide an independent always-on worker.
- The server's final result is authoritative. Network delay and background browser throttling can delay live visual updates.
- Waiting-room presence expires after **90 seconds** without heartbeat; the host transfers to the oldest remaining player when needed.
- A countdown/running player's identity remains reserved for reconnection. **Explicit Leave abandons that round**, saves no result, and returns the remaining team to readiness.
- Human actions arriving more than 120 seconds after becoming available are stale. Leave an incomplete attempt and ready the team again.
- Room names, nicknames, roles, progress, and scores are public. Use appropriate display names.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Local Practice appears | Both `config.js` fields are nonempty; verify the deployed `/config.js` and reload. |
| Cannot create/join a room | Anonymous Sign-Ins enabled; URL/key from the same project; full SQL setup succeeded. |
| Updates are stale | Project active; WebSocket reachable; `pit_public_state` belongs to `supabase_realtime` publication. |
| Permission/function error | Verify the full setup and RPC grants. Keep private-state restrictions intact. |
| Admin login cannot delete | Exact Auth UUID is in `pit_private.admins`; room hosting alone does not grant access. |
| Audio is silent | Interact with the game, enable sound, raise its volume slider, check browser/device mute. |
| 3D cannot render | Check WebGL/GPU support; the fallback task HUD remains available. |
| Netlify page is missing | Upload root contains `index.html`, `assets`, `fonts`, and `_redirects`. |

The client uses `public.pit_state()` snapshots and validated `public.pit_call(...)` commands. Public Realtime invalidations request fresh snapshots; they do not permit direct writes to private game tables.
