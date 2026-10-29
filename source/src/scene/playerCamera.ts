export type PlayerCameraMode='overview'|'first-person'|'third-person';
export const PLAYER_CAMERA_OPTIONS=[{mode:'overview',label:'Overview'},{mode:'first-person',label:'First person'},{mode:'third-person',label:'Third person'}] as const;
type Point={x:number;y:number;z:number};
/** Follow the rendered actor, including kneeling, carrying and retreat. */
export function playerCameraPose(mode:Exclude<PlayerCameraMode,'overview'>,root:Point,head:Point,forward:Point){
 const position=mode==='first-person'?{x:head.x+forward.x*.27,y:head.y+.025,z:head.z+forward.z*.27}:{x:root.x-forward.x*1.65,y:root.y+3.6,z:root.z-forward.z*1.65};
 const distance=mode==='first-person'?1.4:.7;
 return {position,target:{x:root.x+forward.x*distance,y:root.y+.60,z:root.z+forward.z*distance},fov:mode==='first-person'?75:55,near:mode==='first-person'?.04:.1};
}
