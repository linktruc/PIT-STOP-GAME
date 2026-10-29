import type {Task} from '../types';
import {gunnerWorkHandoff,workPhase} from './work';
import {SmoothValue} from './easing';
const smooth=(v:number)=>{const p=Math.max(0,Math.min(1,v));return p*p*(3-2*p);};
type Shot={id:string;operation:'loosen'|'tighten'};
type State={at:number;stance:number;stow:number;stanceEase:SmoothValue;stowEase:SmoothValue;rotor:number;seen:Set<string>;finished:Set<string>;strokes:Map<string,number>;queue:Shot[];fireUntil:number|null;exitAt:number|null};
/** Reserved contact/standby corridor and a visible socket stroke. Short accepted
 * actions retain one stroke without changing any authoritative task timestamp. */
export class GunnerMotion {
 private round:string|null=null;private states=new Map<string,State>();
 reset(){this.round=null;this.states.clear();}
 sample(round:string|null,key:string,now:number,lift:Task|undefined,loose:Task|undefined,on:Task|undefined,tight:Task|undefined,arrived=true,fitted=true,extracted=true,oldClear=true){
  if(this.round!==round){this.round=round;this.states.clear();}
  const visual=(task:Task|undefined)=>task?.completedAt!==null&&task?.completedAt!==undefined&&(task.ownerId!==null||task.dueAt===null||task.completedAt-(task.enabledAt??task.completedAt)<160)?{...task,completedAt:task.completedAt+140}:task;
  let desired=gunnerWorkHandoff(visual(loose),visual(tight),now);
  const onPhase=workPhase(on,now)??0;
  if((tight?.enabledAt===null||tight?.enabledAt===undefined||now<tight.enabledAt)&&onPhase>.15)desired=Math.min(desired,Math.max(.25,1-smooth((onPhase-.15)/.7)));
  let state=this.states.get(key);
  const settle=!state||now<state.at||now-state.at>500;
  if(settle){state={at:now,stance:desired,stow:desired,stanceEase:new SmoothValue(desired),stowEase:new SmoothValue(desired),rotor:0,seen:new Set(),finished:new Set(),strokes:new Map(),queue:[],fireUntil:null,exitAt:null};this.states.set(key,state);}
  const current=state!,dt=Math.max(0,now-current.at);current.at=now;
  for(const [task,operation]of [[loose,'loosen'],[tight,'tighten']]as const){
   if(!task||task.completedAt===null||now<task.completedAt||current.seen.has(task.id))continue;
   const short=task.ownerId!==null||task.dueAt===null||task.completedAt-(task.enabledAt??task.completedAt)<160;
   current.seen.add(task.id);
   if((!short&&(current.strokes.get(task.id)??0)>=60)||(settle&&now-task.completedAt>500))current.finished.add(task.id);
   else current.queue.push({id:task.id,operation});
  }
  if(current.fireUntil!==null&&now>=current.fireUntil){const shot=current.queue.shift();if(shot)current.finished.add(shot.id);current.fireUntil=null;}
  const pending=current.queue[0];
  if(onPhase>0&&!oldClear)desired=1;
  const tightReady=tight?.enabledAt!==null&&tight?.enabledAt!==undefined&&now>=tight.enabledAt;
  if(tightReady&&(tight!.completedAt===null||now<tight!.completedAt))desired=!oldClear?1:fitted?0:.25;
  if(pending)desired=pending.operation==='tighten' ? (!oldClear?1:!fitted?(extracted?.25:1):0) : 0;
  current.stance=current.stanceEase.step(desired,dt,.17);
  const tightening=pending?pending.operation==='tighten':tight?.enabledAt!==null&&tight?.enabledAt!==undefined&&now>=tight.enabledAt;
  const task=tightening?tight:loose;
  const liftEnd=lift?.completedAt??lift?.dueAt;
  const approachAt=tightening?(on?.enabledAt??tight?.enabledAt??Infinity):liftEnd===null||liftEnd===undefined?Infinity:lift?.dueAt!==null&&lift?.dueAt!==undefined?(lift.enabledAt??liftEnd)+(liftEnd-(lift.enabledAt??liftEnd))*.5:liftEnd;
  const approach=smooth((now-approachAt)/120);
  const wantedStow=onPhase>.15&&!fitted?1:current.stance;
  current.stow=current.stowEase.step(wantedStow,dt,.075);
  if(pending&&current.fireUntil===null&&current.stance<.005&&current.stow<.005&&approach>=.999&&arrived&&(!tightening||fitted))current.fireUntil=now+140;
  let firing=current.fireUntil!==null&&now<current.fireUntil;
  if(!pending&&task?.enabledAt!==null&&task?.enabledAt!==undefined&&now>=task.enabledAt&&(task.completedAt===null||now<task.completedAt)){
   const p=workPhase(task,now)??0;firing=task.ownerId!==null?approach>=.999:p>.18&&p<(tightening?1:.65);
  }
  firing=firing&&arrived&&(!tightening||fitted)&&current.stow<.05&&current.stance<.05;
  if(firing&&task)current.strokes.set(task.id,(current.strokes.get(task.id)??0)+dt);
  if(firing)current.rotor+=(tightening?1:-1)*dt*.028;
  const physicallyFinished=tight?.completedAt!==null&&tight?.completedAt!==undefined&&current.finished.has(tight.id)&&!pending;
  if(physicallyFinished&&current.exitAt===null)current.exitAt=now;
  const retreatGuard=current.exitAt===null?0:smooth((now-current.exitAt)/300);
  const loosenDone=loose?.completedAt!==null&&loose?.completedAt!==undefined&&now>=loose.completedAt;
  return {retreatGuard,stance:current.stance,stow:current.stow,approach,firing,pending:!!pending,loosenClear:!!loosenDone&&current.finished.has(loose!.id)&&(extracted||current.stance>=.45),operation:tightening?'tighten':'loosen',rotation:current.rotor};
 }
}
