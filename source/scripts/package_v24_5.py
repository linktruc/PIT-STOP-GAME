"""Build portable V24.5 source and prebuilt Netlify ZIPs after npm run build."""
from pathlib import Path
import zipfile
import shutil
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "artifacts"
OUT.mkdir(exist_ok=True)
DIST = ROOT / "dist"
if not (DIST / "index.html").is_file():
    raise SystemExit("Run npm run build first")
for name in ["ASSET_CREDITS.md", "THIRD_PARTY_NOTICES.txt"]:
    shutil.copyfile(ROOT/name,DIST/name)
def archive(name, files, base):
    target=OUT/name
    with zipfile.ZipFile(target,"w",zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        for path in sorted(set(files)):
            if path.is_file() and not path.is_symlink():
                z.write(path,path.relative_to(base).as_posix())
    with zipfile.ZipFile(target) as z:
        assert z.testzip() is None
    print(f"{target.name}: {target.stat().st_size:,} bytes")
    return target
netlify=archive("Pit_Stop_V24_5_Fast_Animation_Reference_Netlify.zip",DIST.rglob("*"),DIST)
files=[]
for directory in ["src","public","scripts","supabase","tests","docs"]:
    files.extend(p for p in (ROOT/directory).rglob("*") if p.is_file() and "__pycache__" not in p.parts)
for pattern in ["*.md","*.txt","*.sql"]:
    files.extend(ROOT.glob(pattern))
files.extend(ROOT/name for name in [".gitignore","index.html","package.json","package-lock.json","tsconfig.json","vite.config.ts","eslint.config.js"])
source=archive("Pit_Stop_V24_5_Fast_Animation_Reference_Source.zip",files,ROOT)
with zipfile.ZipFile(netlify) as z:
    assert {"index.html","config.js","_headers","_redirects"}<=set(z.namelist())
    assert z.read("config.js")== (ROOT/"public/config.js").read_bytes()
with zipfile.ZipFile(source) as z:
    assert z.read("src/engine.ts")== (ROOT/"src/engine.ts").read_bytes()
    assert "tests/v24-solo.test.ts" in z.namelist()
