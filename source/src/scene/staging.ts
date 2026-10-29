import type {Task} from '../types';
const smooth=(n:number)=>{const p=Math.max(0,Math.min(1,n));return p*p*(3-2*p);};
const end=(t:Task)=>t.completedAt??(t.ownerId===null?t.dueAt:null)??Infinity;
/** Wait for tyre handlers to leave the crossing, then take a clear central lane. */
export function stabilizerExitPhase(tasks:Task[],now:number){
 const off=tasks.filter(t=>t.cohort==='WHEEL_OFF'),on=tasks.filter(t=>t.cohort==='WHEEL_ON'),lower=tasks.filter(t=>t.cohort==='LOWER');
 if(off.length<4||on.length<4||lower.length<2)return 0;
 return smooth((now-Math.max(...off.map(t=>end(t)+1100),...on.map(t=>end(t)+700),...lower.map(end)))/700);
}
export function stabilizerStation(side:number,z:number,entryClear:number,exit:number){
 const sideStep=smooth(exit/.35),outward=smooth((exit-.35)/.65);
 return {x:side*(1.37+(2.7-1.37)*entryClear+(3.8-1.37)*outward),z:z+(-.70-z)*sideStep};
}
export function rearJackApproach(clear:number){return {x:clear===0?0:-2.2*clear,z:1.2*clear};}
