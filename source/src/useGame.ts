import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api';
import type { Snapshot } from './types';
import { nextSyncDelay, RefreshCoalescer } from './syncPolicy';

const initial: Snapshot = { rooms: [], leaderboard: [], serverNow: Date.now(), identity: { playerId: null, isAdmin: false } };
export function useGame(watching = false) {
  const [state, setState] = useState(initial);
  // A local rehearsal keeps its own player/room identity. Supabase Auth and
  // verified global privileges survive entering it, without becoming Solo powers.
  const [globalState, setGlobalState] = useState<Snapshot | null>(null);
  const [busy, setBusy] = useState(''); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  const [loaded, setLoaded] = useState(false); const [lastSync, setLastSync] = useState(0); const [clock, setClock] = useState(Date.now());
  const snapshot = useRef(state); snapshot.current = state;
  const observer = useRef(watching); observer.current = watching;
  const offset = useRef(0); const latest = useRef(0); const queue = useRef<Promise<unknown>>(Promise.resolve());
  const refreshing = useRef(false); const mutation = useRef(false); const intentionalLeave = useRef(false); const failures = useRef(0);
  const missing = useRef(0); const alive = useRef(true); const poll = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshRef = useRef<(heartbeat?: boolean) => Promise<void>>(async () => {});
  const earlyTokens = useRef(new Map<string, string>());
  const actionTokens = useRef(new Map<string, string>()); const unresolved = useRef<{room: string; task: string} | null>(null);
  const mutationSequence=useRef(0);
  const actionFlight=useRef<{sequence:number;room:string;round:string|undefined;task:string;acknowledged:boolean}|null>(null);
  const coalescer = useRef<RefreshCoalescer | null>(null);
  const globalFlight = useRef<Promise<void> | null>(null);
  const globalFlightRevision = useRef(0);
  const globalStamp = useRef({ revision: -1, now: -Infinity });
  const globalCoalescer = useRef<RefreshCoalescer | null>(null);
  if (!coalescer.current) coalescer.current = new RefreshCoalescer(() => { void refreshRef.current(); });
  const acceptGlobalState = useCallback((next: Snapshot, revision = api.globalRevision) => {
    if (next.local || revision !== api.globalRevision) return;
    if (globalStamp.current.revision === revision && next.serverNow < globalStamp.current.now) return;
    globalStamp.current = { revision, now: next.serverNow };
    setGlobalState(next);
  }, []);
  const refreshGlobalState = useCallback(async function fetchFreshGlobal(): Promise<void> {
    if (!api.hasBackend) { setGlobalState(null); return; }
    if (globalFlight.current) {
      const revision = globalFlightRevision.current;
      try { await globalFlight.current; }
      catch (error) { if (revision === api.globalRevision) throw error; }
      if (revision !== api.globalRevision) return fetchFreshGlobal();
      return;
    }
    const revision = api.globalRevision;
    globalFlightRevision.current = revision;
    globalFlight.current = (async () => {
      try { const next = await api.getGlobalState(); if (alive.current) acceptGlobalState(next, revision); }
      finally { globalFlight.current = null; }
    })();
    try { await globalFlight.current; }
    catch (error) { if (revision === api.globalRevision) throw error; }
    if (revision !== api.globalRevision) return fetchFreshGlobal();
  }, [acceptGlobalState]);
  if (!globalCoalescer.current) globalCoalescer.current = new RefreshCoalescer(() => {
    void refreshGlobalState().catch(() => { /* Retry on the global screen; local Solo remains playable. */ });
  }, 1000);
  const enqueue = useCallback(<T,>(job: () => Promise<T>): Promise<T> => {
    const result = queue.current.then(job, job); queue.current = result.then(() => undefined, () => undefined); return result;
  }, []);
  const receive = useCallback((next: Snapshot, sentAt: number, readRevision = api.globalRevision, pushed=false) => {
    const old = snapshot.current;
    if (!alive.current || !Number.isFinite(next.serverNow) || (!!next.local === !!old.local && next.serverNow < latest.current)) return;
    const prior = old.rooms.find(room => room.players.some(player => player.id === old.identity.playerId));
    const room = next.rooms.find(room => room.players.some(player => player.id === next.identity.playerId));
    const flight=actionFlight.current;
    if(flight&&room?.id===flight.room&&room.round&&room.round.id===flight.round&&room.round.tasks.some(t=>t.id===flight.task&&t.status==='DONE')){
      flight.acknowledged=true;
      if(flight.sequence===mutationSequence.current){mutation.current=false;setBusy('');actionFlight.current=null;}
    }
    if (prior && !room && !intentionalLeave.current && ++missing.current < 2) { coalescer.current?.request(); return; }
    missing.current = 0;
    if (prior && !room && !intentionalLeave.current) setNotice('Your crew membership ended. You may have been removed or exceeded the 15-minute lobby grace period.');
    if (prior && room?.id === prior.id) {
      const before = prior.players.find(player => player.id === old.identity.playerId);
      const after = room.players.find(player => player.id === next.identity.playerId);
      if (after?.role !== before?.role && !room.solo) setNotice(after?.roleNotice ?? 'Your role changed to keep a human jack in the crew. Check your role and mark Ready again.');
      else if (after?.roleNotice && after.roleNotice !== before?.roleNotice) setNotice(after.roleNotice);
      if (prior.hostId !== room.hostId) setNotice(`Host transferred to ${room.players.find(player => player.id === room.hostId)?.nickname ?? 'another crew member'}.`);
    }
    const unknown = unresolved.current;
    if (unknown && (next.rooms.find(item => item.id === unknown.room)?.round?.tasks.find(task => task.id === unknown.task) || !next.rooms.some(item => item.id === unknown.room))) { unresolved.current = null; setBusy(''); }
    latest.current = next.serverNow; if(!pushed)offset.current = next.local ? 0 : next.serverNow - (sentAt + Date.now()) / 2;
    snapshot.current = next; intentionalLeave.current = false; setState(next); setLoaded(true); setLastSync(Date.now()); failures.current = 0;
    if (api.hasBackend && !next.local) acceptGlobalState(next, readRevision);
  }, [acceptGlobalState]);
  const schedule = useCallback(() => {
    if (poll.current) clearTimeout(poll.current);
    if (!alive.current) return;
    const delay = document.hidden ? 60000 : nextSyncDelay(snapshot.current, observer.current, Date.now() + offset.current, failures.current);
    poll.current = setTimeout(() => { void refreshRef.current(true); }, delay);
  }, []);
  const refresh = useCallback(async (heartbeat = false) => {
    if (refreshing.current || mutation.current || !alive.current) { coalescer.current?.request(); return; }
    refreshing.current = true;
    try {
      await enqueue(async () => {
        const current = snapshot.current; const room = current.rooms.find(room => room.players.some(player => player.id === current.identity.playerId));
        const sent = Date.now(); const revision = api.globalRevision;
        receive(heartbeat ? await api.call('heartbeat', room?.id ?? null) : await api.getState(), sent, revision);
      });
    } catch (error) {
      failures.current++; setLastSync(0); setError(error instanceof Error ? error.message : 'Connection interrupted. Reconnecting…'); setLoaded(true);
    } finally { refreshing.current = false; schedule(); }
  }, [enqueue, receive, schedule]);
  refreshRef.current = refresh;
  useEffect(() => {
    alive.current = true; void refresh(true);
    const unsubscribe = api.subscribe(update => {
      if(update&&!snapshot.current.local&&latest.current>0)receive({...update,identity:snapshot.current.identity},Date.now(),api.globalRevision,true);
      else coalescer.current?.request();
      if (snapshot.current.rooms.some(room => room.solo)) globalCoalescer.current?.request();
    });
    const recover = () => { if (!document.hidden) { failures.current = 0; void api.recoverSession().then(() => refreshRef.current(true)).catch(() => refreshRef.current(true)); } };
    document.addEventListener('visibilitychange', recover); window.addEventListener('online', recover);
    return () => { alive.current = false; unsubscribe(); coalescer.current?.dispose(); globalCoalescer.current?.dispose(); if (poll.current) clearTimeout(poll.current); document.removeEventListener('visibilitychange', recover); window.removeEventListener('online', recover); };
  }, [refresh, refreshGlobalState, receive]);
  useEffect(() => { schedule(); }, [state, watching, schedule]);
  useEffect(() => {
    if (!api.hasBackend || !state.local) return;
    let stopped = false; let timer: ReturnType<typeof setTimeout> | null = null;
    const tick = async () => {
      if (!document.hidden) {
        try { await refreshGlobalState(); } catch { /* A global outage must not interrupt Solo. */ }
      }
      if (!stopped) timer = setTimeout(() => { void tick(); }, document.hidden ? 60000 : watching ? 2500 : 15000);
    };
    void tick();
    return () => { stopped = true; if (timer) clearTimeout(timer); };
  }, [state.local, watching, refreshGlobalState]);
  useEffect(() => { const timer = setInterval(() => setClock(Date.now()), 50); return () => clearInterval(timer); }, []);
  const myRoom = state.rooms.find(room => room.players.some(player => player.id === state.identity.playerId)) ?? null;
  const run = useCallback(async (op: string, roomId?: string | null, payload: Record<string, unknown> = {}): Promise<boolean> => {
    if (mutation.current || unresolved.current) return false;
    mutation.current = true; setBusy(op); setError('');
    const sequence=++mutationSequence.current;
    const flight=op==='action'&&roomId?{sequence,room:roomId,round:snapshot.current.rooms.find(r=>r.id===roomId)?.round?.id,task:String(payload.taskId),acknowledged:false}:null;
    if(flight)actionFlight.current=flight;
    if (op === 'leave') intentionalLeave.current = true;
    let accepted = false;
    const earlyKey = `${snapshot.current.rooms.find(room => room.id === roomId)?.round?.id}/${payload.taskId}`;
    if (op === 'early_action') { if (!earlyTokens.current.has(earlyKey)) earlyTokens.current.set(earlyKey, crypto.randomUUID()); payload = { ...payload, requestId: earlyTokens.current.get(earlyKey) }; }
    if (op === 'action' && roomId) {
      const key = `${snapshot.current.rooms.find(room => room.id === roomId)?.round?.id}/${payload.taskId}`;
      if (!actionTokens.current.has(key)) actionTokens.current.set(key, String(payload.requestId ?? crypto.randomUUID()));
      payload = { ...payload, requestId: actionTokens.current.get(key) };
    }
    try {
      const execute=async () => {
        const sent = Date.now();
        const next = await api.call(op, roomId, payload);
        if (op === 'admin_delete') {
          acceptGlobalState(next);
          receive(snapshot.current.rooms.some(room => room.solo) ? await api.getState() : next, sent);
        } else receive(next, sent);
      };
      // An in-flight heartbeat/read must never hold a player's press in a queue.
      if(op==='action'||op==='early_action')await execute();else await enqueue(execute);
      accepted = true; if (op === 'early_action') earlyTokens.current.delete(earlyKey); return true;
    } catch (error) {
      if(flight?.acknowledged)return true;
      intentionalLeave.current = false;
      const message = error instanceof Error ? error.message : 'Request failed. Please try again.';
      if ((op === 'action' || op === 'early_action') && roomId && /timeout|timed out|network|fetch|connection/i.test(message)) {
        unresolved.current = { room: roomId, task: String(payload.taskId) }; setError('Connection interrupted. Checking whether your action was accepted.');
        try {
          const sent = Date.now(); const next = await api.getState();
          accepted = next.rooms.find(room => room.id === roomId)?.round?.tasks.some(task => task.id === payload.taskId && task.status === 'DONE') ?? false;
          receive(next, sent); return accepted;
        } catch { failures.current++; setLastSync(0); }
      } else setError(message);
      return false;
    } finally { if(sequence===mutationSequence.current){mutation.current = false;if(actionFlight.current===flight)actionFlight.current=null;if (!unresolved.current) setBusy('');} schedule(); }
  }, [acceptGlobalState, enqueue, receive, schedule]);
  return { state, globalState, refreshGlobalState, myRoom, now: clock + offset.current, clockOffset: offset.current, busy, error, notice, loaded, stale: lastSync === 0 || clock - lastSync > (myRoom?.status === 'RUNNING' || watching ? 10000 : 30000), refresh, run, setError, setNotice };
}
