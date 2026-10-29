from pathlib import Path
from playwright.sync_api import sync_playwright
import re
src=Path('/mnt/data/pit_stop_v20_work/src')
fixture=Path('/mnt/data/pit_stop_v19_work/tests/visual/responsive-fixture.html').read_text()
css=[]
for ref in re.findall(r'<link rel="stylesheet" href="([^"]+)"',fixture):
 name=Path(ref).name
 css.append((src/name).read_text())
css.append((src/'v20-polish.css').read_text())
style='\n'.join(css)
html='''<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/><style>'''+style+'''</style><style>body{margin:0;background:#061019;} .overlay-backdrop{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:10px;} .game-overlay.chain-overlay{display:flex;flex-direction:column;background:#132632;color:#dde8ed;border:1px solid #4d6577;} .overlay-heading{display:flex;justify-content:space-between;align-items:center;} .overlay-heading h2{margin:0;} .overlay-content{flex:1;}</style></head><body><div class="overlay-backdrop"><section class="game-overlay chain-overlay"><header class="overlay-heading"><div><span class="eyebrow">LIVE WORKFLOW</span><h2>The connected stop</h2></div><button>X</button></header><div class="overlay-content"><section class="connected-workflow v11-board"><div class="graph-summary"><strong>0/21 complete</strong><span>Lift → loosen → change wheels → tighten → lower</span></div><div class="connected-graph"><svg class="graph-edges"></svg><div class="axle-columns">'''
for name in ['Front','Rear']:
 html+=f'<section class="axle-board"><div class="wheel-lane-name">{name} left</div><div class="wheel-lane-name">{name} right</div><div class="axle-jack"><button class="chain-node yours"><span class="chain-node-title">Lift {name.lower()} of car</span><span class="chain-node-owner">You</span></button></div>'
 for task in ['Loosen wheel nut','Remove old wheel','Fit new wheel','Tighten wheel nut']:
  for _ in range(2):html+=f'<button class="chain-node locked"><span class="chain-node-title">{task}</span><span class="chain-node-owner">🔒 Bot</span></button>'
 html+=f'<div class="axle-jack"><button class="chain-node"><span class="chain-node-title">Lower {name.lower()} of car</span><span class="chain-node-owner">Bot</span></button></div></section>'
html+='''</div><div class="release-join"><button class="chain-node"><span class="chain-node-title">Release car</span><span class="chain-node-owner">Bot</span></button></div></div><div class="graph-legend"><span>Blocked</span><span>Ready</span><span>Done</span><span>YOU</span></div><p class="chain-inspect">Tap a task for full name</p></section></div></section></div></body></html>'''
with sync_playwright() as p:
 b=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
 for w,h in [(375,667),(390,844),(430,932),(768,1024),(844,390)]:
  ctx=b.new_context(viewport={'width':w,'height':h},is_mobile=w<900,has_touch=w<900,device_scale_factor=1)
  page=ctx.new_page();page.set_content(html)
  page.wait_for_timeout(150)
  result=page.evaluate('''()=>{const select=s=>[...document.querySelectorAll(s)];let rects=select('.axle-board .chain-node,.release-join .chain-node').map(e=>{let r=e.getBoundingClientRect();return {x:r.left,y:r.top,rt:r.right,bt:r.bottom,w:r.width,h:r.height};});let collisions=0;for(let i=0;i<rects.length;i++)for(let j=i+1;j<rects.length;j++){let a=rects[i],b=rects[j];if(a.x<b.rt-1 && a.rt>b.x+1 && a.y<b.bt-1 && a.bt>b.y+1)collisions++;}return {collisions,rects:rects.length,minWidth:Math.min(...rects.map(r=>r.w)),minHeight:Math.min(...rects.map(r=>r.h)),maxBottom:Math.max(...rects.map(r=>r.bt)),clientH:innerHeight,graphBox:document.querySelector('.connected-graph').getBoundingClientRect().toJSON()};}''')
  print(w,h,result)
  path=Path('/mnt/data/pit_stop_v20_work/tests/visual') / f'v20-detailed-{w}x{h}.png'
  page.screenshot(path=str(path))
  if w<=430:assert result['collisions']==0,(w,h,result)
  ctx.close()
 b.close()
