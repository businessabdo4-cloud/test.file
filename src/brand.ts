import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";
import fontManifest from "../public/fonts/manifest.json";
import sampled from "./brand.generated.json";

// Colours sampled from assets/logo.png by scripts/sample_colors.py
export const COLORS = {
  blue: sampled.gradientStart, // electric blue (left edge of logo)
  mid: sampled.gradientMid,
  cyan: sampled.gradientEnd, // cyan (right edge of logo)
  white: "#FFFFFF",
  navy: "#0B1A6E", // deep shade of the brand blue, for outlines/mouth interior
  ink: "#16237F",
  tongue: "#7FE6FF",
  shadow: "rgba(8, 20, 110, 0.35)",
};

export const GRADIENT = `linear-gradient(90deg, ${COLORS.blue} 0%, ${sampled.stops["0.25"]} 25%, ${COLORS.mid} 50%, ${sampled.stops["0.75"]} 75%, ${COLORS.cyan} 100%)`;

// Grid measured on the logo: 60px pitch on a 1080px canvas (18 cells), ~15-20% white.
export const GRID = { pitch: 60, opacity: 0.15, lineWidth: 2 };

// Montserrat (variable 100-900) fetched from Google Fonts by scripts/fetch_fonts.mjs
// using @remotion/google-fonts' manifest. latin-ext covers é è à ç ô œ etc.
export const FONT = "Montserrat";
export const fontsReady = Promise.all(
  fontManifest.map((f) =>
    loadFont({
      family: FONT,
      url: staticFile(`fonts/${f.file}`),
      weight: "100 900",
      unicodeRange: f.unicodeRange,
      format: "woff2",
    }),
  ),
);
