import {afterAll,beforeAll,beforeEach,describe,it,expect} from 'vitest';
import type {PGlite} from '@electric-sql/pglite';
import {readFile} from 'node:fs/promises';
import {createDatabase,clearDatabase,rpc,owner,userId} from './helpers/database';
import type {Snapshot} from '../src/types';
let db:PGlite;
const call=(n:number,op:string,id:string|null=null,payload:Record<string,unknown>={})=>rpc<Snapshot>(db,userId(n),op,id,payload);
async function room(){return (await call(1,'create',null,{name:'Offline test',nickname:'Host'})).rooms[0];}
describe('V24.12 server-enforced offline expiry',()=>{
 beforeAll(async()=>{db=await createDatabase();},30000);
 beforeEach(()=>clearDatabase(db));afterAll(async()=>{await db?.close();});
 it('retains a seat before five minutes and expires it exactly at the boundary',async()=>{
  const r=await room();await owner(db,`update pit_private.members set last_seen_at=1000;select pit_private.expire_offline_members(300999);`);
  expect((await owner(db,'select active from pit_private.members'))[0].active).toBe(true);
  await owner(db,'select pit_private.expire_offline_members(301000)');
  expect((await owner(db,`select status,host_id from pit_private.rooms where id='${r.id}'`))[0]).toMatchObject({status:'CLOSED',host_id:null});
 });
 it('expires an offline host, transfers ownership, and cannot revive the old seat by heartbeat',async()=>{
  const r=await room();const joined=await call(2,'join',r.id,{nickname:'Active guest'}),guest=joined.rooms[0].players.find(p=>p.nickname==='Active guest')!;
  await owner(db,`update pit_private.members set last_seen_at=pit_private.clock_ms()-300001 where user_id='${userId(1)}'`);
  const result=await call(1,'heartbeat',r.id);
  expect(result.identity.playerId).toBeNull();expect(result.rooms[0].hostId).toBe(guest.id);expect(result.rooms[0].players.map(p=>p.id)).toEqual([guest.id]);
 });
 it('cleans unattended rooms and publishes the removal; migration is repeatable and preserves results',async()=>{
  const r=await room();await owner(db,`with rd as(insert into pit_private.rounds(room_id,status,go_at,finished_at,elapsed_ms) values('${r.id}','COMPLETED',1000,3000,2000) returning id) insert into pit_private.results(round_id,team_id,elapsed_ms,finished_at) select rd.id,'${r.teamId}',2000,3000 from rd;update pit_private.members set last_seen_at=0;`);
  const migration=await readFile('supabase/V24_12_OFFLINE_CLEANUP.sql','utf8');await owner(db,migration);await owner(db,migration);
  expect((await owner(db,"select state->'rooms' as rooms from public.pit_public_state where id='global'"))[0].rooms).toEqual([]);
  expect((await rpc<Snapshot>(db,null,null)).leaderboard[0].rounds[0].elapsedMs).toBe(2000);
  expect((await owner(db,"select has_function_privilege('anon','pit_private.cleanup_presence()','EXECUTE') as allowed"))[0].allowed).toBe(false);
 });
 it('handles stale members during a running round using existing leave/reset rules',async()=>{
  const r=await room();for(let n=2;n<=4;n++)await call(n,'join',r.id,{nickname:`Guest ${n}`});
  for(let n=1;n<=4;n++)await call(n,'ready',r.id,{ready:true});const started=await call(1,'start',r.id),round=started.rooms[0].round!;
  await owner(db,`update pit_private.rooms set status='RUNNING' where id='${r.id}';update pit_private.rounds set status='RUNNING' where id='${round.id}';update pit_private.members set last_seen_at=0 where user_id='${userId(1)}';select pit_private.cleanup_presence();`);
  const result=await call(2,'heartbeat',r.id);expect(result.rooms[0].status).toBe('WAITING');expect(result.rooms[0].round).toBeNull();expect(result.rooms[0].players).toHaveLength(3);
  expect((await owner(db,`select status from pit_private.rounds where id='${round.id}'`))[0].status).toBe('ABANDONED');
 });
});
