"""Create reproducible V11.4 editable-source and prebuilt Netlify archives."""
from pathlib import Path
import hashlib
import json
import os
import shutil
import zipfile

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / "dist"
OUT = ROOT / "artifacts"
NETLIFY_ARCHIVE = "pit-stop-v11-4-netlify.zip"
SOURCE_ARCHIVE = "pit-stop-v11-4-source.zip"
DOCS = [
    "README.md", "NETLIFY_DEPLOY_GUIDE.md", "ASSET_CREDITS.md", "TEST_REPORT.md",
    "SUPABASE_SETUP.sql", "V11_FIX_REPORT.md", "V11_3_DEPLOY_GUIDE.md",
    "V11_ADMIN_SETUP.md", "REFERENCE_IMPLEMENTATION_REPORT.md",
    "V11_4_FIX_REPORT.md", "V11_4_DEPLOY_GUIDE.md",
]
EXCLUDED_DIRS = {
    "node_modules", "dist", "artifacts", ".git", "coverage", "__pycache__",
    ".vite", "qa-output", ".aws", ".codex", ".agents", ".ssh", ".secrets",
    "v8-evidence", "v9-evidence", "v10-evidence",
}
CREDENTIAL_NAMES = {"credentials", "credentials.json", "secrets.json", "service-account.json"}
EXCLUDED_SUFFIXES = (".log", ".tsbuildinfo", ".zip", ".pem", ".key", ".p12", ".pfx", ".pyc")


def temporary_evidence(path):
    """Keep final captures, not raw encoder frames or duplicate browser videos."""
    relative = path.relative_to(ROOT)
    return (relative.parts[:2] == ("docs", "v11-evidence")
            and any(part == "workflow-video" or part.startswith(("sequence-", "frames-"))
                    for part in relative.parts[2:]))


def source_files():
    """Do not follow dependency symlinks or package credentials/temporary output."""
    for directory, dirs, files in os.walk(ROOT, followlinks=False):
        parent = Path(directory)
        dirs[:] = sorted(name for name in dirs
                         if name not in EXCLUDED_DIRS and not name.startswith(".env")
                         and name.lower() not in CREDENTIAL_NAMES
                         and not temporary_evidence(parent / name)
                         and not (parent / name).is_symlink())
        for name in sorted(files):
            path = parent / name
            if (path.is_symlink() or name.startswith(".env")
                    or name.lower() in CREDENTIAL_NAMES
                    or name.lower().endswith(EXCLUDED_SUFFIXES)):
                continue
            yield path


def archive(target, files, base):
    with zipfile.ZipFile(target, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as output:
        for path in sorted(files):
            info = zipfile.ZipInfo(path.relative_to(base).as_posix(), date_time=(2026, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            output.writestr(info, path.read_bytes())


if not (DIST / "index.html").is_file():
    raise SystemExit("Run npm run build before packaging.")
for name in [*DOCS, "THIRD_PARTY_NOTICES.txt"]:
    if not (ROOT / name).is_file():
        raise SystemExit(f"Missing required deliverable: {name}")
    if name.endswith(".md") and "<!-- DRAFT:" in (ROOT / name).read_text():
        raise SystemExit(f"Finalize the draft before packaging: {name}")
if (DIST / "config.js").read_bytes() != (ROOT / "public/config.js").read_bytes():
    raise SystemExit("Build config.js differs from public/config.js; rebuild before packaging.")
OUT.mkdir(exist_ok=True)
for name in ["ASSET_CREDITS.md", "THIRD_PARTY_NOTICES.txt"]:
    shutil.copyfile(ROOT / name, DIST / name)

archive(OUT / NETLIFY_ARCHIVE,
        [p for p in DIST.rglob("*") if p.is_file() and not p.is_symlink()], DIST)
archive(OUT / SOURCE_ARCHIVE, source_files(), ROOT)
for name in DOCS:
    shutil.copyfile(ROOT / name, OUT / name)
for migration in sorted((ROOT / "supabase").glob("[0-9][0-9][0-9]_*.sql")):
    if migration.name != "001_pit_crew.sql":
        shutil.copyfile(migration, OUT / migration.name)
manifest = {
    name: {"bytes": (OUT / name).stat().st_size,
           "sha256": hashlib.sha256((OUT / name).read_bytes()).hexdigest()}
    for name in [NETLIFY_ARCHIVE, SOURCE_ARCHIVE]
}
(OUT / "SHA256SUMS.json").write_text(json.dumps(manifest, indent=2) + "\n")
for name, metadata in manifest.items():
    print(f"{name}: {metadata['bytes']:,} bytes; SHA-256 {metadata['sha256']}")
