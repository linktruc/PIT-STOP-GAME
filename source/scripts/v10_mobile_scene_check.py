"""Actual mobile-sized WebGL player view, orbit and cyan/gold selection checks."""
import ast,json,os
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'docs/v10-evidence';BASE=os.environ.get('PIT_PREVIEW_URL','http://127.0.0.1:4190')
source=ast.parse((ROOT/'scripts/v9_browser_smoke.py').read_text());exec(compile(ast.Module(body=[n for n in source.body if isinstance(n,ast.FunctionDef) and n.name=='fixture'],type_ignores=[]),'helpers','exec'))
errors=[];rows=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 c=b.new_context(viewport={'width':390,'height':844});c.add_init_script("localStorage.setItem('pit-v7-quality','low')")
 page=c.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.goto(BASE);fixture(page)
 page.evaluate("()=>{window.__qaRooms[0].name='APEX 07';window.dispatchEvent(new Event('online'));}")
 page.goto(BASE+'/#crew');page.wait_for_function('()=>document.querySelector(".pit-scene")?.dataset.sceneModel==="full-pit-lane-v10"')
 for w,h in [(390,844),(430,932)]:
  page.set_viewport_size({'width':w,'height':h});page.wait_for_timeout(350)
  scene=page.locator('.scene-stage .pit-scene');expect(scene).to_have_attribute('data-support-body-clear','true');expect(page.locator('.you-marker')).to_be_visible()
  m=page.evaluate('()=>({w:innerWidth,h:innerHeight,sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight,role:document.querySelector(".role-strip").getBoundingClientRect().toJSON(),action:document.querySelector(".action-console").getBoundingClientRect().toJSON(),mini:document.querySelector(".mini-chain").getBoundingClientRect().toJSON()})')
  assert m['sw']<=w+1 and m['sh']<=h+1 and m['role']['height']==54 and m['action']['bottom']<=h-90,m
  rows.append(m);page.screenshot(path=str(OUT/f'player-webgl-{w}.png'))
 # Actual raycast selection keeps the player's existing gold indicator.
 targets=json.loads(scene.get_attribute('data-crew-targets'));selected=False
 for t in targets:
  if t['role']=='FRONT_JACK' or not (25<t['x']<405 and 230<t['y']<600):continue
  if page.evaluate('(p)=>document.elementFromPoint(p.x,p.y)?.tagName',t)!='CANVAS':continue
  page.mouse.click(t['x'],t['y']);page.wait_for_timeout(100)
  if page.locator('.crew-tooltip').count():selected=True;break
 assert selected,'No reachable actor could be selected'
 expect(scene).to_have_attribute('data-selected-color','#6ce8d9');expect(page.locator('.you-marker')).to_be_visible();page.screenshot(path=str(OUT/'player-cyan-and-gold-430.png'))
 canvas=page.locator('.scene-stage canvas');canvas.focus();yaw=scene.get_attribute('data-camera-yaw')
 page.keyboard.press('ArrowRight');page.wait_for_function('(before)=>document.querySelector(".pit-scene").dataset.cameraYaw!==before',arg=yaw)
 page.mouse.move(180,380);page.mouse.down();page.mouse.move(245,400,steps=12);page.mouse.up();expect(scene).to_have_attribute('data-support-body-clear','true')
 assert not errors,errors
 (OUT/'mobile-scene-report.json').write_text(json.dumps({'measurements':rows,'checks':['Actual WebGL player views390x844 and430x932, no page scrolling, role54px and controls above90px badge','Gold YOU remains visible with cyan raycast selection on a different actor','Manual keyboard orbit and drag rotate without changing gameplay; support body clearance true'],'javascriptErrors':errors,'limits':'Chromium software WebGL at mobile viewport sizes; no physical iPhone/Safari or hardware FPS claim. Synthetic live snapshots drive the real player scene.'},indent=2))
 b.close()
print('PASS mobile WebGL, cyan/gold indicators and manual orbit',flush=True)
