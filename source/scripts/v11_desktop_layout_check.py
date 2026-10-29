"""Actual App desktop rail/log and unchanged mobile rail; no WebGL required."""
import json, os
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/v11-evidence'
OUT.mkdir(exist_ok=True)
BASE = os.environ.get('PIT_PREVIEW_URL', 'http://127.0.0.1:4190')
rows, errors = [], []
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True,
                                args=['--no-sandbox', '--disable-dev-shm-usage', '--disable-webgl'])
    page = browser.new_page(viewport={'width': 390, 'height': 844})
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(BASE)
    page.wait_for_selector('.main-menu')
    page.evaluate('''async()=>{
      const {ROLES}=await import('/src/types.ts'), {createRound}=await import('/src/engine.ts');
      const go=Date.now()-10000;
      const players=ROLES.map((role,i)=>({id:'desktop-'+i,role,nickname:i===0?'Recorded human':'Crew '+i,ready:true,joinedAt:go+i,connected:true}));
      const round=createRound(players,go,'desktop-round'); round.status='RUNNING'; round.players=structuredClone(players);
      window.__desktopRoom={id:'desktop',teamId:'desktop',name:'APEX 07',code:'TEST',color:'#ed3342',hostId:players[0].id,players,round,status:'RUNNING',updatedAt:Date.now()};
      window.__desktopComplete=(id,elapsed,step=400)=>{
        const r=window.__desktopRoom.round, task=r.tasks.find(t=>t.id===id), at=r.goAt+elapsed;
        Object.assign(task,{status:'DONE',completedAt:at,enabledAt:at-step});
        const owner=r.players.find(p=>p.id===task.ownerId);
        r.events.push({taskId:id,at,reason:'HUMAN',ownerId:task.ownerId,nickname:owner?.nickname,role:task.role,enabledAt:task.enabledAt});
        r.tasks.filter(t=>t.status==='LOCKED'&&t.dependencies.every(id=>r.tasks.find(p=>p.id===id).status==='DONE')).forEach(t=>{t.status='AVAILABLE';t.enabledAt=at});
      };
      window.__desktopComplete('FRONT_LIFT',400);window.__desktopComplete('REAR_LIFT',500);
      const url=[...performance.getEntriesByType('resource')].reverse().find(e=>new URL(e.name).pathname==='/src/api.ts').name;
      const {api}=await import(url);
      api.getState=async()=>({rooms:[structuredClone(window.__desktopRoom)],leaderboard:[],replays:[],serverNow:Date.now(),identity:{playerId:'desktop-0',isAdmin:false}});
      api.call=async()=>api.getState();window.dispatchEvent(new Event('online'));location.hash='crew';
    }''')
    page.wait_for_selector('.hud-dock')
    page.wait_for_function("document.querySelector('.mini-chain')?.dataset.progress==='2'")
    for width, height in [(390, 844), (430, 932), (1366, 768), (1920, 1080), (1280, 720), (1440, 900), (2560, 1440)]:
        page.set_viewport_size({'width': width, 'height': height})
        page.wait_for_timeout(400)
        row = page.evaluate('''()=>{
          const box=s=>document.querySelector(s)?.getBoundingClientRect().toJSON();
          const rail=document.querySelector('.mini-chain');return {viewport:[innerWidth,innerHeight],workflow:box('.mini-chain'),log:box('.desktop-live-log'),dock:box('.hud-dock'),heading:box('.room-heading'),orientation:rail.dataset.orientation,count:+rail.dataset.visibleCount,
          logVisible:getComputedStyle(document.querySelector('.desktop-live-log')).display!=='none',eventCount:+document.querySelector('.desktop-live-log').dataset.eventCount,
          tasks:[...rail.querySelectorAll('.rail-milestone')].map(e=>({id:e.dataset.taskIds,box:e.getBoundingClientRect().toJSON(),owned:e.dataset.owned,labels:[...e.querySelectorAll('.rail-context,.rail-action')].map(n=>({text:n.textContent,clipped:n.scrollWidth>n.clientWidth+1,font:getComputedStyle(n).fontSize}))})),pageHeight:document.documentElement.scrollHeight};
        }''')
        assert row['pageHeight'] <= height + 1, row
        assert not any(label['clipped'] for task in row['tasks'] for label in task['labels']), row
        if width >= 1100:
            assert row['orientation'] == 'vertical' and row['logVisible'], row
            assert 250 <= row['workflow']['width'] <= 305, row
            assert row['workflow']['right'] < width * .27, row
            assert row['log']['top'] >= row['workflow']['bottom'] + 9, row
            assert row['log']['bottom'] <= height - 7, row
            assert row['dock']['left'] >= width * .70, row
            assert all(a['box']['bottom'] <= b['box']['top'] + 1 for a, b in zip(row['tasks'], row['tasks'][1:])), row
            assert row['workflow']['top'] > row['heading']['bottom'] + 8, row
        else:
            assert row['orientation'] == 'horizontal' and not row['logVisible'], row
            assert row['workflow']['height'] <= 62, row
            assert all(a['box']['left'] < b['box']['left'] for a, b in zip(row['tasks'], row['tasks'][1:])), row
        rows.append(row)
        print(f'layout {width}x{height}: {row["orientation"]}, {row["count"]} jobs', flush=True)
        if width in [390, 430, 1366, 1920]:
            page.screenshot(path=str(OUT / f'layout-vertical-workflow-log-{width}.png'))
    desktop = [row for row in rows if row['viewport'][0] in [1366, 1920]]
    assert desktop[1]['count'] > desktop[0]['count'], desktop
    page.set_viewport_size({'width': 1366, 'height': 768})
    before = page.locator('.desktop-event-scroll li').count()
    page.evaluate("window.__desktopComplete('FL_GUN_LOOSEN',1800,1300);window.dispatchEvent(new Event('online'))")
    page.wait_for_function("document.querySelector('.desktop-live-log').dataset.eventCount==='3'")
    page.wait_for_function("document.querySelector('.mini-chain').dataset.progress==='3'")
    assert page.locator('.desktop-event-scroll li').count() == before + 1
    first = page.locator('.desktop-event-scroll li').first
    assert first.get_attribute('data-task-id') == 'FL_GUN_LOOSEN'
    assert '1.300s' in first.inner_text() and '1.800s' in first.inner_text()
    # A later mutable lobby nickname must not rewrite a recorded event identity.
    page.evaluate("window.__desktopRoom.players[0].nickname='Changed lobby name';window.dispatchEvent(new Event('online'))")
    page.wait_for_timeout(600)
    assert 'Recorded human' in page.locator('.desktop-live-log').inner_text()
    assert 'Changed lobby name' not in page.locator('.desktop-live-log').inner_text()
    page.screenshot(path=str(OUT / 'desktop-event-log-live-update.png'))
    # All real tasks stay available in the log; only the compact list scrolls.
    page.evaluate("window.__desktopRoom.round.tasks.filter(t=>t.status!=='DONE').forEach((t,i)=>window.__desktopComplete(t.id,2200+i*300));window.dispatchEvent(new Event('online'))")
    page.wait_for_function("document.querySelector('.desktop-live-log').dataset.eventCount==='21'")
    log = page.locator('.desktop-event-scroll').evaluate('(e)=>({height:e.clientHeight,scroll:e.scrollHeight,overflow:getComputedStyle(e).overflowY})')
    assert log['scroll'] > log['height'] and log['overflow'] == 'auto', log
    assert page.locator('.desktop-event-scroll li').first.get_attribute('data-task-id') == 'GREEN_RELEASE'
    # Replay, menu and unfocused observer never retain a separate instrument overlay.
    page.get_by_role('button', name='Main Menu', exact=True).click()
    page.wait_for_selector('.main-menu')
    assert page.locator('.scene-instruments').count() == 0
    page.evaluate("location.hash='watch'")
    page.wait_for_selector('.observer-overview')
    assert page.locator('.scene-instruments').count() == 0
    page.evaluate("location.hash='watch/desktop'")
    page.wait_for_selector('.focused-room .scene-instruments')
    assert page.locator('.desktop-live-log').is_visible()
    assert not page.locator('.live-event-strip').is_visible()
    assert not errors, errors
    (OUT / 'desktop-layout-validation.json').write_text(json.dumps({'measurements': rows, 'liveLog': {'latestFirst': True, 'actualStepMs': 1300, 'actualTeamMs': 1800, 'immutableName': True, 'all21AccessibleWithInternalScrolling': log}, 'javascriptErrors': errors, 'scope': 'Actual App + MiniChain + DesktopLiveLog with deterministic multiplayer-shaped authoritative snapshots. Chromium WebGL disabled for geometry/data tests; physical Safari and hosted Supabase not claimed.'}, indent=2))
    browser.close()
print('PASS desktop vertical workflow + live authoritative Event Log; mobile compact horizontal retained; all target layouts')
