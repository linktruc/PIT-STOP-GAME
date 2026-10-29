"""Actual browser + Supabase JS Auth, using an explicitly controlled HTTP fixture.

This is not authentication against a production Supabase project. PostgreSQL
authorization/deletion is covered separately by the actual SQL RPC tests.
"""
import base64,json,os,time
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
expect.set_options(timeout=20000)
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'docs/v11-evidence';OUT.mkdir(exist_ok=True)
BASE=os.environ.get('PIT_PREVIEW_URL','http://127.0.0.1:4190')
UID='00000000-0000-4000-8000-000000000001'
def jwt(uid):
 enc=lambda o:base64.urlsafe_b64encode(json.dumps(o).encode()).decode().rstrip('=')
 return enc({'alg':'HS256','typ':'JWT'})+'.'+enc({'sub':uid,'aud':'authenticated','role':'authenticated','exp':int(time.time())+3600,'iat':int(time.time()),'email':'fixture@example.invalid'})+'.fixture-signature'
TOKEN=jwt(UID);READER=jwt('00000000-0000-4000-8000-000000000002')
user={'id':UID,'aud':'authenticated','role':'authenticated','email':'fixture@example.invalid','email_confirmed_at':'2026-01-01T00:00:00Z','app_metadata':{'provider':'email'},'user_metadata':{},'identities':[],'created_at':'2026-01-01T00:00:00Z'}
checks=[];errors=[];requests=[];fixture={'rooms':[],'records':{},'replays':[],'leaderboard':[],'audit':[]}
def passed(label):checks.append(label);print('PASS',label,flush=True)
def snapshot(admin=False):return {'rooms':fixture['rooms'],'leaderboard':fixture['leaderboard'],'replays':fixture['replays'],'serverNow':time.time()*1000,'identity':{'playerId':None,'isAdmin':admin}}

with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-webgl'])
 # First exercise the shipped unconfigured product: no privileged offline path.
 offline=browser.new_context(viewport={'width':390,'height':844});page=offline.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.goto(BASE)
 page.get_by_role('button',name='Admin access',exact=True).click()
 expect(page.locator('.admin-backend-needed')).to_contain_text('Global administration requires a connection to Supabase')
 assert all(text.lower() not in page.locator('body').inner_text().lower() for text in ['Local test admin','Sign in locally','admin / 1234'])
 expect(page.locator('input[type=password]')).to_have_count(0)
 page.get_by_role('button',name='Close panel',exact=True).click();page.get_by_role('button',name='Solo Test',exact=False).click();page.get_by_role('button',name='Main Menu',exact=True).click();page.get_by_role('button',name='Admin access',exact=True).click();expect(page.locator('.admin-backend-needed')).to_be_visible()
 page.screenshot(path=str(OUT/'admin-unconfigured-no-local.png'));offline.close();passed('No-backend menu and Solo both show one backend-needed admin state, never a local/mock login')
 context=browser.new_context(viewport={'width':1440,'height':900})
 context.add_init_script("localStorage.setItem('pit-v7-quality','low')")
 context.route('**/config.js',lambda route:route.fulfill(status=200,content_type='application/javascript',body="window.PIT_CONFIG={supabaseUrl:'https://pit-qa.supabase.co',supabaseAnonKey:'fixture-public-anon',enableSoloTest:true};"))
 def serve(route):
  req=route.request;url=req.url;body=req.post_data_json if req.post_data else {};admin=req.headers.get('authorization')=='Bearer '+TOKEN
  if req.method=='OPTIONS':
   route.fulfill(status=204,headers={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'*','Access-Control-Allow-Methods':'GET,POST,DELETE,OPTIONS'},body='');return
  name=url.split('/rest/v1/rpc/')[-1] if '/rest/v1/rpc/' in url else url.split('/auth/v1/')[-1].split('?')[0]
  requests.append({'endpoint':name,'admin':admin,'passwordLength':len(body.get('password','')) if isinstance(body,dict) else None})
  (OUT/'admin-http-requests.json').write_text(json.dumps(requests,indent=2))
  status=200;result={}
  if name=='pit_state':result=snapshot(admin)
  elif name=='pit_admin_login_identity':result={'email':'fixture@example.invalid'} if body.get('p_username')=='admin' else None
  elif name=='token':
   token=TOKEN if body.get('password')=='valid7' else READER
   result={'access_token':token,'token_type':'bearer','expires_in':3600,'expires_at':int(time.time())+3600,'refresh_token':'fixture-refresh','user':dict(user,id=UID if token==TOKEN else '00000000-0000-4000-8000-000000000002')}
  elif name=='user':result=user
  elif name=='logout':route.fulfill(status=204,body='');return
  elif name=='pit_replay':
   result=fixture['records'].get(body.get('p_round'))
   if not result:status=404;result={'message':'Replay is no longer available'}
  elif name=='pit_call':
   if body.get('p_op')=='admin_delete':
    if not admin:status=403;result={'message':'Global administrator required'}
    else:
     fixture['records']={};fixture['replays']=[];fixture['leaderboard']=[];fixture['audit'].append('admin_delete');result=snapshot(admin)
   else:result=snapshot(admin)
  else:status=400;result={'message':'Unexpected controlled endpoint '+name}
  route.fulfill(status=status,headers={'Access-Control-Allow-Origin':'*'},content_type='application/json',body=json.dumps(result))
 context.route('https://pit-qa.supabase.co/**',serve)
 page=context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
 if hasattr(page,'route_web_socket'):page.route_web_socket('wss://pit-qa.supabase.co/**',lambda ws:None)
 page.goto(BASE);page.get_by_role('button',name='Admin access',exact=True).click()
 page.get_by_label('PASSWORD',exact=True).fill('reader7');page.get_by_role('button',name='Sign in',exact=True).click();expect(page.locator('[role=alert]')).to_contain_text('allowlist')
 page.get_by_label('PASSWORD',exact=True).fill('valid7');page.get_by_role('button',name='Sign in',exact=True).click();expect(page.locator('.admin-strip')).to_contain_text('Global admin')
 assert any(r['endpoint']=='token' and r['passwordLength']==6 for r in requests),requests
 page.get_by_role('button',name='Close panel',exact=True).click();page.reload();page.get_by_role('button',name='Leaderboard',exact=True).click();expect(page.locator('.admin-strip')).to_contain_text('Global admin');page.get_by_role('button',name='Close panel',exact=True).click()
 passed('Real Supabase JS Auth submits an existing six-character password to controlled HTTP; server-role rejection and persisted admin session work across reload')
 auth_before=len([r for r in requests if r['endpoint']=='token'])
 page.get_by_role('button',name='Solo Test',exact=False).click();expect(page.get_by_label('Choose role')).to_be_visible();page.get_by_role('button',name='Main Menu',exact=True).click();page.get_by_role('button',name='Leaderboard',exact=True).click();expect(page.locator('.admin-strip')).to_contain_text('Global admin');page.get_by_role('button',name='Close panel',exact=True).click()
 assert len([r for r in requests if r['endpoint']=='token'])==auth_before
 passed('Entering local Solo and navigating back preserves verified global Auth without another login or local-admin fallback')
 data=page.evaluate('''async()=>{const {ROLES}=await import('/src/types.ts'),{createRound,reconcile,submitAction}=await import('/src/engine.ts');const now=Date.now();const ps=id=>ROLES.map((role,i)=>({id:id+'-'+i,role,nickname:'Long Crew Name '+i,ready:true,joinedAt:now+i,connected:true}));const rooms=['A','B','C','D'].map(id=>{const players=ps(id),round=createRound(players,now-10000,id+'-round');reconcile(round,now-9000);submitAction(round,players[0].id,'FRONT_LIFT',now-1000);submitAction(round,players[1].id,'REAR_LIFT',now-900);return{id,teamId:id,name:'APEX '+id,color:'#ed3340',code:id,hostId:players[0].id,players,status:'RUNNING',round,updatedAt:now};});const players=ps('history'),round=createRound(players,now-10000,'history-round');let time=round.goAt;reconcile(round,time);for(let i=0;i<21;i++){const task=round.tasks.find(t=>t.status==='AVAILABLE');time=Math.max(time,task.enabledAt)+200;submitAction(round,task.ownerId,task.id,time,'qa'+i);}return{rooms,record:{roundId:round.id,teamId:'history',teamName:'APEX Finished',color:'#f14444',players,round}};}''')
 fixture['rooms']=data['rooms'];record=data['record'];fixture['records']={record['roundId']:record};fixture['replays']=[{'roundId':record['roundId'],'teamId':record['teamId'],'teamName':record['teamName'],'color':record['color'],'elapsedMs':record['round']['elapsedMs'],'finishedAt':record['round']['finishedAt']}]
 fixture['leaderboard']=[{'teamId':record['teamId'],'name':record['teamName'],'color':record['color'],'averageMs':record['round']['elapsedMs'],'bestMs':record['round']['elapsedMs'],'rounds':[{'id':'result-1','roundId':record['roundId'],'teamId':record['teamId'],'elapsedMs':record['round']['elapsedMs'],'finishedAt':record['round']['finishedAt']}]}]
 page.get_by_role('button',name='Watch Live',exact=False).click()
 for w,h in [(1440,900),(390,844)]:
  page.set_viewport_size({'width':w,'height':h});page.wait_for_timeout(150)
  expect(page.locator('.finished-team')).to_have_count(1,timeout=15000)
  card=page.locator('.finished-team');row=card.locator('.card-action-row');expect(row.get_by_role('button',name='Event Log',exact=True)).to_be_visible();expect(row.get_by_role('button',name='Replay',exact=True)).to_be_visible()
  row.get_by_role('button',name='Event Log',exact=True).click();expect(page.locator('.replay-event-table tbody tr')).to_have_count(21);assert page.url.endswith('#watch');expect(page.locator('.replay-view')).to_have_count(0)
  expect(page.get_by_role('columnheader')).to_have_text(['Task','By','Step Time','Team Time']);page.screenshot(path=str(OUT/f'overview-event-log-{w}.png'));page.get_by_role('button',name='Close Event Log',exact=True).click()
  row.get_by_role('button',name='Replay',exact=True).click();expect(page.locator('.replay-view')).to_be_visible();page.get_by_role('button',name='Close replay',exact=True).click();assert page.url.endswith('#watch')
  active=page.locator('.live-card[data-room-id="A"]');active.get_by_role('button',name='Event Log',exact=True).click();expect(page.locator('.replay-event-table tbody tr')).to_have_count(len(fixture['rooms'][0]['round']['events']))
  if w==1440:
   fixture['rooms'][0]=page.evaluate('''room=>{const task=room.round.tasks.find(t=>t.status==='AVAILABLE');task.status='DONE';task.completedAt=Date.now();room.round.events.push({taskId:task.id,at:task.completedAt,reason:'HUMAN',enabledAt:task.enabledAt,ownerId:task.ownerId,nickname:room.players.find(p=>p.id===task.ownerId).nickname,role:task.role});return room;}''',fixture['rooms'][0]);page.evaluate('window.dispatchEvent(new Event("online"))');expect(page.locator('.replay-event-table tbody tr')).to_have_count(3,timeout=15000)
  page.get_by_role('button',name='Close Event Log',exact=True).click()
  if w==390:expect(page.locator('.live-card-preview')).to_have_count(0)
 passed('Desktop/mobile overview Event Log and Replay are adjacent independent actions; active overview log updates live without entering focus; mobile has no preview canvases')
 # A permitted online deletion must not consume the local Solo room or leave stale replay/log entries.
 page.goto(BASE+'/#');page.get_by_role('button',name='Leaderboard',exact=True).click();page.get_by_role('button',name='Clear all results',exact=True).click();page.get_by_placeholder('DELETE',exact=True).fill('DELETE');page.get_by_role('button',name='Delete results',exact=True).click();expect(page.locator('.admin-strip')).to_contain_text('Global admin');assert fixture['audit']==['admin_delete']
 page.get_by_role('button',name='Close panel',exact=True).click();page.get_by_role('button',name='Resume Team',exact=False).click();expect(page.get_by_label('Choose role')).to_be_visible();page.get_by_role('button',name='Main Menu',exact=True).click();page.get_by_role('button',name='Watch Live',exact=False).click();expect(page.locator('.finished-team')).to_have_count(0)
 passed('Global deletion goes through authorized online RPC, invalidates finished/replay metadata and leaves Solo membership intact')
 assert not errors,errors
 (OUT/'admin-watch-report.json').write_text(json.dumps({'checks':checks,'requests':requests,'javascriptErrors':errors,'scope':'Actual application, Supabase JS Auth/session storage and controls with controlled HTTP responses, not a real hosted account. Realtime WebSocket is a local no-op fixture; periodic HTTP/recovery updates exercise UI invalidation. Real PostgreSQL role and deletion checks run separately in PGlite. No production credentials, users or scores touched.'},indent=2))
 browser.close()
