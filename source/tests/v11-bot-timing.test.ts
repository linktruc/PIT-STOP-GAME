import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { mkdir, writeFile } from 'node:fs/promises';
import type { PGlite } from '@electric-sql/pglite';
import { createRound, createSoloRound, reconcile, submitAction } from '../src/engine';
import type { Player, Role, Room, Round, Snapshot, Task } from '../src/types';
import { clearDatabase, createDatabase, literal, owner, rpc, userId } from './helpers/database';

const player = (role: Role, id: string = role): Player => ({ id, role, nickname: `${role} human`, ready: true, joinedAt: 0 });
const node = (round: Round, id: string): Task => round.tasks.find(task => task.id === id)!;

/** Exercise the entire causal scheduler, not just the mean helper. */
function completeRound(round: Round, humanDelay: number): Round {
  let now = round.goAt;
  for (let guard = 0; guard < 100 && round.status !== 'COMPLETED'; guard++) {
    reconcile(round, now);
    const next = Math.min(...round.tasks.filter(task => task.status === 'AVAILABLE').map(task => task.ownerId ? task.enabledAt! + humanDelay : task.dueAt ?? Infinity));
    if (!Number.isFinite(next)) throw new Error('The full-round fixture stalled.');
    now = Math.max(now, next); reconcile(round, now);
    for (const task of round.tasks.filter(task => task.ownerId && task.status === 'AVAILABLE' && task.enabledAt! + humanDelay <= now).sort((a, b) => a.id.localeCompare(b.id))) {
      submitAction(round, task.ownerId!, task.id, now, task.id);
    }
  }
  expect(round.status).toBe('COMPLETED');
  expect(round.events).toHaveLength(21);
  return round;
}
function timingRows(round: Round) {
  return [...round.tasks].sort((a, b) => a.id.localeCompare(b.id)).map(task => ({
    taskId: task.id, ownerId: task.ownerId,
    enabledAt: task.enabledAt! - round.goAt, baselineMeanMs: task.baselineMeanMs,
    dueAt: task.dueAt === null ? null : task.dueAt - round.goAt,
    completedAt: task.completedAt! - round.goAt, reason: task.reason,
    source: task.ownerId ? 'HUMAN' : task.cohort === 'LIFT' && !round.soloTiming ? 'HUMAN_JACK_SYNC' : round.samples.some(sample => sample.at <= task.enabledAt!) ? 'HUMAN_MEAN' : 'SOLO_BOOTSTRAP',
  }));
}
const evidence: Record<string, unknown> = {};
afterAll(async () => {
  if (!process.env.PIT_BOT_EVIDENCE) return;
  await mkdir('docs/v11-evidence', { recursive: true });
  await writeFile('docs/v11-evidence/bot-timing-report.json', JSON.stringify(evidence, null, 2));
});

describe('V11 full-round Solo bot adaptation and scoped bootstrap', () => {
  it.each([4000, 250])('uses 700ms gunner fallback before adapting to the %ims Jack observation', delay => {
    const round = createSoloRound([player('FRONT_JACK', 'solo-you')], 1000, `solo-${delay}`);
    submitAction(round, 'solo-you', 'FRONT_LIFT', 1000 + delay, 'first');
    const due = 1000 + delay + 700;
    for (const task of round.tasks.filter(task => task.cohort === 'GUN_LOOSEN')) {
      expect(task.baselineMeanMs).toBe(700);
      expect(task.dueAt).toBe(due);
    }
    reconcile(round, due - 1);
    expect(round.tasks.filter(task => task.cohort === 'GUN_LOOSEN').every(task => task.status === 'AVAILABLE')).toBe(true);
    reconcile(round, due);
    for (const task of round.tasks.filter(task => task.cohort === 'WHEEL_OFF')) {
      expect(task.baselineMeanMs).toBe((delay + 700) / 2);
      expect(task.enabledAt).toBe(due);
    }
    completeRound(round, delay);
  });

  it('isolates WHEEL_ON bootstrap, keeps scheduled deadlines fixed and switches new downstream jobs to the 3000ms observation', () => {
    const round = createSoloRound([player('FL_WHEEL_ON', 'solo-you')], 1000, 'solo-wheel-on');
    reconcile(round, 3100);
    const human = node(round, 'FL_WHEEL_ON');
    expect(human.enabledAt).toBe(3100);
    const alreadyScheduled = node(round, 'FR_WHEEL_ON');
    expect(alreadyScheduled.baselineMeanMs).toBe(700); expect(alreadyScheduled.dueAt).toBe(3800);
    submitAction(round, 'solo-you', human.id, 6100, 'fit');
    expect(round.samples).toEqual([{ taskId: human.id, ms: 3000, at: 6100 }]);
    expect(alreadyScheduled.dueAt).toBe(3800); expect(alreadyScheduled.completedAt).toBe(3800);
    const tighten = node(round, 'FL_GUN_TIGHTEN');
    expect(tighten.baselineMeanMs).toBe(3000); expect(tighten.enabledAt).toBe(6100); expect(tighten.dueAt).toBe(9100);
    completeRound(round, 3000);
    expect(round.elapsedMs).toBe(14100);
    const laterBots = round.tasks.filter(task => !task.ownerId && task.enabledAt! >= 6100);
    expect(laterBots.length).toBeGreaterThan(1);
    expect(laterBots.every(task => task.baselineMeanMs === 3000)).toBe(true);
    evidence.soloWheelOn3000 = { elapsedMs: round.elapsedMs, tasks: timingRows(round), round };
  });

  it('documents RELEASE bootstrap as an unavoidable prerequisite with no downstream task to adapt', () => {
    const round = createSoloRound([player('RELEASE_CONTROLLER', 'solo-you')], 1000, 'solo-release');
    reconcile(round, 5200);
    expect(round.events).toHaveLength(20); expect(round.samples).toHaveLength(0);
    expect(node(round, 'GREEN_RELEASE').enabledAt).toBe(5200);
    submitAction(round, 'solo-you', 'GREEN_RELEASE', 8200, 'release');
    expect(round.samples[0].ms).toBe(3000); expect(round.elapsedMs).toBe(7200);
    expect(round.tasks.filter(task => !task.ownerId).every(task => task.baselineMeanMs === 700)).toBe(true);
    evidence.soloRelease3000 = { elapsedMs: round.elapsedMs, tasks: timingRows(round), round };
  });

  it('evolves 200ms -> 400ms -> 400ms while preserving previously scheduled bot deadlines', () => {
    const round = createRound([player('FRONT_JACK', 'jack'), player('REAR_JACK', 'rear'), player('FL_WHEEL_ON', 'fit')], 1000, 'evolving');
    submitAction(round, 'jack', 'FRONT_LIFT', 1200, 'lift');
    expect(node(round, 'FR_GUN_LOOSEN').baselineMeanMs).toBe(200);
    submitAction(round, 'rear', 'REAR_LIFT', 1600, 'rear-lift');
    expect(node(round, 'RL_GUN_LOOSEN').baselineMeanMs).toBe(400);
    expect(node(round, 'FR_GUN_LOOSEN').dueAt).toBe(1400);
    submitAction(round, 'fit', 'FL_WHEEL_ON', 2000, 'fit');
    expect(round.samples.map(sample => sample.ms)).toEqual([200, 600, 400]);
    const tighten = node(round, 'FL_GUN_TIGHTEN');
    expect(tighten.baselineMeanMs).toBe(400); expect(tighten.enabledAt).toBe(2000); expect(tighten.dueAt).toBe(2400);
    completeRound(round, 400);
    evidence.evolvingMean = { tasks: timingRows(round), samples: round.samples, round };
  });
});

let db: PGlite;
const onlineRoles: Role[] = ['FRONT_JACK', 'FL_WHEEL_ON', 'FR_WHEEL_ON', 'RL_WHEEL_ON'];
async function startOnline(roles: Role[] = onlineRoles): Promise<Room> {
  let state = await rpc<Snapshot>(db, userId(1), 'create', null, { name: 'Measured timing', nickname: 'Jack' });
  const id = state.rooms.find(room => room.hostId === state.identity.playerId)!.id;
  for (let i = 1; i < 4; i++) await rpc(db, userId(i + 1), 'join', id, { nickname: `Human ${i}` });
  for (let i = 0; i < 4; i++) {
    await owner(db, `UPDATE pit_private.members SET role=${literal(roles[i])} WHERE room_id=${literal(id)}::uuid AND user_id=${literal(userId(i + 1))}::uuid`);
    await rpc(db, userId(i + 1), 'ready', id, { ready: true });
  }
  state = await rpc<Snapshot>(db, userId(1), 'start', id);
  return state.rooms.find(room => room.id === id)!;
}
async function databaseRound(id: string): Promise<Round> {
  return (await owner<{ round: Round }>(db, `SELECT pit_private.round_snapshot(${literal(id)}::uuid) round`))[0].round;
}

async function applyPair(reference: Round, taskId: string, at: number): Promise<void> {
  const task = node(reference, taskId);
  submitAction(reference, task.ownerId!, taskId, at, taskId);
  await owner(db, `SELECT pit_private.apply_action(${literal(reference.id)}::uuid,${literal(task.ownerId!)}::uuid,${literal(taskId)},${at},${literal(taskId)})`);
}
async function finishPair(reference: Round, delay: number): Promise<Round> {
  let now = Math.max(reference.goAt, ...reference.events.map(event => event.at));
  for (let guard = 0; guard < 100 && reference.status !== 'COMPLETED'; guard++) {
    reconcile(reference, now);
    const next = Math.min(...reference.tasks.filter(task => task.status === 'AVAILABLE').map(task => task.ownerId ? task.enabledAt! + delay : task.dueAt ?? Infinity));
    if (!Number.isFinite(next)) throw new Error('Online round fixture stalled.');
    now = Math.max(now, next); reconcile(reference, now);
    await owner(db, `SELECT pit_private.reconcile_round(${literal(reference.id)}::uuid,${now})`);
    for (const task of reference.tasks.filter(task => task.ownerId && task.status === 'AVAILABLE' && task.enabledAt! + delay <= now).sort((a, b) => a.id.localeCompare(b.id))) await applyPair(reference, task.id, now);
    const actual = await databaseRound(reference.id);
    expect(actual.samples).toEqual([...reference.samples].sort((a, b) => a.at - b.at || a.taskId.localeCompare(b.taskId)));
    for (const task of reference.tasks.filter(task => task.status === 'DONE')) expect(node(actual, task.id)).toEqual(task);
  }
  return databaseRound(reference.id);
}

describe('V11 actual PostgreSQL full-round bot timing matches TS', () => {
  beforeAll(async () => { db = await createDatabase(); }, 30000);
  beforeEach(async () => { await clearDatabase(db); });
  afterAll(async () => { await db?.close(); });
  it.each([4000, 250])('produces matching enabled/baseline/due/completed/reason for all 21 tasks at %ims reactions', async delay => {
    const room = await startOnline(); const reference = createRound(room.players, room.round!.goAt, room.round!.id);
    const actual = await finishPair(reference, delay);
    expect(actual.status).toBe('COMPLETED'); expect(actual.events).toHaveLength(21);
    expect(actual.elapsedMs).toBe(delay * 7); expect(actual.elapsedMs).toBe(reference.elapsedMs);
    expect(timingRows(actual)).toEqual(timingRows(reference));
    const record = await db.exec(`RESET ROLE;SET ROLE anon;SELECT set_config('request.jwt.claim.sub','',false);SELECT public.pit_replay(${literal(actual.id)}::uuid) record`);
    expect((record.at(-1)!.rows[0] as { record: { round: Round } }).record.round).toEqual(actual);
    evidence[`sqlOnline${delay}`] = { elapsedMs: actual.elapsedMs, tasks: timingRows(actual), round: actual };
  });
  it('holds bot Gunners until the first human Gunner even after a 4000ms Jack', async () => {
    const room = await startOnline(['FRONT_JACK', 'FL_GUNNER', 'FL_WHEEL_ON', 'RELEASE_CONTROLLER']);
    const reference = createRound(room.players, room.round!.goAt, room.round!.id);
    await applyPair(reference, 'FRONT_LIFT', reference.goAt + 4000);
    expect(node(reference, 'FR_GUN_LOOSEN').baselineMeanMs).toBeNull();
    expect(node(reference, 'FR_GUN_LOOSEN').dueAt).toBeNull();
    await applyPair(reference, 'FL_GUN_LOOSEN', reference.goAt + 4100);
    const actualCap = await databaseRound(reference.id);
    for (const id of ['FR_GUN_LOOSEN', 'RL_GUN_LOOSEN', 'RR_GUN_LOOSEN']) {
      const actual = node(actualCap, id);
      expect(actual).toEqual(node(reference, id));
      expect(actual.baselineMeanMs).toBeNull(); expect(actual.completedAt).toBe(reference.goAt + 4100);
      expect(actual.reason).toBe('OPENING_GUNNER_SYNC');
    }
    const actual = await finishPair(reference, 400);
    expect(actual.status).toBe('COMPLETED'); expect(actual.events).toHaveLength(21);
    expect(timingRows(actual)).toEqual(timingRows(reference));
    evidence.firstGunnerAfterSlowOpening = { explanation: 'The bot holds its first gunner step until the first real human gunner finishes (100ms after the human Jack), then subsequent bots use the average of 4000ms and 100ms.', tasks: timingRows(actual), round: actual };
  });

  it('proves the evolving 200/600/400 human mean through production SQL and a completed replay', async () => {
    const room = await startOnline(['FRONT_JACK', 'REAR_JACK', 'FL_WHEEL_ON', 'RELEASE_CONTROLLER']);
    const reference = createRound(room.players, room.round!.goAt, room.round!.id);
    await applyPair(reference, 'FRONT_LIFT', reference.goAt + 200);
    expect(node(await databaseRound(reference.id), 'FR_GUN_LOOSEN').baselineMeanMs).toBe(200);
    await applyPair(reference, 'REAR_LIFT', reference.goAt + 600);
    expect(node(await databaseRound(reference.id), 'RL_GUN_LOOSEN').baselineMeanMs).toBe(400);
    await applyPair(reference, 'FL_WHEEL_ON', reference.goAt + 1000);
    const afterThird = await databaseRound(reference.id);
    expect(afterThird.samples.map(sample => sample.ms)).toEqual([200, 600, 400]);
    expect(node(afterThird, 'FL_GUN_TIGHTEN').baselineMeanMs).toBe(400);
    expect(node(afterThird, 'FR_GUN_LOOSEN').dueAt).toBe(reference.goAt + 400);
    const actual = await finishPair(reference, 400);
    expect(actual.status).toBe('COMPLETED'); expect(actual.events).toHaveLength(21);
    expect(timingRows(actual)).toEqual(timingRows(reference));
    evidence.sqlEvolvingMean = { tasks: timingRows(actual), samples: actual.samples, round: actual };
  });

});
