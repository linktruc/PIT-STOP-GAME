import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import {fileURLToPath} from 'node:url';import {randomBytes} from 'node:crypto';import {execFile} from 'node:child_process';import {TestRunner} from './runner.mjs';
const root=path.dirname(fileURLToPath(import.meta.url));const noOpen=process.argv.includes('--no-open');
const arg=process.argv.indexOf('--state-dir');const dataDir=arg>=0?process.argv[arg+1]:path.join(process.env.LOCALAPPDATA??os.homedir(),'PitStopTester');fs.mkdirSync(dataDir,{recursive:true});
const instancePath=path.join(dataDir,'instance.json'),settingsPath=path.join(dataDir,'settings.json');
function open(url){if(!noOpen)execFile('rundll32.exe',['url.dll,FileProtocolHandler',url],{windowsHide:true},()=>{});}
if(!noOpen){try{const old=JSON.parse(fs.readFileSync(instancePath,'utf8'));if(/^http:\/\/127\.0\.0\.1:\d+$/.test(old.base)){const response=await fetch(old.base+'/api/status',{headers:{'x-pit-token':old.token},signal:AbortSignal.timeout(1500)});if(response.ok){open(old.base+'/#'+old.token);process.exit(0);}}}catch{/* An expired instance is replaced. */}}
const token=randomBytes(24).toString('hex');let base='',activeStart=null,activeScan=null;const logs=[];let config={url:'https://f1-pitstop-game.netlify.app/#rooms',room:'',host:'',prefix:'Test Crew',count:5,min:450,max:1100,visible:false};
try{config={...config,...JSON.parse(fs.readFileSync(settingsPath,'utf8'))};}catch{/* First launch. */}
const runner=new TestRunner(event=>{logs.push(event);if(logs.length>1000)logs.shift();try{fs.appendFileSync(path.join(dataDir,'tester-log.jsonl'),JSON.stringify(event)+'\n');}catch{}});
async function body(req){let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>16384)throw Error('Yêu cầu quá lớn.');}return JSON.parse(raw||'{}');}
const server=http.createServer(async(req,res)=>{
 res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Content-Security-Policy',"default-src 'self'; connect-src 'self'; script-src 'self'; style-src 'self'; frame-ancestors 'none'; base-uri 'none'");
 const route=new URL(req.url,base||'http://127.0.0.1').pathname;
 const json=(code,data)=>{res.writeHead(code,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(data));};
 try{
  if(route.startsWith('/api/')){
   if(req.headers['x-pit-token']!==token||req.headers.origin&&req.headers.origin!==base)return json(403,{error:'Không có quyền truy cập phiên điều khiển.'});
   if(route==='/api/status'&&req.method==='GET')return json(200,{...runner.status(),config,logs,working:!!activeStart||!!activeScan});
   if(req.method!=='POST')return json(405,{error:'Method not allowed'});
   if(route==='/api/scan'){if(activeScan||activeStart)throw Error('Một thao tác khác đang chạy.');const data=await body(req);activeScan=runner.scan(data.url);try{return json(200,{rooms:await activeScan});}finally{activeScan=null;}}
   if(route==='/api/start'){
    if(activeStart||activeScan||runner.phase!=='idle')throw Error('Đợi phiên hiện tại dừng hẳn.');
    const data=await body(req);const {validateConfig}=await import('./runner.mjs');config=validateConfig(data);fs.writeFileSync(settingsPath,JSON.stringify(config,null,2));
    activeStart=runner.start(config).catch(()=>{}).finally(()=>{activeStart=null;});return json(202,{started:true});
   }
   if(route==='/api/stop'||route==='/api/shutdown'){await runner.stop();await Promise.allSettled([activeStart,activeScan]);
    json(200,{stopped:true});if(route==='/api/shutdown'){try{fs.unlinkSync(instancePath);}catch{}server.close(()=>process.exit(0));server.closeIdleConnections();setTimeout(()=>process.exit(0),1500).unref();}return;
   }
   return json(404,{error:'Not found'});
  }
  const files={'/':'index.html','/app.js':'app.js','/style.css':'style.css'};if(req.method!=='GET'||!files[route]){res.writeHead(404);res.end();return;}
  const mime=route.endsWith('.js')?'text/javascript':route.endsWith('.css')?'text/css':'text/html';res.writeHead(200,{'Content-Type':mime+'; charset=utf-8'});res.end(fs.readFileSync(path.join(root,files[route])));
 }catch(e){json(400,{error:e.message});}
});
server.listen(0,'127.0.0.1',()=>{base=`http://127.0.0.1:${server.address().port}`;fs.writeFileSync(instancePath,JSON.stringify({base,token,pid:process.pid}));process.stdout.write(JSON.stringify({base,token})+'\n');open(base+'/#'+token);});
for(const event of ['SIGINT','SIGTERM'])process.on(event,()=>{void runner.stop().finally(()=>{server.close();process.exit(0);});});
