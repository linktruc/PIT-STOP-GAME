import { memo, useMemo } from 'react';
import { eventSeconds, replayEvents } from './replay';
import type { Room } from './types';

/** The same recorded events/timing rules as Watch Live and replay; no new clock. */
export default memo(function DesktopLiveLog({ room }: { room: Room }) {
  const events = useMemo(() => room.round ? replayEvents(room.round, room.players).reverse() : [], [room.round, room.players]);
  return <section className="desktop-live-log" aria-label="Live Event Log" data-round-id={room.round?.id ?? ''} data-event-count={events.length}>
    <header><strong>EVENT LOG</strong><span>{room.status === 'RUNNING' ? 'LIVE' : room.status === 'COMPLETED' ? 'FINAL' : 'AWAITING GO'}</span></header>
    <div className="desktop-event-scroll" role="log" aria-live="off" aria-label="Latest completed tasks first">
      {events.length ? <ol>{events.map(event => <li key={`${room.round!.id}:${event.taskId}`} data-task-id={event.taskId} data-event-at={event.at} title={`${event.task} · ${event.by} · Step Time ${eventSeconds(event.stepMs)} · Team Time ${eventSeconds(event.teamMs)}`}>
        <strong className="desktop-event-task">{event.task}</strong>
        <div className="desktop-event-details">
          <span className="desktop-event-owner"><small>BY</small><b title={`${event.by} · ${event.role}`}>{event.by}</b></span>
          <span><small>STEP</small><time>{eventSeconds(event.stepMs)}</time></span>
          <span><small>TEAM</small><time>{eventSeconds(event.teamMs)}</time></span>
        </div>
      </li>)}</ol> : <p className="desktop-event-empty">{room.status === 'WAITING' || room.status === 'COUNTDOWN' ? 'Completed tasks appear after GO.' : 'Waiting for the first task.'}</p>}
    </div>
  </section>;
});
