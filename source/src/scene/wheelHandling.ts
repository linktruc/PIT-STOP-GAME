import type {Task} from '../types';
import {workPhase,fittingPhase} from './work';
const clamp=(p:number)=>Math.max(0,Math.min(1,p));
const smooth=(p:number)=>{const t=clamp(p);return t*t*(3-2*t);};
const toward=(from:number,to:number,step:number)=>from+Math.max(-step,Math.min(step,to-from));
export type WheelHandlingFrame={offPrep:number;onPrep:number;extract:number;fit:number;carry:number;lower:number;release:number;onRelease:number;onRetreat:number};
type State={at:number;offPrep:number;onPrep:number;extract:number;fit:number;carryAt:number|null;fitAt:number|null};
/** Contact preparation, pickup and fitting share one clock. Only a touching
 * worker may pick up a wheel; fitting waits for the outgoing wheel to clear.
 * An unpredictable instant input receives a short bounded handoff, not a jump. */
export class WheelHandling {
 private round:string|null=null;
 private states=new Map<string,State>();
 reset(){this.states.clear();this.round=null;}
 sample(round:string|null,key:string,now:number,loosen:Task|undefined,off:Task|undefined,on:Task|undefined):WheelHandlingFrame{
  if(round!==this.round){this.states.clear();this.round=round;}
  const looseP=workPhase(loosen,now)??0,offP=workPhase(off,now)??0;
  const offPrep=smooth((looseP-.5)/.45),onPrep=smooth((offP-.2)/.45);
  const end=off?.completedAt??off?.dueAt;
  const extract=off?.enabledAt!==null&&off?.enabledAt!==undefined&&now>=off.enabledAt&&end!==null&&end!==undefined
   ? off.ownerId===null?smooth((now-Math.max(off.enabledAt,end-Math.min(120,(end-off.enabledAt)*.45)))/Math.max(1,Math.min(120,(end-off.enabledAt)*.45))):Number(now>=end):0;
  const fit=smooth((fittingPhase(on,now)-.45)/.55);
  let state=this.states.get(key);
  const settle=!state||now<state.at||now-state.at>500;
  if(settle){
   state={at:now,offPrep,onPrep,extract:offPrep>=.999?extract:0,fit:extract>=1&&onPrep>=.999?fit:0,carryAt:extract>=1?end??now:null,fitAt:fit>=1?on?.completedAt??on?.dueAt??now:null};
   this.states.set(key,state);
  }else{
   const dt=Math.max(0,now-state!.at);state!.at=now;
   const hadOffContact=state!.offPrep>=.999,hadOnContact=state!.onPrep>=.999,hadExtracted=state!.extract>=1;
   state!.offPrep=toward(state!.offPrep,offPrep,dt/140);
   state!.onPrep=toward(state!.onPrep,onPrep,dt/220);
   if(hadOffContact)state!.extract=toward(state!.extract,Math.max(state!.extract,extract),dt/100);
   if(state!.extract>=1&&state!.carryAt===null)state!.carryAt=now;
   if(hadExtracted&&hadOnContact)state!.fit=toward(state!.fit,Math.max(state!.fit,fit),dt/80);
   if(state!.fit>=1&&state!.fitAt===null)state!.fitAt=now;
  }
  const current=state!,carried=current.carryAt===null?-Infinity:now-current.carryAt;
  const fitted=current.fitAt===null?-Infinity:now-current.fitAt;
  return {offPrep:current.offPrep,onPrep:current.onPrep,extract:current.extract,fit:current.fit,carry:smooth(carried/900),lower:smooth((carried-900)/280),release:smooth((carried-1180)/180),onRelease:smooth(fitted/180),onRetreat:smooth(fitted/500)};
 }
}
export function offWheelStation(corner:{x:number;z:number},frame:WheelHandlingFrame,height=.27){
 const side=Math.sign(corner.x),pickupX=.76+.06*clamp(height/.27),pickupZ=.40+.06*clamp(height/.27);
 const prepX=.95+(pickupX-.95)*frame.offPrep,prepZ=1.05+(pickupZ-1.05)*frame.offPrep;
 const heldX=prepX+(1.2-prepX)*frame.extract,heldZ=prepZ+(.95-prepZ)*frame.extract;
 return {x:corner.x+side*(heldX+(5.04-heldX)*frame.carry),z:corner.z+heldZ+(1.1-heldZ)*frame.carry,crouch:frame.offPrep*(1-frame.extract)+frame.lower*(1-frame.release)};
}
export function onWheelStation(corner:{x:number;z:number},frame:WheelHandlingFrame,height=.27){
 const side=Math.sign(corner.x),pickupX=.76+.06*clamp(height/.27),pickupZ=.40+.06*clamp(height/.27);
 const x=2.65+(1.25-2.65)*frame.onPrep+(pickupX-1.25)*frame.fit;
 const z=-.9+(.9-.50)*frame.onPrep+(.50-pickupZ)*frame.fit;
 return {x:corner.x+side*(x+(1.8-x)*frame.onRetreat),z:corner.z+z+(-.9-z)*frame.onRetreat,crouch:frame.onPrep*(1-frame.onRelease)};
}
/** Grips are on the OUTER axle face, separated across the tyre diameter.
 * Reaching to opposite axle faces forced the old worker through the wheel. */
export function wheelGripAnchors(side:number):[number,number,number][]{return [-1,1].map(arm=>[side*.29,.14,-side*arm*.25]);}
