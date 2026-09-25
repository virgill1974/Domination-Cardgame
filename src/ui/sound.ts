// Soundeffekte: liegt public/sounds/<name>.mp3 vor, wird das Sample gespielt, sonst ein synthetischer Klang.

export const SOUND_NAMES = [
  'click', 'scan', 'error', 'buy', 'activate', 'bonus', 'medal', 'repair', 'turn', 'overload',
  'dice', 'hit', 'miss', 'explosion', 'superweapon', 'victory',
] as const;
export type SoundName = (typeof SOUND_NAMES)[number];

type Synth = (c: BaseAudioContext, out: AudioNode, t: number) => void;
export type Channel = 'sfx' | 'music';

const STORAGE_KEY = 'cnc-kartenspiel-volume';
const LEGACY_KEY = 'cnc-kartenspiel-sound';
const MAX_GAIN = 1.2;
const volumes = readVolumes();
let ctx: AudioContext | null = null;
let buses: Record<Channel, GainNode> | null = null;
const samples = new Map<SoundName, AudioBuffer | null>();

function readVolumes(): Record<Channel, number> {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    if (typeof saved?.sfx === 'number' && typeof saved?.music === 'number') return saved;
    if (localStorage.getItem(LEGACY_KEY) === 'off') return { sfx: 0, music: 0 };
  } catch {
    // ohne Speicher gelten die Standardwerte
  }
  return { sfx: 0.8, music: 0.5 };
}

/** Quadratisch, damit der Regler sich gehörrichtig anfühlt. */
const gainFor = (volume: number) => volume * volume * MAX_GAIN;

export const getVolume = (channel: Channel) => volumes[channel];

export function setVolume(channel: Channel, volume: number) {
  volumes[channel] = volume;
  if (ctx && buses) buses[channel].gain.setTargetAtTime(gainFor(volume), ctx.currentTime, 0.05);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(volumes));
  } catch {
    // Einstellung gilt dann nur bis zum Neuladen
  }
}

export function audio(): AudioContext | null {
  if (!ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      return null;
    }
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -10;
    limiter.ratio.value = 8;
    limiter.connect(ctx.destination);
    const c = ctx;
    const makeBus = (channel: Channel) => {
      const gain = c.createGain();
      gain.gain.value = gainFor(volumes[channel]);
      gain.connect(limiter);
      return gain;
    };
    buses = { sfx: makeBus('sfx'), music: makeBus('music') };
    for (const name of SOUND_NAMES) {
      fetch(`sounds/${name}.mp3`)
        .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject()))
        .then((data) => ctx!.decodeAudioData(data))
        .then((buffer) => samples.set(name, buffer))
        .catch(() => samples.set(name, null));
    }
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** Muss aus einer Nutzerinteraktion heraus aufgerufen werden (iOS gibt Audio sonst nicht frei). */
export const unlockAudio = () => void audio();

export const bus = (channel: Channel): GainNode | null => (audio() ? buses![channel] : null);

export function play(name: SoundName, delay = 0) {
  if (volumes.sfx === 0) return;
  const c = audio();
  if (!c || !buses) return;
  const t = c.currentTime + delay;
  const sample = samples.get(name);
  if (sample) {
    const src = c.createBufferSource();
    src.buffer = sample;
    src.connect(buses.sfx);
    src.start(t);
    return;
  }
  SYNTHS[name](c, buses.sfx, t);
}

// ---------- Bausteine ----------

interface ToneOpts {
  type?: OscillatorType;
  vol?: number;
  attack?: number;
  to?: number;
  cutoff?: number;
  detune?: number;
}

function tone(c: BaseAudioContext, out: AudioNode, t: number, freq: number, dur: number, o: ToneOpts = {}) {
  const osc = c.createOscillator();
  osc.type = o.type ?? 'sine';
  osc.frequency.setValueAtTime(freq, t);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
  if (o.detune) osc.detune.value = o.detune;
  const gain = envelope(c, t, dur, o.vol ?? 0.2, o.attack ?? 0.005);
  let node: AudioNode = osc;
  if (o.cutoff) {
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = o.cutoff;
    node.connect(f);
    node = f;
  }
  node.connect(gain).connect(out);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

function envelope(c: BaseAudioContext, t: number, dur: number, vol: number, attack: number) {
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  return gain;
}

const noiseBuffers = new WeakMap<BaseAudioContext, AudioBuffer>();

interface NoiseOpts {
  vol?: number;
  attack?: number;
  filter?: BiquadFilterType;
  from?: number;
  to?: number;
  q?: number;
}

function noise(c: BaseAudioContext, out: AudioNode, t: number, dur: number, o: NoiseOpts = {}) {
  let buffer = noiseBuffers.get(c);
  if (!buffer) {
    buffer = c.createBuffer(1, c.sampleRate * 2, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noiseBuffers.set(c, buffer);
  }
  const src = c.createBufferSource();
  src.buffer = buffer;
  const f = c.createBiquadFilter();
  f.type = o.filter ?? 'lowpass';
  f.Q.value = o.q ?? 1;
  f.frequency.setValueAtTime(o.from ?? 2000, t);
  if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t + dur);
  src.connect(f).connect(envelope(c, t, dur, o.vol ?? 0.3, o.attack ?? 0.005)).connect(out);
  src.start(t);
  src.stop(t + dur + 0.05);
}

/** Blechbläser: zwei leicht verstimmte Sägezähne mit sich öffnendem Filter. */
function brass(c: BaseAudioContext, out: AudioNode, t: number, freq: number, dur: number, vol = 0.09) {
  const f = c.createBiquadFilter();
  f.type = 'lowpass';
  f.Q.value = 2;
  f.frequency.setValueAtTime(300, t);
  f.frequency.exponentialRampToValueAtTime(2800, t + 0.06);
  f.frequency.exponentialRampToValueAtTime(1400, t + Math.min(dur, 0.4));
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.03);
  gain.gain.setValueAtTime(vol, t + dur * 0.7);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  f.connect(gain).connect(out);
  for (const detune of [-7, 7]) {
    const osc = c.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    osc.detune.value = detune;
    osc.connect(f);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }
}

const arpeggio = (c: BaseAudioContext, out: AudioNode, t: number, freqs: number[], step: number, o: ToneOpts & { dur: number }) =>
  freqs.forEach((f, i) => tone(c, out, t + i * step, f, o.dur, o));

function explosion(c: BaseAudioContext, out: AudioNode, t: number, size = 1) {
  noise(c, out, t, 1.3 * size, { vol: 0.5, from: 2500, to: 60 });
  tone(c, out, t, 90, 1.0 * size, { vol: 0.5, to: 28 });
  noise(c, out, t + 0.05, 0.4, { vol: 0.2, filter: 'highpass', from: 3000 });
}

// ---------- Klänge ----------

export const SYNTHS: Record<SoundName, Synth> = {
  click: (c, o, t) => tone(c, o, t, 1500, 0.035, { type: 'triangle', vol: 0.12 }),
  scan: (c, o, t) => tone(c, o, t, 1760, 0.12, { type: 'square', vol: 0.08, cutoff: 4000 }),
  error: (c, o, t) => {
    tone(c, o, t, 310, 0.13, { type: 'square', vol: 0.12, cutoff: 2000 });
    tone(c, o, t + 0.14, 200, 0.22, { type: 'square', vol: 0.12, cutoff: 2000 });
  },
  buy: (c, o, t) => {
    noise(c, o, t, 0.05, { vol: 0.2, filter: 'highpass', from: 4000 });
    tone(c, o, t + 0.02, 988, 0.09, { type: 'square', vol: 0.08, cutoff: 5000 });
    tone(c, o, t + 0.1, 1319, 0.35, { type: 'square', vol: 0.08, cutoff: 5000 });
  },
  activate: (c, o, t) => arpeggio(c, o, t, [523, 659, 784, 1047], 0.08, { type: 'triangle', dur: 0.18, vol: 0.18 }),
  bonus: (c, o, t) => {
    arpeggio(c, o, t, [784, 988, 1175, 1568, 1976], 0.06, { dur: 0.35, vol: 0.15 });
    arpeggio(c, o, t + 0.03, [1568, 1976, 2349, 3136], 0.07, { type: 'triangle', dur: 0.2, vol: 0.05 });
  },
  medal: (c, o, t) => {
    brass(c, o, t, 392, 0.22);
    brass(c, o, t + 0.2, 523, 0.9);
    brass(c, o, t + 0.2, 659, 0.9, 0.06);
    brass(c, o, t + 0.2, 784, 0.9, 0.06);
  },
  repair: (c, o, t) => {
    for (let i = 0; i < 3; i++) noise(c, o, t + i * 0.11, 0.05, { vol: 0.3, filter: 'bandpass', from: 2800, q: 6 });
    tone(c, o, t + 0.34, 600, 0.3, { type: 'triangle', to: 1000, vol: 0.12 });
  },
  turn: (c, o, t) => {
    noise(c, o, t, 0.08, { vol: 0.12, filter: 'bandpass', from: 1800, q: 3 });
    tone(c, o, t + 0.06, 880, 0.09, { type: 'square', vol: 0.07, cutoff: 3000 });
    tone(c, o, t + 0.17, 1320, 0.14, { type: 'square', vol: 0.07, cutoff: 3000 });
  },
  overload: (c, o, t) => {
    for (let i = 0; i < 4; i++) tone(c, o, t + i * 0.22, i % 2 ? 520 : 760, 0.2, { type: 'square', vol: 0.1, cutoff: 2500 });
  },
  dice: (c, o, t) => {
    for (let i = 0; i < 6; i++) {
      noise(c, o, t + i * 0.055 + Math.random() * 0.02, 0.035, { vol: 0.9, filter: 'bandpass', from: 2200 + Math.random() * 2000, q: 3 });
    }
  },
  hit: (c, o, t) => {
    noise(c, o, t, 0.35, { vol: 0.4, from: 4000, to: 250 });
    tone(c, o, t, 140, 0.3, { vol: 0.4, to: 45 });
  },
  miss: (c, o, t) => noise(c, o, t, 0.35, { vol: 0.7, attack: 0.12, filter: 'bandpass', from: 700, to: 2600, q: 1.5 }),
  explosion: (c, o, t) => explosion(c, o, t),
  superweapon: (c, o, t) => {
    tone(c, o, t, 70, 1.0, { type: 'sawtooth', to: 1400, vol: 0.12, cutoff: 3000, attack: 0.3 });
    explosion(c, o, t + 1.0, 1.5);
  },
  victory: (c, o, t) => {
    const notes: Array<[number, number, number]> = [
      [0, 392, 0.13], [0.15, 392, 0.13], [0.3, 392, 0.13], [0.45, 523, 0.55],
      [1.05, 466, 0.2], [1.3, 523, 0.2], [1.55, 587, 0.2],
    ];
    notes.forEach(([at, f, d]) => brass(c, o, t + at, f, d));
    for (const f of [523, 659, 784, 1047]) brass(c, o, t + 1.8, f, 1.6, 0.07);
    noise(c, o, t + 1.8, 0.8, { vol: 0.35, from: 900, to: 80 });
    tone(c, o, t + 1.8, 110, 0.6, { vol: 0.5, to: 55 });
  },
};
