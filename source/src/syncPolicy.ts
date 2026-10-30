import type { Snapshot } from './types';

/** Presence/fallback polling is independent of unrelated teams' race status. */
export function nextSyncDelay(state: Snapshot, watching: boolean, now: number, failures = 0, random = Math.random,realtimeHealthy=true): number {
  if (failures) return Math.min(60000, 1500 * 2 ** Math.min(failures - 1, 6)) * (.85 + random() * .3);
  const room = state.rooms.find(room => room.players.some(player => player.id === state.identity.playerId));
  const active = room && (room.status === 'COUNTDOWN' || room.status === 'RUNNING');
  if (active && room.round) {
    const online=!room.solo&&!state.local;
    const ceiling=online?(realtimeHealthy?1000:650):2500;
    const leader = room.players.filter(player => player.connected !== false).sort((a, b) => a.joinedAt - b.joinedAt || a.id.localeCompare(b.id))[0];
    if (leader?.id === state.identity.playerId) {
      const due = room.status === 'COUNTDOWN' ? room.round.goAt : Math.min(...room.round.tasks.filter(task => task.status === 'AVAILABLE' && task.ownerId === null && task.dueAt !== null).map(task => task.dueAt!));
      if (Number.isFinite(due)) return Math.max(100, Math.min(ceiling, due - now + 35));
    }
    return online?(realtimeHealthy?1000 + random() * 200:650 + random() * 150):2500+random()*400;
  }
  if (!room && watching && state.rooms.some(room => room.status === 'RUNNING' || room.status === 'COUNTDOWN')) return 1800 + random() * 300;
  return 12000 + random() * 2000;
}

export class RefreshCoalescer {
  private timer: ReturnType<typeof setTimeout> | null = null;
  constructor(private readonly callback: () => void, private readonly delay = 180) {}
  request() { if (this.timer !== null) return; this.timer = setTimeout(() => { this.timer = null; this.callback(); }, this.delay); }
  dispose() { if (this.timer !== null) clearTimeout(this.timer); this.timer = null; }
}
