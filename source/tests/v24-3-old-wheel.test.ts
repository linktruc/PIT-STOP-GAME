import {describe,it,expect} from 'vitest';
import {oldWheelMotion,oldWheelCarryClearAt,OLD_WHEEL_REMOVE_MS} from '../src/scene/oldWheel';
import {CORNER_POSITIONS,CREW} from '../src/scene/crew';
import {createSoloRound,reconcile,submitAction} from '../src/engine';
import {TaskAnimationTimeline} from '../src/scene/animation';
describe('Old tyre carried and set down',()=>{
 it.each(CORNER_POSITIONS)('%s carries to an adjacent set-down station before releasing', (key,x,z)=>{
  const spec=CREW.find(c=>c.role===`${key}_WHEEL_OFF`)!;
  const receipt={roundId:'r',taskId:`${key}_WHEEL_OFF`,startsAt:1000,endsAt:1900};
  expect(oldWheelMotion(spec,{x,z},receipt,999)).toBeNull();
  let previous=oldWheelMotion(spec,{x,z},receipt,1000)!;
  expect(previous.x).toBe(spec.x);expect(previous.z).toBe(spec.z);
  for(let now=1010;now<5000;now+=10){
   const pose=oldWheelMotion(spec,{x,z},receipt,now)!;
   expect(Math.hypot(pose.x-previous.x,pose.z-previous.z)).toBeLessThan(.14);
   if(pose.lower>0)expect(pose.carry).toBe(1);
   if(pose.release>0)expect(pose.lower).toBe(1);
   if(now>=pose.placedAt){expect(pose.x-Math.sign(x)*.66).toBeCloseTo(pose.discard.x);expect(pose.z).toBeCloseTo(pose.discard.z);}
   previous=pose;
  }
  expect(previous.release).toBe(1);expect(previous.discard.y).toBe(.44);
 });
 it('extends only the physical receipt for a fast bot removal, with causal fitting and unchanged official times',()=>{
  const r=createSoloRound([{id:'you',role:'FRONT_JACK',nickname:'You',ready:true,joinedAt:0}],1000,'fast');
  submitAction(r,'you','FRONT_LIFT',1200,'j');reconcile(r,3000);
  const before=structuredClone(r),timeline=new TaskAnimationTimeline();timeline.ingestRecorded(r);
  const off=timeline.receipt('FL_WHEEL_OFF')!,on=timeline.receipt('FL_WHEEL_ON')!;
  expect(off.endsAt-off.startsAt).toBeGreaterThanOrEqual(OLD_WHEEL_REMOVE_MS);
  expect(on.startsAt).toBeGreaterThanOrEqual(oldWheelCarryClearAt(off));
  expect(r).toEqual(before);
  expect(r.tasks.find(t=>t.id==='FL_WHEEL_OFF')!.dueAt).toBe(2350);
 });
});
