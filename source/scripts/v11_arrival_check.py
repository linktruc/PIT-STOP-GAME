"""Real shared-scene WebGL arrival captures; no substitute car or fake drawing."""
import json
import os
import subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/v11-evidence/arrival'
OUT.mkdir(parents=True, exist_ok=True)
BASE = os.environ.get('PIT_PREVIEW_URL', 'http://127.0.0.1:4190')
BEFORE = os.environ.get('PIT_BEFORE_URL', 'http://127.0.0.1:4193')
GO = 100000
measurements, errors = [], []

HARNESS = '''async () => {
 document.querySelector('#root').style.display='none';
 const host=document.createElement('div');host.id='arrival-qa';host.style='position:fixed;inset:0;background:#111;z-index:99999';document.body.append(host);
 const {createPitGarageScene}=await import('/src/scene/garage.ts');const {createRound}=await import('/src/engine.ts');const {ROLES}=await import('/src/types.ts');
 const players=ROLES.map((role,i)=>({id:'arrival-'+i,role,nickname:'Crew '+i,ready:true,joinedAt:0}));
 const round=createRound(players,100000,'arrival-recorded');
 window.__arrivalRoom={id:'arrival-room',teamId:'arrival-team',name:'Arrival QA',color:'#ef3340',code:'ARRIVE',hostId:players[0].id,status:'COUNTDOWN',players,round,updatedAt:97000};
 // Use the actual production factory/camera; render one explicitly requested
 // authoritative timestamp at a time instead of depending on headless RAF pace.
 window.requestAnimationFrame=()=>0;
 window.__arrivalWorld=createPitGarageScene(host,{quality:'low'});
 window.__arrivalFrames=0;
 window.__arrivalSeek=(time)=>{window.__arrivalWorld.update(window.__arrivalRoom,'arrival-0',true,time);window.__arrivalWorld.render(performance.now()+(++window.__arrivalFrames)*1000)};
 window.__arrivalSeek(97000);
}'''

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True, args=['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    for width, height in [(390, 844), (430, 932), (1440, 900)]:
        context = browser.new_context(viewport={'width': width, 'height': height})
        context.add_init_script("localStorage.setItem('pit-v7-quality','low')")
        page = context.new_page()
        page.on('pageerror', lambda e: errors.append(str(e)))
        for version, url in [('before', BEFORE), ('after', BASE)]:
            print('Capturing', version, width, flush=True)
            page.goto(url)
            page.evaluate(HARNESS)
            for label, time in [('3', GO-3000), ('2', GO-2000), ('turn', GO-1500), ('1', GO-1000), ('GO', GO), ('ready', GO+350)]:
                page.evaluate('(time)=>window.__arrivalSeek(time)', time)
                page.wait_for_function('(time)=>document.querySelector("#arrival-qa").dataset.sceneClock===String(time)', arg=time)
                dataset = page.locator('#arrival-qa').evaluate('(el)=>({...el.dataset,crewTargets:undefined})')
                measurements.append({'version': version, 'viewport': [width, height], 'countdown': label, 'dataset': dataset})
                if version == 'after':
                    assert json.loads(dataset['carViewport'])['visible'], (width, label, dataset['carViewport'])
                    bounds = json.loads(dataset['carBounds'])
                    assert bounds['left'] >= 0 and bounds['right'] <= width, (width, label, bounds)
                    assert bounds['top'] >= 0 and bounds['bottom'] <= height, (width, label, bounds)
                    if label in ['GO', 'ready']:
                        assert float(dataset['carX']) == 0 and float(dataset['carZ']) == 0 and float(dataset['carYaw']) == 0
                page.screenshot(path=str(OUT/f'{version}-{width}-{label}.png'))
                print('  ', label, flush=True)
            if version == 'after' and width == 390:
                sequence = OUT/'sequence-390'
                sequence.mkdir(exist_ok=True)
                for index in range(36):
                    page.evaluate('(time)=>window.__arrivalSeek(time)', GO-3000+index*100)
                    page.screenshot(path=str(sequence/f'frame-{index:03d}.png'))
                subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-framerate', '10', '-i', str(sequence/'frame-%03d.png'), '-vf', 'format=yuv420p', '-r', '30', '-c:v', 'libx264', '-crf', '22', str(OUT/'arrival-390.mp4')], check=True)
                print('  Captured actual timestamp-sampled 10fps sequence', flush=True)
            page.evaluate('window.__arrivalWorld.dispose()')
        context.close()
    browser.close()

(OUT/'arrival-report.json').write_text(json.dumps({'measurements': measurements, 'javascriptErrors': errors, 'scope': 'Actual createPitGarageScene in Chromium software WebGL at fixed authoritative presentation timestamps, V10.3 straight approach vs V11 curved route. Explicit render calls use the real default smart camera; only browser RAF scheduling is disabled inside this QA harness. MP4 is actual timestamp-sampled WebGL captures at 10fps encoded30fps, not a real-device FPS measurement. Numeric footprint/pace proof is in tests/v11-arrival.test.ts. No physical-device or production-server validation.'}, indent=2))
assert not errors, errors
print('PASS: arrival visible at 3/2/1/GO in 390/430/1440, stationary GO, before/after actual WebGL captures.')
