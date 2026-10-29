import {describe,it,expect} from 'vitest';
import {LiveSceneAudio} from '../src/scene/liveAudio';
import {TaskAnimationTimeline,type AnimationReceipt} from '../src/scene/animation';
import {createSoloRound,reconcile,submitAction} from '../src/engine';
const cue=(taskId:string,startsAt:number,endsAt=startsAt+500):AnimationReceipt=>({roundId:'r',taskId,startsAt,endsAt});
describe('Live sound follows visible animation',()=>{
 it('waits for a queued fast human action instead of playing on its official completion',()=>{
  const round=createSoloRound([{id:'you',role:'FL_WHEEL_ON',nickname:'You',ready:true,joinedAt:0}],1000,'r');
  reconcile(round,3100);submitAction(round,'you','FL_WHEEL_ON',3120,'fast');
  const timeline=new TaskAnimationTimeline();timeline.ingestRecorded(round);
  const receipt=timeline.receipt('FL_WHEEL_ON')!;
  expect(receipt.startsAt).toBeGreaterThan(3120);
  const queue=new LiveSceneAudio();queue.poll('r',900,[]);
  expect(queue.poll('r',3120,timeline.allReceipts())).not.toContain('FL_WHEEL_ON');
  expect(queue.poll('r',receipt.startsAt-1,timeline.allReceipts())).not.toContain('FL_WHEEL_ON');
  expect(queue.poll('r',receipt.startsAt,timeline.allReceipts())).toContain('FL_WHEEL_ON');
  expect(queue.poll('r',receipt.startsAt+16,timeline.allReceipts())).not.toContain('FL_WHEEL_ON');
 });
 it('plays scheduled bot work when it is actually shown, before any DONE acknowledgement is required',()=>{
  const queue=new LiveSceneAudio();queue.poll('r',100,[]);
  expect(queue.poll('r',499,[cue('FL_GUN_LOOSEN',500)])).toEqual([]);
  expect(queue.poll('r',500,[cue('FL_GUN_LOOSEN',500)])).toEqual(['FL_GUN_LOOSEN']);
 });
 it('does not repeat a cue for duplicate snapshots or a rescheduled receipt',()=>{
  const queue=new LiveSceneAudio();queue.poll('r',0,[]);
  expect(queue.poll('r',100,[cue('FRONT_LIFT',100)])).toEqual(['FRONT_LIFT']);
  expect(queue.poll('r',200,[cue('FRONT_LIFT',200)])).toEqual([]);
 });
 it('joins an existing round quietly and only plays future starts',()=>{
  const queue=new LiveSceneAudio();const cues=[cue('FRONT_LIFT',100,900),cue('FL_GUN_LOOSEN',1100)];
  expect(queue.poll('r',500,cues)).toEqual([]);
  expect(queue.poll('r',1100,cues)).toEqual(['FL_GUN_LOOSEN']);
 });
 it('does not burst old work after a hidden tab or delayed snapshot',()=>{
  const queue=new LiveSceneAudio();queue.poll('r',0,[]);
  expect(queue.poll('r',5000,[cue('old',100,5100),cue('expired',4900,4950),cue('visible',4990,5500)])).toEqual(['visible']);
 });
 it('consumes muted/detached work without replaying it when sound returns',()=>{
  const queue=new LiveSceneAudio();queue.poll('r',0,[]);
  queue.poll('r',100,[cue('FRONT_LIFT',100)]); // caller is muted; no audio output
  expect(queue.poll('r',150,[cue('FRONT_LIFT',100)])).toEqual([]);
  expect(queue.poll('r',200,[cue('FL_GUN_LOOSEN',200)])).toEqual(['FL_GUN_LOOSEN']);
 });
 it('resets identity for a new round and settles reverse seeks without old effects',()=>{
  const queue=new LiveSceneAudio();queue.poll('r',0,[]);queue.poll('r',100,[cue('FRONT_LIFT',100)]);
  queue.poll('new',0,[]);expect(queue.poll('new',100,[cue('FRONT_LIFT',100)])).toEqual(['FRONT_LIFT']);
  expect(queue.poll('new',50,[cue('FRONT_LIFT',100)])).toEqual([]);
 });
 it('preserves same-frame parallel work, without changing round data',()=>{
  const cues=[cue('RR_GUN_LOOSEN',100),cue('FL_GUN_LOOSEN',100)],before=structuredClone(cues);
  const queue=new LiveSceneAudio();queue.poll('r',0,[]);
  expect(queue.poll('r',100,cues)).toEqual(['FL_GUN_LOOSEN','RR_GUN_LOOSEN']);expect(cues).toEqual(before);
 });
});
