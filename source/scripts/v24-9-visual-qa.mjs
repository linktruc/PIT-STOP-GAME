import {chromium} from 'playwright';
import fs from 'node:fs';
const browser=await chromium.launch({...(process.platform==='win32'?{channel:'msedge'}:{}),headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const out='docs/v24-9-evidence';fs.mkdirSync(out,{recursive:true});
try {
 const page=await browser.newPage({viewport:{width:960,height:720},deviceScaleFactor:1});page.setDefaultTimeout(90000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{localStorage.setItem('pit-v7-quality','low');localStorage.setItem('pit-v7-volume','0');});
 await page.goto('http://127.0.0.1:5173/?sceneDebug=1');
 await page.getByRole('button',{name:/Solo Test/}).evaluate(e=>e.click());
 await page.getByRole('group',{name:'Camera mode'}).waitFor();
 const modes=[];
 for(const [label,mode] of [['Overview','overview'],['First person','first-person'],['Third person','third-person']]){
  await page.getByRole('button',{name:label+' camera',exact:true}).evaluate(e=>e.click());
  await page.waitForFunction(mode=>JSON.parse(document.querySelector('.scene-stage .pit-scene').dataset.playerCamera).mode===mode,mode);
  modes.push(await page.locator('.scene-stage .pit-scene').evaluate(e=>JSON.parse(e.dataset.playerCamera)));
  await page.screenshot({path:out+'/'+mode+'.png'});
 }
 await page.goto('http://127.0.0.1:5173/scripts/v24-8-gunner-camera-qa.html?sceneDebug=1');
 await page.waitForFunction(()=>window.captureGunner);await page.evaluate(()=>window.captureGunner());
 for(const [name,time]of [['early-gunner',10060],['loosen-gunner',10760],['tighten-gunner',12100]]){
  await page.evaluate(t=>window.drawGunner(t),time);await page.screenshot({path:out+'/'+name+'.png',clip:{x:0,y:0,width:800,height:600}});
 }
 await page.evaluate(()=>window.endGunner());
 await page.goto('http://127.0.0.1:5173/?sceneDebug=1');await page.getByRole('button',{name:/Solo Test/}).evaluate(e=>e.click());
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:out+'/mobile-camera.png'});
 const mobile=await page.getByRole('group',{name:'Camera mode'}).boundingBox();
 const usable=await page.getByRole('group',{name:'Camera mode'}).evaluate(e=>[...e.querySelectorAll('button')].every(b=>{const r=b.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===b;}));
 if(!usable)throw Error('Camera buttons obscured');
 if(mobile.x<0||mobile.x+mobile.width>391)throw Error('Camera controls overflow');
 if(errors.length)throw Error(errors.join('\n'));
 fs.writeFileSync(out+'/app-camera-ui.json',JSON.stringify({modes,mobile,errors},null,2));
 console.log({modes,mobile});
} finally {await browser.close();}
