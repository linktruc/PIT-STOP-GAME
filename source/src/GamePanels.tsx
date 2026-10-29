import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowRight, Check, ChevronDown, Crown, Flag, LoaderCircle, LockKeyhole, Trash2, Trophy, Users, X } from 'lucide-react';
import type { Room, Snapshot } from './types';
import { roleLabel } from './types';
import { formatTime } from './view';
import { TEAM_COLORS } from './teamColors';

export function OverlayFrame({ title, eyebrow, children, onClose, wide = false, className = '', busy = false }: { title: string; eyebrow: string; children: ReactNode; onClose: () => void; wide?: boolean; className?: string; busy?: boolean }) {
  const panel = useRef<HTMLDivElement>(null);
  const close = useRef(onClose); close.current = onClose;
  const locked = useRef(busy); locked.current = busy;
  useEffect(() => {
    const prior = document.activeElement as HTMLElement | null;
    const first = panel.current?.querySelector<HTMLElement>('input,button'); first?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !locked.current) { event.stopPropagation(); close.current(); }
      if (event.key !== 'Tab' || !panel.current) return;
      const items = Array.from(panel.current.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),a[href],[tabindex="0"]'));
      if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1)?.focus(); }
      else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0]?.focus(); }
    };
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('keydown', key); prior?.focus(); };
  }, []);
  return <div className="overlay-backdrop" onPointerDown={event => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <section className={`game-overlay ${wide ? 'wide' : ''} ${className}`} ref={panel} role="dialog" aria-modal="true" aria-label={title}>
      <header className="overlay-heading"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div><button className="icon-control danger close-panel-control" onClick={onClose} disabled={busy} aria-label="Close panel"><X size={20} /></button></header>
      <div className="overlay-content">{children}</div>
    </section>
  </div>;
}

export function RoomBrowser({ rooms, loaded, myRoom, onJoin, onCreate }: { rooms: Room[]; loaded: boolean; myRoom: Room | null; onJoin: (room: Room) => void; onCreate: () => void }) {
  const joinable = rooms.filter(room => room.status === 'WAITING' && room.players.length < 15);
  return <div className="room-browser"><div className="panel-intro"><p>Find your crew. Claim your position.</p><button className="game-button small primary" onClick={onCreate}>Create Team <ArrowRight size={15} /></button></div>
    {!loaded ? <Empty text="Connecting to the pit lane…" /> : !joinable.length ? <Empty text="No open teams yet. Create one to get started." /> : <div className="room-grid">{joinable.map(room => <article className="lobby-card" key={room.id} style={{ borderTopColor: room.color }}>
      <div className="row between"><span className="status-tag"><i />WAITING</span><span className="mono"><Users size={13} /> {room.players.length}/15</span></div><h3>{room.name}</h3>
      <p><Crown size={13} /> Host: {room.players.find(player => player.id === room.hostId)?.nickname ?? 'Transferring…'}</p>
      <div className="lobby-ready">{Array.from({ length: 15 }, (_, i) => <i key={i} className={i < room.players.filter(player => player.ready).length ? 'ready' : i < room.players.length ? 'occupied' : ''} />)}</div>
      <div className="row between"><span className="muted">{room.players.filter(player => player.ready).length} ready</span><button className="game-button small secondary" onClick={() => onJoin(room)} disabled={!!myRoom}>Join Team <ArrowRight size={14} /></button></div>
    </article>)}</div>}
    {myRoom && <p className="panel-note">You already have a player seat. Leave your current team before joining another.</p>}
  </div>;
}

export function NewCrewForm({ room, busy, configured, blocked, onSubmit }: { room?: Room; busy: boolean; configured: boolean; blocked: boolean; onSubmit: (name: string, nickname: string, color: string) => void }) {
  const [name, setName] = useState(''); const [nickname, setNickname] = useState(''); const [color, setColor] = useState('#f4493b');
  return <form className="create-form" onSubmit={event => { event.preventDefault(); onSubmit(name.trim(), nickname.trim(), color); }}>
    <p className="panel-description">{room ? `Take a place with ${room.name}.` : 'One room. One team. You host and play.'}</p>
    {blocked && <p className="inline-warning">Leave your current team before creating or joining another.</p>}
    {!room && <label>TEAM NAME<input required minLength={2} maxLength={40} placeholder="e.g. Apex Collective" value={name} onChange={event => setName(event.target.value)} autoComplete="off" /></label>}
    <label>YOUR NICKNAME<input required minLength={2} maxLength={24} placeholder="Your crew calls you…" value={nickname} onChange={event => setNickname(event.target.value)} autoComplete="nickname" /></label>
    {!room && <fieldset className="accent-picker"><legend>CREW COLOR</legend><div>{TEAM_COLORS.map(item => <button key={item} type="button" style={{ background: item }} className={color === item ? 'selected' : ''} onClick={() => setColor(item)} aria-label={`Choose ${item} color`} aria-pressed={color === item}>{color === item && <Check size={17} />}</button>)}</div></fieldset>}
    <p className="panel-note">Nicknames, roles and results are public. Each real teammate joins on their own device.</p>
    {!configured && <p role="alert" className="inline-warning">Online teams require Supabase configuration. Set the project URL and public key in config.js, then reload. Solo Test works offline.</p>}
    <button className="game-button primary full" disabled={!configured || busy || blocked || nickname.trim().length < 2 || (!room && name.trim().length < 2)}>{busy ? <LoaderCircle className="spin" size={18} /> : <Flag size={18} />}{room ? 'Join Team' : 'Create Team'}<ArrowRight size={18} /></button>
  </form>;
}

export function CrewRoster({ room, myId, busy, onKick }: { room: Room; myId: string | null; busy: boolean; onKick: (id: string) => void }) {
  return <div className="crew-drawer"><div className="roster-caption"><span>{room.players.length} HUMAN</span><span>{15 - room.players.length} CORE BOTS</span><span>7 SUPPORT</span></div><div className="roster-list">{room.players.map((player, index) => <div className={`roster-person ${player.id === myId ? 'is-you' : ''}`} key={player.id}>
    <span className="seat-number">{String(index + 1).padStart(2, '0')}</span><div><strong>{player.nickname}{player.id === room.hostId && <span className="host-badge"><Crown size={10} />HOST</span>}{player.id === myId && <span className="you-tag">YOU</span>}</strong><small>{roleLabel(player.role)}</small></div>
    <span className={`readiness ${player.ready ? 'ready' : ''}`}>{player.connected === false ? 'Offline' : room.status === 'WAITING' ? player.ready ? 'Ready' : 'Not ready' : 'In position'}</span>
    {myId === room.hostId && player.id !== myId && room.status === 'WAITING' && <button className="icon-control danger" disabled={busy} aria-label={`Remove ${player.nickname}`} onClick={() => onKick(player.id)}><X size={15} /></button>}
  </div>)}</div><p className="panel-note">Roles are assigned by the server. Roles and Ready stay unchanged when other players join or leave. All fifteen core roles stay in the graph; unfilled roles are adaptive bots.</p></div>;
}

export function Leaderboard({ state, onDelete }: { state: Snapshot; onDelete: (teamId?: string, resultId?: string, label?: string) => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  return <div className="standings"><div className="standings-caption"><Trophy size={16} /><span>Teams are ranked by their average pit stop time across completed rounds</span></div>
    {!state.leaderboard.length ? <Empty text="No times on the board. Your crew could be first." /> : state.leaderboard.map((entry, index) => <div className="standings-team" key={entry.teamId}>
      <div className="standings-row"><span className="rank">{String(index + 1).padStart(2, '0')}</span><button className="standing-name" onClick={() => setExpanded(expanded === entry.teamId ? null : entry.teamId)}><i style={{ background: entry.color }} /><span>{entry.name}<small>{entry.rounds.length} rounds · Best {formatTime(entry.bestMs)}s</small></span><ChevronDown size={15} /></button><strong>{formatTime(entry.averageMs)}<small>s</small></strong>{state.identity.isAdmin && <button className="icon-control danger" aria-label={`Delete ${entry.name} results`} onClick={() => onDelete(entry.teamId, undefined, `all results for ${entry.name}`)}><Trash2 size={15} /></button>}</div>
      {expanded === entry.teamId && <div className="round-history">{entry.rounds.map((result, roundIndex) => <div key={result.id}><span>ROUND {String(roundIndex + 1).padStart(2, '0')}</span><strong>{formatTime(result.elapsedMs)}s</strong>{state.identity.isAdmin && <button className="icon-control danger" aria-label={`Delete round ${roundIndex + 1}`} onClick={() => onDelete(undefined, result.id, `round ${roundIndex + 1} for ${entry.name}`)}><Trash2 size={13} /></button>}</div>)}</div>}
    </div>)}
  </div>;
}

export function AdminForm({busy,onSubmit,configured,onlineSeat=false}: {busy:boolean;onSubmit:(username:string,password:string)=>void;configured:boolean;onlineSeat?:boolean}) {
 const [username,setUsername]=useState('admin');const [password,setPassword]=useState('');const [confirmed,setConfirmed]=useState(false);
 if (!configured) return <div className="admin-backend-needed"><LockKeyhole size={26}/><p>Global administration requires a connection to Supabase.</p><p className="panel-note">Configure your Supabase project URL and public key in config.js, then reload. Solo Test remains available.</p></div>;
 return <form className="create-form" onSubmit={event=>{event.preventDefault();if(!onlineSeat || confirmed)onSubmit(username,password);}}><p className="panel-description">Use your configured Supabase admin username and its current password. Leaderboard viewing is public.</p><label>ADMIN USERNAME<input type="text" required value={username} onChange={event=>setUsername(event.target.value)} autoComplete="username"/></label><label>PASSWORD<input type="password" required value={password} onChange={event=>setPassword(event.target.value)} autoComplete="current-password"/></label>{onlineSeat && <label className="admin-seat-confirm"><input type="checkbox" checked={confirmed} onChange={event=>setConfirmed(event.target.checked)}/><span>Leave my online team before signing in. An active attempt will end; completed results stay saved.</span></label>}<button className={`game-button ${onlineSeat ? 'danger' : 'primary'} full`} disabled={busy || (onlineSeat && !confirmed)}><LockKeyhole size={17}/>{busy?'Signing in…':onlineSeat?'Leave Team & sign in':'Sign in'}</button></form>;
}

export function DeleteForm({ label, busy, onSubmit }: { label: string; busy: boolean; onSubmit: () => void }) {
  const [confirm, setConfirm] = useState('');
  return <form className="create-form" onSubmit={event => { event.preventDefault(); if (confirm === 'DELETE') onSubmit(); }}><p className="panel-description">Permanently delete {label}. This cannot be undone.</p><label>TYPE DELETE TO CONFIRM<input required pattern="DELETE" value={confirm} onChange={event => setConfirm(event.target.value)} autoComplete="off" placeholder="DELETE" /></label><button className="game-button primary full" disabled={busy || confirm !== 'DELETE'}><Trash2 size={17} />Delete results</button></form>;
}

export function HowToPlay() {
  const steps = [
    'Create or join a team of 4–15 players.',
    'Find your gold YOU marker and read your assigned role.',
    'Everyone marks Ready; the host starts the round.',
    'Watch 3… 2… 1… GO! The car stops and the team clock starts.',
    'Watch the crew and workflow, then tap your action button or press Space at the right time.',
    'An early press causes a 2s personal lockout while the team clock keeps running.',
    'Teams rank by their average pit stop time across completed rounds.',
  ];
  return <ol className="quick-playbook">{steps.map(step=><li key={step}>{step}</li>)}</ol>;
}

function Empty({ text }: { text: string }) { return <div className="empty-panel"><Users size={26} /><p>{text}</p></div>; }
