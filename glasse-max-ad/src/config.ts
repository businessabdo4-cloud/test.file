// ─────────────────────────────────────────────────────────────────────────────
//  EASY EDITS: price, specs, colors, audio mix.
//  Subtitle text/timing lives in src/data/subtitles-<city>.json (city versions: src/variant.ts).
//  Which image files are used lives in src/data/media.json.
// ─────────────────────────────────────────────────────────────────────────────

import {VARIANT} from './variant';

export const PRODUCT_NAME = 'GLASSE MAX';

export const OFFER = {
  price: '1799',
  currency: 'درهم',
  delivery: 'التوصيل فابور',
  city: VARIANT.cityIn, // per city version: src/variant.ts
};

export const SPECS = {
  stages: 6,
  stagesLabel: 'مراحل ديال التصفية',
  removes: ['الشوائب', 'الكلور', 'الأملاح'],
  membrane: {value: 80, unit: 'GPD', brand: 'LG', label: 'ممبران'},
  pump: {name: 'HK 2', label: 'بومبا', note: 'مايضيعش ليك الماء'},
};

export const COLORS = {
  navy: '#061A3A',
  deepBlue: '#0B3D91',
  water: '#1FA2FF',
  sky: '#7FD3FF',
  ice: '#EAF7FF',
  white: '#FFFFFF',
  // Logo blues
  logoBlue: '#14AEEF',
  logoNavy: '#0D2350',
  // Product colors (sampled from the GLASSE MAX photos)
  teal: '#169DA3',
  tealLight: '#2CC3C9',
  black: '#14161A',
  pearl: '#F2F4F6',
  // Accents
  price: '#FFD60A',
  accent: '#FFD60A', // default subtitle highlight
  chat: '#1FA2FF',
  eco: '#22C55E',
  whatsapp: '#25D366',
  redLight: '#FF4B4B',
  danger: '#FF3B3B',
  murk: '#A39A62',
};

// Small WATER MAROC logo shown throughout the ad (src/components/Watermark.tsx).
export const LOGO_WATERMARK = {
  width: 210, // px
  top: 38,
  left: 50,
  // hides where the big logo is already on screen (reveal + end card)
  handOffToBigLogo: true,
};

// "Camera" punch-ins (100% → 100%+amount) when these subtitle phrases start (ids in subtitles-<city>.json).
export const PUNCH_IN = {
  amount: 0.06,
  phrases: [3, 5, 10, 13, 16, 18, 21, 23, 26],
};

export const FONTS = {
  arabic: 'Cairo',
  latin: 'Montserrat',
};

export const AUDIO = {
  voiceVolume: 1,
  // "Shallow" background bed: the music sits well under the voice (music file is mastered to -14 LUFS).
  musicVolume: 0.085,
  musicVolumeGap: 0.13, // lifts a little in the gaps between lines
  musicVolumeEnd: 0.24, // swells on the end card
  sfx: true,
  sfxVolume: 0.32,
};

export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
  endHoldSeconds: 1.9, // end card stays on after the voice-over ends
};

// Which subtitle phrase (id in subtitles-<city>.json) starts each scene.
export const SCENE_STARTS = {
  hook: 1,
  reveal: 4,
  savings: 6,
  family: 8,
  stages: 10,
  removes: 13,
  membrane: 16,
  pump: 18,
  quality: 20,
  offer: 22,
  cta: 26,
} as const;

// Safe areas (px) — keep text/product out of the platform UI.
export const SAFE = {
  top: 150,
  bottom: 260,
  side: 70,
  subtitleCenterY: 1520,
};
