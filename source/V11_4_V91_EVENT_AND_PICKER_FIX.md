# V9.1 reference / live animation + actor selection

- V9.1 keeps one receipt per completed task. V11.4 live erroneously rebuilt the recorded timeline on each snapshot. This patch introduces persistent live receipts; Replay continues to use exact recorded timestamps.
- An animation is never replayed merely because React/Supabase delivered another identical snapshot. On joining a running round, past tasks are shown complete.
- Selection hitboxes widened; removes car/jack occlusion veto that rejected correct clicks beside the chassis. Keeps YOU highlight, shows nickname+role or Bot+Stabilizer/Front Wing Adjuster, click tooltip to close.
- Remove Local Practice remains intact. No SQL changes.
- Tests: use a real desktop WebGL browser to confirm no double animations and click selection; offline checks cannot guarantee GPU behavior.
