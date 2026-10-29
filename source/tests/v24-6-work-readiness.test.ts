import {describe,it,expect} from 'vitest';
import {createSoloRound,reconcile,submitAction} from '../src/engine';
import {ROLES} from '../src/types';
import {workPhase,workDone,fittingPhase,gunnerWorkHandoff} from '../src/scene/work';
import {oldWheelWorkMotion} from '../src/scene/oldWheel';
import {CREW} from '../src/scene/crew';
describe('Critical work follows Action readiness for every role',()=>{
 it.each(ROLES)('%s: every prerequisite is visibly done when a dependent action unlocks',role=>{
  const r=createSoloRound([{id:'you',role,nickname:'You',ready:true,joinedAt:0}],1000,role);let now=1000;
  for(let guard=0;guard<100&&r.status!=='COMPLETED';guard++){
   reconcile(r,now);
   for(const t of r.tasks.filter(t=>t.enabledAt!==null))for(const id of t.dependencies){
    const parent=r.tasks.find(p=>p.id===id)!;
    expect(workDone(parent,t.enabledAt!)).toBe(true);expect(workPhase(parent,t.enabledAt!)).toBe(1);
   }
   const next=Math.min(...r.tasks.filter(t=>t.status==='AVAILABLE').map(t=>t.ownerId?t.enabledAt!+36:t.dueAt??Infinity));
   expect(Number.isFinite(next)).toBe(true);now=Math.max(now,next);
   const before=structuredClone(r);for(const task of r.tasks)workPhase(task,now);expect(r).toEqual(before);
   reconcile(r,now);
   for(const t of r.tasks.filter(t=>t.ownerId&&t.status==='AVAILABLE'&&t.enabledAt!+36<=now))submitAction(r,'you',t.id,now,t.id);
  }
  expect(r.status).toBe('COMPLETED');expect(r.events).toHaveLength(21);
  for(const t of r.tasks){expect(workPhase(t,t.completedAt!)).toBe(1);if(t.cohort==='WHEEL_ON')expect(fittingPhase(t,t.completedAt!)).toBe(1);}
 });
 it('36ms Gunner: fitting is done at 2472 while the old-wheel carry still continues',()=>{
  const r=createSoloRound([{id:'you',role:'FL_GUNNER',nickname:'You',ready:true,joinedAt:0}],1000,'fast');reconcile(r,1700);submitAction(r,'you','FL_GUN_LOOSEN',1736,'g');reconcile(r,2472);
  const off=r.tasks.find(t=>t.id==='FL_WHEEL_OFF')!,on=r.tasks.find(t=>t.id==='FL_WHEEL_ON')!,gun=r.tasks.find(t=>t.id==='FL_GUN_TIGHTEN')!;
  expect(off.completedAt).toBe(2104);expect(on.completedAt).toBe(2472);expect(gun.enabledAt).toBe(2472);
  expect(workPhase(off,2104)).toBe(1);expect(fittingPhase(on,2472)).toBe(1);
  const carry=oldWheelWorkMotion(CREW.find(c=>c.role==='FL_WHEEL_OFF')!,{x:-1.12,z:-1.58},off,2472)!;
  expect(carry.extract).toBe(1);expect(carry.carry).toBeGreaterThan(0);expect(carry.carry).toBeLessThan(1);expect(carry.lower).toBe(0);
 });
 it('scheduled BOT reaches the endpoint at its deadline without marking an ACK-pending task DONE',()=>{
  const r=createSoloRound([{id:'you',role:'FL_GUNNER',nickname:'You',ready:true,joinedAt:0}],1000,'pending');reconcile(r,1000);
  const jack=r.tasks.find(t=>t.id==='FRONT_LIFT')!;
  expect(workPhase(jack,1699)).toBeLessThan(1);expect(workPhase(jack,1700)).toBe(1);expect(workDone(jack,1700)).toBe(false);expect(jack.status).toBe('AVAILABLE');
 });
});

describe('Gunner work finish and independent stow',()=>{
 it('does not restart tightening after a fast accepted input',()=>{
  const r=createSoloRound([{id:'you',role:'FL_GUNNER',nickname:'You',ready:true,joinedAt:0}],0,'stance');reconcile(r,700);submitAction(r,'you','FL_GUN_LOOSEN',736,'l');reconcile(r,1472);
  const loose=r.tasks.find(t=>t.id==='FL_GUN_LOOSEN')!,tight=r.tasks.find(t=>t.id==='FL_GUN_TIGHTEN')!;
  const before=gunnerWorkHandoff(loose,tight,1508);submitAction(r,'you','FL_GUN_TIGHTEN',1508,'t');
  expect(gunnerWorkHandoff(loose,tight,1508)).toBeCloseTo(before);
  let last=before;for(let now=1509;now<=1688;now++){
   const value=gunnerWorkHandoff(loose,tight,now);expect(value).toBeGreaterThanOrEqual(last);expect(value-last).toBeLessThan(.01);last=value;
  }
  expect(last).toBe(1);expect(gunnerWorkHandoff(loose,tight,5000)).toBe(1);
 });
 it('does not jump when tightening becomes ready before the loosen stow has finished',()=>{
  const r=createSoloRound([{id:'you',role:'FL_GUNNER',nickname:'You',ready:true,joinedAt:0}],0,'quick-chain');reconcile(r,700);submitAction(r,'you','FL_GUN_LOOSEN',736,'l');
  const loose=r.tasks.find(t=>t.id==='FL_GUN_LOOSEN')!,tight={...r.tasks.find(t=>t.id==='FL_GUN_TIGHTEN')!,enabledAt:808};
  const prior=gunnerWorkHandoff(loose,undefined,808);
  expect(gunnerWorkHandoff(loose,tight,808)).toBe(prior);
  expect(Math.abs(gunnerWorkHandoff(loose,tight,809)-prior)).toBeLessThan(.01);
 });
});
