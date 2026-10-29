import { describe, expect, it } from 'vitest';
import { createRound } from '../src/engine';
import { rollingWorkflow } from '../src/workflow';
import type { Room } from '../src/types';

const player = { id: 'me', nickname: 'Alex', role: 'FRONT_JACK' as const, ready: true, joinedAt: 0 };
const room = (): Room => ({ id: 'fluid', teamId: 'fluid', code: 'TEST', name: 'Crew', color: '#f22', hostId: 'me', status: 'RUNNING', players: [player], round: createRound([player], 1000, 'fluid-round'), updatedAt: 1000 });

describe('V19 narrow rail always shows current ready work', () => {
  it('shows release, not the previous finished phase, when only one tile fits', () => {
    const r = room();
    r.round!.tasks.forEach(task => { task.status = 'DONE'; task.completedAt = 5000; });
    r.round!.tasks.find(task => task.id === 'GREEN_RELEASE')!.status = 'AVAILABLE';
    const f = rollingWorkflow(r, 150, 116, 1);
    expect(f.capacity).toBe(1);
    expect(f.slots.map(x => x.key)).toEqual(['RELEASE']);
    expect(f.slots[0].state).toBe('available');
  });
  it('prioritizes a ready phase even when a prior parallel group remains locked', () => {
    const r = room();
    r.round!.tasks.forEach(task => { task.status = 'LOCKED'; });
    r.round!.tasks.find(task => task.id === 'FRONT_LOWER')!.status = 'AVAILABLE';
    const f = rollingWorkflow(r, 150, 116, 1);
    expect(f.slots[0].key).toBe('LOWER');
    expect(f.slots[0].state).toBe('available');
  });
  it('preserves context on roomy viewports', () => {
    const r = room();
    r.round!.tasks.find(task => task.id === 'FRONT_LIFT')!.status = 'DONE';
    r.round!.tasks.find(task => task.id === 'REAR_LIFT')!.status = 'DONE';
    const f = rollingWorkflow(r, 600, 116, 3);
    expect(f.capacity).toBe(3);
    expect(f.slots.map(x => x.key)).toEqual(['LIFT','LOOSEN','REMOVE']);
  });
});
