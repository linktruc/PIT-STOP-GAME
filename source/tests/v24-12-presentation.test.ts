import {describe,it,expect} from 'vitest';
import {PreviewSchedule} from '../src/scene/previewSchedule';
import {PlayerCameraRig} from '../src/scene/playerCamera';
import {crewHighlight} from '../src/scene/highlights';
import type {Room} from '../src/types';
const root={x:0,y:0,z:0},head={x:0,y:1.3,z:0},forward={x:0,y:0,z:-1};
describe('V24.12 presentation',()=>{
 it.each(['first-person','third-person'] as const)('%s keeps keyboard turning with consistent non-inverted mouse drag axes',mode=>{
  const rig=new PlayerCameraRig(),a=rig.sample(mode,root,head,forward,0,'you');rig.drag(100,30);
  let b=a;for(let t=16;t<=1000;t+=16)b=rig.sample(mode,root,head,forward,t,'you');
  expect(b.yaw-a.yaw).toBeCloseTo(-.5,3);expect(b.pitch-a.pitch).toBeCloseTo(-.15,3);
  rig.turn(.2,.1);let c=b;for(let t=1000;t<=1600;t+=16)c=rig.sample(mode,root,head,forward,t,'you');expect(c.yaw).toBeGreaterThan(b.yaw);
 });
 it.each([60,144])('keeps fair preview cadence at %i Hz without refresh-rate aliasing',hz=>{
  for(const n of [1,2,4,10]){
   const schedule=new PreviewSchedule<number>(),keys=Array.from({length:n},(_,i)=>i),counts=keys.map(()=>0);
   for(let t=0;t<5000-.01;t+=1000/hz)for(const key of schedule.pick(keys,t))counts[key]++;
   const target=(n<=2?30:n<=4?20:12)*5;
   expect(Math.max(...counts)-Math.min(...counts)).toBeLessThanOrEqual(1);
   expect(Math.min(...counts)).toBeGreaterThanOrEqual(Math.min(target,Math.floor(hz*5*2/n))-2);
   expect(Math.max(...counts)).toBeLessThanOrEqual(target+1);
  }
 });
 it('marks only humans while WAITING and restores accurate per-player lockout expiry',()=>{
  const room={status:'WAITING',players:[{id:'a',role:'FL_GUNNER'},{id:'b',role:'REAR_JACK'}],round:{penalties:{a:{at:1000,until:3000}}}} as unknown as Room;
  expect(crewHighlight(room,'FL_GUNNER',1500).humanWaiting).toBe(true);
  expect(crewHighlight(room,'FR_GUNNER',1500).humanWaiting).toBe(false);
  expect(crewHighlight(room,undefined,1500).humanWaiting).toBe(false);
  for(const status of ['COUNTDOWN','RUNNING'] as const){room.status=status;expect(crewHighlight(room,'FL_GUNNER',1500)).toMatchObject({humanWaiting:false,locked:true,remaining:1500});expect(crewHighlight(room,'REAR_JACK',1500).locked).toBe(false);}
  expect(crewHighlight(room,'FL_GUNNER',999).locked).toBe(false);
  expect(crewHighlight(room,'FL_GUNNER',3000).locked).toBe(false);
  room.status='COMPLETED';expect(crewHighlight(room,'FL_GUNNER',1500).locked).toBe(false);
 });
});
