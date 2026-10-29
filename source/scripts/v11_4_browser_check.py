"""Actual UI acceptance: all15 Solo roles, contextual routes and layout/zoom.

No API or room mutations are mocked. Source module imports are read-only QA
inspection of the exact local adapter used by the UI. Zoom uses the equivalent
CSS viewport and DPR for a physical window at125%, not a physical-browser claim.
"""
import json, os, re
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/v11-4-evidence';OUT.mkdir(exist_ok=True)
BASE=os.environ.get('PIT_PREVIEW_URL','http://127.0.0.1:4190')
expect.set_options(timeout=15000)
errors=[];roles=[];layouts=[];routes=[]
PHASE=os.environ.get('PIT_QA_PHASE','all')

def state(page):
    return page.evaluate("async()=>{const {api}=await import('/src/api.ts');return api.getState()}")

def navigation(page, label):
    page.get_by_role('button',name='Open menu',exact=True).click()
    page.locator('.controls-menu').get_by_role('button',name=re.compile('^'+re.escape(label))).click()

def menu_matrix(page,seated):
    for physical_w,physical_h in [(1366,768),(1440,900),(1920,1080),(1280,720),(1024,600),(390,844),(430,932)]:
        for zoom in ([1,1.25] if physical_w>600 else [1]):
            width,height=round(physical_w/zoom),round(physical_h/zoom)
            cdp=page.context.new_cdp_session(page)
            cdp.send('Emulation.setDeviceMetricsOverride',{'width':width,'height':height,'deviceScaleFactor':zoom,'mobile':False})
            page.wait_for_timeout(120)
            page.locator('.main-menu').evaluate('(e)=>e.scrollTop=0')
            data=page.evaluate('''()=>{const box=e=>e?.getBoundingClientRect().toJSON();const m=document.querySelector('.main-menu');return{width:innerWidth,height:innerHeight,menu:box(m),header:box(document.querySelector('.top-hud')),note:box(m.querySelector('.saved-seat-note')),seat:box(m.querySelector('.team-seat-actions')),create:box(m.querySelector('.menu-actions>.primary')),scrollHeight:m.scrollHeight,clientHeight:m.clientHeight,pageHeight:document.documentElement.scrollHeight,hintCount:document.querySelectorAll('.view-tools').length};}''')
            assert data['hintCount']==0,data
            assert page.locator('.main-menu h1').evaluate('(e)=>e.scrollWidth<=e.clientWidth+1'),'Menu title overflow'
            assert data['pageHeight']<=height+1,data
            assert data['menu']['top']>=data['header']['bottom']+8,data
            if seated:
                assert data['note']['top']>=data['seat']['bottom']+5,data
                assert data['create']['top']>=data['note']['bottom']+8,data
            for button in page.locator('.main-menu button').all():
                button.scroll_into_view_if_needed()
                box=button.bounding_box();host=page.locator('.main-menu').bounding_box()
                assert box['y']>=host['y']-1 and box['y']+box['height']<=host['y']+host['height']+1,(button.inner_text(),box,host)
                assert button.evaluate('(e)=>e.scrollWidth<=e.clientWidth+1'),button.inner_text()
            page.locator('.main-menu').evaluate('(e)=>e.scrollTop=0')
            page.get_by_role('button',name='Open menu',exact=True).click()
            nav=page.evaluate('''()=>{const box=e=>e.getBoundingClientRect().toJSON();return{panel:box(document.querySelector('.navigation-overlay')),items:[...document.querySelectorAll('.navigation-grid>button')].map(e=>({label:e.querySelector('strong').textContent,box:box(e),icon:!!e.querySelector('.navigation-icon'),border:getComputedStyle(e).borderTopWidth,textHeight:e.querySelector('span').scrollHeight,available:e.clientHeight}))};}''')
            assert nav['panel']['width']<=560.5,nav
            for item in nav['items']:
                assert item['box']['height']>=58 and item['icon'] and item['border']=='1px',item
                assert item['textHeight']<=item['available']-10,item
            for i,a in enumerate(nav['items']):
                for b in nav['items'][i+1:]:
                    x,y=a['box'],b['box'];assert min(x['right'],y['right'])-max(x['left'],y['left'])<=1 or min(x['bottom'],y['bottom'])-max(x['top'],y['top'])<=1,(a,b)
            if seated and physical_w in [1366,1440,1920,390] and zoom==1:
                page.screenshot(path=str(OUT/f'after-navigation-{physical_w}.png'))
            # Every control must remain reachable inside the bounded modal.
            for button in page.locator('.controls-menu button').all():
                button.scroll_into_view_if_needed()
                assert button.evaluate('(e)=>{const r=e.getBoundingClientRect(),p=e.closest(".overlay-content").getBoundingClientRect();return r.top>=p.top-1&&r.bottom<=p.bottom+1}'),button.inner_text()
            page.get_by_role('button',name='Close panel',exact=True).click()
            if seated and physical_w in [1366,1440,1920,390] and zoom==1:
                page.screenshot(path=str(OUT/f'after-menu-seat-{physical_w}.png'))
            layouts.append({'physicalViewport':[physical_w,physical_h],'zoomEquivalent':zoom,'seated':seated,'measurement':data,'navigation':nav})
            cdp.detach()
    print('PASS menu/navigation matrix',seated,flush=True)

with sync_playwright() as p:
    browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-webgl','--disable-gpu'])
    try:
        context=browser.new_context(viewport={'width':1366,'height':768},permissions=['clipboard-read','clipboard-write'])
        context.add_init_script("localStorage.setItem('pit-v7-quality','low');localStorage.setItem('pit-v7-muted','true')")
        page=context.new_page();page.on('pageerror',lambda error:errors.append(str(error)));page.goto(BASE)
        page.get_by_role('button',name='Solo Test',exact=False).click()
        options=page.get_by_label('Choose role').locator('option').evaluate_all('(els)=>els.map(e=>({value:e.value,label:e.textContent}))')
        assert len(options)==15 and len({o['value'] for o in options})==15,options
        if PHASE != 'layout':
            for index,option in enumerate(options):
                role,label=option['value'],option['label']
                # Test the real Ready->change->not-ready transition for each position.
                page.get_by_role('button',name='Mark ready',exact=True).click()
                # Select a different role first when the retained choice is identical.
                if page.get_by_label('Choose role').input_value()==role:
                    alternate=next(o['value'] for o in options if o['value']!=role)
                    page.get_by_label('Choose role').select_option(alternate)
                    page.get_by_role('button',name='Mark ready',exact=True).click()
                page.get_by_label('Choose role').select_option(role)
                expect(page.get_by_role('button',name='Mark ready',exact=True)).to_be_visible()
                expect(page.get_by_role('button',name='Start round',exact=True)).to_be_disabled()
                expect(page.locator('.role-identity h2')).to_have_text(label)
                expect(page.locator('.pit-scene').first).to_have_attribute('data-player-role',role)
                picker=page.get_by_label('Choose role').bounding_box();assert picker['height']>=44,picker
                snapshot=state(page);room=snapshot['rooms'][0]
                assert room['round'] is None and room['players'][0]['ready'] is False,room
                expected=[t['id'] for t in page.evaluate("async players=>{const {createTasks}=await import('/src/engine.ts');return createTasks(players)}",room['players']) if t['ownerId']=='solo-you']
                page.locator('.mini-chain').click()
                expect(page.locator('.chain-node')).to_have_count(21)
                assert set(page.locator('.chain-node[data-owned=true]').evaluate_all('(es)=>es.map(e=>e.dataset.taskId)'))==set(expected)
                page.get_by_role('button',name='Close panel',exact=True).click()
                if index in [0,2,14]: page.screenshot(path=str(OUT/f'after-solo-{role}.png'))
                page.get_by_role('button',name='Mark ready',exact=True).click();page.get_by_role('button',name='Start round',exact=True).click()
                expect(page.get_by_label('Choose role')).to_have_count(0)
                actions=[]
                for _ in expected:
                    action=page.locator('.action-button');expect(action).to_have_attribute('data-ready','true',timeout=45000)
                    actions.append(action.inner_text());action.click()
                    expect(page.locator('.action-button.penalized')).to_have_count(0)
                expect(page.locator('.result-overlay')).to_be_visible(timeout=45000)
                snapshot=state(page);room=snapshot['rooms'][0];round=room['round']
                assert room['players'][0]['role']==role and round['players'][0]['role']==role
                assert len(round['events'])==21 and all(t['status']=='DONE' for t in round['tasks']),round
                assert [t['id'] for t in round['tasks'] if t['ownerId']=='solo-you']==expected
                assert all(t['ownerId'] is None for t in round['tasks'] if t['role']!=role)
                assert len(round['samples'])==len(expected) and snapshot['leaderboard']==[]
                record=page.evaluate("async id=>{const {api}=await import('/src/api.ts');return api.getReplay(id)}",round['id'])
                assert record['solo'] and record['round']['players'][0]['role']==role
                roles.append({'role':role,'label':label,'ownedTasks':expected,'actualActions':actions,'eventCount':len(round['events']),'elapsedMs':round['elapsedMs'],'humanSamples':len(round['samples']),'soloReplay':record['solo']})
                page.get_by_role('button',name='Play again',exact=True).click()
                expect(page.get_by_label('Choose role')).to_have_value(role)
                expect(page.locator('.desktop-live-log')).to_have_attribute('data-event-count','0')
                print('PASS real Solo round',role,actions,flush=True)
        assert not errors,errors
        if roles:
            (OUT/'solo-roles-report.json').write_text(json.dumps({'soloRounds':roles,'javascriptErrors':errors,'scope':'Actual source App/native buttons and local Solo engine. No state mutation/API fixtures; module imports only inspect state. WebGL disabled.'},indent=2)+'\n')
        if PHASE == 'roles':
            print('PASS all15 native UI Solo rounds',flush=True)
            raise SystemExit(0)
        page.get_by_role('button',name='Main Menu',exact=True).click()
        menu_matrix(page,True)
        page.set_viewport_size({'width':1366,'height':768})
        page.get_by_role('button',name='Leave Team',exact=True).click()
        menu_matrix(page,False)
        page.set_viewport_size({'width':1366,'height':768})
        page.get_by_role('button',name='Create Team',exact=True).click()
        page.get_by_label('TEAM NAME',exact=True).fill('Navigation QA')
        page.get_by_label('YOUR NICKNAME',exact=True).fill('Driver')
        page.locator('form').get_by_role('button',name='Create Team',exact=False).click()
        expect(page.locator('.hud-dock')).to_be_visible()
        navigation(page,'Main Menu');expect(page.locator('.main-menu')).to_be_visible();routes.append('Main Menu preserves seat')
        navigation(page,'Resume Team');expect(page.locator('.hud-dock')).to_be_visible();routes.append('Resume Team')
        for label,selector in [('Full Workflow','.chain-hud'),('Team Members','.roster-list'),('All Roles','.all-roles'),('Leaderboard','.standings'),('Settings','.settings-panel')]:
            navigation(page,label);expect(page.locator(selector)).to_be_visible();routes.append(label)
            page.get_by_role('button',name='Close panel',exact=True).click()
        navigation(page,'Invite Link');expect(page.get_by_text('Room directory link copied. Ask teammates to join your crew.',exact=True)).to_be_visible()
        assert page.evaluate('navigator.clipboard.readText()').endswith('#rooms');routes.append('Invite Link copies existing directory route')
        page.get_by_role('button',name='Close panel',exact=True).click()
        navigation(page,'Watch Live');expect(page.locator('.observer-overview')).to_be_visible();routes.append('Watch Live')
        navigation(page,'My Team');expect(page.locator('.hud-dock')).to_be_visible();routes.append('My Team')
        assert not errors,errors
        (OUT/'layout-navigation-report.json').write_text(json.dumps({'soloRounds':roles,'layoutChecks':layouts,'navigationRoutes':routes,'javascriptErrors':errors,'scope':'Actual application/native controls and real local Solo/practice adapters, no API/room mocks. Source imports only inspect state. WebGL disabled for fast layout/behavior; screenshots show fallback.125% modeled by equivalentCSSviewport/DPR; physicalOSzoom/Safari/hostedSupabase not tested.'},indent=2)+'\n')
    finally: browser.close()
print('PASS V11.4 browser acceptance',len(roles),'roles',len(layouts),'layout states',flush=True)
