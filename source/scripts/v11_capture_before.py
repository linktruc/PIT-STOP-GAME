"""Actual unmodified V10.3 WebGL and HUD geometry before V11 changes."""
import json,os
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'docs/v11-evidence';OUT.mkdir(exist_ok=True)
BASE=os.environ.get('PIT_BASELINE_URL','http://127.0.0.1:4193');measurements=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 c=b.new_context(viewport={'width':390,'height':844});c.add_init_script("localStorage.setItem('pit-v7-quality','low')")
 page=c.new_page();page.goto(BASE);page.wait_for_selector('.main-menu')
 page.evaluate('''async()=>{
 const {ROLES}=await import('/src/types.ts'),{createRound,reconcile}=await import('/src/engine.ts');const now=Date.now();
 const players=ROLES.map((role,i)=>({id:'qa-'+i,role,nickname:'Alex '+i,ready:true,joinedAt:now+i,connected:true}));
 window.__beforeRoom={id:'before',teamId:'before',name:'APEX 07',color:'#ec3340',code:'BEFORE',hostId:players[0].id,status:'WAITING',players,round:null,updatedAt:now};
 window.__beforeRunning=()=>{const r=window.__beforeRoom;r.round=createRound(r.players,Date.now()-10000,'before-round');reconcile(r.round,Date.now());r.status='RUNNING';window.dispatchEvent(new Event('online'));};
 const url=[...performance.getEntriesByType('resource')].reverse().find(e=>new URL(e.name).pathname==='/src/api.ts').name;const {api}=await import(url);
 api.getState=async()=>({rooms:[structuredClone(window.__beforeRoom)],leaderboard:[],replays:[],serverNow:Date.now(),identity:{playerId:'qa-0',isAdmin:false}});api.call=async()=>api.getState();window.dispatchEvent(new Event('online'));
 }''')
 page.goto(BASE+'/#crew');page.wait_for_function('()=>document.querySelector(".pit-scene")?.dataset.sceneModel==="full-pit-lane-v10"')
 for phase in ['waiting','running']:
  if phase=='running':page.evaluate('window.__beforeRunning()');page.wait_for_selector('.action-button')
  for w,h in [(390,844),(430,932),(1366,768),(1440,900)]:
   page.set_viewport_size({'width':w,'height':h});page.wait_for_timeout(300)
   row=page.evaluate('''()=>{const box=s=>document.querySelector(s)?.getBoundingClientRect().toJSON();return {width:innerWidth,height:innerHeight,role:box('.role-strip'),action:box('.action-console'),mini:box('.mini-chain'),pageHeight:document.documentElement.scrollHeight};}''')
   measurements.append(dict(phase=phase,**row));page.screenshot(path=str(OUT/f'baseline-v10-{phase}-{w}.png'))
 (OUT/'baseline-v10.json').write_text(json.dumps({'baseline':'Unmodified V10.3 in /workspace/pit-crew-v10','tests':180,'measurements':measurements,'scope':'Actual WebGL/main UI driven by clearly synthetic room snapshots, Chromium software rendering. Same viewport sizes, not physical Safari.'},indent=2))
 b.close()
print('PASS V10 baseline captured waiting/running at390/430/1366/1440',flush=True)
