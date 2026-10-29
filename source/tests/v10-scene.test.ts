import { describe, expect, it } from 'vitest';
import { createRound } from '../src/engine';
import { TaskAnimationTimeline } from '../src/scene/animation';
import { CAR_BODY_FOOTPRINTS, CORNER_POSITIONS, CREW, clearsCarEnvelope, supportCrewClear, supportHandAnchors } from '../src/scene/crew';
import { PIT_LANE_LAYOUT } from '../src/scene/environment';
import { arrivalPose, departurePose } from '../src/scene/rig';
import type { Round } from '../src/types';

function recorded(stepMs=400): Round {
  const round=createRound([{id:'jack',role:'FRONT_JACK',nickname:'Jack',ready:true,joinedAt:0}],10_000,'recorded');
  for(const task of round.tasks){task.enabledAt=Math.max(round.goAt,...task.dependencies.map(id=>round.tasks.find(t=>t.id===id)!.completedAt!));task.completedAt=task.enabledAt+stepMs;task.status='DONE';}
  round.status='COMPLETED';round.finishedAt=Math.max(...round.tasks.map(t=>t.completedAt!));round.elapsedMs=round.finishedAt-round.goAt;
  return round;
}

describe('authoritative pit-lane arrival',()=>{
  it('approaches throughout 3/2/1 and is exactly stationary at GO without changing game state',()=>{
    expect(arrivalPose(10_000,7_000).carZ).toBe(PIT_LANE_LAYOUT.approachZ);
    let previous=Infinity;
    for(let now=7_000;now<=10_000;now+=10){const pose=arrivalPose(10_000,now);expect(pose.carZ).toBeLessThanOrEqual(previous);previous=pose.carZ;if(now<10_000)expect(pose.entry).toBe(0);}
    expect(arrivalPose(10_000,10_000)).toMatchObject({carZ:0,progress:1,arrived:true});
    expect(arrivalPose(10_000,10_250)).toMatchObject({carZ:0,entry:1});
    expect(arrivalPose(null,10_000).arrived).toBe(false);
    // Joining halfway through a countdown derives the same pose; no local restart.
    const halfway=arrivalPose(10_000,8_500);arrivalPose(10_000,99_000);
    expect(arrivalPose(10_000,8_500)).toEqual(halfway);
    expect(arrivalPose(10_000,8_500).carX).toBeGreaterThan(0);
  });
  it('keeps a long lane and scenery outside the action staging coordinate frame',()=>{
    expect(PIT_LANE_LAYOUT.stop).toEqual({x:0,z:0});expect(PIT_LANE_LAYOUT.laneLength).toBeGreaterThan(100);
    expect(PIT_LANE_LAYOUT.garagesX).toBeLessThan(-9);expect(PIT_LANE_LAYOUT.pitWallX).toBeGreaterThan(12);
    expect(CORNER_POSITIONS).toEqual([['FL',-1.12,-1.58],['FR',1.12,-1.58],['RL',-1.12,1.42],['RR',1.12,1.42]]);
  });
});

describe('V10.4 local support refinement',()=>{
  it('preserves all 15 playable actors and the three unrelated background support figures',()=>{
    expect(CREW.filter(c=>c.role)).toHaveLength(15);expect(CREW.filter(c=>c.kind==='ambient')).toHaveLength(7);
    expect(CREW.filter(c=>c.kind==='ambient'&&!c.support).map(c=>[c.x,c.z])).toEqual([[-4.65,3.45],[4.65,-2.4],[-4.8,-.1]]);
    expect(CREW.find(c=>c.role==='FRONT_JACK')).toMatchObject({x:0,z:-4.78});expect(CREW.find(c=>c.role==='REAR_JACK')).toMatchObject({x:0,z:4.03});
  });
  it('restores nose helpers close to V8 while placing middle bodies clear of the sidepods',()=>{
    for(const c of CREW.filter(c=>c.support==='nose')){expect(Math.abs(Math.abs(c.x)-1.62)).toBeLessThan(.2);expect(Math.abs(c.z+3.2)).toBeLessThan(.3);}
    for(const c of CREW.filter(c=>c.support==='sidepod')){
      expect(Math.abs(c.x)).toBeLessThan(1.5);expect(Math.abs(c.x)).toBeGreaterThan(1.2);
      expect(supportHandAnchors(c)).toHaveLength(2);
      for(const lift of [0,.135,.27])for(const [x,y,z]of supportHandAnchors(c,lift)){
        // A glove rests outside the original yawed sidepod face, rather than
        // using the old fixed .9m centre that buried it inside the bodywork.
        const innerGloveX=Math.abs(x)-.09;
        const sidepodLocalX=Math.cos(.08)*(innerGloveX-.61)+Math.sin(.08)*(z-.52);
        expect(sidepodLocalX).toBeCloseTo(.285);
        expect(Math.sign(x)).toBe(Math.sign(c.x));
        expect(Math.abs(x)).toBeLessThan(Math.abs(c.x));
        expect(Math.hypot(x-c.x,y-1.03,z-c.z)).toBeLessThan(.65);
        expect(y).toBeCloseTo(.71+lift);expect(Math.abs(z-c.z)).toBeCloseTo(.21);
      }
    }
    expect(CAR_BODY_FOOTPRINTS.length).toBeGreaterThan(4);expect(clearsCarEnvelope(.84,.19)).toBe(false);expect(supportCrewClear()).toBe(true);
  });
  it('clears the whole exit path only after support retreat, with body contacts separate from hand anchors',()=>{
    for(let carZ=0;carZ>=-28;carZ-=.1)expect(supportCrewClear(carZ,1)).toBe(true);
    expect(supportCrewClear(-1,0)).toBe(false);
  });
});

describe('shared recorded presentation clock',()=>{
  it('retains every actual task event and runs independent wheel branches concurrently',()=>{
    const round=recorded();const before=structuredClone(round);const timeline=new TaskAnimationTimeline();timeline.ingestRecorded(round);
    expect(new Set(timeline.activeTaskIds(10_450))).toEqual(new Set(['FRONT_LIFT','REAR_LIFT']));
    expect(new Set(timeline.activeTaskIds(10_850))).toEqual(new Set(['FL_GUN_LOOSEN','FR_GUN_LOOSEN','RL_GUN_LOOSEN','RR_GUN_LOOSEN']));
    for(const task of round.tasks){const r=timeline.receipt(task.id)!;expect(r.startsAt).toBeGreaterThanOrEqual(task.completedAt!);for(const id of task.dependencies)expect(r.startsAt).toBeGreaterThanOrEqual(timeline.receipt(id)!.endsAt);}
    expect(round).toEqual(before);
  });
  it('seeks backwards to the same intermediate pose without ghost events or scene re-creation',()=>{
    const round=recorded();const timeline=new TaskAnimationTimeline();timeline.ingestRecorded(round);
    const wheelOn=timeline.receipt('FL_WHEEL_ON')!;const seekAt=wheelOn.startsAt+(wheelOn.endsAt-wheelOn.startsAt)*.375;
    const phase=timeline.phase('FL_WHEEL_ON',seekAt);const active=timeline.activeTaskIds(seekAt);expect(phase).toBeCloseTo(.375);
    timeline.activeTaskIds(99_000);timeline.ingestRecorded(structuredClone(round));
    expect(timeline.phase('FL_WHEEL_ON',seekAt)).toBe(phase);expect(timeline.activeTaskIds(seekAt)).toEqual(active);
    expect(timeline.isDone('GREEN_RELEASE',11_750)).toBe(false);expect(timeline.isDone('GREEN_RELEASE',99_000)).toBe(true);
  });
  it('keeps rapid task visuals causal and retreats before departure while official results remain unchanged',()=>{
    const round=recorded(1);const official=round.elapsedMs;const timeline=new TaskAnimationTimeline();timeline.ingestRecorded(round);
    for(const task of round.tasks){const r=timeline.receipt(task.id)!;expect(r.endsAt-r.startsAt).toBeGreaterThanOrEqual(120);}
    const lowers=['FRONT_LOWER','REAR_LOWER'].map(id=>timeline.receipt(id));const release=timeline.receipt('GREEN_RELEASE');
    for(let now=10_000;now<16_000;now+=10){const pose=departurePose(lowers,release,now);if(pose.drive>0)expect(pose.retreat).toBe(1);}
    expect(departurePose(lowers,release,round.finishedAt!+6_500).drive).toBe(1);expect(round.elapsedMs).toBe(official);
  });
});
