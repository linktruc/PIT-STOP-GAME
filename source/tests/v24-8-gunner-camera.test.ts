import {describe,it,expect} from 'vitest';
import {GunnerMotion} from '../src/scene/gunnerMotion';
import {playerCameraPose,PLAYER_CAMERA_OPTIONS} from '../src/scene/playerCamera';
import {rearJackApproach,stabilizerExitPhase,stabilizerStation} from '../src/scene/staging';
import {createSoloRound,reconcile,submitAction} from '../src/engine';
describe('Contact gun strokes without avoidance jitter',()=>{
 it('retains a BOT tightening stroke when the outgoing tyre delays contact past completion',()=>{
  const r=createSoloRound([{id:'you',role:'RELEASE_CONTROLLER',nickname:'You',ready:true,joinedAt:0}],0,'late');reconcile(r,10000);
  const get=(id:string)=>r.tasks.find(t=>t.id===id)!;const m=new GunnerMotion();let fired=false;
  const end=get('FL_GUN_TIGHTEN').completedAt!;
  for(let now=0;now<end+1400;now+=10){const clear=now>=end+200;const p=m.sample('late','FL',now,get('FRONT_LIFT'),get('FL_GUN_LOOSEN'),get('FL_WHEEL_ON'),get('FL_GUN_TIGHTEN'),true,clear,true,clear);if(p.operation==='tighten'&&p.firing){expect(clear).toBe(true);fired=true;}}
  expect(fired).toBe(true);
 });
 it('retains a visible stroke after a 36ms human action and keeps the corridor speed bounded',()=>{
  const r=createSoloRound([{id:'you',role:'FL_GUNNER',nickname:'You',ready:true,joinedAt:0}],1000,'test');reconcile(r,1700);submitAction(r,'you','FL_GUN_LOOSEN',1736,'g');
  const get=(id:string)=>r.tasks.find(t=>t.id===id)!;const motion=new GunnerMotion();let previous=0,shots=0;
  const before=structuredClone(r);
  for(let now=1000;now<=2300;now+=10){const pose=motion.sample('test','FL',now,get('FRONT_LIFT'),get('FL_GUN_LOOSEN'),get('FL_WHEEL_ON'),get('FL_GUN_TIGHTEN'),now>=1250,true);expect(Math.abs(pose.stance-previous)).toBeLessThanOrEqual(10/220+.00001);if(now>=1736&&pose.firing)shots++;previous=pose.stance;}
  expect(shots).toBeGreaterThanOrEqual(10);expect(r).toEqual(before);
 });
 it('waits for the actual fitted wheel before a retained tightening stroke',()=>{
  const r=createSoloRound([{id:'you',role:'FL_GUNNER',nickname:'You',ready:true,joinedAt:0}],0,'t');reconcile(r,700);submitAction(r,'you','FL_GUN_LOOSEN',736,'l');reconcile(r,1472);submitAction(r,'you','FL_GUN_TIGHTEN',1508,'t');
  const get=(id:string)=>r.tasks.find(t=>t.id===id)!;const m=new GunnerMotion();let fired=false;
  for(let now=0;now<2300;now+=10){const fitted=now>=1700,p=m.sample('t','FL',now,get('FRONT_LIFT'),get('FL_GUN_LOOSEN'),get('FL_WHEEL_ON'),get('FL_GUN_TIGHTEN'),true,fitted);if(p.operation==='tighten'&&p.firing){expect(fitted).toBe(true);fired=true;}}
  expect(fired).toBe(true);
 });
});
describe('Reserved support and jack lanes',()=>{
 it('keeps the rear trolley behind the RL waiting foot before GO',()=>{const p=rearJackApproach(1);expect(p.z).toBe(1.2);expect(2.35+p.z-.575).toBeGreaterThan(2.47+.21);expect(rearJackApproach(0)).toEqual({x:0,z:0});});
 it('waits for tyre follow-through before moving the Stabilizer and uses a separate exit lane',()=>{
  const r=createSoloRound([{id:'you',role:'RELEASE_CONTROLLER',nickname:'You',ready:true,joinedAt:0}],0,'s');reconcile(r,10000);
  expect(stabilizerExitPhase(r.tasks,0)).toBe(0);expect(stabilizerExitPhase(r.tasks,10000)).toBe(1);
  const final=stabilizerStation(1,.19,0,1);expect(final.x).toBeCloseTo(3.8);expect(final.z).toBeCloseTo(-.7);
 });
});
describe('Player views',()=>{
 it('exposes overview, first person and an elevated third person',()=>{expect(PLAYER_CAMERA_OPTIONS.map(p=>p.mode)).toEqual(['overview','first-person','third-person']);});
 it('positions the first-person eye in front of the helmet and the third-person camera above and behind',()=>{
  const root={x:2,y:0,z:1},head={x:2,y:1.2,z:1},forward={x:-1,y:0,z:0};
  const first=playerCameraPose('first-person',root,head,forward),third=playerCameraPose('third-person',root,head,forward);
  expect(first.position.x).toBeLessThan(head.x);expect(first.position.y).toBeCloseTo(1.225);expect(first.near).toBe(.04);
  expect(third.position.y).toBeGreaterThan(head.y+2);expect(third.position.x).toBeGreaterThan(root.x);expect(third.target.x).toBeLessThan(root.x);
 });
});
