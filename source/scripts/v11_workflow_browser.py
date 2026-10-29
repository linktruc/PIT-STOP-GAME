"""Actual workflow components: measured density, 100ms burst/reconnect and one-screen DAG."""
import asyncio,json,pathlib,os,shutil
import playwright
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/v11-evidence';OUT.mkdir(exist_ok=True)
BASE=os.environ.get('PIT_PREVIEW_URL','http://127.0.0.1:4190')
ffmpeg=shutil.which('ffmpeg')
if ffmpeg:
 manifest=json.loads((pathlib.Path(playwright.__file__).parent/'driver/package/browsers.json').read_text())
 revision=next(b['revision'] for b in manifest['browsers'] if b['name']=='ffmpeg')
 binary=ROOT/'qa-output/browser-tools'/f'ffmpeg-{revision}'/'ffmpeg-linux';binary.parent.mkdir(parents=True,exist_ok=True)
 if not binary.exists():binary.symlink_to(ffmpeg)
 os.environ['PLAYWRIGHT_BROWSERS_PATH']=str(ROOT/'qa-output/browser-tools')
FIXTURE='''async()=>{
 const React=(await import('/node_modules/.vite/deps/react.js')).default;
 const ReactDOM=(await import('/node_modules/.vite/deps/react-dom_client.js')).default;
 const {MiniChain,default:ChainHUD}=await import('/src/ChainHUD.tsx');
 const {createRound}=await import('/src/engine.ts');
 document.querySelector('#root').style.display='none';
 const style=document.createElement('style');style.textContent='.qa-workflow{position:fixed;inset:0;z-index:99999;background:#0b1824;color:#d2e3ea;font-family:Barlow,sans-serif}.qa-mini .milestone-workflow{top:90px!important}.qa-workflow>h2{font-size:18px;padding:20px 14px}.qa-workflow>p{padding:0 14px;font-size:12px}.qa-gallery .qa-width{position:relative;height:120px;margin:0 24px}.qa-gallery .milestone-workflow{left:0!important;right:0!important;top:25px!important;max-width:none!important}.qa-width>span{font:12px Barlow,sans-serif}.qa-badge{position:fixed;right:0;bottom:0;width:154px;height:90px;background:#23303b;border:1px dashed #72828b;display:grid;place-items:center;font:11px Barlow,sans-serif;color:#c6d3d7;z-index:999999}';document.head.append(style);
 const holder=document.createElement('div');holder.className='qa-workflow qa-mini';document.body.append(holder);const root=ReactDOM.createRoot(holder);
 const players=[{id:'you',nickname:'Alex Extremelylongnickname',role:'FRONT_JACK',ready:true,joinedAt:0},{id:'other',nickname:'VeryLongCrewNicknameExample',role:'FR_GUNNER',ready:true,joinedAt:1}];
 window.__wr={id:'room',teamId:'team',code:'TEST',name:'Workflow proof',color:'#e33',hostId:'you',status:'RUNNING',players,updatedAt:0,round:createRound(players,1000,'round')};
 window.__wr.round.status='RUNNING';
 window.__complete=(id,at)=>{const task=window.__wr.round.tasks.find(t=>t.id===id);task.status='DONE';task.completedAt=at;window.__wr.round.events.push({taskId:id,at,reason:'TEST'});window.__wr.round.tasks.filter(t=>t.status==='LOCKED'&&t.dependencies.every(id=>window.__wr.round.tasks.find(x=>x.id===id).status==='DONE')).forEach(t=>{t.status='AVAILABLE';t.enabledAt=at});};
 window.__complete('FRONT_LIFT',1100);window.__complete('REAR_LIFT',1100);
 window.__qaMode='mini';window.__qaPlayer='you';
 window.__renderWorkflow=()=>{holder.className=`qa-workflow qa-${window.__qaMode}`;const room=structuredClone(window.__wr);root.render(window.__qaMode==='gallery'?React.createElement(React.Fragment,null,React.createElement('h2',null,'One rail. More real milestones at wider widths.'),...[{viewport:390,width:362},{viewport:430,width:402},{viewport:768,width:720},{viewport:1440,width:900}].map(x=>React.createElement('section',{key:x.viewport,className:'qa-width','data-viewport':x.viewport,style:{width:x.width}},React.createElement('span',null,`${x.viewport}px viewport — ${x.width}px actual rail`),React.createElement(MiniChain,{room,playerId:window.__qaPlayer,onOpen:()=>{}})))):window.__qaMode==='full'?React.createElement(React.Fragment,null,React.createElement('div',{className:'overlay-backdrop',style:{padding:'12px 12px 102px'}},React.createElement('section',{className:'game-overlay wide chain-overlay'},React.createElement('header',{className:'overlay-heading'},React.createElement('div',null,React.createElement('span',{className:'eyebrow'},'LIVE WORKFLOW'),React.createElement('h2',null,'The connected stop')),React.createElement('button',{className:'icon-control','aria-label':'Close'},'×')),React.createElement('div',{className:'overlay-content'},React.createElement(ChainHUD,{room,playerId:window.__qaPlayer})))),React.createElement('div',{className:'qa-badge'},'90px third-party badge')):React.createElement(React.Fragment,null,React.createElement('h2',null,'Parallel wheel work — 100ms receipts'),React.createElement('p',null,'Context + task, stable phase order, one total-completion sweep.'),React.createElement(MiniChain,{room,playerId:window.__qaPlayer,onOpen:()=>{}})));};window.__renderWorkflow();await document.fonts.ready;
}'''
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-webgl'])
  context=await browser.new_context(viewport={'width':390,'height':844},record_video_dir=str(OUT/'workflow-video'),record_video_size={'width':780,'height':844})
  page=await context.new_page();errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
  await page.goto(BASE,wait_until='domcontentloaded');await page.evaluate(FIXTURE);await page.wait_for_timeout(800)
  responsive=[]
  for width,height in [(390,844),(430,932),(768,1024),(1440,900)]:
   await page.set_viewport_size({'width':width,'height':height});await page.wait_for_timeout(400)
   result=await page.locator('.milestone-workflow').evaluate('''e=>({viewport:innerWidth,width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height,count:+e.dataset.visibleCount,labelWidth:+e.dataset.labelWidth,tasks:[...e.querySelectorAll('.rail-milestone')].map(n=>({id:n.dataset.taskIds,text:n.textContent,x:n.getBoundingClientRect().x,width:n.getBoundingClientRect().width,owned:n.dataset.owned,clipped:[...n.querySelectorAll('.rail-context,.rail-action')].some(t=>t.scrollWidth>t.clientWidth+1)})),tileBoxes:e.querySelectorAll('.rolling-slot').length})''')
   assert result['height']<=62 and not result['tileBoxes'],result
   assert not any(t['clipped'] for t in result['tasks']),result
   responsive.append(result);await page.screenshot(path=str(OUT/f'workflow-rail-{width}.png'))
  assert all(b['count']>a['count'] for a,b in zip(responsive,responsive[1:])),responsive
  await page.set_viewport_size({'width':1440,'height':900});await page.evaluate("window.__qaMode='gallery';window.__renderWorkflow()");await page.wait_for_timeout(500);await page.screenshot(path=str(OUT/'workflow-responsive-comparison.png'))
  await page.set_viewport_size({'width':390,'height':844});await page.evaluate("window.__qaMode='mini';window.__qaPlayer='other';window.__renderWorkflow()");await page.wait_for_timeout(500)
  assert await page.locator('.rail-milestone.owned').count()==1
  # Four completions 100ms apart. Display target must change exactly once, after the burst.
  burst=await page.evaluate('''()=>new Promise(resolve=>{const samples=[];const start=performance.now();const ids=['FL_GUN_LOOSEN','FR_GUN_LOOSEN','RL_GUN_LOOSEN','RR_GUN_LOOSEN'];ids.forEach((id,i)=>setTimeout(()=>{window.__complete(id,1200+i*100);window.__renderWorkflow()},i*100));function tick(now){const e=document.querySelector('.milestone-workflow');samples.push({ms:now-start,target:+e.dataset.progress,visual:+e.dataset.visualProgress,offset:+e.dataset.windowStart,ids:[...e.querySelectorAll('.rail-milestone')].map(n=>n.dataset.taskIds)});if(now-start<1100)requestAnimationFrame(tick);else resolve(samples)}requestAnimationFrame(tick)})''')
  assert sorted(set(s['target'] for s in burst))==[2,6],burst
  assert all(b['visual']>=a['visual'] for a,b in zip(burst,burst[1:])),burst
  assert len({tuple(s['ids']) for s in burst})==2,burst
  assert await page.locator('.rail-milestone.owned').count()==0
  await page.screenshot(path=str(OUT/'workflow-after-four-wheel-burst.png'))
  # Five 40ms snapshots, then a stale reconnect followed by an authoritative catch-up.
  catchup=await page.evaluate('''()=>new Promise(resolve=>{const samples=[];const start=performance.now();window.__stale=structuredClone(window.__wr);['FL_WHEEL_OFF','FR_WHEEL_OFF','RL_WHEEL_OFF','RR_WHEEL_OFF','FL_WHEEL_ON'].forEach((id,i)=>setTimeout(()=>{window.__complete(id,1700+i*40);window.__renderWorkflow()},i*40));setTimeout(()=>{const latest=window.__wr;window.__wr=window.__stale;window.__renderWorkflow();window.__wr=latest},600);setTimeout(()=>{window.__complete('FR_WHEEL_ON',2100);window.__complete('RL_WHEEL_ON',2100);window.__complete('RR_WHEEL_ON',2100);window.__renderWorkflow()},800);function tick(now){const e=document.querySelector('.milestone-workflow');samples.push({ms:now-start,target:+e.dataset.progress,visual:+e.dataset.visualProgress,offset:+e.dataset.windowStart});if(now-start<1450)requestAnimationFrame(tick);else resolve(samples)}requestAnimationFrame(tick)})''')
  assert sorted(set(s['target'] for s in catchup))==[6,11,14],catchup
  assert all(b['visual']>=a['visual'] for a,b in zip(catchup,catchup[1:])),catchup
  video=page.video;await context.close()
  if video:pathlib.Path(await video.path()).replace(OUT/'workflow-four-wheel-100ms-burst-and-reconnect.webm')
  # Full-board geometry, long names, 90px bottom overlay: every node and assignee stays visible.
  page=await browser.new_page();await page.goto(BASE,wait_until='domcontentloaded');await page.evaluate(FIXTURE);await page.evaluate("window.__qaMode='full';window.__renderWorkflow()");await page.wait_for_timeout(400)
  boards=[]
  for width,height in [(375,667),(390,844),(430,932),(768,1024),(1440,900)]:
   await page.set_viewport_size({'width':width,'height':height});await page.wait_for_timeout(350)
   board=await page.evaluate('''()=>{const g=document.querySelector('.connected-graph').getBoundingClientRect();return {viewport:[innerWidth,innerHeight],graph:g.toJSON(),nodes:[...document.querySelectorAll('[data-task-id]')].map(n=>{const r=n.getBoundingClientRect();return {id:n.dataset.taskId,bounds:r.toJSON(),inside:r.left>=g.left-1&&r.right<=g.right+1&&r.top>=g.top-1&&r.bottom<=g.bottom+1,name:n.dataset.owner,font:getComputedStyle(n.querySelector('.chain-node-title')).fontSize,ownerFont:getComputedStyle(n.querySelector('.chain-node-owner')).fontSize,title:n.title}}),edges:[...document.querySelectorAll('[data-from]')].map(p=>({from:p.dataset.from,to:p.dataset.to,path:p.getAttribute('d')})),containers:[...document.querySelectorAll('.chain-overlay,.overlay-content,.v11-board,.connected-graph,.axle-columns,.axle-board')].map(n=>({class:n.className,client:[n.clientWidth,n.clientHeight],scroll:[n.scrollWidth,n.scrollHeight],overflow:getComputedStyle(n).overflow})),pageScroll:document.body.scrollHeight>innerHeight}}''')
   assert len(board['nodes'])==21 and all(n['inside'] for n in board['nodes']),board
   assert len(board['edges'])==26 and all(e['path'] for e in board['edges']),board
   assert not board['pageScroll'],board
   assert all(c['scroll'][0]<=c['client'][0]+1 and c['scroll'][1]<=c['client'][1]+1 for c in board['containers']),board
   assert all(float(n['font'][:-2])>=11 and float(n['ownerFont'][:-2])>=10 for n in board['nodes']),board
   boards.append(board);await page.screenshot(path=str(OUT/f'workflow-full-{width}.png'))
  await page.locator('[data-task-id="FR_GUN_LOOSEN"]').click();assert 'VeryLongCrewNicknameExample' in await page.locator('.chain-inspect').inner_text()
  report={'responsive':responsive,'burst100ms':burst,'fiveSnapshotAndReconnect':catchup,'fullBoards':boards,'javascriptErrors':errors,'scope':'Actual React MiniChain/ChainHUD components; deterministic authoritative-shaped fixtures. No production Supabase or physical iPhone claim.'}
  (OUT/'workflow-validation.json').write_text(json.dumps(report,indent=2));print(json.dumps({'counts':[r['count'] for r in responsive],'heights':[r['height'] for r in responsive],'burstTargets':sorted(set(s['target'] for s in burst)),'catchupTargets':sorted(set(s['target'] for s in catchup)),'fullBoards':[{'viewport':r['viewport'],'nodes':len(r['nodes']),'edges':len(r['edges']),'noScroll':True} for r in boards],'errors':errors}));await browser.close()
asyncio.run(main())
