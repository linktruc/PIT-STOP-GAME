"""V11 HUD geometry and real browser controls; synthetic room snapshots, software WebGL."""
import json,os
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'docs/v11-evidence';OUT.mkdir(exist_ok=True)
BASE=os.environ.get('PIT_PREVIEW_URL','http://127.0.0.1:4190');rows=[];errors=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 c=b.new_context(viewport={'width':390,'height':844});c.add_init_script("localStorage.setItem('pit-v7-quality','low')")
 page=c.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.goto(BASE);page.wait_for_selector('.main-menu')
 page.evaluate('''async()=>{
 const {ROLES}=await import('/src/types.ts'),{createRound,reconcile}=await import('/src/engine.ts');const now=Date.now();
 const players=ROLES.map((role,i)=>({id:'qa-'+i,role,nickname:'Alex '+i,ready:true,joinedAt:now+i,connected:true}));
 window.__hudRoom={id:'hud',teamId:'hud',name:'APEX 07',color:'#ec3340',code:'HUD',hostId:players[0].id,status:'WAITING',players,round:null,updatedAt:now};
 window.__hudRunning=()=>{const r=window.__hudRoom;r.round=createRound(r.players,Date.now()-10000,'hud-round');reconcile(r.round,Date.now());r.status='RUNNING';window.dispatchEvent(new Event('online'));};
 const url=[...performance.getEntriesByType('resource')].reverse().find(e=>new URL(e.name).pathname==='/src/api.ts').name;const {api}=await import(url);
 api.getState=async()=>({rooms:[structuredClone(window.__hudRoom)],leaderboard:[],replays:[],serverNow:Date.now(),identity:{playerId:'qa-0',isAdmin:false}});api.call=async()=>api.getState();window.dispatchEvent(new Event('online'));
 }''')
 page.goto(BASE+'/#crew');page.wait_for_selector('.hud-dock')
 for phase in ['waiting','running']:
  if phase=='running':page.evaluate('window.__hudRunning()');page.wait_for_selector('.action-button')
  for w,h in [(390,844),(430,932),(1366,768),(1440,900)]:
   page.set_viewport_size({'width':w,'height':h})
   for badge in [False,True]:
    if badge:page.evaluate('''()=>{const b=document.createElement('aside');b.id='hud-badge-placeholder';b.dataset.pitOverlayReservation='';b.style='position:fixed;bottom:0;right:0;width:190px;height:90px;z-index:99999;display:grid;place-items:center;background:#10232b;color:#d7e8ea;font:12px Arial';b.textContent='Powered by Netlify · QA placeholder';document.body.append(b)}''')
    else:page.locator('#hud-badge-placeholder').evaluate_all('(els)=>els.forEach(e=>e.remove())')
    page.wait_for_function('(expected)=>getComputedStyle(document.querySelector(".game-shell")).getPropertyValue("--pit-overlay-bottom").trim()===expected',arg='90px' if badge else ('76px' if w<=600 else '0px'),timeout=10000)
    page.wait_for_timeout(250)
    row=page.evaluate('''()=>{const box=s=>document.querySelector(s)?.getBoundingClientRect().toJSON();return {width:innerWidth,height:innerHeight,role:box('.role-strip'),action:box('.action-console'),dock:box('.hud-dock'),mini:box('.mini-chain'),timer:box('.race-timer'),heading:box('.room-heading'),badge:box('#hud-badge-placeholder'),pageHeight:document.documentElement.scrollHeight,reservation:getComputedStyle(document.querySelector('.game-shell')).getPropertyValue('--pit-overlay-bottom')};}''')
    assert row['role']['height']==54,row
    assert abs(row['action']['top']-row['role']['bottom']-6)<1,row
    assert row['action']['bottom']<=h-(90 if badge else 76 if w<=600 else 0)-7,row
    assert h-(90 if badge else 76 if w<=600 else 0)-row['action']['bottom']<=15,row
    assert row['pageHeight']<=h+1,row
    rows.append(dict(phase=phase,badgeVisible=badge,**row));page.screenshot(path=str(OUT/f'after-v11-{phase}-{w}{"-badge" if badge else ""}.png'))
 expect(page.get_by_role('button',name='Reset camera')).to_have_count(0)
 page.get_by_role('button',name='Main Menu',exact=True).click();page.get_by_role('button',name='Admin access',exact=True).click();expect(page.locator('.admin-backend-needed')).to_be_visible();expect(page.get_by_text('Global administration requires a connection to Supabase.',exact=True)).to_be_visible()
 assert not errors,errors
 (OUT/'hud-layout-report.json').write_text(json.dumps({'measurements':rows,'javascriptErrors':errors,'scope':'Actual app and software WebGL; synthetic multiplayer-shaped room. 90px hosting badge placeholder is clearly marked and only read for clearance. Physical Safari not tested.'},indent=2));b.close()
print('PASS compact54px role,6px gap, safe measured90px overlay/mobile76px external badge footprint, no page scroll, no mock admin',flush=True)
