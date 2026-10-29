import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { createRound } from '../src/engine';
import ChainHUD, { AllRoles, getRoleGuide, MiniChain, RoleBriefing } from '../src/ChainHUD';
import { ribbonCapacity, milestoneLabel, newestWorkflowSnapshot, rollingWorkflow, TASK_DISPLAY_ORDER } from '../src/workflow';
import { ROLES, type Room } from '../src/types';
const player = { id: 'me', nickname: 'Alex', role: 'FRONT_JACK' as const, ready: true, joinedAt: 0 };
const room = (): Room => ({ id: 'a', teamId: 'a', code: 'TEST', name: 'Team', color: '#d33', hostId: 'me', status: 'RUNNING', players: [player], round: createRound([player], 1000, 'r'), updatedAt: 1000 });
function complete(r: Room, id: string, at: number) {
  const task = r.round!.tasks.find(task => task.id === id)!;
  task.status = 'DONE'; task.completedAt = at;
  r.round!.events.push({ taskId: id, at, reason: 'TEST' });
}
describe('V10 measured global workflow', () => {
  it('uses contextual compact milestones and reveals more distinct jobs with measured width', () => {
    const r = room();
    const flows = [362, 402, 720, 900].map(width => rollingWorkflow(r, width, 116));
    expect(flows.map(flow => flow.slots.length)).toEqual([2, 3, 6, 7]);
    flows.forEach(flow => expect(new Set(flow.slots.map(slot => slot.key)).size).toBe(flow.capacity));
    expect(ribbonCapacity(402, 90)).toBe(4);
    expect(ribbonCapacity(0)).toBe(1); expect(ribbonCapacity(Number.NaN)).toBe(4);
    expect(milestoneLabel('FR_GUN_LOOSEN')).toEqual({ context: 'Front-right wheel', action: 'Loosen nut' });
    expect(milestoneLabel('RL_WHEEL_OFF')).toEqual({ context: 'Rear-left wheel', action: 'Remove wheel' });
  });
  it('summarizes actual jack, wheel and mixed frontiers without treating FRONT as the FR wheel', () => {
    const r = room();
    r.round!.tasks.filter(task => task.cohort === 'LIFT').forEach(task => { task.status = 'AVAILABLE'; task.enabledAt = 1000; });
    expect(rollingWorkflow(r).count).toBe(0);
    expect(rollingWorkflow(r).phase).toBe('2 jacks ready');
    complete(r, 'FRONT_LIFT', 1100);
    for (const id of ['FL_GUN_LOOSEN', 'FR_GUN_LOOSEN']) r.round!.tasks.find(task => task.id === id)!.status = 'AVAILABLE';
    expect(rollingWorkflow(r).phase).toBe('2 wheel crews · 1 jack ready');
    r.round!.tasks.forEach(task => { task.status = task.id === 'FRONT_LOWER' ? 'AVAILABLE' : 'LOCKED'; });
    expect(rollingWorkflow(r).phase).toBe('1 jack ready');
    r.round!.tasks.forEach(task => { task.status = task.id === 'GREEN_RELEASE' ? 'AVAILABLE' : 'LOCKED'; });
    expect(rollingWorkflow(r).phase).toBe('Release ready');
  });
  it('advances only after an entire phase, independent of player or receipt order', () => {
    const r = room();
    expect(rollingWorkflow(r).offset).toBe(0);
    complete(r, 'FRONT_LIFT', 1100); complete(r, 'REAR_LIFT', 1100);
    const before = rollingWorkflow(r, 768);
    expect(before.offset).toBe(0);
    complete(r, 'RR_GUN_LOOSEN', 1200);
    const after = rollingWorkflow(r, 768);
    expect(after.offset).toBe(0);
    expect(after.slots.map(slot => slot.key)).toEqual(before.slots.map(slot => slot.key));
    const order = after.stream.map(slot => slot.key);
    r.round!.tasks.forEach(task => task.ownerId = null);
    r.round!.events.reverse(); r.round!.tasks.reverse();
    expect(rollingWorkflow(r, 768).stream.map(slot => slot.key)).toEqual(order);
  });
  it('keeps parallel status colors truthful in stable phase/corner order', () => {
    const r = room(); complete(r, 'REAR_LIFT', 1200); complete(r, 'FRONT_LIFT', 1100);
    complete(r, 'RR_GUN_LOOSEN', 1300);
    r.round!.tasks.filter(task => task.cohort === 'GUN_LOOSEN' && task.status !== 'DONE').forEach(task => { task.status = 'AVAILABLE'; task.enabledAt = 1200; });
    r.round!.tasks.find(task => task.id === 'RR_WHEEL_OFF')!.status = 'AVAILABLE';
    const a = rollingWorkflow(r, 1200);
    expect(a.stream.slice(0, 3).map(slot => slot.key)).toEqual(['LIFT', 'LOOSEN', 'REMOVE']);
    expect(a.active).toBe(4);
    expect(a.stream.find(slot => slot.key === 'LOOSEN')?.parts.find(part => part.id === 'RR_GUN_LOOSEN')?.state).toBe('done');
    expect(a.stream.find(slot => slot.key === 'REMOVE')?.parts.find(part => part.id === 'RR_WHEEL_OFF')?.state).toBe('available');
    expect(r.round!.tasks.find(task => task.id === 'RR_WHEEL_OFF')!.dependencies).toEqual(['RR_GUN_LOOSEN']);
    r.round!.events.reverse(); r.round!.tasks.reverse();
    expect(rollingWorkflow(r, 1200)).toEqual({ ...a, tasks: r.round!.tasks });
  });
  it('rejects stale lower completion snapshots within a round and accepts a new round', () => {
    const previous = room(), incoming = room();
    complete(previous, 'FRONT_LIFT', 1100);
    expect(newestWorkflowSnapshot(previous, incoming)).toBe(previous);
    incoming.round!.id = 'next-round';
    expect(newestWorkflowSnapshot(previous, incoming)).toBe(incoming);
    complete(incoming, 'FRONT_LIFT', 1100);
    expect(newestWorkflowSnapshot(previous, incoming)).toBe(incoming);
  });
  it('uses one contiguous count sweep and no tile boxes or offscreen personal pin', () => {
    const r = room(); complete(r, 'RR_GUN_LOOSEN', 1100);
    const html = renderToStaticMarkup(createElement(MiniChain, { room: r, playerId: 'me', onOpen: () => {} }));
    expect((html.match(/class="rail-total-fill"/g) ?? []).length).toBe(1);
    expect(html).toContain(`scaleX(${1 / 21})`);
    expect(html).toContain('aria-valuenow="1"'); expect(html).not.toContain('rolling-slot');
    expect(html).not.toContain('FRONT_LOWER');
    expect((html.match(/data-owned="true"/g) ?? []).length).toBe(1);
  });
  it('keeps 21 real task labels and 26 edges readable with human or Bot responsibility', () => {
    const r = room();
    const html = renderToStaticMarkup(createElement(ChainHUD, { room: r, playerId: 'me' }));
    expect((html.match(/data-task-id=/g) ?? []).length).toBe(21);
    expect((html.match(/data-from=/g) ?? []).length).toBe(26);
    expect(html).toContain('Loosen front-left wheel nut'); expect(html).toContain('Remove old rear-right wheel');
    expect(html).toContain('Fit new rear-left wheel'); expect(html).toContain('Tighten front-right wheel nut');
    expect(html).toContain('data-owner="Alex"'); expect(html).toContain('data-owner="Bot"');
    expect(html).not.toContain('chain-roster'); expect(new Set(TASK_DISPLAY_ORDER).size).toBe(21);
  });
  it('uses recorded round roster names instead of later lobby names', () => {
    const r = room(); r.round!.players = [{ ...player, nickname: 'Recorded driver' }];
    const html = renderToStaticMarkup(createElement(ChainHUD, { room: r }));
    expect(html).toContain('data-owner="Recorded driver"'); expect(html).not.toContain('data-owner="Alex"');
  });
  it('explains all 15 roles with explicit prerequisites and both presses for gun and jack jobs', () => {
    const r = room();
    for (const role of ROLES) {
      const guide = getRoleGuide(role, r.round!.tasks);
      expect(guide.summary.length).toBeGreaterThan(35); expect(guide.requires).toMatch(/wait for/i);
      expect(guide.stages).toHaveLength(role.endsWith('GUNNER') || role.endsWith('JACK') ? 2 : 1);
    }
    const html = renderToStaticMarkup(createElement(RoleBriefing, { room: r, playerId: 'me' }));
    expect(html).toMatch(/wait for GO signal/i); expect(html).toContain('both front wheel nuts');
    expect(html).toContain('2 seconds'); expect(html).not.toContain('YOU UNLOCK');
  });
  it('offers six generic role families without repeating four wheel corners or live nicknames', () => {
    const html = renderToStaticMarkup(createElement(AllRoles));
    expect((html.match(/<section/g) ?? []).length).toBe(6);
    for (const label of ['Wheel Gun Operator', 'Old Wheel Remover', 'New Wheel Fitter', 'Front Jack Operator', 'Rear Jack Operator', 'Release Controller']) expect(html).toContain(label);
    expect(html).not.toContain('Alex'); expect(html).not.toContain('Front-left wheel gunner');
  });
});
