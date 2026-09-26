// Hintergrundmusik in drei Stücken, die ineinander überblenden:
//   menu   – Startbildschirm, Spieleinrichtung, Kurzanleitung  (public/sounds/menu.mp3)
//   game   – während der Partie                                 (public/sounds/music.mp3)
//   combat – solange die Kampfansicht läuft                     (public/sounds/combat.mp3)
// Fehlt eine Datei, spielt eine im Browser erzeugte Musik. Alles läuft über den Musik-Kanal von sound.ts,
// weil iOS die Lautstärke von <audio> selbst ignoriert.
import { audio, bus, getVolume } from './sound';

export type Track = 'menu' | 'game' | 'combat';

const URLS: Record<Track, string> = {
  menu: 'sounds/menu.mp3',
  game: 'sounds/music.mp3',
  combat: 'sounds/combat.mp3',
};

interface Generator { start(): void; stop(): void }

interface Channel {
  fade: GainNode;
  element: HTMLAudioElement | null;
  fileMissing: boolean;
  generator: Generator | null;
  stopTimer: number;
}

let base: Track | null = null; // vom Bildschirm gewählt
let combat = false; // Kampfansicht überlagert das Stück der Partie
let preview = false;
let playing: Track | null = null;
const channels = new Map<Track, Channel>();

/** Stück des aktuellen Bildschirms (null = Stille, z. B. bei der Siegesfanfare). */
export function setMusicTrack(track: Track | null) {
  base = track;
  update();
}

/** Kampfmusik, solange die Kampfansicht angezeigt wird. */
export function setCombatMusic(on: boolean) {
  combat = on;
  update();
}

/** Musik zum Probehören im Lautstärke-Dialog. */
export function setMusicPreview(on: boolean) {
  preview = on;
  update();
}

/** Bei jeder Berührung aufrufen: Browser erlauben Wiedergabe oft erst nach einer Nutzeraktion. */
export const kickMusic = () => update();

function wantedTrack(): Track | null {
  if (document.hidden || getVolume('music') <= 0) return null;
  if (combat) return 'combat';
  return base ?? (preview ? 'menu' : null);
}

function update() {
  const next = wantedTrack();
  if (playing && playing !== next) fadeOut(playing);
  if (next) fadeIn(next);
  playing = next;
}

function channel(track: Track): Channel | null {
  const c = audio();
  const out = bus('music');
  if (!c || !out) return null;
  let ch = channels.get(track);
  if (!ch) {
    const fade = c.createGain();
    fade.gain.value = 0;
    fade.connect(out);
    ch = { fade, element: null, fileMissing: false, generator: null, stopTimer: 0 };
    channels.set(track, ch);
  }
  return ch;
}

function fadeIn(track: Track) {
  const ch = channel(track);
  if (!ch) return;
  const c = ch.fade.context as AudioContext;
  clearTimeout(ch.stopTimer);
  ch.fade.gain.cancelScheduledValues(c.currentTime);
  ch.fade.gain.setTargetAtTime(1, c.currentTime, track === 'combat' ? 0.25 : 0.6);

  if (!ch.fileMissing) {
    if (!ch.element) {
      const el = new Audio(URLS[track]);
      el.loop = true;
      el.preload = 'auto';
      el.addEventListener('error', () => {
        ch.fileMissing = true;
        ch.element = null;
        if (playing === track) fadeIn(track);
      }, { once: true });
      c.createMediaElementSource(el).connect(ch.fade);
      ch.element = el;
    }
    // Ohne vorherige Berührung lehnt der Browser ab; kickMusic versucht es beim nächsten Tippen erneut
    ch.element.play().catch(() => {});
    return;
  }
  ch.generator ??= track === 'combat' ? new CombatLoop(c, ch.fade) : new Ambient(c, ch.fade, track === 'menu' ? MENU : GAME);
  ch.generator.start();
}

function fadeOut(track: Track) {
  const ch = channels.get(track);
  if (!ch) return;
  const now = ch.fade.context.currentTime;
  const halt = () => {
    ch.element?.pause();
    ch.generator?.stop();
  };
  ch.fade.gain.cancelScheduledValues(now);
  ch.fade.gain.setTargetAtTime(0, now, 0.4);
  clearTimeout(ch.stopTimer);
  if (document.hidden) halt();
  else ch.stopTimer = window.setTimeout(halt, 1600);
}

document.addEventListener('visibilitychange', update);

const midi = (n: number) => 440 * 2 ** ((n - 69) / 12);

// ---------- Erzeugte Klangflächen (Menü, Partie) ----------
interface AmbientStyle {
  chords: Array<[number, number[]]>;
  sparkle: number[];
  seconds: number;
  cutoff: number;
}

// Partie: Am(add9) – Fmaj7 – C(add9) – G6, ruhige Sci-Fi-Fläche
const GAME: AmbientStyle = {
  chords: [[45, [57, 60, 64, 71]], [41, [53, 57, 60, 64]], [48, [55, 60, 64, 67]], [43, [55, 59, 62, 64]]],
  sparkle: [69, 72, 76, 79, 81, 84],
  seconds: 8,
  cutoff: 1100,
};
// Menü: Dm – B♭ – F – C, weiter und getragener, eher „heroisch“
const MENU: AmbientStyle = {
  chords: [[38, [50, 57, 62, 65, 69]], [34, [50, 53, 58, 62, 65]], [41, [53, 57, 60, 65, 69]], [36, [52, 55, 60, 64, 67]]],
  sparkle: [74, 77, 81, 84, 86],
  seconds: 10,
  cutoff: 1500,
};

export class Ambient implements Generator {
  private timer = 0;
  private step = 0;
  private input: GainNode;

  constructor(private c: BaseAudioContext, dest: AudioNode, private style: AmbientStyle = GAME) {
    this.input = c.createGain();
    this.input.gain.value = 0.45;
    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = style.cutoff;
    filter.Q.value = 0.7;
    const lfo = c.createOscillator();
    const lfoDepth = c.createGain();
    lfo.frequency.value = 0.05;
    lfoDepth.gain.value = 500;
    lfo.connect(lfoDepth).connect(filter.frequency);
    lfo.start();
    const echo = c.createDelay(1);
    const feedback = c.createGain();
    echo.delayTime.value = 0.45;
    feedback.gain.value = 0.35;
    echo.connect(feedback).connect(echo);
    this.input.connect(filter);
    filter.connect(dest);
    filter.connect(echo);
    echo.connect(dest);
  }

  start() {
    if (this.timer) return;
    this.chord();
    this.timer = window.setInterval(() => this.chord(), this.style.seconds * 1000);
  }

  stop() {
    clearInterval(this.timer);
    this.timer = 0;
  }

  private chord() {
    const { chords, sparkle, seconds } = this.style;
    const [root, notes] = chords[this.step++ % chords.length];
    const t = this.c.currentTime + 0.05;
    const len = seconds + 3;
    for (const n of notes) {
      for (const detune of [-9, 9]) this.voice(midi(n), 'sawtooth', t, len, 0.04, detune);
    }
    this.voice(midi(root - 12), 'sine', t, len, 0.22, 0);
    for (let i = 0; i < 3; i++) {
      if (Math.random() < 0.55) {
        const note = sparkle[Math.floor(Math.random() * sparkle.length)];
        this.voice(midi(note), 'triangle', t + 1 + i * 2.2 + Math.random(), 2.5, 0.05, 0, 0.02);
      }
    }
  }

  private voice(freq: number, type: OscillatorType, t: number, len: number, vol: number, detune: number, attack = 2.5) {
    const osc = this.c.createOscillator();
    const gain = this.c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + attack);
    gain.gain.setValueAtTime(vol, Math.max(t + attack, t + len - 3));
    gain.gain.exponentialRampToValueAtTime(0.0001, t + len);
    osc.connect(gain).connect(this.input);
    osc.start(t);
    osc.stop(t + len + 0.1);
  }
}

// ---------- Erzeugter Kampf-Loop: treibender Beat, Bass und Arpeggio (A-Moll, 138 BPM) ----------
const BPM = 138;
const STEP = 60 / BPM / 4; // Sechzehntel
// 4 Takte à 16 Schritte, Grundton des Basses je Takt (Am – F – G – Em)
const BASS_ROOTS = [33, 29, 31, 28];
const BASS_PATTERN = [1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1];
const ARP = [[57, 60, 64, 69], [53, 57, 60, 65], [55, 59, 62, 67], [52, 55, 59, 64]];

export class CombatLoop implements Generator {
  private timer = 0;
  private step = 0;
  private next = 0;
  private input: GainNode;
  private noise: AudioBuffer;

  constructor(private c: BaseAudioContext, dest: AudioNode) {
    this.input = c.createGain();
    this.input.gain.value = 0.35;
    const comp = c.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 4;
    this.input.connect(comp).connect(dest);
    this.noise = c.createBuffer(1, c.sampleRate * 0.5, c.sampleRate);
    const data = this.noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }

  start() {
    if (this.timer) return;
    this.next = this.c.currentTime + 0.05;
    // Vorausplanung: alle 25 ms die Schritte der nächsten 120 ms einplanen (gleichmäßiges Timing)
    this.timer = window.setInterval(() => {
      while (this.next < this.c.currentTime + 0.12) {
        this.play(this.step++, this.next);
        this.next += STEP;
      }
    }, 25);
  }

  stop() {
    clearInterval(this.timer);
    this.timer = 0;
  }

  private play(n: number, t: number) {
    const s = n % 16;
    const bar = Math.floor(n / 16) % 4;
    if (s % 4 === 0) this.kick(t);
    if (s === 4 || s === 12) this.snare(t);
    if (s % 2 === 0) this.hat(t, s % 4 === 2 ? 0.09 : 0.05);
    if (BASS_PATTERN[s]) this.tone(midi(BASS_ROOTS[bar] + (s === 14 ? 12 : 0)), 'sawtooth', t, STEP * 0.9, 0.16, 520);
    const arp = ARP[bar];
    this.tone(midi(arp[s % 4] + (s >= 8 ? 12 : 0)), 'square', t, STEP * 0.7, 0.035, 2600);
    if (s === 0 && bar % 2 === 0) this.stab(t, arp);
  }

  private kick(t: number) {
    const osc = this.c.createOscillator();
    const g = this.c.createGain();
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    g.gain.setValueAtTime(0.9, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
    osc.connect(g).connect(this.input);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  private noiseHit(t: number, len: number, vol: number, type: BiquadFilterType, freq: number) {
    const src = this.c.createBufferSource();
    src.buffer = this.noise;
    const f = this.c.createBiquadFilter();
    f.type = type;
    f.frequency.value = freq;
    const g = this.c.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + len);
    src.connect(f).connect(g).connect(this.input);
    src.start(t);
    src.stop(t + len + 0.02);
  }

  private snare(t: number) {
    this.noiseHit(t, 0.18, 0.35, 'bandpass', 1800);
    this.tone(190, 'triangle', t, 0.08, 0.2, 4000);
  }

  private hat(t: number, vol: number) {
    this.noiseHit(t, 0.04, vol, 'highpass', 7000);
  }

  private stab(t: number, notes: number[]) {
    for (const n of notes) this.tone(midi(n), 'sawtooth', t, STEP * 6, 0.03, 1800);
  }

  private tone(freq: number, type: OscillatorType, t: number, len: number, vol: number, cutoff: number) {
    const osc = this.c.createOscillator();
    const f = this.c.createBiquadFilter();
    const g = this.c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    f.type = 'lowpass';
    f.frequency.value = cutoff;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + len);
    osc.connect(f).connect(g).connect(this.input);
    osc.start(t);
    osc.stop(t + len + 0.02);
  }
}
