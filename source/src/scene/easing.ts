/** Exact critically damped response. Keeps velocity across retargets and has
 * the same response at 30, 60 and 144 Hz; never rewinds a monotonic phase. */
export class SmoothValue {
 value:number;private velocity=0;
 constructor(value=0){this.value=value;}
 reset(value:number){this.value=value;this.velocity=0;return value;}
 step(target:number,dt:number,response=.055){
  if(dt<=0)return this.value;
  const omega=2/response,t=dt/1000,x=this.value-target,c=this.velocity+omega*x,e=Math.exp(-omega*t);
  const next=target+(x+c*t)*e;this.velocity=(this.velocity-omega*c*t)*e;
  if((target-this.value)*(target-next)<0||Math.abs(target-next)<.0005&&Math.abs(this.velocity)<.02)return this.reset(target);
  this.value=next;return next;
 }
}
