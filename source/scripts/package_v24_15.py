"""Package the V24.15 production build for a Netlify static upload."""
from pathlib import Path
import re
import shutil
import zipfile

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'
OUT = ROOT / 'artifacts'
if not (DIST / 'index.html').is_file():
    raise SystemExit('Run npm run build first')
OUT.mkdir(exist_ok=True)
for name in ['ASSET_CREDITS.md', 'THIRD_PARTY_NOTICES.txt']:
    shutil.copyfile(ROOT / name, DIST / name)
target = OUT / 'Pit_Stop_V24_15_Natural_Drag_Camera_Netlify.zip'
with zipfile.ZipFile(target, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for p in sorted(DIST.rglob('*')):
        if p.is_file():
            z.write(p, p.relative_to(DIST).as_posix())
with zipfile.ZipFile(target) as z:
    assert z.testzip() is None
    assert {'index.html', 'config.js', '_headers', '_redirects'} <= set(z.namelist())
    assert z.read('config.js') == (ROOT / 'public/config.js').read_bytes()
    for name in re.findall(r'[/]?(assets/[^"\s]+)', z.read('index.html').decode('utf-8')):
        assert z.read(name) == (DIST / name).read_bytes()
print(f'{target}: {target.stat().st_size:,} bytes; ZIP CRC and deployment files verified.')
