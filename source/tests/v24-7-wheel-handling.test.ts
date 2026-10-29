import {describe,it,expect} from 'vitest';
import {WheelHandling,offWheelStation,onWheelStation,wheelGripAnchors} from '../src/scene/wheelHandling';
import {DepartureMotion,releaseGesture} from '../src/scene/departure';
import {departurePose} from '../src/scene/rig';
import {createSoloRound,reconcile,submitAction} from '../src/engine';
describe('Contact-driven wheel transfer',()=>{
 it('prepares contact before lifting a wheel, and only fits after extraction',()=>{
  const r=createSoloRound([{id:'you',role:'FL_GUNNER',nickname:'You',ready:true,joinedAt:0}],1000,'r');
  const hand=new WheelHandling();let old=hand.sample('r','FL',900,undefined,undefined,undefined);
  reconcile(r,1700);submitAction(r,'you','FL_GUN_LOOSEN',1736,'g');reconcile(r,3000);
  const get=(suffix:string)=>r.tasks.find(t=>t.id==='FL_'+suffix)!;
  for(let now=1000;now<=5000;now+=10){
   const f=hand.sample('r','FL',now,get('GUN_LOOSEN'),get('WHEEL_OFF'),get('WHEEL_ON'));
   if(f.extract>0)expect(f.offPrep).toBeGreaterThanOrEqual(.999);
   if(f.extract>old.extract)expect(old.offPrep).toBeGreaterThanOrEqual(.999);
   if(f.fit>old.fit){expect(old.extract).toBe(1);expect(old.onPrep).toBeGreaterThanOrEqual(.999);}
   if(f.fit>0){expect(f.extract).toBeGreaterThanOrEqual(.999);expect(f.onPrep).toBeGreaterThanOrEqual(.999);}
   expect(f.extract-old.extract).toBeLessThanOrEqual(.125001);expect(f.fit-old.fit).toBeLessThanOrEqual(.125001);
   for(const pose of [offWheelStation({x:-1.12,z:-1.58},f),onWheelStation({x:-1.12,z:-1.58},f)])expect(Number.isFinite(pose.x+pose.z)).toBe(true);
   old=f;
  }
  expect(old.fit).toBe(1);expect(old.release).toBe(1);
 });
 it('puts both grips on the exterior axle face instead of forcing one arm through the tyre',()=>{
  for(const side of [-1,1]){
   const grips=wheelGripAnchors(side);expect(grips).toHaveLength(2);
   expect(grips.every(p=>p[0]===side*.29)).toBe(true);expect(Math.abs(grips[0][2]-grips[1][2])).toBe(.5);
  }
 });
});
describe('Stable fast release',()=>{
 it('eases zero-duration task receipts instead of instantly jumping to departure',()=>{
  const cue={roundId:'r',taskId:'LOWER',startsAt:1000,endsAt:1000};
  expect(departurePose([cue,cue],cue,1000)).toEqual({retreat:0,drive:0});
  expect(departurePose([cue,cue],cue,1250).retreat).toBeGreaterThan(0);
  expect(departurePose([cue,cue],cue,1250).drive).toBe(0);
 });
 it('waits for actual clearance, then never snaps back on a transient collision',()=>{
  const motion=new DepartureMotion();expect(motion.sample('r',0,0,false)).toBe(0);
  expect(motion.sample('r',10,1,false)).toBe(0);expect(motion.sample('r',20,1,true)).toBe(0);
  let previous=0;for(let now=30;now<=1020;now+=10){const v=motion.sample('r',now,1,now%20===0);expect(v).toBeGreaterThanOrEqual(previous);expect(v-previous).toBeLessThan(.016);previous=v;}
  expect(previous).toBe(1);
 });
 it('continues from a spectator joining halfway through departure',()=>{
  const motion=new DepartureMotion();expect(motion.sample('r',5000,.5,true)).toBeCloseTo(.5);expect(motion.sample('r',5100,.6,true)).toBeGreaterThan(.5);
 });
 it('keeps the release gesture monotonic after a zero-ms action',()=>{
  expect(releaseGesture(null,1000)).toBe(0);let last=0;
  for(let now=1000;now<=2000;now+=10){const value=releaseGesture(1000,now);expect(value).toBeGreaterThanOrEqual(last);last=value;}
  expect(last).toBe(1);
 });
});
