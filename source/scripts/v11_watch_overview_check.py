"""Independent overview Event Log / Replay actions and card clipping regressions."""
import json,os
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'docs/v11-evidence';BASE=os.environ.get('PIT_PREVIEW_URL','http://127.0.0.1:4190');rows=[];errors=[]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-webgl'])
 page=b.new_page(viewport={'width':1440,'height':900});page.on('pageerror',lambda e:errors.append(str(e)));page.goto(BASE);page.wait_for_selector('.main-menu')
 page.evaluate('''async()=>{const {ROLES}=await import('/src/types.ts'),{createRound}=await import('/src/engine.ts');const now=Date.now();
 window.__watchRooms=['A','B','C','D','Finished'].map((id,n)=>{const players=ROLES.map((role,i)=>({id:id+'-'+i,nickname:i?'Alex '+i:'Long nickname with recognizable identity',role,ready:true,joinedAt:now+i,connected:true}));const round=createRound(players,now-10000,id+'-round');round.status=n===4?'COMPLETED':'RUNNING';for(let i=0;i<(n===4?21:2);i++){const t=round.tasks[i];t.status='DONE';t.enabledAt=round.goAt;t.completedAt=round.goAt+500+i*100;round.events.push({taskId:t.id,at:t.completedAt,enabledAt:t.enabledAt,ownerId:t.ownerId,role:t.role,nickname:players.find(p=>p.id===t.ownerId)?.nickname,reason:'QA_FIXTURE'});}if(n===4){round.finishedAt=round.tasks[20].completedAt;round.elapsedMs=round.finishedAt-round.goAt;}return {id,teamId:id,name:'Garage '+id,color:n%2?'#56b9bf':'#e54035',code:id,hostId:players[0].id,players,status:n===4?'COMPLETED':'RUNNING',round,updatedAt:now};});
 const r=window.__watchRooms[4];window.__watchRecord={roundId:r.round.id,teamId:r.teamId,teamName:r.name,color:r.color,players:r.players,round:r.round};window.__watchReplays=[{roundId:r.round.id,teamId:r.teamId,teamName:r.name,color:r.color,finishedAt:r.round.finishedAt,elapsedMs:r.round.elapsedMs}];window.__replayCalls=0;
 const url=[...performance.getEntriesByType('resource')].reverse().find(e=>new URL(e.name).pathname==='/src/api.ts').name;const {api}=await import(url);api.getState=async()=>({rooms:structuredClone(window.__watchRooms),leaderboard:[],replays:structuredClone(window.__watchReplays),serverNow:Date.now(),identity:{playerId:null,isAdmin:false}});api.call=async()=>api.getState();api.getReplay=async()=>{window.__replayCalls++;return structuredClone(window.__watchRecord)};window.dispatchEvent(new Event('online'));}''')
 page.goto(BASE+'/#watch');page.wait_for_selector('.active-teams-grid .live-card')
 for w,h in [(1280,720),(1366,768),(1440,900),(1920,1080),(2560,1440),(390,844),(430,932)]:
  print('CHECK',w,h,flush=True);page.set_viewport_size({'width':w,'height':h});page.wait_for_timeout(250)
  for card in page.locator('.active-teams-grid .live-card').all():
   bounds=card.bounding_box()
   for button in card.get_by_role('button').all():
    box=button.bounding_box();assert box['height']>=44 and box['y']+box['height']<=bounds['y']+bounds['height']+1,(w,box,bounds)
  row=page.locator('.finished-team .card-action-row');buttons=row.get_by_role('button');expect(buttons).to_have_count(2);a=buttons.nth(0).bounding_box();z=buttons.nth(1).bounding_box();assert abs(a['y']-z['y'])<1
  rows.append({'width':w,'height':h,'activeCards':page.locator('.live-card').count(),'actionHeight':a['height'],'finishedActionsSameRow':True,'pageScroll':page.evaluate('document.documentElement.scrollHeight>innerHeight')});assert not rows[-1]['pageScroll']
  page.screenshot(path=str(OUT/f'watch-overview-{w}.png'))
  if w in [390,1440]:
   initial=page.evaluate('window.__watchRooms[0].round.tasks.filter(t=>t.status==="DONE").length');page.locator('.active-teams-grid .live-card').first.get_by_role('button',name='Event Log',exact=True).click();expect(page.locator('.replay-log-drawer')).to_be_visible();assert page.url.endswith('#watch');assert page.evaluate('window.__replayCalls')==0;expect(page.locator('.replay-event-table tbody tr')).to_have_count(initial)
   page.evaluate('''()=>{const r=window.__watchRooms[0],t=r.round.tasks.find(t=>t.status!=='DONE');t.status='DONE';t.enabledAt=r.round.goAt+1000;t.completedAt=r.round.goAt+2000;r.round.events.push({taskId:t.id,at:t.completedAt,reason:'QA_FIXTURE'});window.dispatchEvent(new Event('online'));}''');expect(page.locator('.replay-event-table tbody tr')).to_have_count(initial+1)
   page.get_by_role('button',name='Close Event Log').click();page.locator('.finished-team').get_by_role('button',name='Event Log',exact=True).click();expect(page.locator('.replay-event-table tbody tr')).to_have_count(21);assert page.locator('.replay-view').count()==0;page.screenshot(path=str(OUT/f'watch-outside-event-log-{w}.png'));page.get_by_role('button',name='Close Event Log').click()
   page.locator('.finished-team').get_by_role('button',name='Replay',exact=True).click();expect(page.locator('.replay-view')).to_be_visible();page.get_by_role('button',name='Close replay',exact=True).click()
   page.evaluate('window.__replayCalls=0')
 assert not errors,errors
 (OUT/'watch-overview-report.json').write_text(json.dumps({'viewports':rows,'javascriptErrors':errors,'scope':'Actual overview Event Log, live updates and independent Replay; synthetic authoritative-shaped records. WebGL disabled to isolate card/action geometry. Root visual QA covers scene fidelity.'},indent=2));b.close()
print('PASS overview independent live Event Log and recorded Replay,side-by-side finished actions,44px unclipped actionsat1280–2560/390/430',flush=True)
