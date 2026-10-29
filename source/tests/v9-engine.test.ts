import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRound, createSoloRound, earlyAction, reconcile, submitAction } from '../src/engine';
import { ROLES, type Player } from '../src/types';
const jack:Player={id:'jack',nickname:'Jack',role:'FRONT_JACK',ready:true,joinedAt:0};
const gun:Player={...jack,id:'gun',nickname:'Gun',role:'FL_GUNNER'};
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals();});
describe('V9 personal early-tap lockout reference parity',()=>{
 it('locks countdown until exactly GO + 2000ms, survives snapshot reconnect and never stacks retries',()=>{
  const r=createRound([jack,gun],1000,'r');earlyAction(r,'jack','FRONT_LIFT',100,'a');
  expect(r.penalties?.jack).toEqual({at:100,until:3000});
  earlyAction(r,'jack','FRONT_LIFT',900,'a');earlyAction(r,'jack','FRONT_LIFT',999,'ignored');
  expect(r.penalties?.jack.until).toBe(3000);
  const recovered=structuredClone(r);expect(()=>submitAction(recovered,'jack','FRONT_LIFT',2999,'x')).toThrow('lockout');
  submitAction(recovered,'jack','FRONT_LIFT',3000,'x');expect(recovered.tasks[0].completedAt).toBe(3000);
  earlyAction(recovered,'jack','FRONT_LIFT',4000,'ignored');expect(recovered.penalties?.jack.until).toBe(3000);
 });
 it('denies an available task during an earlier lock, keeps others independent, and can penalize a later owned task',()=>{
  const r=createRound([jack,gun],1000);earlyAction(r,'gun','FL_GUN_LOOSEN',1001,'early');expect(r.penalties?.gun.until).toBe(3001);
  submitAction(r,'jack','FRONT_LIFT',1100,'lift');expect(r.tasks.find(t=>t.id==='FL_GUN_LOOSEN')!.status).toBe('AVAILABLE');
  expect(r.tasks.find(t=>t.id==='REAR_LIFT')!.completedAt).toBe(1100);
  expect(()=>submitAction(r,'gun','FL_GUN_LOOSEN',1200,'gun')).toThrow('lockout');
  submitAction(r,'gun','FL_GUN_LOOSEN',3001,'gun');expect(r.samples.at(-1)!.ms).toBe(1901);
  earlyAction(r,'gun','FL_GUN_TIGHTEN',3002,'next');expect(r.penalties?.gun.until).toBe(5002);
  submitAction(r,'gun','FL_GUN_LOOSEN',3100,'gun');expect(r.events.filter(e=>e.taskId==='FL_GUN_LOOSEN')).toHaveLength(1);
 });
 it('rejects forged owners, request reuse and invalid clock; ignores taps on completed work',()=>{
  const r=createRound([jack,gun],1000);
  expect(()=>earlyAction(r,'gun','FRONT_LIFT',900,'x')).toThrow('another');
  expect(()=>earlyAction(r,'gun','FL_GUN_LOOSEN',NaN,'x')).toThrow('timestamp');
  earlyAction(r,'gun','FL_GUN_LOOSEN',900,'x');expect(()=>earlyAction(r,'gun','FL_GUN_TIGHTEN',901,'x')).toThrow('another early');
  submitAction(r,'jack','FRONT_LIFT',1100,'lift');submitAction(r,'gun','FL_GUN_LOOSEN',3000,'gun');
  const before=structuredClone(r.penalties);earlyAction(r,'gun','FL_GUN_LOOSEN',3100,'done');expect(r.penalties).toEqual(before);
 });
 it('preserves the online human-jack constraint and seeds only explicit non-jack Solo rounds',()=>{
  expect(()=>createRound([gun],1000)).toThrow('human jack');const solo=createSoloRound([gun],1000,'solo');
  reconcile(solo,1400);expect(solo.tasks.filter(t=>t.cohort==='LIFT').every(t=>t.completedAt===1400)).toBe(true);
  submitAction(solo,'gun','FL_GUN_LOOSEN',1500,'gun');expect(solo.tasks.find(t=>t.id==='FL_WHEEL_OFF')!.baselineMeanMs).toBe(100);
  expect(createSoloRound([jack],1000,'jack').soloTiming).toBeUndefined();
 });
 it.each(ROLES)('completes Solo Test as %s with only one human and no ranking writes',async(role)=>{
  vi.resetModules();vi.stubGlobal('window',{PIT_CONFIG:{enableSoloTest:true}});vi.useFakeTimers();vi.setSystemTime(100000);
  const {solo}=await import('../src/solo');await solo.enter();await solo.call('choose_role',null,{role});await solo.call('ready',null,{ready:true});let s=await solo.call('start');
  expect(s.rooms[0].players[0].role).toBe(role);await expect(solo.call('choose_role',null,{role:'REAR_JACK'})).rejects.toThrow('before starting');
  for(let i=0;i<500&&s.rooms[0].status!=='COMPLETED';i++){
   vi.advanceTimersByTime(100);s=await solo.getState();for(const t of s.rooms[0].round!.tasks.filter(t=>t.status==='AVAILABLE'&&t.ownerId==='solo-you'))s=await solo.call('action',null,{taskId:t.id,requestId:t.id});
  }
  expect(s.rooms[0].round!.tasks.filter(t=>t.status==='DONE')).toHaveLength(21);expect(s.rooms[0].status).toBe('COMPLETED');expect(s.leaderboard).toEqual([]);
  await solo.call('replay');await solo.call('choose_role',null,{role:'RELEASE_CONTROLLER'});expect((await solo.getState()).rooms[0].players[0].role).toBe('RELEASE_CONTROLLER');await solo.call('leave');
 });
});

it('local Solo adapter rejects missing early request IDs and preserves countdown lock across reads',async()=>{
 vi.resetModules();vi.stubGlobal('window',{PIT_CONFIG:{enableSoloTest:true}});vi.useFakeTimers();vi.setSystemTime(100000);
 const {solo}=await import('../src/solo');await solo.enter();await solo.call('ready',null,{ready:true});const started=await solo.call('start');
 await expect(solo.call('early_action',null,{taskId:'FRONT_LIFT'})).rejects.toThrow('request ID');
 const early=await solo.call('early_action',null,{taskId:'FRONT_LIFT',requestId:'early'});expect(early.rooms[0].round!.penalties!['solo-you'].until).toBe(started.rooms[0].round!.goAt+2000);
 vi.advanceTimersByTime(3100);await expect(solo.call('action',null,{taskId:'FRONT_LIFT',requestId:'click'})).rejects.toThrow('lockout');
 expect((await solo.getState()).rooms[0].round!.penalties).toEqual(early.rooms[0].round!.penalties);await solo.call('leave');
});
