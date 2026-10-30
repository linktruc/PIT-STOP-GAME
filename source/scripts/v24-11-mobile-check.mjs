import {chromium} from 'playwright';
import fs from 'node:fs';import assert from 'node:assert/strict';
const out='docs/v24-11-evidence';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({...(process.platform==='win32'?{channel:'msedge'}:{}),headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:390,height:735},isMobile:true,hasTouch:true,deviceScaleFactor:1});page.setDefaultTimeout(90000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5173/scripts/v24-11-mobile-qa.html?sceneDebug=1',{waitUntil:'domcontentloaded',timeout:90000});await page.waitForSelector('.hud-dock');
 const measure=()=>page.evaluate(()=>{const box=s=>{const e=document.querySelector(s),r=e?.getBoundingClientRect();return r?{x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom}:null;};const wf=box('.mini-chain'),dock=box('.hud-dock'),nav=box('.top-hud');return {wf,dock,nav,camera:box('.mobile-camera-switch'),role:box('.role-card'),action:box('.action-button'),gap:dock?dock.y-wf.bottom:null,overflow:document.documentElement.scrollWidth>innerWidth};});
 await page.evaluate(()=>window.showStage('running'));await page.waitForSelector('.action-button');
 const css=await page.evaluate(()=>{const sheet=document.querySelector('style[data-vite-dev-id$="v24-11-mobile-hud.css"]');const text=sheet.textContent;sheet.remove();const hide=document.createElement('style');hide.id='before-camera';hide.textContent='.mobile-camera-switch{display:none}';document.head.append(hide);return text;});
 await page.screenshot({path:out+'/before-390.png'});const before=await measure();
 await page.evaluate(css=>{document.querySelector('#before-camera').remove();const sheet=document.createElement('style');sheet.textContent=css;document.head.append(sheet);},css);
 await page.screenshot({path:out+'/after-390.png'});const after=await measure();assert(after.gap>before.gap+80);assert(after.action.height>=44);assert(after.dock.height<125);assert(after.wf.height<=46);
 const reports=[];
 for(const [w,h]of [[320,568],[360,640],[390,735],[430,800]]){
  await page.setViewportSize({width:w,height:h});
  for(const stage of ['waiting','countdown','running','penalty','completed']){
   await page.evaluate(stage=>window.showStage(stage),stage);await page.waitForTimeout(260);const m=await measure();assert(!m.overflow);assert(m.camera.x>=0&&m.camera.x+m.camera.width<=w);assert(m.camera.height>=32);
   const navItems=await page.locator('.back-menu,.mobile-camera-switch,.leave-crew-control,.sound-control,.more-control').evaluateAll(elements=>elements.filter(e=>e.getBoundingClientRect().width).map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom};}));
   for(let i=0;i<navItems.length;i++){assert(navItems[i].right<=w);for(let j=i+1;j<navItems.length;j++){const a=navItems[i],b=navItems[j];assert(a.right<=b.x+.5||b.right<=a.x+.5||a.bottom<=b.y||b.bottom<=a.y,'Navigation overlap');}}
   if(m.dock){assert(m.gap>h*.4);assert(m.dock.bottom<=h);const button=page.locator('.action-button');if(await button.count()){const r=await button.boundingBox();assert(r.height>=44);assert(await button.evaluate(b=>{const r=b.getBoundingClientRect();return b.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}));}}
   reports.push({w,h,stage,...m});
  }
 }
 await page.setViewportSize({width:390,height:735});await page.evaluate(()=>window.showStage('running',false));await page.waitForSelector('.action-button');
 const modes=[];for(let i=0;i<3;i++){await page.getByRole('button',{name:/Switch camera:/}).click();await page.waitForTimeout(150);modes.push(await page.locator('.pit-scene').evaluate(e=>JSON.parse(e.dataset.playerCamera).mode));}assert.deepEqual(modes,['first-person','third-person','overview']);
 await page.evaluate(()=>window.showStage('running'));await page.waitForTimeout(200);await page.getByRole('button',{name:/Role details:/}).click();await page.getByRole('dialog').waitFor();assert.match(await page.getByRole('dialog').getAttribute('aria-label'),/gunner/i);await page.getByRole('button',{name:'Close panel'}).click();
 await page.setViewportSize({width:1280,height:900});assert(!await page.getByRole('button',{name:/Switch camera:/}).isVisible());assert(await page.getByRole('group',{name:'Camera mode'}).isVisible());await page.screenshot({path:out+'/desktop.png'});
 await page.setViewportSize({width:844,height:390});assert(await page.getByRole('button',{name:/Switch camera:/}).isVisible());const landscapeCamera=await page.getByRole('button',{name:/Switch camera:/}).boundingBox();assert(landscapeCamera.y<50);await page.screenshot({path:out+'/landscape.png'});
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/layout.json',JSON.stringify({before,after,modes,reports,errors},null,2));console.log({beforeGap:before.gap,afterGap:after.gap,layouts:reports.length,modes,errors});
}finally{await browser.close();}
