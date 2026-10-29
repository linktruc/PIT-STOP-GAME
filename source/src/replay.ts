import type { Player, ReplayRecord, Role, Room, Round, Task } from './types';

/** Replay uses original authoritative epochs; the cursor is only a presentation offset from GO. */
export const REPLAY_APPROACH_MS = 3_000;
export const REPLAY_EXIT_MS = 6_500;

export interface ReplayEvent {
  taskId: string;
  task: string;
  by: string;
  role: string;
  human: boolean;
  at: number;
  enabledAt: number | null;
  stepMs: number | null;
  teamMs: number | null;
}

const corners: Record<string, string> = {
  FL: 'front-left', FR: 'front-right', RL: 'rear-left', RR: 'rear-right',
};

export function replayTaskLabel(id: string): string {
  const fixed: Record<string, string> = {
    FRONT_LIFT: 'Lift front of car', REAR_LIFT: 'Lift rear of car',
    FRONT_LOWER: 'Lower front of car', REAR_LOWER: 'Lower rear of car',
    GREEN_RELEASE: 'Release car',
  };
  if (fixed[id]) return fixed[id];
  const corner = corners[id.slice(0, 2)];
  if (!corner) return id.replaceAll('_', ' ').toLowerCase();
  if (id.endsWith('GUN_LOOSEN')) return `Loosen ${corner} wheel nut`;
  if (id.endsWith('GUN_TIGHTEN')) return `Tighten ${corner} wheel nut`;
  if (id.endsWith('WHEEL_OFF')) return `Remove old ${corner} wheel`;
  return `Fit new ${corner} wheel`;
}

export function replayRoleLabel(role: Role): string {
  if (role === 'FRONT_JACK') return 'Front jack';
  if (role === 'REAR_JACK') return 'Rear jack';
  if (role === 'RELEASE_CONTROLLER') return 'Release controller';
  const corner = corners[role.slice(0, 2)];
  const job = role.endsWith('GUNNER') ? 'gunner' : role.endsWith('WHEEL_OFF') ? 'wheel remover' : 'wheel fitter';
  return `${corner[0].toUpperCase()}${corner.slice(1)} ${job}`;
}

function recordedDuration(from: number | null | undefined, to: number): number | null {
  return typeof from === 'number' && Number.isFinite(from) && to >= from ? to - from : null;
}

/** No nominal bot baseline and no invented legacy timing: unknown raw durations stay unknown. */
export function replayEvents(round: Round, players: Player[] = []): ReplayEvent[] {
  const owners = round.players ?? players;
  const entries = new Map<string, ReplayEvent>();
  const tasks = new Map(round.tasks.map(task => [task.id, task]));
  const add = (task: Task, at: number, detail?: Round['events'][number]) => {
    if (!Number.isFinite(at)) return;
    const ownerId = detail && detail.ownerId !== undefined ? detail.ownerId : task.ownerId;
    const owner = owners.find(player => player.id === ownerId);
    const role = detail?.role ?? task.role;
    const enabledAt = detail?.enabledAt ?? task.enabledAt;
    const human = ownerId !== null && ownerId !== undefined;
    entries.set(task.id, {
      taskId: task.id, task: replayTaskLabel(task.id),
      by: human ? detail?.nickname ?? owner?.nickname ?? 'Crew member' : 'Bot',
      role: replayRoleLabel(role), human, at,
      enabledAt: typeof enabledAt === 'number' ? enabledAt : null,
      stepMs: recordedDuration(enabledAt, at), teamMs: recordedDuration(round.goAt, at),
    });
  };
  for (const task of round.tasks) if (task.completedAt !== null) add(task, task.completedAt);
  for (const event of round.events) {
    const task = tasks.get(event.taskId);
    if (task) add(task, event.at, event);
  }
  return [...entries.values()].sort((a, b) => a.at - b.at || a.taskId.localeCompare(b.taskId));
}

export function replayBounds(round: Round): { start: number; end: number } {
  const last = Math.max(round.goAt, round.finishedAt ?? round.goAt, ...replayEvents(round).map(event => event.at));
  return { start: -REPLAY_APPROACH_MS, end: last - round.goAt + REPLAY_EXIT_MS };
}

export function clampReplayTime(round: Round, value: number): number {
  const { start, end } = replayBounds(round);
  return Math.max(start, Math.min(end, Number.isFinite(value) ? value : start));
}

export function currentReplayEvent(events: ReplayEvent[], epoch: number): ReplayEvent | null {
  for (let index = events.length - 1; index >= 0; index--) if (events[index].at <= epoch) return events[index];
  return null;
}

/** The complete immutable round is passed through; the shared scene resolves poses at presentationTime. */
export function replayRoom(record: ReplayRecord): Room {
  return {
    id: `replay:${record.roundId}`, teamId: record.teamId, name: record.teamName,
    color: record.color, code: '', hostId: '', status: 'COMPLETED',
    players: record.round.players ?? record.players, round: record.round,
    updatedAt: record.round.finishedAt ?? record.round.goAt, solo: record.solo,
  };
}

export function eventSeconds(ms: number | null): string {
  return ms === null ? 'Not recorded' : `${(ms / 1000).toFixed(3)}s`;
}
