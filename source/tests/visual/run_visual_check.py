from pathlib import Path
from playwright.sync_api import sync_playwright
import json, re
h = Path(__file__).parent / 'responsive-fixture.html'
raw=h.read_text()
src=h.parents[2]/'src'
def embed(match):
    name=match.group(1).rsplit('/',1)[-1]
    return '<style>\n'+(src/name).read_text()+'\n</style>'
html=re.sub(r'<link rel="stylesheet" href="([^"]+)">',embed,raw)

views=[('desktop-wide',1280,720,False),('desktop-narrow',820,620,False),('desktop-short',800,475,False),('phone-portrait',390,844,True),('phone-landscape',844,390,True),('phone-landscape-short',667,375,True),('phone-landscape-tiny',844,300,True),('tablet-portrait',768,1024,True),('tablet-landscape',1024,768,True)]
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-gpu'])
 for mode in ['menu','crew','replay']:
  for name,w,hgt,touch in views:
   context=browser.new_context(viewport={'width':w,'height':hgt},is_mobile=touch,has_touch=touch,device_scale_factor=1)
   page=context.new_page(); page.set_content(html.replace("||'menu'","||'"+mode+"'"),wait_until='load');page.wait_for_timeout(120)
   if name in ['desktop-narrow','desktop-short','phone-landscape','phone-landscape-short','phone-portrait']:
    path=Path('/mnt/data/pit_stop_v20_work/tests/visual') / f'{mode}-{name}.png'
    page.screenshot(path=str(path))
   findings=page.evaluate('''()=>{
    const rect=s=>{let el=document.querySelector(s);if(!el)return null;let r=el.getBoundingClientRect();return {x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height),right:Math.round(r.right),bottom:Math.round(r.bottom),scrollH:el.scrollHeight,clientH:el.clientHeight,overflow:getComputedStyle(el).overflowY};};
    return {coarse:matchMedia('(pointer:coarse)').matches,landscape:matchMedia('(orientation:landscape)').matches,menu:rect('.main-menu'),menuActions:rect('.menu-actions'),workflow:rect('.mini-chain'),dock:rect('.hud-dock'),replay:rect('.replay-controls')};}''')
   targets=[v for k,v in findings.items() if isinstance(v,dict)]
   for t in targets:
    assert t['x'] >= -8 and t['right'] <= w + 8 and t['bottom'] <= hgt + 9 and t['y'] >= -8, (mode,name,t)
   if mode=='menu' and touch and w>hgt:
    assert findings['menuActions']['x'] > w * .38, (name,findings)
    assert findings['menuActions']['bottom'] < hgt, (name,findings)
   if mode=='crew' and touch and w>hgt:
    assert 0 < findings['workflow']['x'] < w * .1 and findings['workflow']['w'] < w*.5, (name,findings)
    assert findings['dock']['w'] < w*.43, (name,findings)
   if mode=='replay' and not touch:
    assert findings['replay']['w'] < w*.65, (name,findings)

   print(mode,name,json.dumps(findings,ensure_ascii=False))
   context.close()
 browser.close()
