import {chromium} from 'playwright';
import assert from 'node:assert/strict';import fs from 'node:fs';
const browser=await chromium.launch({...(process.platform==='win32'?{channel:'msedge'}:{}),headless:true});
try{
 const page=await browser.newPage({viewport:{width:800,height:600}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5173/scripts/v24-9-camera-qa.html?sceneDebug=1');await page.waitForFunction(()=>window.initCamera);
 const results=[];
 for(const mode of ['first-person','third-person']){
  const start=await page.evaluate(mode=>window.initCamera(mode),mode);
  await page.mouse.move(400,300);await page.mouse.down();await page.mouse.move(650,360,{steps:10});await page.mouse.up();
  const drag=await page.evaluate(()=>window.advanceCamera());assert(Math.abs(start.follow.yaw-drag.follow.yaw)>.9);assert(Math.abs(start.follow.pitch-drag.follow.pitch)>.1);
  await page.keyboard.press('ArrowRight');const keyboard=await page.evaluate(()=>window.advanceCamera());assert(keyboard.follow.yaw>drag.follow.yaw+.1);
  await page.mouse.wheel(0,200);const zoom=await page.evaluate(()=>window.advanceCamera());if(mode==='third-person')assert(zoom.follow.distance>keyboard.follow.distance);
  const stable=await page.evaluate(()=>window.advanceCamera());assert(Math.abs(stable.follow.yaw-zoom.follow.yaw)<.001);results.push({mode,start,drag,keyboard,zoom,stable});
 }
 // Real touch events: swipe and two-finger pinch through the canvas handlers.
 const cdp=await page.context().newCDPSession(page);await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:true});
 const touchStart=await page.evaluate(()=>window.initCamera('third-person'));
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:300,y:300,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:500,y:350,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 const swipe=await page.evaluate(()=>window.advanceCamera());assert(Math.abs(swipe.follow.yaw-touchStart.follow.yaw)>.8);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:300,y:300,id:1},{x:500,y:300,id:2}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:250,y:300,id:1},{x:550,y:300,id:2}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 const pinch=await page.evaluate(()=>window.advanceCamera());assert(pinch.follow.distance<swipe.follow.distance-.5);assert.equal(errors.length,0,errors.join('\n'));
 fs.mkdirSync('docs/v24-9-evidence',{recursive:true});fs.writeFileSync('docs/v24-9-evidence/camera-input.json',JSON.stringify({results,swipe,pinch,errors},null,2));console.log('Mouse, keyboard, wheel, touch swipe and pinch passed');
}finally{await browser.close();}
