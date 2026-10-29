/** Monotonic visual clock. Server corrections slew rather than rewind a pose.
 * Authoritative event timestamps, scoring and replay cursor are never modified. */
export class SceneClock {
  private previousFrame: number | null = null;
  private value = 0;
  read(frame: number, target: number): number {
    if (this.previousFrame === null) {
      this.previousFrame = frame; this.value = target; return target;
    }
    const elapsed = Math.max(0, frame - this.previousFrame);
    this.previousFrame = frame;
    this.value += elapsed;
    const correction = target - this.value;
    this.value += Math.max(-elapsed * .15, Math.min(elapsed * .15, correction));
    return this.value;
  }
}

/** Accumulated deadlines avoid refresh-rate aliasing at 60/90/120/144Hz. */
export class FramePacer {
  private next: number | null = null;
  accept(now: number, fps: number): boolean {
    const interval = 1000 / fps;
    if (this.next === null) { this.next = now + interval; return true; }
    if (now + .5 < this.next) return false;
    this.next += (Math.floor(Math.max(0, now - this.next + .5) / interval) + 1) * interval;
    return true;
  }
}
export type GroundPoint = { x: number; z: number };
export type MotionTarget = GroundPoint & { fixed: boolean; exact?:boolean };
/** Limit movement of rendered roots, never the authoritative tasks or scores.
 * Initial views and explicit seeks settle immediately; normal playback follows
 * continuously, steering around occupied body space instead of teleporting. */
export class CrewMotion {
  private positions: GroundPoint[] = [];
  private round: string | null = null;
  private time: number | null = null;
  reset(): void { this.time=null;this.positions=[]; }
  sample(round: string | null, now: number, targets: MotionTarget[]): GroundPoint[] {
    const gap = this.time === null ? Infinity : now - this.time;
    const reset = round !== this.round || gap < 0 || this.time === null || this.positions.length !== targets.length;
    this.round = round; this.time = now;
    if (reset) { this.positions = targets.map(t => ({x:t.x,z:t.z})); return this.positions; }
    if (gap <= 0) return this.positions;
    const dt = Math.min(gap,50) / 1000, alpha = 1 - Math.exp(-dt / .065);
    // Contact stations move first, so yielding crew see their current position.
    const order = targets.map((_,i)=>i).sort((a,b)=>Number(targets[b].fixed)-Number(targets[a].fixed));
    for (const i of order) {
      const current=this.positions[i], target=targets[i];
      if(target.exact){this.positions[i]={x:target.x,z:target.z};continue;}
      const dx=target.x-current.x,dz=target.z-current.z,d=Math.hypot(dx,dz);
      if(d<1e-9)continue;
      const step=Math.min(d*alpha,(target.fixed?8:6)*dt);
      const safe=(p:GroundPoint)=>targets.every((_,j)=>{
        if(j===i)return true;
        const other=this.positions[j],before=Math.hypot(current.x-other.x,current.z-other.z);
        return Math.hypot(p.x-other.x,p.z-other.z)>=Math.min(1.15,before)-1e-8;
      });
      let best:GroundPoint|undefined,score=Infinity;
      for(const angle of target.fixed?[0]:[0,.4,-.4,.8,-.8,1.2,-1.2,Math.PI/2,-Math.PI/2]){
        const c=Math.cos(angle),s=Math.sin(angle);
        const p={x:current.x+(dx*c-dz*s)/d*step,z:current.z+(dx*s+dz*c)/d*step};
        if(!target.fixed&&!safe(p))continue;
        const error=Math.hypot(p.x-target.x,p.z-target.z);
        if(error<score){score=error;best=p;}
      }
      if(best)this.positions[i]=best;
    }
    return this.positions;
  }
}
