"""Final actual-App WebGL composition and orbit check at requested dimensions.

Only room data is controlled. App, HUD, renderer, materials and geometry are
the editable production source. No image editing or substitute scene is used.
"""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/v11-evidence'
BASE = os.environ.get('PIT_PREVIEW_URL', 'http://127.0.0.1:4190')
rows = []
errors = []
expect.set_options(timeout=20000)

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True,
        args=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle',
              '--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    try:
        context = browser.new_context(viewport={'width':390,'height':844})
        context.add_init_script("localStorage.setItem('pit-v7-quality','low');localStorage.setItem('pit-v7-muted','true')")
        page = context.new_page()
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(BASE)
        page.evaluate('''async()=>{
          const {ROLES}=await import('/src/types.ts');
          const {createRound,reconcile,submitAction}=await import('/src/engine.ts');
          const now=Date.now(),go=now-1800;
          const players=ROLES.map((role,i)=>({id:'final-'+i,role,nickname:'Crew '+i,ready:true,joinedAt:go-1000+i,connected:true}));
          const round=createRound(players,go,'final-layout-round');reconcile(round,go);
          submitAction(round,players[0].id,'FRONT_LIFT',go+400,'front');
          submitAction(round,players[1].id,'REAR_LIFT',go+500,'rear');
          window.__finalRoom={id:'final',teamId:'final',name:'APEX 07',code:'FINAL',color:'#ed3340',hostId:players[0].id,players,status:'RUNNING',round,updatedAt:now};
          const path=[...performance.getEntriesByType('resource')].reverse().find(e=>new URL(e.name).pathname==='/src/api.ts').name;
          const {api}=await import(path);
          api.getState=async()=>({rooms:[structuredClone(window.__finalRoom)],leaderboard:[],replays:[],serverNow:Date.now(),identity:{playerId:players[0].id,isAdmin:false}});
          api.call=async()=>api.getState();window.dispatchEvent(new Event('online'));
        }''')
        page.goto(BASE+'/#crew')
        expect(page.locator('.hud-dock')).to_be_visible()
        page.wait_for_function("document.querySelector('.pit-scene')?.dataset.sceneModel==='full-pit-lane-v11'", timeout=60000)
        for width,height in [(390,844),(430,932),(1366,768),(1920,1080)]:
            page.set_viewport_size({'width':width,'height':height})
            page.evaluate('''mobile=>{
              document.getElementById('final-hosting-badge')?.remove();
              if(mobile){const b=document.createElement('aside');b.id='final-hosting-badge';b.dataset.pitOverlayReservation='';
                b.style='position:fixed;right:16px;bottom:28px;width:200px;height:48px;z-index:99999;display:grid;place-items:center;border:1px solid #2e515b;border-radius:26px;background:#102c36;color:#d4e8ed;font:12px Arial';
                b.textContent='✦ Powered by Netlify';document.body.append(b);}
              window.dispatchEvent(new Event('pit-camera-reset'));
            }''', width<=600)
            page.wait_for_timeout(1200)
            row=page.evaluate('''()=>{const e=document.querySelector('.pit-scene'),box=s=>document.querySelector(s)?.getBoundingClientRect().toJSON();return{width:innerWidth,height:innerHeight,sceneModel:e.dataset.sceneModel,carBounds:JSON.parse(e.dataset.carBounds),carViewport:JSON.parse(e.dataset.carViewport),carX:e.dataset.carX,carZ:e.dataset.carZ,role:box('.role-strip'),action:box('.action-console'),workflow:box('.mini-chain'),orientation:document.querySelector('.mini-chain').dataset.orientation,log:box('.desktop-live-log'),badge:box('#final-hosting-badge'),marker:box('.you-marker'),pageHeight:document.documentElement.scrollHeight};}''')
            assert row['sceneModel']=='full-pit-lane-v11',row
            assert row['carViewport']['visible'] and row['carX']=='0.000' and row['carZ']=='0.000',row
            assert row['pageHeight']<=height+1,row
            assert row['marker']['width']>0,row
            if width<=600:
                assert row['orientation']=='horizontal',row
                assert abs(row['badge']['top']-row['action']['bottom']-10)<1,row
            else:
                assert row['orientation']=='vertical',row
                assert row['workflow']['right']<width*.28,row
                assert row['log']['top']>row['workflow']['bottom'],row
                assert row['carBounds']['left']>row['workflow']['right'],row
                assert row['carBounds']['right']<row['action']['left'],row
            page.screenshot(path=str(OUT/f'final-scene-layout-{width}.png'))
            rows.append(row)
            print('PASS actual WebGL composition',width,height,flush=True)
        yaw=page.locator('.pit-scene').get_attribute('data-camera-yaw')
        page.mouse.move(960,450);page.mouse.down();page.mouse.move(1110,470,steps=8);page.mouse.up()
        page.wait_for_function('(yaw)=>document.querySelector(".pit-scene").dataset.cameraYaw!==yaw',arg=yaw)
        orbit={'beforeYaw':yaw,'afterYaw':page.locator('.pit-scene').get_attribute('data-camera-yaw')}
        assert not errors,errors
        (OUT/'final-scene-layout-report.json').write_text(json.dumps({'measurements':rows,'manualOrbit':orbit,'javascriptErrors':errors,'scope':'Actual App and shared full WebGL factory using controlled authoritative-shaped room data, ECO software Chromium. Mobile200×48pillbottom28represents external hosting badge only; physicalSafari and hardwareperformance not tested.'},indent=2)+'\n')
    finally:
        browser.close()
