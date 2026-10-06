import React from "react";
import { evolvePath } from "@remotion/paths";
import { COLORS } from "../brand";

// White line icons recreating the logo's icon row (phone, laptop, watch, headphones,
// controller, action camera) + UI glyphs. 100x100 viewBox, one array entry per stroke so
// each can "draw on" with evolvePath.
export const ICONS = {
  phone: ["M36 8 H64 A9 9 0 0 1 73 17 V83 A9 9 0 0 1 64 92 H36 A9 9 0 0 1 27 83 V17 A9 9 0 0 1 36 8 Z", "M45 82 H55"],
  laptop: ["M20 20 H80 A4 4 0 0 1 84 24 V64 H16 V24 A4 4 0 0 1 20 20 Z", "M5 66 H95 L90 78 H10 Z", "M43 72 H57"],
  watch: [
    "M35 24 H65 A11 11 0 0 1 76 35 V65 A11 11 0 0 1 65 76 H35 A11 11 0 0 1 24 65 V35 A11 11 0 0 1 35 24 Z",
    "M39 24 L37 6 H63 L61 24",
    "M39 76 L37 94 H63 L61 76",
    "M76 43 H81 V55 H76",
    "M41 55 A11 11 0 0 1 52 42",
  ],
  headphones: [
    "M17 62 V50 A33 33 0 0 1 83 50 V62",
    "M13 64 A6 6 0 0 1 19 58 H29 V88 H19 A6 6 0 0 1 13 82 Z",
    "M87 64 A6 6 0 0 0 81 58 H71 V88 H81 A6 6 0 0 0 87 82 Z",
  ],
  controller: [
    "M31 30 H69 C83 30 91 44 93 61 C95 76 87 84 79 79 L67 69 H33 L21 79 C13 84 5 76 7 61 C9 44 17 30 31 30 Z",
    "M27 45 V59",
    "M20 52 H34",
    "M70 44 m-3.5 0 a3.5 3.5 0 1 0 7 0 a3.5 3.5 0 1 0 -7 0",
    "M79 53 m-3.5 0 a3.5 3.5 0 1 0 7 0 a3.5 3.5 0 1 0 -7 0",
  ],
  camera: [
    "M14 28 H86 A8 8 0 0 1 94 36 V78 A8 8 0 0 1 86 86 H14 A8 8 0 0 1 6 78 V36 A8 8 0 0 1 14 28 Z",
    "M68 57 m-15 0 a15 15 0 1 0 30 0 a15 15 0 1 0 -30 0",
    "M68 57 m-6 0 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0",
    "M16 40 H42 V60 H16 Z",
    "M20 28 V20 H36 V28",
  ],
  check: ["M27 52 L43 68 L75 33"],
  instagram: [
    "M31 10 H69 A21 21 0 0 1 90 31 V69 A21 21 0 0 1 69 90 H31 A21 21 0 0 1 10 69 V31 A21 21 0 0 1 31 10 Z",
    "M50 50 m-18 0 a18 18 0 1 0 36 0 a18 18 0 1 0 -36 0",
    "M72 28 m-2 0 a2 2 0 1 0 4 0 a2 2 0 1 0 -4 0",
  ],
  chip: [
    "M28 22 H72 A6 6 0 0 1 78 28 V72 A6 6 0 0 1 72 78 H28 A6 6 0 0 1 22 72 V28 A6 6 0 0 1 28 22 Z",
    "M38 38 H62 V62 H38 Z",
    "M36 22 V10 M50 22 V10 M64 22 V10 M36 90 V78 M50 90 V78 M64 90 V78 M22 36 H10 M22 50 H10 M22 64 H10 M90 36 H78 M90 50 H78 M90 64 H78",
  ],
  lens: [
    "M50 50 m-38 0 a38 38 0 1 0 76 0 a38 38 0 1 0 -76 0",
    "M50 50 m-20 0 a20 20 0 1 0 40 0 a20 20 0 1 0 -40 0",
    "M50 50 m-7 0 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0",
  ],
  // --- Apple Watch reel
  // --- Galaxy Watch reel
  bezel: ["M50 50 m-34 0 a34 34 0 1 0 68 0 a34 34 0 1 0 -68 0", "M50 50 m-22 0 a22 22 0 1 0 44 0 a22 22 0 1 0 -44 0", "M50 6 A44 44 0 0 1 92 40", "M86 30 L92 40 L80 42", "M50 94 A44 44 0 0 1 8 60", "M14 70 L8 60 L20 58"],
  spark: ["M50 8 C54 34 66 46 92 50 C66 54 54 66 50 92 C46 66 34 54 8 50 C34 46 46 34 50 8 Z", "M80 14 L82 22 L90 24 L82 26 L80 34 L78 26 L70 24 L78 22 Z"],
  bolt: ["M56 6 L22 56 H46 L40 94 L78 40 H54 Z"],
  bright: ["M50 50 m-14 0 a14 14 0 1 0 28 0 a14 14 0 1 0 -28 0", "M50 6 V20 M50 80 V94 M6 50 H20 M80 50 H94 M19 19 L29 29 M71 71 L81 81 M19 81 L29 71 M71 29 L81 19"],
  dive: ["M50 14 m-12 0 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0", "M20 44 L46 36 L74 50", "M46 36 L52 58 L80 66", "M6 80 Q 17 72 28 80 T 50 80 T 72 80 T 94 80", "M6 92 Q 17 84 28 92 T 50 92 T 72 92 T 94 92"],
  run: ["M62 12 m-9 0 a9 9 0 1 0 18 0 a9 9 0 1 0 -18 0", "M56 30 L44 56 L58 70 L54 92", "M44 56 L26 70 L14 66", "M54 34 L72 46 L86 40", "M52 34 L34 34 L26 46"],
  mountain: ["M4 88 L36 36 L52 60 L64 44 L96 88 Z", "M30 46 L36 36 L42 46 L38 44 L34 48 Z", "M78 16 m-7 0 a7 7 0 1 0 14 0 a7 7 0 1 0 -14 0"],
  store: ["M12 40 L18 16 H82 L88 40", "M12 40 C12 48 30 48 30 40 C30 48 50 48 50 40 C50 48 70 48 70 40 C70 48 88 48 88 40", "M18 48 V86 H82 V48", "M40 86 V64 H60 V86"],
  ruler: ["M8 64 L64 8 L92 36 L36 92 Z", "M24 48 L32 56 M36 36 L48 48 M48 24 L56 32 M60 12 L72 24"],
  sapphire: ["M30 18 H70 L88 40 L50 86 L12 40 Z", "M12 40 H88", "M38 18 L30 40 L50 86 L70 40 L62 18"],
  battery: ["M14 30 H80 A6 6 0 0 1 86 36 V64 A6 6 0 0 1 80 70 H14 A6 6 0 0 1 8 64 V36 A6 6 0 0 1 14 30 Z", "M86 43 H92 V57 H86", "M47 36 L36 52 H50 L42 66 L60 46 H46 L54 36"],
  pin: ["M50 92 C50 92 20 60 20 40 A30 30 0 0 1 80 40 C80 60 50 92 50 92 Z", "M50 40 m-11 0 a11 11 0 1 0 22 0 a11 11 0 1 0 -22 0"],
  satellite: ["M50 36 L64 50 L50 64 L36 50 Z", "M36 50 H26", "M26 38 H8 V62 H26 Z", "M64 50 H74", "M74 38 H92 V62 H74 Z", "M50 64 V74", "M44 80 A8 8 0 0 1 56 80", "M60 22 A14 14 0 0 1 74 30", "M62 10 A26 26 0 0 1 86 26"],
  nosignal: ["M20 82 V70", "M38 82 V58", "M56 82 V46", "M74 82 V34", "M14 20 L88 92"],
  heart: ["M50 86 C50 86 10 62 10 36 A20 20 0 0 1 50 24 A20 20 0 0 1 90 36 C90 62 50 86 50 86 Z"],
  sun: ["M50 50 m-16 0 a16 16 0 1 0 32 0 a16 16 0 1 0 -32 0", "M50 10 V20 M50 80 V90 M10 50 H20 M80 50 H90 M22 22 L29 29 M71 71 L78 78 M22 78 L29 71 M71 29 L78 22"],
  moon: ["M60 14 A36 36 0 1 0 86 62 A28 28 0 1 1 60 14 Z", "M78 22 L80 28 L86 30 L80 32 L78 38 L76 32 L70 30 L76 28 Z"],
  chat: ["M18 20 H82 A8 8 0 0 1 90 28 V62 A8 8 0 0 1 82 70 H42 L24 86 V70 H18 A8 8 0 0 1 10 62 V28 A8 8 0 0 1 18 20 Z", "M32 45 h0.1 M50 45 h0.1 M68 45 h0.1"],
  box: ["M12 32 L50 16 L88 32 L50 48 Z", "M12 32 V70 L50 86 V48", "M88 32 V70 L50 86", "M31 24 L69 40"],
  lock: ["M28 46 H72 A6 6 0 0 1 78 52 V82 A6 6 0 0 1 72 88 H28 A6 6 0 0 1 22 82 V52 A6 6 0 0 1 28 46 Z", "M36 46 V34 A14 14 0 0 1 64 34 V46", "M50 62 V72"],
  power: ["M50 12 V48", "M30 24 A32 32 0 1 0 70 24"],
  seal: ["M50 8 L84 20 V46 C84 70 68 84 50 92 C32 84 16 70 16 46 V20 Z", "M33 50 L45 62 L68 37"],
  display: ["M34 6 H66 A10 10 0 0 1 76 16 V84 A10 10 0 0 1 66 94 H34 A10 10 0 0 1 24 84 V16 A10 10 0 0 1 34 6 Z", "M24 20 L76 20 M24 80 L76 80", "M38 50 L46 42 M38 60 L58 40"],
} as const;

export type IconName = keyof typeof ICONS;

export const LineIcon: React.FC<{
  name: IconName;
  size: number;
  progress?: number; // 0..1 draw-on
  stroke?: number;
  color?: string;
  glow?: boolean;
  style?: React.CSSProperties;
}> = ({ name, size, progress = 1, stroke = 5, color = COLORS.white, glow, style }) => {
  const parts = ICONS[name];
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={{ overflow: "visible", filter: glow ? "drop-shadow(0 0 12px rgba(255,255,255,0.55))" : undefined, ...style }}
    >
      {parts.map((d, i) => {
        // stagger strokes: each part draws in its own slice of the progress
        const n = parts.length;
        const local = Math.min(1, Math.max(0, progress * (n * 0.6 + 0.4) - i * 0.6));
        if (local <= 0) return null;
        const evo = local >= 1 ? null : evolvePath(local, d);
        return (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={evo?.strokeDasharray}
            strokeDashoffset={evo?.strokeDashoffset}
          />
        );
      })}
    </svg>
  );
};

/** Facebook-style "f" roundel (filled), for the CTA. */
export const FacebookGlyph: React.FC<{ size: number }> = ({ size }) => (
  <svg viewBox="0 0 100 100" width={size} height={size}>
    <circle cx={50} cy={50} r={46} fill={COLORS.white} />
    <path
      d="M55 92 V56 H66 L68 43 H55 V35 C55 31 57 29 61 29 H68 V17 C65 17 61 16 58 16 C49 16 42 22 42 32 V43 H32 V56 H42 V92 Z"
      fill={COLORS.blue}
    />
  </svg>
);
