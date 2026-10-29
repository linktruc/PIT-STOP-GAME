import { describe, it, expect } from 'vitest';
import { createSoloRound, createRound, reconcile, submitAction, humanMeanAt } from '../src/engine';
import { ROLES, type Role, type Player } from '../src/types';
const human=(role:Role,id='you'):Player=>({id,role,nickname:id,ready:true,joinedAt:0});
describe('Solo fallback and unchanged multiplayer',()=>{
  it.each(['FRONT_JACK','REAR_JACK'] as Role[])('%s: 2s + 700ms then 1350ms reference, including late polling',role=>{
    const r=createSoloRound([human(role)],1000,'test');
    submitAction(r,'you',role==='FRONT_JACK'?'FRONT_LIFT':'REAR_LIFT',3000,'lift');
    expect(humanMeanAt(r,3000)).toBeNull();
    reconcile(r,3699);
    expect(r.events).toHaveLength(2);
    reconcile(r,4000);
    expect(r.tasks.filter(t=>t.cohort==='GUN_LOOSEN').map(t=>t.completedAt)).toEqual([3700,3700,3700,3700]);
    expect(humanMeanAt(r,3700)).toBe(1350);
    expect(r.samples).toHaveLength(1);
    expect(r.tasks.filter(t=>t.cohort==='WHEEL_OFF').every(t=>t.enabledAt===3700&&t.dueAt===5050)).toBe(true);
  });
  it.each(ROLES)('finishes Solo %s with causal event and step clocks',role=>{
    const r=createSoloRound([human(role)],1000,'role-test');let now=1000;
    for(let i=0;i<100&&r.status!=='COMPLETED';i++){
      reconcile(r,now);
      const next=Math.min(...r.tasks.filter(t=>t.status==='AVAILABLE').map(t=>t.ownerId?t.enabledAt!+2000:t.dueAt??Infinity));
      expect(Number.isFinite(next)).toBe(true);now=Math.max(now,next);reconcile(r,now);
      for(const t of r.tasks.filter(t=>t.ownerId&&t.status==='AVAILABLE'&&t.enabledAt!+2000<=now))submitAction(r,'you',t.id,now,t.id);
    }
    expect(r.status).toBe('COMPLETED');expect(r.events).toHaveLength(21);
    expect(r.elapsedMs).toBe(r.finishedAt!-r.goAt);
    for(const t of r.tasks){expect(t.completedAt).toBeGreaterThanOrEqual(t.enabledAt!);if(!t.ownerId&&t.dueAt!==null)expect(t.completedAt).toBeLessThanOrEqual(t.dueAt);}
  });
  it('uses first real Gunner sync even in a local mixed roster',()=>{
    for(const solo of [true,false]){
      const players=[human('FRONT_JACK','jack'),human('FL_GUNNER','gun')];
      const r=solo?createSoloRound(players,0,'mixed'):createRound(players,0,'mixed');
      submitAction(r,'jack','FRONT_LIFT',2000,'j');reconcile(r,5000);
      expect(r.tasks.find(t=>t.id==='FR_GUN_LOOSEN')!.completedAt).toBeNull();
      submitAction(r,'gun','FL_GUN_LOOSEN',6000,'g');
      expect(r.tasks.find(t=>t.id==='FR_GUN_LOOSEN')!.completedAt).toBe(6000);
      expect(humanMeanAt(r,6000)).toBe(3000);
    }
  });
});
