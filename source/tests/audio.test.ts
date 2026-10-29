import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type AudioModule = typeof import('../src/audio');
class Param {
  value = 0;
  setValueAtTime = vi.fn((value: number, _at: number) => { this.value = value; });
  linearRampToValueAtTime = vi.fn((value: number, _at: number) => { this.value = value; });
  exponentialRampToValueAtTime = vi.fn((value: number, _at: number) => { this.value = value; });
  setTargetAtTime = vi.fn((value: number, _at: number, _constant: number) => { this.value = value; });
  cancelScheduledValues = vi.fn();
}
class Node {
  connect = vi.fn();
  disconnect = vi.fn();
}
class Gain extends Node { gain = new Param(); }
class Filter extends Node { type = ''; frequency = new Param(); Q = new Param(); }
class Stereo extends Node { pan = new Param(); }
class Source extends Node {
  offset = new Param();
  type = '';
  frequency = new Param();
  buffer: unknown;
  loop = false;
  onended: (() => void) | null = null;
  start = vi.fn();
  stop = vi.fn();
}
class Compressor extends Node {
  threshold = new Param(); knee = new Param(); ratio = new Param(); attack = new Param(); release = new Param();
}
class TestContext {
  static instances: TestContext[] = [];
  currentTime = 10;
  sampleRate = 100;
  state = 'suspended';
  destination = new Node();
  gains: Gain[] = [];
  filters: Filter[] = [];
  oscillators: Source[] = [];
  buffers: Source[] = [];
  constants: Source[] = [];
  panners: Stereo[] = [];
  compressor = new Compressor();
  resume = vi.fn(() => { this.state = 'running'; return Promise.resolve(); });
  decodeAudioData = vi.fn(async (_bytes: ArrayBuffer) => ({ duration: 11.694 }));
  constructor() { TestContext.instances.push(this); }
  createGain() { const gain = new Gain(); this.gains.push(gain); return gain; }
  createBiquadFilter() { const filter = new Filter(); this.filters.push(filter); return filter; }
  createOscillator() { const oscillator = new Source(); this.oscillators.push(oscillator); return oscillator; }
  createBufferSource() { const buffer = new Source(); this.buffers.push(buffer); return buffer; }
  createConstantSource() { const source = new Source(); this.constants.push(source); return source; }
  createStereoPanner() { const node = new Stereo(); this.panners.push(node); return node; }
  createDynamicsCompressor() { return this.compressor; }
  createBuffer(_channels: number, size: number, _rate: number) { return { getChannelData: () => new Float32Array(size) }; }
}

let audio: AudioModule;
async function enable() {
  audio.setAudioEnabled(true);
  await Promise.resolve();
  for (let i=0;i<12;i++) await Promise.resolve();
  return TestContext.instances[0];
}

beforeEach(async () => {
  vi.useFakeTimers();
  vi.resetModules();
  TestContext.instances = [];
  vi.stubGlobal('window', { AudioContext: TestContext });
  vi.stubGlobal('fetch', vi.fn(async () => ({ok: true, arrayBuffer: async () => new ArrayBuffer(32)})));
  audio = await import('../src/audio');
});
afterEach(() => {
  audio.setAudioEnabled(false);
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('gesture-unlocked game effects and seamless recorded ambience', () => {
  it('stays dormant before interaction and resumes directly inside the gesture with an audible default', async () => {
    expect(audio.getAudioState()).toEqual({ enabled: false, volume: 0.7, running: false });
    audio.playCue('go');
    expect(TestContext.instances).toHaveLength(0);
    audio.setAudioEnabled(true);
    const context = TestContext.instances[0];
    expect(context.resume).toHaveBeenCalledOnce();
    expect(audio.getAudioState()).toEqual({ enabled: true, volume: 0.7, running: true });
    await Promise.resolve();
    expect(context.gains[0].gain.value).toBe(0.7);
    expect(context.gains[1].gain.value).toBe(1);
    expect(context.gains[2].gain.value).toBe(0.14);
    expect(context.gains[0].connect).toHaveBeenCalledWith(context.compressor);
    expect(context.compressor.connect).toHaveBeenCalledWith(context.gains[3]);
    expect(context.gains[3].gain.value).toBe(0.8);
    expect(context.gains[3].connect).toHaveBeenCalledWith(context.destination);
    for(let i=0;i<12;i++) await Promise.resolve();
    expect(context.buffers).toHaveLength(1);
    expect(context.buffers[0].loop).toBe(true);
    expect(context.buffers[0].start).toHaveBeenCalledOnce();
    expect(context.oscillators).toHaveLength(0);
  });

  it('applies volume to every bus and keeps volume changes silent while muted', async () => {
    const context = await enable();
    audio.setVolume(0.35);
    expect(audio.getAudioState().volume).toBe(0.35);
    expect(context.gains[0].gain.value).toBe(0.35);
    audio.setVolume(-8);
    expect(audio.getAudioState().volume).toBe(0);
    audio.setVolume(8);
    audio.setVolume(Number.NaN);
    expect(audio.getAudioState().volume).toBe(1);
    audio.setAudioEnabled(false);
    audio.setVolume(0.4);
    expect(context.gains[0].gain.value).toBe(0);
    expect(audio.getAudioState()).toEqual({ enabled: false, volume: 0.4, running: false });
    audio.setAudioEnabled(true);
    expect(context.gains[0].gain.value).toBe(0.4);
  });

  it('stops live sounds and ambient timers on mute, without stacking ambience on repeated enable', async () => {
    const context = await enable();
    const initialSources = context.oscillators.length + context.buffers.length;
    audio.setAudioEnabled(true);
    for(let i=0;i<12;i++) await Promise.resolve();
    expect(context.oscillators.length + context.buffers.length).toBe(initialSources);
    expect(context.buffers).toHaveLength(1);
    expect(vi.getTimerCount()).toBe(0);
    audio.playCue('gun');
    const sources = [...context.oscillators, ...context.buffers, ...context.constants];
    audio.setAudioEnabled(false);
    for (const source of sources) expect(source.stop).toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
    const mutedCount = context.oscillators.length + context.buffers.length;
    vi.advanceTimersByTime(30_000);
    audio.playCue('release');
    expect(context.oscillators.length + context.buffers.length).toBe(mutedCount);
  });

  it('uses different physical sound envelopes for gun, jack, tire removal, placement, and release', async () => {
    const context = await enable();
    function signature(taskId: string) {
      const oscillatorStart = context.oscillators.length;
      const bufferStart = context.buffers.length;
      audio.playTaskCue(taskId);
      return {
        tones: context.oscillators.slice(oscillatorStart),
        noise: context.buffers.slice(bufferStart),
      };
    }
    const gun = signature('FL_GUN_LOOSEN');
    expect(gun.tones).toHaveLength(8);
    expect(gun.noise).toHaveLength(8);
    const tightened = signature('RR_GUN_TIGHTEN');
    expect(tightened.tones[0].frequency.setValueAtTime.mock.calls[0][0]).toBeGreaterThan(gun.tones[0].frequency.setValueAtTime.mock.calls[0][0]);
    const lift = signature('FRONT_LIFT');
    expect(lift.tones).toHaveLength(3);
    expect(lift.tones[0].frequency.exponentialRampToValueAtTime.mock.calls[0][0]).toBe(128);
    const lower = signature('REAR_LOWER');
    expect(lower.tones[0].frequency.exponentialRampToValueAtTime.mock.calls[0][0]).toBe(58);
    const removed = signature('RL_WHEEL_OFF');
    const placed = signature('FR_WHEEL_ON');
    expect(removed.tones[0].frequency.setValueAtTime.mock.calls[0][0]).toBe(112);
    expect(placed.tones[0].frequency.setValueAtTime.mock.calls[0][0]).toBe(82);
    const release = signature('GREEN_RELEASE');
    expect(release.tones).toHaveLength(6);
    expect(release.tones[1].frequency.exponentialRampToValueAtTime.mock.calls[0][0]).toBe(440);
  });

  it('provides audible countdown, ready, available, input, completion, and UI cues', async () => {
    const context = await enable();
    const cues = ['action', 'go', 'release', 'countdown', 'ready', 'available', 'complete', 'click', 'hover', 'gun', 'jack', 'wheelOff', 'wheelOn'] as const;
    for (const cue of cues) {
      const sources = context.oscillators.length + context.buffers.length;
      audio.playCue(cue);
      expect(context.oscillators.length + context.buffers.length).toBeGreaterThan(sources);
    }
    audio.setVolume(0);
    const sources = context.oscillators.length + context.buffers.length;
    audio.playCue('go');
    audio.playTaskCue('FRONT_LIFT');
    expect(context.oscillators.length + context.buffers.length).toBe(sources);
  });

  it('reports unsupported audio and failed browser resumes as disabled', async () => {
    vi.stubGlobal('window', {});
    audio.setAudioEnabled(true);
    expect(audio.getAudioState()).toEqual({ enabled: false, volume: 0.7, running: false });
    vi.stubGlobal('window', { AudioContext: TestContext });
    const context = await enable();
    audio.setAudioEnabled(false);
    context.state = 'suspended';
    context.resume.mockImplementation(() => Promise.reject(new Error('Autoplay blocked')));
    audio.setAudioEnabled(true);
    await Promise.resolve();
    await Promise.resolve();
    expect(audio.getAudioState()).toEqual({ enabled: false, volume: 0.7, running: false });
    expect(context.gains[0].gain.value).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });
});
