import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import type { PGlite } from '@electric-sql/pglite';
import type { Snapshot } from '../src/types';
import { createDatabase, owner, rpc, userId } from './helpers/database';
let db: PGlite;
beforeAll(async () => { db = await createDatabase('tests/fixtures/v7-schema.sql'); }, 30000);
afterAll(async () => { await db?.close(); });
describe('V7 → V8 additive upgrade and stable lobby', () => {
  it('applies twice and preserves an existing crew and its identity', async () => {
    const before = await rpc<Snapshot>(db, userId(1), 'create', null, { name: 'Keep Me', nickname: 'Host' });
    const id = before.rooms[0].id;
    await owner(db, `WITH r AS (INSERT INTO pit_private.rounds(room_id,status,go_at,finished_at,elapsed_ms) VALUES('${id}','COMPLETED',1000,3000,2000) RETURNING id) INSERT INTO pit_private.results(round_id,team_id,elapsed_ms,finished_at) SELECT r.id,rooms.team_id,2000,3000 FROM r,pit_private.rooms rooms WHERE rooms.id='${id}'`);
    const upgrade = await readFile('supabase/002_v8_stability.sql', 'utf8');
    await owner(db, upgrade); await owner(db, upgrade);
    const after = await rpc<Snapshot>(db, userId(1), null);
    expect(after.leaderboard[0].rounds[0].elapsedMs).toBe(2000);
    expect(after.rooms[0].id).toBe(id);
    expect(after.rooms[0].teamId).toBe(before.rooms[0].teamId);
    expect(after.identity.playerId).toBe(before.identity.playerId);
  });
  it('retains incumbent roles and Ready across joins and non-jack departure', async () => {
    const existing = await rpc<Snapshot>(db, userId(1), null);
    const initial = await rpc<Snapshot>(db, userId(1), 'ready', existing.rooms[0].id, { ready: true });
    const id = initial.rooms[0].id;
    const host = initial.rooms[0].players[0];
    const joined = await rpc<Snapshot>(db, userId(2), 'join', id, { nickname: 'Second' });
    expect(joined.rooms[0].players.find(p => p.id === host.id)).toMatchObject({ role: host.role, ready: true });
    // Make a non-jack seat deterministically; production choices remain random.
    await owner(db, `UPDATE pit_private.members SET role='FL_GUNNER' WHERE nickname='Second'`);
    const left = await rpc<Snapshot>(db, userId(2), 'leave', id);
    expect(left.rooms[0].players[0]).toMatchObject({ id: host.id, role: host.role, ready: true });
  });
  it('does not evict a player returning after two minutes on mobile', async () => {
    await owner(db, `UPDATE pit_private.members SET last_seen_at=last_seen_at-120000`);
    const snapshot = await rpc<Snapshot>(db, userId(1), 'heartbeat');
    expect(snapshot.rooms[0].players.some(p => p.id === snapshot.identity.playerId)).toBe(true);
  });
  it('reassigns only one remaining seat when the final human jack leaves', async () => {
    const state = await rpc<Snapshot>(db, userId(1), null); const id = state.rooms[0].id;
    await rpc(db, userId(2), 'join', id, { nickname: 'Second' });
    await rpc(db, userId(3), 'join', id, { nickname: 'Third' });
    await owner(db, `UPDATE pit_private.members SET role=CASE nickname WHEN 'Host' THEN 'FRONT_JACK' WHEN 'Second' THEN 'FL_GUNNER' ELSE 'FR_GUNNER' END, ready=true`);
    const before = await rpc<Snapshot>(db, null, null);
    const after = await rpc<Snapshot>(db, userId(1), 'leave', id);
    const survivors = after.rooms[0].players;
    const changed = survivors.filter(p => p.role !== before.rooms[0].players.find(old => old.id === p.id)!.role);
    expect(changed).toHaveLength(1); expect(changed[0].role).toMatch(/JACK/);
    expect(changed[0].ready).toBe(false); expect(changed[0].roleNotice).toBeTruthy();
    expect(survivors.filter(p => p.id !== changed[0].id).every(p => p.ready)).toBe(true);
  });
});
