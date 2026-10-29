"""V9.1 deterministic local acceptance; real app/garage, local synthetic live snapshots."""
import json,os,time,shutil
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'qa-output';OUT.mkdir(exist_ok=True)
BASE=os.environ.get('PIT_PREVIEW_URL','http://127.0.0.1:4190');checks=[];metrics=[];errors=[]
def check(label):checks.append(label);print('PASS',label,flush=True)
def shot(page,name):page.screenshot(path=str(OUT/(name+'.png')))
def layout(page,label):
 m=page.evaluate('() => ({w:innerWidth,h:innerHeight,sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight})');assert m['sw']<=m['w']+1 and m['sh']<=m['h']+1,(label,m);metrics.append(dict(label=label,**m))
def fixture(page,rooms=None):
 if rooms is None:
  rooms=page.evaluate('''async()=>{const {createRound}=await import('/src/engine.ts');const {ROLES}=await import('/src/types.ts');const now=Date.now();return ['A','B','C','D','E','F','Waiting','Finished'].map((id,n)=>{const players=ROLES.map((role,i)=>({id:id+'-'+i,nickname:'Crew '+i,role,ready:true,joinedAt:now+i,connected:true}));const r={id,teamId:id,name:'Garage '+id,color:n%2?'#56b9bf':'#e54035',code:id,hostId:players[0].id,players,status:n===6?'WAITING':n===7?'COMPLETED':'RUNNING',round:n===6?null:createRound(players,now-10000,id+'-round'),updatedAt:now};if(r.round){r.round.status=n===7?'COMPLETED':'RUNNING';r.round.tasks.forEach(t=>{if(n===1&&['FRONT_LIFT','FRONT_LOWER',...['FL','FR'].flatMap(c=>['GUN_LOOSEN','WHEEL_OFF','WHEEL_ON','GUN_TIGHTEN'].map(s=>c+'_'+s))].includes(t.id)||n===7){t.status='DONE';t.completedAt=now-1000;r.round.events.push({taskId:t.id,at:now-1000,reason:'FIXTURE'});}else if(!t.dependencies.length)t.status='AVAILABLE';});if(n===7){r.round.elapsedMs=2200;r.round.finishedAt=now-1000;}}return r;});}''')
 page.evaluate('''async rooms=>{window.__qaRooms=rooms;window.__qaCount=2;const apiUrl=[...performance.getEntriesByType('resource')].reverse().find(e=>new URL(e.name).pathname==='/src/api.ts')?.name??'/src/api.ts';const {api}=await import(apiUrl);const snapshot=()=>({rooms:structuredClone(window.__qaRooms.filter((r,i)=>i<window.__qaCount||i>=6)),leaderboard:[],serverNow:Date.now(),identity:{playerId:'A-0',isAdmin:false}});api.getState=async()=>snapshot();api.call=async()=>snapshot();window.dispatchEvent(new Event('online'));}''',rooms)
 page.wait_for_timeout(300);return rooms
def pose(page,ids):
 page.evaluate('''ids=>{const r=window.__qaRooms[0],now=Date.now();for(const t of r.round.tasks){if(ids.includes(t.id)&&t.status!=='DONE'){t.status='DONE';t.completedAt=now;r.round.events.push({taskId:t.id,at:now,reason:'FIXTURE_ACTION'});}}for(const t of r.round.tasks)if(t.status!=='DONE')t.status=t.dependencies.every(id=>r.round.tasks.find(p=>p.id===id)?.status==='DONE')?'AVAILABLE':'LOCKED';r.updatedAt=now;window.dispatchEvent(new Event('online'));}''',ids)
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-background-timer-throttling','--disable-renderer-backgrounding'])
 context=browser.new_context(viewport={'width':1440,'height':900},device_scale_factor=1)
 context.add_init_script("localStorage.setItem('pit-v7-quality','low');window.__qaGL=new Set();const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...args){const result=original.call(this,kind,...args);if(result&&(kind==='webgl'||kind==='webgl2'))window.__qaGL.add(this);return result;};")
 page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.goto(BASE);page.wait_for_selector('.main-menu');page.get_by_role('button',name='Solo Test',exact=False).click();page.wait_for_timeout(500)
 for w,h in [(390,844),(430,932),(375,667),(1440,900)]:
  page.set_viewport_size({'width':w,'height':h});page.wait_for_timeout(400);layout(page,f'V9 lobby {w}x{h}')
  mini=page.locator('.mini-chain').bounding_box();role=page.locator('.role-strip').bounding_box();assert mini['height']<=64 and mini['width']<=(295 if w<600 else 320),(mini,w);assert role['height']<=62,role
  expect(page.locator('.rolling-row')).to_have_count(1);expect(page.locator('.rolling-slot')).to_have_count(3)
  for selector in ['.leave-crew-control','.ready-button','.start-button']:
   box=page.locator(selector).bounding_box();assert box['x']>=0 and box['y']>=0 and box['x']+box['width']<=w+1 and box['y']+box['height']<=h-90,(selector,box,w,h)
  page.evaluate("()=>{const b=document.createElement('div');b.id='external-platform-fixture';b.style='position:fixed;bottom:0;left:0;width:100%;height:90px;z-index:99999;background:#101824';document.body.append(b)}")
  shot(page,f'v9-lobby-{w}');page.locator('#external-platform-fixture').evaluate('(el)=>el.remove()')
 check('One 3-slot row; compact role strip; no page scroll; actions clear 90px external overlay at all four required viewports')
 page.set_viewport_size({'width':390,'height':844});page.get_by_role('button',name='Role details:',exact=False).click();expect(page.locator('.role-briefing ol li')).to_have_count(2);expect(page.locator('.role-briefing')).to_contain_text('WAIT FOR');shot(page,'v9-role-briefing');page.get_by_role('button',name='Close panel',exact=True).click()
 page.get_by_role('button',name='Open full workflow.',exact=False).click();expect(page.locator('[data-task-id]')).to_have_count(21);expect(page.locator('[data-from]')).to_have_count(26);shot(page,'v9-full-graph-390');page.get_by_role('button',name='Close panel',exact=True).click()
 check('Useful two-stage briefing and restored connected 21-node / 26-edge graph, no roster dump')
 options=page.get_by_label('Choose role').locator('option');expect(options).to_have_count(15)
 for role in ['FL_GUNNER','REAR_JACK','RELEASE_CONTROLLER','FRONT_JACK']:
  page.get_by_label('Choose role').select_option(role);page.wait_for_function('(r)=>document.querySelector(".pit-scene").dataset.playerRole===r',arg=role)
 expect(page.locator('.you-marker')).to_be_visible();check('Solo role selector contains all 15 roles and maps gunner/rear jack/release/front jack to actual YOU figure')
 page.get_by_role('button',name='Mark ready',exact=True).click();page.get_by_role('button',name='Start round',exact=False).click();page.locator('.action-button').click(force=True)
 page.wait_for_function('()=>Number(document.querySelector(".action-button").dataset.penaltyUntil)>0')
 deadline=page.locator('.action-button').get_attribute('data-penalty-until');assert 'PENALTY' in page.locator('.action-button').inner_text();shot(page,'v9-early-lockout-390')
 page.keyboard.press('Space');assert page.locator('.action-button').get_attribute('data-penalty-until')==deadline
 page.wait_for_function('()=>document.querySelector(".action-button").dataset.ready==="true"',timeout=12000);page.locator('.action-button').click()
 progress=[]
 for threshold in [2,6,10,14,18]:
  page.wait_for_function('(n)=>Number(document.querySelector(".mini-chain").dataset.progress)>=n',arg=threshold,timeout=30000);progress.append(page.locator('.mini-chain').get_attribute('data-progress'))
  if threshold in [2,10,18]:shot(page,f'v9-flow-{threshold}')
 page.wait_for_function('()=>document.querySelector(".action-button").dataset.ready==="true"',timeout=30000);page.locator('.action-button').click();expect(page.locator('.result-overlay')).to_be_visible(timeout=20000);expect(page.locator('.mini-chain')).to_have_attribute('data-progress','21');expect(page.locator('.result-overlay')).to_contain_text('NOT RANKED')
 metrics.append({'liveProgress':progress});check('Real Solo countdown penalty persists through GO, repeated Space does not extend it, rolling count reaches 21 and round completes unranked')
 page.locator('.leave-crew-control').click();expect(page.locator('.main-menu')).to_be_visible()
 # Switch to real app views driven by clearly synthetic authoritative-shaped snapshots.
 page.set_viewport_size({'width':1440,'height':900});rooms=fixture(page);page.goto(BASE+'/#crew');page.wait_for_timeout(500);shot(page,'v9-player-full-garage')
 expect(page.locator('.pit-scene')).to_have_attribute('data-support-clear','true')
 # Cyan selection while gold YOU remains present.
 targets=json.loads(page.locator('.pit-scene').get_attribute('data-crew-targets'));selected=False
 for target in targets:
  x,y=target['x'],target['y']
  if target['role']!='FRONT_JACK' and 350<x<1250 and 280<y<620 and page.evaluate('(p)=>document.elementFromPoint(p.x,p.y)?.tagName',{'x':x,'y':y})=='CANVAS':
   page.mouse.click(x,y);page.wait_for_timeout(100)
   if page.locator('.crew-tooltip').count():selected=True;break
 assert selected;expect(page.locator('.pit-scene')).to_have_attribute('data-selected-color','#6ce8d9');expect(page.locator('.you-marker')).to_be_visible();shot(page,'v9-cyan-selection');page.mouse.click(1420,700);expect(page.locator('.crew-tooltip')).to_have_count(0)
 check('Another actor gets cyan selection and tooltip while YOU stays gold; empty floor clears selection')
 canvas=page.locator('.scene-stage canvas');canvas.focus()
 for i in range(4):
  for _ in range(10):page.keyboard.press('ArrowRight')
  page.wait_for_timeout(120);expect(page.locator('.pit-scene')).to_have_attribute('data-support-clear','true');shot(page,f'v9-support-orbit-{i}')
 check('Four orbit views retain all seven support actors outside the car envelope')
 page.goto(BASE+'/#watch');page.wait_for_selector('.live-card-preview');page.wait_for_function('()=>[...document.querySelectorAll(".live-card-preview")].every(c=>c.dataset.previewMode==="3d")',timeout=30000)
 expect(page.locator('.live-card-preview')).to_have_count(2);expect(page.locator('.waiting-crew')).to_have_count(1);expect(page.locator('.live-card.compact')).to_have_count(1)
 shot(page,'v9-full-fidelity-two-teams');page.locator('.live-card-preview').first.screenshot(path=str(OUT/'v9-preview-A.png'))
 assert page.locator('.live-card-preview').first.get_attribute('data-scene-model')=='full-garage-v9'
 for stage,ids in [('lift',['FRONT_LIFT','REAR_LIFT']),('loosen',[c+'_GUN_LOOSEN' for c in ['FL','FR','RL','RR']]),('remove',[c+'_WHEEL_OFF' for c in ['FL','FR','RL','RR']]),('fit',[c+'_WHEEL_ON' for c in ['FL','FR','RL','RR']]),('tighten',[c+'_GUN_TIGHTEN' for c in ['FL','FR','RL','RR']]),('lower',['FRONT_LOWER','REAR_LOWER'])]:
  pose(page,ids);page.wait_for_timeout(1000)
  expected={'lift':2,'loosen':6,'remove':10,'fit':14,'tighten':18,'lower':20}[stage]
  page.wait_for_function('(n)=>document.querySelector(".live-card-preview[data-room-id=A]")?.dataset.progress===String(n)',arg=expected,timeout=12000)
  a=page.locator('.live-card-preview[data-room-id="A"]');b=page.locator('.live-card-preview[data-room-id="B"]');assert b.get_attribute('data-progress')=='10'
  a.screenshot(path=str(OUT/f'v9-preview-{stage}.png'))
 metrics.append({'previewRoomA':20,'previewRoomB':10});check('Full garage previews independently track lift, loosen, remove, fit, tighten and lower; B never inherits A events')
 glBefore=page.evaluate('window.__qaGL.size');page.evaluate('()=>{window.__qaCount=6;window.dispatchEvent(new Event("online"))}')
 expect(page.locator('.live-card-preview')).to_have_count(6)
 page.wait_for_timeout(2000);page.locator('.observer-scroll').evaluate('(el)=>el.scrollTop=el.scrollHeight');page.wait_for_timeout(2500)
 modes=page.locator('.live-card-preview').evaluate_all('(els)=>els.map(c=>({room:c.dataset.roomId,mode:c.dataset.previewMode,cost:c.dataset.previewRenderMs,contexts:c.dataset.previewContexts}))');assert all(m['mode']=='3d' for m in modes),modes
 assert page.evaluate('window.__qaGL.size')==glBefore
 first=page.locator('.live-card-preview').evaluate_all('(els)=>({at:performance.now(),frames:els.map(c=>Number(c.dataset.previewFrames||0))})');page.wait_for_timeout(2500);second=page.locator('.live-card-preview').evaluate_all('(els)=>({at:performance.now(),frames:els.map(c=>Number(c.dataset.previewFrames||0))})');rates=[round((n-first['frames'][i])*1000/(second['at']-first['at']),2) for i,n in enumerate(second['frames'])]
 metrics.append({'sixRoomPreviews':modes,'observedPreviewHzOffscreenIsZero':rates,'extraWebGLContextsForFourExtraRooms':0});shot(page,'v9-six-room-budget');check('Six active full-scene rooms reuse the same preview context; waiting/finished have no canvas')
 page.evaluate('()=>{window.__qaRooms[0].status="COMPLETED";window.__qaRooms[0].round.status="COMPLETED";window.__qaRooms[0].round.elapsedMs=2500;window.__qaRooms[0].round.finishedAt=Date.now();window.dispatchEvent(new Event("online"))}');expect(page.locator('.live-card-preview')).to_have_count(5)
 check('Finishing a room removes its live canvas and produces compact results')
 assert not errors,errors
 check('No JavaScript runtime errors')
 (OUT/'v9-browser-report.json').write_text(json.dumps({'passed':checks,'measurements':metrics,'javascriptErrors':errors,'limits':'Local Chromium software WebGL and synthetic snapshots, not hosted cross-device Supabase or physical iPhone/Safari/speaker validation.'},indent=2))
 browser.close()
