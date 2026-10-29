# V10.3 public game/API contract

The 15-role/21-task authority and existing commands are preserved. V10 adds recorded round identity, replay reads, and consistent result cleanup.

Role = FRONT_JACK | REAR_JACK | RELEASE_CONTROLLER | `${FL|FR|RL|RR}_${GUNNER|WHEEL_OFF|WHEEL_ON}`.

Player: {id:string,nickname:string,role:Role,ready:boolean,joinedAt:number,connected?:boolean}. Public opaque ID, NEVER auth user ID.
Task: {id:string,role:Role,cohort:string,dependencies:string[],ownerId:string|null,status:'LOCKED'|'AVAILABLE'|'DONE',enabledAt:number|null,completedAt:number|null,baselineMeanMs:number|null,dueAt:number|null,reason?:string|null}.
Task IDs: FRONT_LIFT, REAR_LIFT, FL_GUN_LOOSEN, FL_WHEEL_OFF, FL_WHEEL_ON, FL_GUN_TIGHTEN (same for FR/RL/RR), FRONT_LOWER, REAR_LOWER, GREEN_RELEASE. 21 tasks.
Round: {id:string,players?:Player[],status:'COUNTDOWN'|'RUNNING'|'COMPLETED'|'ABANDONED',goAt:number,finishedAt:number|null,elapsedMs:number|null,tasks:Task[],samples:{taskId:string,ms:number,at:number}[],events:{taskId:string,at:number,reason:string,enabledAt?:number|null,ownerId?:string|null,nickname?:string|null,role?:Role}[],penalties?:Record<playerId,{until:number,at:number}>}. players is the immutable round-start roster. New events carry actual unlock time and round-time ownership; optional fields permit older fixtures/clients.
Room: {id:string,teamId:string,name:string,color:string,code:string,hostId:string,status:'WAITING'|'COUNTDOWN'|'RUNNING'|'COMPLETED'|'CLOSED',players:Player[],round:Round|null,updatedAt:number}.
Result: {id:string,roundId:string,teamId:string,elapsedMs:number,finishedAt:number}.
LeaderboardEntry: {teamId:string,name:string,color:string,rounds:Result[],averageMs:number,bestMs:number}.
ReplaySummary: {roundId:string,teamId:string,teamName:string,color:string,elapsedMs:number,finishedAt:number}.
ReplayRecord: {roundId:string,teamId:string,teamName:string,color:string,players:Player[],round:Round,solo?:boolean}.
Snapshot: {rooms:Room[],leaderboard:LeaderboardEntry[],replays?:ReplaySummary[],serverNow:number,identity:{playerId:string|null,isAdmin:boolean}}.

`public.pit_call(p_op text,p_room uuid default null,p_payload jsonb default '{}') returns jsonb` and `public.pit_state()` return Snapshot. Commands: create {name,nickname,color}; join {nickname}; ready {ready}; start {}; action {taskId,requestId}; early_action {taskId,requestId}; kick {playerId}; leave {}; replay {}; heartbeat {}; admin_delete {teamId?,resultId?,confirm:'DELETE'}.

`replay` is the legacy host command for **Play again** (return to lobby); it does not play a recording. `public.pit_replay(p_round uuid)` / `api.getReplay(roundId)` read a ReplayRecord for a retained completed result. This public, read-only RPC needs neither authentication nor a seat. Active, abandoned, and deleted rounds are not replay-readable. Snapshot.replays indexes retained recordings, including teams that have returned to the lobby or closed their room.

Step Time is `completedAt - enabledAt`; Team Time is `completedAt - goAt`. Both use actual authoritative event times. In particular, a synchronized bot's actual Step Time can be shorter than baselineMeanMs. An unknown legacy timestamp stays unknown. Migration 004 backfills old names from retained members; it cannot reconstruct names changed before upgrade. New round names, roles, team name and color are frozen at creation.

Public heartbeat reconciles every active room and refreshes caller membership if p_room matches. Never accept client timestamps. An early_action received after its task unlocks succeeds through the ordinary validated action path. A genuinely early input creates an individual 2,000ms lock, with retries during that lock ignored. On create/join, identity.playerId is the public opaque member ID. Playing requires anonymous Supabase Auth; spectators do not require Auth or membership. Private helpers/tables remain owner-only.

The safe `public.pit_public_state` invalidation row is updated in the same transaction as commands. Authorized result deletion removes the selected result, associated recorded round/tasks/events/samples/request/penalty data, and a current completed-room pointer; that room returns to WAITING with Ready reset. Unrelated rounds, teams and audit entries remain. Public replay reads cannot revive deleted results.

Solo replays are in memory and unranked. Browser practice replays use localStorage. Local testing admin / 1234 controls only unconfigured practice data, with an in-memory session; it never calls Supabase or grants public destructive access. Configured online admin always uses an allowlisted Supabase Auth account with a private password of at least 12 characters.

