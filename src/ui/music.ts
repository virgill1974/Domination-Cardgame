// Hintergrundmusik: public/sounds/music.mp3 in Schleife, sonst eine im Browser erzeugte Klangfläche.
// Läuft über den Musik-Kanal von sound.ts, weil iOS die Lautstärke von <audio> selbst ignoriert.
import { audio, bus, getVolume } from './sound';

const MUSIC_URL = 'sounds/music.mp3';
const CHORD_SECONDS = 8;

let wanted = false;
let preview = false;
let fade: GainNode | null = null;
let element: HTMLAudioElement | null = null;
let fileMissing = false;
let ambient: Ambient | null = null;
let stopTimer = 0;

/** Musik soll laufen (während des Spiels). */
export function setMusicActive(on: boolean) {
  wanted = on;
  update();
}

/** Musik zum Probehören im Lautstärke-Dialog. */
export function setMusicPreview(on: boolean) {
  preview = on;
  update();
}

/** Bei jeder Berührung aufrufen: Browser erlauben Wiedergabe oft erst nach einer Nutzeraktion. */
export const kickMusic = () => update();

const shouldPlay = () => (wanted || preview) && !document.hidden && getVolume('music') > 0;

function update() {
  if (shouldPlay()) start();
  else stop();
}

function start() {
  const c = audio();
  const out = bus('music');
  if (!c || !out) return;
  clearTimeout(stopTimer);
  if (!fade) {
    fade = c.createGain();
    fade.gain.value = 0;
    fade.connect(out);
  }
  fade.gain.cancelScheduledValues(c.currentTime);
  fade.gain.setTargetAtTime(1, c.currentTime, 0.6);

  if (!fileMissing) {
    if (!element) {
      const el = new Audio(MUSIC_URL);
      el.loop = true;
      el.preload = 'auto';
      el.addEventListener('error', () => {
        fileMissing = true;
        element = null;
        update();
      }, { once: true });
      c.createMediaElementSource(el).connect(fade);
      element = el;
    }
    // Ohne vorherige Berührung lehnt der Browser ab; kickMusic versucht es beim nächsten Tippen erneut
    element.play().catch(() => {});
    return;
  }
  ambient ??= new Ambient(c, fade);
  ambient.start();
}

function stop() {
  if (!fade) return;
  const now = fade.context.currentTime;
  const halt = () => {
    element?.pause();
    ambient?.stop();
  };
  fade.gain.cancelScheduledValues(now);
  fade.gain.setTargetAtTime(0, now, 0.4);
  clearTimeout(stopTimer);
  if (document.hidden) halt();
  else stopTimer = window.setTimeout(halt, 1600);
}

document.addEventListener('visibilitychange', update);

const midi = (n: number) => 440 * 2 ** ((n - 69) / 12);

// Am(add9) – Fmaj7 – C(add9) – G6, ruhige Sci-Fi-Fläche
const CHORDS: Array<[number, number[]]> = [
  [45, [57, 60, 64, 71]],
  [41, [53, 57, 60, 64]],
  [48, [55, 60, 64, 67]],
  [43, [55, 59, 62, 64]],
];
const SPARKLE = [69, 72, 76, 79, 81, 84];

export class Ambient {
  private timer = 0;
  private step = 0;
  private input: GainNode;

  constructor(private c: BaseAudioContext, dest: AudioNode) {
    this.input = c.createGain();
    this.input.gain.value = 0.45;
    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1100;
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
    this.timer = window.setInterval(() => this.chord(), CHORD_SECONDS * 1000);
  }

  stop() {
    clearInterval(this.timer);
    this.timer = 0;
  }

  private chord() {
    const [root, notes] = CHORDS[this.step++ % CHORDS.length];
    const t = this.c.currentTime + 0.05;
    const len = CHORD_SECONDS + 3;
    for (const n of notes) {
      for (const detune of [-9, 9]) this.voice(midi(n), 'sawtooth', t, len, 0.045, detune);
    }
    this.voice(midi(root - 12), 'sine', t, len, 0.22, 0);
    for (let i = 0; i < 3; i++) {
      if (Math.random() < 0.55) {
        const note = SPARKLE[Math.floor(Math.random() * SPARKLE.length)];
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
