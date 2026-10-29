import { createSoloRound, earlyAction, reconcile, submitAction } from './engine';
import { ROLES, type ReplayRecord, type Role, type Room, type Snapshot } from './types';

/** Temporary, fully local feature. No Supabase calls and no ranked results. */
export const ENABLE_SOLO_TEST_MODE = window.PIT_CONFIG?.enableSoloTest !== false;
let room: Room | null = null;
const replays = new Map<string, ReplayRecord>();
function saveReplay(): void {
  if (!room?.round || room.round.status !== 'COMPLETED' || replays.has(room.round.id)) return;
  replays.set(room.round.id, structuredClone({ roundId: room.round.id, teamId: room.teamId, teamName: room.name, color: room.color, players: room.round.players ?? room.players, round: room.round, solo: true }));
}
export const solo = {
  active: false,
  enter() {
    if (!ENABLE_SOLO_TEST_MODE) throw new Error('Solo Test is disabled.');
    const now = Date.now(); const id = `solo-${crypto.randomUUID()}`;
    room = { id, teamId: id, solo: true, name: 'SOLO TEST — NOT RANKED', color: '#ffd16a', code: 'SOLO', hostId: 'solo-you', status: 'WAITING', players: [{ id: 'solo-you', nickname: 'You', role: 'FRONT_JACK', ready: false, joinedAt: now, connected: true }], round: null, updatedAt: now };
    this.active = true;
    return this.getState();
  },
  async getState(): Promise<Snapshot> {
    if (room?.round) { reconcile(room.round, Date.now()); if (room.round.status !== 'ABANDONED') room.status = room.round.status; }
    saveReplay();
    return structuredClone({ local: true, rooms: room ? [room] : [], leaderboard: [], replays: [...replays.values()].map(record => ({ roundId: record.roundId, teamId: record.teamId, teamName: record.teamName, color: record.color, elapsedMs: record.round.elapsedMs!, finishedAt: record.round.finishedAt! })), serverNow: Date.now(), identity: { playerId: this.active ? 'solo-you' : null, isAdmin: false } });
  },
  getReplay(roundId: string): ReplayRecord | null { const record = replays.get(roundId); return record ? structuredClone(record) : null; },
  async call(op: string, _id?: string | null, payload: Record<string, unknown> = {}): Promise<Snapshot> {
    if (!room) throw new Error('Open Solo Test first.');
    if (op === 'choose_role') {
      if (room.status !== 'WAITING' || !ROLES.includes(payload.role as Role)) throw new Error('Choose a valid role before starting.');
      room.players[0].role = payload.role as Role; room.players[0].ready = false;
      room.round = null;
    } else if (op === 'ready') {
      if (room.status !== 'WAITING') throw new Error('Ready can only change before starting.');
      room.players[0].ready = payload.ready === true;
    }
    else if (op === 'start') {
      if (room.status !== 'WAITING') throw new Error('Finish this attempt before starting another.');
      if (room.status !== 'WAITING' || !room.players[0].ready) throw new Error('Mark Ready first.');
      room.round = createSoloRound(room.players, Date.now() + 3000, crypto.randomUUID()); room.status = 'COUNTDOWN';
    } else if (op === 'early_action') {
      if (!room.round) throw new Error('Start first.');
      earlyAction(room.round, 'solo-you', String(payload.taskId), Date.now(), String(payload.requestId ?? ''));
    } else if (op === 'action') {
      if (!room.round) throw new Error('Start first.');
      submitAction(room.round, 'solo-you', String(payload.taskId), Date.now(), String(payload.requestId));
    } else if (op === 'replay') {
      if (room.status !== 'COMPLETED') throw new Error('Finish this attempt first.');
      saveReplay();
      room.round = null; room.status = 'WAITING'; room.players[0].ready = false;
    } else if (op === 'leave') { room = null; this.active = false; }
    else if (op !== 'heartbeat') throw new Error('Solo Test cannot modify online rooms or ranked results.');
    if (room && op !== 'heartbeat') room.updatedAt = Date.now();
    return this.getState();
  }
};
