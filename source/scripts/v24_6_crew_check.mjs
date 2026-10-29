import {chromium} from 'playwright';
import fs from 'node:fs';
const browser=await chromium.launch({channel:process.platform==='win32'?'msedge':undefined,headless:true});
try{const page=await browser.newPage();await page.goto('http://127.0.0.1:5173/scripts/v24-6-crew-qa.html?sceneDebug=1',{waitUntil:'domcontentloaded',timeout:90000});await page.waitForFunction(()=>window.verifyTransitions);const result=await page.evaluate(()=>window.verifyTransitions());fs.mkdirSync('docs/v24-6-evidence',{recursive:true});fs.writeFileSync('docs/v24-6-evidence/transitions.json',JSON.stringify(result,null,2));console.log(result);if(result.some(r=>r.rearAt450>.1||r.maxHandStep>.3||r.maxGripError>.035||r.maxWaitingHandAboveHead>0||!r.scoreUnchanged))process.exitCode=1;}finally{await browser.close();}
