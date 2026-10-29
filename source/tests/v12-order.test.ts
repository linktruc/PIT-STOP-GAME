import { describe, expect, it } from 'vitest';
import { assignRoles, createRound, createSoloRound, createTasks, reconcile, submitAction } from '../src/engine';
import { CORNERS, ROLES, type Player, type Role, type Round } from '../src/types';
import { WORKFLOW_GROUPS } from '../src/workflow';

const crew = (role: Role, id: string = role): Player => ({ id, role, nickname: id, ready: true, joinedAt: 0 });
const task = (round: Round, id: string) => round.tasks.find(task => task.id === id)!;

function finish(round: Round) {
  let now = round.goAt;
  for (let attempt = 0; attempt < 250 && round.status !== 'COMPLETED'; attempt++) {
    reconcile(round, now);
    const humans = round.tasks.filter(task => task.ownerId && task.status === 'AVAILABLE');
    if (humans.length) {
      const next = humans[0];
      now = Math.max(now + 1, next.enabledAt! + 100);
      submitAction(round, next.ownerId!, next.id, now, `attempt-${attempt}`);
    } else {
      const deadlines = round.tasks.filter(task => task.status === 'AVAILABLE' && task.dueAt !== null).map(task => task.dueAt!);
      if (!deadlines.length) throw new Error('The round became deadlocked.');
      now = Math.max(now, Math.min(...deadlines));
      reconcile(round, now);
    }
  }
  expect(round.status).toBe('COMPLETED');
  expect(round.events).toHaveLength(21);
  for (const job of round.tasks) for (const id of job.dependencies) {
    expect(task(round, id).completedAt!).toBeLessThanOrEqual(job.enabledAt!);
  }
}

describe('V15 restored simulated sequence: lift > loosen > change > tighten > lower', () => {
  it('keeps all 21 jobs, with correct dependencies and seven grouped UI milestones', () => {
    const tasks = createTasks(ROLES.map(role => crew(role)));
    expect(tasks).toHaveLength(21);
    expect(WORKFLOW_GROUPS.map(item => item.key)).toEqual(['LIFT', 'LOOSEN', 'REMOVE', 'FIT', 'TIGHTEN', 'LOWER', 'RELEASE']);
    for (const corner of CORNERS) {
      const axle = corner.startsWith('F') ? 'FRONT' : 'REAR';
      expect(tasks.find(t => t.id === `${corner}_GUN_LOOSEN`)?.dependencies).toEqual([`${axle}_LIFT`]);
      expect(tasks.find(t => t.id === `${corner}_WHEEL_OFF`)?.dependencies).toEqual([`${corner}_GUN_LOOSEN`]);
      expect(tasks.find(t => t.id === `${corner}_WHEEL_ON`)?.dependencies).toEqual([`${corner}_WHEEL_OFF`]);
      expect(tasks.find(t => t.id === `${corner}_GUN_TIGHTEN`)?.dependencies).toEqual([`${corner}_WHEEL_ON`]);
    }
    expect(tasks.find(t => t.id === 'FRONT_LIFT')?.dependencies).toEqual([]);
    expect(tasks.find(t => t.id === 'REAR_LIFT')?.dependencies).toEqual([]);
    expect(tasks.find(t => t.id === 'FRONT_LOWER')?.dependencies).toEqual(['FL_GUN_TIGHTEN', 'FR_GUN_TIGHTEN']);
    expect(tasks.find(t => t.id === 'REAR_LOWER')?.dependencies).toEqual(['RL_GUN_TIGHTEN', 'RR_GUN_TIGHTEN']);
  });

  it('starts with jack lifts and opens gun tasks afterward', () => {
    const round = createRound(ROLES.map(role => crew(role)), 1000, 'v15-order');
    reconcile(round, 1000);
    expect(task(round, 'FRONT_LIFT').status).toBe('AVAILABLE');
    expect(task(round, 'FL_GUN_LOOSEN').status).toBe('LOCKED');
    submitAction(round, 'FRONT_JACK', 'FRONT_LIFT', 1200, 'lift');
    expect(task(round, 'FL_GUN_LOOSEN').status).toBe('AVAILABLE');
    submitAction(round, 'FL_GUNNER', 'FL_GUN_LOOSEN', 1400, 'fl');
    expect(task(round, 'FL_WHEEL_OFF').status).toBe('AVAILABLE');
  });

  it('uses a real human jack sample for downstream bot scheduling', () => {
    const round = createRound([crew('FRONT_JACK', 'jack')], 1000, 'sample');
    reconcile(round, 1000);
    submitAction(round, 'jack', 'FRONT_LIFT', 4000, 'opener');
    expect(task(round, 'REAR_LIFT').completedAt).toBe(4000);
    expect(task(round, 'REAR_LIFT').reason).toBe('OPENING_JACK_SYNC');
    expect(task(round, 'FL_GUN_LOOSEN').baselineMeanMs).toBe(3000);
    expect(task(round, 'FL_GUN_LOOSEN').dueAt).toBe(7000);
  });

  it('guarantees an opening human jack in random online teams', () => {
    for (let size = 4; size <= 15; size++) {
      const players = assignRoles(Array.from({ length: size }, (_, i) => crew('FRONT_JACK', `p-${i}`)));
      expect(players.some(player => player.role.endsWith('_JACK'))).toBe(true);
      finish(createRound(players, 1000, `multiplayer-${size}`));
    }
  });

  it('supports every Solo role, even when the selected role cannot start the first stage', () => {
    for (const role of ROLES) finish(createSoloRound([crew(role, 'solo')], 1000, `solo-${role}`));
  });
});
