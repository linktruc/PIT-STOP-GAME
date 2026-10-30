/** Fair, display-synchronized thumbnail cadence; deadlines avoid 60/144 Hz aliasing. */
export class PreviewSchedule<K>{
 private deadlines=new Map<K,number>();private cursor=0;
 pick(keys:K[],now:number,limit=2):K[]{
  for(const key of this.deadlines.keys())if(!keys.includes(key))this.deadlines.delete(key);
  if(!keys.length)return [];
  const interval=1000/(keys.length<=2?30:keys.length<=4?20:12),chosen:K[]=[];
  for(let n=0;n<keys.length&&chosen.length<limit;n++){
   const index=(this.cursor+n)%keys.length,key=keys[index],due=this.deadlines.get(key)??now;
   if(now+.5<due)continue;
   chosen.push(key);this.deadlines.set(key,due+(Math.floor(Math.max(0,now-due+.5)/interval)+1)*interval);
  }
  if(chosen.length)this.cursor=(keys.indexOf(chosen.at(-1)!)+1)%keys.length;
  return chosen;
 }
}
