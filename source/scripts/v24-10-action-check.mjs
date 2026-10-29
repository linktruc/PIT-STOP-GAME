import {chromium} from 'playwright';
import assert from 'node:assert/strict';import fs from 'node:fs';
const browser=await chromium.launch({...(process.platform==='win32'?{channel:'msedge'}:{}),headless:true});
try{const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 page.setDefaultTimeout(90000);await page.goto('http://127.0.0.1:5173/scripts/v24-10-action-qa.html',{waitUntil:'domcontentloaded',timeout:90000});await page.waitForSelector('.action-button[data-ready="true"]');
 await page.evaluate(()=>window.holdRead());await page.waitForFunction(()=>window.readStarted);
 await page.locator('.action-button').click();await page.waitForFunction(()=>window.calls.length===1);
 const dispatchMs=await page.evaluate(()=>window.calls[0].at-window.pressAt);assert(dispatchMs<100);assert.equal(await page.locator('.action-button .spin').count(),0);assert.match(await page.locator('.action-button').innerText(),/ACTION SENT/);
 assert.equal(await page.evaluate(()=>window.game.state.rooms[0].round.tasks.find(t=>t.id==='FRONT_LIFT').status),'AVAILABLE');
 const offset=await page.evaluate(()=>window.game.clockOffset);await page.evaluate(()=>window.ack('FRONT_LIFT'));await page.waitForFunction(()=>window.game.busy==='');
 assert.equal(await page.locator('.action-button').getAttribute('data-ready'),'false');assert.equal(await page.evaluate(()=>window.game.clockOffset),offset);
 await page.evaluate(()=>window.ack('FRONT_LIFT',true));await page.waitForSelector('.action-button[data-ready="true"]');await page.locator('.action-button').click();await page.waitForFunction(()=>window.calls.length===2);
 await page.evaluate(()=>window.responses.FRONT_LIFT.reject(new Error('network timeout')));await page.waitForTimeout(80);assert.equal(await page.locator('#busy').textContent(),'action');assert.equal(await page.locator('#error').textContent(),'');
 await page.evaluate(()=>window.resolveLower());await page.waitForFunction(()=>window.game.busy==='');await page.evaluate(()=>window.releaseRead());await page.waitForTimeout(100);
 assert.equal(await page.evaluate(()=>window.game.state.rooms[0].round.tasks.find(t=>t.id==='FRONT_LOWER').status),'DONE');assert.deepEqual(errors,[]);
 const result={dispatchMs,passed:['action bypasses blocked read','immediate sent feedback without spinner','no optimistic completion or unlock','realtime ACK releases next action before RPC reply','late acknowledged timeout cannot clear newer action','stale read cannot roll back confirmed work','push preserves clock calibration'],calls:await page.evaluate(()=>window.calls.map(c=>({op:c.op,task:c.task}))),errors};fs.mkdirSync('docs/v24-10-evidence',{recursive:true});fs.writeFileSync('docs/v24-10-evidence/action-transport.json',JSON.stringify(result,null,2));console.log(result);
}finally{await browser.close();}
