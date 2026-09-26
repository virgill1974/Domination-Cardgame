// Glitch-Effekte: zufällig alle 10–20 s (Startbildschirm, Einrichtung, Partie) und gezielt bei Kampfereignissen.
// Setzt nur data-glitch, --glitch-strength und --glitch-ms auf <html>; das Aussehen steht in theme.css („Glitch“).
// Nie bei laufender Kamera (Scanner), im Hintergrund oder mit „Bewegung reduzieren“.
export type Glitch = 'rgb' | 'tear' | 'scan' | 'noise';

const KINDS: Glitch[] = ['rgb', 'tear', 'scan', 'noise'];
const DURATION: Record<Glitch, number> = { rgb: 340, tear: 420, scan: 620, noise: 480 };
const BURST_CHANCE = 0.4; // zufällige Glitches kommen oft als Doppelschlag

let busy = false;
let timer = 0;
let range = { min: 10_000, max: 20_000 };

const pick = () => KINDS[Math.floor(Math.random() * KINDS.length)];
const blocked = () =>
  busy || document.hidden || !!document.querySelector('.scanner')
  || matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Einen Glitch auslösen (ohne Art: zufällig). strength skaliert Versatz und Deckkraft. */
export function glitch(kind: Glitch = pick(), strength = 1.6, then?: () => void) {
  if (blocked()) return;
  busy = true;
  const root = document.documentElement;
  root.style.setProperty('--glitch-strength', String(strength));
  root.style.setProperty('--glitch-ms', `${DURATION[kind]}ms`);
  root.dataset.glitch = kind;
  setTimeout(() => {
    delete root.dataset.glitch;
    busy = false;
    then?.();
  }, DURATION[kind]);
}

/** Zufälliger Glitch in Stärke 1,4–2,2, manchmal direkt gefolgt von einem zweiten */
function randomGlitch() {
  const strength = () => 1.4 + Math.random() * 0.8;
  const second = Math.random() < BURST_CHANCE ? () => setTimeout(() => glitch(pick(), strength()), 60 + Math.random() * 120) : undefined;
  glitch(pick(), strength(), second);
}

/** Zufällige Glitches ein-/ausschalten. options nur für Tests. */
export function setGlitchActive(on: boolean, options?: { min: number; max: number }) {
  if (options) range = options;
  clearTimeout(timer);
  timer = 0;
  if (!on) return;
  const next = () => {
    timer = window.setTimeout(() => {
      randomGlitch();
      next();
    }, range.min + Math.random() * (range.max - range.min));
  };
  next();
}
