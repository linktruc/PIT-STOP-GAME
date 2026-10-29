import { afterEach, describe, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createRound } from '../src/engine';
import { nextSyncDelay, RefreshCoalescer } from '../src/syncPolicy';
import { scheduleDismiss } from '../src/useTimedNotice';
import ChainHUD, { personalPaths } from '../src/ChainHUD';
import { activePreviewRooms } from '../src/TeamPreviews';
import type { Room, Snapshot } from '../src/types';
const player = { id: 'p', nickname: 'Tester', role: 'FRONT_JACK' as const, ready: true, joinedAt: 0, connected: true };
function room(): Room { return { id: 'r', teamId: 't', name: 'Test', code: 'TEST', color: '#ff0000', hostId: 'p', players: [player], status: 'RUNNING', round: createRound([player], 0, 'round'), updatedAt: 0 }; }
function state(rooms: Room[], id: string | null = 'p'): Snapshot { return { rooms, leaderboard: [], serverNow: 0, identity: { playerId: id, isAdmin: false } }; }
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
describe('V8 client behavior', () => {
  it('coalesces 100 realtime events and disposes pending refreshes', () => {
    vi.useFakeTimers(); const callback = vi.fn(); const c = new RefreshCoalescer(callback);
    for (let i = 0; i < 100; i++) c.request(); vi.advanceTimersByTime(180);
    expect(callback).toHaveBeenCalledTimes(1); c.request(); c.dispose(); vi.advanceTimersByTime(1000); expect(callback).toHaveBeenCalledTimes(1);
  });
  it('keeps waiting clients slow even while another team races and backs off errors', () => {
    const waiting = { ...room(), id: 'waiting', status: 'WAITING' as const, round: null };
    expect(nextSyncDelay(state([waiting, { ...room(), players: [] }]), false, 0, 0, () => 0)).toBe(12000);
    expect(nextSyncDelay(state([room()], null), true, 0, 0, () => 0)).toBe(1800);
    expect(nextSyncDelay(state([]), false, 0, 6, () => .5)).toBe(48000);
  });
  it('keeps information visible for 12 seconds and errors for 15 seconds', () => {
    vi.useFakeTimers(); const info = vi.fn(), error = vi.fn(); scheduleDismiss(info); scheduleDismiss(error, true);
    vi.advanceTimersByTime(11999); expect(info).not.toHaveBeenCalled(); vi.advanceTimersByTime(1); expect(info).toHaveBeenCalledOnce(); expect(error).not.toHaveBeenCalled(); vi.advanceTimersByTime(3000); expect(error).toHaveBeenCalledOnce();
  });
  it('renders all 21 real tasks exactly once, with no ownership essays', () => {
    const r = room(); const markup = renderToStaticMarkup(createElement(ChainHUD, { room: r, playerId: 'p' }));
    expect((markup.match(/data-task-id=/g) ?? []).length).toBe(21);
    for (const task of r.round!.tasks) expect(markup).toContain(`data-task-id="${task.id}"`);
    expect(markup).toContain('data-owner="Tester"'); expect(markup).not.toContain('chain-roster');
    const paths = personalPaths(r.round!.tasks, 'p'); expect(paths).toHaveLength(2);
  });
  it('only allocates live previews for active rooms', () => {
    const r = room(); expect(activePreviewRooms([r, { ...r, id: 'wait', status: 'WAITING' }, { ...r, id: 'done', status: 'COMPLETED' }]).map(r => r.id)).toEqual(['r']);
  });
  it('runs one human plus fourteen bots locally without ranked results', async () => {
    vi.stubGlobal('window', { PIT_CONFIG: {} }); vi.useFakeTimers(); vi.setSystemTime(100000);
    const { solo } = await import('../src/solo');
    await solo.enter(); await solo.call('ready', null, { ready: true }); let snapshot = await solo.call('start');
    expect(snapshot.rooms[0].players).toHaveLength(1);
    expect(new Set(snapshot.rooms[0].round!.tasks.filter(t => t.ownerId === null).map(t => t.role)).size).toBe(14);
    for (let i = 0; i < 100 && snapshot.rooms[0].status !== 'COMPLETED'; i++) {
      vi.advanceTimersByTime(1000); snapshot = await solo.getState();
      for (const task of snapshot.rooms[0].round!.tasks.filter(t => t.ownerId === 'solo-you' && t.status === 'AVAILABLE')) snapshot = await solo.call('action', null, { taskId: task.id, requestId: task.id });
    }
    expect(snapshot.rooms[0].status).toBe('COMPLETED'); expect(snapshot.rooms[0].round!.tasks.every(t => t.status === 'DONE')).toBe(true); expect(snapshot.leaderboard).toEqual([]);
    await solo.call('leave'); expect(solo.active).toBe(false);
  });
});

it('disables the temporary Solo Test entry point through public configuration', async () => {
  vi.resetModules(); vi.stubGlobal('window', { PIT_CONFIG: { enableSoloTest: false } });
  const { solo, ENABLE_SOLO_TEST_MODE } = await import('../src/solo');
  expect(ENABLE_SOLO_TEST_MODE).toBe(false); expect(() => solo.enter()).toThrow('disabled');
});
