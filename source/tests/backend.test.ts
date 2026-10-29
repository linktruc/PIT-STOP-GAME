import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { PGlite } from '@electric-sql/pglite';
import type { Role, Room, Snapshot } from '../src/types';
import { clearDatabase, createDatabase, literal, owner, rpc, userId } from './helpers/database';

let db: PGlite;
const call = (user: string | null, op: string, room: string | null = null, payload: Record<string, unknown> = {}) =>
  rpc<Snapshot>(db, user, op, room, payload);
const state = (user: string | null = null) => rpc<Snapshot>(db, user, null);
const getRoom = (snapshot: Snapshot, id: string): Room => {
  const room = snapshot.rooms.find((candidate) => candidate.id === id);
  expect(room, 'room is visible in the public snapshot').toBeDefined();
  return room!;
};

async function lobby(count: number, offset = 1) {
  const users = Array.from({ length: count }, (_, index) => userId(offset + index));
  let snapshot = await call(users[0], 'create', null, { name: 'Apex Crew', nickname: 'Driver 1', color: '#ef4444' });
  const roomId = snapshot.rooms.find((room) => room.hostId === snapshot.identity.playerId)!.id;
  for (let index = 1; index < users.length; index++) {
    snapshot = await call(users[index], 'join', roomId, { nickname: `Driver ${index + 1}` });
  }
  return { users, roomId, snapshot, room: getRoom(snapshot, roomId) };
}

async function readyAll(users: string[], roomId: string) {
  let snapshot!: Snapshot;
  for (const user of users) snapshot = await call(user, 'ready', roomId, { ready: true });
  return snapshot;
}

async function started(count = 4, offset = 1) {
  const fixture = await lobby(count, offset);
  await readyAll(fixture.users, fixture.roomId);
  const snapshot = await call(fixture.users[0], 'start', fixture.roomId);
  return { ...fixture, snapshot, room: getRoom(snapshot, fixture.roomId) };
}

beforeAll(async () => { db = await createDatabase(); }, 30_000);
beforeEach(async () => { await clearDatabase(db); });
afterAll(async () => { await db?.close(); });

describe('production PostgreSQL RPC: room membership and authorization', () => {
  it('public spectators see every waiting room without consuming a seat or seeing auth UUIDs', async () => {
    const first = await lobby(4);
    const second = await lobby(4, 100);
    const snapshot = await state();
    expect(snapshot.identity).toEqual({ playerId: null, isAdmin: false });
    expect(snapshot.rooms.map((room) => room.id).sort()).toEqual([first.roomId, second.roomId].sort());
    expect(snapshot.rooms.every((room) => room.status === 'WAITING' && room.players.length === 4)).toBe(true);
    const serialized = JSON.stringify(snapshot);
    for (const user of [...first.users, ...second.users]) expect(serialized).not.toContain(user);
    expect(serialized).not.toMatch(/email|service_role|jwt|auth_user|user_id/i);
    await call(null, 'heartbeat');
    expect((await state()).rooms.map((room) => room.players.length)).toEqual([4, 4]);
  });

  it('creator occupies one player slot, is the host, and duplicate names keep distinct stable team identities', async () => {
    const first = await lobby(1);
    const second = await lobby(1, 100);
    expect(first.room.players).toHaveLength(1);
    expect(first.room.hostId).toBe(first.room.players[0].id);
    expect(first.room.players[0].id).not.toBe(first.users[0]);
    expect(first.room.teamId).not.toBe(second.room.teamId);
    expect(first.room.name).toBe(second.room.name);
    const heartbeat = await call(first.users[0], 'heartbeat', first.roomId);
    expect(getRoom(heartbeat, first.roomId).teamId).toBe(first.room.teamId);
  });

  it('requires a real authenticated player identity for every membership mutation', async () => {
    const { roomId } = await lobby(4);
    for (const [op, payload] of [
      ['create', { name: 'Anonymous attacker', nickname: 'Nobody' }],
      ['join', { nickname: 'Nobody' }], ['ready', { ready: true }], ['start', {}],
      ['action', { taskId: 'FRONT_LIFT', requestId: 'spoof' }],
      ['kick', { playerId: userId(1) }], ['leave', {}], ['replay', {}],
      ['admin_delete', { confirm: 'DELETE' }],
    ] as const) {
      await expect(call(null, op, roomId, payload)).rejects.toThrow();
    }
    expect(getRoom(await state(), roomId).players).toHaveLength(4);
  });

  it('rejects start with fewer than four members and with any unready member, then accepts all-ready four', async () => {
    const { users, roomId } = await lobby(3);
    await readyAll(users, roomId);
    await expect(call(users[0], 'start', roomId)).rejects.toThrow();
    const fourth = userId(4);
    await call(fourth, 'join', roomId, { nickname: 'Fourth' });
    await readyAll(users, roomId);
    await expect(call(users[0], 'start', roomId)).rejects.toThrow();
    await call(fourth, 'ready', roomId, { ready: true });
    const room = getRoom(await call(users[0], 'start', roomId), roomId);
    expect(room.status).toBe('COUNTDOWN');
    expect(room.round?.goAt).toBeGreaterThan(0);
    expect(room.round?.tasks).toHaveLength(21);
  });

  it('limits start and kick to this room host and removes a kicked player authority immediately', async () => {
    const { users, roomId, room } = await lobby(4);
    const outsider = userId(99);
    const kicked = room.players.find((player) => player.id !== room.hostId)!;
    const kickedUser = users[room.players.indexOf(kicked)];
    await readyAll(users, roomId);
    for (const user of [users[1], outsider]) {
      await expect(call(user, 'start', roomId)).rejects.toThrow();
      await expect(call(user, 'kick', roomId, { playerId: kicked.id })).rejects.toThrow();
    }
    const after = getRoom(await call(users[0], 'kick', roomId, { playerId: kicked.id }), roomId);
    expect(after.players).toHaveLength(3);
    expect(after.players.some((player) => player.id === kicked.id)).toBe(false);
    await expect(call(kickedUser, 'ready', roomId, { ready: true })).rejects.toThrow();
    await expect(call(kickedUser, 'action', roomId, { taskId: 'FRONT_LIFT', requestId: 'kicked' })).rejects.toThrow();
    await expect(call(outsider, 'ready', roomId, { ready: true })).rejects.toThrow();
  });

  it('transfers a departing lobby host to the oldest remaining member', async () => {
    const { users, roomId, room } = await lobby(5);
    const oldest = room.players.filter((player) => player.id !== room.hostId)
      .sort((a, b) => a.joinedAt - b.joinedAt || a.id.localeCompare(b.id))[0];
    const after = getRoom(await call(users[0], 'leave', roomId), roomId);
    expect(after.hostId).toBe(oldest.id);
    expect(after.players).toHaveLength(4);
    expect(after.players.some((player) => player.id === room.hostId)).toBe(false);
  });

  it('confines a host to their own room and prevents one authenticated identity from taking two seats', async () => {
    const first = await lobby(4);
    const second = await lobby(4, 100);
    await expect(call(first.users[0], 'kick', second.roomId, { playerId: second.room.players[1].id })).rejects.toThrow();
    await expect(call(first.users[0], 'kick', first.roomId, { playerId: second.room.players[1].id })).rejects.toThrow();
    await expect(call(first.users[0], 'start', second.roomId)).rejects.toThrow();
    await expect(call(first.users[0], 'ready', second.roomId, { ready: true, playerId: second.room.hostId })).rejects.toThrow();
    await expect(call(first.users[0], 'join', second.roomId, { nickname: 'Duplicated identity' })).rejects.toThrow();
    const reconnect = await call(first.users[0], 'join', first.roomId, { nickname: 'Reconnect' });
    expect(getRoom(reconnect, first.roomId).players).toHaveLength(4);
    expect(getRoom(reconnect, second.roomId).players).toHaveLength(4);
    expect(reconnect.identity.playerId).toBe(first.room.hostId);
  });

  it('keeps roster and roles locked through countdown', async () => {
    const { users, roomId, room } = await started();
    await expect(call(userId(99), 'join', roomId, { nickname: 'Late' })).rejects.toThrow();
    await expect(call(users[0], 'kick', roomId, { playerId: room.players[1].id })).rejects.toThrow();
    await expect(call(users[1], 'ready', roomId, { ready: false })).rejects.toThrow();
    await expect(call(users[0], 'action', roomId, { taskId: 'FRONT_LIFT', requestId: 'early' })).rejects.toThrow();
  });

  it('assigns exactly one distinct core role per human, with a human jack, for every team size 4–15', async () => {
    for (let count = 4; count <= 15; count++) {
      const { room } = await started(count, count * 100);
      const roles = room.players.map((player) => player.role);
      expect(roles).toHaveLength(count);
      expect(new Set(roles).size).toBe(count);
      expect(roles.some((role) => role === 'FRONT_JACK' || role === 'REAR_JACK')).toBe(true);
      expect(roles.every((role) => /^(FRONT_JACK|REAR_JACK|RELEASE_CONTROLLER|(FL|FR|RL|RR)_(GUNNER|WHEEL_OFF|WHEEL_ON))$/.test(role))).toBe(true);
      expect(room.round!.tasks).toHaveLength(21);
      expect(new Set(room.round!.tasks.filter((task) => task.ownerId).map((task) => task.role)).size).toBe(count);
      expect(new Set(room.round!.tasks.filter((task) => !task.ownerId).map((task) => task.role)).size).toBe(15 - count);
      for (const player of room.players) {
        expect(room.round!.tasks.filter((task) => task.role === player.role).every((task) => task.ownerId === player.id)).toBe(true);
      }
    }
  }, 60_000);

  it('rejects the sixteenth member, including competing requests for the final seat', async () => {
    const { roomId } = await lobby(14);
    const outcomes = await Promise.allSettled([
      call(userId(15), 'join', roomId, { nickname: 'Candidate A' }),
      call(userId(16), 'join', roomId, { nickname: 'Candidate B' }),
    ]);
    expect(outcomes.filter((outcome) => outcome.status === 'fulfilled')).toHaveLength(1);
    expect(outcomes.filter((outcome) => outcome.status === 'rejected')).toHaveLength(1);
    const room = getRoom(await state(), roomId);
    expect(room.players).toHaveLength(15);
    await expect(call(userId(17), 'join', roomId, { nickname: 'Overflow' })).rejects.toThrow();
  });

  it('also refuses to start an invalid sixteen-member roster if trusted test setup bypasses joining', async () => {
    const { users, roomId } = await lobby(15);
    await owner(db, `
      UPDATE pit_private.members SET ready = true WHERE room_id = ${literal(roomId)}::uuid;
      INSERT INTO pit_private.members(room_id, user_id, nickname, ready, joined_at, last_seen_at)
        VALUES (${literal(roomId)}::uuid, ${literal(userId(16))}::uuid, 'Invalid sixteenth', true,
          pit_private.clock_ms(), pit_private.clock_ms());
    `);
    await expect(call(users[0], 'start', roomId)).rejects.toThrow();
  });

  it('denies direct private reads/writes and private timestamp-bearing helpers to public roles', async () => {
    const { roomId } = await lobby(4);
    for (const role of ['anon', 'authenticated'] as const) {
      for (const sql of [
        'SELECT * FROM pit_private.members',
        'DELETE FROM pit_private.results',
        `SELECT pit_private.reconcile_round(${literal(roomId)}::uuid, 123)`,
        `SELECT pit_private.apply_action(${literal(roomId)}::uuid, ${literal(userId(1))}::uuid, 'FRONT_LIFT', 123, 'forged')`,
        "UPDATE public.pit_public_state SET state = '{}'::jsonb",
      ]) {
        await expect(db.exec(`RESET ROLE; SET ROLE ${role}; ${sql}`)).rejects.toThrow();
      }
    }
  });

  it('hosts and outsiders cannot delete results or self-promote to global admin', async () => {
    const { users, roomId } = await lobby(4);
    for (const user of [users[0], users[1], userId(99)]) {
      await expect(call(user, 'admin_delete', roomId, { confirm: 'DELETE', isAdmin: true })).rejects.toThrow();
      expect((await state(user)).identity.isAdmin).toBe(false);
    }
  });

  it('public realtime aggregate contains all teams and no authentication or administrator identity', async () => {
    const first = await lobby(4);
    const second = await lobby(4, 100);
    await readyAll(first.users, first.roomId);
    await readyAll(second.users, second.roomId);
    await call(first.users[0], 'start', first.roomId);
    await call(second.users[0], 'start', second.roomId);
    const snapshot = await state();
    expect(snapshot.rooms).toHaveLength(2);
    expect(snapshot.rooms.every((room) => ['COUNTDOWN', 'RUNNING'].includes(room.status))).toBe(true);
    const results = await db.exec('RESET ROLE; SET ROLE anon; SELECT state FROM public.pit_public_state');
    const published = (results.at(-1)!.rows[0] as { state: Record<string, unknown> }).state;
    expect(published.rooms).toHaveLength(2);
    expect(published).not.toHaveProperty('identity');
    const serialized = JSON.stringify(published);
    for (const user of [...first.users, ...second.users]) expect(serialized).not.toContain(user);
    expect(serialized).not.toMatch(/email|service_role|jwt|auth_user|user_id|isAdmin/i);
  });
});

// Deterministic fixtures below call the exact production private engine as its
// owner. They do not add a client-supplied clock to any public API.

type TaskRow = {
  id: string;
  role: Role;
  owner_id: string | null;
  status: string;
  enabled_at: number | null;
  completed_at: number | null;
  baseline_mean_ms: number | null;
  due_at: number | null;
  reason: string | null;
};

async function tasks(roundId: string): Promise<Map<string, TaskRow>> {
  const rows = await owner<TaskRow>(db, `SELECT id, role, owner_id, status,
    enabled_at::float8, completed_at::float8, baseline_mean_ms::float8, due_at::float8, reason
    FROM pit_private.tasks WHERE round_id = ${literal(roundId)}::uuid`);
  return new Map(rows.map((task) => [task.id, task]));
}

async function reconcile(roundId: string, now: number) {
  await owner(db, `SELECT pit_private.reconcile_round(${literal(roundId)}::uuid, ${now})`);
  return tasks(roundId);
}

async function act(roundId: string, playerId: string, taskId: string, now: number, requestId = `${taskId}-${now}`) {
  await owner(db, `SELECT pit_private.apply_action(${literal(roundId)}::uuid,
    ${literal(playerId)}::uuid, ${literal(taskId)}, ${now}, ${literal(requestId)})`);
  return tasks(roundId);
}

async function controlled(
  roles: Role[] = ['FRONT_JACK', 'FL_WHEEL_ON', 'FR_WHEEL_ON', 'RL_WHEEL_ON'],
  existing?: Awaited<ReturnType<typeof started>>,
) {
  const fixture = existing ?? await started(roles.length);
  const roundId = fixture.room.round!.id;
  const byRole = new Map<Role, string>();
  for (let index = 0; index < roles.length; index++) byRole.set(roles[index], fixture.room.players[index].id);
  await owner(db, `
    UPDATE pit_private.rooms SET status = 'RUNNING' WHERE id = ${literal(fixture.roomId)}::uuid;
    UPDATE pit_private.rounds SET status = 'RUNNING', go_at = 0, finished_at = NULL, elapsed_ms = NULL
      WHERE id = ${literal(roundId)}::uuid;
    DELETE FROM pit_private.samples WHERE round_id = ${literal(roundId)}::uuid;
    DELETE FROM pit_private.events WHERE round_id = ${literal(roundId)}::uuid;
    UPDATE pit_private.tasks SET owner_id = NULL, status = 'LOCKED', enabled_at = NULL,
      completed_at = NULL, baseline_mean_ms = NULL, due_at = NULL, reason = NULL
      WHERE round_id = ${literal(roundId)}::uuid;
  `);
  for (const [role, playerId] of byRole) {
    await owner(db, `
      UPDATE pit_private.members SET role = ${literal(role)} WHERE id = ${literal(playerId)}::uuid;
      UPDATE pit_private.tasks SET owner_id = ${literal(playerId)}::uuid
        WHERE round_id = ${literal(roundId)}::uuid AND role = ${literal(role)};
    `);
  }
  await reconcile(roundId, 0);
  return { ...fixture, roundId, byRole };
}

describe('production PostgreSQL engine: deterministic bot timestamps', () => {
  it('requires the first human lift, then synchronizes the bot jack at exactly that completion timestamp', async () => {
    const { roundId, byRole } = await controlled();
    let graph = await reconcile(roundId, 300);
    expect(graph.get('REAR_LIFT')!.completed_at).toBeNull();
    expect(graph.get('REAR_LIFT')!.due_at).toBeNull();
    graph = await act(roundId, byRole.get('FRONT_JACK')!, 'FRONT_LIFT', 400);
    expect(graph.get('FRONT_LIFT')!.completed_at).toBe(400);
    expect(graph.get('REAR_LIFT')!.completed_at).toBe(400);
    expect(graph.get('REAR_LIFT')!.reason).toBe('OPENING_JACK_SYNC');
    for (const corner of ['FL', 'FR', 'RL', 'RR']) {
      expect(graph.get(`${corner}_GUN_LOOSEN`)!.enabled_at).toBe(400);
      expect(graph.get(`${corner}_GUN_LOOSEN`)!.baseline_mean_ms).toBe(400);
      expect(graph.get(`${corner}_GUN_LOOSEN`)!.due_at).toBe(800);
    }
    const samples = await owner<{ ms: number }>(db,
      `SELECT ms::float8 FROM pit_private.samples WHERE round_id = ${literal(roundId)}::uuid`);
    expect(samples).toEqual([{ ms: 400 }]);
  });

  it('lets an all-bot loosen cohort wait its mean normally and preserves independent corner dependencies', async () => {
    const { roundId, byRole } = await controlled();
    await act(roundId, byRole.get('FRONT_JACK')!, 'FRONT_LIFT', 400);
    let graph = await reconcile(roundId, 799);
    expect([...graph.values()].filter((task) => task.id.endsWith('GUN_LOOSEN')).every((task) => task.status === 'AVAILABLE')).toBe(true);
    expect(graph.get('FL_WHEEL_OFF')!.status).toBe('LOCKED');
    graph = await reconcile(roundId, 800);
    for (const corner of ['FL', 'FR', 'RL', 'RR']) {
      expect(graph.get(`${corner}_GUN_LOOSEN`)!.completed_at).toBe(800);
      expect(graph.get(`${corner}_WHEEL_OFF`)!.enabled_at).toBe(800);
      expect(graph.get(`${corner}_WHEEL_OFF`)!.due_at).toBe(1200);
    }
    expect(graph.get('GREEN_RELEASE')!.status).toBe('LOCKED');
  });

  it('caps a 400 ms bot wheel-on at the final human peer at +250 ms in the same action transaction', async () => {
    const { roundId, byRole } = await controlled();
    await act(roundId, byRole.get('FRONT_JACK')!, 'FRONT_LIFT', 400);
    let graph = await reconcile(roundId, 1200);
    expect(graph.get('RR_WHEEL_ON')!.due_at).toBe(1600);
    expect(graph.get('RR_WHEEL_ON')!.baseline_mean_ms).toBe(400);
    await act(roundId, byRole.get('FL_WHEEL_ON')!, 'FL_WHEEL_ON', 1350);
    await act(roundId, byRole.get('FR_WHEEL_ON')!, 'FR_WHEEL_ON', 1400);
    graph = await act(roundId, byRole.get('RL_WHEEL_ON')!, 'RL_WHEEL_ON', 1450);
    expect(graph.get('RR_WHEEL_ON')!.completed_at).toBe(1450);
    expect(graph.get('RR_WHEEL_ON')!.reason).toBe('PARALLEL_HUMAN_CAP');
    expect(graph.get('RR_WHEEL_ON')!.baseline_mean_ms).toBe(400);
    expect(graph.get('RR_WHEEL_ON')!.due_at).toBe(1600);
    expect(graph.get('FL_GUN_TIGHTEN')!.enabled_at).toBe(1350);
    expect(graph.get('FR_GUN_TIGHTEN')!.enabled_at).toBe(1400);
    expect(graph.get('RR_GUN_TIGHTEN')!.enabled_at).toBe(1450);
  });

  it('allows an earlier baseline bot completion before slow humans without waiting for their cohort', async () => {
    const { roundId, byRole } = await controlled();
    await act(roundId, byRole.get('FRONT_JACK')!, 'FRONT_LIFT', 400);
    let graph = await reconcile(roundId, 1600);
    expect(graph.get('RR_WHEEL_ON')!.completed_at).toBe(1600);
    expect(graph.get('RR_WHEEL_ON')!.reason).toBe('BASELINE_DUE');
    expect(graph.get('FL_WHEEL_ON')!.status).toBe('AVAILABLE');
    await act(roundId, byRole.get('FL_WHEEL_ON')!, 'FL_WHEEL_ON', 2000);
    await act(roundId, byRole.get('FR_WHEEL_ON')!, 'FR_WHEEL_ON', 2050);
    graph = await act(roundId, byRole.get('RL_WHEEL_ON')!, 'RL_WHEEL_ON', 2100);
    expect(graph.get('RR_WHEEL_ON')!.completed_at).toBe(1600);
    expect(graph.get('RR_WHEEL_ON')!.due_at).toBe(1600);
  });

  it('keeps two human jack times independent and processes old due events before newer human samples', async () => {
    const { roundId, byRole } = await controlled(['FRONT_JACK', 'REAR_JACK', 'FL_WHEEL_ON', 'FR_WHEEL_ON']);
    let graph = await act(roundId, byRole.get('FRONT_JACK')!, 'FRONT_LIFT', 400);
    expect(graph.get('REAR_LIFT')!.completed_at).toBeNull();
    graph = await act(roundId, byRole.get('REAR_JACK')!, 'REAR_LIFT', 1200);
    expect(graph.get('FRONT_LIFT')!.completed_at).toBe(400);
    expect(graph.get('REAR_LIFT')!.completed_at).toBe(1200);
    // The front bots were enabled at t=800, before the rear human's t=1200
    // sample. Scheduling them with that future sample would give t=1600.
    expect(graph.get('FL_WHEEL_OFF')!.baseline_mean_ms).toBe(400);
    expect(graph.get('FL_WHEEL_OFF')!.due_at).toBe(1200);
    expect(graph.get('FL_WHEEL_OFF')!.completed_at).toBe(1200);
    expect(graph.get('RL_GUN_LOOSEN')!.baseline_mean_ms).toBe(800);
    expect(graph.get('RL_GUN_LOOSEN')!.due_at).toBe(2000);
  });

  it('waits for each predecessor, then immediately caps a late eligible bot whose human cohort already finished', async () => {
    const { roundId, byRole } = await controlled(['FRONT_JACK', 'REAR_JACK', 'FL_WHEEL_ON', 'FR_WHEEL_ON']);
    await act(roundId, byRole.get('FRONT_JACK')!, 'FRONT_LIFT', 400);
    await act(roundId, byRole.get('REAR_JACK')!, 'REAR_LIFT', 1200);
    await act(roundId, byRole.get('FL_WHEEL_ON')!, 'FL_WHEEL_ON', 1350);
    let graph = await act(roundId, byRole.get('FR_WHEEL_ON')!, 'FR_WHEEL_ON', 1400);
    expect(graph.get('RR_WHEEL_ON')!.status).toBe('LOCKED');
    expect(graph.get('RR_WHEEL_OFF')!.completed_at).toBeNull();
    graph = await reconcile(roundId, 2487.5);
    expect(graph.get('RR_WHEEL_OFF')!.completed_at).toBe(2487.5);
    expect(graph.get('RR_WHEEL_ON')!.enabled_at).toBe(2487.5);
    expect(graph.get('RR_WHEEL_ON')!.completed_at).toBe(2487.5);
    expect(graph.get('RR_WHEEL_ON')!.reason).toBe('COHORT_ALREADY_FINISHED');
  });

  it('settles bot eligibility at an exact timestamp tie before adding a human sample from that timestamp', async () => {
    const { roundId, byRole } = await controlled(['FRONT_JACK', 'REAR_JACK', 'RL_WHEEL_ON', 'RR_WHEEL_ON']);
    await act(roundId, byRole.get('FRONT_JACK')!, 'FRONT_LIFT', 100);
    const graph = await act(roundId, byRole.get('REAR_JACK')!, 'REAR_LIFT', 300);
    expect(graph.get('FL_GUN_LOOSEN')!.completed_at).toBe(200);
    expect(graph.get('FL_WHEEL_OFF')!.completed_at).toBe(300);
    expect(graph.get('FL_WHEEL_ON')!.enabled_at).toBe(300);
    expect(graph.get('FL_WHEEL_ON')!.baseline_mean_ms).toBe(100);
    expect(graph.get('FL_WHEEL_ON')!.due_at).toBe(400);
    expect(graph.get('RL_GUN_LOOSEN')!.enabled_at).toBe(300);
    expect(graph.get('RL_GUN_LOOSEN')!.baseline_mean_ms).toBe(200);
    expect(graph.get('RL_GUN_LOOSEN')!.due_at).toBe(500);
  });

  it('caps mixed lowering, gives singleton bot release its mean, and scores its effective timestamp once', async () => {
    const { roundId, byRole, roomId } = await controlled();
    await act(roundId, byRole.get('FRONT_JACK')!, 'FRONT_LIFT', 400);
    await act(roundId, byRole.get('FL_WHEEL_ON')!, 'FL_WHEEL_ON', 1350);
    await act(roundId, byRole.get('FR_WHEEL_ON')!, 'FR_WHEEL_ON', 1400);
    await act(roundId, byRole.get('RL_WHEEL_ON')!, 'RL_WHEEL_ON', 1450);
    let graph = await reconcile(roundId, 1700);
    expect(graph.get('FRONT_LOWER')!.enabled_at).toBe(1650);
    expect(graph.get('REAR_LOWER')!.enabled_at).toBe(1700);
    expect(graph.get('REAR_LOWER')!.due_at).toBe(1950);
    graph = await act(roundId, byRole.get('FRONT_JACK')!, 'FRONT_LOWER', 1870);
    expect(graph.get('REAR_LOWER')!.completed_at).toBe(1870);
    expect(graph.get('REAR_LOWER')!.reason).toBe('PARALLEL_HUMAN_CAP');
    expect(graph.get('GREEN_RELEASE')!.enabled_at).toBe(1870);
    expect(graph.get('GREEN_RELEASE')!.baseline_mean_ms).toBe(244);
    expect(graph.get('GREEN_RELEASE')!.due_at).toBe(2114);
    expect(graph.get('GREEN_RELEASE')!.completed_at).toBeNull();
    graph = await reconcile(roundId, 9000);
    expect(graph.get('GREEN_RELEASE')!.completed_at).toBe(2114);
    await reconcile(roundId, 10000);
    const snapshot = await state();
    const room = getRoom(snapshot, roomId);
    expect(room.round!.elapsedMs).toBe(2114);
    expect(room.round!.finishedAt).toBe(2114);
    expect(room.round!.tasks.every((task) => task.status === 'DONE')).toBe(true);
    expect(new Set(room.round!.events.map((event) => event.taskId)).size).toBe(21);
    for (const task of room.round!.tasks) {
      expect(task.completedAt!).toBeGreaterThanOrEqual(task.enabledAt!);
      for (const dependency of task.dependencies) {
        expect(task.enabledAt!).toBeGreaterThanOrEqual(room.round!.tasks.find((parent) => parent.id === dependency)!.completedAt!);
      }
    }
    for (const sample of room.round!.samples) {
      const task = room.round!.tasks.find((candidate) => candidate.id === sample.taskId)!;
      expect(sample.ms).toBe(task.completedAt! - task.enabledAt!);
    }
    expect(snapshot.leaderboard).toHaveLength(1);
    expect(snapshot.leaderboard[0].rounds).toHaveLength(1);
    expect(snapshot.leaderboard[0].averageMs).toBe(2114);
  });

  it('rejects locked/wrong-owner actions and makes duplicate request reconciliation idempotent', async () => {
    const { roundId, byRole } = await controlled();
    await expect(act(roundId, byRole.get('FL_WHEEL_ON')!, 'FL_WHEEL_ON', 100)).rejects.toThrow();
    await expect(act(roundId, byRole.get('FL_WHEEL_ON')!, 'FRONT_LIFT', 100)).rejects.toThrow();
    await act(roundId, byRole.get('FRONT_JACK')!, 'FRONT_LIFT', 400, 'one-authorized-click');
    await act(roundId, byRole.get('FRONT_JACK')!, 'FRONT_LIFT', 400, 'one-authorized-click');
    const before = await tasks(roundId);
    await reconcile(roundId, 400);
    await reconcile(roundId, 400);
    expect(await tasks(roundId)).toEqual(before);
    const samples = await owner<{ count: number }>(db,
      `SELECT count(*)::int FROM pit_private.samples WHERE round_id = ${literal(roundId)}::uuid`);
    expect(samples[0].count).toBe(1);
    await expect(act(roundId, byRole.get('FRONT_JACK')!, 'FRONT_LIFT', 500, 'different-replay')).rejects.toThrow();
  });

  it('rejects stale human reactions beyond 120 seconds without inserting a sample or result', async () => {
    const { roundId, byRole } = await controlled();
    await expect(act(roundId, byRole.get('FRONT_JACK')!, 'FRONT_LIFT', 120001)).rejects.toThrow();
    const rows = await owner<{ samples: number; results: number }>(db, `
      SELECT (SELECT count(*)::int FROM pit_private.samples WHERE round_id = ${literal(roundId)}::uuid) AS samples,
      (SELECT count(*)::int FROM pit_private.results WHERE round_id = ${literal(roundId)}::uuid) AS results`);
    expect(rows[0]).toEqual({ samples: 0, results: 0 });
  });

  it('uses the server clock through the public action RPC despite forged client time and identity fields', async () => {
    const { roundId, byRole, roomId } = await controlled();
    const playerId = byRole.get('FRONT_JACK')!;
    await owner(db, `
      UPDATE pit_private.rounds SET go_at = pit_private.clock_ms() - 400 WHERE id = ${literal(roundId)}::uuid;
      UPDATE pit_private.tasks SET enabled_at = (SELECT go_at FROM pit_private.rounds WHERE id = ${literal(roundId)}::uuid)
        WHERE round_id = ${literal(roundId)}::uuid AND cohort = 'LIFT';
    `);
    const [{ user_id: user, before_time: beforeTime }] = await owner<{ user_id: string; before_time: number }>(db,
      `SELECT user_id, pit_private.clock_ms()::float8 AS before_time FROM pit_private.members WHERE id = ${literal(playerId)}::uuid`);
    const snapshot = await call(user, 'action', roomId, {
      taskId: 'FRONT_LIFT', requestId: 'real-server-clock', now: 1, at: 1,
      completedAt: 1, goAt: 1, playerId: userId(999), userId: userId(999), role: 'RELEASE_CONTROLLER',
    });
    const round = getRoom(snapshot, roomId).round!;
    const front = round.tasks.find((task) => task.id === 'FRONT_LIFT')!;
    const rear = round.tasks.find((task) => task.id === 'REAR_LIFT')!;
    expect(front.completedAt).toBeGreaterThanOrEqual(beforeTime);
    expect(front.completedAt).toBeLessThanOrEqual(snapshot.serverNow);
    expect(rear.completedAt).toBe(front.completedAt);
    expect(round.samples[0].ms).toBeGreaterThanOrEqual(400);
    expect(round.samples[0].ms).toBeLessThan(5000);
    expect(snapshot.identity.playerId).toBe(playerId);
  });
});

async function completeControlled(fixture: Awaited<ReturnType<typeof controlled>>, scale = 1) {
  const { roundId, byRole } = fixture;
  await act(roundId, byRole.get('FRONT_JACK')!, 'FRONT_LIFT', 400 * scale);
  await act(roundId, byRole.get('FL_WHEEL_ON')!, 'FL_WHEEL_ON', 1350 * scale);
  await act(roundId, byRole.get('FR_WHEEL_ON')!, 'FR_WHEEL_ON', 1400 * scale);
  await act(roundId, byRole.get('RL_WHEEL_ON')!, 'RL_WHEEL_ON', 1450 * scale);
  await act(roundId, byRole.get('FRONT_JACK')!, 'FRONT_LOWER', 1870 * scale);
  await reconcile(roundId, 9000 * scale);
}

describe('production PostgreSQL results, replay and global administrator', () => {
  it('replays the same persistent team, averages every completed round, and audits authorized result deletion', async () => {
    const first = await controlled();
    await completeControlled(first);
    let snapshot = await state();
    const firstResultId = snapshot.leaderboard[0].rounds[0].id;
    snapshot = await call(first.users[0], 'replay', first.roomId);
    let room = getRoom(snapshot, first.roomId);
    expect(room.teamId).toBe(first.room.teamId);
    expect(room.status).toBe('WAITING');
    expect(room.round).toBeNull();
    expect(room.players.every((player) => !player.ready)).toBe(true);
    await readyAll(first.users, first.roomId);
    snapshot = await call(first.users[0], 'start', first.roomId);
    room = getRoom(snapshot, first.roomId);
    const second = await controlled(undefined, { ...first, snapshot, room });
    await completeControlled(second, 2);
    snapshot = await state();
    expect(snapshot.leaderboard).toHaveLength(1);
    expect(snapshot.leaderboard[0].rounds.map((result) => result.elapsedMs)).toEqual([2114, 4228]);
    expect(snapshot.leaderboard[0].averageMs).toBe(3171);
    expect(snapshot.leaderboard[0].bestMs).toBe(2114);
    const admin = userId(900);
    await owner(db, `INSERT INTO pit_private.admins(user_id) VALUES (${literal(admin)}::uuid)`);
    expect((await state(admin)).identity).toEqual({ playerId: null, isAdmin: true });
    await expect(call(admin, 'admin_delete', null, { resultId: firstResultId })).rejects.toThrow();
    snapshot = await call(admin, 'admin_delete', null, { resultId: firstResultId, confirm: 'DELETE' });
    expect(snapshot.leaderboard[0].rounds).toHaveLength(1);
    expect(snapshot.leaderboard[0].averageMs).toBe(4228);
    snapshot = await call(admin, 'admin_delete', null, { teamId: room.teamId, confirm: 'DELETE' });
    expect(snapshot.leaderboard).toEqual([]);
    const audit = await owner<{ operation: string; payload: { deletedCount: number } }>(db,
      'SELECT operation, payload FROM pit_private.audit ORDER BY id');
    expect(audit).toHaveLength(2);
    expect(audit.every((entry) => entry.operation === 'DELETE_RESULTS' && entry.payload.deletedCount === 1)).toBe(true);
  });
});

