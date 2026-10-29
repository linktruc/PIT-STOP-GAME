"""Check header columns against long official times in real Chromium layout."""
import json, os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/v10-evidence'
OUT.mkdir(exist_ok=True)
BASE=os.environ.get('PIT_PREVIEW_URL','http://127.0.0.1:4190')
rows=[]
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-webgl'])
 page=browser.new_page(viewport={'width':1440,'height':900})
 page.goto(BASE)
 page.get_by_role('button',name='Solo Test',exact=False).click()
 expect(page.locator('.role-strip')).to_be_visible()
 page.get_by_role('button',name='Mark ready',exact=True).click()
 page.get_by_role('button',name='Start round',exact=False).click()
 for w,h in [(375,667),(390,844),(430,932)]:
  page.set_viewport_size({'width':w,'height':h})
  page.wait_for_timeout(100)
  row=page.evaluate('''()=>({width:innerWidth,height:innerHeight,role:document.querySelector('.role-strip').getBoundingClientRect().toJSON(),action:document.querySelector('.action-console').getBoundingClientRect().toJSON()})''')
  assert row['role']['height']==54,row
  assert row['action']['top']-row['role']['bottom']>=4,row
  rows.append(row)
 for w,h in [(601,900),(768,1024),(1024,900),(1200,900),(1440,900),(1920,1080)]:
  page.set_viewport_size({'width':w,'height':h})
  page.wait_for_timeout(100)
  row=page.evaluate('''()=>{
   const strong=document.querySelector('.race-timer>strong');
   strong.replaceChildren(document.createTextNode('999.999'),Object.assign(document.createElement('small'),{textContent:'s'}));
   const box=s=>document.querySelector(s).getBoundingClientRect().toJSON();
   return {width:innerWidth,timer:box('.race-timer'),controls:box('.top-controls'),menu:box('.back-menu'),heading:box('.room-heading'),ribbon:box('.mini-chain')};
  }''')
  for a,b in [('timer','controls'),('timer','menu'),('heading','ribbon')]:
   x,y=row[a],row[b]
   overlap=min(x['right'],y['right'])-max(x['left'],y['left'])>0.5 and min(x['bottom'],y['bottom'])-max(x['top'],y['top'])>0.5
   assert not overlap,(w,a,b,row)
  assert row['timer']['left']>=0 and row['controls']['right']<=w+1,row
  rows.append(row)
  if w==1440: page.screenshot(path=str(OUT/'ui-long-timer-header-1440.png'))
 browser.close()
(OUT/'header-report.json').write_text(json.dumps({'checks':['Long 999.999s timer does not overlap header controls/menu at 601,768,1024,1200,1440,1920 widths','Room heading clears the workflow ribbon at every checked width','The 54px role card clears the action console by at least 4px at 375/390/430 mobile widths'],'measurements':rows},indent=2))
print('PASS long timer header and heading/ribbon clearance at all six widths')
