import { Info } from 'lucide-react';
import { memo } from 'react';
import { roleLabel, type Room } from './types';
export default memo(function RoleCard({room,playerId,onExpand}: {room: Room;playerId: string;onExpand: ()=>void}) {
 const player=room.players.find(p=>p.id===playerId)!;
 return <aside className="role-card role-strip"><div className="role-identity"><span>YOUR ROLE:</span><h2>{roleLabel(player.role)}</h2></div><button className="role-details-toggle" onClick={onExpand} aria-label={`Role details: ${roleLabel(player.role)}`}>Tap for more details <Info size={13}/></button></aside>;
});
