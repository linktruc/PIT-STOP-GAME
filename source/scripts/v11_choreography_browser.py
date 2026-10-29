"""Actual shared WebGL factory, recorded full-round engine fixtures, deterministic seeks."""
import base64,json,os,math,subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]; OUT=ROOT/'docs/v11-evidence/choreography';OUT.mkdir(parents=True,exist_ok=True)
BASE=os.environ.get('PIT_PREVIEW_URL','http://127.0.0.1:4194'); report={'views':[],'botCues':[],'errors':[]}
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
 context=b.new_context(viewport={'width':1200,'height':800})
 page=context.new_page();page.on('pageerror',lambda e:report['errors'].append(str(e)));page.goto(BASE+'/scripts/scene-qa.html',wait_until='domcontentloaded');print('Page ready',flush=True)
 page.evaluate('''async()=>{
 document.querySelector('#root').style.display='none';const host=document.createElement('div');host.id='scene-qa';host.style='position:fixed;inset:0;background:#111';document.body.append(host);
 const {createPitGarageScene}=await import('/src/scene/garage.ts');const THREE=await import('/node_modules/.vite/deps/three.js');const renderer=new THREE.WebGLRenderer({antialias:false,preserveDrawingBuffer:true});renderer.setSize(900,600,false);host.append(renderer.domElement);window.__world=createPitGarageScene(host,{quality:'low',manual:true,renderer});
 window.__evidence=await(await fetch('/docs/v11-evidence/bot-timing-report.json')).json();
 window.__setFixture=(key)=>{const round=structuredClone(__evidence[key].round);window.__room={id:key,teamId:key,name:key,color:'#e33',code:'QA',hostId:'solo-you',status:'COMPLETED',players:round.players??[{id:'solo-you',role:'FRONT_JACK',nickname:'You',ready:true,joinedAt:0}],round,updatedAt:round.finishedAt};};
 window.__seek=time=>{__world.update(__room,'solo-you',true,time);__world.render(performance.now());};__setFixture('soloFrontJack4000');__seek(9380);
 }''')
 print('Factory ready',flush=True)
 def seek(time):
  page.evaluate('(time)=>{window.__seek(time)}',time)
  page.wait_for_function('(time)=>document.querySelector("#scene-qa").dataset.sceneClock===String(time)',arg=time,polling=100,timeout=10000)
  print('Seek',time,flush=True)
 def data():return page.locator('#scene-qa').evaluate('(e)=>({...e.dataset})')
 for phase,time in [('loosen',9380),('tighten',21380)]:
  print('Phase',phase,flush=True)
  seek(time)
  for corner in ['FL','FR','RL','RR']:
   for view in ['top','front','diagonal']:
    page.evaluate('([role,view])=>{__world.setCrewCloseup(role,view);__world.render(performance.now());}',[corner+'_GUNNER',view]);page.wait_for_timeout(100)
    d=data();poses=json.loads(d['gunnerPoses']);pose=next(q for q in poses if q['role']==corner+'_GUNNER')
    assert all(abs(foot[1]-.075)<.001 for foot in pose['feet']),(corner,pose)
    assert min(q[1] for q in pose['knees'])<.10,(corner,pose)
    assert d['supportClear']=='true' and float(d['supportContactError'])<.06,(phase,view,d)
    assert float(d['maxGripError'])<.06,(phase,view,d['maxGripError'])
    page.screenshot(path=str(OUT/f'{corner.lower()}-{phase}-{view}.png'));print(corner,phase,view,flush=True)
    report['views'].append({'corner':corner,'phase':phase,'view':view,'time':time,'pose':pose,'gripError':d['maxGripError'],'supportContactError':d['supportContactError']})
 seek(10300)
 for role in ['NOSE_LEFT','NOSE_RIGHT','SIDEPOD_LEFT','SIDEPOD_RIGHT']:
  for view in ['top','front','diagonal']:
   page.evaluate('([role,view])=>{__world.setCrewCloseup(role,view);__world.render(performance.now());}',[role,view]);page.wait_for_timeout(100)
   page.screenshot(path=str(OUT/f'{role.lower()}-{view}.png'))
   d=data();report['views'].append({'support':role,'view':view,'bodyClear':d['supportBodyClear'],'contactError':d['supportContactError']})
   assert d['supportBodyClear']=='true' and float(d['supportContactError'])<.06,(role,view,d)
 for key,checks in [('soloFrontJack4000',[5500,8000,8999,9001,9380,9800]),('soloFrontJack250',[1275,1499,1560,1880,2400])]:
  page.evaluate('(key)=>__setFixture(key)',key);page.evaluate('()=>__world.setCameraView("diagonal")')
  for time in checks:
   seek(time);d=data();cue=next(q for q in json.loads(d['botCues']) if q['taskId']=='FL_GUN_LOOSEN')
   report['botCues'].append({'fixture':key,'time':time,'cue':cue,'active':d['animationTasks']})
   if time<cue['eventAt']:assert cue['state']=='WAIT' and 'FL_GUN_LOOSEN' not in d['animationTasks'],(key,time,cue,d)
   page.screenshot(path=str(OUT/f'{key}-{time}.png'))
 # Deterministic real WebGL frame captures. Explicit render + framebuffer read
 # avoids headless requestAnimationFrame/captureStream throttling; no fake poses.
 def clip(name,key,start,end,fps=8,view='diagonal'):
  page.evaluate('(key)=>__setFixture(key)',key)
  page.evaluate('(view)=>__world.setCameraView(view)',view)
  folder=OUT/('frames-'+name);folder.mkdir(exist_ok=True)
  closest=99
  for frame in range(round((end-start)/1000*fps)+1):
   stamp=start+round(frame*1000/fps)
   encoded=page.evaluate('''(time)=>{__seek(time);return document.querySelector('#scene-qa canvas').toDataURL('image/jpeg',.84).split(',')[1]}''',stamp)
   (folder/f'{frame:04d}.jpg').write_bytes(base64.b64decode(encoded))
   d=data()
   if 9750<=stamp<21000:
    positions=json.loads(d['crewBodyPositions'])
    for corner in ['FL','FR','RL','RR']:
     gun=next(p for p in positions if p['role']==corner+'_GUNNER')
     for kind in ['WHEEL_OFF','WHEEL_ON']:
      carrier=next(p for p in positions if p['role']==corner+'_'+kind)
      for a in gun['centres']:
       for c in carrier['centres']:closest=min(closest,math.dist(a,c))
  subprocess.run(['ffmpeg','-y','-hide_banner','-loglevel','error','-framerate',str(fps),'-i',str(folder/'%04d.jpg'),'-c:v','libx264','-pix_fmt','yuv420p','-crf','24','-movflags','+faststart',str(OUT/(name+'.mp4'))],check=True)
  if closest<99:
   assert closest>.48,(name,closest)
   report['carrierClearanceMinimumCentreDistanceMetres']=closest
  print('Clip',name,flush=True)
 clip('bot-4000-wait-then-work','soloFrontJack4000',5000,10000)
 clip('bot-250-wait-then-work','soloFrontJack250',1250,2000,12)
 clip('gunners-loosen-handoff-tighten','soloFrontJack4000',8700,22000)
 # Both lower tails -> crew retreat -> actual departure, on authoritative clock.
 page.evaluate('()=>__setFixture("soloFrontJack4000")');page.evaluate('()=>__world.setCameraView("diagonal")')
 seek(33000);d=data();assert d['laneClear']=='true' and d['carDeparture']=='1.000',d
 page.screenshot(path=str(OUT/'exit-clear.png'));report['exit']={k:d[k]for k in ['laneClear','carDeparture','supportClear','carZ']}
 # Reverse seeking uses the same factory without stateful animation accumulation.
 seek(9380);first=data();seek(21500);seek(9380);again=data()
 assert first['gunnerPoses']==again['gunnerPoses'] and first['animationTasks']==again['animationTasks'];report['deterministicReverseSeek']=True
 report['captureMethod']='Actual shared Three.js scene, explicit authoritative seek/render, framebuffer JPEG frames encoded with ffmpeg. No synthetic character poses or altered event times.'
 report['limits']='Software Chromium/WebGL only; no physical mobile GPU or production multi-device session used by this choreography check.'
 context.close();b.close()
 report['video']=[str(p.relative_to(ROOT))for p in OUT.glob('*.mp4')]
 assert not report['errors'],report['errors']
 (OUT/'report.json').write_text(json.dumps(report,indent=2))
print('WebGL choreography PASS: 4 corners x 2 actions x 3 views, 4 supports x 3 views, slow/fast actual engine cues, exit clearance, reverse seek')
