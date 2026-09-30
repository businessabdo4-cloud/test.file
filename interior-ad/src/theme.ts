// Design system: the single source for colours, type, easing, layout and timing helpers.
import {Easing, interpolate, spring} from 'remotion';
import timeline from './data/timeline.json';

export const TL = timeline;
export const FPS = timeline.fps;
export const W = 1080;
export const H = 1920;

// ROIA MEDIA brand (sampled from the logo) — the video's own palette
export const brand = {
  navy: '#001638', // logo background
  navyDeep: '#000C22',
  navySoft: '#0B2A5C',
  yellow: '#E4C037', // logo stripes
  yellowBright: '#F3D250',
  white: '#F4FBFD', // logo type
  royal: '#0B3AA8', // lifted from the logo asterisk (#023199) for a full-screen field
  royalDeep: '#052777',
  line: 'rgba(244,251,253,0.14)',
};

// Warm neutral palette of the *client's* portfolio site shown inside the phone mockup
export const color = {
  sand: '#F4EFE8',
  sandDeep: '#EAE1D4',
  paper: '#FBF8F3',
  ink: '#1F1B18', // espresso
  inkSoft: '#5B5249',
  accent: '#C2703D', // terracotta
  accentOnDark: '#DE8A55', // same hue, lifted for contrast on espresso / green
  brass: '#B8925A',
  green: '#1E3B33', // deep zellige green (secondary)
  greenSoft: '#2C5146',
  line: 'rgba(31,27,24,0.10)',
};

export const font = {
  serif: '"Playfair Display", Georgia, serif',
  sans: '"Manrope", "Helvetica Neue", Arial, sans-serif',
};

// Safe zone: nothing important in the top 10 % or the bottom 20 %.
export const SAFE = {top: Math.round(H * 0.1), bottom: Math.round(H * 0.8), side: 72};

export const radius = {card: 28, pill: 999};
export const shadow = {
  soft: '0 18px 40px rgba(31,27,24,0.14), 0 4px 12px rgba(31,27,24,0.08)',
  lift: '0 30px 80px rgba(31,27,24,0.22), 0 8px 20px rgba(31,27,24,0.10)',
  glow: (c: string) => `0 0 0 2px ${c}55, 0 10px 40px ${c}66`,
};

// French typography
export const NB = ' ';

// ---------- easing ----------
export const ease = {
  out: Easing.out(Easing.cubic), // entrances
  inOut: Easing.inOut(Easing.cubic), // moves
  in: Easing.in(Easing.cubic), // exits
};

export const sec = (s: number) => Math.round(s * FPS);

/** Eased 0→1 progress of a window that starts at `start` (s) and lasts `dur` (s). */
export const prog = (t: number, start: number, dur: number, e = ease.out) =>
  interpolate(t, [start, start + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});

/** Gentle overshoot spring starting at `start` seconds. */
export const pop = (frame: number, start: number, cfg: {damping?: number; stiffness?: number; mass?: number} = {}) =>
  spring({frame: frame - start * FPS, fps: FPS, config: {damping: 13, stiffness: 150, mass: 0.8, ...cfg}});

export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/** Enter/exit helper: returns {p, out} where p eases in at `start`, out eases in at `end - outDur`. */
export const life = (t: number, start: number, end: number, inDur = 0.35, outDur = 0.3) => ({
  p: prog(t, start, inDur, ease.out),
  out: prog(t, end - outDur, outDur, ease.in),
});

// ---------- timeline shortcuts ----------
export const words = timeline.words;
export const ev = timeline.events;
export const beat = (n: number) => timeline.beats[n - 1];
export const wordStart = (i: number) => timeline.words[i].start;
export const wordEnd = (i: number) => timeline.words[i].end;

// Transition windows (s): centred on the pause between beats, ≈0.4 s long.
const win = (a: number, b: number, d: number) => {
  const c = (a + b) / 2;
  return [c - d / 2, c + d / 2] as const;
};
export const TR = {
  t1: win(ev.t1[0], ev.t1[1], 0.4), // arch mask wipe
  t2: win(ev.t2[0], ev.t2[1], 0.4), // horizontal slide
  t3: win(ev.t3[0], ev.t3[1], 0.5), // soft zoom-through
};

// ---------- Moroccan pointed arch ----------
/** SVG path of a pointed (Moroccan) arch of width w and height h, origin top-left. */
export const archPath = (w: number, h: number, x = 0, y = 0) => {
  const R = 0.8 * w;
  const s = Math.sqrt(R * R - (R - w / 2) ** 2); // height of the pointed crown
  const sh = Math.min(s, h);
  return `M${x},${y + h} L${x},${y + sh} A${R},${R} 0 0 1 ${x + w / 2},${y} A${R},${R} 0 0 1 ${x + w},${y + sh} L${x + w},${y + h} Z`;
};
