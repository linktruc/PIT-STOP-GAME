const smooth=(p:number)=>{const t=Math.max(0,Math.min(1,p));return t*t*(3-2*t);};
/** Commit to departure once the actual crew is clear. Never advance and then
 * snap the car back to the box on a later collision check in the same frame. */
export class DepartureMotion {
 private round:string|null=null;private at:number|null=null;private start:number|null=null;
 reset(){this.at=null;this.start=null;}
 sample(round:string|null,now:number,requested:number,clear:boolean):number{
  const reset=this.at===null||round!==this.round||now<this.at||now-this.at>500;
  this.round=round;this.at=now;
  if(reset){
   this.start=null;
   if(clear&&requested>0){let low=0,high=1;for(let i=0;i<24;i++){const p=(low+high)/2;if(smooth(p)<requested)low=p;else high=p;}this.start=now-(low+high)/2*1000;}
  }
  if(this.start===null&&requested>0&&clear)this.start=now;
  return this.start===null?0:smooth((now-this.start)/1000);
 }
}
export function releaseGesture(completedAt:number|null|undefined,now:number){return completedAt===null||completedAt===undefined?0:smooth((now-completedAt)/300);}
