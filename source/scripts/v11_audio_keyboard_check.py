"""Native replay keyboard and Web Audio regression checks in the actual app.

Run against Vite dev: PIT_PREVIEW_URL=http://127.0.0.1:4190 python3 scripts/v11_audio_keyboard_check.py
The replay is a real completed TypeScript-engine round supplied through a local
API fixture. AudioContext, synthesis nodes and analyser are Chromium's native
implementations; no sound API is mocked. This cannot verify physical speakers.
"""
import json
import os
from pathlib import Path

from playwright.sync_api import expect, sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/v11-evidence'
BASE = os.environ.get('PIT_PREVIEW_URL', 'http://127.0.0.1:4190')
checks = []
errors = []


def passed(label):
    checks.append(label)
    print('PASS', label, flush=True)


INSTRUMENT_AUDIO = """() => {
  const probe = window.__nativeAudioProbe = {contexts: [], starts: 0};
  const NativeContext = window.AudioContext || window.webkitAudioContext;
  const connect = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function(target, ...args) {
    const result = connect.call(this, target, ...args);
    const info = probe.contexts.find(info => info.context === this.context);
    if (info && target === this.context.destination) connect.call(this, info.analyser);
    return result;
  };
  window.AudioContext = class extends NativeContext {
    constructor(...args) {
      super(...args);
      const analyser = this.createAnalyser(); analyser.fftSize = 2048;
      probe.contexts.push({context: this, analyser});
      for (const method of ['createOscillator', 'createBufferSource']) {
        const create = this[method].bind(this);
        this[method] = (...args) => {
          const node = create(...args); const start = node.start.bind(node);
          node.start = (...args) => { probe.starts++; return start(...args); };
          return node;
        };
      }
    }
  };
  window.__sampleAudio = async () => {
    let rms = 0, peak = 0;
    for (let frame = 0; frame < 12; frame++) {
      const info = probe.contexts[0];
      if (info) {
        const data = new Float32Array(info.analyser.fftSize);
        info.analyser.getFloatTimeDomainData(data);
        rms = Math.max(rms, Math.sqrt(data.reduce((sum, value) => sum + value * value, 0) / data.length));
        peak = Math.max(peak, ...data.map(value => Math.abs(value)));
      }
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    return {rms, peak, starts: probe.starts, state: probe.contexts[0]?.context.state};
  };
}"""

FIXTURE = """async () => {
  const {ROLES} = await import('/src/types.ts');
  const {createRound, reconcile, submitAction} = await import('/src/engine.ts');
  const goAt = Date.now() - 20000;
  const players = ROLES.map((role, index) => ({id: 'keyboard-' + index, nickname: 'Crew ' + index, role, ready: true, joinedAt: index, connected: true}));
  const round = createRound(players, goAt, 'native-keyboard-round');
  reconcile(round, goAt);
  let at = goAt;
  for (let index = 0; index < 21; index++) {
    const task = round.tasks.find(task => task.status === 'AVAILABLE');
    at = Math.max(at, task.enabledAt) + 200;
    submitAction(round, task.ownerId, task.id, at, 'keyboard-' + index);
  }
  const room = {id: 'keyboard-room', teamId: 'keyboard-team', name: 'Keyboard Crew', color: '#ee4035', code: 'KEYS', hostId: players[0].id, players, status: 'COMPLETED', round, updatedAt: at};
  const record = {roundId: round.id, teamId: room.teamId, teamName: room.name, color: room.color, players, round};
  const summary = {roundId: round.id, teamId: room.teamId, teamName: room.name, color: room.color, elapsedMs: round.elapsedMs, finishedAt: round.finishedAt};
  const moduleURL = [...performance.getEntriesByType('resource')].find(entry => new URL(entry.name).pathname === '/src/api.ts').name;
  const {api} = await import(moduleURL);
  api.getState = async () => ({local: true, rooms: [structuredClone(room)], leaderboard: [], replays: [summary], serverNow: Date.now(), identity: {playerId: null, isAdmin: false}});
  api.call = async () => api.getState();
  api.getReplay = async () => structuredClone(record);
  const audioURL = [...performance.getEntriesByType('resource')].find(entry => new URL(entry.name).pathname === '/src/audio.ts').name;
  window.__actualAudio = await import(audioURL);
  window.dispatchEvent(new Event('online'));
  return {events: round.events.length, elapsedMs: round.elapsedMs};
}"""


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(
        executable_path='/usr/bin/chromium', headless=True,
        args=['--no-sandbox', '--disable-dev-shm-usage', '--disable-webgl'],
    )
    try:
        page = browser.new_page(viewport={'width': 1366, 'height': 768})
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.add_init_script('(' + INSTRUMENT_AUDIO + ')()')
        page.goto(BASE)
        expect(page.locator('.main-menu')).to_be_visible()
        assert page.evaluate('window.__nativeAudioProbe.contexts.length') == 0
        fixture = page.evaluate(FIXTURE)
        assert fixture['events'] == 21
        page.get_by_role('button', name='Watch Live', exact=False).click()
        expect(page.locator('.finished-team')).to_have_count(1)
        expect(page.locator('.sound-control')).to_have_attribute('data-audio-state', 'running')
        unlocked = page.evaluate('window.__sampleAudio()')
        assert unlocked['state'] == 'running' and unlocked['rms'] > 0.00001, unlocked
        passed('Audio stays dormant before a gesture, then the actual Watch click unlocks native audio with measurable output')

        task_audio = []
        for task_id in ['FL_GUN_LOOSEN', 'RR_GUN_TIGHTEN', 'FRONT_LIFT', 'REAR_LOWER', 'RL_WHEEL_OFF', 'FR_WHEEL_ON', 'GREEN_RELEASE']:
            page.wait_for_timeout(400)
            before = page.evaluate('window.__nativeAudioProbe.starts')
            page.evaluate('task => window.__actualAudio.playTaskCue(task)', task_id)
            sample = page.evaluate('window.__sampleAudio()')
            assert sample['rms'] > 0.0001 and sample['starts'] > before, (task_id, sample)
            task_audio.append(dict(taskId=task_id, **sample))
        passed('Native synthesized loosen/tighten, lift/lower, wheel off/on and release cues all produce nonzero output')

        page.get_by_role('button', name='Mute sound', exact=True).click()
        page.wait_for_timeout(150)
        before = page.evaluate('window.__nativeAudioProbe.starts')
        page.evaluate("window.__actualAudio.playTaskCue('FL_GUN_LOOSEN')")
        muted = page.evaluate('window.__sampleAudio()')
        assert muted['rms'] < 0.000001 and muted['starts'] == before, muted
        expect(page.locator('.sound-control')).to_have_attribute('data-audio-state', 'muted')
        page.get_by_role('button', name='Enable sound', exact=True).click()
        expect(page.locator('.sound-control')).to_have_attribute('data-audio-state', 'running')
        page.evaluate('window.__actualAudio.setVolume(0)')
        page.wait_for_timeout(400)
        zero_volume = page.evaluate('window.__sampleAudio()')
        assert zero_volume['rms'] < 0.000001, zero_volume
        page.evaluate('window.__actualAudio.setVolume(0.7)')
        passed('Mute stops current sources and blocks new task sounds; native output at zero master volume is silent')

        page.locator('.finished-team').get_by_role('button', name='Replay', exact=True).click()
        replay = page.locator('.replay-view')
        expect(replay).to_be_visible()
        expect(replay).to_have_attribute('data-replay-playing', 'true')
        page.locator('body').evaluate('(body) => { document.activeElement.blur(); body.focus(); }')
        page.keyboard.press('Space')
        expect(replay).to_have_attribute('data-replay-playing', 'false')
        paused_cursor = int(replay.get_attribute('data-replay-cursor'))
        page.wait_for_timeout(100)
        assert int(replay.get_attribute('data-replay-cursor')) == paused_cursor
        page.keyboard.press('Space')
        expect(replay).to_have_attribute('data-replay-playing', 'true')
        page.evaluate("window.dispatchEvent(new KeyboardEvent('keydown', {code: 'Space', key: ' ', repeat: true, bubbles: true}))")
        expect(replay).to_have_attribute('data-replay-playing', 'true')
        passed('Free Space pauses/resumes the replay; held-key repeat does not repeatedly toggle playback')

        replay.get_by_role('button', name='Restart', exact=True).focus()
        page.keyboard.press('Space')
        expect(replay).to_have_attribute('data-replay-playing', 'true')
        assert int(replay.get_attribute('data-replay-cursor')) < -2000
        replay.get_by_role('button', name='Playback speed 1 times', exact=True).focus()
        page.keyboard.press('Space')
        expect(replay.get_by_role('button', name='Playback speed 2 times', exact=True)).to_be_visible()
        replay.get_by_role('button', name='Event Log', exact=True).focus()
        page.keyboard.press('Space')
        expect(page.locator('.replay-log-drawer')).to_be_visible()
        expect(page.locator('.replay-event-table tbody tr')).to_have_count(21)
        page.keyboard.press('Escape')
        expect(page.locator('.replay-log-drawer')).to_have_count(0)
        expect(replay).to_be_visible()
        replay.get_by_role('button', name='Close replay', exact=True).focus()
        page.keyboard.press('Space')
        expect(replay).to_have_count(0)
        passed('Focused Restart, speed, Event Log and Close replay buttons retain native Space activation; Escape closes only the Event Log first')

        assert not errors, errors
        OUT.mkdir(exist_ok=True)
        (OUT / 'audio-keyboard-report.json').write_text(json.dumps({
            'checks': checks, 'fixture': fixture, 'unlocked': unlocked,
            'nativeTaskAudio': task_audio, 'muted': muted, 'zeroVolume': zero_volume,
            'javascriptErrors': errors,
            'scope': 'Actual React App/ReplayView controls and native Chromium Web Audio. A completed 21-event TypeScript-engine round is supplied through a local API fixture. WebGL disabled to isolate controls/audio. Measured digital output proves synthesis and mute behavior; physical speaker audibility, Safari autoplay and hosted Supabase are not tested here.',
        }, indent=2))
    finally:
        browser.close()
