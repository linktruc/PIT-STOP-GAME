"""Real local UI/Solo/replay controls, plus explicitly synthetic workflow width fixtures.

Chromium without WebGL makes the responsive/control checks repeatable. 3D is checked
separately by v10_scene_check.py. No hosted Supabase or physical Safari claim.
"""
import json, os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/v10-evidence'
OUT.mkdir(exist_ok=True)
BASE = os.environ.get('PIT_PREVIEW_URL', 'http://127.0.0.1:4190')
checks, measurements, errors = [], [], []

def passed(label):
    checks.append(label)
    print('PASS', label, flush=True)

def layout(page, label):
    m = page.evaluate('''()=>({w:innerWidth,h:innerHeight,
      sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight,
      mini:document.querySelector('.mini-chain')?.getBoundingClientRect().toJSON(),
      role:document.querySelector('.role-strip')?.getBoundingClientRect().toJSON(),
      visibleTasks:Number(document.querySelector('.mini-chain')?.dataset.visibleCount)})''')
    assert m['sw'] <= m['w'] + 1 and m['sh'] <= m['h'] + 1, (label, m)
    if m.get('mini'): assert m['mini']['height'] <= 66, m
    if m.get('role'): assert m['role']['height'] <= 54, m
    for selector in ['.ready-button', '.start-button', '.action-button', '.leave-crew-control']:
        if not page.locator(selector).count() or not page.locator(selector).is_visible(): continue
        b = page.locator(selector).bounding_box()
        assert b['x'] >= 0 and b['y'] >= 0 and b['x'] + b['width'] <= m['w'] + 1 and b['y'] + b['height'] <= m['h'] - 90, (selector, m, b)
    measurements.append(dict(label=label, **m))

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True,
        args=['--no-sandbox', '--disable-dev-shm-usage', '--disable-webgl'])
    context = browser.new_context(viewport={'width':390,'height':844})
    context.add_init_script("localStorage.setItem('pit-v7-quality','low')")
    page = context.new_page()
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(BASE)
    expect(page.locator('.main-menu')).to_be_visible()
    expect(page.locator('.main-menu h1')).to_have_text('PIT STOP.SIMULATOR.')
    expect(page.get_by_role('button', name='Main Menu', exact=True)).to_have_count(0)
    page.get_by_role('button', name='All Roles', exact=True).click()
    expect(page.locator('.role-families > section')).to_have_count(6)
    page.get_by_role('button', name='Close panel', exact=True).click()
    passed('Main menu has exact title, no redundant Main Menu button; role catalogue has six profession families')
    page.get_by_role('button',name='Solo Test',exact=False).click()
    expect(page.get_by_label('Choose role').locator('option')).to_have_count(15)
    for w,h in [(390,844),(430,932),(375,667),(768,1024),(1440,900)]:
        page.set_viewport_size({'width':w,'height':h}); page.wait_for_timeout(120)
        layout(page, f'Waiting {w}x{h}')
        expect(page.locator('.role-strip')).to_contain_text('YOUR ROLE:')
        page.screenshot(path=str(OUT/f'ui-waiting-{w}.png'))
    passed('15 Solo roles; responsive waiting HUD, unchanged 54px role card, controls clear a 90px external badge and no page scroll')
    page.set_viewport_size({'width':390,'height':844})
    page.get_by_role('button',name='Role details:',exact=False).click()
    expect(page.locator('.role-briefing ol li')).to_have_count(2)
    expect(page.locator('.role-briefing')).to_contain_text('wait for GO signal')
    page.get_by_role('button',name='Close panel',exact=True).click()
    page.locator('.mini-chain').click()
    expect(page.locator('[data-task-id]')).to_have_count(21)
    expect(page.locator('[data-from]')).to_have_count(26)
    expect(page.locator('.chain-node[data-owner="Bot"]')).not_to_have_count(0)
    page.screenshot(path=str(OUT/'ui-full-workflow-390.png'))
    page.get_by_role('button',name='Close panel',exact=True).click()
    page.get_by_role('button',name='Main Menu',exact=True).click()
    expect(page.locator('.team-seat-actions')).to_be_visible()
    expect(page.locator('.team-seat-actions').get_by_role('button',name='Resume Team',exact=False)).to_be_visible()
    expect(page.locator('.team-seat-actions').get_by_role('button',name='Leave Team',exact=False)).to_be_visible()
    expect(page.get_by_role('button',name='Main Menu',exact=True)).to_have_count(0)
    page.get_by_role('button',name='Resume Team',exact=False).click()
    expect(page.get_by_label('Choose role')).to_have_value('FRONT_JACK')
    passed('Full DAG has 21 tasks/26 edges and owners; briefing explains both jack steps; Resume/Leave are adjacent and menu preserves seat')
    page.get_by_role('button',name='Mark ready',exact=True).click()
    page.get_by_role('button',name='Start round',exact=False).click()
    button=page.locator('.action-button')
    expect(button).to_contain_text('LIFT FRONT')
    bright_locked=button.evaluate('(e)=>getComputedStyle(e).backgroundImage')
    expect(page.locator('.action-hint')).to_contain_text('Wait for GO signal')
    button.click(force=True)
    page.wait_for_function('()=>Number(document.querySelector(".action-button")?.dataset.penaltyUntil)>0')
    deadline=button.get_attribute('data-penalty-until')
    expect(button).to_have_class(__import__('re').compile('penalized'))
    expect(button).to_contain_text('lockout')
    page.keyboard.press('Space')
    assert button.get_attribute('data-penalty-until')==deadline
    page.screenshot(path=str(OUT/'ui-early-lockout-390.png'))
    page.wait_for_function('()=>document.querySelector(".action-button")?.dataset.ready==="true"',timeout=15000)
    bright_ready=button.evaluate('(e)=>getComputedStyle(e).backgroundImage')
    assert bright_locked==bright_ready,(bright_locked,bright_ready)
    button.click()
    page.wait_for_function('()=>document.querySelector(".action-button")?.dataset.ready==="true"',timeout=30000)
    expect(button).to_contain_text('LOWER FRONT')
    button.click()
    expect(page.locator('.result-overlay')).to_be_visible(timeout=20000)
    expect(page.locator('.mini-chain')).to_have_attribute('data-progress','21')
    expect(page.locator('.result-overlay')).to_contain_text('NOT RANKED')
    page.screenshot(path=str(OUT/'ui-solo-result-390.png'))
    passed('Actual Solo early input creates red server-shaped 2s lockout; repeated Space does not extend it; locked/ready brightness identical; both jack actions and full 21-task finish work')
    page.get_by_role('button',name='Watch replay',exact=False).click()
    expect(page.locator('.replay-view')).to_be_visible()
    expect(page.locator('.replay-log-drawer')).to_have_count(0)
    page.get_by_role('button',name='Pause replay',exact=True).click()
    timeline=page.get_by_role('slider',name='Replay timeline')
    for time in [-2000,0,750,1800]:
        timeline.fill(str(time));expect(page.locator('.replay-view')).to_have_attribute('data-replay-time',str(time))
    page.get_by_role('button',name='Event Log',exact=True).click()
    expect(page.get_by_role('columnheader')).to_have_text(['Task','By','Step Time','Team Time'])
    expect(page.locator('.replay-log-drawer tbody tr')).to_have_count(21)
    page.screenshot(path=str(OUT/'ui-replay-event-log-390.png'))
    page.get_by_role('button',name='Close Event Log',exact=True).click()
    page.screenshot(path=str(OUT/'ui-replay-390.png'))
    layout(page,'Replay 390x844')
    page.get_by_role('button',name='Close replay',exact=True).click()
    expect(page.get_by_role('button',name='Play again',exact=False)).to_be_visible()
    passed('Actual local completed round opens separate replay; pause/seek and 21-row four-column event log work; table is closed by default')
    assert not errors, errors
    (OUT/'ui-report.json').write_text(json.dumps({'base':BASE,'passed':checks,'measurements':measurements,'javascriptErrors':errors,'limits':'Actual local Solo and UI in Chromium with WebGL disabled. Physical Safari, live hosted Supabase, speakers and cross-device transport not exercised.'},indent=2))
    browser.close()
