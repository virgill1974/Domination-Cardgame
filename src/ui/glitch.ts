// Kurze Glitch-Effekte während der Partie: zufällig alle 30–90 s und gezielt bei Kampfereignissen.
// Setzt nur data-glitch/--glitch-strength auf <html>; das Aussehen steht in theme.css („Glitch“).
// Nie bei laufender Kamera (Scanner), im Hintergrund oder mit „Bewegung reduzieren“.
export type Glitch = 'rgb' | 'tear' | 'scan' | 'noise';

const KINDS: Glitch[] = ['rgb', 'tear', 'scan', 'noise'];
const DURATION: Record<Glitch, number> = { rgb: 220, tear: 260, scan: 480, noise: 320 };

let busy = false;
let timer = 0;
let range = { min: 30_000, max: 90_000 };

const blocked = () =>
  busy || document.hidden || !!document.querySelector('.scanner')
  || matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Einen Glitch auslösen (ohne Art: zufällig). strength skaliert Versatz und Deckkraft. */
export function glitch(kind: Glitch = KINDS[Math.floor(Math.random() * KINDS.length)], strength = 1) {
  if (blocked()) return;
  busy = true;
  const root = document.documentElement;
  root.style.setProperty('--glitch-strength', String(strength));
  root.dataset.glitch = kind;
  setTimeout(() => {
    delete root.dataset.glitch;
    busy = false;
  }, DURATION[kind]);
}

/** Zufällige Glitches ein-/ausschalten (App: nur während der Partie). options nur für Tests. */
export function setGlitchActive(on: boolean, options?: { min: number; max: number }) {
  if (options) range = options;
  clearTimeout(timer);
  timer = 0;
  if (!on) return;
  const next = () => {
    timer = window.setTimeout(() => {
      glitch();
      next();
    }, range.min + Math.random() * (range.max - range.min));
  };
  next();
}
