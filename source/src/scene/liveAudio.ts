import type { AnimationReceipt } from './animation';
/** Consume cues only after a scene frame has rendered. No wall-clock timers:
 * delayed acknowledgements cannot make sound run ahead of queued movement. */
export class LiveSceneAudio {
  private round: string | null = null;
  private seen = new Set<string>();
  private previous: number | null = null;
  poll(roundId: string | null, now: number, receipts: Iterable<AnimationReceipt>): string[] {
    const settled=roundId!==this.round||this.previous===null||now<this.previous;
    this.round=roundId;this.previous=now;
    if(settled)this.seen.clear();
    if(!roundId){this.seen.clear();return [];}
    const audible:AnimationReceipt[]=[];
    for(const receipt of receipts){
      if(receipt.startsAt>now||this.seen.has(receipt.taskId))continue;
      this.seen.add(receipt.taskId);
      // First visible snapshot settles quietly. Expired/old work is never
      // replayed as a burst after a hidden tab, reconnect or quality rebuild.
      if(!settled&&receipt.endsAt>now&&now-receipt.startsAt<=250)audible.push(receipt);
    }
    return audible.sort((a,b)=>a.startsAt-b.startsAt||a.taskId.localeCompare(b.taskId)).map(r=>r.taskId);
  }
}
