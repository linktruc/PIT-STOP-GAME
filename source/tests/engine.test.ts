import { describe, expect, it } from 'vitest';
import { assignRoles, createRound, createTasks, humanMeanAt, MAX_HUMAN_REACTION_MS, reconcile, submitAction } from '../src/engine';
import { CORNERS, ROLES, roleLabel, taskLabel, type Player, type Role, type Round, type Task } from '../src/types';

const player = (role: Role, id: string = role): Player => ({ id, role, nickname: `Crew ${id}`, ready: true, joinedAt: 0 });
const task = (round: Round, id: string): Task => round.tasks.find((item) => item.id === id)!;
const click = (round: Round, id: string, at: number, requestId?: string) => submitAction(round, task(round, id).ownerId!, id, at, requestId);
function seeded(seed: number) {
  let state = seed;
  return () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
}
function stageRound(roles: Role[], cohort: string, enabledAt = 1000): Round {
  const round = createRound(roles.map((role) => player(role)), 0);
  const order = ['LIFT', 'GUN_LOOSEN', 'WHEEL_OFF', 'WHEEL_ON', 'GUN_TIGHTEN', 'LOWER', 'GREEN_RELEASE'];
  for (const item of round.tasks) {
    if (order.indexOf(item.cohort) < order.indexOf(cohort)) {
      item.status = 'DONE';
      item.enabledAt = 0;
      item.completedAt = enabledAt;
    }
  }
  round.samples.push({ taskId: 'FRONT_LIFT', ms: 400, at: 400 });
  return reconcile(round, enabledAt);
}

function finishAutomatically(round: Round): Round {
  let now = round.goAt;
  for (let count = 0; count < 100 && round.status !== 'COMPLETED'; count++) {
    reconcile(round, now);
    const humans = round.tasks.filter((item) => item.status === 'AVAILABLE' && item.ownerId !== null);
    if (humans.length) {
      const planned = humans.map((item) => ({ item, at: Math.max(now + 1, item.enabledAt! + 80 + item.id.length * 7) })).sort((a, b) => a.at - b.at);
      now = planned[0].at;
      click(round, planned[0].item.id, now, `auto-${count}`);
    } else {
      const deadlines = round.tasks.filter((item) => item.status === 'AVAILABLE' && item.dueAt !== null).map((item) => item.dueAt!);
      if (!deadlines.length) throw new Error('Round stalled without an available human or bot deadline.');
      now = Math.max(now, Math.min(...deadlines));
      reconcile(round, now);
    }
  }
  expect(round.status).toBe('COMPLETED');
  return round;
}

describe('role assignment and complete fixed DAG', () => {
  for (let size = 4; size <= 15; size++) {
    it(`assigns ${size} distinct human roles and ${15 - size} core bots, always a human jack`, () => {
      for (let seed = 0; seed < 50; seed++) {
        const roster = Array.from({ length: size }, (_, index) => player('FRONT_JACK', `p-${index}`));
        const assigned = assignRoles(roster, seeded(seed));
        expect(new Set(assigned.map((member) => member.role)).size).toBe(size);
        expect(assigned.some((member) => member.role.endsWith('_JACK'))).toBe(true);
        expect(assigned.every((member) => ROLES.includes(member.role) && !member.ready)).toBe(true);
        expect(roster.every((member) => member.ready)).toBe(true);
        const graph = createTasks(assigned);
        expect(graph).toHaveLength(21);
        expect(new Set(graph.map((node) => node.role)).size).toBe(15);
        expect(new Set(graph.filter((node) => node.ownerId === null).map((node) => node.role)).size).toBe(15 - size);
      }
    });
  }
  it('allows partial lobby rosters, rejects a 16th player and duplicate public identities', () => {
    expect(assignRoles([player('FRONT_JACK')], seeded(42))).toHaveLength(1);
    expect(assignRoles([])).toEqual([]);
    expect(() => assignRoles(Array.from({ length: 16 }, (_, index) => player('FRONT_JACK', `${index}`)))).toThrow(/15/);
    expect(() => assignRoles([player('FRONT_JACK', 'same'), player('REAR_JACK', 'same')])).toThrow(/unique/);
    expect(() => assignRoles([player('FRONT_JACK')], () => 1)).toThrow(/Random/);
    expect(() => createTasks([player('FRONT_JACK', 'a'), player('FRONT_JACK', 'b')])).toThrow(/unique/);
    expect(() => createRound([player('FL_GUNNER')], 0)).toThrow(/human jack/);
  });
  it('contains independent corner branches, shared two-step operators, axle-specific lowers and safe release', () => {
    const round = createRound(ROLES.map((role) => player(role)), 0);
    for (const corner of CORNERS) {
      expect(task(round, `${corner}_GUN_LOOSEN`).dependencies).toEqual([corner.startsWith('F') ? 'FRONT_LIFT' : 'REAR_LIFT']);
      expect(task(round, `${corner}_WHEEL_OFF`).dependencies).toEqual([`${corner}_GUN_LOOSEN`]);
      expect(task(round, `${corner}_WHEEL_ON`).dependencies).toEqual([`${corner}_WHEEL_OFF`]);
      expect(task(round, `${corner}_GUN_TIGHTEN`).dependencies).toEqual([`${corner}_WHEEL_ON`]);
      expect(task(round, `${corner}_GUN_TIGHTEN`).ownerId).toBe(task(round, `${corner}_GUN_LOOSEN`).ownerId);
    }
    expect(task(round, 'FRONT_LOWER').dependencies).toEqual(['FL_GUN_TIGHTEN', 'FR_GUN_TIGHTEN']);
    expect(task(round, 'REAR_LOWER').dependencies).toEqual(['RL_GUN_TIGHTEN', 'RR_GUN_TIGHTEN']);
    expect(task(round, 'GREEN_RELEASE').dependencies).toHaveLength(6);
    expect(task(round, 'FRONT_LOWER').ownerId).toBe(task(round, 'FRONT_LIFT').ownerId);
    expect(ROLES).toHaveLength(15);
    expect(ROLES.every((role) => roleLabel(role).length > 4)).toBe(true);
    expect(round.tasks.every((node) => taskLabel(node).length > 3)).toBe(true);
  });
  it('advances a corner without a global wheel-stage barrier', () => {
    const round = createRound(ROLES.map((role) => player(role)), 0);
    click(round, 'FRONT_LIFT', 100);
    click(round, 'FL_GUN_LOOSEN', 200);
    expect(task(round, 'FL_WHEEL_OFF').status).toBe('AVAILABLE');
    expect(task(round, 'FR_GUN_LOOSEN').status).toBe('AVAILABLE');
    expect(task(round, 'RL_GUN_LOOSEN').status).toBe('LOCKED');
    click(round, 'FL_WHEEL_OFF', 250);
    click(round, 'FL_WHEEL_ON', 300);
    click(round, 'FL_GUN_TIGHTEN', 350);
    expect(task(round, 'FRONT_LOWER').status).toBe('LOCKED');
    expect(task(round, 'GREEN_RELEASE').status).toBe('LOCKED');
  });
});

describe('opening lift and arithmetic action samples', () => {
  it.each(['FRONT_JACK', 'REAR_JACK'] as Role[])('synchronizes the opposite bot lift exactly with the %s human', (role) => {
    const round = createRound([player(role), player('FL_WHEEL_ON'), player('FR_WHEEL_OFF'), player('RELEASE_CONTROLLER')], 0);
    reconcile(round, 399);
    expect(round.events).toEqual([]);
    const lift = role === 'FRONT_JACK' ? 'FRONT_LIFT' : 'REAR_LIFT';
    click(round, lift, 400);
    expect(task(round, 'FRONT_LIFT').completedAt).toBe(400);
    expect(task(round, 'REAR_LIFT').completedAt).toBe(400);
    expect(round.events[1].reason).toBe('OPENING_JACK_SYNC');
    expect(round.samples).toEqual([{ taskId: lift, ms: 400, at: 400 }]);
    expect(round.tasks.filter((node) => node.cohort === 'GUN_LOOSEN').every((node) => node.enabledAt === 400)).toBe(true);
  });
  it('lets two human jack lifts act independently and samples each reaction separately', () => {
    const round = createRound([player('FRONT_JACK'), player('REAR_JACK')], 0);
    click(round, 'FRONT_LIFT', 200);
    expect(task(round, 'REAR_LIFT').status).toBe('AVAILABLE');
    expect(task(round, 'RL_GUN_LOOSEN').status).toBe('LOCKED');
    click(round, 'REAR_LIFT', 500);
    expect(round.samples.map((sample) => sample.ms)).toEqual([200, 500]);
    expect(task(round, 'FL_GUN_LOOSEN').baselineMeanMs).toBe(200);
    expect(task(round, 'RL_GUN_LOOSEN').baselineMeanMs).toBe(350);
    expect(humanMeanAt(round, 499)).toBe(200);
    expect(humanMeanAt(round, 500)).toBe(350);
  });
  it('takes means over completed actions and excludes future/invalid/unbounded samples', () => {
    const round = createRound([player('FRONT_JACK')], 0);
    round.samples = [
      { taskId: 'a', ms: 100, at: 100 }, { taskId: 'b', ms: 300, at: 200 },
      { taskId: 'future', ms: 1000, at: 9999 }, { taskId: 'bad', ms: -1, at: 100 },
      { taskId: 'bad2', ms: Infinity, at: 100 }, { taskId: 'bad3', ms: MAX_HUMAN_REACTION_MS + 1, at: 100 },
    ];
    expect(humanMeanAt(round, 199)).toBe(100);
    expect(humanMeanAt(round, 200)).toBe(200);
  });
});

describe('parallel cohort fairness and causal schedules', () => {
  it('caps one eligible WHEEL_ON bot at the third human finish (+150/+200/+250), preserving its +400 baseline', () => {
    const round = stageRound(['FRONT_JACK', 'FL_WHEEL_ON', 'FR_WHEEL_ON', 'RL_WHEEL_ON'], 'WHEEL_ON');
    const bot = task(round, 'RR_WHEEL_ON');
    expect(bot.dueAt).toBe(1400);
    click(round, 'FL_WHEEL_ON', 1150);
    click(round, 'FR_WHEEL_ON', 1200);
    expect(bot.status).toBe('AVAILABLE');
    click(round, 'RL_WHEEL_ON', 1250);
    expect(bot.completedAt).toBe(1250);
    expect(bot.dueAt).toBe(1400);
    expect(bot.baselineMeanMs).toBe(400);
    expect(bot.reason).toBe('PARALLEL_HUMAN_CAP');
  });
  it('lets a bot finish at its baseline before a slow human peer', () => {
    const round = stageRound(['FRONT_JACK', 'FL_WHEEL_ON'], 'WHEEL_ON');
    reconcile(round, 1400);
    expect(task(round, 'RR_WHEEL_ON').completedAt).toBe(1400);
    expect(task(round, 'FL_WHEEL_ON').status).toBe('AVAILABLE');
    click(round, 'FL_WHEEL_ON', 1800);
    expect(task(round, 'RR_WHEEL_ON').completedAt).toBe(1400);
  });
  it('uses normal delays in an all-bot loosen cohort', () => {
    const round = createRound([player('FRONT_JACK'), player('FL_WHEEL_ON'), player('RR_WHEEL_OFF'), player('RELEASE_CONTROLLER')], 0);
    click(round, 'FRONT_LIFT', 400);
    reconcile(round, 799);
    expect(round.tasks.filter((node) => node.cohort === 'GUN_LOOSEN').every((node) => node.status === 'AVAILABLE' && node.dueAt === 800)).toBe(true);
    reconcile(round, 800);
    expect(round.tasks.filter((node) => node.cohort === 'GUN_LOOSEN').every((node) => node.completedAt === 800)).toBe(true);
  });
  it('never breaks prerequisites and immediately caps a late-eligible bot after its human cohort is finished', () => {
    const round = stageRound(['FRONT_JACK', 'FL_WHEEL_ON', 'RR_WHEEL_OFF'], 'WHEEL_ON');
    const predecessor = task(round, 'RR_WHEEL_OFF');
    predecessor.status = 'AVAILABLE';
    predecessor.enabledAt = 1000;
    predecessor.completedAt = null;
    const bot = task(round, 'RR_WHEEL_ON');
    bot.status = 'LOCKED'; bot.enabledAt = null; bot.dueAt = null; bot.baselineMeanMs = null;
    click(round, 'FL_WHEEL_ON', 1150);
    expect(bot.status).toBe('LOCKED');
    click(round, 'RR_WHEEL_OFF', 1300);
    expect(bot.enabledAt).toBe(1300);
    expect(bot.completedAt).toBe(1300);
    expect(bot.reason).toBe('COHORT_ALREADY_FINISHED');
    expect(bot.completedAt).toBeGreaterThanOrEqual(predecessor.completedAt!);
  });
  it('caps a mixed lower cohort but gives singleton bot release the current mean delay', () => {
    const round = stageRound(['FRONT_JACK', 'FL_WHEEL_ON', 'FR_WHEEL_OFF', 'RL_WHEEL_ON'], 'LOWER');
    expect(task(round, 'REAR_LOWER').dueAt).toBe(1400);
    click(round, 'FRONT_LOWER', 1220);
    expect(task(round, 'REAR_LOWER').completedAt).toBe(1220);
    expect(task(round, 'REAR_LOWER').reason).toBe('PARALLEL_HUMAN_CAP');
    const release = task(round, 'GREEN_RELEASE');
    expect(release.baselineMeanMs).toBe(310);
    expect(release.enabledAt).toBe(1220);
    expect(release.dueAt).toBe(1530);
    reconcile(round, 1529);
    expect(release.status).toBe('AVAILABLE');
    reconcile(round, 9999);
    expect(release.completedAt).toBe(1530);
    expect(round.elapsedMs).toBe(1530);
  });
  it('reconciles overdue bots before a click so old schedules cannot read that future sample', () => {
    const round = createRound([player('FRONT_JACK'), player('REAR_JACK')], 0);
    click(round, 'FRONT_LIFT', 100);
    // A late heartbeat arrives with the second human jack at t=1000.
    click(round, 'REAR_LIFT', 1000);
    expect(task(round, 'FL_GUN_LOOSEN').completedAt).toBe(200);
    expect(task(round, 'FL_WHEEL_OFF').enabledAt).toBe(200);
    expect(task(round, 'FL_WHEEL_OFF').baselineMeanMs).toBe(100);
    expect(task(round, 'FL_WHEEL_OFF').completedAt).toBe(300);
    expect(task(round, 'FL_WHEEL_ON').completedAt).toBe(400);
    expect(task(round, 'FL_GUN_TIGHTEN').completedAt).toBe(500);
    expect(task(round, 'RL_GUN_LOOSEN').baselineMeanMs).toBe(550);
  });
  it('does not include a later human click at the exact same timestamp as a bot scheduling event', () => {
    const round = createRound([player('FRONT_JACK'), player('REAR_JACK')], 0);
    click(round, 'FRONT_LIFT', 100);
    // Front wheel-off is due at 300 and schedules wheel-on before this rear click is sampled.
    click(round, 'REAR_LIFT', 300);
    expect(task(round, 'FL_WHEEL_OFF').completedAt).toBe(300);
    expect(task(round, 'FL_WHEEL_ON').enabledAt).toBe(300);
    expect(task(round, 'FL_WHEEL_ON').baselineMeanMs).toBe(100);
    expect(task(round, 'RL_GUN_LOOSEN').baselineMeanMs).toBe(200);
  });
  it('processes same-time baseline events deterministically and delayed reconciliation idempotently', () => {
    const make = () => { const round = createRound([player('FRONT_JACK'), player('RELEASE_CONTROLLER')], 0, 'same'); click(round, 'FRONT_LIFT', 400); return round; };
    const a = make(); const b = make();
    reconcile(a, 10000);
    for (let now = 401; now <= 10000; now += 37) reconcile(b, now);
    reconcile(b, 10000);
    expect(a).toEqual(b);
    expect(a.events).toHaveLength(new Set(a.events.map((event) => event.taskId)).size);
    expect(a.events.every((event, index) => index === 0 || event.at >= a.events[index - 1].at)).toBe(true);
    const snapshot = JSON.stringify(a);
    reconcile(a, 20000);
    expect(JSON.stringify(a)).toBe(snapshot);
  });
  it('does not invent a default bot delay without valid human samples', () => {
    const round = createRound([player('FRONT_JACK')], 0);
    const lift = task(round, 'FRONT_LIFT');
    lift.status = 'DONE'; lift.enabledAt = 0; lift.completedAt = 100;
    expect(() => reconcile(round, 100)).toThrow(/first real human/);
  });
});

describe('action authorization, validation, idempotency and frozen score', () => {
  it('rejects countdown, wrong owner, locked, duplicate and backdated actions', () => {
    const round = createRound(ROLES.map((role) => player(role)), 1000);
    expect(() => click(round, 'FRONT_LIFT', 999)).toThrow(/GO/);
    expect(() => submitAction(round, 'outsider', 'FRONT_LIFT', 1100)).toThrow(/another crew/);
    expect(() => click(round, 'FL_WHEEL_ON', 1100)).toThrow(/locked/);
    click(round, 'FRONT_LIFT', 1200);
    expect(() => click(round, 'FRONT_LIFT', 1201)).toThrow(/already/);
    expect(() => click(round, 'REAR_LIFT', 1199)).toThrow(/precede/);
    expect(round.samples).toHaveLength(1);
  });
  it('accepts exactly-once request retries, including unusual opaque tokens, and rejects token reuse', () => {
    const round = createRound([player('FRONT_JACK'), player('REAR_JACK')], 0);
    click(round, 'FRONT_LIFT', 400, '__proto__');
    const snapshot = JSON.stringify(round);
    click(round, 'FRONT_LIFT', 9999, '__proto__');
    expect(JSON.stringify(round)).toBe(snapshot);
    expect(() => click(round, 'REAR_LIFT', 500, '__proto__')).toThrow(/reused/);
    click(round, 'REAR_LIFT', 500, 'toString');
    expect(round.samples).toHaveLength(2);
  });
  it('rejects nonfinite/negative authoritative timestamps and reactions over the 120-second bound', () => {
    const round = createRound([player('FRONT_JACK')], 0);
    for (const value of [NaN, Infinity, -1]) {
      expect(() => reconcile(round, value)).toThrow(/timestamp/);
      expect(() => click(round, 'FRONT_LIFT', value)).toThrow(/timestamp/);
    }
    expect(() => createRound([player('FRONT_JACK')], -1)).toThrow(/timestamp/);
    expect(() => click(round, 'FRONT_LIFT', MAX_HUMAN_REACTION_MS + 1)).toThrow(/window/);
    expect(round.samples).toHaveLength(0);
    expect(task(round, 'FRONT_LIFT').status).toBe('AVAILABLE');
    click(round, 'FRONT_LIFT', MAX_HUMAN_REACTION_MS);
    expect(round.samples[0].ms).toBe(MAX_HUMAN_REACTION_MS);
  });
  it('permits zero-ms samples without negative durations or runaway zero-delay bot chains', () => {
    const round = createRound([player('FRONT_JACK'), player('RELEASE_CONTROLLER')], 1000);
    click(round, 'FRONT_LIFT', 1000);
    expect(round.samples[0].ms).toBe(0);
    expect(round.events.every((event) => event.at === 1000)).toBe(true);
    // Front lower is human and must still be explicitly accepted.
    expect(task(round, 'FRONT_LOWER').status).toBe('AVAILABLE');
    click(round, 'FRONT_LOWER', 1000);
    click(round, 'GREEN_RELEASE', 1000);
    expect(round.status).toBe('COMPLETED');
    expect(round.elapsedMs).toBe(0);
    expect(round.events).toHaveLength(21);
  });
  it('freezes the one actual release-minus-GO score exactly once, never summing overlapping reactions', () => {
    const round = finishAutomatically(createRound(ROLES.map((role) => player(role)), 5000));
    expect(round.elapsedMs).toBe(task(round, 'GREEN_RELEASE').completedAt! - 5000);
    expect(round.samples.reduce((sum, sample) => sum + sample.ms, 0)).toBeGreaterThan(round.elapsedMs!);
    const score = round.elapsedMs;
    const snapshot = JSON.stringify(round);
    reconcile(round, 999999);
    expect(() => click(round, 'GREEN_RELEASE', 999999)).toThrow(/no longer running/);
    expect(round.elapsedMs).toBe(score);
    expect(JSON.stringify(round)).toBe(snapshot);
  });
  it('does not advance abandoned rounds', () => {
    const round = createRound([player('FRONT_JACK')], 0);
    round.status = 'ABANDONED';
    reconcile(round, 100000);
    expect(round.events).toEqual([]);
    expect(round.elapsedMs).toBeNull();
  });
});

describe('full-round deterministic causal invariants', () => {
  for (let size = 4; size <= 15; size++) {
    it(`finishes seeded ${size}-human rounds with all 21 tasks, valid causal times and one event per task`, () => {
      for (let seed = 1; seed <= 10; seed++) {
        const roster = assignRoles(Array.from({ length: size }, (_, index) => player('FRONT_JACK', `p${index}`)), seeded(seed));
        const round = finishAutomatically(createRound(roster, 1000, `${size}-${seed}`));
        expect(round.events).toHaveLength(21);
        expect(new Set(round.events.map((event) => event.taskId)).size).toBe(21);
        expect(round.events[0].reason).toBe('HUMAN_ACTION');
        expect(round.samples).toHaveLength(round.tasks.filter((node) => node.ownerId !== null).length);
        for (const node of round.tasks) {
          expect(node.status).toBe('DONE');
          expect(node.enabledAt).toBeGreaterThanOrEqual(round.goAt);
          expect(node.completedAt).toBeGreaterThanOrEqual(node.enabledAt!);
          for (const dependency of node.dependencies) expect(node.enabledAt).toBeGreaterThanOrEqual(task(round, dependency).completedAt!);
          if (node.ownerId === null && node.cohort !== 'LIFT') {
            // Same timestamp can contain a bot deadline followed by a human click.
            // Only samples accepted through the enabling event belong to its snapshot.
            const enablingIndex = Math.max(...node.dependencies.map((id) => round.events.findIndex((event) => event.taskId === id)));
            const existingSamples = round.samples.filter((sample) => round.events.findIndex((event) => event.taskId === sample.taskId) <= enablingIndex);
            const expectedMean = existingSamples.reduce((sum, sample) => sum + sample.ms, 0) / existingSamples.length;
            expect(node.baselineMeanMs).toBe(expectedMean);
            expect(node.dueAt).toBe(node.enabledAt! + node.baselineMeanMs!);
            expect(node.completedAt).toBeLessThanOrEqual(node.dueAt!);
            const peers = round.tasks.filter((peer) => peer.cohort === node.cohort && peer.ownerId !== null);
            if (peers.length) expect(node.completedAt).toBeLessThanOrEqual(Math.max(node.enabledAt!, ...peers.map((peer) => peer.completedAt!)));
          }
        }
      }
    });
  }
});
