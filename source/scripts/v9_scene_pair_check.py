"""Actual PitScene plus actual TeamPreview components, identical synthetic room/task events."""
import ast,json,os
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'qa-output';OUT.mkdir(exist_ok=True);BASE=os.environ.get('PIT_PREVIEW_URL','http://127.0.0.1:4190')
source=ast.parse((ROOT/'scripts/v9_browser_smoke.py').read_text());helpers=ast.Module(body=[n for n in source.body if isinstance(n,ast.FunctionDef) and n.name in ['fixture','pose']],type_ignores=[]);exec(compile(helpers,'qa-helpers','exec'))
results=[];errors=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 c=b.new_context(viewport={'width':1280,'height':800});c.add_init_script("localStorage.setItem('pit-v7-quality','low')")
 page=c.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.goto(BASE);fixture(page);page.goto(BASE+'/#crew');page.wait_for_timeout(500)
 page.evaluate('''async()=>{const {default:React}=await import('/node_modules/.vite/deps/react.js');const {default:ReactDOM}=await import('/node_modules/.vite/deps/react-dom_client.js');const {TeamPreviewProvider,TeamPreview}=await import('/src/TeamPreviews.tsx');const host=document.createElement('div');host.id='qa-live-pair';host.style='position:fixed;top:110px;right:15px;width:310px;z-index:99;pointer-events:none;background:#101f29';document.body.append(host);const root=ReactDOM.createRoot(host);window.__updatePair=()=>root.render(React.createElement(TeamPreviewProvider,null,...window.__qaRooms.slice(0,2).map(r=>React.createElement(TeamPreview,{key:r.id,room:structuredClone(r)}))));window.__updatePair();}''')
 page.wait_for_function('()=>[...document.querySelectorAll(".live-card-preview")].length===2&&[...document.querySelectorAll(".live-card-preview")].every(c=>c.dataset.previewMode==="3d")',timeout=30000)
 for name,ids in [('lift',['FRONT_LIFT','REAR_LIFT']),('gun',[c+'_GUN_LOOSEN' for c in ['FL','FR','RL','RR']]),('remove',[c+'_WHEEL_OFF' for c in ['FL','FR','RL','RR']]),('fit',[c+'_WHEEL_ON' for c in ['FL','FR','RL','RR']]),('tighten',[c+'_GUN_TIGHTEN' for c in ['FL','FR','RL','RR']]),('lower',['FRONT_LOWER','REAR_LOWER']),('release',['GREEN_RELEASE'])]:
  pose(page,ids);page.evaluate('window.__updatePair()');page.wait_for_timeout(2400 if name=='release' else 1400)
  active=page.locator('.live-card-preview[data-room-id="A"]');expected=page.evaluate('window.__qaRooms[0].round.tasks.filter(t=>t.status==="DONE").length');expect(active).to_have_attribute('data-progress',str(expected),timeout=15000)
  a=page.locator('.pit-scene').evaluate('(el)=>({front:Number(el.dataset.frontLift),rear:Number(el.dataset.rearLift),drive:Number(el.dataset.carDeparture),clear:el.dataset.laneClear,model:el.dataset.sceneModel,count:el.dataset.crewCount})');v=active.evaluate('(el)=>({front:Number(el.dataset.frontLift),rear:Number(el.dataset.rearLift),drive:Number(el.dataset.carDeparture),clear:el.dataset.laneClear,model:el.dataset.sceneModel,count:el.dataset.crewCount})')
  assert abs(a['front']-v['front'])<.03 and abs(a['rear']-v['rear'])<.03,(name,a,v);assert a['model']==v['model']=='full-garage-v9' and a['count']==v['count']=='22'
  if name=='release':assert a['clear']==v['clear']=='true' and a['drive']>.99 and v['drive']>.99,(a,v)
  if name in ['lift','remove','fit','lower','release']:
   page.locator('#qa-live-pair').evaluate('(el)=>el.style.visibility="hidden"');page.screenshot(path=str(OUT/f'v9-pair-player-{name}.png'));page.locator('#qa-live-pair').evaluate('(el)=>el.style.visibility="visible"');page.wait_for_timeout(300);active.screenshot(path=str(OUT/f'v9-pair-preview-{name}.png'))
  results.append({'stage':name,'player':a,'preview':v});print('PASS actual player and actual preview same full scene and settled pose:',name,flush=True)
 assert not errors,errors
 (OUT/'v9-scene-pair-report.json').write_text(json.dumps({'stages':results,'javascriptErrors':errors,'limits':'Actual PitScene and TeamPreview components consume the same synthetic snapshots in a local QA overlay. Release fixture intentionally stays active briefly to inspect shared departure; production completed cards immediately remove their preview. No hosted integration claimed.'},indent=2));b.close()
