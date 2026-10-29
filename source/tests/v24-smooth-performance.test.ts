import { describe, expect, it } from 'vitest';
import { CREW, CORNER_POSITIONS, wheelCarrierPosition, type Crew } from '../src/scene/crew';

type Position = { spec: Crew; x:number; z:number };
const mobile = (a:Position) => ['gun','off','on','release'].includes(a.spec.kind);
function solve(rows:Position[],optimized:boolean) {
  const p=rows.map(a=>({...a}));
  for(let pass=0;pass<32;pass++){
    let moved=false;
    for(let i=0;i<p.length;i++)for(let j=i+1;j<p.length;j++){
      const a=p[i],b=p[j],dx=b.x-a.x,dz=b.z-a.z;
      const canA=mobile(a),canB=mobile(b);
      if(optimized&&(!canA&&!canB || Math.abs(dx)>=1.35 || Math.abs(dz)>=1.35))continue;
      const d=Math.hypot(dx,dz);
      if(d>=1.35)continue;
      const mover=canB?b:canA?a:null;
      if(!mover)continue;
      mover.x+=Math.sign(mover.spec.x||1)*(1.35-d+.02);moved=true;
    }
    if(!moved)break;
  }
  return p;
}
function seeded(seed:number){let s=seed>>>0;return ()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}
describe('V24.1 render fixes',()=>{
  it('does not skip every other 60Hz display frame in the high-quality limiter',()=>{
    const times=Array.from({length:121},(_,i)=>i*1000/60);
    const count=(threshold:number)=>{let last=0,drawn=0;for(let i=1;i<times.length;i++){if(times[i]-last>=threshold){last=times[i];drawn++;}}return drawn;};
    expect(count(1000/50)).toBeLessThan(65);
    expect(count(15)).toBe(120);
  });
  it('broadphase preserves V24 collision resolution for seeded crew layouts',()=>{
    for(let seed=0;seed<400;seed++){
      const rnd=seeded(seed+250);
      const actors=CREW.map(spec=>({spec,x:spec.x,z:spec.z}));
      for(const a of actors){
        const spec=a.spec;
        if(spec.kind==='on'||spec.kind==='off'){
          const corner=CORNER_POSITIONS.find(([key])=>spec.role?.startsWith(key))!;
          const location=wheelCarrierPosition(spec.kind,spec,{x:corner[1],z:corner[2]},rnd());
          a.x=location.x;a.z=location.z;
        }else if(spec.kind==='gun')a.z+=rnd()*1.35;
        else if(spec.kind==='jack')a.x+=(spec.role==='FRONT_JACK'?1:-1)*rnd()*3.5;
      }
      const original=solve(actors,false),optimized=solve(actors,true);
      expect(optimized.map(a=>[a.x,a.z])).toEqual(original.map(a=>[a.x,a.z]));
    }
  });
});
