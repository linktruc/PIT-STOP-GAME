"""Exercise the built app via real UI controls, without source-module fixtures.

The production build runs a local Solo round. This does not claim hosted
multiplayer/Supabase validation or physical device audio output.
"""
import json
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / os.environ.get('PIT_EVIDENCE_DIR','docs/v11-evidence')
BASE = os.environ.get('PIT_PREVIEW_URL', 'http://127.0.0.1:4191')
expect.set_options(timeout=20000)
checks = []
errors = []

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True,
        args=['--no-sandbox', '--disable-dev-shm-usage', '--disable-webgl'])
    try:
        page = browser.new_page(viewport={'width':1366, 'height':768})
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(BASE)
        expect(page.locator('.main-menu')).to_be_visible()
        page.get_by_role('button', name='Solo Test', exact=False).click()
        expect(page.get_by_label('Choose role')).to_be_visible()
        page.get_by_role('button', name='Mark ready', exact=True).click()
        page.get_by_role('button', name='Start round', exact=True).click()
        action = page.locator('.action-button')
        expect(action).to_have_attribute('data-ready', 'false')
        # Countdown presses intentionally remain actionable and invoke the
        # existing server/engine penalty instead of silently doing nothing.
        action.click(force=True)
        expect(action).to_have_class(__import__('re').compile(r'.*penalized.*'))
        expect(action).to_be_disabled()
        expect(page.locator('.action-hint')).to_contain_text('2.0s lockout')
        page.screenshot(path=str(OUT / 'built-solo-countdown-penalty.png'))
        checks.append('Built UI countdown early press invokes a personal 2s lockout, disables action, and recovers at GO + 2s')
        print('PASS countdown penalty', flush=True)
        expect(action).to_have_attribute('data-ready', 'true', timeout=15000)
        expect(page.locator('.mini-chain')).to_have_attribute('data-orientation', 'vertical')
        action.click()
        expect(page.locator('.desktop-live-log')).to_have_attribute('data-event-count', '2')
        expect(action).to_contain_text('LOWER FRONT')
        expect(action).to_have_attribute('data-ready', 'true', timeout=60000)
        action.click()
        expect(page.locator('.result-overlay')).to_be_visible(timeout=30000)
        expect(page.locator('.desktop-live-log')).to_have_attribute('data-event-count', '21')
        score = page.locator('.result-time strong').inner_text()
        expect(page.locator('.mini-chain')).to_have_attribute('data-progress', '21')
        checks.append('Actual local Solo engine completes 21 tasks through built UI, updating vertical workflow and latest-first live Event Log')
        page.get_by_role('button', name='Watch replay', exact=True).click()
        expect(page.locator('.replay-view')).to_be_visible()
        page.get_by_role('button', name='Event Log', exact=True).click()
        expect(page.locator('.replay-event-table tbody tr')).to_have_count(21)
        expect(page.get_by_role('columnheader')).to_have_text(['Task','By','Step Time','Team Time'])
        page.get_by_role('button', name='Close Event Log', exact=True).click()
        page.get_by_role('button', name='Close replay', exact=True).click()
        checks.append('Saved Solo replay opens independently with all 21 authoritative task/owner/step/team event rows')
        page.get_by_role('button', name='Play again', exact=True).click()
        expect(page.get_by_label('Choose role')).to_be_visible()
        expect(page.locator('.desktop-live-log')).to_have_attribute('data-event-count', '0')
        page.get_by_label('Choose role').select_option('FL_WHEEL_ON')
        expect(page.locator('.role-identity')).to_contain_text('Front left new-wheel fitter')
        expect(page.get_by_role('button', name='Mark ready', exact=True)).to_be_visible()
        checks.append('Play again clears old workflow/log, role picker changes the actual assigned role and resets Ready')
        page.get_by_role('button', name='Main Menu', exact=True).click()
        expect(page.get_by_role('button', name='Resume Team', exact=False)).to_be_visible()
        page.get_by_role('button', name='Leaderboard', exact=True).click()
        expect(page.locator('.standings-team')).to_have_count(0)
        checks.append('Solo stays unranked, and returning to menu preserves Resume Team')
        assert not errors, errors
        (OUT / 'built-release-smoke.json').write_text(json.dumps({
            'checks':checks, 'completedScoreText':score, 'javascriptErrors':errors,
            'scope':'Vite production preview of final dist, actual native UI and local Solo engine/storage. WebGL disabled for fast behavior checks. Hosted Supabase and physical Safari not exercised.'
        }, indent=2) + '\n')
        print('PASS built release smoke', flush=True)
    finally:
        browser.close()
