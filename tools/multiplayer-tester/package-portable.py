"""Package the tester with a supplied Windows Node executable and Playwright Core."""
from pathlib import Path
import argparse,shutil,zipfile
parser=argparse.ArgumentParser();parser.add_argument('--node',type=Path,required=True);parser.add_argument('--core',type=Path,required=True);parser.add_argument('--node-license',type=Path,required=True);parser.add_argument('--out',type=Path,required=True);args=parser.parse_args()
root=Path(__file__).resolve().parent;out=args.out.resolve();out.mkdir(parents=True,exist_ok=True)
stage=out/'Pit_Stop_Multiplayer_Tester'
if stage.exists():raise SystemExit('Output folder already exists; choose a new output directory.')
assert args.node.is_file() and (args.core/'package.json').is_file() and args.node_license.is_file()
stage.mkdir()
files=[p for p in root.rglob('*') if p.is_file() and not any(part in {'node_modules','runtime','__pycache__'} for part in p.relative_to(root).parts)]
for p in files:
 target=stage/p.relative_to(root);target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(p,target)
(stage/'runtime').mkdir();shutil.copyfile(args.node,stage/'runtime/node.exe')
shutil.copytree(args.core,stage/'node_modules/playwright-core')
shutil.copyfile(args.node_license,stage/'NODE_LICENSE.txt')
with zipfile.ZipFile(out/'Pit_Stop_Multiplayer_Tester_Windows.zip','w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in sorted(stage.rglob('*')):
  if p.is_file():z.write(p,p.relative_to(out).as_posix())
with zipfile.ZipFile(out/'Pit_Stop_Multiplayer_Tester_Source.zip','w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in sorted(files):z.write(p,Path('Pit_Stop_Multiplayer_Tester_Source')/p.relative_to(root))
for p in out.glob('*.zip'):
 with zipfile.ZipFile(p) as z:assert z.testzip() is None
 print(f'{p.name}: {p.stat().st_size:,} bytes')
print(stage)
