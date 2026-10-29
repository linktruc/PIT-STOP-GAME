import { describe, expect, it } from 'vitest';
import { assignRoles, createRound, createSoloRound, humanMeanAt, reconcile, submitAction } from '../src/engine';
import { CREW, CAR_BODY_FOOTPRINTS } from '../src/scene/crew';
import type { Player, Role, Round } from '../src/types';

const human = (role: Role, id: string): Player => ({ id, role, ready: true, nickname: id, joinedAt: 0 });
const task = (r: Round, id: string) => r.tasks.find(x => x.id === id)!;

describe('V23 opening human reference and waiting Gunner bots', () => {
  it('assigns Jack first, Gunner second, then the three distinct remaining families', () => {
    for (let seed=0; seed<256; seed++) {
      let current = seed >>> 0;
      const random = () => ((current = (Math.imul(current,1664525)+1013904223)>>>0) / 4294967296);
      const players = Array.from({length:15},(_,i)=>human('FRONT_JACK',`p${i}`));
      const result = assignRoles(players,random);
      expect(result[0].role.endsWith('_JACK')).toBe(true);
      expect(result[1].role.endsWith('_GUNNER')).toBe(true);
      expect(new Set(result.map(p=>p.role)).size).toBe(15);
      expect(new Set(result.slice(2,5).map(p=>p.role==='RELEASE_CONTROLLER'?'RELEASE':p.role.endsWith('_WHEEL_OFF')?'OFF':'ON'))).toEqual(new Set(['RELEASE','OFF','ON']));
      expect(result.slice(5,9).every(p=>p.role.endsWith('_GUNNER')||p.role.endsWith('_JACK'))).toBe(true);
    }
  });
  it('holds all bot Gunner actions after a slow Jack, then finishes alongside the first human Gunner and seeds the mean from both reactions', () => {
    const r = createRound([human('FRONT_JACK','jack'),human('FL_GUNNER','gunner'),human('FL_WHEEL_OFF','remover'),human('RELEASE_CONTROLLER','release')],0);
    submitAction(r,'jack','FRONT_LIFT',400,'j1');
    expect(task(r,'REAR_LIFT').completedAt).toBe(400);
    for (const id of ['FR_GUN_LOOSEN','RL_GUN_LOOSEN','RR_GUN_LOOSEN']) {
      expect(task(r,id).status).toBe('AVAILABLE');
      expect(task(r,id).dueAt).toBeNull();
    }
    reconcile(r,2399);
    expect(task(r,'FR_GUN_LOOSEN').completedAt).toBeNull();
    submitAction(r,'gunner','FL_GUN_LOOSEN',2400,'g1');
    expect(r.samples.map(x=>x.ms)).toEqual([400,2000]);
    expect(humanMeanAt(r,2400)).toBe(1200);
    for (const id of ['FR_GUN_LOOSEN','RL_GUN_LOOSEN','RR_GUN_LOOSEN']) {
      expect(task(r,id).completedAt).toBe(2400);
      expect(task(r,id).reason).toBe('OPENING_GUNNER_SYNC');
    }
    expect(task(r,'FR_WHEEL_OFF').baselineMeanMs).toBe(1200);
    expect(task(r,'FR_WHEEL_OFF').dueAt).toBe(3600);
  });
  it('first human Gunner drives bot peers while another human Gunner may still be working', () => {
    const r=createRound([human('FRONT_JACK','jack'),human('FL_GUNNER','g1'),human('FR_GUNNER','g2'),human('RELEASE_CONTROLLER','release')],0);
    submitAction(r,'jack','FRONT_LIFT',500,'j');
    submitAction(r,'g1','FL_GUN_LOOSEN',1500,'g1');
    expect(task(r,'FR_GUN_LOOSEN').status).toBe('AVAILABLE');
    expect(task(r,'RL_GUN_LOOSEN').completedAt).toBe(1500);
    expect(task(r,'RR_GUN_LOOSEN').completedAt).toBe(1500);
    expect(task(r,'RL_GUN_LOOSEN').reason).toBe('OPENING_GUNNER_SYNC');
    submitAction(r,'g2','FR_GUN_LOOSEN',2600,'g2');
    expect(task(r,'FR_WHEEL_OFF').baselineMeanMs).toBeCloseTo((500+1000+2100)/3);
  });
  it('keeps Solo Jack-only rounds playable without inventing an online Gunner', () => {
    const r=createSoloRound([human('FRONT_JACK','solo')],0,'solo-ref');
    submitAction(r,'solo','FRONT_LIFT',800,'lift');
    expect(task(r,'REAR_LIFT').completedAt).toBe(800);
    expect(task(r,'FL_GUN_LOOSEN').dueAt).toBe(1500);
  });
});

describe('front operator pre-position safety',()=>{
  it('stations the front jack ahead of the stopped car footprint, on the centreline',()=>{
    const front=CREW.find(c=>c.role==='FRONT_JACK')!;
    expect(front.x).toBe(0);
    expect(front.z).toBeLessThan(-4);
    expect(CAR_BODY_FOOTPRINTS.every(p=>front.z + .33 < p.minZ || front.z - .33 > p.maxZ)).toBe(true);
  });
});
