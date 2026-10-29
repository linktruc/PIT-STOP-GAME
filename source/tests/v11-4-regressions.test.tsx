import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import NavigationPanel from '../src/NavigationPanel';
import SoloRolePicker from '../src/SoloRolePicker';
import { ROLES, roleLabel } from '../src/types';

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('V11.4 contextual controls', () => {
  it('provides every distinct Solo position with explicit corner labels', () => {
    for (const role of ROLES) {
      const html = renderToStaticMarkup(<SoloRolePicker role={role} busy={false} onChange={() => {}} />);
      expect((html.match(/<option /g) ?? [])).toHaveLength(15);
      for (const option of ROLES) expect(html).toContain(`value="${option}"`);
      expect(html).toContain(`value="${role}" selected=""`);
      expect(html).toContain(roleLabel(role));
    }
  });
  it('keeps all existing routes while omitting the screen already being viewed', () => {
    const crew = renderToStaticMarkup(<NavigationPanel view="crew" hasTeam hasDisplayedRoom focused={false} solo={false} onSelect={() => {}} />);
    for (const name of ['Main Menu','Full Workflow','Team Members','All Roles','Leaderboard','Watch Live','Invite Link','Settings']) expect(crew).toContain(`<strong>${name}</strong>`);
    expect(crew).not.toContain('<strong>My Team</strong>');
    const menu = renderToStaticMarkup(<NavigationPanel view="menu" hasTeam hasDisplayedRoom focused={false} solo onSelect={() => {}} />);
    expect(menu).toContain('<strong>Resume Team</strong>');
    expect(menu).not.toContain('<strong>Main Menu</strong>');
    expect(menu).not.toContain('<strong>Invite Link</strong>');
  });
  it('does not duplicate the Watch overview or offer unavailable team actions', () => {
    const overview = renderToStaticMarkup(<NavigationPanel view="watch" hasTeam={false} hasDisplayedRoom={false} focused={false} solo={false} onSelect={() => {}} />);
    for (const label of ['Watch Live','My Team','Full Workflow','Team Members','Invite Link']) expect(overview).not.toContain(`<strong>${label}</strong>`);
    const focus = renderToStaticMarkup(<NavigationPanel view="watch" hasTeam hasDisplayedRoom focused solo={false} onSelect={() => {}} />);
    expect(focus).toContain('<strong>Watch Live</strong>'); expect(focus).toContain('<strong>My Team</strong>');
  });
});

async function localSolo() {
  vi.resetModules(); vi.stubGlobal('window', { PIT_CONFIG: { enableSoloTest: true } });
  vi.useFakeTimers(); vi.setSystemTime(100000);
  const { solo } = await import('../src/solo'); await solo.enter(); return solo;
}

describe('V11.4 idle-only Solo editing', () => {
  it('resets Ready on a valid change, rejects invalid roles atomically, and locks role/Ready/restart throughout a live attempt', async () => {
    const solo = await localSolo();
    await solo.call('ready', null, { ready: true });
    await expect(solo.call('choose_role', null, { role: 'SUPPORT' })).rejects.toThrow('valid role');
    expect((await solo.getState()).rooms[0].players[0].ready).toBe(true);
    const changed = await solo.call('choose_role', null, { role: 'RR_GUNNER' });
    expect(changed.rooms[0].players[0]).toMatchObject({ role: 'RR_GUNNER', ready: false });
    expect(changed.rooms[0].round).toBeNull();
    await expect(solo.call('start')).rejects.toThrow('Mark Ready');
    await solo.call('ready', null, { ready: true }); await solo.call('start');
    for (const advance of [0, 3100]) {
      vi.advanceTimersByTime(advance);
      const before = await solo.getState();
      await expect(solo.call('choose_role', null, { role: 'REAR_JACK' })).rejects.toThrow('before starting');
      await expect(solo.call('ready', null, { ready: false })).rejects.toThrow('before starting');
      await expect(solo.call('start')).rejects.toThrow('Finish this attempt');
      expect(await solo.getState()).toEqual(before);
    }
  });
  it('preserves the recorded role while the next idle round gets fresh ownership and no old task/penalty/event state', async () => {
    const solo = await localSolo();
    await solo.call('ready', null, { ready: true }); let state = await solo.call('start');
    for (let tick = 0; tick < 500 && state.rooms[0].status !== 'COMPLETED'; tick++) {
      vi.advanceTimersByTime(100); state = await solo.getState();
      for (const task of state.rooms[0].round!.tasks.filter(task => task.ownerId === 'solo-you' && task.status === 'AVAILABLE')) {
        state = await solo.call('action', null, { taskId: task.id, requestId: task.id });
      }
    }
    expect(state.rooms[0].status).toBe('COMPLETED');
    const oldId = state.rooms[0].round!.id;
    await solo.call('replay'); await solo.call('choose_role', null, { role: 'FR_GUNNER' });
    await solo.call('ready', null, { ready: true }); state = await solo.call('start');
    const round = state.rooms[0].round!;
    expect(round.id).not.toBe(oldId);
    expect(round.tasks.filter(task => task.ownerId === 'solo-you').map(task => task.id)).toEqual(['FR_GUN_LOOSEN','FR_GUN_TIGHTEN']);
    expect(round.tasks.filter(task => task.role !== 'FR_GUNNER').every(task => task.ownerId === null)).toBe(true);
    expect(round.events).toEqual([]); expect(round.samples).toEqual([]); expect(round.requests).toEqual({}); expect(round.penalties).toBeUndefined();
    expect(solo.getReplay(oldId)?.round.players?.[0].role).toBe('FRONT_JACK');
    expect(solo.getReplay(oldId)?.solo).toBe(true); expect(state.leaderboard).toEqual([]);
  });
});
