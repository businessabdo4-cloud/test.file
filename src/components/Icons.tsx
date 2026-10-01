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
