import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowLeft, ArrowRight, Camera, Check, ChevronRight, Flag, Gauge, Info, Layers3, LogOut, Maximize2, Radio, RotateCcw, Settings2, ShieldCheck, Signal, Trophy, Users, Volume2, VolumeX, WifiOff, X, Zap } from 'lucide-react';
import { api } from './api';
import { TeamPreviewProvider, TeamPreview } from './TeamPreviews';
import PitScene from './PitScene';
import {PLAYER_CAMERA_OPTIONS,type PlayerCameraMode} from './scene/playerCamera';
import ChainHUD, { RoleBriefing, MiniChain, AllRoles } from './ChainHUD';
import { ENABLE_SOLO_TEST_MODE } from './solo';
import { useTimedNotice } from './useTimedNotice';
import { useHudClearance } from './useHudClearance';
import RoleCard from './RoleCard';
import HostControlNote from './HostControlNote';
import ActionControl from './ActionControl';
import SoloRolePicker from './SoloRolePicker';
import NavigationPanel from './NavigationPanel';
import { getAudioState, playCue, playTaskCue, setAudioEnabled, setVolume } from './audio';
import { useGame } from './useGame';
import type { ReplayRecord, ReplaySummary, Room, Task } from './types';
import { roleLabel } from './types';
import { elapsed, formatTime } from './view';
import { AdminForm, CrewRoster, DeleteForm, HowToPlay, Leaderboard, NewCrewForm, OverlayFrame, RoomBrowser } from './GamePanels';
import './styles.css';
import './game.css';
import './v8.css';
import './v9.css';
import './v10-ui.css';
import './v11-hud.css';
import ReplayView from './ReplayView';
import { EventLogDrawer, LiveEventStrip } from './ReplayEventLog';
import DesktopLiveLog from './DesktopLiveLog';
import './v11-desktop.css';
import './v11-4-ui.css';
import './v13-responsive-desktop.css';

type View = 'menu' | 'crew' | 'watch';
type Overlay = 'rooms' | 'create' | 'join' | 'leaderboard' | 'how' | 'roster' | 'chain' | 'settings' | 'admin' | 'delete' | 'briefing' | 'roles' | 'controls' | 'leave' | null;
const phase: Record<string, string> = { WAITING: 'IN POSITION', COUNTDOWN: 'LIGHTS OUT IN', RUNNING: 'STOP IN PROGRESS', COMPLETED: 'GREEN RELEASE', CLOSED: 'TEAM CLOSED' };
function preference(key: string, fallback: string) { try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; } }
function savePreference(key: string, value: string) { try { localStorage.setItem(key, value); } catch { /* Browser privacy mode still supports live controls. */ } }

export default function App() {
  const game = useGame(window.location.hash.startsWith('#watch'));
  const { state, globalState, myRoom, now, clockOffset, busy, error, notice, loaded, stale, run, refresh, refreshGlobalState, setError, setNotice } = game;
  const overlayBottom = useHudClearance();
  const standingsState = api.hasBackend ? globalState ?? state : state;
  const globalAdmin = !!globalState?.identity.isAdmin;
  const initialHash = useRef(window.location.hash.slice(1));
  const [view, setView] = useState<View>(initialHash.current.startsWith('watch') ? 'watch' : initialHash.current === 'crew' ? 'crew' : 'menu');
  const [focus, setFocus] = useState<string | null>(initialHash.current.startsWith('watch/') ? initialHash.current.split('/')[1] : null);
  const [overlay, setOverlay] = useState<Overlay>(initialHash.current === 'rooms' ? 'rooms' : null);
  const [joining, setJoining] = useState<Room | undefined>();
  const [playerCamera,setPlayerCamera]=useState<PlayerCameraMode>('overview');
  const [quality, setQuality] = useState<'high' | 'low'>(preference('pit-v7-quality', 'high') === 'low' ? 'low' : 'high');
  const [volume, updateVolume] = useState(() => { const saved = Number(preference('pit-v7-volume', '.7')); return Number.isFinite(saved) ? Math.min(1, Math.max(0, saved)) : .7; });
  const [adminBusy, setAdminBusy] = useState(false);
  const [deletion, setDeletion] = useState<{ teamId?: string; resultId?: string; label: string }>({ label: 'all completed results' });
  const [soundTick, setSoundTick] = useState(0);
  const [replayRecord, setReplayRecord] = useState<ReplayRecord | null>(null);
  const [replayLoading, setReplayLoading] = useState<string | null>(null);
  const [eventLog, setEventLog] = useState<{roomId?:string;roundId:string;record?:ReplayRecord} | null>(null);
  const [eventLogLoading, setEventLogLoading] = useState<string | null>(null);
  const logRequest = useRef(0);
  const replayRequest = useRef(0);
  const audioGesture = useRef(false);
  const audioMuted = useRef(preference('pit-v7-muted', 'false') === 'true');
  const hoverAt = useRef(0);
  const currentPlayer = state.identity.playerId;
  const me = myRoom?.players.find(player => player.id === currentPlayer);
  const observerState = api.hasBackend ? globalState ?? state : state;
  const active = observerState.rooms.filter(room => room.status === 'COUNTDOWN' || room.status === 'RUNNING');
  const focusedRoom = observerState.rooms.find(room => room.id === focus);
  const displayedRoom = view === 'watch' ? focusedRoom ?? active[0] ?? observerState.rooms.find(room => room.status === 'WAITING') ?? null : myRoom;
  const isSolo = !!myRoom?.solo;
  useEffect(() => { setOverlay(current => current === 'briefing' ? null : current); }, [me?.role, myRoom?.id]);
  useEffect(() => { if (overlay==='admin' || overlay==='leaderboard') void refreshGlobalState().catch(()=>setError('Global administration requires a connection to Supabase. Check your connection and project configuration.')); }, [overlay,refreshGlobalState,setError]);
  const dismissNotice = useCallback(() => setNotice(''), [setNotice]);
  const dismissError = useCallback(() => setError(''), [setError]);
  useTimedNotice(notice, dismissNotice); useTimedNotice(error, dismissError, true);
  const audio = getAudioState(); void soundTick;

  const openWorkflow = useCallback(() => setOverlay('chain'), []);
  const navigate = useCallback((target: View, roomId?: string | null) => {
    setView(target); setFocus(roomId ?? null); setOverlay(null); ++logRequest.current; setEventLog(null);
    window.location.hash = target === 'menu' ? '' : target === 'watch' && roomId ? `watch/${roomId}` : target;
  }, []);
  useEffect(() => {
    const route = () => { const [page, id] = window.location.hash.slice(1).split('/'); setView(page === 'watch' ? 'watch' : page === 'crew' ? 'crew' : 'menu'); setFocus(page === 'watch' ? id ?? null : null); setOverlay(page === 'rooms' ? 'rooms' : null); };
    window.addEventListener('hashchange', route); return () => window.removeEventListener('hashchange', route);
  }, []);
  useEffect(() => { if (loaded && view === 'crew' && !myRoom) navigate('menu'); }, [loaded, view, myRoom, navigate]);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape' && !overlay && !replayRecord && !eventLog) { if (view === 'watch' && focus) navigate('watch'); else if (view !== 'menu') navigate('menu'); } };
    window.addEventListener('keydown', escape); return () => window.removeEventListener('keydown', escape);
  }, [overlay, view, focus, navigate, replayRecord, eventLog]);
  useEffect(() => { setVolume(volume); }, [volume]);
  useEffect(() => { const timer = setInterval(() => setSoundTick(tick => tick + 1), 300); return () => clearInterval(timer); }, []);
  useEffect(() => { return () => setAudioEnabled(false); }, []);

  const unlockAudio = (target: EventTarget | null) => {
    if ((audioGesture.current && getAudioState().running) || audioMuted.current || (target instanceof Element && target.closest('[data-audio-control]'))) return;
    audioGesture.current = true; setAudioEnabled(true); setSoundTick(tick => tick + 1);
  };
  const toggleAudio = () => {
    audioGesture.current = true;
    const enabled = !getAudioState().running;
    audioMuted.current = !enabled; savePreference('pit-v7-muted', String(!enabled)); setAudioEnabled(enabled);
    setSoundTick(tick => tick + 1); if (enabled) setTimeout(() => playCue('ready'), 60);
  };
  const availableAudio = useRef('');
  useEffect(() => {
    if (replayRecord) { availableAudio.current=''; return; }
    const round=displayedRoom?.round;
    if(!round){availableAudio.current='';return;}
    const next=round.tasks.find(task=>task.ownerId===currentPlayer&&task.status==='AVAILABLE');
    const key=next?`${round.id}/${next.id}`:'';
    if(key&&key!==availableAudio.current&&view==='crew')playCue('available');
    availableAudio.current=key;
  },[displayedRoom,currentPlayer,view,replayRecord]);
  const lastCountdown = useRef<{ round: string | null; number: number | null; go: boolean }>({ round: null, number: null, go: false });
  useEffect(() => {
    if (replayRecord) return;
    const round = displayedRoom?.round;
    if (!round) { lastCountdown.current = { round: null, number: null, go: false }; return; }
    if (lastCountdown.current.round !== round.id) lastCountdown.current = { round: round.id, number: null, go: false };
    const remaining = Math.ceil((round.goAt - now) / 1000);
    if (round.status === 'COUNTDOWN' && remaining >= 1 && remaining <= 3 && lastCountdown.current.number !== remaining) {
      lastCountdown.current.number = remaining; playCue('countdown');
    } else if (now >= round.goAt && ['COUNTDOWN','RUNNING'].includes(round.status) && !lastCountdown.current.go) {
      if (lastCountdown.current.number !== null || now - round.goAt < 1000) playCue('go');
      lastCountdown.current.go = true;
    }
  }, [displayedRoom, now, replayRecord]);
  const myTasks = myRoom?.round?.tasks.filter(task => task.ownerId === me?.id) ?? [];
  const outstanding = myTasks.find(task => task.status === 'AVAILABLE') ?? myTasks.find(task => task.status !== 'DONE');
  const perform = useCallback(async (task: Task) => {
    if (!myRoom || busy || (myRoom.round?.penalties?.[me?.id ?? '']?.until ?? 0) > now) return;
    const early = now < (myRoom.round?.goAt ?? Infinity) || task.status === 'LOCKED';
    if(!early)playCue('action');
    await run(early ? 'early_action' : 'action', myRoom.id, { taskId: task.id, requestId: crypto.randomUUID() });
  }, [myRoom, busy, run, me?.id, now]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || view !== 'crew' || overlay || replayRecord || !outstanding || busy || !['COUNTDOWN','RUNNING'].includes(myRoom?.status ?? '') || event.repeat) return;
      if (event.target instanceof HTMLElement && event.target.closest('input,button,textarea,select,[contenteditable]')) return;
      event.preventDefault(); unlockAudio(event.target); void perform(outstanding);
    };
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  }, [view, overlay, replayRecord, outstanding, busy, myRoom, perform]);
  const fullscreen = async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch { setNotice('Use your browser’s fullscreen command for projector mode.'); } };
  const leave = async () => { if (await run('leave', myRoom?.id)) { navigate('menu'); setNotice('You left the team. Completed team results are preserved.'); } };
  const openReplay = async (roundId: string) => {
    const request = ++replayRequest.current; setReplayLoading(roundId); setError('');
    try { const record = await api.getReplay(roundId); if (request === replayRequest.current) { setOverlay(null); ++logRequest.current; setEventLog(null); setReplayRecord(record); } }
    catch (error) { if (request === replayRequest.current) setError(error instanceof Error ? error.message : 'Replay is unavailable.'); }
    finally { if (request === replayRequest.current) setReplayLoading(null); }
  };
  // Public deletion invalidates an already-open replay as soon as the authoritative snapshot arrives.
  useEffect(() => {
    if (replayRecord && !replayRecord.solo && observerState.replays && !observerState.replays.some(item=>item.roundId===replayRecord.roundId)) { setReplayRecord(null); setNotice('This replay is no longer available.'); }
  }, [observerState.replays, replayRecord, setNotice]);
  const copyInvite = async () => { const link = `${window.location.origin}${window.location.pathname}#rooms`; try { await navigator.clipboard.writeText(link); setNotice('Room directory link copied. Ask teammates to join your crew.'); } catch { setNotice(link); } };
  const openEventLog = async (roundId:string, roomId?:string) => {
    const request = ++logRequest.current;
    if (roomId) { setEventLog({roomId, roundId}); return; }
    setEventLogLoading(roundId); setError('');
    try { const record = await api.getReplay(roundId); if (request === logRequest.current) setEventLog({roundId, record}); }
    catch (error) { if (request === logRequest.current) setError(error instanceof Error ? error.message : 'Event Log is unavailable.'); }
    finally { if (request === logRequest.current) setEventLogLoading(null); }
  };
  const loggedRoom = eventLog?.roomId ? observerState.rooms.find(room=>room.id===eventLog.roomId && room.round?.id===eventLog.roundId) : undefined;
  const loggedRound = loggedRoom?.round ?? eventLog?.record?.round;
  const loggedPlayers = loggedRoom?.players ?? eventLog?.record?.players;
  useEffect(() => {
    if (!eventLog) return;
    const activeRound = observerState.rooms.some(room=>room.round?.id===eventLog.roundId && room.status !== 'COMPLETED');
    const recorded = observerState.replays?.some(item=>item.roundId===eventLog.roundId);
    if (!activeRound && observerState.replays && !recorded && !eventLog.record?.solo) { setEventLog(null); setNotice('This Event Log is no longer available.'); }
    else if (eventLog.roomId && !loggedRoom && recorded) void openEventLog(eventLog.roundId);
  }, [observerState.rooms, observerState.replays, eventLog, loggedRoom]);
  const openDelete = (teamId?: string, resultId?: string, label = 'all completed results') => { setDeletion({ teamId, resultId, label }); setOverlay('delete'); };
  const signin = async (email: string, password: string) => {
    setAdminBusy(true); setError('');
    try { if (myRoom && !isSolo && !(await run('leave', myRoom.id))) return; await api.signInAdmin(email, password); await refresh(); await refreshGlobalState(); setOverlay('leaderboard'); } catch (error) { setError(error instanceof Error ? error.message : 'Unable to sign in.'); } finally { setAdminBusy(false); }
  };
  const signout = async () => { try { await api.signOutAdmin(); await refresh(); await refreshGlobalState(); } catch (error) { setError(error instanceof Error ? error.message : 'Unable to sign out.'); } };
  const scenePlayer = view === 'crew' && myRoom?.id === displayedRoom?.id ? currentPlayer : null;
  const showRaceHud = !!displayedRoom && (view === 'crew' || (view === 'watch' && !!focus));
  const countdown = displayedRoom?.round?.status === 'COUNTDOWN' && now < displayedRoom.round.goAt;
  const goFlash = !!displayedRoom?.round && ['COUNTDOWN','RUNNING'].includes(displayedRoom.round.status) && now >= displayedRoom.round.goAt && now - displayedRoom.round.goAt < 950;
  const headers: Record<Exclude<Overlay, null>, [string, string]> = {
    briefing: ['YOUR ROLE', me ? roleLabel(me.role) : 'Role details'], roles: ['REFERENCE', 'All Roles'], controls: ['NAVIGATION', 'Quick controls'], leave: ['LEAVE TEAM', 'Abandon this round?'], rooms: ['OPEN TEAMS', 'Find your crew'], create: ['TEAM ENTRY', 'Create your team'], join: ['CREW ENTRY', 'Take your position'], leaderboard: ['GLOBAL STANDINGS', 'The benchmark'], how: ['THE PLAYBOOK', 'How to play'], roster: ['ROSTER', 'Team Members'], chain: ['LIVE WORKFLOW', 'The connected stop'], settings: ['PIT LANE SETTINGS', 'Make it yours'], admin: ['PROTECTED ACCESS', 'Global administrator'], delete: ['PERMANENT ACTION', 'Delete results?']
  };

  return <div style={{'--pit-overlay-bottom': `${overlayBottom}px`} as CSSProperties} className={`game-shell view-${view} ${view === 'watch' && focus ? 'focused-room' : ''} ${replayRecord ? 'replay-open' : ''}`} onPointerDownCapture={event => unlockAudio(event.target)} onKeyDownCapture={event => { if (event.code === 'Enter' || event.code === 'Space') unlockAudio(event.target); }} onClickCapture={event => { if (event.target instanceof Element && event.target.closest('button') && !event.target.closest('[data-audio-control]')) playCue('click'); }} onPointerOver={event => { if (event.target instanceof Element && event.target.closest('button') && performance.now() - hoverAt.current > 160) { hoverAt.current = performance.now(); playCue('hover'); } }}>
    <div className="scene-stage"><PitScene room={displayedRoom} playerId={scenePlayer} quality={quality} cameraMode={view==='crew'?playerCamera:'overview'} onCameraModeChange={setPlayerCamera} clockOffset={game.clockOffset} onTaskCue={!replayRecord&&(view==='crew'||view==='watch'&&!!focus)?playTaskCue:undefined} active={(view !== 'watch' || !!focus) && !replayRecord} /></div>
    <div className="cinematic-shade" aria-hidden="true" />
    {view==='crew'&&me&&!replayRecord&&<div className="player-camera-switch" role="group" aria-label="Camera mode">{playerCamera!=='overview'&&<span className="camera-gesture-hint">{playerCamera==='first-person'?'Drag left: look right · up: look up':'Drag left: orbit right · up: orbit up · pinch to zoom'}</span>}{PLAYER_CAMERA_OPTIONS.map(option=><button key={option.mode} type="button" aria-label={`${option.label} camera`} aria-pressed={playerCamera===option.mode} onClick={()=>setPlayerCamera(option.mode)}>{option.label}</button>)}</div>}
    <header className="top-hud">
      {view !== 'menu' && <button className="game-button small back-menu" onClick={() => navigate('menu')} aria-label="Main Menu" title={myRoom ? 'Return to menu — your place on the team is saved.' : 'Main Menu'}><ArrowLeft size={17} />Main Menu</button>}
      {view==='crew'&&me&&!replayRecord&&<button className="mobile-camera-switch" type="button" aria-label={`Switch camera: ${PLAYER_CAMERA_OPTIONS.find(option=>option.mode===playerCamera)!.label}`} title="Tap to switch camera: Overview, First person, Third person" onClick={()=>setPlayerCamera(PLAYER_CAMERA_OPTIONS[(PLAYER_CAMERA_OPTIONS.findIndex(option=>option.mode===playerCamera)+1)%PLAYER_CAMERA_OPTIONS.length].mode)}><Camera size={14}/><span>{playerCamera==='overview'?'Overview':playerCamera==='first-person'?'Cam 1':'Cam 3'}</span></button>}
      {(view === 'watch' || !!myRoom) && <div className="session-chip">{view === 'watch' ? <><Radio size={15} /><span>PUBLIC OBSERVER<small>No player seat used</small></span></> : myRoom ? <><span className="crew-color" style={{ background: myRoom.color }} /><span>{myRoom.name}<small>{me?.id === myRoom.hostId ? 'HOST / PLAYER' : 'CREW MEMBER'} · {myRoom.players.length}/15</small></span></> : null}</div>}
      {showRaceHud && <div className={`race-timer ${displayedRoom.status === 'COMPLETED' ? 'finished' : ''}`}><span>{displayedRoom.status === 'WAITING' ? 'AWAITING CREW' : 'PIT STOP TIME'}</span><strong>{formatTime(elapsed(displayedRoom.round, now))}<small>s</small></strong><em>{stale ? 'RECONNECTING · ESTIMATE' : displayedRoom.status === 'COMPLETED' ? 'OFFICIAL RESULT' : phase[displayedRoom.status]}</em></div>}
      <div className="top-controls">{view === 'crew' && myRoom && <button className="leave-crew-control" disabled={!!busy} onClick={() => myRoom.status === 'COUNTDOWN' || myRoom.status === 'RUNNING' ? setOverlay('leave') : void leave()}><LogOut size={16} /><span>Leave Team</span></button>}<button className="icon-control more-control" onClick={() => setOverlay('controls')} aria-label="Open menu"><Layers3 size={20} /></button><button className="icon-control sound-control" onClick={toggleAudio} data-audio-control data-audio-state={audio.running ? 'running' : audio.enabled ? 'suspended' : 'muted'} data-audio-volume={audio.volume} aria-label={audio.enabled ? 'Mute sound' : 'Enable sound'} title={audio.enabled ? `Sound ${Math.round(volume * 100)}%` : 'Enable sound'}>{audio.enabled ? <Volume2 size={20} /> : <VolumeX size={20} />}</button><button className="icon-control" onClick={() => setOverlay('settings')} aria-label="Settings"><Settings2 size={20} /></button><button className="icon-control fullscreen-button" onClick={() => void fullscreen()} aria-label="Fullscreen projector"><Maximize2 size={19} /></button></div>
    </header>

    {view === 'menu' && <section className={`main-menu ${myRoom ? 'has-saved-team' : ''}`}><h1>PIT STOP.<br /><span>SIMULATOR.</span></h1>{!api.hasBackend && <p role="status" className="online-config-warning">Online teams unavailable — connect Supabase in config.js. Solo Test is still available.</p>}<div className="menu-actions">{myRoom && <div className="menu-seat"><div className="team-seat-actions"><button className="game-button resume contextual-resume" onClick={() => navigate('crew')} aria-label={`Resume as ${me?.nickname ?? 'player'} in ${myRoom.name}`}><Flag size={17} /><span className="resume-copy"><strong>Resume as {me?.nickname ?? 'player'}</strong><small>in {myRoom.name}</small></span></button><button className="game-button danger leave-from-menu" disabled={!!busy} onClick={() => myRoom.status === 'COUNTDOWN' || myRoom.status === 'RUNNING' ? setOverlay('leave') : void leave()}><LogOut size={16} />Leave Team</button></div><p className="saved-seat-note">Your place is saved while you visit the menu.</p></div>}<button className="game-button primary" onClick={() => setOverlay('create')}><Flag size={19} />Create Team<ArrowRight size={21} /></button><button className="game-button secondary" onClick={() => setOverlay('rooms')}><Users size={19} />Browse Teams<span className="button-meta">{state.rooms.filter(room => room.status === 'WAITING' && room.players.length < 15).length} OPEN</span></button><button className="game-button secondary" onClick={() => navigate('watch')}><Radio size={19} />Watch Live<span className="button-meta">{active.length} ACTIVE</span></button><div className="menu-secondary"><button onClick={() => setOverlay('leaderboard')}><Trophy size={16} />Leaderboard</button><button onClick={() => setOverlay('how')}><Info size={16} />How to play</button><button onClick={() => setOverlay('roles')}><Layers3 size={16} />All Roles</button><button onClick={() => setOverlay('admin')}><ShieldCheck size={14}/>Admin access</button></div>{ENABLE_SOLO_TEST_MODE && <button className="solo-test-button" disabled={!!myRoom} onClick={async () => { if (await run('solo_enter')) navigate('crew'); }}>Solo Test <span>LOCAL · NOT RANKED</span></button>}</div></section>}

    {showRaceHud && <>
      <div className="room-heading"><div className="phase-badge"><i />{view === 'watch' ? 'OBSERVER FOCUS' : isSolo ? 'SOLO · UNRANKED' : 'YOUR TEAM'}</div><h2 title={displayedRoom.name}>{displayedRoom.name}</h2><span>{displayedRoom.players.length} human operators · {15 - displayedRoom.players.length} adaptive core bots</span>{view === 'watch' && <button className="text-button" onClick={() => navigate('watch')}><ArrowLeft size={14} />All teams</button>}</div>
      <aside className="scene-instruments" aria-label="Team progress"><MiniChain room={displayedRoom} playerId={scenePlayer} onOpen={openWorkflow} /><DesktopLiveLog room={displayedRoom} /></aside>
      {view === 'watch' && <LiveEventStrip room={displayedRoom} now={now} />}
    </>}

    {view === 'crew' && myRoom && me && myRoom.status !== 'COMPLETED' && <div className="hud-dock"><RoleCard room={myRoom} playerId={me.id} onExpand={() => setOverlay('briefing')} /><div className="action-console">
      {myRoom.status === 'WAITING' ? <>{isSolo && <SoloRolePicker role={me.role} busy={!!busy} onChange={role => void run('choose_role', myRoom.id, {role})} />}<div className="ready-status"><Users size={16} /><span>{myRoom.players.filter(player => player.ready).length}/{myRoom.players.length} READY</span><small>{isSolo ? 'One human · 14 bots' : 'Everyone must be Ready'}</small></div><button className={`game-button ready-button ${me.ready ? 'locked' : 'gold'}`} disabled={!!busy} onClick={async () => { if (await run('ready', myRoom.id, { ready: !me.ready })) playCue('ready'); }}>{me.ready ? <Check size={22} /> : <Flag size={22} />}{me.ready ? 'Ready' : 'Mark ready'}</button>{me.id === myRoom.hostId && <button className="game-button primary start-button" disabled={!!busy || (!isSolo && (myRoom.players.length < 4 || myRoom.players.length > 15)) || !myRoom.players.every(player => player.ready && player.connected !== false)} onClick={() => void run('start', myRoom.id)}><Zap size={20} />Start round<ArrowRight size={19} /></button>}{!isSolo&&<HostControlNote host={me.id===myRoom.hostId} stage="ready"/>}<span className="start-explanation">{isSolo ? 'Choose your role. Ready, then start.' : myRoom.players.length < 4 ? `${4 - myRoom.players.length} more players needed` : !myRoom.players.every(player => player.ready) ? 'Waiting for every teammate to be Ready' : me.id === myRoom.hostId ? 'Crew locked. Send it.' : 'Waiting for your host to start'}</span></> : <ActionControl room={myRoom} playerId={me.id} now={now} busy={busy} onAction={perform} />}
    </div></div>}

    {view === 'watch' && !focus && <ObserverOverview rooms={observerState.rooms} clockOffset={clockOffset} replays={observerState.replays ?? []} leaderboard={observerState.leaderboard} replayLoading={replayLoading} eventLogLoading={eventLogLoading} onEventLog={(roundId,roomId)=>void openEventLog(roundId,roomId)} now={now} stale={stale} onFocus={id => navigate('watch', id)} onReplay={id => void openReplay(id)} />}
    {(countdown || goFlash) && showRaceHud && <div className="countdown-display" aria-live="assertive"><span>{countdown ? 'WAIT FOR GO SIGNAL' : 'PIT STOP TIME STARTS NOW'}</span><strong>{countdown ? Math.max(1, Math.ceil((displayedRoom!.round!.goAt - now) / 1000)) : 'GO!'}</strong><div>{[3, 2, 1].map(n => <i key={n} className={Math.ceil((displayedRoom!.round!.goAt - now) / 1000) <= n ? 'on' : ''} />)}</div></div>}
    {view === 'crew' && myRoom?.status === 'COMPLETED' && <section className="result-overlay"><span className="eyebrow">STOP COMPLETE{!isSolo && ' · OFFICIAL RESULT'}</span><div className="result-time"><strong>{formatTime(myRoom.round!.elapsedMs!)}<small>s</small></strong></div>{!isSolo && <div className="result-average"><span>TEAM AVERAGE</span><b>{formatTime(state.leaderboard.find(entry => entry.teamId === myRoom.teamId)?.averageMs ?? myRoom.round!.elapsedMs!)}s</b></div>}<div className="result-buttons"><button className="game-button gold" disabled={replayLoading === myRoom.round!.id} onClick={() => void openReplay(myRoom.round!.id)}><Radio size={16} />{replayLoading === myRoom.round!.id ? 'Loading…' : 'Watch replay'}</button>{me?.id === myRoom.hostId && <button className="game-button secondary" disabled={!!busy} onClick={() => void run('replay', myRoom.id)}><RotateCcw size={16} />Play again</button>}<button className="game-button secondary result-leaderboard" onClick={() => setOverlay('leaderboard')} aria-label="Leaderboard"><Trophy size={16} /></button></div>{!isSolo&&<HostControlNote host={me?.id===myRoom.hostId} stage="replay"/>}</section>}


    {view !== 'menu' && <div className="view-tools" aria-hidden="true"><span><RotateCcw size={13} />DRAG TO ROTATE</span><span>SCROLL TO ZOOM</span></div>}
    {!isSolo && api.hasBackend && <div className={`connection-pill ${stale ? 'stale' : ''}`} role="status" aria-label={stale?'Reconnecting…':'Connected'}>{stale ? <><WifiOff size={12} /><span>Reconnecting…</span></> : <Signal size={12} />}</div>}
    {(error || notice) && <div className={`game-toast ${error ? 'error' : ''}`} role={error ? 'alert' : 'status'}><Info size={17} /><span>{error || notice}</span><button aria-label="Dismiss message" onClick={() => { setError(''); setNotice(''); }}><X size={16} /></button></div>}

    {overlay && <OverlayFrame title={headers[overlay][1]} eyebrow={headers[overlay][0]} onClose={() => setOverlay(null)} wide={['rooms', 'leaderboard', 'roster', 'chain', 'roles'].includes(overlay)} className={`${overlay === 'leaderboard' ? 'leaderboard-overlay' : overlay === 'chain' ? 'chain-overlay' : overlay === 'controls' ? 'navigation-overlay' : ''}`} busy={!!busy || adminBusy}>
      {overlay === 'rooms' && <RoomBrowser rooms={state.rooms} loaded={loaded} myRoom={myRoom} onJoin={room => { setJoining(room); setOverlay('join'); }} onCreate={() => setOverlay('create')} />}
      {(overlay === 'create' || overlay === 'join') && <NewCrewForm room={overlay === 'join' ? joining : undefined} busy={!!busy} blocked={!!myRoom} configured={api.hasBackend} onSubmit={async (name, nickname, color) => { if (await run(overlay === 'join' ? 'join' : 'create', overlay === 'join' ? joining?.id : null, { name, nickname, color })) navigate('crew'); }} />}
      {overlay === 'leaderboard' && <><Leaderboard state={standingsState} onDelete={openDelete} /><div className="admin-strip">{globalAdmin ? <><ShieldCheck size={14} /><span>Global admin</span><button onClick={() => openDelete()}>Clear all results</button><button onClick={() => void signout()}>Sign out</button></> : <button onClick={() => setOverlay('admin')}><ShieldCheck size={13} />Admin access</button>}</div></>}
      {overlay === 'roster' && displayedRoom && <CrewRoster room={displayedRoom} myId={view === 'crew' ? currentPlayer : null} busy={!!busy} onKick={id => void run('kick', displayedRoom.id, { playerId: id })} />}
      {overlay === 'chain' && displayedRoom && <ChainHUD room={displayedRoom} playerId={scenePlayer} expanded />}
      {overlay === 'briefing' && myRoom && me && <RoleBriefing room={myRoom} playerId={me.id} />}
      {overlay === 'how' && <HowToPlay />}
      {overlay === 'roles' && <AllRoles />}
      {overlay === 'leave' && <div className="leave-confirm"><p>This attempt will end without a ranked result. Completed results are preserved.</p><button className="game-button secondary" onClick={() => setOverlay(null)}>Stay in Team</button><button className="game-button danger" onClick={() => void leave()}>Leave Team</button></div>}
      {overlay === 'controls' && <NavigationPanel view={view} hasTeam={!!myRoom} hasDisplayedRoom={!!displayedRoom} focused={!!focus} solo={isSolo} onSelect={destination => {
        if (destination === 'menu' || destination === 'crew' || destination === 'watch') navigate(destination);
        else if (destination === 'invite') void copyInvite();
        else setOverlay(destination);
      }} />}
      {overlay === 'admin' && <AdminForm busy={adminBusy} onSubmit={signin} configured={api.hasBackend} onlineSeat={!!myRoom && !isSolo} />}
      {overlay === 'delete' && <DeleteForm label={deletion.label} busy={!!busy} onSubmit={async () => { if (await run('admin_delete', null, { teamId: deletion.teamId, resultId: deletion.resultId, confirm: 'DELETE' })) { setOverlay('leaderboard'); setNotice('Selected results deleted. Team averages updated.'); } }} />}
      {overlay === 'settings' && <div className="settings-panel"><div className="setting-row"><div><strong>Racetrack audio</strong><p>Distant passing engines + pit crew effects (no static)</p></div><button className={`game-button small ${audio.enabled ? 'gold' : 'secondary'}`} onClick={toggleAudio} data-audio-control>{audio.enabled ? 'Sound on' : 'Enable sound'}</button></div><label className="volume-control" data-audio-control><span>MASTER VOLUME <b>{Math.round(volume * 100)}%</b></span><input aria-label="Master volume" type="range" min="0" max="1" step=".01" value={volume} onPointerUp={() => playCue('ready')} onChange={event => { const next = Number(event.target.value); updateVolume(next); savePreference('pit-v7-volume', String(next)); }} /></label><p className="panel-note">Sound activates after your first interaction. If your browser suspends audio, tap Enable sound.</p><div className="setting-row"><div><strong>Scene quality</strong><p>Eco mode uses fewer pixels and shadows.</p></div><button className="game-button small secondary" onClick={() => { const next = quality === 'high' ? 'low' : 'high'; setQuality(next); savePreference('pit-v7-quality', next); }}>{quality === 'high' ? 'HIGH' : 'ECO'}<Gauge size={15} /></button></div><div className="setting-row"><div><strong>Camera</strong><p>Return to the starting angle.</p></div><button className="game-button small secondary" onClick={() => window.dispatchEvent(new Event('pit-camera-reset'))}>Re-center</button></div><div className="setting-row"><div><strong>Projector mode</strong><p>Immersive fullscreen. Escape to exit.</p></div><button className="game-button small secondary" onClick={() => void fullscreen()}><Maximize2 size={15} />Fullscreen</button></div><p className="panel-note">{isSolo ? 'One human and fourteen bots. Results stay in this local test only.' : 'Public rooms, host controls and scoring use the existing Supabase backend. Your device never sets the official time.'}</p></div>}
    </OverlayFrame>}
    {eventLog && loggedRound && loggedPlayers && <EventLogDrawer round={loggedRound} players={loggedPlayers} teamName={loggedRoom?.name ?? eventLog.record?.teamName} live={!!loggedRoom && ['COUNTDOWN','RUNNING'].includes(loggedRoom.status)} onClose={() => { ++logRequest.current; setEventLog(null); }} />}
    {replayRecord && <ReplayView record={replayRecord} onClose={() => setReplayRecord(null)} onToggleAudio={toggleAudio} soundEnabled={audio.enabled} quality={quality} />}
  </div>;
}

function ObserverOverview({ rooms, clockOffset, replays, leaderboard, replayLoading, eventLogLoading, now, stale, onFocus, onReplay, onEventLog }: { rooms: Room[]; clockOffset: number; replays: ReplaySummary[]; leaderboard: import('./types').LeaderboardEntry[]; replayLoading: string | null; eventLogLoading:string|null; now: number; stale: boolean; onFocus: (id: string) => void; onReplay: (roundId: string) => void; onEventLog:(roundId:string,roomId?:string)=>void }) {
  const racing = rooms.filter(room => room.status === 'COUNTDOWN' || room.status === 'RUNNING');
  const waiting = rooms.filter(room => room.status === 'WAITING');
  // Stable team attempt numbers come from authoritative, persisted results;
  // fall back to visible replays only if a leaderboard snapshot has not arrived.
  const roundById = new Map<string, number>();
  const completedByTeam = new Map<string, number>();
  for (const entry of leaderboard) {
    entry.rounds.forEach((result, index) => roundById.set(result.roundId, index + 1));
    completedByTeam.set(entry.teamId, entry.rounds.length);
  }
  const visibleHistory = new Map<string, ReplaySummary[]>();
  for (const item of replays) visibleHistory.set(item.teamId, [...(visibleHistory.get(item.teamId) ?? []), item]);
  for (const [teamId, history] of visibleHistory) {
    history.sort((a,b) => a.finishedAt - b.finishedAt || a.roundId.localeCompare(b.roundId));
    history.forEach((item,index) => { if (!roundById.has(item.roundId)) roundById.set(item.roundId,index+1); });
    if (!completedByTeam.has(teamId)) completedByTeam.set(teamId,history.length);
  }
  return <TeamPreviewProvider><section className="observer-overview"><header><div><span className="eyebrow"><Radio size={13} />PUBLIC OBSERVER / NO PLAYER SEAT</span><h1>Watch Live</h1><p>{stale ? 'Reconnecting. Showing last-known state.' : 'Select a team to watch.'}</p></div></header><div className="observer-scroll"><div className="observer-section-title"><span className="signal-dot" /><h2>ON THE CLOCK</h2><b>{racing.length}</b></div>{!racing.length && <div className="observer-empty">The pit lane is quiet. Starting teams appear here automatically.</div>}<div className="observer-grid active-teams-grid">{racing.map(room => <LiveCard key={room.id} room={room} roundNumber={(completedByTeam.get(room.teamId) ?? 0) + 1} clockOffset={clockOffset} now={now} onFocus={()=>onFocus(room.id)} onEventLog={()=>onEventLog(room.round!.id,room.id)} />)}</div><div className="observer-section-title"><h2>WAITING TO START</h2><b>{waiting.length}</b></div><div className="observer-waiting">{waiting.map(room => <button className="waiting-crew" key={room.id} onClick={() => onFocus(room.id)}><i style={{ background: room.color }} /><strong>{room.name}<small>HOST {room.players.find(player => player.id === room.hostId)?.nickname ?? '—'}</small></strong><span>{room.players.length}/15</span><b>{room.players.filter(player => player.ready).length} READY</b><ChevronRight size={16} /></button>)}{!waiting.length && <p className="muted">No teams are waiting in the pit lane.</p>}</div>{replays.length > 0 && <><div className="observer-section-title"><h2>FINISHED</h2><b>{replays.length}</b></div><div className="finished-teams">{[...replays].sort((a,b)=>b.finishedAt-a.finishedAt || a.roundId.localeCompare(b.roundId)).map(replay => <article className="finished-team" key={replay.roundId} data-round-id={replay.roundId}><i style={{background:replay.color}} /><strong>{replay.teamName}<small>ROUND {roundById.get(replay.roundId) ?? 1} · FINISHED</small></strong><span>{formatTime(replay.elapsedMs)}s</span><div className="card-action-row"><button className="game-button small secondary" disabled={eventLogLoading===replay.roundId} onClick={()=>onEventLog(replay.roundId)}>{eventLogLoading===replay.roundId?'Loading…':'Event Log'}</button><button className="game-button small secondary" disabled={replayLoading===replay.roundId} onClick={()=>onReplay(replay.roundId)}><Radio size={14}/>{replayLoading===replay.roundId?'Loading…':'Replay'}</button></div></article>)}</div></>}</div></section></TeamPreviewProvider>;
}
function LiveCard({ room, roundNumber, clockOffset, now, onFocus, onEventLog }: { room: Room; roundNumber:number; clockOffset: number; now: number; onFocus: () => void; onEventLog:()=>void }) {
  const done = room.round?.tasks.filter(task => task.status === 'DONE').length ?? 0;
  return <article className="live-card" style={{ borderTopColor: room.color }} data-room-id={room.id}><div className="row between"><span className="status-tag"><i />{room.status === 'COUNTDOWN' ? 'COUNTDOWN' : 'LIVE'}</span><span className="muted">{room.players.length}H / {15-room.players.length}B</span></div><TeamPreview room={room} clockOffset={clockOffset} /><h3>{room.name}<small className="live-round-label">ROUND {roundNumber}</small></h3><strong className="observer-time">{room.status === 'COUNTDOWN' ? now<room.round!.goAt?`GO IN ${Math.ceil((room.round!.goAt-now)/1000)}`:'GO!':formatTime(elapsed(room.round,now))}<small>{room.status!=='COUNTDOWN' && 's'}</small></strong><div className="observer-progress"><span style={{width:`${done/21*100}%`}} /></div><div className="row between live-card-actions"><span>{done}/21 COMPLETE</span><div className="card-action-row"><button className="game-button small secondary" onClick={onEventLog}>Event Log</button><button className="game-button small secondary" onClick={onFocus}>Watch <ArrowRight size={13}/></button></div></div></article>;
}
