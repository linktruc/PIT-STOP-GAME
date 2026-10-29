import ast,json,os
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];BASE=os.environ.get('PIT_PREVIEW_URL','http://127.0.0.1:4190');OUT=ROOT/'docs/v10-evidence';OUT.mkdir(exist_ok=True)
source=ast.parse((ROOT/'scripts/v9_browser_smoke.py').read_text());exec(compile(ast.Module(body=[n for n in source.body if isinstance(n,ast.FunctionDef) and n.name=='fixture'],type_ignores=[]),'helpers','exec'))
errors=[];metrics=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 c=b.new_context(viewport={'width':1440,'height':900});c.add_init_script("localStorage.setItem('pit-v7-quality','low')")
 page=c.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.goto(BASE);fixture(page);page.evaluate("()=>{window.__qaRooms[0].name='APEX 07';window.dispatchEvent(new Event('online'));}");page.goto(BASE+'/#crew');page.wait_for_function('()=>document.querySelector(".pit-scene")?.dataset.sceneModel==="full-pit-lane-v10"');page.wait_for_timeout(800)
 for view in ['top','diagonal','front']:
  page.evaluate('(view)=>window.dispatchEvent(new CustomEvent("pit-camera-view",{detail:view}))',view);page.wait_for_timeout(300)
  page.screenshot(path=str(OUT/f'after-{view}.png'))
  metrics.append({'actualAppView':view,'dataset':page.locator('.pit-scene').evaluate('(el)=>({...el.dataset,crewTargets:undefined})')})
 # Shared actual factory, isolated only to control absolute presentation time for geometry checks.
 page.evaluate('''async()=>{
 document.querySelector('#root').style.display='none';
 const host=document.createElement('div');host.id='scene-qa';host.style='position:fixed;inset:0;background:#111;z-index:99999';document.body.append(host);
 const {createPitGarageScene}=await import('/src/scene/garage.ts');const {createRound}=await import('/src/engine.ts');const {ROLES}=await import('/src/types.ts');
 const players=ROLES.map((role,i)=>({id:'qa-'+i,role,nickname:'Crew '+i,ready:true,joinedAt:0}));
 const round=createRound(players,100000,'qa-recorded');
 for(const task of round.tasks){const parent=task.dependencies.map(id=>round.tasks.find(t=>t.id===id).completedAt);task.enabledAt=Math.max(round.goAt,...parent);task.completedAt=task.enabledAt+900;task.status='DONE';}
 round.status='COMPLETED';round.finishedAt=Math.max(...round.tasks.map(t=>t.completedAt));round.elapsedMs=round.finishedAt-round.goAt;
 window.__sceneRoom={id:'qa-room',teamId:'qa-team',name:'Geometry QA',color:'#ef3340',code:'TESTQA',hostId:players[0].id,status:'COMPLETED',players,round,updatedAt:round.finishedAt};
 window.__sceneWorld=createPitGarageScene(host,{quality:'low'});window.__sceneWorld.setCameraView('diagonal');
 window.__seekScene=(time)=>window.__sceneWorld.update(window.__sceneRoom,'qa-0',true,time);
 window.__seekScene(100350);
 }''')
 for label,time in [('before-countdown',96500),('3',97000),('2',98000),('1',99000),('GO',100000),('ready',100350),('lift',101225),('gun',101950),('remove',102825),('fit',103725),('tighten',104550),('lower',105725),('release',106350),('exit',108700),('seek-back-fit',103725)]:
  page.evaluate('(time)=>window.__seekScene(time)',time);page.wait_for_function('(time)=>document.querySelector("#scene-qa").dataset.sceneClock===String(time)',arg=time,timeout=30000)
  dataset=page.locator('#scene-qa').evaluate('(el)=>({...el.dataset,crewTargets:undefined})');metrics.append({'pose':label,'time':time,'dataset':dataset})
  assert dataset['supportClear']=='true',(label,dataset)
  if label in ['GO','ready','lift','gun','remove','fit','tighten','lower','seek-back-fit']:assert abs(float(dataset['carZ']))<.001,(label,dataset)
  if label=='lower':assert 'FRONT_LOWER' in dataset['animationTasks'] and 0<float(dataset['frontLift'])<.27,(label,dataset)
  if float(dataset['carDeparture'])>0:assert dataset['laneClear']=='true',(label,dataset)
  if label in ['3','2','1','GO','lift','gun','remove','fit','tighten','lower','exit']:page.screenshot(path=str(OUT/f'scene-{label}.png'))
  if label in ['ready','lift','gun']:assert float(dataset['supportContactError'])<.06,(label,dataset)
 (OUT/'scene-geometry-report.json').write_text(json.dumps({'measurements':metrics,'javascriptErrors':errors,'scope':'Chromium software WebGL. Main action staging preserved. Support body clearance uses original chassis/wing/wheel footprints; actual multi-view screenshots show geometry. Shared factory deterministic clock tested through reverse seek.'},indent=2))
 assert not errors,errors
 b.close()
print('Scene WebGL checks passed: arrival, GO, all phases, support contacts, retreat/departure, reverse seek')
