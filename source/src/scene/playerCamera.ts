import {SmoothValue} from './easing';
export type PlayerCameraMode='overview'|'first-person'|'third-person';
export const PLAYER_CAMERA_OPTIONS=[{mode:'overview',label:'Overview'},{mode:'first-person',label:'First person'},{mode:'third-person',label:'Third person'}] as const;
type Point={x:number;y:number;z:number};
/** Follow the rendered actor, including kneeling, carrying and retreat. */
export function playerCameraPose(mode:Exclude<PlayerCameraMode,'overview'>,root:Point,head:Point,forward:Point){
 const position=mode==='first-person'?{x:head.x+forward.x*.27,y:head.y+.025,z:head.z+forward.z*.27}:{x:root.x-forward.x*1.65,y:root.y+3.6,z:root.z-forward.z*1.65};
 const distance=mode==='first-person'?1.4:.7;
 return {position,target:{x:root.x+forward.x*distance,y:root.y+.60,z:root.z+forward.z*distance},fov:mode==='first-person'?75:55,near:mode==='first-person'?.04:.1};
}

/** Free look has its own heading: animated shoulders never steer the player.
 * Smooth the anchor, not the actor or authoritative work clock. */
export class PlayerCameraRig {
 private mode:PlayerCameraMode='overview';private identity='';private at:number|null=null;
 private anchor=[new SmoothValue(),new SmoothValue(),new SmoothValue()];
 private yaw=new SmoothValue();private pitch=new SmoothValue();private distance=new SmoothValue(4.2);
 private wantedYaw=0;private wantedPitch=0;private wantedDistance=4.2;
 reset(){this.at=null;}
 /** Drag-the-scene camera controls (same on mouse, pen and touch).
  * Drag/swipe LEFT => LOOK RIGHT; drag RIGHT => LOOK LEFT.
  * This follows the grabbed scenery rather than steering the look direction.
  * Drag/swipe up still tilts the view upward.
  * The same camera-space axes apply to Cam 1 and Cam 3 on
  * every input device. Normalize by canvas height (as OrbitControls does)
  * so an equivalent swipe fraction rotates by the same amount on phones
  * and computers. Keep the legacy default 600px for external callers. */
 drag(dx:number,dy:number,_pointerType='mouse',viewportHeight=600){
  const height=Math.max(360,Math.min(1200,viewportHeight));
  const sensitivity=3/height;
  // Cap one-frame spikes (e.g. pointer capture resuming after interruption).
  const boundedDx=Math.max(-180,Math.min(180,dx));
  const boundedDy=Math.max(-180,Math.min(180,dy));
  this.turn(-boundedDx*sensitivity,-boundedDy*sensitivity);
 }
 turn(horizontal:number,vertical:number){this.wantedYaw+=horizontal;this.wantedPitch=Math.max(this.mode==='first-person'?-1.25:.12,Math.min(this.mode==='first-person'?1.25:1.48,this.wantedPitch+vertical));}
 zoom(scale:number){if(this.mode==='third-person')this.wantedDistance=Math.max(1.7,Math.min(7.5,this.wantedDistance*scale));}
 sample(mode:Exclude<PlayerCameraMode,'overview'>,root:Point,head:Point,forward:Point,now:number,identity:string){
  const changed=this.at===null||this.identity!==identity||mode!==this.mode||now<this.at||now-this.at>1000;
  const dt=changed?0:Math.min(100,now-this.at!);this.at=now;this.identity=identity;
  const targetAnchor=mode==='first-person'?[head.x+forward.x*.27,head.y+.025,head.z+forward.z*.27]:[root.x,root.y+.8,root.z];
  if(changed){
   this.mode=mode;this.wantedYaw=Math.atan2(forward.x,-forward.z);this.wantedPitch=mode==='first-person'?-.35:1.0;this.wantedDistance=4.2;
   this.yaw.reset(this.wantedYaw);this.pitch.reset(this.wantedPitch);this.distance.reset(this.wantedDistance);this.anchor.forEach((v,i)=>v.reset(targetAnchor[i]));
  }
  const [x,y,z]=this.anchor.map((v,i)=>v.step(targetAnchor[i],dt,.09));
  const yaw=this.yaw.step(this.wantedYaw,dt,.055),pitch=this.pitch.step(this.wantedPitch,dt,.055),distance=this.distance.step(this.wantedDistance,dt,.08);
  const direction={x:Math.sin(yaw)*Math.cos(pitch),y:Math.sin(pitch),z:-Math.cos(yaw)*Math.cos(pitch)};
  const position=mode==='first-person'?{x,y,z}:{x:x-direction.x*distance,y:y+direction.y*distance,z:z-direction.z*distance};
  const target=mode==='first-person'?{x:x+direction.x*3,y:y+direction.y*3,z:z+direction.z*3}:{x,y,z};
  return {position,target,fov:mode==='first-person'?75:55,near:mode==='first-person'?.04:.1,yaw,pitch,distance};
 }
}
