"""Narrow desktop/zoom toolbar and idle Solo overlap audit, actual local UI."""
import json,os
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'docs/v11-4-evidence'
BASE=os.environ.get('PIT_PREVIEW_URL','http://127.0.0.1:4190');rows=[];errors=[]
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox','--disable-webgl','--disable-gpu'])
    try:
        page=browser.new_page(viewport={'width':1366,'height':768});page.on('pageerror',lambda e:errors.append(str(e)));page.goto(BASE)
        page.get_by_role('button',name='Solo Test',exact=False).click();page.wait_for_selector('.hud-dock')
        for width,height in [(1366,768),(1440,900),(1920,1080),(1280,720),(1024,600),(1093,614),(1152,720),(1536,864),(1024,576),(819,480),(390,844),(430,932)]:
            page.set_viewport_size({'width':width,'height':height});page.wait_for_timeout(200)
            row=page.evaluate('''()=>{const box=s=>document.querySelector(s).getBoundingClientRect().toJSON();return{width:innerWidth,height:innerHeight,timer:box('.race-timer'),toolbar:box('.top-controls'),back:box('.back-menu'),heading:box('.room-heading'),mini:box('.mini-chain'),role:box('.role-strip'),action:box('.action-console'),picker:box('.solo-role-picker select'),pageHeight:document.documentElement.scrollHeight}}''')
            for one,two in [('timer','toolbar'),('timer','back'),('heading','mini'),('mini','role'),('mini','action')]:
                a,b=row[one],row[two]
                assert min(a['right'],b['right'])-max(a['left'],b['left'])<1 or min(a['bottom'],b['bottom'])-max(a['top'],b['top'])<1,(one,two,row)
            assert row['picker']['height']>=44 and row['picker']['top']>=row['action']['top'],row
            assert row['picker']['bottom']<=row['action']['bottom'] and row['pageHeight']<=height+1,row
            rows.append(row)
        assert not errors,errors
        (OUT/'hud-audit.json').write_text(json.dumps({'measurements':rows,'javascriptErrors':errors,'scope':'Actual source UI/local Solo; CSS viewport widths include125%equivalent laptop dimensions. NoWebGL geometry audit, physicalOSzoom/Safari not tested.'},indent=2)+'\n')
    finally:browser.close()
print('PASS12 idle Solo HUD sizes, including narrow desktop timer/toolbar and selector',flush=True)
