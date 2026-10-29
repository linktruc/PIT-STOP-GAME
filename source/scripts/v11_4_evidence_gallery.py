"""Index genuine V11.4 captures/reports; preserve prior evidence separately."""
from pathlib import Path
import hashlib,html,json
OUT=Path(__file__).resolve().parents[1]/'docs/v11-4-evidence'
pairs=[('Menu with retained seat','before-menu-seat-1366.png','after-menu-seat-1366.png'),('Quick controls','before-navigation-1366.png','after-navigation-1366.png'),('Visible Solo role selection','before-solo-1366.png','after-solo-FRONT_JACK.png')]
parts=['<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>V11.4 evidence</title><style>body{font:15px system-ui;background:#101c26;color:#e3e9e7;margin:24px}a{color:#f4d586}h1{font-size:24px}.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}img{max-width:100%;height:auto}figure{margin:0}details{margin:20px 0}li{margin:8px 0}@media(max-width:700px){.pair{grid-template-columns:1fr}}</style><h1>V11.4 focused fixes</h1><p>Paired before/after captures below use the same WebGL-disabled layout mode. Final WebGL captures separately show the actual unchanged 3D scene.125% acceptance uses equivalent CSS viewport and device pixel ratio, not physical OS zoom. Reports identify local vs hosted scope.</p>']
for title,before,after in pairs:
    if (OUT/before).is_file() and (OUT/after).is_file():
        parts.append(f'<h2>{html.escape(title)}</h2><div class="pair"><figure><figcaption>Before V11.3</figcaption><img src="{before}"></figure><figure><figcaption>After V11.4</figcaption><img src="{after}"></figure></div>')
for path in sorted(OUT.glob('webgl-*.png')):
    parts.append(f'<details><summary>{html.escape(path.name)} · actual software WebGL</summary><img loading="lazy" src="{path.name}"></details>')
parts.append('<h2>Reports and command output</h2><ul>')
files=[]
for path in sorted(OUT.iterdir()):
    if not path.is_file() or path.name in ['comparison.html','inventory.json']:continue
    content=path.read_bytes();files.append({'path':path.name,'bytes':len(content),'sha256':hashlib.sha256(content).hexdigest()})
    if path.suffix in ['.json','.txt']:parts.append(f'<li><a href="{path.name}">{html.escape(path.name)}</a></li>')
parts.append('</ul>')
(OUT/'comparison.html').write_text('\n'.join(parts))
(OUT/'inventory.json').write_text(json.dumps({'files':files},indent=2)+'\n')
print('Indexed',len(files),'genuine V11.4 evidence files')
