import { describe, expect, it } from 'vitest';
import { createRound, earlyAction, submitAction } from '../src/engine';
import { taskLabel, type Player } from '../src/types';

const players: Player[] = [
  { id: 'jack', nickname: 'Alex', role: 'FRONT_JACK', ready: true, joinedAt: 0 },
  { id: 'gun', nickname: 'Sam', role: 'FL_GUNNER', ready: true, joinedAt: 1 },
];
describe('V10 actual event data and authoritative early-input race', () => {
  it('freezes round-time names/roles and records enabled/completed times including a real lockout delay', () => {
    const roster = structuredClone(players); const round = createRound(roster, 1000, 'recorded');
    roster[0].nickname = 'Later'; roster[0].role = 'REAR_JACK';
    earlyAction(round, 'gun', 'FL_GUN_LOOSEN', 1001, 'early');
    submitAction(round, 'jack', 'FRONT_LIFT', 1100, 'lift');
    submitAction(round, 'gun', 'FL_GUN_LOOSEN', 3001, 'gun');
    expect(round.players?.[0]).toMatchObject({ nickname: 'Alex', role: 'FRONT_JACK' });
    expect(round.events.find(event => event.taskId === 'FRONT_LIFT')).toMatchObject({ enabledAt: 1000, at: 1100, nickname: 'Alex', role: 'FRONT_JACK', ownerId: 'jack' });
    const event = round.events.find(event => event.taskId === 'FL_GUN_LOOSEN')!;
    expect(event.at - event.enabledAt!).toBe(1901); expect(event.at - round.goAt).toBe(2001);
  });
  it('accepts a stale locked-button intent if its task is unlocked on arrival, without falsely penalizing', () => {
    const round = createRound(players, 1000, 'r');
    submitAction(round, 'jack', 'FRONT_LIFT', 1100, 'lift');
    earlyAction(round, 'gun', 'FL_GUN_LOOSEN', 1150, 'stale-button');
    earlyAction(round, 'gun', 'FL_GUN_LOOSEN', 1160, 'stale-button');
    expect(round.events.filter(event => event.taskId === 'FL_GUN_LOOSEN')).toHaveLength(1);
    expect(round.tasks.find(task => task.id === 'FL_GUN_LOOSEN')!.completedAt).toBe(1150);
    expect(round.penalties?.gun).toBeUndefined();
  });
  it('uses full unambiguous task names for timing history and live workflow', () => {
    expect(taskLabel('FRONT_LIFT')).toBe('Lift front of car');
    expect(taskLabel('RR_GUN_TIGHTEN')).toBe('Tighten rear-right wheel nut');
    expect(taskLabel('FL_WHEEL_OFF')).toBe('Remove old front-left wheel');
    expect(taskLabel('FR_WHEEL_ON')).toBe('Fit new front-right wheel');
  });
});
