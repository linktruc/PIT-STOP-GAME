"""Verify V11.4 archive roots, resources, current editable source and evidence."""
from pathlib import Path, PurePosixPath
import hashlib
import json
import re
import zipfile

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "artifacts"
NETLIFY_ARCHIVE = "pit-stop-v11-4-netlify.zip"
SOURCE_ARCHIVE = "pit-stop-v11-4-source.zip"
FONT_LICENSES = ["Barlow-OFL.txt", "BarlowCondensed-OFL.txt", "IBMPlexMono-OFL.txt"]
EXCLUDED_PARTS = {
    "node_modules", "dist", "artifacts", ".git", "coverage", "__pycache__",
    ".vite", "qa-output", ".aws", ".codex", ".agents", ".ssh", ".secrets",
    "v8-evidence", "v9-evidence", "v10-evidence",
}
CREDENTIAL_NAMES = {"credentials", "credentials.json", "secrets.json", "service-account.json"}


def temporary_evidence(path):
    relative = path.relative_to(ROOT)
    return (relative.parts[:2] == ("docs", "v11-evidence")
            and any(part == "workflow-video" or part.startswith(("sequence-", "frames-"))
                    for part in relative.parts[2:]))


def verify_archive_paths(package):
    for name in package.namelist():
        path = PurePosixPath(name)
        assert not path.is_absolute() and ".." not in path.parts, f"Unsafe archive path: {name}"
        assert not (package.getinfo(name).external_attr >> 16) & 0o170000 == 0o120000, f"Symlink in archive: {name}"
    assert package.testzip() is None, "ZIP integrity check failed"


def is_deliverable(path):
    relative = path.relative_to(ROOT)
    return (path.is_file() and not path.is_symlink()
            and not temporary_evidence(path)
            and not set(relative.parts) & EXCLUDED_PARTS
            and not any(part.startswith(".env") for part in relative.parts)
            and path.name.lower() not in CREDENTIAL_NAMES
            and not path.name.lower().endswith((".pem", ".key", ".p12", ".pfx", ".log", ".pyc", ".tsbuildinfo", ".zip")))


with zipfile.ZipFile(OUT / NETLIFY_ARCHIVE) as package:
    names = set(package.namelist())
    verify_archive_paths(package)
    for required in ["index.html", "config.js", "_redirects", "_headers", "ASSET_CREDITS.md", "THIRD_PARTY_NOTICES.txt"]:
        assert required in names, f"Missing root file: {required}"
    assert any(name.startswith("assets/") for name in names), "Missing built assets"
    html = package.read("index.html").decode()
    for resource in re.findall(r'(?:src|href)="(/[^"?#]+)', html):
        assert resource.lstrip("/") in names, f"Missing HTML resource: {resource}"
    assert html.index('src="/config.js"') < html.index('type="module"'), "Runtime config loads after app"
    for name in names:
        if name.endswith(".css"):
            css = package.read(name).decode()
            for resource in re.findall(r"url\(['\"]?(/[^)'\"?#]+)", css):
                assert resource.lstrip("/") in names, f"Missing CSS resource: {resource}"
        if name.endswith(".js"):
            source = package.read(name).decode()
            for removed_copy in ["Sign in locally", "Local test admin", "Local Test Admin", "admin / 1234"]:
                assert removed_copy not in source, f"Removed admin UI remains in bundle: {removed_copy}"
    for name in FONT_LICENSES:
        assert f"fonts/{name}" in names, f"Missing bundled font license: {name}"
    assert any(name.startswith("fonts/") and name.endswith(".woff2") for name in names), "Missing fonts"
    config = package.read("config.js")
    assert config == (ROOT / "public/config.js").read_bytes(), "Runtime template differs"
    for field in ["window.PIT_CONFIG", "supabaseUrl", "supabaseAnonKey"]:
        assert field in config.decode(), f"Missing runtime field: {field}"
    assert not any(name.startswith("dist/") for name in names), "Extra wrapper folder in Netlify ZIP"
    print(f"PASS Netlify archive: {len(names)} files; roots, config order, assets/fonts/licenses and integrity")

with zipfile.ZipFile(OUT / SOURCE_ARCHIVE) as package:
    names = set(package.namelist())
    verify_archive_paths(package)
    for required in [
        "package.json", "package-lock.json", "index.html", "vite.config.ts", "tsconfig.json",
        "README.md", "ARCHITECTURE.md", "CONTRACT.md", "NETLIFY_DEPLOY_GUIDE.md", "SHORT_DEPLOY_GUIDE.md",
        "ASSET_CREDITS.md", "THIRD_PARTY_NOTICES.txt", "TEST_REPORT.md", "V11_FIX_REPORT.md",
        "V11_3_DEPLOY_GUIDE.md", "V11_ADMIN_SETUP.md", "REFERENCE_IMPLEMENTATION_REPORT.md",
        "public/config.js", "public/_headers", "public/_redirects", "SUPABASE_SETUP.sql",
        "supabase/001_pit_crew.sql", "supabase/002_v8_stability.sql", "supabase/003_v9_early_tap_penalty.sql",
        "supabase/004_v10_recorded_replays.sql", "supabase/README.md",
        "src/App.tsx", "src/api.ts", "src/engine.ts", "src/solo.ts",
        "src/PitScene.tsx", "src/scene/garage.ts", "src/scene/environment.ts", "src/scene/crew.ts", "src/scene/animation.ts",
        "src/ChainHUD.tsx", "src/workflow.ts", "src/ReplayEventLog.tsx", "src/ReplayView.tsx",
        "src/DesktopLiveLog.tsx", "src/v11-desktop.css",
        "src/NavigationPanel.tsx", "src/SoloRolePicker.tsx", "src/v11-4-ui.css",
        "tests/v11-4-regressions.test.tsx", "scripts/v11_4_browser_check.py",
        "V11_4_FIX_REPORT.md", "V11_4_DEPLOY_GUIDE.md",
        "docs/v11-4-evidence/browser-report.json", "docs/v11-4-evidence/validation.txt",
        "docs/v11-4-evidence/build-output.txt",
        "docs/v11-4-evidence/solo-roles-report.json", "docs/v11-4-evidence/layout-navigation-report.json",
        "docs/v11-4-evidence/visual-report.json", "docs/v11-4-evidence/hud-audit.json",
        "docs/v11-4-evidence/built-release-smoke.json", "docs/v11-4-evidence/preserved-systems.json",
        "docs/v11-4-evidence/comparison.html",
        "scripts/v11_4_visual_check.py", "scripts/v11_4_hud_audit.py", "scripts/v11_4_evidence_gallery.py",
        "src/GamePanels.tsx", "src/ActionControl.tsx", "src/RoleCard.tsx", "src/TeamPreviews.tsx",
        "src/useHudClearance.ts", "src/v11-hud.css", "src/v11-workflow.css",
        "tests/backend.test.ts", "tests/engine.test.ts", "tests/api.test.ts", "tests/helpers/database.ts",
        "tests/v9-engine.test.ts", "tests/v10-replay-database.test.ts", "tests/v10-engine-events.test.ts",
        "tests/scene-animation.test.ts", "tests/v11-arrival.test.ts", "tests/v11-bot-timing.test.ts",
        "tests/v11-choreography.test.ts", "tests/v11-hud.test.tsx", "scripts/package.py", "scripts/verify_packages.py", "scripts/BROWSER_QA.md",
        "tests/v11-desktop-log.test.tsx", "scripts/v11_mobile_clearance_check.py", "scripts/v11_desktop_layout_check.py",
        "scripts/v11_audio_keyboard_check.py",
        "scripts/v11_final_scene_layout.py", "scripts/v11_release_smoke.py",
        "docs/v11-spec/Codex_Pit_Stop_Simulator_V11_3_Merged_Master_Prompt_EN.txt",
        "docs/v11-spec/OWNER_LAYOUT_CLARIFICATION.md",
        "docs/v11-evidence/comparison.html", "docs/v11-evidence/validation.txt", "docs/v11-evidence/build-output.txt",
        "docs/v11-evidence/workflow-validation.json", "docs/v11-evidence/hud-layout-report.json",
        "docs/v11-evidence/bot-timing-report.json", "docs/v11-evidence/workflow-four-wheel-100ms-burst-and-reconnect.webm",
        "docs/v11-evidence/desktop-layout-validation.json", "docs/v11-evidence/mobile-clearance-report.json",
        "docs/v11-evidence/admin-watch-report.json", "docs/v11-evidence/admin-http-requests.json",
        "docs/v11-evidence/audio-keyboard-report.json",
        "docs/v11-evidence/final-scene-layout-report.json", "docs/v11-evidence/built-release-smoke.json",
        "docs/v11-evidence/arrival/arrival-report.json", "docs/v11-evidence/arrival/arrival-390.mp4",
        "docs/v11-evidence/choreography/report.json",
        "docs/v11-evidence/choreography/bot-4000-wait-then-work.mp4",
        "docs/v11-evidence/choreography/bot-250-wait-then-work.mp4",
        "docs/v11-evidence/choreography/gunners-loosen-handoff-tighten.mp4",
    ]:
        assert required in names, f"Missing source file: {required}"
    # Every current source/test/script/new evidence file must be included unchanged.
    for folder in ["src", "public", "tests", "scripts", "docs/v11-spec", "docs/v11-evidence", "docs/v11-4-spec", "docs/v11-4-evidence"]:
        for path in (ROOT / folder).rglob("*"):
            if is_deliverable(path):
                name = path.relative_to(ROOT).as_posix()
                assert name in names, f"Missing current file: {name}"
                assert package.read(name) == path.read_bytes(), f"Packaged file is stale: {name}"
    evidence = [name for name in names if name.startswith("docs/v11-evidence/")]
    assert any(name.endswith(".png") for name in evidence), "Missing rendered screenshot evidence"
    assert any(name.endswith(".webm") for name in evidence), "Missing captured sequence evidence"
    assert any(name.endswith(".json") for name in evidence), "Missing structured acceptance evidence"
    for name in FONT_LICENSES:
        assert f"public/fonts/{name}" in names, f"Missing source font license: {name}"
    for name in names:
        path = PurePosixPath(name)
        assert not temporary_evidence(ROOT / name), f"Temporary evidence in source archive: {name}"
        assert not set(path.parts) & EXCLUDED_PARTS, f"Excluded directory in source archive: {name}"
        assert not any(part.startswith(".env") for part in path.parts), f"Environment file in archive: {name}"
        assert path.name.lower() not in CREDENTIAL_NAMES, f"Credential file in archive: {name}"
        assert not path.name.lower().endswith((".pem", ".key", ".p12", ".pfx", ".log", ".pyc", ".tsbuildinfo", ".zip")), f"Excluded file: {name}"
    package_json = json.loads(package.read("package.json"))
    lock = json.loads(package.read("package-lock.json"))
    assert package_json["version"] == lock["version"] == lock["packages"][""]["version"] == "11.4.0", "Version mismatch"
    for migration in sorted((ROOT / "supabase").glob("[0-9][0-9][0-9]_*.sql")):
        name = f"supabase/{migration.name}"
        assert name in names and package.read(name) == migration.read_bytes(), f"Missing/stale migration: {name}"
        if migration.name != "001_pit_crew.sql":
            assert (OUT / migration.name).read_bytes() == migration.read_bytes(), f"Delivery migration differs: {migration.name}"
    assert package.read("SUPABASE_SETUP.sql") == package.read("supabase/001_pit_crew.sql"), "Fresh setup/001 differ"
    for name in ["README.md", "V11_FIX_REPORT.md", "V11_3_DEPLOY_GUIDE.md", "V11_ADMIN_SETUP.md", "TEST_REPORT.md", "V11_4_FIX_REPORT.md", "V11_4_DEPLOY_GUIDE.md"]:
        assert package.read(name) == (ROOT / name).read_bytes(), f"Stale report: {name}"
        assert "<!-- DRAFT:" not in package.read(name).decode(), f"Draft report packaged: {name}"
    print(f"PASS source archive: {len(names)} files; complete current code/tests/evidence, versions, backend and exclusions")

manifest = json.loads((OUT / "SHA256SUMS.json").read_text())
for name in [NETLIFY_ARCHIVE, SOURCE_ARCHIVE]:
    content = (OUT / name).read_bytes()
    assert manifest[name]["bytes"] == len(content), f"Manifest size mismatch: {name}"
    assert manifest[name]["sha256"] == hashlib.sha256(content).hexdigest(), f"Manifest SHA-256 mismatch: {name}"
assert (ROOT / "SUPABASE_SETUP.sql").read_bytes() == (ROOT / "supabase/001_pit_crew.sql").read_bytes(), "Fresh setup/001 differ"
print("PASS SHA-256 manifest and exact fresh backend setup/001 match")
