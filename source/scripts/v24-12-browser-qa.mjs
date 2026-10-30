import {chromium} from 'playwright';
import assert from 'node:assert/strict';import fs from 'node:fs';
const out='docs/v24-12-evidence';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({...(process.platform==='win32'?{channel:'msedge'}:{}),headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const errors=[],report={};
try{
 const page=await browser.newPage({viewport:{width:1000,height:800}});page.setDefaultTimeout(90000);page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5173/scripts/v24-9-camera-qa.html?sceneDebug=1',{timeout:90000});await page.waitForFunction(()=>window.initCamera);
 report.camera=[];
 for(const mode of ['first-person','third-person']){
  const start=await page.evaluate(m=>window.initCamera(m),mode);await page.mouse.move(400,300);await page.mouse.down();await page.mouse.move(600,330,{steps:8});await page.mouse.up();
  const drag=await page.evaluate(()=>window.advanceCamera());assert(drag.follow.yaw>start.follow.yaw+.8);assert(drag.follow.pitch<start.follow.pitch-.1);
  await page.keyboard.press('ArrowRight');const key=await page.evaluate(()=>window.advanceCamera());assert(key.follow.yaw>drag.follow.yaw+.1);
  const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true});
  const before=await page.evaluate(m=>window.initCamera(m),mode);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:300,y:300,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:500,y:330,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  const touch=await page.evaluate(()=>window.advanceCamera());assert(touch.follow.yaw>before.follow.yaw+.8);assert(touch.follow.pitch<before.follow.pitch-.1);report.camera.push({mode,start,drag,key,before,touch});await cdp.detach();
 }
 await page.goto('http://127.0.0.1:5173/scripts/v24-12-presentation-qa.html?sceneDebug=1',{timeout:90000});await page.waitForFunction(()=>window.initHighlights);
 const waiting=await page.evaluate(()=>window.initHighlights());assert.equal(waiting.crew.filter(c=>c.humanVisible).length,1);assert.equal(waiting.crew.find(c=>c.humanVisible).role,'FL_GUNNER');
 await page.screenshot({path:out+'/waiting-human.png'});
 const countdown=await page.evaluate(()=>window.stageHighlights('COUNTDOWN')),running=await page.evaluate(()=>window.stageHighlights('RUNNING')),expired=await page.evaluate(()=>window.stageHighlights('RUNNING',12000));
 for(const stage of [countdown,running]){assert(stage.crew.every(c=>!c.humanVisible));assert.equal(stage.crew.filter(c=>c.redVisible).length,1);assert.equal(stage.crew.find(c=>c.redVisible).role,'FL_GUNNER');assert(stage.labels.includes('LOCKOUT 1.0s'));}
 assert(expired.crew.every(c=>!c.redVisible));assert.equal(expired.labels.length,0);report.highlights={waiting,countdown,running,expired};
 await page.evaluate(()=>window.stageHighlights('RUNNING'));await page.screenshot({path:out+'/lockout-red.png'});
 // Separate page without expensive sceneDebug probes: real shared-context rendering.
 await page.goto('http://127.0.0.1:5173/scripts/v24-12-presentation-qa.html',{timeout:90000});await page.waitForFunction(()=>window.initPreviews);await page.evaluate(()=>window.initPreviews(2));
 await page.waitForFunction(()=>window.previewStats().every(x=>x.frames>=5));const a=await page.evaluate(()=>({at:performance.now(),stats:window.previewStats()}));await page.waitForTimeout(2500);const b=await page.evaluate(()=>({at:performance.now(),stats:window.previewStats()}));
 const fps=b.stats.map((s,i)=>(s.frames-a.stats[i].frames)*1000/(b.at-a.at));assert(b.stats.every(s=>s.mode==='3d'&&s.contexts==='1'));assert(fps.every(f=>f>8),JSON.stringify(fps));report.previews={a,b,fps,renderer:'Edge SwiftShader software WebGL'};
 await page.screenshot({path:out+'/watch-live.png'});await page.evaluate(()=>window.stopPreviews());assert.equal(errors.length,0,errors.join('\n'));report.errors=errors;
 fs.writeFileSync(out+'/browser.json',JSON.stringify(report,null,2));console.log(JSON.stringify({camera:'mouse/touch axes and keyboard passed',highlights:'waiting/countdown/running/expiry passed',previewFps:fps,errors}));
}finally{await browser.close();}
