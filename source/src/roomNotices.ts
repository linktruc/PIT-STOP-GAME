import type {Room} from './types';

/** Compare accepted room snapshots; initial loads and reconnects keep quiet. */
export function roomNotices(before:Room|undefined,after:Room|undefined,myId:string|null):string[]{
 if(!before||!after||before.id!==after.id||after.solo||!after.players.some(p=>p.id===myId))return [];
 const messages:string[]=[];
 const previousIds=new Set(before.players.map(p=>p.id));
 const joined=after.players.filter(p=>!previousIds.has(p.id)&&p.id!==myId);
 if(joined.length)messages.push(`${joined.map(p=>p.nickname).join(', ')} joined your team.`);
 if(before.hostId!==after.hostId)messages.push(after.hostId===myId
  ?'You are now the host. You can start rounds and choose Play again.'
  :`${after.players.find(p=>p.id===after.hostId)?.nickname??'Another crew member'} is now the host.`);
 const oldPlayer=before.players.find(p=>p.id===myId),player=after.players.find(p=>p.id===myId);
 if(oldPlayer&&player&&oldPlayer.role!==player.role)messages.push(player.roleNotice??'Your role changed to keep a human jack in the crew. Check your role and mark Ready again.');
 else if(player?.roleNotice&&player.roleNotice!==oldPlayer?.roleNotice)messages.push(player.roleNotice);
 return messages;
}
