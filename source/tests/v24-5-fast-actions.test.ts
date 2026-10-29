import {describe,it,expect} from 'vitest';
import {createSoloRound,createRound,reconcile,submitAction,humanMeanAt} from '../src/engine';
import {TaskAnimationTimeline,durationForTask} from '../src/scene/animation';
import {LiveSceneAudio} from '../src/scene/liveAudio';
import {OLD_WHEEL_REMOVE_MS,OLD_WHEEL_CARRY_MS,OLD_WHEEL_LOWER_MS,OLD_WHEEL_RELEASE_MS} from '../src/scene/oldWheel';
import type {Role,Player} from '../src/types';
const player=(role:Role,id='you'):Player=>({id,role,nickname:id,ready:true,joinedAt:0});
describe('V24.5 fast actions',()=>{
 it.each(['FL_GUNNER','FR_GUNNER','RL_GUNNER','RR_GUNNER'] as Role[])('%s includes one Jack BOT observation, with exact step and team clocks',role=>{
  const r=createSoloRound([player(role)],1000,'gun');reconcile(r,1700);
  expect(humanMeanAt(r,1700)).toBeNull();
  const id=role.replace('_GUNNER','_GUN_LOOSEN');submitAction(r,'you',id,1736,'g');
  expect(humanMeanAt(r,1736)).toBe(368);
  expect(r.samples).toEqual([{taskId:id,ms:36,at:1736}]);
  for(const t of r.tasks.filter(t=>t.cohort==='WHEEL_OFF')){
   expect(t.enabledAt).toBe(1736);expect(t.baselineMeanMs).toBe(368);expect(t.dueAt).toBe(2104);
  }
  reconcile(r,2103);expect(r.tasks.filter(t=>t.cohort==='WHEEL_OFF').every(t=>t.status==='AVAILABLE')).toBe(true);
  reconcile(r,4000);expect(r.tasks.filter(t=>t.cohort==='WHEEL_OFF').every(t=>t.completedAt===2104)).toBe(true);
  expect(r.events.filter(e=>e.taskId.endsWith('_WHEEL_OFF')).map(e=>e.at-e.enabledAt!)).toEqual([368,368,368,368]);
 });
 it('continues adapting without counting parallel bot Jacks four times',()=>{
  const r=createSoloRound([player('FL_GUNNER')],0,'adapt');reconcile(r,700);
  submitAction(r,'you','FL_GUN_LOOSEN',736,'l');reconcile(r,1472);
  submitAction(r,'you','FL_GUN_TIGHTEN',1572,'t');
  expect(humanMeanAt(r,1572)).toBeCloseTo((700+36+100)/3);
 });
 it('preserves ranked and mixed-roster reference arithmetic',()=>{
  for(const make of [createRound,createSoloRound]){
   const r=make([player('FRONT_JACK','j'),player('FL_GUNNER','g')],0,'mixed');
   submitAction(r,'j','FRONT_LIFT',700,'j');submitAction(r,'g','FL_GUN_LOOSEN',736,'g');
   expect(humanMeanAt(r,736)).toBe(368);
  }
 });
 it('shows all phases of a late batched fast completion and preserves receipts on the next snapshot',()=>{
  const r=createSoloRound([player('FL_GUNNER')],1000,'live');
  const a=new TaskAnimationTimeline();a.ingestLive(r,900);
  reconcile(r,1700);submitAction(r,'you','FL_GUN_LOOSEN',1736,'g');reconcile(r,2104);
  const before=structuredClone(r);a.ingestLive(r,2200);
  const audio=new LiveSceneAudio();audio.poll('live',900,[]);
  const gun=a.receipt('FL_GUN_LOOSEN')!,off=a.receipt('FL_WHEEL_OFF')!;
  expect(gun.startsAt).toBeGreaterThanOrEqual(2200);expect(gun.endsAt-gun.startsAt).toBeGreaterThanOrEqual(120);
  expect(off.startsAt).toBe(gun.startsAt);
  expect(a.posePhase('FL_GUN_LOOSEN',gun.startsAt+100)).toBeGreaterThan(0);
  expect(a.posePhase('FL_GUN_LOOSEN',gun.startsAt+100)).toBeLessThan(1);
  expect(audio.poll('live',gun.startsAt,a.allReceipts())).toContain('FL_GUN_LOOSEN');
  reconcile(r,2472);a.ingestLive(r,2500);
  expect(a.receipt('FL_GUN_LOOSEN')).toEqual(gun);expect(a.receipt('FL_WHEEL_OFF')).toEqual(off);
  expect(before.tasks.find(t=>t.id==='FL_WHEEL_OFF')!.completedAt).toBe(2104);
 });
 it('shortens the physical follow-through while retaining removal, carry, lowering and release',()=>{
  expect(durationForTask('FRONT_LIFT')).toBeLessThan(650);
  expect(durationForTask('FL_GUN_LOOSEN')).toBeLessThan(750);
  expect(OLD_WHEEL_REMOVE_MS+OLD_WHEEL_CARRY_MS+OLD_WHEEL_LOWER_MS+OLD_WHEEL_RELEASE_MS).toBeLessThan(2500);
 });
});
