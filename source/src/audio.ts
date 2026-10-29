/** Pit-stop effects are procedural; the quiet crowd ambience is the user-provided recording, loop-edited for the simulator. */
export type AudioCue = 'error' | 'action' | 'go' | 'release' | 'countdown' | 'ready' | 'available' | 'complete' | 'click' | 'hover' | 'gun' | 'jack' | 'wheelOff' | 'wheelOn';
type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext };
type SoundSource = AudioBufferSourceNode | OscillatorNode | ConstantSourceNode;

let context: AudioContext | null = null;
let master: GainNode | null = null;
let effects: GainNode | null = null;
let ambience: GainNode | null = null;
let noise: AudioBuffer | null = null;
let enabled = false;
let volume = 0.7;
let crowdBuffer: AudioBuffer | null = null;
let crowdLoad: Promise<AudioBuffer | null> | null = null;
let crowdSource: AudioBufferSourceNode | null = null;
let ambienceGeneration = 0;
const liveSources = new Set<SoundSource>();

function track(source: SoundSource, nodes: AudioNode[]): void {
  liveSources.add(source);
  source.onended = () => {
    liveSources.delete(source);
    source.disconnect();
    nodes.forEach((node) => node.disconnect());
  };
}

function tone(frequency: number, at: number, duration: number, gain: number, type: OscillatorType = 'sine', endFrequency?: number, bus = effects): void {
  if (!context || !bus) return;
  const oscillator = context.createOscillator();
  const envelope = context.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, at);
  if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, at + duration);
  envelope.gain.setValueAtTime(0.0001, at);
  envelope.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), at + Math.min(0.008, duration / 3));
  envelope.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  oscillator.connect(envelope);
  envelope.connect(bus);
  track(oscillator, [envelope]);
  oscillator.start(at);
  oscillator.stop(at + duration + 0.015);
}

function hiss(at: number, duration: number, gain: number, frequency: number, bus = effects): void {
  if (!context || !bus || !noise) return;
  const source = context.createBufferSource();
  const filter = context.createBiquadFilter();
  const envelope = context.createGain();
  source.buffer = noise;
  filter.type = 'bandpass';
  filter.frequency.value = frequency;
  filter.Q.value = 0.75;
  envelope.gain.setValueAtTime(0.0001, at);
  envelope.gain.exponentialRampToValueAtTime(gain, at + Math.min(0.012, duration / 3));
  envelope.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  source.connect(filter);
  filter.connect(envelope);
  envelope.connect(bus);
  track(source, [filter, envelope]);
  source.start(at);
  source.stop(at + duration + 0.015);
}

function stopSounds(): void {
  // Invalidate an in-flight download so a stale callback cannot restart music after mute.
  ambienceGeneration++;
  crowdSource = null;
  for (const source of liveSources) {
    try { source.stop(); } catch { /* A source may have ended between frames. */ }
    source.disconnect();
  }
  liveSources.clear();
}

/** Load once and keep the decoded PCM in memory. Web Audio's sample-boundary looping
 * has no HTML <audio> playback gap; source material is crossfaded at the seam.
 * The low ambience-bus gain leaves the wheel-gun/action effects clearly audible.
 */
function loadCrowd(): Promise<AudioBuffer | null> {
  if (crowdBuffer) return Promise.resolve(crowdBuffer);
  if (crowdLoad) return crowdLoad;
  if (!context || typeof fetch !== 'function') return Promise.resolve(null);
  const audioContext = context;
  crowdLoad = fetch('/audio/pit-crowd-loop.wav', { cache: 'force-cache' })
    .then(response => { if (!response.ok) throw new Error('Crowd audio unavailable'); return response.arrayBuffer(); })
    .then(bytes => audioContext.decodeAudioData(bytes))
    .then(buffer => { crowdBuffer = buffer; return buffer; })
    .catch(() => null)
    .finally(() => { crowdLoad = null; });
  return crowdLoad;
}
function startAmbience(): void {
  if (!context || !ambience || !enabled || context.state !== 'running' || crowdSource) return;
  // Gain is independent of the main sound-effects volume. Intentionally quiet.
  ambience.gain.setValueAtTime(0.14, context.currentTime);
  const generation = ambienceGeneration;
  const audioContext = context;
  void loadCrowd().then(buffer => {
    if (!buffer || !enabled || !context || context !== audioContext ||
        !ambience || ambienceGeneration !== generation || context.state !== 'running' || crowdSource) return;
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(ambience);
    crowdSource = source;
    liveSources.add(source);
    source.onended = () => {
      if (crowdSource === source) crowdSource = null;
      liveSources.delete(source);
      source.disconnect();
    };
    source.start(context.currentTime + 0.015);
  });
}

function initialize(): boolean {
  if (context) return true;
  if (typeof window === 'undefined') return false;
  const Constructor = window.AudioContext || (window as AudioWindow).webkitAudioContext;
  if (!Constructor) return false;
  context = new Constructor();
  master = context.createGain();
  effects = context.createGain();
  ambience = context.createGain();
  master.gain.value = 0;
  effects.gain.value = 1;
  ambience.gain.value = 0.12;
  const compressor = context.createDynamicsCompressor();
  compressor.threshold.value = -15;
  compressor.knee.value = 18;
  compressor.ratio.value = 5;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.18;
  effects.connect(master);
  ambience.connect(master);
  master.connect(compressor);
  // Leave output headroom for several parallel wheel-gun transients at 100%.
  const output = context.createGain();
  output.gain.value = 0.8;
  compressor.connect(output);
  output.connect(context.destination);
  noise = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return true;
}

/** Call in the interaction handler: resume() must run while the browser's gesture is active. */
export function setAudioEnabled(value: boolean): void {
  enabled = value;
  if (!value) {
    if (context && master) {
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.setValueAtTime(0, context.currentTime);
    }
    stopSounds();
    return;
  }
  try {
    if (!initialize() || !context || !master) { enabled = false; return; }
    const audioContext = context;
    // Do not defer this call to a timer/effect: Safari requires the direct user gesture.
    const resumed = audioContext.resume();
    master.gain.cancelScheduledValues(audioContext.currentTime);
    master.gain.setTargetAtTime(volume, audioContext.currentTime, 0.025);
    if (audioContext.state === 'running') startAmbience();
    void resumed.then(() => {
      if (enabled && context === audioContext && audioContext.state === 'running') startAmbience();
    }).catch(() => { if (context === audioContext) setAudioEnabled(false); });
  } catch {
    enabled = false;
    stopSounds();
    if (master) master.gain.value = 0;
  }
}

/** One volume control applies to every effect and the ambient bus, including active sounds. */
export function setVolume(value: number): void {
  if (!Number.isFinite(value)) return;
  volume = Math.min(1, Math.max(0, value));
  if (master && context) {
    master.gain.cancelScheduledValues(context.currentTime);
    master.gain.setTargetAtTime(enabled ? volume : 0, context.currentTime, 0.025);
  }
}

export function getAudioState(): { enabled: boolean; volume: number; running: boolean } {
  return { enabled, volume, running: enabled && context?.state === 'running' };
}

function wheelGun(at: number, tighten = false): void {
  // Distinct compressed-air burst, hard metallic ratchets, then the locking clunk.
  hiss(at, 0.28, 0.8, 2700);
  for (let i = 0; i < 7; i++) {
    const offset = i * 0.032;
    tone((tighten ? 168 : 134) + i * 7, at + offset, 0.035, 0.26, 'square');
    hiss(at + offset, 0.026, 0.36, 3900);
  }
  tone(102, at + 0.22, 0.15, 0.55, 'triangle', 48);
}

function jack(at: number, lower = false): void {
  tone(lower ? 135 : 66, at, 0.46, 0.2, 'sawtooth', lower ? 58 : 128);
  tone(lower ? 190 : 100, at + 0.02, 0.35, 0.14, 'triangle', lower ? 83 : 165);
  hiss(at + 0.04, 0.46, 0.45, lower ? 1600 : 2100);
  tone(lower ? 78 : 110, at + 0.43, 0.12, 0.45, 'sine', 42);
}

export function playCue(kind: AudioCue): void {
  if (!enabled || !context || context.state !== 'running' || volume === 0) return;
  const at = context.currentTime + 0.005;
  switch (kind) {
    case 'error':
      tone(240, at, .13, .35, 'triangle', 135);
      tone(150, at + .08, .11, .2, 'sine');
      break;
    case 'hover':
      tone(720, at, 0.03, 0.065, 'sine');
      break;
    case 'click':
      tone(580, at, 0.045, 0.19, 'triangle', 360);
      hiss(at, 0.025, 0.09, 3400);
      break;
    case 'action':
      tone(620, at, 0.075, 0.25, 'triangle', 950);
      tone(1240, at + 0.025, 0.07, 0.11, 'sine');
      break;
    case 'ready':
      tone(659.25, at, 0.12, 0.34, 'triangle');
      tone(987.77, at + 0.07, 0.2, 0.3, 'sine');
      break;
    case 'available':
      tone(739.99, at, 0.1, 0.31, 'sine');
      tone(1108.73, at + 0.07, 0.18, 0.32, 'sine');
      break;
    case 'complete':
      tone(1396.91, at, 0.065, 0.2, 'triangle');
      tone(2093, at + 0.01, 0.04, 0.065, 'sine');
      break;
    case 'countdown':
      tone(440, at, 0.17, 0.52, 'sine');
      tone(880, at, 0.075, 0.12, 'triangle');
      break;
    case 'go':
      tone(880, at, 0.38, 0.5, 'sine');
      tone(1320, at + 0.045, 0.3, 0.28, 'triangle');
      hiss(at + 0.02, 0.14, 0.15, 3300);
      break;
    case 'gun': wheelGun(at); break;
    case 'jack': jack(at); break;
    case 'wheelOff':
      hiss(at, 0.32, 0.7, 680);
      tone(112, at, 0.16, 0.4, 'triangle', 60);
      tone(53, at + 0.14, 0.3, 0.35, 'sine', 38);
      hiss(at + 0.13, 0.2, 0.3, 1450);
      break;
    case 'wheelOn':
      hiss(at, 0.11, 0.45, 500);
      tone(82, at, 0.24, 0.75, 'sine', 38);
      tone(174, at + 0.045, 0.15, 0.23, 'triangle', 90);
      hiss(at + 0.075, 0.065, 0.2, 2600);
      break;
    case 'release':
      tone(68, at, 0.95, 0.24, 'sawtooth', 235);
      tone(96, at, 1.12, 0.35, 'triangle', 440);
      hiss(at + 0.1, 0.95, 0.3, 1250);
      [392, 493.88, 587.33, 783.99].forEach((note, index) => tone(note, at + 0.1 + index * 0.085, 0.45, 0.22, 'triangle'));
      break;
  }
}

/** Task IDs come from the authoritative round, so human and bot operations sound identical. */
export function playTaskCue(taskId: string): void {
  if (!enabled || !context || context.state !== 'running' || volume === 0) return;
  const at = context.currentTime + 0.005;
  if (taskId.endsWith('_GUN_TIGHTEN')) wheelGun(at, true);
  else if (taskId.endsWith('_GUN_LOOSEN')) wheelGun(at);
  else if (taskId.endsWith('_LIFT')) jack(at);
  else if (taskId.endsWith('_LOWER')) jack(at, true);
  else if (taskId.endsWith('_WHEEL_OFF')) playCue('wheelOff');
  else if (taskId.endsWith('_WHEEL_ON')) playCue('wheelOn');
  else if (taskId === 'GREEN_RELEASE') playCue('release');
  else playCue('complete');
}
