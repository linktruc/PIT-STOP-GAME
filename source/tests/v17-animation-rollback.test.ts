import { describe, expect, it } from 'vitest';
import { durationForTask, TaskAnimationTimeline } from '../src/scene/animation';
import { CORNER_POSITIONS, CREW, gunnerHandoff } from '../src/scene/crew';
import type { Round } from '../src/types';

describe('V17 UI with V15 animation rollback', () => {
  it('uses the faster V24.5 presentation durations', () => {
    expect(durationForTask('FL_GUN_LOOSEN')).toBe(350);
    expect(durationForTask('FL_GUN_TIGHTEN')).toBe(350);
    expect(durationForTask('FL_WHEEL_OFF')).toBe(450);
    expect(durationForTask('FL_WHEEL_ON')).toBe(450);
    expect(durationForTask('FRONT_LIFT')).toBe(350);
    expect(durationForTask('REAR_LOWER')).toBe(350);
    expect(durationForTask('GREEN_RELEASE')).toBe(450);
  });

  it('restores the V15 gunner step-out / step-back behavior', () => {
    expect(gunnerHandoff(null, false, null, false)).toBe(0);
    expect(gunnerHandoff(null, true, null, false)).toBe(1);
    expect(gunnerHandoff(null, true, 0, false)).toBe(1);
    expect(gunnerHandoff(null, true, .22, false)).toBe(0);
    expect(gunnerHandoff(null, true, null, true)).toBe(1);
  });

  it('preserves the original crew roster and original V15 wheel animations', () => {
    for (const [corner] of CORNER_POSITIONS) {
      expect(CREW.find(c => c.role === `${corner}_GUNNER`)?.kind).toBe('gun');
      expect(CREW.find(c => c.role === `${corner}_WHEEL_OFF`)?.kind).toBe('off');
      expect(CREW.find(c => c.role === `${corner}_WHEEL_ON`)?.kind).toBe('on');
    }
  });

  it('deduplicates repeated live syncs without changing recorded game timestamps', () => {
    const lift = { id: 'FRONT_LIFT', dependencies: [], status: 'DONE', enabledAt: 1000, completedAt: 1050 };
    const gun = { id: 'FL_GUN_LOOSEN', dependencies: ['FRONT_LIFT'], status: 'DONE', enabledAt: 1050, completedAt: 1100 };
    const round = { id: 'test-stop', goAt: 1000, tasks: [lift, gun] } as unknown as Round;
    const snapshot = structuredClone(round);
    const timeline = new TaskAnimationTimeline();
    timeline.ingestRecorded(round);
    const first = timeline.receipt(gun.id);
    expect(first).toBeDefined();
    expect(first!.endsAt - first!.startsAt).toBe(120);
    timeline.ingestRecorded(structuredClone(round));
    expect(timeline.receipt(gun.id)).toEqual(first);
    expect(round).toEqual(snapshot);
  });
});
