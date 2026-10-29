import { describe, expect, it } from 'vitest';
import { createSoloRound, reconcile, submitAction } from '../src/engine';
import { TaskAnimationTimeline, taskPresentationCue } from '../src/scene/animation';
import { CORNER_POSITIONS, CREW, gunnerKneelingPose, gunnerHandoff, wheelCarrierPosition, supportCrewClear, supportHandAnchors } from '../src/scene/crew';

describe('V11 targeted body posing',()=>{
  it('restores the verified V8 nose origins while keeping four support torsos clear',()=>{
    expect(CREW.filter(c=>c.support==='nose').map(c=>[c.x,c.z])).toEqual([[-1.62,-3.2],[1.62,-3.2]]);
    expect(supportCrewClear()).toBe(true);
    for(const lift of [0,.135,.27])for(const c of CREW.filter(c=>c.support)){
      const anchors=supportHandAnchors(c,lift);
      expect(anchors).toHaveLength(2);
      for(const [x,y,z]of anchors){expect(Math.abs(x-c.x)).toBeLessThan(.55);expect(Math.abs(z-c.z)).toBeLessThan(.4);expect(y).toBeGreaterThan(.6);}
      if(c.support==='nose')for(const [,y]of anchors)expect(y-.095-lift).toBeCloseTo(.615);
      if(c.support==='sidepod')for(const [x,,z]of anchors)expect(Math.abs(x)-.09).toBeCloseTo(.61+.285/Math.cos(.08)-Math.tan(.08)*(z-.52));
    }
    for(let z=0;z>=-28;z-=.2)expect(supportCrewClear(z,1)).toBe(true);
  });
  it('plants both boots and one knee, with separate balanced hips and bent knees at every corner',()=>{
    for(const [,x,z]of CORNER_POSITIONS)for(const phase of [0,.25,.5,.75,1]){
      const pose=gunnerKneelingPose(phase);
      expect(pose.torsoY).toBeGreaterThan(-.14);expect(pose.lean).toBeGreaterThan(0);expect(pose.lean).toBeLessThan(.16);
      for(const leg of pose.legs){
        expect(leg.foot[1]-.07).toBeCloseTo(.005);expect(leg.hip[1]).toBe(.46);
        const thigh=Math.hypot(...leg.knee.map((v,i)=>v-leg.hip[i]));
        const shin=Math.hypot(...leg.ankle.map((v,i)=>v-leg.knee[i]));
        expect(thigh).toBeGreaterThan(.3);expect(thigh).toBeLessThan(.41);
        expect(shin).toBeGreaterThan(.25);expect(shin).toBeLessThan(.37);
        // The planted toe remains beyond the tyre sidewall (wheel half-width .215).
        const inwardToe=Math.abs(x)+.83+leg.foot[2]-.155;
        expect(inwardToe).toBeGreaterThan(Math.abs(x)+.215);
        expect(Number.isFinite(z+leg.foot[0])).toBe(true);
      }
      expect(pose.legs[1].knee[1]).toBe(.095);expect(pose.legs[0].knee[2]).toBeLessThan(0);
    }
  });
  it('withdraws after loosen and returns before tighten, without moving the approved carriers',()=>{
    expect(gunnerHandoff(null,false,null,false)).toBe(0);
    expect(gunnerHandoff(.65,false,null,false)).toBe(0);
    expect(gunnerHandoff(1,false,null,false)).toBe(1);
    expect(gunnerHandoff(null,true,null,false)).toBe(1);
    expect(gunnerHandoff(null,true,0,false)).toBe(1);
    expect(gunnerHandoff(null,true,.22,false)).toBe(0);
    expect(gunnerHandoff(null,true,null,true)).toBe(0);
    for(const [corner,x,z]of CORNER_POSITIONS){
      const off=CREW.find(c=>c.role===`${corner}_WHEEL_OFF`)!,on=CREW.find(c=>c.role===`${corner}_WHEEL_ON`)!;
      expect(wheelCarrierPosition('off',off,{x,z},0)).toEqual({x:off.x,z:off.z});
      expect(wheelCarrierPosition('on',on,{x,z},0)).toEqual({x:on.x,z:on.z});
      expect(wheelCarrierPosition('off',off,{x,z},1).x).toBeCloseTo(x+Math.sign(x)*2.19);
      expect(wheelCarrierPosition('on',on,{x,z},1).x).toBeCloseTo(x+Math.sign(x)*1.68);
    }
  });
  it('clears both complete carrier head/body sweeps and the adjacent waiting crew at all four corners',()=>{
    const centres=(x:number,z:number,angle:number,bodyY:number,lean:number)=>[.61,.84,1.03,1.29].map(y=>{
      const localZ=-Math.sin(lean)*y;
      return [x+Math.sin(angle)*localZ,Math.cos(lean)*y+bodyY,z+Math.cos(angle)*localZ];
    });
    for(const [corner,x,z]of CORNER_POSITIONS){
      const gun=CREW.find(c=>c.role===`${corner}_GUNNER`)!,side=Math.sign(x);
      const gunCentres=centres(gun.x+side*1.25,z,gun.angle!,0,-.03);
      for(const kind of ['off','on']as const){
        const carrier=CREW.find(c=>c.role===`${corner}_${kind==='off'?'WHEEL_OFF':'WHEEL_ON'}`)!;
        let closest=Infinity;
        for(let index=0;index<=1000;index++){
          const phase=index/1000,work=Math.sin(phase*Math.PI),position=wheelCarrierPosition(kind,carrier,{x,z},phase);
          const otherCentres=centres(position.x,position.z,carrier.angle!,-.20*work,-(kind==='off'?.33:.28)*work);
          for(const a of gunCentres)for(const b of otherCentres)closest=Math.min(closest,Math.hypot(...a.map((n,i)=>n-b[i])));
        }
        expect(closest).toBeGreaterThan(.48);
      }
      // The gunner's temporary stand is local; no other crew is restaged.
      for(const other of CREW.filter(c=>c!==gun&&!c.role?.startsWith(corner))){
        for(const a of gunCentres)for(const b of centres(other.x,other.z,other.angle??0,0,0))expect(Math.hypot(...a.map((n,i)=>n-b[i]))).toBeGreaterThan(.48);
      }
    }
  });
});

describe('actual Solo event-clock visual waiting',()=>{
  it.each([4000,250])('animates the 700ms Solo gunner interval after a %ims Jack without early completion',delay=>{
    const round=createSoloRound([{id:'you',role:'FRONT_JACK',nickname:'You',ready:true,joinedAt:0}],1000,`cue-${delay}`);
    submitAction(round,'you','FRONT_LIFT',1000+delay,'lift');
    const timeline=new TaskAnimationTimeline();timeline.ingestRecorded(round);
    const bot=round.tasks.find(t=>t.id==='FL_GUN_LOOSEN')!;
    expect(bot.baselineMeanMs).toBe(700);expect(bot.dueAt).toBe(1000+delay+700);
    for(const fraction of [.1,.5,.95]){
      const time=bot.enabledAt!+700*fraction;
      expect(taskPresentationCue(bot,timeline,time).state).toBe('WORK');
      expect(timeline.isDone(bot.id,time)).toBe(false);
      expect(timeline.activeTaskIds(time)).toContain(bot.id);
    }
    reconcile(round,bot.dueAt!);timeline.ingestRecorded(round);
    const receipt=timeline.receipt(bot.id)!;
    expect(receipt.startsAt).toBe(bot.enabledAt!);
    expect(receipt.endsAt).toBe(bot.completedAt!);
    expect(taskPresentationCue(bot,timeline,receipt.startsAt+1).state).toBe('WORK');
    expect(taskPresentationCue(bot,timeline,receipt.endsAt).state).toBe('DONE');
    const signature=JSON.stringify(taskPresentationCue(bot,timeline,receipt.startsAt+20));
    timeline.ingestRecorded(structuredClone(round));timeline.activeTaskIds(999999);
    expect(JSON.stringify(taskPresentationCue(bot,timeline,receipt.startsAt+20))).toBe(signature);
    expect(round.elapsedMs).toBeNull();
  });
});
