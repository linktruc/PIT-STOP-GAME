"""Build a local-only gallery from evidence files that actually exist; no QA claims."""
from pathlib import Path
import hashlib
import html
import json
from urllib.parse import quote

ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = ROOT / "docs/v11-evidence"
EVIDENCE.mkdir(parents=True, exist_ok=True)
files = sorted(path for path in EVIDENCE.rglob("*")
               if path.is_file() and path.name not in {"comparison.html", "evidence-inventory.json"}
               and not any(part == "workflow-video" or part.startswith(("sequence-", "frames-"))
                           for part in path.relative_to(EVIDENCE).parts[:-1]))
names = {path.relative_to(EVIDENCE).as_posix() for path in files}


def figure(name, label=None):
    return (f'<figure><figcaption>{html.escape(label or name)}</figcaption>'
            f'<a href="{quote(name)}"><img loading="lazy" src="{quote(name)}" alt="{html.escape(name)}"></a></figure>')


pairs = []
paired = set()
for size in ["390", "430", "1366", "1440"]:
    for state in ["waiting", "running"]:
        before = f"baseline-v10-{state}-{size}.png"
        candidates = [f"after-v11-{state}-{size}.png", f"ui-after-{state}-{size}.png"]
        if int(size) >= 1100:
            # Earlier desktop captures precede the owner's vertical-layout addition.
            candidates = []
        if size in {"390", "430"}:
            height = "844" if size == "390" else "932"
            candidates.insert(0, f"final-mobile-{state}-{size}x{height}-external-badge-geometry.png")
            candidates.insert(0, f"final-mobile-{state}-{size}x{height}-external-badge.png")
        if state == "running":
            candidates.append(f"ui-after-{size}.png")
            candidates.insert(0, f"final-scene-layout-{size}.png")
        after = next((name for name in candidates if name in names), None)
        if before in names and after:
            pairs.append(f'<h3>{size}px viewport — {state}</h3><div class="pair">'
                         + figure(before, f"Before — {before}")
                         + figure(after, f"After — {after}") + '</div>')
            paired.update([before, after])
images = ''.join(figure(path.relative_to(EVIDENCE).as_posix()) for path in files if path.suffix.lower() == ".png" and path.relative_to(EVIDENCE).as_posix() not in paired)
videos = ''.join(f'<figure><figcaption>{html.escape(path.relative_to(EVIDENCE).as_posix())}</figcaption>'
                 f'<video controls preload="metadata" src="{quote(path.relative_to(EVIDENCE).as_posix())}"></video></figure>'
                 for path in files if path.suffix.lower() in {".webm", ".mp4"})
reports = ''.join(f'<li><a href="{quote(path.relative_to(EVIDENCE).as_posix())}">{html.escape(path.relative_to(EVIDENCE).as_posix())}</a></li>'
                  for path in files if path.suffix.lower() in {".json", ".txt", ".md"})
page = '''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Pit Stop. Simulator. V11.3 — local evidence</title><style>
:root{color-scheme:dark;font:16px system-ui;background:#101719;color:#e9eeee}body{max-width:1600px;margin:auto;padding:24px}h1{font-size:28px}p{line-height:1.6;max-width:1000px}a{color:#e7bd64}figure{margin:0;background:#1b2528;padding:12px;min-width:0}figcaption{margin-bottom:8px;overflow-wrap:anywhere;font-size:14px}img,video{display:block;max-width:100%;max-height:900px;margin:auto;object-fit:contain}.pair,.grid{display:grid;gap:16px;margin-bottom:24px}.pair{grid-template-columns:1fr 1fr}.grid{grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}li{margin:8px 0}@media(max-width:650px){body{padding:12px}.pair{grid-template-columns:1fr}}
</style><h1>V11.3 — local evidence gallery</h1>
<p>This gallery indexes final files that exist in this delivery. Raw encoder frame sequences and duplicate browser-video intermediates are excluded; their final recordings remain included. It does not assert that every image proves production acceptance. Read <a href="../../TEST_REPORT.md">TEST_REPORT.md</a> and <a href="../../V11_FIX_REPORT.md">V11_FIX_REPORT.md</a> for PASS / FAIL / NOT TESTED scope, fixture details and limits. Software Chromium, synthetic snapshots and local SQL tests do not establish hosted multi-device or physical Safari behavior. Captions preserve actual filenames; baseline/corrected camera angles may differ unless the report states otherwise.</p>
'''
if pairs:
    page += '<h2>Before / after</h2>' + ''.join(pairs)
if videos:
    page += '<h2>Captured sequences</h2><div class="grid">' + videos + '</div>'
if images:
    page += '<h2>Other captures</h2><div class="grid">' + images + '</div>'
page += '<h2>Recorded data and command output</h2><ul>' + reports + '</ul></html>\n'
(EVIDENCE / "comparison.html").write_text(page)
inventory = {path.relative_to(EVIDENCE).as_posix(): {"bytes": path.stat().st_size,
                          "sha256": hashlib.sha256(path.read_bytes()).hexdigest()}
             for path in files}
(EVIDENCE / "evidence-inventory.json").write_text(json.dumps(inventory, indent=2) + "\n")
print(f"Gallery: {len(pairs)} before/after pairs; {len(files)} existing evidence files indexed")
