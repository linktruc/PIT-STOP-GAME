import { describe, expect, it } from 'vitest';
import { createRound } from '../src/engine';
import { clampReplayTime, currentReplayEvent, eventSeconds, replayBounds, replayEvents, replayRoom, replayTaskLabel } from '../src/replay';
import type { Player, ReplayRecord, Round } from '../src/types';

const players: Player[] = [{ id: 'human-jack', nickname: 'Aster', role: 'FRONT_JACK', ready: true, joinedAt: 1 }];
function fixture(): Round {
  const round = createRound(players, 1_000, 'recorded-round');
  round.players = structuredClone(players);
  round.goAt = 10_000;
  const front = round.tasks.find(task => task.id === 'FRONT_LIFT')!;
  front.status = 'DONE'; front.enabledAt = 10_000; front.completedAt = 12_500;
  const rear = round.tasks.find(task => task.id === 'REAR_LIFT')!;
  rear.status = 'DONE'; rear.enabledAt = 10_000; rear.completedAt = 12_500; rear.baselineMeanMs = 4_000;
  round.events = [
    { taskId: rear.id, at: 12_500, reason: 'human cohort synchronization', enabledAt: 10_000, ownerId: null, nickname: null, role: 'REAR_JACK' },
    { taskId: front.id, at: 12_500, reason: 'human', enabledAt: 10_000, ownerId: 'human-jack', nickname: 'Aster', role: 'FRONT_JACK' },
  ];
  return round;
}

describe('recorded replay semantics', () => {
  it('shows authoritative reaction including lockout and actual synchronized bot duration', () => {
    const events = replayEvents(fixture());
    expect(events.map(event => event.taskId)).toEqual(['FRONT_LIFT', 'REAR_LIFT']);
    expect(events.map(event => event.stepMs)).toEqual([2_500, 2_500]);
    expect(events.map(event => event.teamMs)).toEqual([2_500, 2_500]);
    expect(events[0]).toMatchObject({ by: 'Aster', role: 'Front jack', human: true });
    expect(events[1]).toMatchObject({ by: 'Bot', role: 'Rear jack', human: false });
    expect(eventSeconds(events[0].stepMs)).toBe('2.500s');
  });

  it('uses immutable event ownership when current team members have changed', () => {
    const round = fixture();
    round.players = [];
    const events = replayEvents(round, [{ ...players[0], nickname: 'Replacement' }]);
    expect(events[0].by).toBe('Aster');
    expect(events[1].by).toBe('Bot');
  });

  it('keeps missing legacy unlocks unknown instead of substituting nominal bot times', () => {
    const round = fixture();
    round.events = [];
    round.tasks.find(task => task.id === 'REAR_LIFT')!.enabledAt = null;
    expect(replayEvents(round).find(event => event.taskId === 'REAR_LIFT')!.stepMs).toBeNull();
    expect(eventSeconds(null)).toBe('Not recorded');
  });

  it('reconciles duplicate event/task data and never sums reaction times for team elapsed', () => {
    const round = fixture();
    round.events.push(structuredClone(round.events[0]));
    const events = replayEvents(round);
    expect(events).toHaveLength(2);
    expect(events.at(-1)!.teamMs).toBe(2_500);
    expect(events.reduce((sum, event) => sum + (event.stepMs ?? 0), 0)).toBe(5_000);
  });

  it('selects the same deterministic current event when seeking forward and backward', () => {
    const events = replayEvents(fixture());
    expect(currentReplayEvent(events, 9_000)).toBeNull();
    expect(currentReplayEvent(events, 12_499)).toBeNull();
    expect(currentReplayEvent(events, 12_500)?.taskId).toBe('REAR_LIFT');
    expect(currentReplayEvent(events, 99_000)?.taskId).toBe('REAR_LIFT');
    expect(currentReplayEvent(events, 11_000)).toBeNull();
  });

  it('bounds approach and exit while passing the full original round unchanged to the scene', () => {
    const round = fixture();
    round.finishedAt = 12_500;
    const before = structuredClone(round);
    const record: ReplayRecord = { roundId: round.id, teamId: 'team', teamName: 'Comet', color: '#f44', players, round, solo: true };
    expect(replayBounds(round)).toEqual({ start: -3_000, end: 9_000 });
    expect(clampReplayTime(round, -99_000)).toBe(-3_000);
    expect(clampReplayTime(round, 99_000)).toBe(9_000);
    expect(clampReplayTime(round, 1_250)).toBe(1_250);
    expect(clampReplayTime(round, Number.NaN)).toBe(-3_000);
    const room = replayRoom(record);
    expect(room.round).toBe(round);
    expect(room.players).toBe(round.players);
    expect(room.solo).toBe(true);
    expect(round).toEqual(before);
  });

  it('uses full action names at all corners and jack/release steps', () => {
    expect(replayTaskLabel('FRONT_LIFT')).toBe('Lift front of car');
    expect(replayTaskLabel('REAR_LOWER')).toBe('Lower rear of car');
    expect(replayTaskLabel('RR_GUN_TIGHTEN')).toBe('Tighten rear-right wheel nut');
    expect(replayTaskLabel('FR_WHEEL_OFF')).toBe('Remove old front-right wheel');
    expect(replayTaskLabel('RL_WHEEL_ON')).toBe('Fit new rear-left wheel');
    expect(replayTaskLabel('GREEN_RELEASE')).toBe('Release car');
  });
});
