import { useEffect, useRef, useState } from 'react';
import type { Room } from './types';
import { LiveSceneAudio } from './scene/liveAudio';
import { teamCrewColor } from './scene/colors';
import { CREW, CORNER_POSITIONS } from './scene/crew';
import { createPitGarageScene, type PitView, type CrewSelection } from './scene/garage';
type Props={room?:Room|null;playerId?:string|null;quality?:'low'|'high';className?:string;active?:boolean;presentationTime?:number;serverNow?:number;clockOffset?:number;poseRevision?:number;onTaskCue?:(taskId:string)=>void};
function description(room?: Room | null, playerId?: string | null, presentationTime?: number) {
  const player = room?.players.find(item => item.id === playerId);
  return `Interactive 3D pit lane. Drag to rotate. 22 crew members, 15 core roles. ${player ? `You are ${player.role.replaceAll('_', ' ').toLowerCase()}. Gold YOU marker shows your crew member. ` : ''}${room ? `${room.name}. ${room.round?.tasks.filter(task => task.status === 'DONE' && (presentationTime===undefined || task.completedAt!==null && task.completedAt<=presentationTime)).length ?? 0} of 21 actions complete.` : 'Pit crew ready.'}`;
}

function Fallback({ room, playerId, presentationTime }: { room?: Room | null; playerId?: string | null; presentationTime?:number }) {
  const mine = room?.players.find(player => player.id === playerId)?.role;
  const tasks = (room?.round?.tasks ?? []).map(task=>presentationTime===undefined?task:{...task,status:task.completedAt!==null&&task.completedAt<=presentationTime?'DONE':task.enabledAt!==null&&task.enabledAt<=presentationTime?'AVAILABLE':'LOCKED'});
  return <div className="pit-scene-fallback" style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 55% 50%, #283b3d, #10171e 75%)', display: 'grid', placeItems: 'center' }}>
    <svg viewBox="-6 -5.6 12 11.6" style={{ height: '100%', width: '100%', maxHeight: 900 }} aria-label="Live 2D pit lane with your gold YOU marker">
      <defs><pattern id="pit-tiles" width="1" height="1" patternUnits="userSpaceOnUse"><path d="M1 0H0V1" fill="none" stroke="#a5d4dc" strokeOpacity=".08" strokeWidth=".015" /></pattern></defs>
      <rect x="-6" y="-5.6" width="12" height="11.6" fill="url(#pit-tiles)" />
      <path d="M-4.5 -5V4.3H4.5V-5" fill="none" stroke="#e8b835" strokeWidth=".075" />
      <path d="M-1.5 -3.15H1.5V-2.7H-1.5zM-.95 1.95H.95V2.4H-.95z" fill="#eb292f" />
      <path d="M-.14 -3.1L-.45 -1.7 -.78 -.8 -.72 1.5 -.32 2.2H.32L.72 1.5 .78 -.8 .45 -1.7 .14 -3.1Z" fill="#f03238" />
      <path d="M-.1 -2.95H.1L.17 -.5H-.17Z" fill="#fff8eb" /><ellipse cx="0" cy=".03" rx=".29" ry=".52" fill="#0a131c" />
      {CORNER_POSITIONS.map(([key, x, z]) => {
        const off = tasks.find(t => t.id === `${key}_WHEEL_OFF`)?.status === 'DONE';
        const on = tasks.find(t => t.id === `${key}_WHEEL_ON`)?.status === 'DONE';
        return <rect key={key} x={x - .22} y={z - .39} width=".44" height=".78" rx=".1" opacity={off && !on ? .14 : 1} fill="#0b1017" stroke={on ? '#70e5b7' : '#596775'} strokeWidth=".06" />;
      })}
      {CREW.map((crew, index) => {
        const you = !!crew.role && crew.role === mine;
        const available = tasks.some(task => task.role === crew.role && task.status === 'AVAILABLE');
        const complete = tasks.some(task => task.role === crew.role) && tasks.filter(task => task.role === crew.role).every(task => task.status === 'DONE');
        return <g key={index} transform={`translate(${crew.x} ${crew.z})`}>
          {you && <><circle r=".38" fill="#efc74d22" stroke="#ffda57" strokeWidth=".05" /><text className="you-marker" y="-.51" textAnchor="middle" fill="#ffda57" fontSize=".22" fontWeight="bold">YOU{available ? ' • READY' : complete ? ' ✓' : ''}</text></>}
          <rect x="-.18" y="-.08" width=".36" height=".37" rx=".07" fill={crew.role ? teamCrewColor(room) ?? '#e9343b' : '#5e6d79'} /><circle cy="-.13" r=".16" fill={crew.role ? teamCrewColor(room) ?? '#fa453c' : '#5e6d79'} /><path d="M-.11 -.12H.11" stroke="#111e2b" strokeWidth=".1" />
        </g>;
      })}
      <text x="0" y="5.1" textAnchor="middle" fill="#c3d7db" fontSize=".18" fontFamily="monospace">LIVE PIT MAP · 22 CREW · 3D UNAVAILABLE</text>
    </svg>
  </div>;
}


export default function PitScene({room,playerId,quality='high',className='',active=true,presentationTime,serverNow,clockOffset,poseRevision,onTaskCue}:Props) {
 const host=useRef<HTMLDivElement>(null),marker=useRef<HTMLDivElement>(null),tooltip=useRef<HTMLButtonElement>(null);
 const view=useRef<PitView|null>(null);const latest=useRef({room,playerId,active,presentationTime,serverNow,clockOffset,poseRevision,onTaskCue});latest.current={room,playerId,active,presentationTime,serverNow,clockOffset,poseRevision,onTaskCue};
 const fallbackAudio=useRef(new LiveSceneAudio());
 const [selected,setSelected]=useState<CrewSelection>(null);const [fallback,setFallback]=useState(false);
 useEffect(()=>{if(!host.current)return;const world=createPitGarageScene(host.current,{quality,marker,tooltip,setSelected,setFallback,onTaskCue:taskId=>latest.current.onTaskCue?.(taskId)});view.current=world;if(world)world.update(latest.current.room,latest.current.playerId,latest.current.active,latest.current.presentationTime,latest.current.serverNow,latest.current.clockOffset,latest.current.poseRevision);return()=>{world?.dispose();view.current=null;};},[quality]);
 useEffect(()=>{view.current?.update(room,playerId,active,presentationTime,serverNow,clockOffset,poseRevision);},[room,playerId,active,presentationTime,serverNow,clockOffset,poseRevision]);
 useEffect(()=>{
  if(!fallback||presentationTime!==undefined)return;
  const round=room?.round,now=Date.now()+(room?.solo?0:clockOffset??0);
  const receipts=(round?.tasks??[]).filter(t=>t.status==='DONE'&&t.completedAt!==null).map(t=>({roundId:round!.id,taskId:t.id,startsAt:t.completedAt!,endsAt:t.completedAt!+250}));
  for(const id of fallbackAudio.current.poll(round?.id??null,now,receipts))if(active&&!document.hidden)onTaskCue?.(id);
 },[fallback,room,presentationTime,clockOffset,active,onTaskCue]);
 const myRole=room?.players.find(p=>p.id===playerId)?.role??'';
 return <div ref={host} className={`pit-scene ${className}`} role="region" aria-label={description(room,playerId,presentationTime)} data-player-role={myRole} data-crew-count="22" data-core-crew="15" data-support-crew="7" style={{position:'relative',width:'100%',height:'100%',overflow:'hidden',isolation:'isolate'}}>
 {selected&&<button ref={tooltip} className="crew-tooltip" aria-label={`Selected crew: ${selected.name}, ${selected.role}. Click to close.`} onClick={()=>view.current?.deselect()}><strong>{selected.name}</strong><span>{selected.role}</span></button>}
 {fallback?<Fallback room={room} playerId={playerId} presentationTime={presentationTime}/>:<div ref={marker} className="you-marker" aria-label={`YOU: ${myRole.replaceAll('_',' ').toLowerCase()}`} style={{position:'absolute',top:0,left:0,pointerEvents:'none',display:myRole?'block':'none',zIndex:5,background:'#ffd457',color:'#1d2630',font:'900 12px Arial,sans-serif',letterSpacing:1,padding:'6px 12px',borderRadius:5}}>YOU<span aria-hidden="true" style={{position:'absolute',left:'calc(50% - 5px + var(--you-pointer-offset, 0px))',bottom:-5,width:10,height:10,background:'#ffd457',transform:'rotate(45deg)'}}/></div>}
 </div>;
}
