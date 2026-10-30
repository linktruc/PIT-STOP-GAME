import {describe,it,expect} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {PlayerCameraRig} from '../src/scene/playerCamera';
import {nextSyncDelay} from '../src/syncPolicy';
import {roomNotices} from '../src/roomNotices';
import HostControlNote from '../src/HostControlNote';
import {createSoloRound} from '../src/engine';
import type {Room,Snapshot,Player} from '../src/types';
const player=(id:string,role:Player['role']='FRONT_JACK'):Player=>({id,role,nickname:id,ready:false,joinedAt:0});
const room=(players:Player[]=[player('host'),player('you','FL_GUNNER')]):Room=>({id:'room',teamId:'team',hostId:'host',name:'Test',code:'TEST',color:'#f4493b',status:'WAITING',round:null,players,updatedAt:0});
describe('Unified drag-the-scene free look',()=>{
 it.each([
  ['first-person','mouse'],['first-person','touch'],
  ['third-person','mouse'],['third-person','touch'],
 ] as const)('%s / %s uses drag-scene horizontal axes for every swipe direction',(mode,pointer)=>{
  for(const [dx,dy] of [[100,0],[-100,0],[0,30],[0,-30]]){
   const rig=new PlayerCameraRig(),root={x:0,y:0,z:0},head={x:0,y:1.3,z:0},forward={x:0,y:0,z:-1};
   const a=rig.sample(mode,root,head,forward,0,'you');rig.drag(dx,dy,pointer);
   let b=a;for(let t=16;t<=800;t+=16)b=rig.sample(mode,root,head,forward,t,'you');
   expect(b.yaw-a.yaw).toBeCloseTo(-dx*.005,3);expect(b.pitch-a.pitch).toBeCloseTo(-dy*.005,3);
   rig.turn(.2,0);for(let t=816;t<=1600;t+=16)rig.sample(mode,root,head,forward,t,'you');
   expect(rig.sample(mode,root,head,forward,1616,'you').yaw).toBeGreaterThan(b.yaw+.15);
  }
 });
});
describe('Room feedback',()=>{
 it('announces actual new seats, without replaying initial load, Ready changes or reconnects',()=>{
  const before=room(),after={...before,players:[...before.players,player('New crew','RR_GUNNER')]};
  expect(roomNotices(before,after,'you')).toEqual(['New crew joined your team.']);
  expect(roomNotices(undefined,after,'you')).toEqual([]);expect(roomNotices(after,after,'you')).toEqual([]);
  expect(roomNotices(after,{...after,players:after.players.map(p=>({...p,ready:true,connected:true}))},'you')).toEqual([]);
  expect(roomNotices(before,{...after,solo:true},'you')).toEqual([]);
 });
 it('addresses the new host personally and preserves join and role notices in the same snapshot',()=>{
  const before=room(),after={...before,hostId:'you',players:[{...player('you'),roleNotice:'You are now the front jack.'},player('New crew','RR_GUNNER')]};
  const messages=roomNotices(before,after,'you');expect(messages).toHaveLength(3);
  expect(messages[0]).toContain('New crew joined');expect(messages[1]).toContain('You are now the host');expect(messages[2]).toBe('You are now the front jack.');
  const observer=roomNotices(before,{...after,players:[...after.players,player('host','REAR_JACK')]},'host');expect(observer.join(' ')).toContain('you is now the host.');
 });
 it('shows host/guest permission text in Ready and Play again contexts',()=>{
  for(const stage of ['ready','replay'] as const){expect(renderToStaticMarkup(<HostControlNote host stage={stage}/>)).toContain('You are the host.');expect(renderToStaticMarkup(<HostControlNote host={false} stage={stage}/>)).toContain(stage==='ready'?'Only the host can start the round.':'Only the host can choose Play again.');}
 });
 it('refreshes within a short lockout if Realtime is down, retaining healthy/hidden Solo timing policy',()=>{
  const r=room();r.status='RUNNING';r.round=createSoloRound(r.players,1000,'round');
  const s:Snapshot={rooms:[r],leaderboard:[],identity:{playerId:'you',isAdmin:false},serverNow:1500};
  expect(nextSyncDelay(s,false,1500,0,()=>1,false)).toBeLessThanOrEqual(800);
  expect(nextSyncDelay(s,false,1500,0,()=>1,true)).toBe(1200);
  s.identity.playerId='host';expect(nextSyncDelay(s,false,1500,0,()=>1,false)).toBeLessThanOrEqual(800);
  expect(nextSyncDelay(s,false,1500,2,()=>1,false)).toBeGreaterThan(2000);
  s.identity.playerId='you';r.solo=true;expect(nextSyncDelay(s,false,1500,0,()=>1,false)).toBe(2900);
 });
});
