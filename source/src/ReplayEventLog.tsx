import { useEffect, useMemo, useRef, useState } from 'react';
import { taskLabel, type Player, type Room, type Round } from './types';
import { WORKFLOW_GROUPS } from './workflow';
import { Check, LockKeyhole, Zap } from 'lucide-react';
import { currentReplayEvent, eventSeconds, replayEvents, type ReplayEvent } from './replay';
import './v10-replay.css';

export function EventChip({ event, waiting = 'Waiting for the first task' }: { event: ReplayEvent | null; waiting?: string }) {
  return <div className="replay-event-chip" data-task-id={event?.taskId ?? ''}>
    {event ? <><strong title={event.task}>{event.task}</strong><span title={`${event.by} · ${event.role}`}>{event.by} <small>· {event.role}</small></span><span className="event-chip-times"><b>{eventSeconds(event.stepMs)}</b> step <i>·</i> <b>{eventSeconds(event.teamMs)}</b> team</span></> : <span>{waiting}</span>}
  </div>;
}

export function EventLog({ round, players, cursor }: { round: Round; players: Player[]; cursor?: number }) {
  const events = useMemo(() => replayEvents(round, players), [round, players]);
  return <div className="replay-event-table-wrap">
    <p className="event-log-help">Step Time: unlock to completion, including any lockout delay. Bot times reflect actual synchronized completion. Team Time: elapsed since GO. Missing historical timings are marked “Not recorded”.</p>
    <table className="replay-event-table"><thead><tr><th scope="col">Task</th><th scope="col">By</th><th scope="col">Step Time</th><th scope="col">Team Time</th></tr></thead>
      <tbody>{events.map(event => <tr key={event.taskId} data-task-id={event.taskId} className={cursor !== undefined && event.at > cursor ? 'event-future' : ''}><td>{event.task}</td><td><strong>{event.by}</strong><small>{event.role}</small></td><td>{eventSeconds(event.stepMs)}</td><td>{eventSeconds(event.teamMs)}</td></tr>)}</tbody>
    </table>
    {!events.length && <p className="event-log-empty">No completed tasks yet.</p>}
  </div>;
}

/** A real 21-task workflow shown together with the Event Log in every context.
 * For replay, the view follows the replay cursor. For live, it uses the room's
 * authoritative task states. Old rounds retain their original task graph. */
export function EventLogWorkflow({round,players,cursor}:{round:Round;players:Player[];cursor?:number}) {
  const byId=new Map(round.tasks.map(task=>[task.id,task]));
  const byPlayer=new Map(players.map(player=>[player.id,player]));
  const currentState=(id:string) => {
    const task=byId.get(id);
    if (!task) return 'LOCKED';
    if (cursor===undefined) return task.status;
    if (task.completedAt!==null && task.completedAt<=cursor) return 'DONE';
    if (task.enabledAt!==null && task.enabledAt<=cursor) return 'AVAILABLE';
    return 'LOCKED';
  };
  const done=round.tasks.filter(task=>currentState(task.id)==='DONE').length;
  return <section className="event-workflow" aria-label="Detailed workflow and task ownership">
    <header className="event-workflow-heading"><strong>Detailed Workflow</strong><span>{done}/21</span></header>
    <div className="event-workflow-progress"><span style={{width:`${done/21*100}%`}} /></div>
    <div className="event-workflow-scroll">
    {[...WORKFLOW_GROUPS].sort((a,b)=>{
      const rank = (key:string) => ({LIFT:0,LOOSEN:1,REMOVE:2,FIT:3,TIGHTEN:4,LOWER:5,RELEASE:6} as Record<string,number>)[key] ?? 99;
      const oldRound = byId.get('FRONT_LIFT')?.dependencies.length !== 0;
      const order = oldRound ? ({LOOSEN:0,LIFT:1,REMOVE:2,FIT:3,LOWER:4,TIGHTEN:5,RELEASE:6} as Record<string,number>) : null;
      return (order ? order[a.key] - order[b.key] : rank(a.key)-rank(b.key));
    }).map(group=><section key={group.key} className="event-workflow-group" aria-label={group.label}>
      <h3>{group.label}<small>{group.parts.filter(([id])=>currentState(id)==='DONE').length}/{group.parts.length}</small></h3>
      <div className="event-workflow-tasks">{group.parts.map(([id,short])=>{
        const task=byId.get(id);if(!task)return null;
        const status=currentState(id);
        const who=task.ownerId?byPlayer.get(task.ownerId)?.nickname??'Crew member':'Bot';
        return <div key={id} className={`event-workflow-task ${status.toLowerCase()}`} title={`${taskLabel(task)} · ${who} · ${status}`}>
          <span className="event-workflow-icon">{status==='DONE'?<Check size={11} strokeWidth={3}/>:status==='AVAILABLE'?<Zap size={11}/>:<LockKeyhole size={10}/>}</span>
          <div className="event-workflow-task-text"><strong>{short==='Release'?'Release':short}</strong><small>{who}</small></div>
        </div>;
      })}</div>
    </section>)}
    </div>
  </section>;
}

export function EventLogDrawer({ round, players, cursor, onClose, teamName, live=false }: { round: Round; players: Player[]; cursor?: number; onClose: () => void; teamName?:string; live?:boolean }) {
  const panel = useRef<HTMLElement>(null);
  const close = useRef(onClose);close.current=onClose;
  useEffect(() => {
    const prior=document.activeElement as HTMLElement|null;
    panel.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const dismiss = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); close.current(); } };
    window.addEventListener('keydown', dismiss, true);
    return () => { window.removeEventListener('keydown', dismiss, true); prior?.focus(); };
  }, []);
  return <div className="replay-log-backdrop">
    <section ref={panel} className="replay-log-drawer" role="dialog" aria-modal="false" aria-label={`Detailed workflow and Event Log${teamName?` — ${teamName}`:''}`} data-live={live}>
      <header><div><strong>Event Log</strong>{teamName && <small>{teamName}{live?' · LIVE':''}</small>}</div><button type="button" className="event-log-exit-control" onClick={onClose} aria-label="Close Event Log">Close</button></header>
      <div className="event-log-combined"><EventLogWorkflow round={round} players={players} cursor={cursor}/><EventLog round={round} players={players} cursor={cursor} /></div>
    </section>
  </div>;
}

/** Watch details reuse the same event semantics as replay, with the full table closed by default. */
export function LiveEventStrip({ room, now }: { room: Room; now?: number }) {
  const [open, setOpen] = useState(false);
  const events = useMemo(() => room.round ? replayEvents(room.round, room.players) : [], [room.round, room.players]);
  const latest = currentReplayEvent(events, now ?? Number.POSITIVE_INFINITY);
  return <>
    <div className="live-event-strip"><EventChip event={latest} waiting={room.status === 'COUNTDOWN' ? 'Wait for GO signal' : 'Waiting for the first task'} /><button type="button" onClick={() => setOpen(true)} aria-expanded={open}>Event Log</button></div>
    {open && room.round && <EventLogDrawer round={room.round} players={room.players} teamName={room.name} live={room.status==='RUNNING' || room.status==='COUNTDOWN'} onClose={() => setOpen(false)} />}
  </>;
}
