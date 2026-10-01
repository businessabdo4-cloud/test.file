// Central, editable config for the City Store reel.
// Anything marked PLACEHOLDER must be confirmed by City Store before publishing.

export const FPS = 30;
export const MAX_FRAMES = 900; // hard limit: 30.0 s, never exceed

export const SOCIAL = {
  instagram: "@citystore.ma",
  facebook: "citystore.ma",
  website: "citystore.ma",
  instagramUrl: "https://www.instagram.com/citystore.ma/",
  facebookUrl: "https://web.facebook.com/profile.php?id=61581215721905",
};

// Music: drop a track in assets/music/ and set its file name + BPM here.
// Cuts and text hits snap to this beat grid.
export const MUSIC = {
  file: null as string | null, // e.g. "music/track.mp3" (copied to public/)
  bpm: 120, // PLACEHOLDER until a track is supplied (detect with scripts/detect_bpm.py)
  firstBeatSec: 0,
  volumeDb: -16,
  duckDb: -10,
  duckRampMs: 150,
};

// Verified via apple.com (see SOURCES.md). Drop any callout that can't be confirmed.
export const IPHONE = {
  models: [
    { name: "iPhone 18 Pro", display: '6,3"' },
    { name: "iPhone 18 Pro Max", display: '6,9"' },
  ],
  // Official colour names; hex values are visual approximations only.
  colours: [
    { name: "Black", hex: "#2B2B2E" },
    { name: "Silver", hex: "#E3E4E6" },
    { name: "Glacier", hex: "#C9DDEA" },
    { name: "Burgundy", hex: "#5E1F2B" },
  ],
  specs: ["Puce A20 Pro", 'Écran 6,3" et 6,9" ProMotion', "Caméra Fusion 48 Mpx"],
};

export const PLACEHOLDERS = {
  warranty: "[PLACEHOLDER] Garantie X mois",
  delivery: "[PLACEHOLDER] Livraison partout au Maroc",
  price: "[PLACEHOLDER] À partir de XX XXX DH",
  showOnScreen: false, // keep off until City Store confirms the values
};
