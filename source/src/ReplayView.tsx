import { useEffect, useMemo, useRef, useState } from 'react';
import PitScene from './PitScene';
import { playCue, playTaskCue } from './audio';
import { TaskAnimationTimeline } from './scene/animation';
import type { ReplayRecord } from './types';
import { clampReplayTime, currentReplayEvent, replayBounds, replayEvents, replayRoom } from './replay';
import { EventChip, EventLogDrawer } from './ReplayEventLog';
import './v10-replay.css';

export default function ReplayView({ record, onClose, quality = 'high', onToggleAudio, soundEnabled }: { record: ReplayRecord; onClose: () => void; quality?: 'high' | 'low'; onToggleAudio?: () => void; soundEnabled?: boolean }) {
  const room = useMemo(() => replayRoom(record), [record]);
  const bounds = useMemo(() => replayBounds(record.round), [record.round]);
  const events = useMemo(() => replayEvents(record.round, record.players), [record.round, record.players]);
  const audioEvents = useMemo(() => {
    const timeline = new TaskAnimationTimeline();
    timeline.ingestRecorded(record.round);
    return events.map(event => ({ taskId: event.taskId, at: timeline.receipt(event.taskId)?.startsAt ?? event.at }));
  }, [record.round, events]);
  const [cursor, setCursor] = useState(bounds.start);
  const [seekRevision,setSeekRevision]=useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<1 | 2>(1);
  const [logOpen, setLogOpen] = useState(false);
  const audioCursor = useRef<{ roundId: string; cursor: number } | null>(null);
  useEffect(() => { setCursor(bounds.start); setPlaying(true); setLogOpen(false); }, [record.roundId, bounds.start]);
  useEffect(() => {
    if (!playing) return;
    let frame = 0, previous = performance.now();
    const tick = (now: number) => {
      const delta = (now - previous) * speed;
      previous = now;
      setCursor(value => Math.min(bounds.end, value + delta));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, speed, bounds.end]);
  useEffect(() => { if (cursor >= bounds.end) setPlaying(false); }, [cursor, bounds.end]);
  useEffect(() => {
    const previous = audioCursor.current?.roundId === record.roundId ? audioCursor.current.cursor : null;
    audioCursor.current = { roundId: record.roundId, cursor };
    if (!playing) return;
    if (previous === null) { if (cursor < 0) playCue('countdown'); return; }
    if (cursor <= previous) return;
    for (const beat of [-2_000, -1_000]) if (previous < beat && cursor >= beat) playCue('countdown');
    if (previous < 0 && cursor >= 0) playCue('go');
    for (const event of audioEvents) {
      const at = event.at - record.round.goAt;
      if (at > previous && at <= cursor) playTaskCue(event.taskId);
    }
  }, [cursor, playing, audioEvents, record.roundId, record.round.goAt]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.stopPropagation(); if (logOpen) setLogOpen(false); else onClose(); }
      // Keep native button activation (Restart, Event Log, speed, close) and
      // form editing intact. The player shortcut only handles free Space presses.
      if (event.code === 'Space' && !event.repeat && !event.defaultPrevented && !logOpen && !(event.target instanceof HTMLElement && event.target.closest('input,button,textarea,select,[contenteditable],[role="button"]'))) { event.preventDefault(); setPlaying(value => !value); }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [logOpen, onClose]);
  const epoch = record.round.goAt + cursor;
  const current = currentReplayEvent(events, epoch);
  const countdown = cursor < 0 ? String(Math.max(1, Math.ceil(-cursor / 1000))) : cursor < 800 ? 'GO!' : '';
  const restart = () => { setSeekRevision(v=>v+1); audioCursor.current = null; setCursor(bounds.start); setPlaying(true); };
  const seek = (value: number) => { setSeekRevision(v=>v+1); const time = clampReplayTime(record.round, value); audioCursor.current = { roundId: record.roundId, cursor: time }; setCursor(time); };
  return <section className="replay-view" role="dialog" aria-modal="true" aria-label={`${record.teamName} round replay`} data-round-id={record.roundId} data-replay-cursor={cursor.toFixed(0)} data-replay-time={cursor.toFixed(0)} data-replay-playing={String(playing)}>
    <PitScene room={room} presentationTime={epoch} poseRevision={seekRevision} quality={quality} />
    <header className="replay-heading"><div><small>{record.solo ? 'LOCAL · UNRANKED REPLAY' : 'ROUND REPLAY'}</small><strong>{record.teamName}</strong></div><nav>{onToggleAudio && <button type="button" onClick={onToggleAudio} data-audio-control aria-label={soundEnabled ? 'Mute sound' : 'Enable sound'}>{soundEnabled ? 'Sound on' : 'Sound off'}</button>}<button type="button" className="replay-exit-control" onClick={onClose} aria-label="Close replay">Close replay</button></nav></header>
    {countdown && <div className={`replay-countdown ${cursor >= 0 ? 'go' : ''}`} aria-live="off">{countdown}</div>}
    <div className="replay-controls">
      <EventChip event={current} waiting={cursor < 0 ? 'Car approaching · wait for GO signal' : 'GO! · waiting for the first task'} />
      <input className="replay-scrubber" type="range" min={bounds.start} max={bounds.end} step="10" value={cursor} onChange={event => seek(Number(event.target.value))} aria-label="Replay timeline" aria-valuetext={cursor < 0 ? `${(-cursor / 1000).toFixed(1)} seconds until GO` : `${(cursor / 1000).toFixed(1)} seconds since GO`} />
      <div className="replay-buttons"><button type="button" onClick={() => cursor >= bounds.end ? restart() : setPlaying(value => !value)} aria-label={playing ? 'Pause replay' : 'Play replay'}>{playing ? 'Pause' : 'Play'}</button><button type="button" onClick={restart}>Restart</button><button type="button" onClick={() => setSpeed(value => value === 1 ? 2 : 1)} aria-label={`Playback speed ${speed} times`}>×{speed}</button><time aria-label="Replay elapsed time">{cursor < 0 ? `−${(-cursor / 1000).toFixed(1)}` : (cursor / 1000).toFixed(1)}s</time><button type="button" onClick={() => setLogOpen(true)} aria-expanded={logOpen}>Event Log</button></div>
    </div>
    {logOpen && <EventLogDrawer round={record.round} players={record.players} cursor={epoch} onClose={() => setLogOpen(false)} />}
  </section>;
}
