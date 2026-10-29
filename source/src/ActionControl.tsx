import { Check, ChevronRight, LoaderCircle, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { playCue } from './audio';
import { actionLabel } from './view';
import type { Room, Task } from './types';

const cornerNames: Record<string, string> = {FL:'front-left', FR:'front-right', RL:'rear-left', RR:'rear-right'};
/** Describe actual outstanding DAG prerequisites, without inventing a serial wheel order. */
export function pendingDependency(room: Room, task: Task | undefined, countdown: boolean): string {
 if (countdown) return 'Wait for GO signal';
 if (!task) return 'Your part is complete. The team clock runs until release.';
 if (task.status === 'AVAILABLE') return 'Watch the crew. Tap or press Space when it is time.';
 const pending = task.dependencies.filter(id => room.round?.tasks.find(t=>t.id===id)?.status !== 'DONE');
 if (!pending.length) return 'Wait for the next server update';
 if (task.id.endsWith('_LOWER')) {
  const end=task.id.startsWith('FRONT')?'front':'rear';
  return `Wait for both ${end} wheel nuts to be tightened`;
 }
 if (task.id==='GREEN_RELEASE') return 'Wait for both jacks to lower and all wheels to be secured';
 const corner=cornerNames[task.id.slice(0,2)]??'correct';
  if (task.id.endsWith('_LIFT')) return 'Wait for GO signal';
 if (pending.some(id=>id.endsWith('_LIFT'))) return `Wait for the ${task.id.startsWith('F')?'front':'rear'} jack to lift the car`;
 if (pending.some(id=>id.endsWith('GUN_LOOSEN'))) return `Wait for crew to loosen the ${corner} wheel nut`;
 if (pending.some(id=>id.endsWith('WHEEL_OFF'))) return `Wait for crew to remove the ${corner} wheel`;
 if (pending.some(id=>id.endsWith('WHEEL_ON'))) return `Wait for crew to fit the new ${corner} wheel`;
 return 'Wait for crew to secure the wheels';
}

export default function ActionControl({room,playerId,now,busy,onAction}: {room: Room;playerId: string;now: number;busy: string;onAction:(task:Task)=>Promise<void>}) {
 const round=room.round!;const tasks=round.tasks.filter(t=>t.ownerId===playerId);const task=tasks.find(t=>t.status==='AVAILABLE')??tasks.find(t=>t.status!=='DONE');
 const countdown=now<round.goAt;const done=!task;
 const penalty=round.penalties?.[playerId];const locked=(penalty?.until??0)>now;
 // The two-second penalty starts at the press itself, even during 3–2–1.
 const remaining=Math.max(0,(penalty?.until??0)-now);
 const seconds=(Math.ceil(remaining/100)/10).toFixed(1);
 const enabled=!!task&&task.status==='AVAILABLE'&&!countdown&&room.status==='RUNNING'&&!locked;
 const previous=useRef<number|null>(null);const [flash,setFlash]=useState(false);
 useEffect(()=>{if(penalty&&penalty.at!==previous.current){previous.current=penalty.at;if(penalty.until>now){playCue('error');setFlash(true);const t=setTimeout(()=>setFlash(false),500);return()=>clearTimeout(t);}}},[penalty?.at]);
 return <><div className="action-hint"><span>{locked?`Too early — ${seconds}s lockout`:pendingDependency(room,task,countdown)}</span>{locked&&<small>{countdown?'Penalty started immediately.':'The team clock keeps running.'}</small>}</div>
 <button className={`game-button action-button ${done?'secondary complete':'gold'} ${locked?'penalized':''} ${flash?'penalty-flash':''}`} disabled={!!busy||done||locked} aria-disabled={!enabled} data-ready={enabled} data-penalty-until={penalty?.until??0} onClick={()=>task&&void onAction(task)}>{busy?<LoaderCircle className="spin" size={25}/>:done?<Check size={25}/>:<Zap size={25}/>}<span>{locked?`Too early — ${seconds}s lockout`:done?'ACTION COMPLETE':task?actionLabel(task):'ACTION COMPLETE'}<small>{locked?'PERSONAL LOCKOUT':done?'THANK YOU, CREW':'TAP OR PRESS SPACE'}</small></span>{!done&&!locked&&<ChevronRight size={22}/>}</button>
 <span className="early-press-notice">Early press = 2s lockout.</span></>;
}
