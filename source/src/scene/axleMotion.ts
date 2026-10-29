import type {Task} from '../types';
import {workDone,workPhase} from './work';
import {SmoothValue} from './easing';
/** A batched lift + lower still passes through the raised pose once. This is
 * purely visual; it never holds the action button or changes a task time. */
export class AxleMotion {
 private round:string|null=null;private at:number|null=null;private height=new SmoothValue();private raisedAt:number|null=null;private seeking=false;
 reset(){this.at=null;this.raisedAt=null;this.seeking=true;}
 sample(round:string|null,now:number,lift:Task|undefined,lower:Task|undefined){
  const settled=this.at===null||round!==this.round||now<this.at||now-this.at>500;
  const dt=settled?0:now-this.at!;this.round=round;this.at=now;
  const up=workPhase(lift,now)??0,down=workPhase(lower,now);
  const final=workDone(lower,now)?0:down===null?up:1-down;
  if(settled){
   const old=lower?.completedAt!==null&&lower?.completedAt!==undefined&&now-lower.completedAt>500;
   const recent=lift?.completedAt!==null&&lift?.completedAt!==undefined&&now>=lift.completedAt&&now-lift.completedAt<=500;
   this.height.reset(old||this.seeking?final:recent?0:up);
   this.raisedAt=old||this.seeking&&down!==null?now-60:this.height.value>=.999?now:null;this.seeking=false;
  }
  if(this.height.value>=.999&&this.raisedAt===null)this.raisedAt=now;
  const showLift=up>0&&down!==null&&(this.raisedAt===null||now-this.raisedAt<60);
  const target=showLift?1:final;
  const height=this.height.step(target,dt,.065);
  return {height:.27*height,phase:height,operation:Math.abs(target-height)>.0005?(target>height?'LIFT':'LOWER'):null};
 }
}
