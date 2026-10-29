import type { Role } from '../types';
export type Crew = { role?: Role; x: number; z: number; angle?: number; kind: 'gun' | 'off' | 'on' | 'jack' | 'release' | 'ambient'; support?: 'sidepod' | 'nose' };
export const CORNER_POSITIONS = [['FL', -1.12, -1.58], ['FR', 1.12, -1.58], ['RL', -1.12, 1.42], ['RR', 1.12, 1.42]] as const;
export const CREW: Crew[] = CORNER_POSITIONS.flatMap(([corner, x, z]) => {
  const side = Math.sign(x);
  return [
    { role: `${corner}_GUNNER` as Role, x: x + side * .83, z, angle: side * Math.PI / 2, kind: 'gun' as const },
    { role: `${corner}_WHEEL_OFF` as Role, x: x + side * 2.35, z: z + .95, angle: side * Math.PI / 2, kind: 'off' as const },
    { role: `${corner}_WHEEL_ON` as Role, x: x + side * 2.65, z: z - 1.05, angle: side * Math.PI / 2, kind: 'on' as const },
  ];
});
CREW.push(
  { role: 'FRONT_JACK', x: 0, z: -4.78, angle: Math.PI, kind: 'jack' },
  { role: 'REAR_JACK', x: 0, z: 4.03, kind: 'jack' },
  { role: 'RELEASE_CONTROLLER', x: 3.61, z: -3.11, angle: Math.PI / 2, kind: 'release' },
  { x: -1.37, z: .19, angle: -Math.PI / 2, kind: 'ambient', support: 'sidepod' },
  { x: 1.37, z: .19, angle: Math.PI / 2, kind: 'ambient', support: 'sidepod' },
  { x: -1.62, z: -3.2, angle: -Math.PI / 3, kind: 'ambient', support: 'nose' },
  { x: 1.62, z: -3.2, angle: Math.PI / 3, kind: 'ambient', support: 'nose' },
  { x: -7, z: 4.4, angle: -Math.PI / 2, kind: 'ambient' },
  { x: 6.5, z: -4.4, angle: Math.PI / 2, kind: 'ambient' },
  { x: -7.5, z: -1.3, angle: Math.PI / 3, kind: 'ambient' },
);

/** Chassis/wing footprints from the actual original meshes, not one giant rectangle. */
export const CAR_BODY_FOOTPRINTS = [
  { halfX: .96, minZ: -.74, maxZ: 1.62 }, // sidepods / monocoque
  { halfX: .4, minZ: -2.83, maxZ: -.74 }, // tapered nose, conservatively bounded
  { halfX: 1.5, minZ: -3.35, maxZ: -2.7 }, // front wing and end plates
  { halfX: 1.12, minZ: 1.78, maxZ: 2.4 }, // rear wing
  ...CORNER_POSITIONS.map(([,x,z])=>({ halfX: Math.abs(x)+.215, minZ:z-.44, maxZ:z+.44, outerWheel:true })),
] as const;

/** Body-only support footprint; hands are deliberately allowed to contact the car. */
export function clearsCarEnvelope(x: number, z: number, carZ = 0, radius = .22): boolean {
  return CAR_BODY_FOOTPRINTS.every(part => {
    if ('outerWheel' in part && part.outerWheel && Math.abs(x) < .88-radius) return true;
    return Math.abs(x)-radius>part.halfX || z+radius<part.minZ+carZ || z-radius>part.maxZ+carZ;
  });
}
export function supportCrewClear(carZ = 0, retreat = 0): boolean {
  return CREW.filter(c=>c.kind==='ambient').every(c=>{
    const x = Math.abs(c.x)<2.4 ? c.x+(Math.sign(c.x)*2.7-c.x)*retreat : c.x;
    // Nose feet can sit below the raised wing. The torso is explicitly shifted
    // outward by its local .13m pelvis offset, rather than moving the whole bot away.
    const torsoX=x+(c.support==='nose'?Math.sin(c.angle??0)*.13:0);
    const torsoZ=c.z+(c.support==='nose'?Math.cos(c.angle??0)*.13:0);
    return clearsCarEnvelope(torsoX,torsoZ,carZ,c.support==='sidepod'?.20:.22);
  });
}

export function supportHandAnchors(crew: Crew, axleLift = 0): [number,number,number][] {
  const side = Math.sign(crew.x);
  if (crew.support === 'sidepod') return [-.21,.21].map(dz=>{
    const z=crew.z-side*dz;
    // Actual .57m-wide sidepod, centred at (+/-.61,.52), yawed .08rad.
    // The glove's .09m radius rests on the outer face instead of inside it.
    const surfaceX=.61+.285/Math.cos(.08)-Math.tan(.08)*(z-.52);
    return [side*(surfaceX+.09),.71+axleLift,z];
  });
  // Front endplate top is .615m. A .095m glove sits on top of it.
  if (crew.support === 'nose') return [-.16,.16].map(dz=>[side*1.43,.71+axleLift,-3.08+dz]);
  return [];
}

export type PosePoint = readonly [number, number, number];
/** A planted half-kneel in actor-local coordinates (forward is -Z).
 * Separate knee/ankle anchors avoid the old rigid-leg floating squat. The
 * opposite world-side is produced by each corner's existing facing rotation.
 */
export function gunnerKneelingPose(work = 0) {
  const effort=Math.sin(Math.max(0,Math.min(1,work))*Math.PI);
  return {
    hipY:.46,
    torsoY:-.10-effort*.025,
    torsoZ:.075-effort*.025,
    lean:.10+effort*.045,
    legs:[
      {hip:[-.115,.46,.075] as PosePoint,knee:[-.19,.34,-.265] as PosePoint,ankle:[-.19,.10,-.39] as PosePoint,foot:[-.19,.075,-.43] as PosePoint},
      {hip:[.115,.46,.075] as PosePoint,knee:[.19,.095,.19] as PosePoint,ankle:[.19,.10,.53] as PosePoint,foot:[.19,.075,.49] as PosePoint},
    ],
  };
}

const smooth = (value:number) => {const p=Math.max(0,Math.min(1,value));return p*p*(3-2*p);};
/** Clear the unchanged wheel-carrier corridor after loosening. A gunner rises
 * and steps outward, then returns before tightening. It never reaches through
 * an approaching carrier or keeps the gun stretched across the empty hub. */
export function gunnerHandoff(loosenPhase:number|null,loosenDone:boolean,tightenPhase:number|null,tightenDone:boolean):number {
  if(tightenDone)return 0;
  if(tightenPhase!==null)return 1-smooth(tightenPhase/.22);
  if(loosenDone)return 1;
  return loosenPhase===null?0:smooth((loosenPhase-.65)/.35);
}

/** Existing, approved carrier routes, kept numerically identical. */
export function wheelCarrierPosition(kind:'off'|'on',spec:Crew,corner:{x:number;z:number},phase:number) {
  const side=Math.sign(spec.x),p=Math.max(0,Math.min(1,phase));
  if(kind==='off'){
    const approach=smooth(p/.22),retreat=smooth((p-.25)/.75);
    return {x:spec.x+(corner.x+side*.64-spec.x)*approach+side*retreat*1.55,z:spec.z+(corner.z-spec.z)*approach+retreat*.83};
  }
  const approach=smooth(p/.78),retreat=smooth((p-.86)/.14);
  return {x:spec.x+(corner.x+side*.66-spec.x)*approach+side*retreat*1.02,z:spec.z+(corner.z-spec.z)*approach-retreat*.55};
}
