import React from "react";
import { COLORS } from "../brand";

// Rhubarb Lip Sync mouth shapes (basic A-F + extended G, H, X)
// https://github.com/DanielSWolf/rhubarb-lip-sync#mouth-shapes
export type Viseme = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "X";
// Non-speech expression mouths used for acting beats
export type ExpressionMouth = "grin" | "smile" | "o";
export type MouthShape = Viseme | ExpressionMouth;

const S = { stroke: COLORS.white, strokeWidth: 6, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const inner = { fill: COLORS.navy, ...S };

const Teeth: React.FC<{ y: number; w: number }> = ({ y, w }) => (
  <rect x={-w / 2} y={y} width={w} height={6} rx={3} fill={COLORS.white} />
);

// All shapes are drawn around (0,0) = mouth centre on the face screen.
export const MOUTHS: Record<MouthShape, React.ReactNode> = {
  // X - rest: soft closed smile
  X: <path d="M -22 -3 Q 0 13 22 -3" fill="none" {...S} strokeWidth={7} />,
  // A - closed lips (M, B, P)
  A: <path d="M -20 2 Q 0 7 20 2" fill="none" {...S} strokeWidth={8} />,
  // B - slightly open, teeth together (most consonants: K, S, T, EE)
  B: (
    <g>
      <rect x={-24} y={-7} width={48} height={16} rx={8} {...inner} />
      <rect x={-17} y={-2} width={34} height={6} rx={3} fill={COLORS.white} />
    </g>
  ),
  // C - open (EH, AE)
  C: (
    <g>
      <path d="M -26 -8 Q 0 -12 26 -8 Q 22 20 0 22 Q -22 20 -26 -8 Z" {...inner} />
      <Teeth y={-7} w={34} />
      <ellipse cx={0} cy={14} rx={11} ry={5} fill={COLORS.tongue} />
    </g>
  ),
  // D - wide open (AA)
  D: (
    <g>
      <path d="M -30 -12 Q 0 -16 30 -12 Q 28 32 0 34 Q -28 32 -30 -12 Z" {...inner} />
      <Teeth y={-11} w={40} />
      <ellipse cx={0} cy={24} rx={14} ry={7} fill={COLORS.tongue} />
    </g>
  ),
  // E - slightly rounded (AO, ER)
  E: (
    <g>
      <ellipse cx={0} cy={4} rx={17} ry={17} {...inner} />
      <ellipse cx={0} cy={14} rx={8} ry={4} fill={COLORS.tongue} />
    </g>
  ),
  // F - puckered (UW, OW, W)
  F: <ellipse cx={0} cy={3} rx={9} ry={11} {...inner} strokeWidth={6} />,
  // G - F/V: upper teeth on lower lip
  G: (
    <g>
      <rect x={-22} y={-6} width={44} height={16} rx={8} {...inner} />
      <rect x={-16} y={-3} width={32} height={7} rx={3} fill={COLORS.white} />
      <path d="M -18 9 Q 0 4 18 9" fill="none" {...S} strokeWidth={5} />
    </g>
  ),
  // H - L sound: open, tongue raised behind teeth
  H: (
    <g>
      <path d="M -24 -8 Q 0 -12 24 -8 Q 20 18 0 20 Q -20 18 -24 -8 Z" {...inner} />
      <Teeth y={-7} w={30} />
      <ellipse cx={0} cy={2} rx={10} ry={6} fill={COLORS.tongue} />
    </g>
  ),
  // Expression mouths
  smile: <path d="M -28 -6 Q 0 20 28 -6" fill="none" {...S} strokeWidth={8} />,
  grin: (
    <g>
      <path d="M -30 -8 Q 0 -6 30 -8 Q 26 26 0 28 Q -26 26 -30 -8 Z" {...inner} />
      <Teeth y={-7} w={44} />
      <ellipse cx={0} cy={19} rx={13} ry={6} fill={COLORS.tongue} />
    </g>
  ),
  o: (
    <g>
      <ellipse cx={0} cy={6} rx={15} ry={19} {...inner} />
      <ellipse cx={0} cy={17} rx={7} ry={4} fill={COLORS.tongue} />
    </g>
  ),
};

export const VISEMES: Viseme[] = ["A", "B", "C", "D", "E", "F", "G", "H", "X"];
