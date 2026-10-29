import { ROLES, roleLabel, type Role } from './types';
export default function SoloRolePicker({role,busy,onChange}: {role:Role;busy:boolean;onChange:(role:Role)=>void}) {
 const groups=[['Jacks',ROLES.filter(r=>r.endsWith('_JACK'))],...(['FL','FR','RL','RR'] as const).map((corner,index)=>[['Front-left wheel','Front-right wheel','Rear-left wheel','Rear-right wheel'][index],ROLES.filter(r=>r.startsWith(corner+'_'))]),['Release signal',['RELEASE_CONTROLLER']]] as [string,Role[]][];
 return <label className="solo-role-picker"><span>Choose role</span><select aria-label="Choose role" title={roleLabel(role)} value={role} disabled={busy} onChange={e=>onChange(e.target.value as Role)}>{groups.map(([name,roles])=><optgroup label={name} key={name}>{roles.map(r=><option value={r} key={r}>{r.endsWith("_GUNNER") ? "Gunner" : r.endsWith("_WHEEL_OFF") ? "Old-wheel remover" : r.endsWith("_WHEEL_ON") ? "New-wheel fitter" : roleLabel(r)}</option>)}</optgroup>)}</select></label>;
}
