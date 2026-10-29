import {describe,it,expect} from 'vitest';
import {SmoothValue} from '../src/scene/easing';
import {PlayerCameraRig} from '../src/scene/playerCamera';
import {AxleMotion} from '../src/scene/axleMotion';
import {createSoloRound} from '../src/engine';
const root={x:0,y:0,z:0},head={x:0,y:1.3,z:0},forward={x:0,y:0,z:-1};
describe('Continuous motion',()=>{
 it('shows both lift and lower when their completions arrive together',()=>{
  const r=createSoloRound([],0,'batch'),lift=r.tasks.find(t=>t.id==='FRONT_LIFT')!,lower=r.tasks.find(t=>t.id==='FRONT_LOWER')!;
  Object.assign(lift,{enabledAt:0,completedAt:10,status:'DONE'});Object.assign(lower,{enabledAt:10,completedAt:20,status:'DONE'});
  const motion=new AxleMotion();let peak=0,last=0;const operations=new Set();
  for(let t=0;t<=1600;t+=16){const p=motion.sample('batch',t,lift,lower);peak=Math.max(peak,p.height);operations.add(p.operation);expect(Math.abs(p.height-last)).toBeLessThan(.06);last=p.height;}
  expect(peak).toBeGreaterThan(.269);expect(last).toBe(0);expect(operations.has('LIFT')).toBe(true);expect(operations.has('LOWER')).toBe(true);
  const rejoined=new AxleMotion();for(let t=5000;t<5600;t+=16)expect(rejoined.sample('batch',t,lift,lower).height).toBe(0);
  motion.reset();for(let t=30;t<600;t+=16)expect(motion.sample('batch',t,lift,lower).height).toBe(0);
 });
 it('keeps velocity through retargets and matches across frame rates',()=>{
  const endings=[];
  for(const hz of [30,60,144]){const v=new SmoothValue();let prior=0,oldStep=0,maxKink=0;for(let i=1;i<=hz;i++){const p=v.step(1,1000/hz,.17),step=p-prior;maxKink=Math.max(maxKink,Math.abs(step-oldStep));expect(p).toBeGreaterThanOrEqual(prior);expect(p).toBeLessThanOrEqual(1);prior=p;oldStep=step;}endings.push(v.value);expect(maxKink).toBeLessThan(.08);}
  expect(Math.max(...endings)-Math.min(...endings)).toBeLessThan(.001);
 });
 it('eases unexpected instant work rather than snapping or dropping it',()=>{
  const v=new SmoothValue();const first=v.step(1,1000/60,.065);expect(first).toBeGreaterThan(0);expect(first).toBeLessThan(.15);for(let i=0;i<30;i++)v.step(1,1000/60,.065);expect(v.value).toBe(1);
 });
});
describe('Player free look',()=>{
 it.each(['first-person','third-person'] as const)('%s retains drag orientation while the actor turns',mode=>{
  const rig=new PlayerCameraRig();const initial=rig.sample(mode,root,head,forward,0,'player');rig.turn(1.2,.15);
  let pose=initial;for(let t=16;t<=640;t+=16)pose=rig.sample(mode,root,head,{x:1,y:0,z:0},t,'player');
  expect(pose.yaw).toBeCloseTo(initial.yaw+1.2,3);expect(pose.pitch).toBeCloseTo(initial.pitch+.15,3);
 });
 it('tracks movement smoothly, without carrying idle helmet bob into the third-person camera',()=>{
  const rig=new PlayerCameraRig();const a=rig.sample('third-person',root,head,forward,0,'player');
  const b=rig.sample('third-person',root,{...head,y:1.5},forward,16,'player');expect(b.position).toEqual(a.position);
  const c=rig.sample('third-person',{...root,x:1},head,forward,32,'player');expect(c.position.x).toBeGreaterThan(0);expect(c.position.x).toBeLessThan(.1);
 });
 it('orbits all the way around, bounds pitch and zoom, and resets on role change',()=>{
  const rig=new PlayerCameraRig();rig.sample('third-person',root,head,forward,0,'one');rig.turn(7,10);rig.zoom(100);
  let p;for(let t=16;t<=640;t+=16)p=rig.sample('third-person',root,head,forward,t,'one');expect(p!.yaw).toBeCloseTo(7,3);expect(p!.pitch).toBeLessThanOrEqual(1.48);expect(p!.distance).toBeLessThanOrEqual(7.5);
  expect(rig.sample('first-person',root,head,forward,650,'two').yaw).toBe(0);
 });
});
