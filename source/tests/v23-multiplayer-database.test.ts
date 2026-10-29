import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type { PGlite } from '@electric-sql/pglite';
import { createDatabase, clearDatabase, rpc, owner, literal, userId } from './helpers/database';
import type { Room, Snapshot, Round } from '../src/types';

let db: PGlite;
const roundState = async (id: string) => (await owner<{ round: Round }>(db,`SELECT pit_private.round_snapshot(${literal(id)}::uuid) AS round`))[0].round;

describe('V23 actual Supabase SQL timing and role assignment', () => {
  beforeAll(async () => { db = await createDatabase(); }, 30000);
  beforeEach(async () => { await clearDatabase(db); });
  afterAll(async () => { await db?.close(); });
  it('chooses Jack then Gunner on join; first Gunner synchronizes bot loosen and sets Jack+Gunner mean', async () => {
    let snapshot = await rpc<Snapshot>(db,userId(1),'create',null,{name:'Jacks and Gunners',nickname:'Jack'});
    const roomId=snapshot.rooms[0].id;
    snapshot=await rpc<Snapshot>(db,userId(2),'join',roomId,{nickname:'Gunner'});
    expect(['FRONT_JACK','REAR_JACK']).toContain(snapshot.rooms[0].players[0].role);
    expect(snapshot.rooms[0].players[1].role.endsWith('_GUNNER')).toBe(true);
    for (let i=3;i<=4;i++) snapshot=await rpc<Snapshot>(db,userId(i),'join',roomId,{nickname:`Person ${i}`});
    const room=snapshot.rooms.find(r=>r.id===roomId)!;
    expect(new Set(room.players.map(p=>p.role)).size).toBe(4);
    const jack=room.players[0],gunner=room.players[1];
    for (let i=1;i<=4;i++) await rpc(db,userId(i),'ready',roomId,{ready:true});
    snapshot=await rpc<Snapshot>(db,userId(1),'start',roomId);
    const started=snapshot.rooms.find(r=>r.id===roomId)! as Room;
    const roundId=started.round!.id,go=started.round!.goAt;
    await owner(db,`SELECT pit_private.apply_action(${literal(roundId)}::uuid,${literal(jack.id)}::uuid,${literal(jack.role==='FRONT_JACK'?'FRONT_LIFT':'REAR_LIFT')},${go+400},'jack')`);
    await owner(db,`SELECT pit_private.reconcile_round(${literal(roundId)}::uuid,${go+2399})`);
    let actual=await roundState(roundId);
    expect(actual.tasks.filter(t=>t.cohort==='GUN_LOOSEN' && t.ownerId===null).every(t=>t.dueAt===null && t.completedAt===null)).toBe(true);
    const gunTask=actual.tasks.find(t=>t.cohort==='GUN_LOOSEN' && t.ownerId===gunner.id)!;
    await owner(db,`SELECT pit_private.apply_action(${literal(roundId)}::uuid,${literal(gunner.id)}::uuid,${literal(gunTask.id)},${go+2400},'gunner')`);
    actual=await roundState(roundId);
    expect(actual.samples.map(s=>s.ms)).toEqual([400,2000]);
    const bots=actual.tasks.filter(t=>t.cohort==='GUN_LOOSEN' && t.ownerId===null);
    expect(bots).toHaveLength(3);
    for(const bot of bots){ expect(bot.completedAt).toBe(go+2400);expect(bot.reason).toBe('OPENING_GUNNER_SYNC'); }
    const nextBot=actual.tasks.find(t=>t.cohort==='WHEEL_OFF' && t.ownerId===null && t.enabledAt===go+2400);
    expect(nextBot?.baselineMeanMs).toBe(1200);
  });
});
