import { describe, expect, it } from 'vitest';
import { createRound } from '../src/engine';
import { WORKFLOW_GROUPS, rollingWorkflow } from '../src/workflow';
import type { Room } from '../src/types';
const player = { id: 'me', nickname: 'Driver', role: 'FRONT_JACK' as const, ready: true, joinedAt: 0 };
const room = (): Room => ({ id: 'r', teamId: 'r', code: 'ROOM', name: 'Crew', color: '#f22', hostId: 'me', status: 'RUNNING', players: [player], round: createRound([player], 1000, 'one'), updatedAt: 1000 });
function done(r: Room, id: string) {
  const t = r.round!.tasks.find(task => task.id === id)!;
  t.status = 'DONE'; t.completedAt = 1200;
}
describe('compact grouped workflow', () => {
  it('shows seven unique stages for 21 immutable tasks', () => {
    const r = room(); const f = rollingWorkflow(r, 1400);
    expect(f.stream.map(s => s.label)).toEqual(['Lift car', 'Loosen wheel nuts', 'Remove old wheels', 'Fit new wheels', 'Tighten wheel nuts', 'Lower car', 'Release car']);
    expect(f.stream).toHaveLength(7);
    expect(f.stream.flatMap(s => s.taskIds)).toHaveLength(21);
    expect(new Set(f.stream.flatMap(s => s.taskIds)).size).toBe(21);
    expect(WORKFLOW_GROUPS).toHaveLength(7);
  });
  it('shows independent Front and Rear checkmarks without completing group early', () => {
    const r = room(); done(r, 'FRONT_LIFT');
    const group = rollingWorkflow(r, 1400).stream[0];
    expect(group.key).toBe('LIFT');
    expect(group.parts.map(p => `${p.label}:${p.state}`)).toEqual(['Front:done','Rear:locked']);
    expect(group.state).not.toBe('done'); expect(rollingWorkflow(r).count).toBe(1);
    done(r, 'REAR_LIFT'); expect(rollingWorkflow(r, 1400).stream[0].state).toBe('done');
  });
  it('reflects wheel-corner parallelism without calling different corners duplicate main tasks', () => {
    const r = room(); done(r,'FL_GUN_LOOSEN');
    const group = rollingWorkflow(r, 1400).stream[1];
    expect(group.key).toBe('LOOSEN');
    expect(group.parts.map(p => p.label)).toEqual(['FL','FR','RL','RR']);
    expect(group.parts.map(p => p.state)).toEqual(['done','locked','locked','locked']);
  });
});
