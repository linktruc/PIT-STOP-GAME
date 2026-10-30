import {chromium} from 'playwright';import assert from 'node:assert/strict';import fs from 'node:fs';
const out='docs/v24-13-evidence';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({...(process.platform==='win32'?{channel:'msedge'}:{}),headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:900,height:700}}),errors=[],report=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5173/scripts/v24-13-lockout-qa.html?sceneDebug=1',{timeout:90000});await page.waitForFunction(()=>window.initLockout);
 for(const quality of ['high','low']){
  await page.evaluate(q=>window.initLockout(q),quality);
  for(const mode of ['overview','first-person','third-person']){
   const state=await page.evaluate(m=>window.showLockout(m),mode),target=state.crew.find(c=>c.role==='RELEASE_CONTROLLER'),viewer=state.crew.find(c=>c.role==='REAR_JACK');
   assert(target.locked&&target.redVisible&&target.bodyRed);assert(!viewer.locked&&!viewer.bodyRed);report.push({quality,...state});
   if(mode==='overview'&&quality==='high'){assert(state.labels.includes('LOCKOUT 1.0s'));await page.screenshot({path:out+'/desktop-peer-lockout.png'});}
  }
  const expired=await page.evaluate(()=>window.showLockout('overview',12000));assert(expired.crew.every(c=>!c.locked&&!c.bodyRed));
 }
 assert.equal(errors.length,0,errors.join('\n'));fs.writeFileSync(out+'/pov.json',JSON.stringify({report,errors},null,2));console.log('Peer lockout body/ring states pass all three cameras at HIGH and ECO; expiry and frozen WebGL capture passed.');
}finally{await browser.close();}
