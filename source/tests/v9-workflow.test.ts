import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { createRound } from '../src/engine';
import ChainHUD, { MiniChain } from '../src/ChainHUD';
import RoleCard from '../src/RoleCard';
import { rollingWorkflow } from '../src/workflow';
import { CREW, supportCrewClear } from '../src/scene/crew';
import type { Room } from '../src/types';
const player = { id: 'you', nickname: 'Private Nickname', role: 'FRONT_JACK' as const, ready: true, joinedAt: 0 };
const room = (): Room => ({ id: 'room', teamId: 'team', name: 'Test', code: 'TEST', color: '#ff0000', hostId: 'you', status: 'RUNNING', players: [player], round: createRound([player], 1000, 'r'), updatedAt: 0 });
describe('Workflow and gameplay non-regressions retained by the V11 milestone rail', () => {
  it('keeps one compact row and marks owned actions without changing the global stream', () => {
    const r = room();
    for (const role of ['FRONT_JACK', 'FL_GUNNER'] as const) {
      r.players[0] = { ...player, role };
      r.round!.tasks.forEach(task => task.ownerId = task.role === role ? 'you' : null);
      const html = renderToStaticMarkup(createElement(MiniChain, { room: r, playerId: 'you', onOpen: () => {} }));
      expect((html.match(/class="milestone-rail"/g) ?? []).length).toBe(1);
      expect((html.match(/data-slot=/g) ?? []).length).toBe(rollingWorkflow(r).capacity);
      expect((html.match(/data-owned="true"/g) ?? []).length).toBe(1);
    }
  });
  it('preserves parallel branches in stable phase order as individual completions arrive', () => {
    const r = room(), tasks = r.round!.tasks;
    tasks.forEach(task => {
      if (task.cohort === 'LIFT') { task.status = 'DONE'; task.completedAt = 1100; }
      if (task.cohort === 'GUN_LOOSEN') { task.status = 'AVAILABLE'; task.enabledAt = 1100; }
    });
    r.round!.events = [{ taskId: 'REAR_LIFT', at: 1100, reason: 'BOT' }, { taskId: 'FRONT_LIFT', at: 1100, reason: 'HUMAN' }];
    const before = rollingWorkflow(r, 768);
    expect(before.count).toBe(2); expect(before.active).toBe(4);
    expect(before.slots.filter(slot => slot.state === 'available')).toHaveLength(1);
    expect(before.slots[1].key).toBe('LOOSEN');
    const rr = tasks.find(task => task.id === 'RR_GUN_LOOSEN')!;
    rr.status = 'DONE'; rr.completedAt = 1200;
    const rrOff = tasks.find(task => task.id === 'RR_WHEEL_OFF')!;
    rrOff.status = 'AVAILABLE'; rrOff.enabledAt = 1200;
    r.round!.events.push({ taskId: rr.id, at: 1200, reason: 'BOT' });
    const after = rollingWorkflow(r, 768);
    expect(after.slots.map(slot => slot.key)).toEqual(before.slots.map(slot => slot.key));
    expect(after.stream.find(slot => slot.key === 'LOOSEN')?.parts.find(part => part.id === rr.id)?.state).toBe('done');
    tasks.reverse(); expect(rollingWorkflow(r, 768).slots).toEqual(after.slots);
  });
  it('shows waiting tasks without inventing a GO task and completes exactly 21 jobs', () => {
    const r = room();
    expect(rollingWorkflow(r).slots.every(slot => slot.state === 'locked')).toBe(true);
    const waiting = { ...r, status: 'WAITING' as const, round: null };
    expect(rollingWorkflow(waiting).phase).toBe('Wait for GO');
    r.round!.tasks.forEach((task, index) => {
      task.status = 'DONE'; task.completedAt = 1000 + index;
      r.round!.events.push({ taskId: task.id, at: 1000 + index, reason: 'TEST' });
    });
    const final = rollingWorkflow(r);
    expect(final.count).toBe(21); expect(final.slots.at(-1)?.key).toBe('RELEASE');
    expect(final.slots.every(slot => slot.state === 'done')).toBe(true);
  });
  it('restores 21 graph nodes and 26 actual edges, with names at nodes and no roster dump', () => {
    const html = renderToStaticMarkup(createElement(ChainHUD, { room: room(), playerId: 'you' }));
    expect((html.match(/data-task-id=/g) ?? []).length).toBe(21);
    expect((html.match(/data-from=/g) ?? []).length).toBe(26);
    expect(html).toContain('Private Nickname'); expect(html).toContain('data-owner="Bot"');
    expect(html).not.toContain('chain-roster');
  });
  it('collapsed role card keeps the role name and a detail affordance', () => {
    const html = renderToStaticMarkup(createElement(RoleCard, { room: room(), playerId: 'you', onExpand: () => {} }));
    expect(html).toContain('Front jack operator'); expect(html).toMatch(/Tap for (?:more )?details/);
    expect(html).not.toContain('Waiting'); expect(html).not.toContain('Lift the');
  });
  it('retains seven nonplayable supports and clears the vehicle after their retreat', () => {
    expect(CREW).toHaveLength(22); expect(CREW.filter(crew => crew.kind === 'ambient')).toHaveLength(7);
    expect(supportCrewClear(0)).toBe(true);
    for (let carZ = 0; carZ >= -9; carZ -= .1) expect(supportCrewClear(carZ, 1)).toBe(true);
  });
});
