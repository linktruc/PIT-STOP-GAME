import { CORNERS, ROLES, type Player, type Role, type Round, type Task } from './types';

export const MAX_HUMAN_REACTION_MS = 120_000;

function clock(value: number): void {
  if (!Number.isFinite(value) || value < 0) throw new Error('A finite nonnegative authoritative timestamp is required.');
}

/** One role *family* each for the first five crew, followed by specialist coverage.
 * Individual wheel positions remain unique even when the families repeat. */
export type PlayableRoleFamily = 'GUNNER' | 'JACK' | 'WHEEL_OFF' | 'WHEEL_ON' | 'RELEASE';
export function playableRoleFamily(role: Role): PlayableRoleFamily {
  if (role.endsWith('_GUNNER')) return 'GUNNER';
  if (role.endsWith('_JACK')) return 'JACK';
  if (role.endsWith('_WHEEL_OFF')) return 'WHEEL_OFF';
  if (role.endsWith('_WHEEL_ON')) return 'WHEEL_ON';
  return 'RELEASE';
}

/** Pure reference assignment; production lobby SQL keeps existing roles stable. */
export function assignRoles(players: Player[], random: () => number = Math.random): Player[] {
  if (players.length > ROLES.length) throw new Error('A team can have at most 15 players.');
  if (new Set(players.map((player) => player.id)).size !== players.length) throw new Error('Player IDs must be unique.');
  const assigned: Role[] = [];
  for (let index = 0; index < players.length; index++) {
    const unused = ROLES.filter((role) => !assigned.includes(role));
    const families = new Set(assigned.map(playableRoleFamily));
    let candidates: Role[];
    if (index === 0) {
      // Jack opens the restored sequence, seeding the first real reaction.
      candidates = unused.filter((role) => playableRoleFamily(role) === 'JACK');
    } else if (index === 1) {
      // A real Gunner is required for the first reference clock, right after a Jack.
      candidates = unused.filter((role) => playableRoleFamily(role) === 'GUNNER');
    } else if (families.size < 5) {
      // Third to fifth fill old-wheel, new-wheel and signal (no repeats).
      candidates = unused.filter((role) => !families.has(playableRoleFamily(role)));
    } else {
      const priority = unused.filter((role) => ['GUNNER', 'JACK'].includes(playableRoleFamily(role)));
      candidates = priority.length ? priority : unused;
    }
    const value = random();
    if (!Number.isFinite(value) || value < 0 || value >= 1) throw new Error('Random values must be in [0, 1).');
    assigned.push(candidates[Math.floor(value * candidates.length)]);
  }
  return players.map((player, index) => ({ ...player, role: assigned[index], ready: false }));
}

export function createTasks(players: Player[]): Task[] {
  const owners = new Map<Role, string>();
  const ids = new Set<string>();
  for (const player of players) {
    if (!ROLES.includes(player.role)) throw new Error('Unknown playable role.');
    if (owners.has(player.role) || ids.has(player.id)) throw new Error('Each player and role must be unique.');
    owners.set(player.role, player.id);
    ids.add(player.id);
  }
  const tasks: Task[] = [];
  function add(id: string, role: Role, cohort: string, dependencies: string[]) {
    tasks.push({ id, role, cohort, dependencies, ownerId: owners.get(role) ?? null, status: 'LOCKED', enabledAt: null, completedAt: null, baselineMeanMs: null, dueAt: null, reason: null });
  }
  add('FRONT_LIFT', 'FRONT_JACK', 'LIFT', []);
  add('REAR_LIFT', 'REAR_JACK', 'LIFT', []);
  for (const corner of CORNERS) {
    const lift = corner.startsWith('F') ? 'FRONT_LIFT' : 'REAR_LIFT';
    add(`${corner}_GUN_LOOSEN`, `${corner}_GUNNER`, 'GUN_LOOSEN', [lift]);
    add(`${corner}_WHEEL_OFF`, `${corner}_WHEEL_OFF`, 'WHEEL_OFF', [`${corner}_GUN_LOOSEN`]);
    add(`${corner}_WHEEL_ON`, `${corner}_WHEEL_ON`, 'WHEEL_ON', [`${corner}_WHEEL_OFF`]);
    add(`${corner}_GUN_TIGHTEN`, `${corner}_GUNNER`, 'GUN_TIGHTEN', [`${corner}_WHEEL_ON`]);
  }
  add('FRONT_LOWER', 'FRONT_JACK', 'LOWER', ['FL_GUN_TIGHTEN', 'FR_GUN_TIGHTEN']);
  add('REAR_LOWER', 'REAR_JACK', 'LOWER', ['RL_GUN_TIGHTEN', 'RR_GUN_TIGHTEN']);
  add('GREEN_RELEASE', 'RELEASE_CONTROLLER', 'GREEN_RELEASE', ['FRONT_LOWER', 'REAR_LOWER', ...CORNERS.map((corner) => `${corner}_GUN_TIGHTEN`)]);
  return tasks;
}

let nextRoundId = 0;
export function createRound(players: Player[], goAt: number, id = `round-${++nextRoundId}`): Round {
  clock(goAt);
  if (!players.some((player) => player.role.endsWith('_JACK'))) {
    throw new Error('At least one human jack operator is required.');
  }
  return { id, players: structuredClone(players), status: 'COUNTDOWN', goAt, finishedAt: null, elapsedMs: null, tasks: createTasks(players), samples: [], events: [], requests: {} };
}

/** Explicit local-only accommodation; ranked createRound requires an opening human jack. */
export function createSoloRound(players: Player[], goAt: number, id: string): Round {
  if (players.some(player => player.role.endsWith('_JACK'))) {
    const round = createRound(players, goAt, id);
    round.soloTiming = { seedMs: 700 };
    return round;
  }
  clock(goAt);
  return { id, players: structuredClone(players), status: 'COUNTDOWN', goAt, finishedAt: null, elapsedMs: null, tasks: createTasks(players), samples: [], events: [], requests: {}, soloTiming: { seedMs: 700 } };
}

export const EARLY_LOCKOUT_MS = 2000;
/** Only an owner's outstanding primary action can incur a personal lockout. */
export function earlyAction(round: Round, playerId: string, taskId: string, now: number, requestId: string): Round {
  clock(now);
  if (!requestId || requestId.length > 128) throw new Error('A valid request ID is required.');
  const prior = Object.hasOwn(round.earlyRequests ?? {}, requestId) ? round.earlyRequests![requestId] : undefined;
  if (prior) { if (prior.playerId !== playerId || prior.taskId !== taskId) throw new Error('Request ID belongs to another early action.'); return round; }
  const task = round.tasks.find(task => task.id === taskId);
  if (!task || task.ownerId !== playerId) throw new Error('This task belongs to another crew member.');
  reconcile(round, now);
  round.earlyRequests ??= {};
  Object.defineProperty(round.earlyRequests, requestId, { value: { playerId, taskId }, enumerable: true });
  if (task.status === 'DONE' || !['COUNTDOWN', 'RUNNING'].includes(round.status)) return round;
  if ((round.penalties?.[playerId]?.until ?? 0) > now) return round;
  if (round.status === 'COUNTDOWN' || task.status === 'LOCKED') {
    round.penalties ??= {};
    Object.defineProperty(round.penalties, playerId, { value: { until: now + EARLY_LOCKOUT_MS, at: now }, enumerable: true, writable: true, configurable: true });
  } else if (task.status === 'AVAILABLE') {
    // The UI may have sent an early-action intent from a stale LOCKED snapshot.
    // Judge the press at authoritative arrival, so an already-unlocked task succeeds.
    return submitAction(round, playerId, taskId, now, requestId);
  }
  return round;
}

function soloJackFallback(round: Round): boolean {
  return !!round.soloTiming && round.tasks.some(t => t.cohort === 'LIFT' && t.ownerId !== null)
    && !round.tasks.some(t => t.cohort === 'GUN_LOOSEN' && t.ownerId !== null);
}

/** A schedule snapshots only reactions that existed at its effective eligibility event. */
export function humanMeanAt(round: Round, at: number): number | null {
  const samples = round.samples.filter((sample) => Number.isFinite(sample.at) && sample.at >= round.goAt && sample.at <= at && Number.isFinite(sample.ms) && sample.ms >= 0 && sample.ms <= MAX_HUMAN_REACTION_MS);
  if (soloJackFallback(round)) {
    const firstGunner = round.tasks.find(t => t.cohort === 'GUN_LOOSEN' && t.completedAt !== null && t.completedAt <= at);
    if (!firstGunner) return null;
    // One parallel gunner cohort is one reference observation, never four samples.
    return (samples.reduce((total, sample) => total + sample.ms, 0) + round.soloTiming!.seedMs) / (samples.length + 1);
  }
  // Solo without a human Jack still has one real opening Jack BOT observation.
  // Parallel Jack bots count once; never let a 36ms Gunner erase their 700ms lift.
  if (round.soloTiming && !round.tasks.some(t => t.cohort === 'LIFT' && t.ownerId !== null) && round.tasks.some(t => t.cohort === 'GUN_LOOSEN' && t.ownerId !== null)) {
    const jack = round.tasks.find(t => t.cohort === 'LIFT' && t.completedAt !== null && t.completedAt <= at && t.enabledAt !== null);
    if (!jack) return null;
    const gunner = round.tasks.find(t => t.cohort === 'GUN_LOOSEN' && t.completedAt !== null && t.completedAt <= at && t.enabledAt !== null && t.ownerId !== null);
    if (!gunner) return null;
    const bootstrap = [jack.completedAt! - jack.enabledAt!];
    return (samples.reduce((total, sample) => total + sample.ms, 0) + bootstrap.reduce((a,b) => a+b,0)) / (samples.length + bootstrap.length);
  }
  return samples.length ? samples.reduce((total, sample) => total + sample.ms, 0) / samples.length : null;
}

function enableTasks(round: Round, now: number): void {
  const byId = new Map(round.tasks.map((task) => [task.id, task]));
  for (const task of round.tasks) {
    if (task.status !== 'LOCKED') continue;
    const predecessors = task.dependencies.map((id) => byId.get(id));
    if (predecessors.some((parent) => !parent || parent.status !== 'DONE' || parent.completedAt === null)) continue;
    const enabledAt = Math.max(round.goAt, ...predecessors.map((parent) => parent!.completedAt!));
    if (enabledAt > now) continue;
    task.status = 'AVAILABLE';
    task.enabledAt = enabledAt;
    // Ranked bots are held for their HUMAN reference on each of the two
    // opening cohorts. Even a slow first Jack must not set gunner bot deadlines.
    const hasHumanInCohort = round.tasks.some(peer => peer.cohort === task.cohort && peer.ownerId !== null);
    const syncOpening = ['LIFT', 'GUN_LOOSEN'].includes(task.cohort) && hasHumanInCohort;
    if (task.ownerId === null && !syncOpening) {
      // Solo can have no human jack or gunner; only in that local practice case
      // use the 700ms bootstrap so a test run cannot deadlock.
      const mean = task.cohort === 'GUN_LOOSEN' && soloJackFallback(round)
        ? round.soloTiming!.seedMs : humanMeanAt(round, enabledAt) ?? round.soloTiming?.seedMs ?? null;
      if (mean === null) throw new Error('A bot cannot be scheduled before the first real human reaction.');
      task.baselineMeanMs = mean;
      task.dueAt = enabledAt + mean;
    }
  }
}

type BotEvent = { task: Task; at: number; reason: string };
function botEvent(round: Round, task: Task): BotEvent | null {
  if (task.ownerId !== null || task.status !== 'AVAILABLE' || task.enabledAt === null) return null;
  let event: BotEvent | null = task.dueAt === null ? null : { task, at: task.dueAt, reason: 'BASELINE_DUE' };
  const humans = round.tasks.filter((peer) => peer.cohort === task.cohort && peer.ownerId !== null);
  // Gunners are the INITIAL reference gate: the FIRST human gunner completing
  // unlocks bot peers simultaneously, not the Jack reaction alone and not the
  // last of several human gunners. This is separate from the later mean.
  if (task.cohort === 'GUN_LOOSEN' && humans.length > 0) {
    const firstGunnerAt = Math.min(...humans.filter(peer => peer.status === 'DONE' && peer.completedAt !== null).map(peer => peer.completedAt!));
    if (Number.isFinite(firstGunnerAt)) return { task, at: Math.max(task.enabledAt, firstGunnerAt), reason: 'OPENING_GUNNER_SYNC' };
    return null;
  }
  if (humans.length > 0 && humans.every((peer) => peer.status === 'DONE' && peer.completedAt !== null)) {
    const lastHumanAt = Math.max(...humans.map((peer) => peer.completedAt!));
    const capAt = Math.max(task.enabledAt, lastHumanAt);
    if (event === null || capAt <= event.at) {
      event = {
        task, at: capAt,
        reason: task.cohort === 'LIFT' ? 'OPENING_JACK_SYNC' : task.enabledAt >= lastHumanAt ? 'COHORT_ALREADY_FINISHED' : 'PARALLEL_HUMAN_CAP',
      };
    }
  }
  return event;
}

function complete(round: Round, task: Task, at: number, reason: string): void {
  if (task.status !== 'AVAILABLE' || task.enabledAt === null || at < task.enabledAt) throw new Error('Invalid causal task completion.');
  task.status = 'DONE';
  task.completedAt = at;
  task.reason = reason;
  round.events.push({ taskId: task.id, at, reason, enabledAt: task.enabledAt, ownerId: task.ownerId, nickname: round.players?.find(player => player.id === task.ownerId)?.nickname ?? null, role: task.role });
  if (task.id === 'GREEN_RELEASE') {
    round.status = 'COMPLETED';
    round.finishedAt = at;
    round.elapsedMs = at - round.goAt;
  }
}

/** Reconstruct overdue events at their deadlines, never at the heartbeat receipt time. */
export function reconcile(round: Round, now: number): Round {
  clock(now);
  if (round.status === 'COMPLETED' || round.status === 'ABANDONED' || now < round.goAt) return round;
  round.status = 'RUNNING';
  for (let guard = 0; guard <= round.tasks.length; guard++) {
    enableTasks(round, now);
    const next = round.tasks.map((task) => botEvent(round, task)).filter((event): event is BotEvent => event !== null && event.at <= now).sort((a, b) => a.at - b.at || a.task.id.localeCompare(b.task.id))[0];
    if (!next) return round;
    complete(round, next.task, next.at, next.reason);
    if (round.finishedAt !== null) return round;
  }
  throw new Error('The task graph could not reach a stable state.');
}

/** In production `now` comes from the transactional database clock, never a request payload. */
export function submitAction(round: Round, playerId: string, taskId: string, now: number, requestId?: string): Round {
  clock(now);
  const previous = requestId && round.requests && Object.hasOwn(round.requests, requestId) ? round.requests[requestId] : undefined;
  if (previous) {
    if (previous.playerId !== playerId || previous.taskId !== taskId) throw new Error('An action request ID cannot be reused for another action.');
    return round;
  }
  // Earlier bot deadlines must be processed BEFORE adding this click's human sample.
  reconcile(round, now);
  if (round.status !== 'RUNNING') throw new Error(round.status === 'COUNTDOWN' ? 'Wait for GO signal.' : 'This round is no longer running.');
  const task = round.tasks.find((item) => item.id === taskId);
  if (!task || task.ownerId !== playerId) throw new Error('This task belongs to another crew member.');
  if ((round.penalties?.[playerId]?.until ?? 0) > now) throw new Error('Personal lockout is still active.');
  if (task.status !== 'AVAILABLE' || task.enabledAt === null || now < task.enabledAt) throw new Error(task.status === 'DONE' ? 'This action has already been completed.' : 'This action is locked by its prerequisites.');
  const latestEventAt = Math.max(round.goAt, ...round.events.map((event) => event.at));
  if (now < latestEventAt) throw new Error('An action cannot precede an already accepted event.');
  if (now - task.enabledAt > MAX_HUMAN_REACTION_MS) throw new Error('The 120-second action window has expired. Return to the lobby and start a new round.');
  complete(round, task, now, 'HUMAN_ACTION');
  round.samples.push({ taskId, ms: now - task.enabledAt, at: now });
  if (requestId) {
    round.requests ??= {};
    Object.defineProperty(round.requests, requestId, { value: { playerId, taskId }, enumerable: true, writable: true, configurable: true });
  }
  // Includes exact opening-jack sync, same-transaction caps and causal propagation.
  return reconcile(round, now);
}
