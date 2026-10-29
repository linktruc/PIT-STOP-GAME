# V24.10 — multiplayer action latency

Player action requests used to wait in the same promise queue as background reads/heartbeats. Realtime notifications then triggered another state RPC on each client, adding a debounce and another network/database round trip to every handoff.

Actions now dispatch independently of background reads. Committed realtime rows update the room directly while retaining the current session's private identity and calibrated clock offset. A server-confirmed task completion releases the pending action even when its original RPC response is still in transit. Request IDs remain stable, stale snapshots cannot rewind work, and a late response cannot clear a newer request's pending state.

The button immediately displays ACTION SENT and the press cue plays locally. It keeps the same action protected against duplicate submissions until authoritative confirmation. Task completion, dependent unlocks, penalties, timestamps and scores remain server-controlled. Fallback polling and session recovery are retained. No SQL migration is required.

Validation: 48 API/client/Solo/reference regression tests; TypeScript and ESLint; a browser test holding a background read open, submitting an action, delivering realtime confirmation before the RPC reply, submitting the next unlocked action, rejecting the old RPC and returning a stale read. The test verifies no optimistic completion/unlock, no spinner, preserved clock calibration and no rollback or duplicate submission. Evidence is in `docs/v24-10-evidence/action-transport.json`.

The browser transport test uses controlled delayed responses; its dispatch measurement is client-side and is not a live Supabase round-trip benchmark. These changes remove avoidable client waiting and repeated read RPCs. Actual Internet latency and Supabase transaction processing still affect multiplayer. The database currently serializes global mutations; this release does not claim to remove that server-side constraint.

Rebuild with `npm ci` and `npm run build`. Package with `python scripts/package_v24_10.py`. The browser transport check uses Playwright and localhost port 5173. Publish the new build when testing: a Netlify deploy-specific invitation URL continues to serve that particular deployment.
