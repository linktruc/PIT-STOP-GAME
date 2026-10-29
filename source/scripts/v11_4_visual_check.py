"""Actual shared WebGL scene and native Solo selection; no room/API fixtures."""
import json,os
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'docs/v11-4-evidence'
BASE=os.environ.get('PIT_PREVIEW_URL','http://127.0.0.1:4190')
expect.set_options(timeout=20000)
errors=[];markers=[];layouts=[]
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    try:
        context=browser.new_context(viewport={'width':1366,'height':768})
        context.add_init_script("localStorage.setItem('pit-v7-quality','low');localStorage.setItem('pit-v7-muted','true')")
        page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.goto(BASE)
        page.get_by_role('button',name='Solo Test',exact=False).click()
        page.wait_for_function("document.querySelector('.pit-scene').dataset.sceneModel==='full-pit-lane-v11'",timeout=60000)
        for role in ['FRONT_JACK','FL_GUNNER','RELEASE_CONTROLLER']:
            page.get_by_label('Choose role').select_option(role)
            expect(page.locator('.pit-scene')).to_have_attribute('data-player-role',role)
            page.wait_for_timeout(500)
            marker=page.locator('.you-marker');expect(marker).to_be_visible()
            row=marker.evaluate('(e)=>({label:e.getAttribute("aria-label"),transform:e.style.transform,color:getComputedStyle(e).backgroundColor,box:e.getBoundingClientRect().toJSON()})')
            assert row['color']=='rgb(255, 212, 87)',row
            assert role.replace('_',' ')[:5].lower() in row['label'].lower(),row
            markers.append({'role':role,**row});page.screenshot(path=str(OUT/f'webgl-solo-{role}.png'))
        assert len({r['transform'] for r in markers})==3,markers
        for width,height in [(390,844),(430,932)]:
            page.set_viewport_size({'width':width,'height':height})
            page.evaluate('''()=>{document.querySelector('#qa-badge')?.remove();const b=document.createElement('aside');b.id='qa-badge';b.dataset.netlifyBadge='';b.style='position:fixed;right:16px;bottom:28px;width:200px;height:48px;z-index:9999;display:grid;place-items:center;border:1px solid #446e79;border-radius:30px;background:#102c36;color:#d4e8ed;font:12px Arial';b.textContent='✦ Powered by Netlify';document.body.append(b);window.dispatchEvent(new Event('pit-camera-reset'));}''')
            page.wait_for_timeout(600)
            row=page.evaluate('''()=>{const box=s=>document.querySelector(s).getBoundingClientRect().toJSON();return{width:innerWidth,height:innerHeight,role:box('.role-strip'),action:box('.action-console'),picker:box('.solo-role-picker select'),badge:box('#qa-badge'),mini:box('.mini-chain'),pageHeight:document.documentElement.scrollHeight}}''')
            assert abs(row['badge']['top']-row['action']['bottom']-10)<1,row
            assert row['picker']['height']>=44 and row['role']['height']==54,row
            assert row['role']['top']>=row['mini']['bottom']+10,row
            assert row['pageHeight']<=height+1,row
            layouts.append(row);page.screenshot(path=str(OUT/f'webgl-mobile-solo-{width}.png'))
        page.evaluate("document.querySelector('#qa-badge').remove()")
        page.get_by_role('button',name='Main Menu',exact=True).click()
        for width,height in [(1366,768),(1440,900),(1920,1080)]:
            page.set_viewport_size({'width':width,'height':height});page.wait_for_timeout(500)
            expect(page.locator('.view-tools')).to_have_count(0)
            page.screenshot(path=str(OUT/f'webgl-menu-seat-{width}.png'))
            page.get_by_role('button',name='Open menu',exact=True).click()
            expect(page.locator('.navigation-grid button')).to_have_count(7)
            page.screenshot(path=str(OUT/f'webgl-navigation-{width}.png'))
            page.get_by_role('button',name='Close panel',exact=True).click()
        assert not errors,errors
        (OUT/'visual-report.json').write_text(json.dumps({'markers':markers,'mobileSolo':layouts,'desktopShots':[1366,1440,1920],'javascriptErrors':errors,'scope':'Actual App, native Solo selection, same full procedural WebGL factory and materials, ECO software Chromium. No API/room fixture; badge is labeled geometry placeholder. Physical Safari/GPU performance/production hosting not tested.'},indent=2)+'\n')
    finally:browser.close()
print('PASS actual WebGL marker/selector, mobile badge clearance, desktop menu/navigation captures',flush=True)
