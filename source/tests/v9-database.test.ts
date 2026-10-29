import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import type { PGlite } from '@electric-sql/pglite';
import type { Snapshot } from '../src/types';
import { createDatabase, literal, owner, rpc, userId } from './helpers/database';
let db:PGlite;
const call=(n:number,op:string,id:string|null=null,payload:Record<string,unknown>={})=>rpc<Snapshot>(db,userId(n),op,id,payload);
beforeAll(async()=>{db=await createDatabase('tests/fixtures/v8-schema.sql');},30000);afterAll(async()=>{await db?.close();});
let roomId:string;let ids:string[];let goAt:number;
describe('V8 → V9 production PostgreSQL penalty and admin upgrade',()=>{
 it('applies twice, keeps historical results and role/Ready stability, exposes no private request tokens',async()=>{
  const before=await call(1,'create',null,{name:'V9 Crew',nickname:'Player 1'});roomId=before.rooms[0].id;
  await owner(db,`WITH r AS(INSERT INTO pit_private.rounds(room_id,status,go_at,finished_at,elapsed_ms) VALUES('${roomId}','COMPLETED',1000,3250,2250) RETURNING id) INSERT INTO pit_private.results(round_id,team_id,elapsed_ms,finished_at) SELECT r.id,rooms.team_id,2250,3250 FROM r,pit_private.rooms rooms WHERE rooms.id='${roomId}'`);
  const sql=await readFile('supabase/003_v9_early_tap_penalty.sql','utf8');await owner(db,sql);await owner(db,sql);
  const after=await rpc<Snapshot>(db,null,null);expect(after.leaderboard[0].rounds[0].elapsedMs).toBe(2250);expect(after.rooms[0].players[0].role).toBe(before.rooms[0].players[0].role);
  for(let n=2;n<=4;n++)await call(n,'join',roomId,{nickname:`Player ${n}`});
  await owner(db,`UPDATE pit_private.members SET role=CASE nickname WHEN 'Player 1' THEN 'FRONT_JACK' WHEN 'Player 2' THEN 'REAR_JACK' WHEN 'Player 3' THEN 'FL_GUNNER' ELSE 'RELEASE_CONTROLLER' END WHERE room_id='${roomId}'`);
  for(let n=1;n<=4;n++)await call(n,'ready',roomId,{ready:true});
  const started=await call(1,'start',roomId);ids=Array.from({length:4},(_,i)=>started.rooms[0].players.find(p=>p.nickname===`Player ${i+1}`)!.id);goAt=started.rooms[0].round!.goAt;
 });
 it('uses actual server time, persists countdown penalty at GO+2000, and ignores duplicate/repeated attempts',async()=>{
  const a=await call(1,'early_action',roomId,{taskId:'FRONT_LIFT',requestId:'countdown',playerId:ids[1],now:0,penalty_until:0});
  expect(a.rooms[0].round!.penalties?.[ids[0]].until).toBe(goAt+2000);expect(a.rooms[0].round!.penalties?.[ids[0]].at).toBeGreaterThan(0);expect(a.rooms[0].round!.penalties?.[ids[1]]).toBeUndefined();
  const b=await call(1,'early_action',roomId,{taskId:'FRONT_LIFT',requestId:'countdown'});await call(1,'early_action',roomId,{taskId:'FRONT_LIFT',requestId:'ignored'});
  expect(b.rooms[0].round!.penalties?.[ids[0]].until).toBe(goAt+2000);const reconnect=await rpc<Snapshot>(db,userId(1),null);expect(reconnect.rooms[0].round!.penalties?.[ids[0]].until).toBe(goAt+2000);
  expect(JSON.stringify(reconnect)).not.toContain('countdown"');expect(JSON.stringify(reconnect)).not.toContain('ignored');
 });
 it('rejects forged ownership, arbitrary roles and client direct-table updates',async()=>{
  await expect(call(2,'early_action',roomId,{taskId:'FRONT_LIFT',requestId:'spoof'})).rejects.toThrow('another role');
  await expect(call(1,'early_action',roomId,{taskId:'FRONT_LOWER',requestId:'countdown'})).rejects.toThrow('different early action');
  await expect(rpc(db,null,'early_action',roomId,{taskId:'FRONT_LIFT',requestId:'anon'})).rejects.toThrow('Sign in');
  await expect(db.exec(`SET ROLE authenticated; SELECT * FROM pit_private.penalties;`)).rejects.toThrow();
  await owner(db,'SELECT 1');
 });
 it('blocks direct accepted-action RPC while a locked task becomes available, without delaying the other human',async()=>{
  // Trusted fixture advances this countdown and clears only the earlier test's lock.
  await owner(db,`UPDATE pit_private.rounds SET go_at=pit_private.clock_ms()-100 WHERE id=(SELECT current_round_id FROM pit_private.rooms WHERE id='${roomId}');DELETE FROM pit_private.penalties;`);
  const early=await call(3,'early_action',roomId,{taskId:'FL_GUN_LOOSEN',requestId:'locked'});const p=early.rooms[0].round!.penalties![ids[2]];expect(p.until-p.at).toBe(2000);
  await call(1,'action',roomId,{taskId:'FRONT_LIFT',requestId:'lift'});await call(2,'action',roomId,{taskId:'REAR_LIFT',requestId:'rear'});
  await expect(call(3,'action',roomId,{taskId:'FL_GUN_LOOSEN',requestId:'gun',penalty_until:0,now:p.until+9999})).rejects.toThrow('lockout');
  const retried=await call(3,'early_action',roomId,{taskId:'FL_GUN_LOOSEN',requestId:'locked'});expect(retried.rooms[0].round!.penalties![ids[2]].until).toBe(p.until);
  await new Promise(resolve=>setTimeout(resolve,2050));
  const accepted=await call(3,'action',roomId,{taskId:'FL_GUN_LOOSEN',requestId:'gun'});expect(accepted.rooms[0].round!.tasks.find(t=>t.id==='FL_GUN_LOOSEN')!.completedAt).toBeGreaterThanOrEqual(p.until);
  const again=await call(3,'action',roomId,{taskId:'FL_GUN_LOOSEN',requestId:'gun'});expect(again.rooms[0].round!.events.filter(e=>e.taskId==='FL_GUN_LOOSEN')).toHaveLength(1);
 });
 it('resolves only owner-configured allowlisted usernames and cannot grant admin rights',async()=>{
  await owner(db,`INSERT INTO auth.users(id,email) VALUES('${userId(99)}','admin-fixture@example.test');INSERT INTO pit_private.admins(user_id) VALUES('${userId(99)}');INSERT INTO pit_private.admin_aliases(username,user_id) VALUES('admin','${userId(99)}');`);
  const resolved=await db.exec(`SET ROLE anon; SELECT public.pit_admin_login_identity('ADMIN') AS identity;`);
  expect((resolved.at(-1)!.rows[0] as {identity:{email:string}}).identity.email).toBe('admin-fixture@example.test');
  await expect(db.exec(`SELECT public.pit_admin_login_identity('unknown')`)).rejects.toThrow('not configured');
  await expect(db.exec(`INSERT INTO pit_private.admin_aliases(username,user_id) VALUES('mine',${literal(userId(1))})`)).rejects.toThrow();
  expect((await rpc<Snapshot>(db,userId(1),null)).identity.isAdmin).toBe(false);
 });
});
