import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { ReplayRecord, Snapshot } from './types';
import { solo } from './solo';

declare global {
  interface Window { PIT_CONFIG?: { supabaseUrl?: string; supabaseAnonKey?: string; enableSoloTest?: boolean } }
}

const config = window.PIT_CONFIG ?? {};
const url = config.supabaseUrl?.trim() ?? '';
const key = config.supabaseAnonKey?.trim() ?? '';
const configured = Boolean(url && key);
let client: SupabaseClient | null = null;
let configurationError: string | null = null;
if (configured) {
  try {
    if (key.startsWith('sb_secret_')) throw new Error('config.js must contain a publishable public key, never a secret key.');
    if (key.split('.').length === 3) {
      const claim = JSON.parse(atob(key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      if (claim.role === 'service_role') throw new Error('Remove the service_role key from config.js and use the public anon key.');
    }
    client = createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  } catch (error) { configurationError = error instanceof Error ? error.message : 'Invalid Supabase configuration.'; }
} else if (url || key) configurationError = 'Complete both public values in config.js: supabaseUrl and supabaseAnonKey.';

const listeners = new Set<() => void>();
// Invalidate older reads when Auth or destructive global data changes. This is
// transport ordering only; the database remains the source of authorization.
let globalRevision = 0;
let authFlight: Promise<void> | null = null;
async function ensurePlayer(): Promise<void> {
  if (!client) return;
  if (authFlight) return authFlight;
  authFlight = (async () => {
    const { data, error } = await client!.auth.getSession();
    if (error) throw error;
    if (!data.session) {
      const { error: signInError } = await client!.auth.signInAnonymously();
      if (signInError) throw new Error(`Player sign-in failed. Enable Anonymous Sign-Ins in Supabase Authentication. ${signInError.message}`);
    }
  })();
  try { await authFlight; } finally { authFlight = null; }
}
function checkConfig(): void { if (configurationError) throw new Error(configurationError); }
async function rpc(name: string, parameters?: Record<string, unknown>): Promise<Snapshot> {
  checkConfig();
  if (!client) throw new Error('The online backend is not configured.');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const { data, error } = await client.rpc(name, parameters).abortSignal(controller.signal);
    if (error) throw new Error(controller.signal.aborted ? 'Connection timed out. Reconnecting to the pit lane.' : error.message);
    if (!data || !Array.isArray(data.rooms) || !data.identity) throw new Error('The backend returned an invalid snapshot. Apply SUPABASE_SETUP.sql to this project.');
    return data as Snapshot;
  } finally { clearTimeout(timeout); }
}
function adminFailure(message: string): Error {
  return new Error(/fetch|network|timed out|timeout|connection|abort/i.test(message)
    ? `Global administration requires a connection to Supabase. ${message}` : message);
}
async function globalSnapshot(): Promise<Snapshot> {
  checkConfig();
  if (!client) throw new Error('Global administration requires a connection to Supabase.');
  try { return await rpc('pit_state'); }
  catch (error) { throw adminFailure(error instanceof Error ? error.message : 'Connection interrupted.'); }
}

export const api = {
  isConfigured: configured,
  /** Administration always targets the real Supabase project, including during Solo. */
  hasBackend: Boolean(client),
  multiplayerUnavailableReason: configurationError ?? (!client ? 'Online multiplayer is unavailable. Configure the Supabase project URL and public key in config.js.' : null),
  get globalRevision() { return globalRevision; },
  getGlobalState: globalSnapshot,
  getState: async (): Promise<Snapshot> => {
    if (solo.active) return solo.getState();
    checkConfig();
    if (!client) return { rooms: [], leaderboard: [], serverNow: Date.now(), identity: { playerId: null, isAdmin: false } };
    return rpc('pit_state');
  },
  getReplay: async (roundId: string): Promise<ReplayRecord> => {
    const local = solo.getReplay(roundId);
    if (local) return local;
    checkConfig();
    if (!client) throw new Error('Online replays require a Supabase connection.');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
      // Public spectator read: neither anonymous sign-in nor a player seat is needed.
      const { data, error } = await client.rpc('pit_replay', { p_round: roundId }).abortSignal(controller.signal);
      if (error) throw new Error(controller.signal.aborted ? 'Replay request timed out. Please try again.' : error.message);
      if (!data?.round || data.roundId !== roundId || !Array.isArray(data.players)) throw new Error('Replay is no longer available.');
      return data as ReplayRecord;
    } finally { clearTimeout(timer); }
  },
  call: async (op: string, roomId?: string | null, payload: Record<string, unknown> = {}): Promise<Snapshot> => {
    if (op === 'solo_enter') return solo.enter();
    if (solo.active && op !== 'admin_delete') return solo.call(op, roomId, payload);
    if (op === 'admin_delete' && !client) throw new Error('Global administration requires a connection to Supabase and an authorized admin account.');
    checkConfig();
    if (!client) {
      if (op === 'heartbeat') return { rooms: [], leaderboard: [], serverNow: Date.now(), identity: { playerId: null, isAdmin: false } };
      throw new Error('Online multiplayer requires Supabase. Configure the public project URL and key in config.js. Local Practice has been removed; use Solo Test for offline testing.');
    }
    if (op === 'admin_delete') globalRevision++;
    if (!['heartbeat'].includes(op)) await ensurePlayer();
    const result = await rpc('pit_call', { p_op: op, p_room: roomId ?? null, p_payload: payload });
    if (op === 'admin_delete') globalRevision++;
    return result;
  },
  recoverSession: async (): Promise<void> => {
    if (!client) return;
    client.auth.startAutoRefresh?.();
    const { data } = await client.auth.getSession();
    if (data.session?.expires_at && data.session.expires_at * 1000 < Date.now() + 60000) await client.auth.refreshSession();
  },
  subscribe: (callback: () => void): (() => void) => {
    listeners.add(callback);
    if (!client) return () => { listeners.delete(callback); };
    const channel = client.channel(`pit-global-${crypto.randomUUID()}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pit_public_state' }, callback)
      .subscribe((status) => { if (status === 'SUBSCRIBED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') callback(); });
    const authSubscription = client.auth.onAuthStateChange(() => callback());
    return () => { listeners.delete(callback); void client!.removeChannel(channel); authSubscription.data.subscription.unsubscribe(); };
  },
  signInAdmin: async (username: string, password: string): Promise<void> => {
    checkConfig();
    if (!client) throw new Error('Global administration requires a connection to Supabase.');
    const snapshot = await globalSnapshot();
    if (snapshot.rooms.some((room) => room.players.some((player) => player.id === snapshot.identity.playerId))) {
      throw new Error('Leave your current room before signing in as a global admin. This keeps your player seat connected to its original identity.');
    }
    globalRevision++;
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 10000);
    let email: string;
    try { const { data, error } = await client.rpc('pit_admin_login_identity', { p_username: username.trim().toLowerCase() }).abortSignal(controller.signal); if (error || !data?.email) throw adminFailure(error?.message ?? 'Admin username is not configured. Check pit_private.admin_aliases in V11_ADMIN_SETUP.md.'); email = data.email; } finally { clearTimeout(timer); }
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw adminFailure(error.message.toLowerCase().includes('email not confirmed') ? 'Admin email is not confirmed. Ask the project owner to confirm this Auth user in Supabase.' : error.message);
    globalRevision++;
    const authorized = await globalSnapshot();
    if (!authorized.identity.isAdmin) { await client.auth.signOut(); globalRevision++; throw new Error('This Auth account is not in the global admin allowlist. Check pit_private.admins and admin_aliases in V11_ADMIN_SETUP.md.'); }
    queueMicrotask(() => listeners.forEach(callback => callback()));
  },
  signOutAdmin: async (): Promise<void> => {
    if (!client) throw new Error('Global administration requires a connection to Supabase.');
    if (client) {
      const snapshot = await globalSnapshot();
      if (snapshot.rooms.some((room) => room.players.some((player) => player.id === snapshot.identity.playerId))) {
        throw new Error('Leave your current room before signing out, so your active player seat stays connected.');
      }
      globalRevision++;
      const { error } = await client.auth.signOut();
      if (error) throw new Error(error.message);
      globalRevision++;
      queueMicrotask(() => listeners.forEach(callback => callback()));
    }
  }
};
