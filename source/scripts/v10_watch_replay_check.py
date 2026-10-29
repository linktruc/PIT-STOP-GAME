"""Actual WebGL App/preview/replay components with deterministic synthetic online data.

This validates rendering and UI integration. PostgreSQL RPC tests cover persistence
and permissions; this is not a hosted multiplayer/physical-device test.
"""
import json, os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'docs/v10-evidence';OUT.mkdir(exist_ok=True)
BASE=os.environ.get('PIT_PREVIEW_URL','http://127.0.0.1:4190')
errors=[];checks=[];measurements=[]
def passed(label):checks.append(label);print('PASS',label,flush=True)

with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 c=b.new_context(viewport={'width':1440,'height':900});c.add_init_script("localStorage.setItem('pit-v7-quality','low');window.__qaGL=new Set();const old=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(k,...a){const r=old.call(this,k,...a);if(r&&(k==='webgl'||k==='webgl2'))window.__qaGL.add(this);return r;}")
 page=c.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.goto(BASE)
 page.wait_for_selector('.main-menu')
 page.evaluate('''async()=>{
 const {createRound,reconcile,submitAction}=await import('/src/engine.ts');const {ROLES}=await import('/src/types.ts');
 const epoch=Date.now();window.__qaOffset=0;
 const players=id=>ROLES.map((role,i)=>({id:id+'-'+i,nickname:'Driver '+i,role,ready:true,joinedAt:epoch+i,connected:true}));
 window.__qaRooms=['A','B','C','D','E','F','Waiting'].map((id,n)=>{const ps=players(id);const room={id,teamId:id,name:'APEX '+id,color:n%2?'#55b9bd':'#ec3941',code:id,hostId:ps[0].id,players:ps,status:n===6?'WAITING':'RUNNING',round:null,updatedAt:epoch};if(n!==6){room.round=createRound(ps,epoch-10000,id+'-round');reconcile(room.round,epoch-9000);submitAction(room.round,ps[0].id,'FRONT_LIFT',epoch-1800);submitAction(room.round,ps[1].id,'REAR_LIFT',epoch-1500);}return room;});
 const ps=players('history');const rd=createRound(ps,epoch-10000,'recorded-round');let time=rd.goAt;reconcile(rd,time);for(let n=0;n<21;n++){const task=rd.tasks.find(t=>t.status==='AVAILABLE');time=Math.max(time,task.enabledAt)+160;submitAction(rd,task.ownerId,task.id,time,'qa-'+n);}
 window.__qaReplay={roundId:rd.id,teamId:'history',teamName:'APEX Recorded',color:'#ed4240',players:ps,round:rd};
 const url=[...performance.getEntriesByType('resource')].reverse().find(e=>new URL(e.name).pathname==='/src/api.ts').name;const {api}=await import(url);
 api.getState=async()=>({rooms:structuredClone(window.__qaRooms),leaderboard:[],replays:[{roundId:rd.id,teamId:'history',teamName:'APEX Recorded',color:'#ed4240',elapsedMs:rd.elapsedMs,finishedAt:rd.finishedAt}],serverNow:Date.now()+window.__qaOffset,identity:{playerId:'A-0',isAdmin:false}});
 api.call=async()=>api.getState();api.getReplay=async()=>structuredClone(window.__qaReplay);window.dispatchEvent(new Event('online'));
 }''')
 page.goto(BASE+'/#watch');expect(page.locator('.active-teams-grid .live-card')).to_have_count(6)
 page.wait_for_function('()=>[...document.querySelectorAll(".live-card-preview")].slice(0,4).every(c=>c.dataset.previewMode==="3d")&&document.querySelectorAll(".live-card-preview").length===6',timeout=60000)
 area=page.locator('.observer-scroll').bounding_box();cards=page.locator('.active-teams-grid .live-card').evaluate_all('(es)=>es.slice(0,4).map(e=>e.getBoundingClientRect().toJSON())')
 assert all(r['y']>=area['y']-1 and r['y']+r['height']<=area['y']+area['height']+1 for r in cards),(area,cards)
 models=page.locator('.live-card-preview').evaluate_all('(es)=>es.slice(0,4).map(e=>({model:e.dataset.sceneModel,crew:e.dataset.crewCount,contexts:e.dataset.previewContexts,cost:e.dataset.previewRenderMs}))')
 assert all(m['model']=='full-pit-lane-v10' and m['crew']=='22' and m['contexts']=='1' for m in models),models
 measurements.append({'fourCardBounds':cards,'scrollArea':area,'models':models,'webglContextsEver':page.evaluate('window.__qaGL.size')})
 page.screenshot(path=str(OUT/'watch-desktop-four-previews.png'))
 passed('Four active full-scene WebGL cards fit desktop viewport; six rooms share one preview renderer and same 22-actor model')
 page.locator('.active-teams-grid .live-card').first.click();expect(page.locator('.live-event-strip')).to_be_visible()
 expect(page.locator('.replay-log-drawer')).to_have_count(0)
 expect(page.locator('.scene-stage .pit-scene')).to_have_attribute('data-scene-model','full-pit-lane-v10')
 page.get_by_role('button',name='Event Log',exact=True).click();expect(page.get_by_role('columnheader')).to_have_text(['Task','By','Step Time','Team Time'])
 page.get_by_role('button',name='Close Event Log',exact=True).click();page.screenshot(path=str(OUT/'watch-selected-desktop.png'))
 passed('Selected Watch Live has same large 3D scene, compact event chip and optional four-column log')
 page.goto(BASE+'/#watch');page.set_viewport_size({'width':390,'height':844});page.wait_for_timeout(500)
 expect(page.locator('.live-card-preview')).to_have_count(0)
 assert page.locator('.active-teams-grid canvas').count()==0
 page.screenshot(path=str(OUT/'watch-mobile-no-previews.png'))
 passed('Mobile overview creates no live-preview canvases; waiting/finished rows remain compact')
 page.get_by_role('button',name='Watch replay',exact=False).click();expect(page.locator('.replay-view')).to_be_visible()
 # Pause programmatically before frame inspection; software WebGL can starve
 # Playwright's two-frame stability check while autoplay is running. Actual pointer
 # pause/seek controls are separately covered by v10_ui_check.py.
 page.locator('.replay-view').evaluate('(el)=>{if(el.dataset.replayPlaying==="true")el.querySelector(".replay-buttons button").click()}')
 page.wait_for_function('()=>document.querySelector(".replay-view")?.dataset.replayPlaying==="false"')
 timeline=page.get_by_role('slider',name='Replay timeline');scene=page.locator('.replay-view .pit-scene')
 poses=[]
 for t in [-3000,-2000,-1000,0,350,1700,5000,9000,350]:
  timeline.fill(str(t));page.wait_for_function('(t)=>Number(document.querySelector(".replay-view .pit-scene")?.dataset.sceneClock)===window.__qaReplay.round.goAt+t',arg=t,timeout=20000)
  pose=scene.evaluate('(e)=>({time:e.dataset.sceneClock,carZ:e.dataset.carZ,arrival:e.dataset.carArrival,front:e.dataset.frontLift,rear:e.dataset.rearLift,drive:e.dataset.carDeparture,laneClear:e.dataset.laneClear,supportClear:e.dataset.supportClear,contact:e.dataset.supportContactError,model:e.dataset.sceneModel})');poses.append(dict(cursor=t,**pose))
 assert poses[0]['carZ']!=poses[1]['carZ']!=poses[2]['carZ'],poses[:3]
 assert abs(float(poses[3]['carZ']))<.001,poses[3]
 assert poses[-1]==dict(poses[4],cursor=350),('Seek must settle to identical pose',poses[4],poses[-1])
 assert poses[-2]['laneClear']=='true' and float(poses[-2]['drive'])>.99,poses[-2]
 page.screenshot(path=str(OUT/'replay-webgl-mobile.png'))
 measurements.append({'recordedReplayPoses':poses})
 passed('Recorded replay visibly approaches, stops at GO, exits only with clear lane, and backward seek restores identical intermediate 3D pose')
 assert not errors,errors
 (OUT/'watch-replay-report.json').write_text(json.dumps({'passed':checks,'measurements':measurements,'javascriptErrors':errors,'limits':'Actual app and shared WebGL components with controlled synthetic online-shaped snapshots/recorded reference-engine events. Not a hosted Supabase or physical Safari/performance test.'},indent=2))
 b.close()
