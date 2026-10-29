import {chromium} from 'playwright-core';
export function validateConfig(input){
 const url=new URL(String(input.url??''));
 if(!['https:','http:'].includes(url.protocol)||url.username||url.password)throw Error('Link phải là địa chỉ HTTP/HTTPS của game.');
 url.hash='rooms';
 const count=Number(input.count),min=Number(input.min),max=Number(input.max);
 if(!Number.isInteger(count)||count<1||count>14)throw Error('Chọn từ 1 đến 14 phiên.');
 if(!Number.isFinite(min)||!Number.isFinite(max)||min<30||max<min||max>15000)throw Error('Độ trễ cần từ 30 đến 15000 ms, nhỏ nhất không lớn hơn lớn nhất.');
 const room=String(input.room??'').trim(),host=String(input.host??'').trim(),prefix=String(input.prefix??'Test Crew').trim();
 if(!room||room.length>40)throw Error('Nhập đúng tên phòng.');
 if(!prefix||prefix.length>20)throw Error('Tiền tố tên cần từ 1 đến 20 ký tự.');
 return {url:url.href,room,host,count,min,max,prefix,visible:input.visible===true};
}
export function installDriver({min,max}){
 if(window.__pitTester)window.__pitTester.stop();
 let pending='',last='',timeout=null,readyPending=false,stopped=false;
 const report=event=>window.__pitReport(event).catch(()=>{});
 const clear=()=>{if(timeout)clearTimeout(timeout);timeout=null;pending='';};
 const interval=setInterval(()=>{
  if(stopped)return;
  const ready=document.querySelector('.ready-button');
  if(ready&&!ready.disabled&&ready.textContent.trim()==='Mark ready'&&!readyPending){readyPending=true;ready.click();report({type:'ready'});setTimeout(()=>{readyPending=false;},1500);}
  const button=document.querySelector('.action-button');
  if(!button||button.dataset.ready!=='true'){clear();last='';return;}
  if(button.disabled||pending||last===button.innerText)return;
  const label=button.innerText;pending=label;
  timeout=setTimeout(()=>{
   timeout=null;const current=document.querySelector('.action-button');
   if(!stopped&&current&&!current.disabled&&current.dataset.ready==='true'&&current.innerText===label){last=label;current.click();report({type:'action',label:label.split('\n')[0]});}
   pending='';
  },min+Math.floor(Math.random()*(max-min+1)));
 },60);
 window.__pitTester={stop(){stopped=true;clear();clearInterval(interval);}};
}
export class TestRunner {
 constructor(log=()=>{}){this.emit=log;this.phase='idle';this.players=[];this.browser=null;this.cancelled=false;this.monitor=null;this.rooms=[];}
 log(type,message,extra={}){this.emit({at:new Date().toISOString(),type,message,...extra});}
 status(){return {phase:this.phase,players:this.players.map(({page,context,...p})=>p),rooms:this.rooms};}
 async launch(visible=false){return chromium.launch({channel:'msedge',headless:!visible,args:['--disable-webgl','--disable-webgl2','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows']}).catch(e=>{throw Error('Không mở được Microsoft Edge. Cài/cập nhật Edge rồi thử lại. '+e.message);});}
 async page(browser){const context=await browser.newContext({viewport:{width:960,height:720}});const page=await context.newPage();page.setDefaultTimeout(30000);await page.addInitScript(()=>{localStorage.setItem('pit-v7-volume','0');localStorage.setItem('pit-v7-quality','low');});return {context,page};}
 async directory(page,url){await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});await page.locator('.room-browser').waitFor();await page.waitForFunction(()=>!document.querySelector('.room-browser')?.textContent.includes('Connecting to the pit lane'),null,{timeout:45000});return page.locator('.lobby-card').evaluateAll(cards=>cards.map(card=>({name:card.querySelector('h3')?.textContent?.trim()??'',host:(card.querySelector('p')?.textContent??'').replace(/^\s*Host:\s*/, '').trim(),players:Number((card.textContent.match(/(\d+)\/15/)??[])[1]??0)})));}
 async scan(url){if(this.phase!=='idle')throw Error('Dừng test trước khi tải lại phòng.');const c=validateConfig({url,room:'scan',count:1,min:30,max:30});this.phase='scanning';this.cancelled=false;let browser;
  try{browser=await this.launch();this.scanBrowser=browser;if(this.cancelled)throw Error('Đã dừng.');const {page}=await this.page(browser);this.rooms=await this.directory(page,c.url);this.log('rooms',`Tìm thấy ${this.rooms.length} phòng đang chờ.`);return this.rooms;}catch(e){if(this.cancelled)throw Error('Đã dừng.');throw e;}finally{await browser?.close();this.scanBrowser=null;this.phase='idle';}}
 async start(input){if(this.phase!=='idle')throw Error('Một phiên test đang chạy.');const c=validateConfig(input);this.phase='starting';this.cancelled=false;this.players=[];
  try{
   this.browser=await this.launch(c.visible);
   if(this.cancelled)throw Error('Đã dừng.');
   for(let i=1;i<=c.count;i++){
    if(this.cancelled)throw Error('Đã dừng.');
    const item={id:i,name:`${c.prefix} ${i}`,role:'',status:'Đang vào phòng',actions:0,rpcMs:null,context:null,page:null};this.players.push(item);
    Object.assign(item,await this.page(this.browser));const {page}=item;
    await page.exposeFunction('__pitReport',event=>{if(event.type==='action'){item.actions++;item.status=event.label;this.log('action',`${item.name}: ${event.label}`,{player:i});}else this.log('ready',`${item.name}: Ready`,{player:i});});
    page.on('pageerror',e=>this.log('error',`${item.name}: ${e.message}`,{player:i}));
    page.on('requestfinished',async request=>{try{if(!request.url().includes('/rest/v1/rpc/'))return;const data=request.postDataJSON(),op=data?.p_op??request.url().split('/').at(-1),timing=request.timing();if(timing.responseEnd>=0){item.rpcMs=Math.round(timing.responseEnd);this.log('rpc',`${item.name}: ${op} ${item.rpcMs} ms`,{player:i,op,ms:item.rpcMs,status:(await request.response())?.status()});}}catch{/* No bodies, headers or credentials are logged. */}});
    const rooms=await this.directory(page,c.url),matching=rooms.filter(r=>r.name===c.room&&(!c.host||r.host===c.host));
    if(matching.length!==1)throw Error(matching.length?'Có nhiều phòng trùng tên. Nhập thêm tên host.':'Không thấy phòng đang chờ. Kiểm tra link, tên phòng và host.');
    if(i===1&&matching[0].players+c.count>15)throw Error(`Phòng chỉ còn ${15-matching[0].players} chỗ trống.`);
    const cards=page.locator('.lobby-card');const index=rooms.findIndex(r=>r===matching[0]);
    await cards.nth(index).getByRole('button',{name:'Join Team',exact:true}).click();
    await page.locator('input[autocomplete="nickname"]').fill(item.name);await page.locator('.create-form').getByRole('button',{name:'Join Team',exact:true}).click();
    await page.locator('.ready-button').waitFor();
    item.role=await page.locator('.pit-scene').getAttribute('data-player-role')??'';
    await page.evaluate(installDriver,{min:c.min,max:c.max});
    await page.waitForFunction(()=>document.querySelector('.ready-button')?.textContent?.trim()==='Ready');
    item.status='Ready';this.log('joined',`${item.name} đã vào, role ${item.role}, Ready.`,{player:i});
   }
   for(const item of this.players){await item.page.waitForFunction(()=>document.querySelector('.ready-button')?.textContent?.trim()==='Ready');item.role=await item.page.locator('.pit-scene').getAttribute('data-player-role')??item.role;}
   this.phase='running';this.log('ready',`Đủ ${c.count} phiên. Bạn có thể bấm Start round trong game.`);
   this.monitor=setInterval(()=>{for(const item of this.players){if(item.page.isClosed()){item.status='Đã đóng';continue;}void item.page.evaluate(()=>({role:document.querySelector('.pit-scene')?.dataset.playerRole,driver:!!window.__pitTester})).then(async data=>{if(data.role)item.role=data.role;if(data.role&&!data.driver&&!this.cancelled){await item.page.evaluate(installDriver,{min:c.min,max:c.max});this.log('recovered',`${item.name}: khôi phục bộ điều khiển sau khi tải lại.`,{player:item.id});}}).catch(()=>{});}},2000);
  }catch(e){const cancelled=this.cancelled;await this.cleanup();if(!cancelled)this.log('error',e.message);throw e;}
 }
 async cleanup(){clearInterval(this.monitor);this.monitor=null;const browser=this.browser;this.browser=null;
  await this.scanBrowser?.close();
  await Promise.allSettled(this.players.map(async item=>{const page=item.page;if(!page||page.isClosed())return;await page.evaluate(()=>window.__pitTester?.stop()).catch(()=>{});
   const leave=page.getByRole('button',{name:'Leave Team',exact:true});if(await leave.count()){
    try{await leave.click({timeout:7000});await page.waitForFunction(()=>!!document.querySelector('.leave-confirm')||!document.querySelector('.leave-crew-control'),null,{timeout:7000});
     const confirm=page.locator('.leave-confirm').getByRole('button',{name:'Leave Team',exact:true});if(await confirm.count())await confirm.click({timeout:7000});
     await page.locator('.leave-crew-control').waitFor({state:'hidden',timeout:7000});item.status='Đã rời phòng';
    }catch{item.status='Đã đóng; chưa xác nhận rời phòng';this.log('error',`${item.name}: máy chủ chưa xác nhận rời phòng. Có thể cần host xóa ghế này.`,{player:item.id});}
   }else item.status='Đã đóng';}));await browser?.close();this.phase='idle';
 }
 async stop(){this.cancelled=true;this.phase='stopping';await this.cleanup();this.log('stopped','Đã dừng và đóng các phiên test.');}
}
