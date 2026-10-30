import {describe,it,expect} from 'vitest';
import {PlayerCameraRig} from '../src/scene/playerCamera';
const root={x:0,y:0,z:0},head={x:0,y:1.3,z:0},forward={x:0,y:0,z:-1};
function settled(mode:'first-person'|'third-person',pointer:'mouse'|'touch',dx:number,dy:number,height=600){
 const rig=new PlayerCameraRig();
 const start=rig.sample(mode,root,head,forward,0,'player');
 rig.drag(dx,dy,pointer,height);
 let end=start;
 for(let ms=16;ms<=640;ms+=16)end=rig.sample(mode,root,head,forward,ms,'player');
 return {yaw:end.yaw-start.yaw,pitch:end.pitch-start.pitch};
}
describe('V24.14 camera input',()=>{
 it.each(['first-person','third-person'] as const)('%s: mouse and touch drag identically',mode=>{
  for(const [dx,dy] of [[85,0],[-85,0],[0,40],[0,-40],[35,-20]]){
   expect(settled(mode,'touch',dx,dy)).toEqual(settled(mode,'mouse',dx,dy));
  }
 });
 it.each(['first-person','third-person'] as const)('%s: drag left turns right, upward swipe tilts up',mode=>{
  const right=settled(mode,'mouse',80,0);const left=settled(mode,'touch',-80,0);
  const up=settled(mode,'touch',0,-30);const down=settled(mode,'mouse',0,30);
  expect(right.yaw).toBeLessThan(0);expect(left.yaw).toBeGreaterThan(0);
  expect(up.pitch).toBeGreaterThan(0);expect(down.pitch).toBeLessThan(0);
 });
 it('normalizes camera travel to viewport height across PC and phone',()=>{
  const phone=settled('first-person','touch',40,-20,400);
  const desktop=settled('first-person','mouse',80,-40,800);
  expect(phone.yaw).toBeCloseTo(desktop.yaw,4);
  expect(phone.pitch).toBeCloseTo(desktop.pitch,4);
 });
 it('bounds a stale single-frame drag after pointer capture resumes',()=>{
  const normal=settled('first-person','mouse',180,0);
  const spike=settled('first-person','touch',2000,0);
  expect(spike.yaw).toBeCloseTo(normal.yaw,3);
 });
});
