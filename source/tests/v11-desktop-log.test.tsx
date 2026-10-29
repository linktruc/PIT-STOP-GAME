import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import DesktopLiveLog from '../src/DesktopLiveLog';
import { createRound } from '../src/engine';
import { rollingWorkflow, verticalRibbonCapacity } from '../src/workflow';
import type { Room } from '../src/types';

const owner = { id: 'me', nickname: 'Original crew member', role: 'FRONT_JACK' as const, ready: true, joinedAt: 0 };
function room(): Room {
  return { id: 'room', teamId: 'team', name: 'APEX', code: 'TEST', color: '#e33', hostId: owner.id, players: [owner], status: 'RUNNING', round: createRound([owner], 1000, 'round'), updatedAt: 0 };
}
function done(r: Room, id: string, at: number, enabledAt: number) {
  const task = r.round!.tasks.find(task => task.id === id)!;
  Object.assign(task, { status: 'DONE', completedAt: at, enabledAt });
}

describe('desktop workflow and live recorded events', () => {
  it('measures the vertical viewport, exposing more real surrounding jobs as height grows', () => {
    expect(verticalRibbonCapacity(320)).toBe(6);
    expect(verticalRibbonCapacity(430)).toBe(8);
    expect(verticalRibbonCapacity(0)).toBe(1);
    expect(verticalRibbonCapacity(Number.NaN)).toBe(6);
    expect(verticalRibbonCapacity(9000)).toBe(21);
    const r = room(); done(r, 'FRONT_LIFT', 1100, 1000); done(r, 'REAR_LIFT', 1100, 1000);
    const small = rollingWorkflow(r, 260, 90, verticalRibbonCapacity(320));
    const large = rollingWorkflow(r, 304, 90, verticalRibbonCapacity(430));
    expect(small.slots).toHaveLength(6); expect(large.slots).toHaveLength(7);
    expect(small.slots.map(slot => slot.key)).toEqual(large.slots.slice(0, 6).map(slot => slot.key));
    expect(small.slots[0].key).toBe('LIFT');
  });
  it('uses immutable round names and actual step/team timing with latest completion first', () => {
    const r = room(); r.round!.players = [{ ...owner }]; r.players[0] = { ...owner, nickname: 'Later lobby name' };
    done(r, 'FRONT_LIFT', 5000, 1000); done(r, 'REAR_LIFT', 5200, 1000);
    const html = renderToStaticMarkup(<DesktopLiveLog room={r} />);
    expect(html).toContain('data-event-count="2"');
    expect(html.indexOf('data-task-id="REAR_LIFT"')).toBeLessThan(html.indexOf('data-task-id="FRONT_LIFT"'));
    expect(html).toContain('Original crew member'); expect(html).not.toContain('Later lobby name');
    expect(html).toContain('Step Time 4.000s · Team Time 4.000s');
    expect(html).toContain('Step Time 4.200s · Team Time 4.200s');
    expect(html).toContain('Latest completed tasks first');
  });
  it('shares event receipt identity/timing overrides and does not invent missing historical times', () => {
    const r = room(); done(r, 'FRONT_LIFT', 1300, 1000);
    r.round!.events.push({ taskId: 'FRONT_LIFT', at: 1400, reason: 'HUMAN', ownerId: 'me', nickname: 'Recorded name', role: 'FRONT_JACK', enabledAt: 1100 });
    done(r, 'FL_GUN_LOOSEN', 1500, 1300); r.round!.tasks.find(task => task.id === 'FL_GUN_LOOSEN')!.enabledAt = null;
    const html = renderToStaticMarkup(<DesktopLiveLog room={r} />);
    expect(html).toContain('Recorded name'); expect(html).toContain('Step Time 0.300s · Team Time 0.400s');
    expect(html).toContain('Step Time Not recorded · Team Time 0.500s');
    expect((html.match(/<li /g) ?? []).length).toBe(2);
  });
  it('keeps the live panel empty until real completion data exists and resets with the round', () => {
    const r = room(); r.status = 'COUNTDOWN';
    expect(renderToStaticMarkup(<DesktopLiveLog room={r} />)).toContain('Completed tasks appear after GO.');
    done(r, 'FRONT_LIFT', 1300, 1000);
    expect(renderToStaticMarkup(<DesktopLiveLog room={r} />)).toContain('data-event-count="1"');
    r.round = createRound(r.players, 2000, 'next');
    const html = renderToStaticMarkup(<DesktopLiveLog room={r} />);
    expect(html).toContain('data-round-id="next"'); expect(html).toContain('data-event-count="0"');
  });
});
