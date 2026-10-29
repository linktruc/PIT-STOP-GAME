import {chromium} from 'playwright';
import fs from 'node:fs';
const browser=await chromium.launch({channel:process.platform==='win32'?'msedge':undefined,headless:true});
try{const page=await browser.newPage();await page.goto((process.env.PIT_QA_URL??'http://127.0.0.1:5173')+'/scripts/v24-2-motion-qa.html?sceneDebug=1&contactDebug=1');await page.waitForFunction(()=>window.testMotion);const result=await page.evaluate(()=>window.testMotion());fs.mkdirSync('docs/v24-2-evidence',{recursive:true});fs.writeFileSync('docs/v24-2-evidence/motion-comparison.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));if(result.results.some(r=>r.jumps.fresh||r.contacts||r.pairs)||result.pendingAck.fresh>.005)process.exitCode=1;}finally{await browser.close();}
