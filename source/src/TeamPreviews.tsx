import { createContext, memo, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import * as THREE from 'three';
import type { Room } from './types';
import { createPitGarageScene, type PitView } from './scene/garage';
import { PreviewSchedule } from './scene/previewSchedule';
export function activePreviewRooms(rooms:Room[]) { return rooms.filter(r=>r.status==='COUNTDOWN'||r.status==='RUNNING'); }
type Entry={room:Room;visible:boolean;view:PitView|null;touched:number;clockOffset:number};
/** One GPU context, full garage instances with independent receipts, bounded visible-world cache. */
export class PreviewPool {
 entries=new Map<HTMLCanvasElement,Entry>();renderer:THREE.WebGLRenderer|null=null;
 observer:IntersectionObserver;timer=0;renderCost=0;unavailable=false;schedule=new PreviewSchedule<HTMLCanvasElement>();
 resolutionScale=1;nextResolutionCheck=0;
 constructor() {
  try {this.renderer=new THREE.WebGLRenderer({antialias:false,alpha:false,powerPreference:'low-power'});this.renderer.setPixelRatio(1);this.renderer.setSize(320,180,false);}catch{this.unavailable=true;}
  this.observer=new IntersectionObserver(items=>{for(const item of items){const entry=this.entries.get(item.target as HTMLCanvasElement);if(entry)entry.visible=item.isIntersecting;}});
  const tick=(now:number)=>{this.draw(now);this.timer=requestAnimationFrame(tick);};
  this.timer=requestAnimationFrame(tick);
 }
 add(canvas:HTMLCanvasElement,room:Room,clockOffset=0){this.entries.set(canvas,{room,visible:false,view:null,touched:0,clockOffset});this.observer.observe(canvas);}
 update(canvas:HTMLCanvasElement,room:Room,clockOffset=0){const entry=this.entries.get(canvas);if(entry){entry.room=room;entry.clockOffset=clockOffset;entry.view?.update(room,null,true,undefined,Date.now()+clockOffset);}}
 remove(canvas:HTMLCanvasElement){this.entries.get(canvas)?.view?.dispose();this.entries.delete(canvas);this.observer.unobserve(canvas);}
 draw(now=performance.now()){
  if(document.hidden)return;
  const visible=[...this.entries].filter(([,e])=>e.visible);if(!visible.length)return;
  // Resize slowly with hysteresis: heavy GPUs retain movement before thumbnail detail.
  if(now>=this.nextResolutionCheck&&this.renderCost>0){
   if(this.renderCost>24)this.resolutionScale=Math.max(.5,this.resolutionScale*.8);
   else if(this.renderCost<8)this.resolutionScale=Math.min(1,this.resolutionScale*1.1);
   this.nextResolutionCheck=now+1500;
  }
  const chosen=this.schedule.pick(visible.map(([canvas])=>canvas),now,this.renderCost>10?1:2);
  for(const canvas of chosen){
   const entry=this.entries.get(canvas)!;const base=visible.length<=2?Math.min(384,Math.max(288,Math.ceil(canvas.clientWidth/16)*16)):256;
   const resolution=Math.round(base*this.resolutionScale/16)*16;if(canvas.width!==resolution){canvas.width=resolution;canvas.height=resolution*9/16;}
   if(this.renderer&&this.renderer.domElement.width!==resolution)this.renderer.setSize(resolution,resolution*9/16,false);
   const ctx=canvas.getContext('2d');if(!ctx)continue;
   const before=performance.now();entry.touched=before;
   if(this.renderer&&!this.unavailable){
    if(!entry.view){
     const cached=[...this.entries].filter(([,e])=>e.view).sort((a,b)=>a[1].touched-b[1].touched);
     const inactive=cached.find(([,e])=>!e.visible);
     if(cached.length>=8&&inactive){inactive[1].view?.dispose();inactive[1].view=null;}
     entry.view=createPitGarageScene(canvas,{quality:'low',renderer:this.renderer,manual:true,setFallback:bad=>{if(bad)this.unavailable=true;}});
     entry.view?.update(entry.room,null,true,undefined,Date.now()+entry.clockOffset);
    }
    entry.view?.render(now);
    if(!this.unavailable){ctx.drawImage(this.renderer.domElement,0,0,canvas.width,canvas.height);canvas.dataset.previewMode='3d';canvas.dataset.previewFrames=String(Number(canvas.dataset.previewFrames??0)+1);}
   }
   if(this.unavailable||!this.renderer){
    ctx.fillStyle='#132532';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#96c7c8';ctx.font='bold 12px monospace';ctx.fillText('3D UNAVAILABLE · LIVE 2D',16,40);
    const done=entry.room.round?.tasks.filter(t=>t.status==='DONE').length??0;ctx.fillStyle='#ef493a';ctx.fillRect(145,65,30,65);ctx.fillRect(117,68,86,8);ctx.fillStyle='#75cdb5';ctx.fillRect(16,154,288*done/21,3);ctx.fillText(`${done}/21 actions complete`,16,175);canvas.dataset.previewMode='2d';
   }
   canvas.dataset.progress=String(entry.room.round?.tasks.filter(t=>t.status==='DONE').length??0);canvas.dataset.roomId=entry.room.id;canvas.dataset.previewContexts='1';
   const cost=performance.now()-before;this.renderCost=this.renderCost*.8+cost*.2;canvas.dataset.previewRenderMs=cost.toFixed(2);
  }
 }
 dispose(){cancelAnimationFrame(this.timer);this.observer.disconnect();for(const [,entry]of this.entries)entry.view?.dispose();this.entries.clear();this.renderer?.dispose();this.renderer?.forceContextLoss();}
}
const Context=createContext<PreviewPool|null>(null);
export function TeamPreviewProvider({children}:{children:ReactNode}){
 const [pool,setPool]=useState<PreviewPool|null>(null);
 const [desktop,setDesktop]=useState(()=>window.matchMedia('(min-width: 768px)').matches);
 useEffect(()=>{const media=window.matchMedia('(min-width: 768px)');const resize=()=>setDesktop(media.matches);media.addEventListener('change',resize);return()=>media.removeEventListener('change',resize);},[]);
 // Mobile overview intentionally creates neither a canvas nor a GPU context. Selecting a team
 // still mounts the full PitScene. Resize disposes the desktop pool instead of merely hiding it.
 useEffect(()=>{if(!desktop){setPool(null);return;}const p=new PreviewPool();setPool(p);return()=>{p.dispose();};},[desktop]);
 return <Context.Provider value={pool}>{children}</Context.Provider>;
}
export const TeamPreview=memo(function TeamPreview({room,clockOffset=0}:{room:Room;clockOffset?:number}){
 const pool=useContext(Context);const canvas=useRef<HTMLCanvasElement>(null);
 const active=activePreviewRooms([room]).length>0;
 useEffect(()=>{if(!pool||!canvas.current||!active)return;const target=canvas.current;pool.add(target,room,clockOffset);return()=>pool.remove(target);},[pool,active]);
 useEffect(()=>{if(canvas.current)pool?.update(canvas.current,room,clockOffset);},[pool,room,clockOffset]);
 if(!pool||!active)return null;
 return <canvas className="live-card-preview" ref={canvas} width="320" height="180" aria-label={`${room.name} full pit lane live preview`}/>;
});
