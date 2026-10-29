"""Actual V11 mobile HUD with floating Netlify pill, including an unreadable closed root.

Synthetic authoritative-shaped room data drives the real app. Browser chrome is
represented through different visible viewport heights; this is not physical iOS.
"""
import json, os
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/v11-evidence'
OUT.mkdir(exist_ok=True)
BASE = os.environ.get('PIT_PREVIEW_URL', 'http://127.0.0.1:4190')
rows, errors = [], []
WEBGL = os.environ.get('PIT_QA_WEBGL') == '1'
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox', '--disable-dev-shm-usage']+(['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] if WEBGL else ['--disable-webgl','--disable-gpu']))
    context = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, device_scale_factor=1)
    context.add_init_script("localStorage.setItem('pit-v7-quality','low')")
    page = context.new_page()
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(BASE)
    page.wait_for_selector('.main-menu')
    page.evaluate('''async()=>{
      const {ROLES}=await import('/src/types.ts');
      const {createRound,reconcile,submitAction}=await import('/src/engine.ts');
      const now=Date.now();
      const players=ROLES.map((role,i)=>({id:'mobile-'+i,role,nickname:'Alex '+i,ready:true,joinedAt:now+i,connected:true}));
      window.__mobileRoom={id:'mobile-hud',teamId:'mobile-hud',name:'APEX 07',color:'#ec3340',code:'MOBILE',hostId:players[0].id,status:'WAITING',players,round:null,updatedAt:now};
      window.__mobilePhase=phase=>{
        const room=window.__mobileRoom;room.round=null;room.status='WAITING';
        if(phase!=='waiting'){
          const t=Date.now();room.round=createRound(room.players,t-10000,'mobile-'+phase+'-'+t);reconcile(room.round,t);room.status='RUNNING';
          if(phase==='penalty')room.round.penalties={'mobile-0':{at:t,until:t+600000}};
          if(phase==='completed'){
            let at=room.round.goAt;
            for(let n=0;n<21;n++){
              const task=room.round.tasks.find(task=>task.status==='AVAILABLE');
              if(!task)throw new Error('fixture missing available task');
              at=Math.max(at,task.enabledAt??at)+200;
              submitAction(room.round,task.ownerId,task.id,at,'mobile-'+n);
            }
            room.status='COMPLETED';
          }
        }
        window.dispatchEvent(new Event('online'));
      };
      const url=[...performance.getEntriesByType('resource')].reverse().find(e=>new URL(e.name).pathname==='/src/api.ts').name;
      const {api}=await import(url);
      api.getState=async()=>({rooms:[structuredClone(window.__mobileRoom)],leaderboard:[],replays:[],serverNow:Date.now(),identity:{playerId:'mobile-0',isAdmin:false}});
      api.call=async()=>api.getState();window.dispatchEvent(new Event('online'));
    }''')
    page.goto(BASE + '/#crew')
    page.wait_for_selector('.hud-dock')
    for phase in ['waiting', 'running', 'penalty', 'completed']:
        print('Checking mobile phase',phase,flush=True)
        page.evaluate('phase=>window.__mobilePhase(phase)', phase)
        page.wait_for_selector('.result-overlay' if phase == 'completed' else '.hud-dock')
        if phase == 'running': page.wait_for_selector('.action-button:not(.penalized)')
        if phase == 'penalty': page.wait_for_selector('.action-button.penalized')
        for width, height in [(390,844),(430,932),(390,700),(430,780),(844,390)]:
            page.set_viewport_size({'width':width,'height':height})
            for case in [
                {'kind':'measured','pillHeight':38,'bottom':16,'safe':0},
                {'kind':'measured','pillHeight':48,'bottom':28,'safe':0},
                {'kind':'measured','pillHeight':38,'bottom':34,'safe':34},
                {'kind':'external','pillHeight':48,'bottom':28,'safe':0},
                {'kind':'external','pillHeight':48,'bottom':34,'safe':34},
            ]:
                page.evaluate('''cfg=>{
                  document.querySelector('#qa-host-badge')?.remove();
                  document.documentElement.style.setProperty('--pit-safe-area-bottom',cfg.safe+'px');
                  const host=document.createElement('aside');host.id='qa-host-badge';
                  host.style=`position:fixed;bottom:${cfg.bottom}px;right:16px;width:200px;height:${cfg.pillHeight}px;z-index:99999;`;
                  if(cfg.kind==='measured')host.setAttribute('data-netlify-badge','');
                  const target=cfg.kind==='external'?host.attachShadow({mode:'closed'}):host;
                  const pill=document.createElement('div');pill.textContent='✦  Powered by Netlify';
                  pill.style='box-sizing:border-box;display:grid;place-items:center;width:200px;height:100%;border-radius:999px;border:1px solid #5c808655;background:#102932f5;color:#c6d9df;font:13px Arial;';
                  target.append(pill);document.body.append(host);
                }''',case)
                expected = case['pillHeight'] + case['bottom'] if case['kind']=='measured' else 48+max(28,case['safe'])
                page.wait_for_function('n=>Math.abs(parseFloat(getComputedStyle(document.querySelector(".game-shell")).getPropertyValue("--pit-overlay-bottom"))-n)<=1',arg=expected)
                page.wait_for_timeout(130)
                row=page.evaluate('''()=>{const box=s=>document.querySelector(s)?.getBoundingClientRect().toJSON();return{width:innerWidth,height:innerHeight,visualHeight:visualViewport.height,role:box('.role-strip'),action:box('.action-console'),result:box('.result-overlay'),mini:box('.mini-chain'),badge:box('#qa-host-badge'),pageHeight:document.documentElement.scrollHeight,reservation:parseFloat(getComputedStyle(document.querySelector('.game-shell')).getPropertyValue('--pit-overlay-bottom'))};}''')
                control=row['result'] if phase=='completed' else row['action']
                gap=row['badge']['top']-control['bottom']
                assert gap>=9,dict(phase=phase,case=case,gap=gap,**row)
                # Actual measured pill gets a 10px gap; an unreadable 48px pill has
                # the same conservative footprint, including its safe home area.
                assert gap<=11,dict(phase=phase,case=case,gap=gap,**row)
                assert control['top']>=55,dict(phase=phase,case=case,**row)
                assert row['pageHeight']<=height+1,row
                if phase!='completed':
                    assert row['role']['height']==54,row
                    assert abs(row['action']['top']-row['role']['bottom']-6)<1,row
                rows.append(dict(phase=phase,case=case,clearance=gap,**row))
                if width in (390,430) and height in (844,932) and case['kind']=='external' and case['safe']==0:
                    page.screenshot(path=str(OUT/f'final-mobile-{phase}-{width}x{height}-external-badge{'-webgl' if WEBGL else '-geometry'}.png'))
    assert not errors,errors
    (OUT/'mobile-clearance-report.json').write_text(json.dumps({'measurements':rows,'javascriptErrors':errors,'scope':('Real app UI with '+('software WebGL' if WEBGL else 'WebGL unavailable fallback')+' and synthetic multiplayer-shaped snapshots. Netlify pill200x38/48 at bottom16/28/34; closed-shadow-root case proves fallback when badge cannot be queried. Safe area34px is a CSS fixture. Multiple visible viewport heights model Safari toolbar expansion; physical Safari not tested.')},indent=2))
    browser.close()
print(f'PASS {len(rows)} mobile measurements: waiting/running/penalty/completed, measured and inaccessible floating pills, safearea34, short/tall/landscape viewports, no overlaps or page scrolling.',flush=True)
