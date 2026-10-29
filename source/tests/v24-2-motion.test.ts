import {describe,it,expect} from 'vitest';
import {SceneClock,FramePacer,CrewMotion} from '../src/scene/motion';
import {TaskAnimationTimeline} from '../src/scene/animation';
import {createSoloRound,reconcile,submitAction} from '../src/engine';
describe('V24.2 animation continuity',()=>{
 it('holds a finished physical pose while waiting for a late authoritative ACK',()=>{
  const r=createSoloRound([{id:'you',role:'FRONT_JACK',nickname:'You',ready:true,joinedAt:0}],1000,'ack');
  submitAction(r,'you','FRONT_LIFT',3000,'j');const timeline=new TaskAnimationTimeline();timeline.ingestRecorded(r);
  const before=structuredClone(r);
  expect(timeline.posePhase('FL_GUN_LOOSEN',3699)).toBeCloseTo(699/700);
  expect(timeline.posePhase('FL_GUN_LOOSEN',3701)).toBe(1);
  expect(timeline.isDone('FL_GUN_LOOSEN',3701)).toBe(false);
  expect(r).toEqual(before);
  reconcile(r,3900);timeline.ingestRecorded(r);
  expect(timeline.posePhase('FL_GUN_LOOSEN',3900)).toBe(1);
  expect(timeline.isDone('FL_GUN_LOOSEN',3900)).toBe(true);
  expect(r.tasks.find(t=>t.id==='FL_GUN_LOOSEN')!.completedAt).toBe(3700);
 });
 it('keeps a carrier clear until the human Gunner visual tail ends',()=>{
  const r=createSoloRound([{id:'you',role:'FL_GUNNER',nickname:'You',ready:true,joinedAt:0}],1000,'causal');
  reconcile(r,1700);submitAction(r,'you','FL_GUN_LOOSEN',3700,'g');
  const timeline=new TaskAnimationTimeline();timeline.ingestRecorded(r);
  const gun=timeline.receipt('FR_GUN_LOOSEN')!,off=timeline.receipt('FR_WHEEL_OFF')!;
  expect(off.startsAt).toBeGreaterThanOrEqual(gun.endsAt);
  expect(off.endsAt-off.startsAt).toBe(900);
  expect(r.tasks.find(t=>t.id==='FR_WHEEL_OFF')!.dueAt).toBe(5050);
 });
 it('does not rewind for stale UI timestamps or server corrections' ,()=>{
  const clock=new SceneClock();let last=clock.read(0,10000);
  for(let frame=1;frame<600;frame++){
   const now=clock.read(frame*1000/60,10000+frame*1000/60-(frame%3)*15-(frame>120?100:0));
   expect(now).toBeGreaterThan(last);last=now;
  }
 });
 it.each([60,90,120,144])('paces close to 60 FPS on a %iHz RAF clock',hz=>{
  const pacer=new FramePacer();let draws=0;
  for(let i=0;i<hz*4;i++)if(pacer.accept(i*1000/hz,60))draws++;
  expect(draws).toBeGreaterThanOrEqual(239);expect(draws).toBeLessThanOrEqual(241);
 });
 it('bounds position changes even if collision targets suddenly switch sides',()=>{
  const motion=new CrewMotion();let p=motion.sample('r',0,[{x:0,z:0,fixed:false}])[0];
  for(let t=10;t<=2000;t+=10){
   const q=motion.sample('r',t,[{x:t<1000?8:-8,z:0,fixed:false}])[0];
   expect(Math.hypot(q.x-p.x,q.z-p.z)).toBeLessThanOrEqual(.06000001);p=q;
  }
 });
 it('does not teleport after a dropped live frame and resets explicitly on seek',()=>{
  const motion=new CrewMotion();motion.sample('r',0,[{x:0,z:0,fixed:false}]);
  expect(motion.sample('r',1000,[{x:10,z:0,fixed:false}])[0].x).toBeLessThanOrEqual(.300001);
  motion.reset();expect(motion.sample('r',5000,[{x:10,z:0,fixed:false}])[0].x).toBe(10);
 });
 it('steers a moving crew member around an occupied body station',()=>{
  const motion=new CrewMotion();motion.sample('r',0,[{x:-2,z:0,fixed:false},{x:0,z:0,fixed:true}]);
  let lastX=-2;for(let t=10;t<=4000;t+=10){
   const p=motion.sample('r',t,[{x:2,z:0,fixed:false},{x:0,z:0,fixed:true}]);
   expect(Math.hypot(p[0].x,p[0].z)).toBeGreaterThanOrEqual(1.14999);lastX=p[0].x;
  }
  expect(lastX).toBeGreaterThan(1.8);
 });
});
