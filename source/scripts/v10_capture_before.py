"""Capture unmodified V9.1 WebGL scene before the V10 environment overhaul."""
import ast,json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'docs/v10-evidence';OUT.mkdir(exist_ok=True)
source=ast.parse((ROOT/'scripts/v9_browser_smoke.py').read_text());helpers=ast.Module(body=[n for n in source.body if isinstance(n,ast.FunctionDef) and n.name=='fixture'],type_ignores=[]);exec(compile(helpers,'helpers','exec'))
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 c=b.new_context(viewport={'width':1440,'height':900});c.add_init_script("localStorage.setItem('pit-v7-quality','low')")
 page=c.new_page();page.goto('http://127.0.0.1:4193');fixture(page);page.goto('http://127.0.0.1:4193/#crew');page.wait_for_function('()=>document.querySelector(".pit-scene")?.dataset.crewCount==="22"');page.wait_for_timeout(800)
 page.screenshot(path=str(OUT/'before-v9-diagonal.png'))
 canvas=page.locator('.scene-stage canvas');canvas.focus()
 # Actual OrbitControls gestures, without replacing or rebuilding the baseline scene.
 page.mouse.move(850,460);page.mouse.down();page.mouse.move(850,700,steps=30);page.mouse.up();page.wait_for_timeout(600);page.screenshot(path=str(OUT/'before-v9-top.png'))
 page.keyboard.press('Home');page.wait_for_timeout(200)
 for _ in range(5):page.keyboard.press('ArrowRight')
 page.mouse.move(850,500);page.mouse.down();page.mouse.move(850,430,steps=20);page.mouse.up();page.wait_for_timeout(600);page.screenshot(path=str(OUT/'before-v9-front.png'))
 (OUT/'baseline.json').write_text(json.dumps({'baseline':'V9.1 unmodified /workspace/pit-crew-v9','tests':139,'browser':'Chromium software WebGL','angles':'Default diagonal; manual OrbitControls top and front approximations. Camera angles not pixel-identical to V10 preset views.'},indent=2))
 b.close()
print('Captured actual V9.1 WebGL baseline: diagonal, top, front')
