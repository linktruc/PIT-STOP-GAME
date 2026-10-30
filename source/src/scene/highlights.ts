import type {Room,Role} from '../types';
export function crewHighlight(room:Room|null|undefined,role:Role|undefined,now:number){
 const player=role?room?.players.find(p=>p.role===role):undefined;
 const penalty=player?room?.round?.penalties?.[player.id]:undefined;
 const active=room?.status==='COUNTDOWN'||room?.status==='RUNNING';
 const remaining=active&&penalty&&penalty.at<=now?Math.max(0,penalty.until-now):0;
 return {human:!!player,humanWaiting:!!player&&room?.status==='WAITING',remaining,locked:remaining>0};
}
