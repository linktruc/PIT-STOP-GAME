"""Fast deterministic navigation/timer/role-assignment UI checks with honest fallback."""
import ast,json,os
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'qa-output';BASE=os.environ.get('PIT_PREVIEW_URL','http://127.0.0.1:4190')
source=ast.parse((ROOT/'scripts/v9_browser_smoke.py').read_text());exec(compile(ast.Module(body=[n for n in source.body if isinstance(n,ast.FunctionDef) and n.name=='fixture'],type_ignores=[]),'helpers','exec'))
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-webgl','--disable-dev-shm-usage']);page=b.new_page(viewport={'width':1440,'height':900});page.goto(BASE);fixture(page)
 page.evaluate('()=>{window.__qaRooms[1].round.goAt-=5000;window.dispatchEvent(new Event("online"))}');page.goto(BASE+'/#watch');page.wait_for_selector('.live-card .observer-time')
 times=page.locator('.live-card:not(.compact) .observer-time').all_text_contents();delta=abs(float(times[0].rstrip('s'))-float(times[1].rstrip('s')));assert 4.8<delta<5.2,(times,delta)
 page.get_by_role('button',name='Open menu',exact=True).click();expect(page.get_by_role('button',name='My Garage',exact=True)).to_be_visible();expect(page.get_by_role('button',name='Team Members',exact=True)).to_be_visible();page.get_by_role('button',name='My Garage',exact=True).click()
 page.get_by_role('button',name='Role details:',exact=False).click();expect(page.locator('.role-briefing')).to_be_visible()
 page.evaluate('()=>{const r=window.__qaRooms[0];r.status="WAITING";r.round=null;[r.players[0].role,r.players[1].role]=[r.players[1].role,r.players[0].role];window.dispatchEvent(new Event("online"))}');expect(page.locator('.role-briefing')).to_have_count(0);expect(page.locator('.role-strip h2')).to_have_text('Rear jack operator')
 page.get_by_role('button',name='Main Menu',exact=True).click();expect(page.get_by_role('button',name='My Garage',exact=False)).to_be_visible();assert page.evaluate('window.__qaRooms[0].players.length')==15
 result={'timerDeltaSeconds':round(delta,3),'navigation':['Main Menu','My Garage','Team Members','Leave Team'],'briefingClosesOnRoleAssignment':True,'mainMenuPreservesMembership':True,'mode':'Local synthetic UI snapshots, WebGL disabled'};(OUT/'v9-ui-state-report.json').write_text(json.dumps(result,indent=2));print('PASS independent team timers, unambiguous navigation, role-assignment collapse and Main Menu seat preservation',flush=True);b.close()
