export const CORNERS = ['FL', 'FR', 'RL', 'RR'] as const;
export type Corner = (typeof CORNERS)[number];
export type Role = 'FRONT_JACK' | 'REAR_JACK' | 'RELEASE_CONTROLLER' | `${Corner}_${'GUNNER' | 'WHEEL_OFF' | 'WHEEL_ON'}`;
export const ROLES: Role[] = [
  'FRONT_JACK', 'REAR_JACK', 'RELEASE_CONTROLLER',
  ...CORNERS.flatMap((corner): Role[] => [`${corner}_GUNNER`, `${corner}_WHEEL_OFF`, `${corner}_WHEEL_ON`]),
];
export interface Player {
  id: string;
  nickname: string;
  role: Role;
  ready: boolean;
  joinedAt: number;
  connected?: boolean;
  roleNotice?: string | null;
}
export interface Task {
  id: string;
  role: Role;
  cohort: string;
  dependencies: string[];
  ownerId: string | null;
  status: 'LOCKED' | 'AVAILABLE' | 'DONE';
  enabledAt: number | null;
  completedAt: number | null;
  baselineMeanMs: number | null;
  dueAt: number | null;
  reason?: string | null;
}
export interface Round {
  /** Immutable round-start roster; role/name changes in later lobbies cannot rewrite a replay. */
  players?: Player[];
  penalties?: Record<string, { until: number; at: number }>;
  earlyRequests?: Record<string, { playerId: string; taskId: string }>;
  soloTiming?: { seedMs: number };
  id: string;
  status: 'COUNTDOWN' | 'RUNNING' | 'COMPLETED' | 'ABANDONED';
  goAt: number;
  finishedAt: number | null;
  elapsedMs: number | null;
  tasks: Task[];
  samples: { taskId: string; ms: number; at: number }[];
  events: { taskId: string; at: number; reason: string; enabledAt?: number | null; ownerId?: string | null; nickname?: string | null; role?: Role }[];
  /** Private reference-engine idempotency records; clients never choose event times. */
  requests?: Record<string, { playerId: string; taskId: string }>;
}
export interface Room {
  solo?: boolean;
  id: string;
  teamId: string;
  name: string;
  color: string;
  code: string;
  hostId: string;
  status: 'WAITING' | 'COUNTDOWN' | 'RUNNING' | 'COMPLETED' | 'CLOSED';
  players: Player[];
  round: Round | null;
  updatedAt: number;
}
export interface Result {
  id: string;
  roundId: string;
  teamId: string;
  elapsedMs: number;
  finishedAt: number;
}
export interface LeaderboardEntry {
  teamId: string;
  name: string;
  color: string;
  rounds: Result[];
  averageMs: number;
  bestMs: number;
}
export interface Snapshot {
  /** Client-only adapter marker, including an empty local snapshot after Leave. */
  local?: boolean;
  rooms: Room[];
  leaderboard: LeaderboardEntry[];
  replays?: ReplaySummary[];
  serverNow: number;
  identity: { playerId: string | null; isAdmin: boolean };
}
export interface ReplaySummary {
  roundId: string;
  teamId: string;
  teamName: string;
  color: string;
  elapsedMs: number;
  finishedAt: number;
}
export interface ReplayRecord {
  roundId: string;
  teamId: string;
  teamName: string;
  color: string;
  players: Player[];
  round: Round;
  solo?: boolean;
}
const cornerNames: Record<Corner, string> = { FL: 'Front left', FR: 'Front right', RL: 'Rear left', RR: 'Rear right' };
export function roleLabel(role: Role): string {
  if (role === 'FRONT_JACK') return 'Front jack operator';
  if (role === 'REAR_JACK') return 'Rear jack operator';
  if (role === 'RELEASE_CONTROLLER') return 'Release controller';
  const corner = role.slice(0, 2) as Corner;
  const suffix = role.endsWith('GUNNER') ? 'wheel gunner' : role.endsWith('WHEEL_OFF') ? 'old-wheel remover' : 'new-wheel fitter';
  return `${cornerNames[corner]} ${suffix}`;
}
export function taskLabel(task: Task | string): string {
  const id = typeof task === 'string' ? task : task.id;
  const fixed: Record<string, string> = {
    FRONT_LIFT: 'Lift front of car', REAR_LIFT: 'Lift rear of car', FRONT_LOWER: 'Lower front of car', REAR_LOWER: 'Lower rear of car', GREEN_RELEASE: 'Release car',
  };
  if (fixed[id]) return fixed[id];
  const corner = id.slice(0, 2) as Corner;
  const location = cornerNames[corner]?.toLowerCase().replace(' ', '-');
  if (!location) return id.replaceAll('_', ' ').toLowerCase();
  if (id.endsWith('GUN_LOOSEN')) return `Loosen ${location} wheel nut`;
  if (id.endsWith('WHEEL_OFF')) return `Remove old ${location} wheel`;
  if (id.endsWith('WHEEL_ON')) return `Fit new ${location} wheel`;
  if (id.endsWith('GUN_TIGHTEN')) return `Tighten ${location} wheel nut`;
  return id.replaceAll('_', ' ').toLowerCase();
}
