import {chromium} from 'playwright';
import assert from 'node:assert/strict';import fs from 'node:fs';
import {createDatabase,owner,rpc,userId} from '../tests/helpers/database.ts';
const out='docs/v24-13-evidence';fs.mkdirSync(out,{recursive:true});const report={};
const browser=await chromium.launch({...(process.platform==='win32'?{channel:'msedge'}:{}),headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
let db;const errors=[],testPages=[];
try{
 const camera=await browser.newPage({viewport:{width:900,height:700}});camera.setDefaultTimeout(90000);camera.on('pageerror',e=>errors.push(e.message));
 await camera.goto('http://127.0.0.1:5173/scripts/v24-9-camera-qa.html?sceneDebug=1',{timeout:90000});await camera.waitForFunction(()=>window.initCamera);report.camera=[];
 for(const [mode,pointer,xSign,ySign]of [['first-person','mouse',1,-1],['first-person','touch',-1,1],['third-person','mouse',-1,1],['third-person','touch',1,1]]){
  const cdp=await camera.context().newCDPSession(camera);await cdp.send('Emulation.setTouchEmulationEnabled',{enabled:pointer==='touch'});
  for(const [dx,dy]of [[150,0],[-150,0],[0,30],[0,-30]]){
   const a=await camera.evaluate(m=>window.initCamera(m),mode);
   if(pointer==='mouse'){await camera.mouse.move(400,300);await camera.mouse.down();await camera.mouse.move(400+dx,300+dy,{steps:5});await camera.mouse.up();}
   else {await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:400,y:300,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:400+dx,y:300+dy,id:1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
   const b=await camera.evaluate(()=>window.advanceCamera());assert(Math.abs(b.follow.yaw-a.follow.yaw-dx*.005*xSign)<.01);assert(Math.abs(b.follow.pitch-a.follow.pitch-dy*.005*ySign)<.01);report.camera.push({mode,pointer,dx,dy,yaw:b.follow.yaw-a.follow.yaw,pitch:b.follow.pitch-a.follow.pitch});
  }
  await cdp.detach();
 }
 await camera.close();
 console.log('16 native mouse/touch directions passed');fs.writeFileSync(out+'/camera.json',JSON.stringify(report.camera,null,2));
 db=await createDatabase();const call=(n,op,room=null,payload={})=>rpc(db,userId(n),op,room,payload);
 let snapshot=await call(1,'create',null,{name:'Cross-device QA',nickname:'Old host',color:'#578fff'});const roomId=snapshot.rooms[0].id;
 for(let n=2;n<=4;n++)snapshot=await call(n,'join',roomId,{nickname:n===2?'Desktop crew':n===3?'Phone crew':'Crew 4'});
 const desktopContext=await browser.newContext({viewport:{width:1440,height:900}}),phoneContext=await browser.newContext({viewport:{width:390,height:735},isMobile:true,hasTouch:true});
 const desktop=await desktopContext.newPage(),phone=await phoneContext.newPage(),pages=[desktop,phone];
 testPages.push(...pages);
 for(const [i,page]of pages.entries()){page.setDefaultTimeout(90000);page.on('pageerror',e=>errors.push(e.message));await page.exposeFunction('qaRpc',(op,room,payload)=>call(i+2,op,room,payload));}
 await Promise.all(pages.map(async page=>{await page.goto('http://127.0.0.1:5173/scripts/v24-13-room-qa.html',{timeout:90000});await page.waitForSelector('.host-control-note');await page.waitForFunction(()=>document.querySelector('.pit-scene')?.dataset.sceneModel);}));
 await call(5,'join',roomId,{nickname:'New teammate'});await Promise.all(pages.map(p=>p.evaluate(()=>window.qaRefresh())));
 report.joinNotice=await Promise.all(pages.map(async p=>{const toast=p.getByRole('status').filter({hasText:'New teammate joined your team.'});await toast.waitFor();return toast.innerText();}));
 await call(1,'leave',roomId);await Promise.all(pages.map(p=>p.evaluate(()=>window.qaRefresh())));
 await desktop.getByText('You are now the host.',{exact:false}).first().waitFor();await desktop.locator('.host-control-note[data-host=true]').waitFor();await phone.locator('.host-control-note[data-host=false]').waitFor();
 assert.equal(await desktop.getByRole('button',{name:'Start round'}).count(),1);assert.equal(await phone.getByRole('button',{name:'Start round'}).count(),0);
 report.departureHostNotice=await desktop.locator('.game-toast').innerText();
 await phone.screenshot({path:out+'/phone-ready-guest.png'});await desktop.screenshot({path:out+'/desktop-ready-host.png'});
 for(let n=2;n<=5;n++)await call(n,'ready',roomId,{ready:true});snapshot=await call(2,'start',roomId);
 await Promise.all(pages.map(p=>p.evaluate(()=>window.qaRefresh())));await Promise.all(pages.map(p=>p.waitForSelector('.action-button')));
 await new Promise(resolve=>setTimeout(resolve,Math.max(0,snapshot.rooms[0].round.goAt+1000-Date.now())));
 const target=snapshot.rooms[0].players.find(p=>p.nickname==='Phone crew'),task=snapshot.rooms[0].round.tasks.find(t=>t.ownerId===target.id);
 const start=Date.now();await call(3,'early_action',roomId,{taskId:task.id,requestId:'cross-device-lockout'});
 const lockouts=await Promise.all(pages.map(async p=>{await p.waitForFunction(()=>[...document.querySelectorAll('.crew-lockout-tag')].some(e=>e.style.display!=='none'&&e.textContent.includes('LOCKOUT')),null,{timeout:1900});return p.evaluate(()=>({at:Date.now(),labels:[...document.querySelectorAll('.crew-lockout-tag')].filter(e=>e.style.display!=='none').map(e=>e.textContent)}));}));
 report.peerLockout={target:target.role,desktopDelay:lockouts[0].at-start,phoneDelay:lockouts[1].at-start,lockouts};assert(lockouts[0].labels.some(s=>s.includes('LOCKOUT')));
 await desktop.screenshot({path:out+'/desktop-live-after-lockout.png'});
 await Promise.all(pages.map(p=>p.waitForFunction(()=>[...document.querySelectorAll('.crew-lockout-tag')].every(e=>e.style.display==='none'),null,{timeout:5000})));
 const roundId=snapshot.rooms[0].round.id;
 // A saved completed snapshot exercises result controls; task timing is covered by engine tests.
 await owner(db,`update pit_private.tasks set status='DONE',enabled_at=coalesce(enabled_at,1000),completed_at=coalesce(enabled_at,1000)+3000 where round_id='${roundId}';update pit_private.rounds set status='COMPLETED',elapsed_ms=3000,finished_at=go_at+3000 where id='${roundId}';update pit_private.rooms set status='COMPLETED' where id='${roomId}';`);
 await Promise.all(pages.map(p=>p.evaluate(()=>window.qaRefresh())));await desktop.locator('.result-overlay .host-control-note[data-host=true]').waitFor();await phone.getByText('Only the host can choose Play again.',{exact:true}).waitFor();
 assert.equal(await desktop.getByRole('button',{name:'Play again',exact:true}).count(),1);assert.equal(await phone.getByRole('button',{name:'Play again',exact:true}).count(),0);await phone.screenshot({path:out+'/phone-result-guest.png'});
 await owner(db,`update pit_private.members set last_seen_at=pit_private.clock_ms()-300001 where user_id='${userId(2)}';select pit_private.cleanup_presence();`);
 await phone.evaluate(()=>window.qaRefresh());await phone.locator('.result-overlay .host-control-note[data-host=true]').waitFor();await phone.getByText('You are now the host.',{exact:false}).first().waitFor();
 report.offlineHostNotice=await phone.locator('.game-toast').innerText();assert.equal(await phone.getByRole('button',{name:'Play again',exact:true}).count(),1);await phone.screenshot({path:out+'/phone-result-promoted-host.png'});
 await phone.getByRole('button',{name:'Play again',exact:true}).click();await phone.locator('.action-console .host-control-note[data-host=true]').waitFor();
 const layout=await phone.locator('.hud-dock').boundingBox();assert(layout.height<160);report.phoneReadyDock=layout;
 await Promise.all([desktopContext.close(),phoneContext.close()]);assert.equal(errors.length,0,errors.join('\n'));report.errors=errors;
 fs.writeFileSync(out+'/browser.json',JSON.stringify(report,null,2));console.log(JSON.stringify({cameraDirections:report.camera.length,peerLockout:report.peerLockout,joinNotice:report.joinNotice,departureHostNotice:report.departureHostNotice,offlineHostNotice:report.offlineHostNotice,errors}));
}catch(error){
 report.errors=errors;report.failure=String(error);
 for(const [i,page]of testPages.entries()){try{console.log(JSON.stringify({page:i,url:page.url(),errors,body:(await page.locator('body').innerText({timeout:5000})).slice(0,5000)}));await page.screenshot({path:out+`/failure-${i}.png`,timeout:10000});}catch{}}
 fs.writeFileSync(out+'/failure.json',JSON.stringify(report,null,2));throw error;
}finally{await browser.close();await db?.close();}
