import {chromium} from 'playwright';
import fs from 'node:fs';
const browser=await chromium.launch({channel:process.platform==='win32'?'msedge':undefined,headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:800,height:600}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{
  localStorage.setItem('pit-v7-quality','low');window.audioTrace=[];
  const Ctx=window.AudioContext??window.webkitAudioContext;if(!Ctx)return;
  const original=Ctx.prototype.createOscillator;
  Ctx.prototype.createOscillator=function(){const node=original.call(this);let firstFrequency;
   const set=node.frequency.setValueAtTime.bind(node.frequency);node.frequency.setValueAtTime=(v,t)=>{firstFrequency=v;return set(v,t);};
   const start=node.start.bind(node);node.start=(at)=>{
    const key=node.type+':'+firstFrequency;
    if(['sawtooth:66','sawtooth:135','square:134','square:168','triangle:112','sine:82','sawtooth:68'].includes(key)&&!document.querySelector('.replay-view')){
     const el=document.querySelector('.scene-stage .pit-scene');const cue=JSON.parse(el?.dataset.lastTaskCue??'null');
     window.audioTrace.push({key,cue,frameClock:Number(el?.dataset.sceneClock),audioAt:at});
    }return start(at);
   };return node;
  };
 });
 await page.goto('http://127.0.0.1:4173/?sceneDebug=1');await page.getByRole('button',{name:/Solo Test/i}).click();
 await page.locator('.solo-role-picker select').selectOption('FL_WHEEL_ON');await page.getByRole('button',{name:/Mark ready/i}).click();await page.getByRole('button',{name:/Start round/i}).click();
 await page.locator('.action-button[data-ready="true"]').waitFor({timeout:20000});await page.waitForTimeout(200);
 await page.evaluate(()=>{window.humanClickAt=Date.now();document.querySelector('.action-button[data-ready="true"]').click();});
 await page.locator('.result-overlay').waitFor({timeout:20000});await page.waitForTimeout(7000);
 const data=await page.evaluate(()=>({humanClickAt:window.humanClickAt,events:window.audioTrace}));
 const early=data.events.filter(e=>!e.cue||e.cue.now<e.cue.startsAt||e.frameClock!==e.cue.now);
 const wheel=data.events.find(e=>e.key==='sine:82'&&e.cue?.taskId==='FL_WHEEL_ON');
 const result={errors,...data,earlyCount:early.length,humanWheelCueAfterClickMs:wheel?wheel.cue.now-data.humanClickAt:null};
 fs.mkdirSync('docs/v24-4-evidence',{recursive:true});fs.writeFileSync('docs/v24-4-evidence/native-live-audio.json',JSON.stringify(result,null,2));
 console.log({errors,physicalSounds:data.events.length,early:early.length,humanWheelCueAfterClickMs:result.humanWheelCueAfterClickMs});
 if(errors.length||early.length||!wheel||result.humanWheelCueAfterClickMs<500)process.exitCode=1;
}finally{await browser.close();}
