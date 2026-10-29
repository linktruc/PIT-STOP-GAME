"""Measured actual MiniChain with controlled events; requires Python Playwright/Chromium/ffmpeg."""
import asyncio,json,pathlib,os,shutil
import playwright
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/v10-evidence';OUT.mkdir(exist_ok=True)
BASE=os.environ.get('PIT_PREVIEW_URL','http://127.0.0.1:4190')
ffmpeg=shutil.which('ffmpeg')
if ffmpeg:
 manifest=json.loads((pathlib.Path(playwright.__file__).parent/'driver/package/browsers.json').read_text())
 revision=next(b['revision'] for b in manifest['browsers'] if b['name']=='ffmpeg')
 video_tools=ROOT/'qa-output/browser-tools';binary=video_tools/f'ffmpeg-{revision}'/'ffmpeg-linux';binary.parent.mkdir(parents=True,exist_ok=True)
 if not binary.exists():binary.symlink_to(ffmpeg)
 os.environ['PLAYWRIGHT_BROWSERS_PATH']=str(video_tools)
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-webgl'])
  context=await browser.new_context(viewport={'width':1440,'height':900},record_video_dir=str(OUT/'video'),record_video_size={'width':1440,'height':900})
  page=await context.new_page()
  await page.goto(BASE,wait_until='domcontentloaded')
  await page.evaluate('''async()=>{
   const React=(await import('/node_modules/.vite/deps/react.js')).default;
   const ReactDOM=(await import('/node_modules/.vite/deps/react-dom_client.js')).default;
   const {MiniChain}=await import('/src/ChainHUD.tsx');
   const {createRound}=await import('/src/engine.ts');
   document.querySelector('#root').style.display='none';document.querySelector('vite-error-overlay')?.remove();
   const style=document.createElement('style');style.textContent='.qa-width .live-workflow{left:0!important;right:auto!important;top:28px!important;width:100%!important}.qa-width{height:125px;position:relative;color:#9eb7c7;font:14px Barlow,sans-serif}.qa-workflow{position:fixed;inset:0;padding:30px;background:#0b1824;z-index:99999;color:#d2e3ea;font-family:Barlow,sans-serif}';document.head.append(style);
   const holder=document.createElement('div');holder.className='qa-workflow';document.body.append(holder);
   const root=ReactDOM.createRoot(holder);const player={id:'you',nickname:'Alex',role:'FRONT_JACK',ready:true,joinedAt:0};
   window.__wr={id:'room',teamId:'team',code:'TEST',name:'Workflow proof',color:'#e33',hostId:'you',status:'RUNNING',players:[player],updatedAt:0,round:createRound([player],1000,'round')};
   window.__wr.round.status='RUNNING';window.__wr.round.tasks.filter(t=>t.cohort==='LIFT').forEach(t=>{t.status='AVAILABLE';t.enabledAt=1000});
   window.__renderWorkflow=()=>root.render(React.createElement(React.Fragment,null,React.createElement('h2',null,'Measured compact workflow — actual React component'),...[390,768,1200].map(width=>React.createElement('section',{key:width,className:'qa-width','data-width':width,style:{width}},React.createElement('span',null,`${width}px actual ribbon width`),React.createElement(MiniChain,{room:structuredClone(window.__wr),playerId:'you',onOpen:()=>{}})))));
   window.__completeWorkflow=(id,at)=>{const t=window.__wr.round.tasks.find(t=>t.id===id);t.status='DONE';t.completedAt=at;window.__wr.round.events.push({taskId:id,at,reason:'HUMAN'});window.__wr.round.tasks.filter(t=>t.status==='LOCKED'&&t.dependencies.every(id=>window.__wr.round.tasks.find(x=>x.id===id).status==='DONE')).forEach(t=>{t.status='AVAILABLE';t.enabledAt=at});window.__renderWorkflow()};
   window.__renderWorkflow();await document.fonts.ready;
  }''')
  await page.wait_for_timeout(700)
  report=await page.evaluate('''()=>[...document.querySelectorAll('.qa-width')].map(e=>{const ribbon=e.querySelector('.live-workflow');return {width:ribbon.getBoundingClientRect().width,height:ribbon.getBoundingClientRect().height,renderedCount:ribbon.querySelectorAll('[data-visible=true]').length,reportedCount:+ribbon.dataset.visibleCount,tasks:[...ribbon.querySelectorAll('[data-visible=true] .rolling-task-label')].map(t=>({text:t.textContent,height:t.clientHeight,scrollHeight:t.scrollHeight})),progressChildren:ribbon.querySelector('.rolling-progress').children.length}})''')
  assert [r['renderedCount'] for r in report]==[3,6,10],report
  assert all(r['height']==62 for r in report),report
  assert all(t['scrollHeight']<=t['height']+1 for r in report for t in r['tasks']),report
  await page.screenshot(path=str(OUT/'workflow-responsive-390-768-1200.png'))
  frames=[]
  for task,at in [('FRONT_LIFT',1100),('REAR_LIFT',1150),('FL_GUN_LOOSEN',1300),('FR_GUN_LOOSEN',1350)]:
   before=await page.locator('[data-width="390"] [data-task-ids="RL_GUN_LOOSEN"]').evaluate('(e)=>({x:e.getBoundingClientRect().x,transform:getComputedStyle(e).transform})')
   motion=await page.evaluate('''([task,at])=>new Promise(resolve=>{const tile=document.querySelector('[data-width=\"390\"] [data-task-ids=\"RL_GUN_LOOSEN\"]');const start=performance.now();const samples=[];window.__completeWorkflow(task,at);function frame(now){samples.push({ms:now-start,x:tile.getBoundingClientRect().x,duration:getComputedStyle(tile).transitionDuration});if(now-start<520)requestAnimationFrame(frame);else resolve(samples)}requestAnimationFrame(frame)})''',[task,at])
   await page.wait_for_timeout(120)
   during=await page.locator('[data-width="390"] .live-workflow').evaluate('(e)=>({offset:+e.dataset.windowStart,progress:+e.dataset.progress,fill:e.querySelector(".rolling-progress-fill").getBoundingClientRect().width,tiles:[...e.querySelectorAll("[data-visible=true]")].map(t=>({id:t.dataset.taskIds,x:t.getBoundingClientRect().x,transition:getComputedStyle(t).transitionProperty}))})')
   await page.wait_for_timeout(550)
   after=await page.locator('[data-width="390"] [data-task-ids="RL_GUN_LOOSEN"]').evaluate('(e)=>({x:e.getBoundingClientRect().x,transform:getComputedStyle(e).transform})')
   frames.append({'task':task,'before':before,'during':during,'after':after,'motion':motion})
  assert frames[1]['after']['x'] < frames[1]['before']['x'],frames
  assert any(f['after']['x']+1 < sample['x'] < f['before']['x']-1 for f in frames for sample in f['motion']),frames
  await page.screenshot(path=str(OUT/'workflow-after-completions.png'))
  (OUT/'workflow-responsive.json').write_text(json.dumps({'responsive':report,'transitions':frames},indent=2))
  print(json.dumps({'counts':[r['renderedCount'] for r in report],'heights':[r['height'] for r in report],'noTextClipping':True,'leftSlideMeasured':True,'output':str(OUT)}))
  video=page.video
  await context.close()
  if video:pathlib.Path(await video.path()).replace(OUT/'workflow-progression.webm')
  await browser.close()
asyncio.run(main())
