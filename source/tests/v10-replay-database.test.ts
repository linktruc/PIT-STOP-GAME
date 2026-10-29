import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import type { PGlite } from '@electric-sql/pglite';
import type { ReplayRecord, Role, Room, Snapshot } from '../src/types';
import { clearDatabase, createDatabase, literal, owner, rpc, userId } from './helpers/database';

let db: PGlite;
const roles: Role[] = ['FRONT_JACK', 'FL_WHEEL_ON', 'FR_WHEEL_ON', 'RL_WHEEL_ON'];
async function start(database: PGlite, offset = 1): Promise<Room> {
  let state = await rpc<Snapshot>(database, userId(offset), 'create', null, { name: `Replay team ${offset}`, nickname: 'Alex', color: '#ef3344' });
  const id = state.rooms.find(room => room.hostId === state.identity.playerId)!.id;
  for (let i = 1; i < 4; i++) await rpc(database, userId(offset + i), 'join', id, { nickname: `Crew ${i}` });
  for (let i = 0; i < 4; i++) {
    await owner(database, `UPDATE pit_private.members SET role=${literal(roles[i])} WHERE room_id=${literal(id)}::uuid AND user_id=${literal(userId(offset + i))}::uuid`);
    await rpc(database, userId(offset + i), 'ready', id, { ready: true });
  }
  state = await rpc<Snapshot>(database, userId(offset), 'start', id);
  return state.rooms.find(room => room.id === id)!;
}
async function complete(database: PGlite, room: Room): Promise<ReplayRecord['round']> {
  const round = room.round!;
  const act = async (role: Role, task: string, elapsed: number) => owner(database,
    `SELECT pit_private.apply_action(${literal(round.id)}::uuid,${literal(room.players.find(player => player.role === role)!.id)}::uuid,${literal(task)},${round.goAt + elapsed},${literal(task)})`);
  await act('FRONT_JACK', 'FRONT_LIFT', 400);
  await act('FL_WHEEL_ON', 'FL_WHEEL_ON', 1350);
  await act('FR_WHEEL_ON', 'FR_WHEEL_ON', 1400);
  await act('RL_WHEEL_ON', 'RL_WHEEL_ON', 1450);
  await act('FRONT_JACK', 'FRONT_LOWER', 1870);
  await owner(database, `SELECT pit_private.reconcile_round(${literal(round.id)}::uuid,${round.goAt + 9000})`);
  const state = await rpc<Snapshot>(database, null, null);
  return state.rooms.find(candidate => candidate.id === room.id)!.round!;
}
async function replay(database: PGlite, id: string): Promise<ReplayRecord> {
  const result = await database.exec(`RESET ROLE;SET ROLE anon;SELECT set_config('request.jwt.claim.sub','',false);SELECT public.pit_replay(${literal(id)}::uuid) AS replay`);
  return (result.at(-1)!.rows[0] as { replay: ReplayRecord }).replay;
}
beforeAll(async () => { db = await createDatabase(); }, 30000);
beforeEach(async () => { await clearDatabase(db); });
afterAll(async () => { await db?.close(); });

describe('V10 recorded event history and public replay permissions', () => {
  it('upgrades V9 twice without changing completed timings, names, lobby roles or Ready', async () => {
    const previous = await createDatabase('tests/fixtures/v9-schema.sql');
    try {
      const room = await start(previous);
      const before = await complete(previous, room);
      await rpc(previous, userId(1), 'replay', room.id);
      const lobby = await rpc<Snapshot>(previous, userId(1), 'ready', room.id, { ready: true });
      const sql = await readFile('supabase/004_v10_recorded_replays.sql', 'utf8');
      await owner(previous, sql); await owner(previous, sql);
      const after = await rpc<Snapshot>(previous, null, null);
      expect(after.rooms[0].players).toEqual(lobby.rooms[0].players);
      expect(after.leaderboard[0].rounds[0].elapsedMs).toBe(before.elapsedMs);
      expect(after.replays?.[0].roundId).toBe(before.id);
      const record = await replay(previous, before.id);
      expect(record.round.tasks).toEqual(before.tasks);
      expect(record.players.map(player => player.nickname)).toEqual(['Alex', 'Crew 1', 'Crew 2', 'Crew 3']);
      expect(record.round.events).toHaveLength(21);
      expect(record.round.events.every(event => typeof event.enabledAt === 'number')).toBe(true);
    } finally { await previous.close(); }
  }, 30000);

  it('records actual synchronized bot durations, immutable names/roles, and replay after Play again/closed room', async () => {
    const room = await start(db);
    const round = await complete(db, room);
    expect(round.elapsedMs).toBe(2114);
    const record = await replay(db, round.id);
    for (const event of record.round.events) {
      const task = record.round.tasks.find(item => item.id === event.taskId)!;
      expect(event.enabledAt).toBe(task.enabledAt);
      expect(event.ownerId).toBe(task.ownerId);
      expect(event.role).toBe(task.role);
      expect(event.at).toBe(task.completedAt);
      expect(event.at - event.enabledAt!).toBeGreaterThanOrEqual(0);
      expect(event.at - record.round.goAt).toBeLessThanOrEqual(2114);
    }
    const capped = record.round.tasks.find(task => task.id === 'RR_WHEEL_ON')!;
    expect(capped.baselineMeanMs).toBe(400);
    expect(capped.completedAt! - capped.enabledAt!).toBe(250);
    expect(record.round.events.find(event => event.taskId === 'RR_WHEEL_ON')!.reason).toBe('PARALLEL_HUMAN_CAP');
    const lift = record.round.events.find(event => event.taskId === 'FRONT_LIFT')!;
    expect(lift.nickname).toBe('Alex'); expect(lift.role).toBe('FRONT_JACK');
    await rpc(db, userId(1), 'replay', room.id);
    await owner(db, `UPDATE pit_private.members SET nickname='Later name',role='RELEASE_CONTROLLER' WHERE id=${literal(room.players[0].id)}::uuid;UPDATE pit_private.teams SET name='Later team name',color='#123456' WHERE id=${literal(room.teamId)}::uuid;UPDATE pit_private.rooms SET status='CLOSED' WHERE id=${literal(room.id)}::uuid`);
    const reloaded = await replay(db, round.id);
    expect(reloaded).toEqual(record);
    const publicState = await rpc<Snapshot>(db, null, null);
    expect(publicState.rooms).toEqual([]);
    expect(publicState.replays?.[0].roundId).toBe(round.id);
    expect(JSON.stringify(reloaded)).not.toContain(userId(1));
    expect(JSON.stringify(reloaded)).not.toMatch(/email|user_id|requestId|earlyRequests/);
  });

  it('exposes only retained completed results; private tables/helpers and active round replay remain denied', async () => {
    const room = await start(db);
    await expect(replay(db, room.round!.id)).rejects.toThrow('no longer available');
    for (const sql of ['SELECT * FROM pit_private.rounds', 'SELECT * FROM pit_private.events', `SELECT pit_private.round_snapshot(${literal(room.round!.id)}::uuid)`]) {
      await expect(db.exec(`RESET ROLE;SET ROLE anon;${sql}`)).rejects.toThrow();
    }
    const snapshot = await rpc<Snapshot>(db, null, null);
    expect(snapshot.identity.playerId).toBeNull();
    expect(snapshot.rooms[0].players).toHaveLength(4);
    expect(snapshot.replays).toEqual([]);
  });

  it('accepts stale early-action intent after authoritative unlock without penalty, once', async () => {
    const room = await start(db); const round = room.round!;
    const player = room.players.find(member => member.role === 'FRONT_JACK')!;
    await owner(db, `SELECT pit_private.apply_early_action(${literal(round.id)}::uuid,${literal(player.id)}::uuid,'FRONT_LIFT',${round.goAt + 400},'stale-lock')`);
    await owner(db, `SELECT pit_private.apply_early_action(${literal(round.id)}::uuid,${literal(player.id)}::uuid,'FRONT_LIFT',${round.goAt + 401},'stale-lock')`);
    const current = (await rpc<Snapshot>(db, null, null)).rooms[0].round!;
    expect(current.tasks.find(task => task.id === 'FRONT_LIFT')!.completedAt).toBe(round.goAt + 400);
    expect(current.penalties?.[player.id]).toBeUndefined();
    expect(current.events.filter(event => event.taskId === 'FRONT_LIFT')).toHaveLength(1);
  });

  it('captures a real two-second personal lockout in unlock-to-input Step Time and elapsed Team Time', async () => {
    const room = await start(db); const round = room.round!;
    const player = room.players.find(member => member.role === 'FRONT_JACK')!;
    const early = (at: number, token: string) => owner(db, `SELECT pit_private.apply_early_action(${literal(round.id)}::uuid,${literal(player.id)}::uuid,'FRONT_LIFT',${at},${literal(token)})`);
    await early(round.goAt - 500, 'premature');
    await early(round.goAt + 100, 'during-lock');
    await expect(owner(db, `SELECT pit_private.apply_action(${literal(round.id)}::uuid,${literal(player.id)}::uuid,'FRONT_LIFT',${round.goAt + 1999},'valid-input')`)).rejects.toThrow('lockout');
    await owner(db, `SELECT pit_private.apply_action(${literal(round.id)}::uuid,${literal(player.id)}::uuid,'FRONT_LIFT',${round.goAt + 2000},'valid-input')`);
    const current = (await rpc<Snapshot>(db, null, null)).rooms[0].round!;
    const event = current.events.find(item => item.taskId === 'FRONT_LIFT')!;
    expect(event.enabledAt).toBe(round.goAt);
    expect(event.at - event.enabledAt!).toBe(2000);
    expect(event.at - current.goAt).toBe(2000);
    expect(current.penalties![player.id].until).toBe(round.goAt + 2000);
  });
});

describe('authorized result/replay/Just Finished deletion is atomic', () => {
  it('repairs only the missing human jack when clearing a completed room that lost its jack', async () => {
    const room = await start(db); await complete(db, room);
    await rpc(db, userId(1), 'leave', room.id);
    const finished = (await rpc<Snapshot>(db, null, null)).rooms[0];
    expect(finished.status).toBe('COMPLETED');
    expect(finished.players.some(player => player.role.endsWith('_JACK'))).toBe(false);
    await owner(db, `INSERT INTO pit_private.admins(user_id) VALUES(${literal(userId(999))}::uuid)`);
    const state = await rpc<Snapshot>(db, userId(999), 'admin_delete', null, { teamId: room.teamId, confirm: 'DELETE' });
    const waiting = state.rooms[0];
    expect(waiting.status).toBe('WAITING'); expect(waiting.round).toBeNull();
    expect(waiting.players.filter(player => player.role.endsWith('_JACK'))).toHaveLength(1);
    expect(waiting.players.filter(player => player.role !== finished.players.find(before => before.id === player.id)!.role)).toHaveLength(1);
    expect(waiting.players.every(player => !player.ready)).toBe(true);
  });

  it('deletes one round, then a team, then all results without disturbing unrelated data or audit', async () => {
    const first = await start(db); await complete(db, first);
    await rpc(db, userId(1), 'replay', first.id);
    for (let i = 0; i < 4; i++) await rpc(db, userId(i + 1), 'ready', first.id, { ready: true });
    const second = (await rpc<Snapshot>(db, userId(1), 'start', first.id)).rooms.find(room => room.id === first.id)!;
    // The stable roster retains the four controlled roles on Play again.
    await complete(db, second);
    const other = await start(db, 101); await complete(db, other);
    let snapshot = await rpc<Snapshot>(db, null, null);
    expect(snapshot.replays).toHaveLength(3);
    const resultId = snapshot.leaderboard.find(entry => entry.teamId === first.teamId)!.rounds.find(result => result.roundId === first.round!.id)!.id;
    await expect(rpc(db, userId(1), 'admin_delete', null, { resultId, confirm: 'DELETE' })).rejects.toThrow('administrator');
    await owner(db, `INSERT INTO pit_private.admins(user_id) VALUES(${literal(userId(999))}::uuid)`);
    snapshot = await rpc<Snapshot>(db, userId(999), 'admin_delete', null, { resultId, confirm: 'DELETE' });
    expect(snapshot.replays).toHaveLength(2);
    expect(snapshot.rooms.find(room => room.id === first.id)!.round!.id).toBe(second.round!.id);
    await expect(replay(db, first.round!.id)).rejects.toThrow('no longer available');
    snapshot = await rpc<Snapshot>(db, userId(999), 'admin_delete', null, { teamId: first.teamId, confirm: 'DELETE' });
    expect(snapshot.replays?.map(record => record.teamId)).toEqual([other.teamId]);
    expect(snapshot.rooms.find(room => room.id === first.id)!.round).toBeNull();
    expect(snapshot.rooms.find(room => room.id === first.id)!.status).toBe('WAITING');
    expect(snapshot.rooms.find(room => room.id === first.id)!.players.every(player => !player.ready)).toBe(true);
    expect((await replay(db, other.round!.id)).round.tasks).toHaveLength(21);
    const published = await db.exec('RESET ROLE;SET ROLE anon;SELECT state FROM public.pit_public_state');
    expect((published.at(-1)!.rows[0] as { state: Snapshot }).state.replays?.map(record => record.teamId)).toEqual([other.teamId]);
    snapshot = await rpc<Snapshot>(db, userId(999), 'admin_delete', null, { confirm: 'DELETE' });
    expect(snapshot.replays).toEqual([]); expect(snapshot.leaderboard).toEqual([]);
    expect(snapshot.rooms.every(room => room.round === null)).toBe(true);
    for (const table of ['rounds', 'tasks', 'samples', 'events', 'requests', 'early_requests', 'penalties', 'results']) {
      expect((await owner<{ count: number }>(db, `SELECT count(*)::int count FROM pit_private.${table}`))[0].count).toBe(0);
    }
    expect((await owner<{ count: number }>(db, 'SELECT count(*)::int count FROM pit_private.audit'))[0].count).toBe(3);
    expect((await rpc<Snapshot>(db, null, null)).replays).toEqual([]);
  });
});
