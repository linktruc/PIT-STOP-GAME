import type { Task } from '../types';
const clamp=(p:number)=>Math.max(0,Math.min(1,p));
/** Work shares the authoritative UI clock. Follow-through never gates readiness. */
export function workDone(task:Task|undefined,now:number):boolean {
 return !!task && task.completedAt!==null && task.completedAt<=now;
}
export function workPhase(task:Task|undefined,now:number):number|null {
 if(!task||task.enabledAt===null||now<task.enabledAt)return null;
 if(workDone(task,now))return 1;
 if(task.ownerId!==null||task.dueAt===null)return 0;
 return clamp((now-task.enabledAt)/Math.max(1,task.dueAt-task.enabledAt));
}
/** Human staff can bring the new wheel to the hub while waiting for confirmation. */
export function fittingPhase(task:Task|undefined,now:number):number {
 const phase=workPhase(task,now);if(phase===null)return 0;
 if(task!.ownerId===null||workDone(task,now))return phase;
 const p=clamp((now-task!.enabledAt!)/180);return .7*p*p*(3-2*p);
}

const smooth=(p:number)=>{const t=clamp(p);return t*t*(3-2*t);};
/** One stance for body and held gun. Preparation precedes a human press;
 * completion only retracts the tool, never starts a late tightening gesture. */
export function gunnerWorkHandoff(loosen:Task|undefined,tighten:Task|undefined,now:number):number {
 const looseAt=(at:number):number=>{
  if(!loosen||loosen.enabledAt===null||at<loosen.enabledAt)return 0;
  const planned=loosen.ownerId===null?loosen.dueAt:null;
  const base=(time:number)=>planned===null?0:smooth(((time-loosen.enabledAt!)/Math.max(1,planned-loosen.enabledAt!)-.65)/.35);
  if(workDone(loosen,at)){
   const start=base(loosen.completedAt!);return start+(1-start)*smooth((at-loosen.completedAt!)/180);
  }
  return base(at);
 };
 if(!tighten||tighten.enabledAt===null||now<tighten.enabledAt)return looseAt(now);
 const initial=looseAt(tighten.enabledAt);
 const base=(at:number)=>{
  if(tighten.ownerId!==null||tighten.dueAt===null)return initial*(1-smooth((at-tighten.enabledAt!)/180));
  const phase=clamp((at-tighten.enabledAt!)/Math.max(1,tighten.dueAt-tighten.enabledAt!));
  return Math.max(initial*(1-smooth(phase/.22)),smooth((phase-.65)/.35));
 };
 if(workDone(tighten,now)){
  const start=base(tighten.completedAt!);return start+(1-start)*smooth((now-tighten.completedAt!)/180);
 }
 return base(now);
}
