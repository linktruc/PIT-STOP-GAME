import { describe, expect, it } from 'vitest';
import { createRound, earlyAction, reconcile, submitAction } from '../src/engine';
import type { Player } from '../src/types';

const gunner: Player = { id: 'gunner', nickname: 'Gunner', role: 'FL_GUNNER', ready: true, joinedAt: 0 };
const jack: Player = { id: 'jack', nickname: 'Jack', role: 'FRONT_JACK', ready: true, joinedAt: 0 };

describe('V13 immediate countdown lockout', () => {
  it('starts the two-second countdown at the actual tap, not at GO', () => {
    const round = createRound([jack, gunner], 5000, 'first');
    earlyAction(round, gunner.id, 'FL_GUN_LOOSEN', 1000, 'first-press');
    expect(round.penalties?.gunner).toEqual({ at: 1000, until: 3000 });
    earlyAction(round, gunner.id, 'FL_GUN_LOOSEN', 1001, 'first-press');
    expect(round.penalties?.gunner?.until).toBe(3000);
    // The lockout has already expired by the GO signal.
    reconcile(round, 5000);
    submitAction(round, jack.id, 'FRONT_LIFT', 5000, 'jack-start');
    submitAction(round, gunner.id, 'FL_GUN_LOOSEN', 5001, 'valid-press');
    expect(round.tasks.find(t => t.id === 'FL_GUN_LOOSEN')?.completedAt).toBe(5001);
  });

  it('a tap shortly before GO stays locked into the active round', () => {
    const round = createRound([jack, gunner], 5000, 'second');
    earlyAction(round, gunner.id, 'FL_GUN_LOOSEN', 4500, 'early');
    expect(round.penalties?.gunner).toEqual({ at: 4500, until: 6500 });
    reconcile(round, 5000);
    submitAction(round, jack.id, 'FRONT_LIFT', 5000, 'jack-start');
    expect(() => submitAction(round, gunner.id, 'FL_GUN_LOOSEN', 6000, 'too-soon')).toThrow(/lockout/);
    submitAction(round, gunner.id, 'FL_GUN_LOOSEN', 6500, 'after-penalty');
    expect(round.tasks.find(t => t.id === 'FL_GUN_LOOSEN')?.completedAt).toBe(6500);
  });
});
