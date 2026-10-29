import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Snapshot } from '../src/types';

const mock = vi.hoisted(() => ({
  createClient: vi.fn(), rpc: vi.fn(), getSession: vi.fn(),
  signInAnonymously: vi.fn(), signInWithPassword: vi.fn(), signOut: vi.fn()
}));
vi.mock('@supabase/supabase-js', () => ({ createClient: mock.createClient }));
const empty: Snapshot = { rooms: [], leaderboard: [], serverNow: 1000, identity: { playerId: null, isAdmin: false } };
const member = { ...empty, identity: { playerId: 'player-public-id', isAdmin: true }, rooms: [{ players: [{ id: 'player-public-id' }] }] };

describe('production transport identity boundaries', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubGlobal('window', { PIT_CONFIG: { supabaseUrl: 'https://example.supabase.co', supabaseAnonKey: 'sb_publishable_test' } });
    mock.rpc.mockImplementation(() => ({ abortSignal: () => Promise.resolve({ data: empty, error: null }) }));
    mock.getSession.mockResolvedValue({ data: { session: null }, error: null });
    mock.signInAnonymously.mockResolvedValue({ error: null });
    mock.createClient.mockReturnValue({ rpc: mock.rpc, auth: { getSession: mock.getSession, signInAnonymously: mock.signInAnonymously, signInWithPassword: mock.signInWithPassword, signOut: mock.signOut } });
  });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

  it('uses committed realtime state without copying a public identity or recalibrating timestamps from receipt time',async()=>{
    const {publicUpdate}=await import('../src/api');
    const updated_at='2026-10-30T00:00:00.123Z';
    expect(publicUpdate({new:{state:{...empty,identity:{playerId:'other',isAdmin:true}},updated_at}})).toEqual({rooms:[],leaderboard:[],serverNow:Date.parse(updated_at)});
    expect(publicUpdate({new:{state:empty,updated_at:'invalid'}})).toBeUndefined();
    expect(publicUpdate({new:{updated_at}})).toBeUndefined();
    expect(publicUpdate({new:{state:{rooms:[]},updated_at}})).toBeUndefined();
  });

  it('delivers realtime rows directly without making a refresh RPC for each event',async()=>{
    let deliver:(payload:unknown)=>void=()=>{};
    const channel={on:vi.fn((_kind,_filter,callback)=>{deliver=callback;return channel;}),subscribe:vi.fn(()=>channel)};
    const unsubscribe=vi.fn(),removeChannel=vi.fn();
    mock.createClient.mockReturnValue({channel:()=>channel,removeChannel,auth:{onAuthStateChange:()=>({data:{subscription:{unsubscribe}}})}});
    const {api}=await import('../src/api');const callback=vi.fn();const stop=api.subscribe(callback);
    deliver({new:{state:empty,updated_at:'2026-10-30T00:00:00Z'}});
    expect(callback).toHaveBeenCalledWith({rooms:[],leaderboard:[],serverNow:Date.parse('2026-10-30T00:00:00Z')});expect(mock.rpc).not.toHaveBeenCalled();
    stop();expect(removeChannel).toHaveBeenCalledWith(channel);expect(unsubscribe).toHaveBeenCalledOnce();
  });

  it('spectators read and reconcile without creating a player authentication session', async () => {
    const { api } = await import('../src/api');
    expect(api.hasBackend).toBe(true);
    await api.getState();
    await api.call('heartbeat');
    expect(mock.getSession).not.toHaveBeenCalled();
    expect(mock.signInAnonymously).not.toHaveBeenCalled();
    expect(mock.rpc.mock.calls.map((call) => call[0])).toEqual(['pit_state', 'pit_call']);
  });

  it('authenticates playing commands and sends no client authority over timestamp or identity', async () => {
    const { api } = await import('../src/api');
    await api.call('action', 'room', { taskId: 'FRONT_LIFT', requestId: 'request' });
    expect(mock.signInAnonymously).toHaveBeenCalledTimes(1);
    expect(mock.rpc).toHaveBeenCalledWith('pit_call', { p_op: 'action', p_room: 'room', p_payload: { taskId: 'FRONT_LIFT', requestId: 'request' } });
  });

  it('prevents admin account switching or sign-out from orphaning an active player identity', async () => {
    mock.rpc.mockImplementation(() => ({ abortSignal: () => Promise.resolve({ data: member, error: null }) }));
    const { api } = await import('../src/api');
    await expect(api.signInAdmin('admin@example.com', 'password')).rejects.toThrow('Leave your current room');
    await expect(api.signOutAdmin()).rejects.toThrow('Leave your current room');
    expect(mock.signInWithPassword).not.toHaveBeenCalled();
    expect(mock.signOut).not.toHaveBeenCalled();
  });

  it('aborts a stalled RPC so reconnect requests can progress', async () => {
    vi.useFakeTimers();
    mock.rpc.mockImplementation(() => ({ abortSignal: (signal: AbortSignal) => new Promise((resolve) => signal.addEventListener('abort', () => resolve({ data: null, error: { message: 'aborted' } }))) }));
    const { api } = await import('../src/api');
    const rejected = expect(api.getState()).rejects.toThrow('Connection timed out');
    await vi.advanceTimersByTimeAsync(10001);
    await rejected;
  });

  it('rejects accidentally supplied secret keys and incomplete runtime configuration', async () => {
    vi.stubGlobal('window', { PIT_CONFIG: { supabaseUrl: 'https://example.supabase.co', supabaseAnonKey: 'sb_secret_forbidden' } });
    const { api } = await import('../src/api');
    await expect(api.getState()).rejects.toThrow('never a secret key');
    expect(mock.createClient).not.toHaveBeenCalled();
    vi.resetModules();
    vi.stubGlobal('window', { PIT_CONFIG: { supabaseUrl: 'https://example.supabase.co' } });
    const partial = await import('../src/api');
    await expect(partial.api.getState()).rejects.toThrow('Complete both public values');
  });
  it('uses a server-configured username alias and Supabase Auth for real administrator access', async () => {
    let reads=0;
    mock.rpc.mockImplementation((name:string)=>({abortSignal:()=>Promise.resolve({data:name==='pit_admin_login_identity'?{email:'admin-fixture@example.test'}:{...empty,identity:{playerId:null,isAdmin:++reads>1}},error:null})}));
    mock.signInWithPassword.mockResolvedValue({error:null});
    const {api}=await import('../src/api');await api.signInAdmin('admin','a-private-fixture-password');
    expect(mock.rpc).toHaveBeenCalledWith('pit_admin_login_identity',{p_username:'admin'});
    expect(mock.signInWithPassword).toHaveBeenCalledWith({email:'admin-fixture@example.test',password:'a-private-fixture-password'});
  });
  it('never sends configured online RPCs while entering and operating Solo Test', async () => {
    const {api}=await import('../src/api');await api.call('solo_enter');await api.call('choose_role',null,{role:'RELEASE_CONTROLLER'});await api.call('ready',null,{ready:true});await api.call('start');await api.getState();
    expect(mock.rpc).not.toHaveBeenCalled();expect(mock.signInAnonymously).not.toHaveBeenCalled();await api.call('leave');
  });

  it('submits an existing short password to Supabase Auth rather than imposing a frontend policy', async () => {
    let reads = 0;
    mock.rpc.mockImplementation((name: string) => ({ abortSignal: () => Promise.resolve({ data: name === 'pit_admin_login_identity' ? { email: 'existing@example.test' } : { ...empty, identity: { playerId: null, isAdmin: ++reads > 1 } }, error: null }) }));
    mock.signInWithPassword.mockResolvedValue({ error: null });
    const { api } = await import('../src/api');
    await api.signInAdmin('admin', 'valid8pw');
    expect(mock.signInWithPassword).toHaveBeenCalledWith({ email: 'existing@example.test', password: 'valid8pw' });
  });

  it('reads retained completed replay publicly without signing in or occupying a seat', async () => {
    const record = { roundId: 'recorded-round', teamId: 'team', teamName: 'Saved team', color: '#ef3344', players: [], round: { id: 'recorded-round', status: 'COMPLETED', tasks: [], events: [] } };
    mock.rpc.mockImplementation(() => ({ abortSignal: () => Promise.resolve({ data: record, error: null }) }));
    const { api } = await import('../src/api');
    expect(await api.getReplay('recorded-round')).toEqual(record);
    expect(mock.rpc).toHaveBeenCalledWith('pit_replay', { p_round: 'recorded-round' });
    expect(mock.signInAnonymously).not.toHaveBeenCalled(); expect(mock.getSession).not.toHaveBeenCalled();
  });

  it('has no local admin login or local delete privilege when Supabase is absent', async () => {
    vi.stubGlobal('window', { PIT_CONFIG: {} });
    vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => {} });
    const { api } = await import('../src/api');
    expect(api.hasBackend).toBe(false);
    await expect(api.signInAdmin('admin', 'any-password')).rejects.toThrow('Global administration requires a connection to Supabase');
    await expect(api.signOutAdmin()).rejects.toThrow('connection to Supabase');
    await expect(api.getGlobalState()).rejects.toThrow('connection to Supabase');
    await expect(api.call('admin_delete', null, { confirm: 'DELETE' })).rejects.toThrow('connection to Supabase');
    expect((await api.getState()).identity.isAdmin).toBe(false);
    await api.call('solo_enter');
    expect((await api.getState()).identity.isAdmin).toBe(false);
    await expect(api.signInAdmin('admin', 'any-password')).rejects.toThrow('connection to Supabase');
    await expect(api.call('admin_delete', null, { confirm: 'DELETE' })).rejects.toThrow('connection to Supabase');
    await api.call('leave');
    expect(mock.rpc).not.toHaveBeenCalled(); expect(mock.signInWithPassword).not.toHaveBeenCalled();
  });

  it('uses the same real global admin session and online deletion while Solo retains its own player identity', async () => {
    let authenticated = false;
    mock.rpc.mockImplementation((name: string) => ({ abortSignal: () => Promise.resolve({ data: name === 'pit_admin_login_identity' ? { email: 'global@example.test' } : { ...empty, identity: { playerId: null, isAdmin: authenticated } }, error: null }) }));
    mock.signInWithPassword.mockImplementation(async () => { authenticated = true; return { error: null }; });
    mock.signOut.mockImplementation(async () => { authenticated = false; return { error: null }; });
    const { api } = await import('../src/api');
    const entered = await api.call('solo_enter'); const soloId = entered.rooms[0].id;
    await api.signInAdmin('admin', 'existing');
    expect((await api.getGlobalState()).identity.isAdmin).toBe(true);
    expect((await api.getState()).identity).toEqual({ playerId: 'solo-you', isAdmin: false });
    await api.call('admin_delete', null, { confirm: 'DELETE' });
    expect(mock.rpc).toHaveBeenCalledWith('pit_call', { p_op: 'admin_delete', p_room: null, p_payload: { confirm: 'DELETE' } });
    expect((await api.getState()).rooms[0].id).toBe(soloId);
    await api.call('leave');
    expect((await api.getState()).identity.isAdmin).toBe(true);
    await api.signOutAdmin();
    expect((await api.getGlobalState()).identity.isAdmin).toBe(false);
  });

  it('requires server allowlist verification after Auth, and rejects an authenticated non-admin', async () => {
    mock.rpc.mockImplementation((name: string) => ({ abortSignal: () => Promise.resolve({ data: name === 'pit_admin_login_identity' ? { email: 'nonadmin@example.test' } : empty, error: null }) }));
    mock.signInWithPassword.mockResolvedValue({ error: null }); mock.signOut.mockResolvedValue({ error: null });
    const { api } = await import('../src/api');
    await expect(api.signInAdmin('former-admin', 'existing')).rejects.toThrow('global admin allowlist');
    expect(mock.signOut).toHaveBeenCalledTimes(1);
    expect((await api.getGlobalState()).identity.isAdmin).toBe(false);
  });

  it('identifies an unreachable configured Supabase project without offering a mock login', async () => {
    mock.rpc.mockImplementation(() => ({ abortSignal: () => Promise.resolve({ data: null, error: { message: 'Failed to fetch' } }) }));
    const { api } = await import('../src/api');
    await expect(api.signInAdmin('admin', 'existing')).rejects.toThrow('Global administration requires a connection to Supabase');
    await expect(api.getGlobalState()).rejects.toThrow('connection to Supabase');
    expect(mock.signInWithPassword).not.toHaveBeenCalled();
    expect(api.globalRevision).toBe(0);
  });

  it('replays a finished Solo round after Play again without touching configured online APIs', async () => {
    vi.useFakeTimers(); vi.setSystemTime(100000);
    const { api } = await import('../src/api');
    await api.call('solo_enter'); await api.call('choose_role', null, { role: 'RELEASE_CONTROLLER' });
    await api.call('ready', null, { ready: true }); let state = await api.call('start');
    for (let i = 0; i < 300 && state.rooms[0].status !== 'COMPLETED'; i++) {
      vi.advanceTimersByTime(100); state = await api.getState();
      for (const task of state.rooms[0].round!.tasks.filter(task => task.ownerId === 'solo-you' && task.status === 'AVAILABLE')) state = await api.call('action', null, { taskId: task.id, requestId: task.id });
    }
    const roundId = state.rooms[0].round!.id;
    const record = await api.getReplay(roundId);
    expect(record.solo).toBe(true); expect(record.round.events).toHaveLength(21); expect(state.leaderboard).toEqual([]);
    await api.call('replay'); await api.call('choose_role', null, { role: 'FR_GUNNER' }); await api.call('leave');
    expect(await api.getReplay(roundId)).toEqual(record);
    expect(mock.rpc).not.toHaveBeenCalled(); expect(mock.signInAnonymously).not.toHaveBeenCalled();
  });


  it('never synthesizes fake players or rooms when Supabase is absent, and online create/join fail', async () => {
    vi.stubGlobal('window', { PIT_CONFIG: {} });
    const { api } = await import('../src/api');
    expect(api.hasBackend).toBe(false);
    expect(api.multiplayerUnavailableReason).toMatch(/Supabase/);
    expect((await api.getState()).rooms).toEqual([]);
    expect((await api.call('heartbeat')).rooms).toEqual([]);
    await expect(api.call('create', null, { name: 'Fake room', nickname: 'Someone' })).rejects.toThrow('Online multiplayer requires Supabase');
    await expect(api.call('join', 'fake-id', { nickname: 'Someone' })).rejects.toThrow('Online multiplayer requires Supabase');
    expect((await api.getState()).rooms).toEqual([]);
  });
  it('keeps offline Solo Test with one real player while rejecting online creation', async () => {
    vi.stubGlobal('window', { PIT_CONFIG: { enableSoloTest: true } });
    const { api } = await import('../src/api');
    const entered = await api.call('solo_enter');
    expect(entered.rooms).toHaveLength(1);
    expect(entered.rooms[0].players).toHaveLength(1);
    await api.call('choose_role', null, { role: 'REAR_JACK' });
    expect((await api.getState()).rooms[0].players[0].role).toBe('REAR_JACK');
    await api.call('leave');
    expect((await api.getState()).rooms).toHaveLength(0);
    await expect(api.call('create', null, { name:'New team', nickname:'Host' })).rejects.toThrow('Online multiplayer requires Supabase');
  });
});
