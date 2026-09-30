// ─────────────────────────────────────────────────────────────────────────────
//  EASY EDITS: price, phone, address, colors, audio mix, scene clips.
//  Subtitle text/timing lives in src/data/subtitles.json.
//  Which image/clip files are used lives in src/data/media.json.
// ─────────────────────────────────────────────────────────────────────────────

export const OFFER = {
  price: '2049',
  oldPrice: '2400',
  currency: 'درهم',
  promoLabel: 'PROMO',
};

export const CONTACT = {
  phone: '06 63 70 03 08',
  address: 'حي المحمدي، آسفي',
};

export const TRUST_BADGES = [
  {icon: 'truck', text: 'التوصيل فابور'},
  {icon: 'cash', text: 'الخلاص عند الاستلام'},
  {icon: 'shield', text: 'ضمانة'},
] as const;

export const FEATURE_BADGES = {
  stages: {value: 6, label: 'مراحل تصفية'},
  removes: 'كيحيد الكلور والجير',
  removesChips: ['الكلور', 'الجير', 'الشوائب'],
  liters: {value: 300, label: 'لتر فالنهار'},
};

export const COLORS = {
  navy: '#061A3A',
  deepBlue: '#0B3D91',
  water: '#1FA2FF',
  sky: '#7FD3FF',
  ice: '#EAF7FF',
  white: '#FFFFFF',
  // Product colors (sampled from the real product photos)
  red: '#D8121B',
  redLight: '#FF4B4B',
  teal: '#0E7F8E',
  tealLight: '#23B5C6',
  // Accents
  price: '#FFD60A',
  accent: '#FFD60A', // default subtitle highlight
  whatsapp: '#25D366',
  danger: '#FF3B3B',
};

export const FONTS = {
  arabic: 'Cairo',
  latin: 'Montserrat',
};

export const AUDIO = {
  voiceVolume: 1,
  // Music: drop a file at assets/music.mp3 and run `python3 scripts/build_media_manifest.py`
  // (or set "music" in src/data/media.json).
  musicVolume: 0.1, // under the voice (music.wav is mastered at about -10.5 LUFS)
  musicVolumeEnd: 0.22, // swells a bit on the end card
  sfx: true, // whoosh/pop/impact effects (generated locally, assets/sfx/)
  sfxVolume: 0.35,
};

export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
  endHoldSeconds: 1.8, // end card stays on after the voice-over ends
};

// Which subtitle phrase (id in subtitles.json) starts each scene.
export const SCENE_STARTS = {
  hook: 1,
  problem: 4,
  reveal: 7,
  features: 9,
  benefits: 18,
  colors: 22,
  offer: 24,
  trust: 26,
  cta: 29,
} as const;

// Safe areas (px) — keep text/product out of the platform UI.
export const SAFE = {
  top: 150,
  bottom: 260,
  side: 70,
  subtitleCenterY: 1500,
};
