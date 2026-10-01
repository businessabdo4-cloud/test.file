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

// Music: the generated track (scripts/make_music.py) is 120 BPM. To swap in a licensed track,
// drop it in assets/music/ and keep BPM in sync with scripts/build_timeline.py (cuts snap to it).
// Mix levels live in scripts/mix_audio.py (VO -14 LUFS, music ducked 10 dB with 150 ms ramps).
export const MUSIC = { bpm: 120 };

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
  // Callouts (in VO order: "photo bluffante" -> camera, "performances" -> chip, "hors normes" -> display)
  callouts: [
    { icon: "lens", value: "48 Mpx", label: "Caméra Fusion" },
    { icon: "chip", value: "A20 Pro", label: "Puce" },
    { icon: "display", value: '6,3" · 6,9"', label: "ProMotion 120 Hz" },
  ] as const,
  // colour shown first, then the cycle (one change per bar of music)
  colourOrder: ["Burgundy", "Black", "Silver", "Glacier", "Burgundy", "Black"],
};

export const PLACEHOLDERS = {
  warranty: "[PLACEHOLDER] Garantie X mois",
  delivery: "[PLACEHOLDER] Livraison partout au Maroc",
  price: "[PLACEHOLDER] À partir de XX XXX DH",
  showOnScreen: false, // keep off until City Store confirms the values
};
