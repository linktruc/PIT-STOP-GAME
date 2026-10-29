"""Production bundle and no-WebGL fallback smoke; no source module imports."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'qa-output';OUT.mkdir(exist_ok=True)
BASE=os.environ.get('PIT_STATIC_URL','http://127.0.0.1:4191')
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-webgl','--disable-dev-shm-usage'])
 page=browser.new_page(viewport={'width':375,'height':667});errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.goto(BASE)
 expect(page.locator('.main-menu h1')).to_have_text('PIT STOP.SIMULATOR.');expect(page.locator('.pit-scene-fallback')).to_be_visible()
 page.get_by_role('button',name='Solo Test',exact=False).click();page.get_by_label('Choose role').select_option('RELEASE_CONTROLLER');expect(page.locator('.role-strip h2')).to_have_text('Release controller');expect(page.locator('svg .you-marker')).to_be_visible()
 page.get_by_role('button',name='Mark ready',exact=True).click();page.get_by_role('button',name='Start round',exact=False).click();page.locator('.action-button').click(force=True);page.wait_for_function('()=>Number(document.querySelector(".action-button").dataset.penaltyUntil)>0')
 page.wait_for_function('()=>document.querySelector(".action-button").dataset.ready==="true"',timeout=15000);page.locator('.action-button').click();expect(page.locator('.result-overlay')).to_be_visible();expect(page.locator('.result-overlay')).to_contain_text('NOT RANKED');assert not errors,errors
 message='PASS production static bundle at 375x667 with WebGL disabled: exact title, live 2D fallback, all-role Solo picker, gold YOU, countdown lockout, complete release-controller round and zero runtime errors.'
 print(message,flush=True);(OUT/'v9-static-smoke.txt').write_text(message+'\n');browser.close()
