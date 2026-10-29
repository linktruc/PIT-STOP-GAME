import {chromium} from 'playwright';
import fs from 'node:fs';
const browser=await chromium.launch({channel:process.platform==='win32'?'msedge':undefined,headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=await browser.newPage({viewport:{width:500,height:400}});
await page.goto((process.env.PIT_QA_URL??'http://127.0.0.1:5173')+'/scripts/v24-scene-qa.html?sceneDebug=1');
await page.waitForFunction(()=>window.qa&&document.querySelector('#scene').dataset.toolPairs);
fs.mkdirSync('docs/v24-evidence',{recursive:true});
const rows=[];
for(const role of ['FRONT_JACK','REAR_JACK','FL_GUNNER','RR_GUNNER','FL_WHEEL_OFF','RR_WHEEL_ON','RELEASE_CONTROLLER']){
 await page.evaluate(role=>window.qa.reset(role),role);
 let finished=null;
 for(let time=7000;time<=40000;time+=400){
  const state=await page.evaluate(time=>{
   const qa=window.qa;qa.reconcile(qa.round,time);
   for(const task of qa.round.tasks.filter(t=>t.ownerId&&t.status==='AVAILABLE'&&t.enabledAt+2000<=time))qa.submitAction(qa.round,'you',task.id,time,task.id);
   qa.show(time);return {status:qa.round.status,finished:qa.round.finishedAt};
  },time);
  await page.waitForTimeout(40);
  const data=await page.locator('#scene').evaluate(el=>({contacts:JSON.parse(el.dataset.toolContacts),pairs:JSON.parse(el.dataset.toolPairs),grip:Math.max(...Object.values(JSON.parse(el.dataset.heldToolErrors))),departure:Number(el.dataset.carDeparture)}));
  rows.push({role,time,...data});
  if(state.status==='COMPLETED')finished=state.finished;
  if(role==='FRONT_JACK'&&[10000,14000,18000].includes(time))await page.screenshot({path:`docs/v24-evidence/cycle-${time}.png`});
  if(finished&&time>finished+6000)break;
 }
 fs.writeFileSync('docs/v24-evidence/cycle-qa-results.json',JSON.stringify(rows,null,2));console.log(role,'checked; errors',rows.filter(r=>r.role===role&&(r.contacts.length||r.pairs.length||r.grip>.005)).length);
}
fs.writeFileSync('docs/v24-evidence/cycle-qa-results.json',JSON.stringify(rows,null,2));
const failures=rows.filter(r=>r.contacts.length||r.pairs.length||r.grip>.005);
console.log('Frames',rows.length,'failures',failures.length,'max grip',Math.max(...rows.map(r=>r.grip)));
console.log(JSON.stringify(failures.slice(0,35),null,2));
await browser.close();
if(failures.length)process.exitCode=1;

