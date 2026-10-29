import { describe, expect, it } from 'vitest';
import { createRound } from '../src/engine';
import { TaskAnimationTimeline, durationForTask } from '../src/scene/animation';
import type { Round } from '../src/types';

const round = (id = 'stop-1'): Round => createRound([
  { id: 'driver', nickname: 'Crew', role: 'FRONT_JACK', ready: true, joinedAt: 0 },
], 0, id);

function complete(state: Round, ...ids: string[]): void {
  for (const task of state.tasks) {
    if (!ids.length || ids.includes(task.id)) {
      task.status = 'DONE';
      task.completedAt = 10;
    }
  }
}

describe('scene presentation receipts', () => {
  it('settles a first complete snapshot without replaying the stop', () => {
    const state = round();
    complete(state);
    const before = structuredClone(state);
    const timeline = new TaskAnimationTimeline();
    timeline.ingest(state, 1_000);
    expect(timeline.activeTaskIds(1_000)).toEqual([]);
    for (const task of state.tasks) {
      expect(timeline.isDone(task.id, 1_000)).toBe(true);
      expect(timeline.phase(task.id, 1_000)).toBeNull();
    }
    expect(state).toEqual(before);
  });

  it('preserves causal motion for a fast stop while independent branches animate together', () => {
    const state = round();
    const timeline = new TaskAnimationTimeline();
    timeline.ingest(state, 0);
    complete(state);
    // Reverse graph order proves dependency scheduling does not rely on snapshot ordering.
    state.tasks.reverse();
    timeline.ingest(state, 100);

    expect(new Set(timeline.activeTaskIds(100))).toEqual(new Set(['FRONT_LIFT', 'REAR_LIFT']));
    expect(timeline.phase('FL_WHEEL_ON', 100)).toBe(0);
    expect(timeline.phase('FRONT_LIFT', 425)).toBe(0.5);
    expect(timeline.isDone('FRONT_LIFT', 749)).toBe(false);
    expect(timeline.isDone('FRONT_LIFT', 750)).toBe(true);
    expect(new Set(timeline.activeTaskIds(750))).toEqual(new Set([
      'FL_GUN_LOOSEN', 'FR_GUN_LOOSEN', 'RL_GUN_LOOSEN', 'RR_GUN_LOOSEN',
    ]));
    for (const task of state.tasks) {
      const receipt = timeline.receipt(task.id)!;
      expect(receipt.endsAt - receipt.startsAt).toBe(durationForTask(task.id));
      for (const id of task.dependencies) {
        expect(receipt.startsAt).toBeGreaterThanOrEqual(timeline.receipt(id)!.endsAt);
      }
    }
    expect(timeline.receipt('GREEN_RELEASE')!.endsAt).toBe(7_100);
    expect(timeline.activeTaskIds(7_100)).toEqual([]);
    expect(timeline.isDone('GREEN_RELEASE', 7_100)).toBe(true);
  });

  it('deduplicates repeat snapshots and schedules later observations after existing motion', () => {
    const state = round();
    const timeline = new TaskAnimationTimeline();
    timeline.ingest(state, 0);
    complete(state, 'FRONT_LIFT');
    timeline.ingest(state, 100);
    const receipt = timeline.receipt('FRONT_LIFT');
    timeline.ingest(structuredClone(state), 200);
    expect(timeline.receipt('FRONT_LIFT')).toBe(receipt);
    complete(state, 'FL_GUN_LOOSEN');
    timeline.ingest(state, 300);
    expect(timeline.receipt('FL_GUN_LOOSEN')!.startsAt).toBe(750);
    expect(timeline.activeTaskIds(300)).toEqual(['FRONT_LIFT']);
    timeline.ingest(state, 2_000);
    expect(timeline.activeTaskIds(2_000)).toEqual([]);
    expect(timeline.receipt('FRONT_LIFT')).toBe(receipt);
  });

  it('clears old receipts for a new round and settles its already completed tasks', () => {
    const timeline = new TaskAnimationTimeline();
    const first = round();
    timeline.ingest(first, 0);
    complete(first);
    timeline.ingest(first, 100);
    const second = round('stop-2');
    complete(second, 'REAR_LIFT');
    timeline.ingest(second, 200);
    expect(timeline.receipt('FRONT_LIFT')).toBeUndefined();
    expect(timeline.isDone('FRONT_LIFT', 200)).toBe(false);
    expect(timeline.isDone('REAR_LIFT', 200)).toBe(true);
    expect(timeline.receipt('REAR_LIFT')!.roundId).toBe('stop-2');
    expect(timeline.activeTaskIds(200)).toEqual([]);
    timeline.ingest(null, 300);
    expect(timeline.receipt('REAR_LIFT')).toBeUndefined();
    expect(timeline.phase('REAR_LIFT', 300)).toBeNull();
  });
});

describe('safe departure and crew selection', () => {
  it('never starts driving before the jack/crew retreat has completed', async () => {
    const { departurePose } = await import('../src/scene/rig');
    const lower = { roundId: 'r', taskId: 'LOWER', startsAt: 0, endsAt: 650 };
    const release = { ...lower, taskId: 'GREEN_RELEASE', startsAt: 650, endsAt: 1650 };
    for (let now = 0; now <= 2400; now += 10) {
      const pose = departurePose([lower, lower], release, now);
      if (pose.drive > 0) expect(pose.retreat).toBe(1);
    }
    expect(departurePose([lower, undefined], release, 9999).drive).toBe(0);
    const settled = { ...lower, startsAt: 10, endsAt: 10 };
    expect(departurePose([settled, settled], settled, 10)).toEqual({ drive: 1, retreat: 1 });
  });
  it('distinguishes camera drags and long presses from model taps', async () => {
    const { isCrewTap } = await import('../src/scene/rig');
    expect(isCrewTap({ x: 0, y: 0, time: 0 }, { x: 4, y: 4, time: 200 })).toBe(true);
    expect(isCrewTap({ x: 0, y: 0, time: 0 }, { x: 50, y: 0, time: 200 })).toBe(false);
    expect(isCrewTap({ x: 0, y: 0, time: 0 }, { x: 0, y: 0, time: 600 })).toBe(false);
  });
});

it('settles queued wheel prerequisites before an accepted human lower, without changing the game clock', () => {
  const state = round(); const timeline = new TaskAnimationTimeline(); timeline.ingest(state, 0);
  complete(state); timeline.ingest(state, 100);
  const before = structuredClone(state);
  timeline.acknowledge('FRONT_LOWER', state.tasks, 200);
  for (const id of ['FL_GUN_TIGHTEN', 'FR_GUN_TIGHTEN', 'FL_WHEEL_ON', 'FR_WHEEL_ON']) expect(timeline.isDone(id, 200)).toBe(true);
  expect(timeline.receipt('FRONT_LOWER')).toMatchObject({ startsAt: 200, endsAt: 850 });
  expect(timeline.receipt('GREEN_RELEASE')!.startsAt).toBeGreaterThanOrEqual(timeline.receipt('REAR_LOWER')!.endsAt);
  expect(state).toEqual(before);
});

it('catches up a missed same-round stop after reconnect without replaying old history or suppressing a fresh lift', async () => {
 const {shouldSettleMissedAnimation}=await import('../src/scene/animation');const state=round();const timeline=new TaskAnimationTimeline();timeline.ingest(state,0);const seen=new Set<string>();
 complete(state,'FRONT_LIFT','REAR_LIFT');expect(shouldSettleMissedAnimation(state.tasks,seen,12000)).toBe(false);
 complete(state);expect(shouldSettleMissedAnimation(state.tasks,seen,1000)).toBe(false);const before=structuredClone(state);
 timeline.ingest(state,12000,shouldSettleMissedAnimation(state.tasks,seen,12000));expect(timeline.activeTaskIds(12000)).toEqual([]);expect(timeline.isDone('GREEN_RELEASE',12000)).toBe(true);expect(state).toEqual(before);
});
