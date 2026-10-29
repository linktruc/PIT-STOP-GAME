import type { AnimationReceipt } from './animation';
import type { Crew } from './crew';
const smooth=(v:number)=>{const p=Math.max(0,Math.min(1,v));return p*p*(3-2*p);};
export const OLD_WHEEL_REMOVE_MS=900;
export const OLD_WHEEL_CARRY_MS=900;
export const OLD_WHEEL_LOWER_MS=280;
export const OLD_WHEEL_RELEASE_MS=180;
/** New-wheel staff enter once the outgoing carrier clears the shared corridor. */
export function oldWheelCarryClearAt(receipt:AnimationReceipt){
  return receipt.startsAt+Math.max(OLD_WHEEL_REMOVE_MS,receipt.endsAt-receipt.startsAt)*.875+OLD_WHEEL_CARRY_MS*.5;
}
/** Visual-only follow-through. Removing a wheel frees the hub before the
 * mechanic has finished carrying and setting the old tyre on the ground. */
export function oldWheelMotion(spec:Crew,corner:{x:number;z:number},receipt:AnimationReceipt|undefined,now:number){
  if(!receipt||now<receipt.startsAt)return null;
  const side=Math.sign(spec.x),duration=Math.max(OLD_WHEEL_REMOVE_MS,receipt.endsAt-receipt.startsAt);
  const t=now-receipt.startsAt,approach=smooth(t/(duration*.675));
  const extract=smooth((t-duration*.675)/(duration*.20));
  const carryAt=duration*.875;
  const carry=smooth((t-carryAt)/OLD_WHEEL_CARRY_MS);
  const lower=smooth((t-carryAt-OLD_WHEEL_CARRY_MS)/OLD_WHEEL_LOWER_MS);
  const release=smooth((t-carryAt-OLD_WHEEL_CARRY_MS-OLD_WHEEL_LOWER_MS)/OLD_WHEEL_RELEASE_MS);
  const discard={x:corner.x+side*4.4,y:.44,z:corner.z+1.1};
  const pickup={x:corner.x+side*.64,z:corner.z};
  const station={x:discard.x+side*.66,z:discard.z};
  const x=spec.x+(pickup.x-spec.x)*approach+(station.x-pickup.x)*carry;
  const z=spec.z+(pickup.z-spec.z)*approach+(station.z-pickup.z)*carry;
  const crouch=approach*(1-extract)+lower*(1-release);
  return {x,z,approach,extract,carry,lower,release,discard,crouch,
    walking:4*approach*(1-approach)+4*carry*(1-carry),
    placedAt:receipt.startsAt+carryAt+OLD_WHEEL_CARRY_MS+OLD_WHEEL_LOWER_MS};
}
