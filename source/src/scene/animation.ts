import type { Round, Task } from '../types';
import { OLD_WHEEL_REMOVE_MS, oldWheelCarryClearAt } from './oldWheel';

export interface AnimationReceipt {
  readonly roundId: string;
  readonly taskId: string;
  readonly startsAt: number;
  readonly endsAt: number;
}

/** Presentation time is deliberately independent of authoritative game time. */
export function durationForTask(taskId: string): number {
  if (taskId === 'GREEN_RELEASE') return 450;
  if (taskId.endsWith('_LIFT') || taskId.endsWith('_LOWER')) return 350;
  if (taskId.endsWith('_WHEEL_OFF') || taskId.endsWith('_WHEEL_ON')) return 450;
  return 350;
}

/**
 * Keep one instance for the mounted scene, outside its WebGL setup effect.
 * Receipts survive scene rebuilds; snapshots never modify game state or scores.
 */
export class TaskAnimationTimeline {
  private roundId: string | null = null;
  private receipts = new Map<string, AnimationReceipt>();
  private doneIds = new Set<string>();
  private recordedSignature = '';

  /** Recorded event clock is shared by live spectators and replay, including reverse seeks. */
  ingestRecorded(round: Round | null): void {
    const signature = JSON.stringify([round?.id, ...(round?.tasks ?? []).map(task => [task.id, task.completedAt, task.enabledAt, task.dueAt, task.status])]);
    if (signature === this.recordedSignature) return;
    this.recordedSignature = signature; this.roundId = round?.id ?? null;
    this.receipts.clear(); this.doneIds.clear();
    if (!round) return;
    // Solo bot work uses the authoritative scheduled interval, not a second
    // animation delay after completion. A receipt never marks an AVAILABLE bot done.
    if(round.soloTiming) for(const task of round.tasks) {
      if(task.ownerId!==null||task.enabledAt===null||task.dueAt===null||!['AVAILABLE','DONE'].includes(task.status))continue;
      this.receipts.set(this.key(task.id),Object.freeze({roundId:round.id,taskId:task.id,startsAt:task.enabledAt,endsAt:task.enabledAt+(task.cohort==='LIFT'||task.cohort==='GUN_LOOSEN'?Math.max(240,(task.completedAt??task.dueAt)-task.enabledAt):Math.max(task.id.endsWith('_WHEEL_OFF')?OLD_WHEEL_REMOVE_MS:240,Math.min(durationForTask(task.id),(task.completedAt??task.dueAt)-task.enabledAt)))}));
      if(task.status==='DONE')this.doneIds.add(task.id);
    }
    const byId = new Map(round.tasks.map(task => [task.id, task]));
    const visiting = new Set<string>();
    const enqueue = (task: Task): AnimationReceipt | undefined => {
      const existing = this.receipt(task.id); if (existing) return existing;
      if (task.completedAt === null || task.status !== 'DONE' || !Number.isFinite(task.completedAt) || visiting.has(task.id)) return;
      visiting.add(task.id);
      const parents = task.dependencies.map(id => byId.get(id)).filter(Boolean) as Task[];
      const parentEnds = parents.map(enqueue).filter(Boolean) as AnimationReceipt[];
      const startsAt = Math.max(round.goAt, task.completedAt, ...parentEnds.map(receipt => receipt.endsAt));
      const reaction = task.enabledAt === null ? durationForTask(task.id) : Math.max(0, task.completedAt - task.enabledAt);
      // Preserve every phase during very fast stops, with a short causal visual tail.
      // This presentation interval never contributes to the official pit-stop result.
      const duration = task.id.endsWith('_WHEEL_OFF')?Math.max(OLD_WHEEL_REMOVE_MS,Math.min(durationForTask(task.id),reaction||120)):Math.max(240, Math.min(durationForTask(task.id), reaction || 240));
      const receipt = Object.freeze({ roundId: round.id, taskId: task.id, startsAt, endsAt: startsAt + duration });
      this.receipts.set(this.key(task.id), receipt); this.doneIds.add(task.id); visiting.delete(task.id);
      return receipt;
    };
    round.tasks.forEach(enqueue);
    // Keep following tools out of the outgoing carrier corridor. Presentation
    // receipts may follow through after an official event; task clocks stay unchanged.
    // Opening fallback gunners still use their complete 700ms interval.
    if(round.soloTiming)for(const task of round.tasks){
      if(task.cohort==='GUN_LOOSEN')continue;
      const receipt=this.receipt(task.id);if(!receipt)continue;
      const ends=task.dependencies.map(id=>{const parent=this.receipt(id);if(!parent)return round.goAt;return task.id.endsWith('_WHEEL_ON')&&id.endsWith('_WHEEL_OFF')?Math.max(parent.endsAt,oldWheelCarryClearAt(parent)):parent.endsAt;});
      const startsAt=Math.max(receipt.startsAt,...ends);
      const minimum=task.id.endsWith('_WHEEL_OFF')?Math.max(OLD_WHEEL_REMOVE_MS,receipt.endsAt-receipt.startsAt):receipt.endsAt-receipt.startsAt;
      const endsAt=Math.max(receipt.endsAt,startsAt+minimum);
      this.receipts.set(this.key(task.id),Object.freeze({...receipt,startsAt,endsAt}));
    }
  }

  /** Preserve already playing receipts across snapshots; late fast completions
   * receive a visible interval instead of arriving already in the final pose. */
  ingestLive(round: Round | null, nowMs: number): void {
    const sameRound = this.roundId === (round?.id ?? null);
    const previous = sameRound ? new Map(this.receipts) : new Map<string, AnimationReceipt>();
    const joining = !sameRound && !!round && round.goAt < nowMs;
    this.ingestRecorded(round);
    if (!round) return;
    const byId = new Map(round.tasks.map(task => [task.id, task]));
    const visited = new Set<string>();
    const align = (id: string): AnimationReceipt | undefined => {
      const receipt = this.receipt(id);
      if (!receipt || visited.has(id)) return receipt;
      visited.add(id);
      const old = previous.get(this.key(id));
      if (old) { this.receipts.set(this.key(id), old); return old; }
      const task = byId.get(id)!;
      const parents = task.dependencies.map(parentId => {
        const parent = align(parentId);
        if (!parent) return round.goAt;
        return id.endsWith('_WHEEL_ON') && parentId.endsWith('_WHEEL_OFF')
          ? Math.max(parent.endsAt, oldWheelCarryClearAt(parent)) : parent.endsAt;
      });
      // A late join settles history; an observed running round must show new work.
      const startsAt = Math.max(receipt.startsAt, joining ? round.goAt : nowMs, ...parents);
      const next = Object.freeze({...receipt, startsAt, endsAt:startsAt + receipt.endsAt-receipt.startsAt});
      this.receipts.set(this.key(id),next);
      return next;
    };
    round.tasks.forEach(task => align(task.id));
  }

  private key(taskId: string): string {
    return `${this.roundId}:${taskId}`;
  }

  ingest(round: Round | null, nowMs: number, settleCurrent = false): void {
    if (round?.id !== this.roundId || settleCurrent) {
      this.roundId = round?.id ?? null;
      this.receipts.clear();
      this.doneIds.clear();
      // Joining an existing stop displays its current pose instead of replaying it.
      for (const task of round?.tasks ?? []) {
        if (task.status !== 'DONE') continue;
        this.doneIds.add(task.id);
        this.receipts.set(this.key(task.id), Object.freeze({
          roundId: round!.id, taskId: task.id, startsAt: nowMs, endsAt: nowMs,
        }));
      }
      return;
    }
    if (!round) return;

    const byId = new Map(round.tasks.map((task) => [task.id, task]));
    this.doneIds = new Set(round.tasks.filter((task) => task.status === 'DONE').map((task) => task.id));
    const visiting = new Set<string>();
    const enqueue = (task: Task): AnimationReceipt | undefined => {
      const existing = this.receipt(task.id);
      if (existing) return existing;
      // Valid game DAGs are acyclic; tolerate incomplete snapshots defensively.
      if (visiting.has(task.id)) return undefined;
      visiting.add(task.id);
      let startsAt = nowMs;
      for (const id of task.dependencies) {
        const parent = byId.get(id);
        const receipt = parent?.status === 'DONE' ? enqueue(parent) : this.receipt(id);
        if (receipt) startsAt = Math.max(startsAt, receipt.endsAt);
      }
      visiting.delete(task.id);
      const receipt = Object.freeze({
        roundId: round.id, taskId: task.id, startsAt, endsAt: startsAt + durationForTask(task.id),
      });
      this.receipts.set(this.key(task.id), receipt);
      return receipt;
    };
    for (const task of round.tasks) {
      if (task.status === 'DONE') enqueue(task);
    }
  }

  /** Catch up accepted prerequisites before acknowledging a human's next physical action. */
  acknowledge(taskId: string, tasks: Task[], nowMs: number): void {
    const byId = new Map(tasks.map(task => [task.id, task]));
    const settled = new Set<string>();
    const settle = (id: string) => {
      if (settled.has(id)) return; settled.add(id);
      const task = byId.get(id); if (!task || task.status !== 'DONE') return;
      task.dependencies.forEach(settle);
      const receipt = this.receipt(id);
      if (receipt && receipt.endsAt > nowMs) this.receipts.set(this.key(id), Object.freeze({ ...receipt, startsAt: nowMs, endsAt: nowMs }));
    };
    const task = byId.get(taskId); if (!task) return;
    task.dependencies.forEach(settle);
    const receipt = this.receipt(taskId);
    if (receipt && receipt.endsAt > nowMs) this.receipts.set(this.key(taskId), Object.freeze({ ...receipt, startsAt: nowMs, endsAt: nowMs + durationForTask(taskId) }));
    // Future children may have been enqueued by a batched snapshot. Rebase them.
    const rebased = new Set<string>();
    const rebase = (id: string): AnimationReceipt | undefined => {
      const r = this.receipt(id); if (!r || rebased.has(id)) return r;
      rebased.add(id);
      if (id === taskId || settled.has(id) || r.endsAt <= nowMs) return r;
      const t = byId.get(id); if (!t) return r;
      const parents = t.dependencies.map(rebase).filter(Boolean) as AnimationReceipt[];
      if (r.startsAt < nowMs) return r;
      const startsAt = Math.max(nowMs, ...parents.map(p => p.endsAt));
      const next = Object.freeze({ ...r, startsAt, endsAt: startsAt + durationForTask(id) });
      this.receipts.set(this.key(id), next); return next;
    };
    tasks.forEach(t => rebase(t.id));
  }

  allReceipts(): Iterable<AnimationReceipt> {
    return this.receipts.values();
  }

  receipt(taskId: string): AnimationReceipt | undefined {
    return this.receipts.get(this.key(taskId));
  }

  /** Queued = 0; playing = 0..1; already settled or unseen = null. */
  phase(taskId: string, nowMs: number): number | null {
    const receipt = this.receipt(taskId);
    if (!receipt || receipt.endsAt <= nowMs) return null;
    return Math.max(0, (nowMs - receipt.startsAt) / (receipt.endsAt - receipt.startsAt));
  }

  /** Physical pose stays at the endpoint while waiting for an authoritative ACK.
   * This is presentation only: isDone and the official score still require DONE. */
  posePhase(taskId: string, nowMs: number): number | null {
    const receipt = this.receipt(taskId);
    if (!receipt || nowMs < receipt.startsAt) return null;
    return receipt.endsAt <= receipt.startsAt ? 1 : Math.min(1, (nowMs - receipt.startsAt) / (receipt.endsAt - receipt.startsAt));
  }

  isDone(taskId: string, nowMs: number): boolean {
    const receipt = this.receipt(taskId);
    return this.doneIds.has(taskId) && receipt !== undefined && receipt.endsAt <= nowMs;
  }

  activeTaskIds(nowMs: number): string[] {
    return [...this.receipts.values()]
      .filter((receipt) => receipt.startsAt <= nowMs && nowMs < receipt.endsAt)
      .map((receipt) => receipt.taskId);
  }
}

/** A disconnected/stalled viewer catches up instead of queuing a whole old stop. */
export function shouldSettleMissedAnimation(tasks: Task[], seen: Set<string>, gapMs: number): boolean {
  return gapMs > 8000 && tasks.filter(task => task.status === 'DONE' && !seen.has(task.id)).length >= 6;
}

/** V11 compatibility exports; these do not participate in live animation scheduling. */
export function taskPresentationCue(task: Task, timeline: TaskAnimationTimeline, now: number) {
  const receipt=timeline.receipt(task.id);
  const playing=!!receipt&&receipt.startsAt<=now&&now<receipt.endsAt;
  const state=playing?'WORK':timeline.isDone(task.id,now)?'DONE':task.enabledAt===null||now<task.enabledAt?'LOCKED':'WAIT';
  return {taskId:task.id,state,enabledAt:task.enabledAt,baselineMeanMs:task.baselineMeanMs,dueAt:task.dueAt,eventAt:task.completedAt,visualStartsAt:receipt?.startsAt??null,visualEndsAt:receipt?.endsAt??null,reason:task.reason??null};
}

/** A disconnected/stalled viewer catches up instead of queuing a whole old stop. */
