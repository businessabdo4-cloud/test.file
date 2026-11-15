import React from "react";
import { Viseme } from "../../citybot/Mouths";

/**
 * HAMZA: original character for the City Store sketch series (young Moroccan man, early 20s, short dark hair,
 * light beard, hoodie, jeans, sneakers). Layered, rigged SVG: head (tilt), eyes (blink, look), eyebrows,
 * 9-shape viseme mouth (Rhubarb A-H, X) + expression mouths, two-segment arms with a hand slot that can hold a prop.
 * viewBox 400 x 760, feet at y ~740.
 */
export type HamzaExpression = "neutral" | "squint" | "amazed" | "suspicious" | "delighted";
export type HamzaHand = "open" | "fist" | "five" | "hold";
export interface HamzaArm {
  /** shoulder angle, degrees: 0 = hanging down, + = swings outward/up on that side, - = across the body */
  rot: number;
  /** elbow angle, degrees: 0 = straight, + = forearm folds up/inward */
  bend: number;
  hand: HamzaHand;
}
export interface HamzaProps {
  width?: number;
  mouth?: Viseme | null;
  expression?: HamzaExpression;
  blink?: number;
  lookX?: number;
  lookY?: number;
  tilt?: number;
  /** head lean forward (px, viewBox units) */
  lean?: number;
  leftArm?: HamzaArm; // viewer's left
  rightArm?: HamzaArm; // viewer's right
  /** prop drawn upright in the right hand (viewer's right), centred on the hand */
  holdRight?: React.ReactNode;
  holdLeft?: React.ReactNode;
  breathe?: number;
  style?: React.CSSProperties;
}

const SKIN = "#C98B5F";
const SKIN_SHADE = "#B07650";
const HAIR = "#231511";
const HOODIE = "#E2733C";
const HOODIE_DARK = "#B9552A";
const JEANS = "#2D3F6E";
const LINE = "#2A1A22";
const OUT = { stroke: LINE, strokeWidth: 5, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
const MOUTH_IN = "#5A1E24";
const TONGUE = "#E57B7B";

/** mouth shapes centred on (0,0) */
const mouthShape = (m: Viseme | "smile" | "frown" | "jaw" | "smirk"): React.ReactNode => {
  switch (m) {
    case "A": // M B P: closed lips
      return <path d="M -20 0 Q 0 4 20 0" fill="none" {...OUT} />;
    case "B": // most consonants: slightly open, teeth
      return (
        <g>
          <path d="M -22 -4 Q 0 -8 22 -4 Q 18 10 0 11 Q -18 10 -22 -4 Z" fill={MOUTH_IN} {...OUT} />
          <path d="M -17 -3 Q 0 -6 17 -3 L 15 2 Q 0 0 -15 2 Z" fill="#fff" />
        </g>
      );
    case "C": // E: open
      return (
        <g>
          <path d="M -24 -6 Q 0 -10 24 -6 Q 20 18 0 20 Q -20 18 -24 -6 Z" fill={MOUTH_IN} {...OUT} />
          <path d="M -18 -5 Q 0 -8 18 -5 L 16 0 Q 0 -2 -16 0 Z" fill="#fff" />
          <ellipse cx={0} cy={13} rx={10} ry={4} fill={TONGUE} />
        </g>
      );
    case "D": // A I: wide open
      return (
        <g>
          <path d="M -26 -8 Q 0 -12 26 -8 Q 22 28 0 30 Q -22 28 -26 -8 Z" fill={MOUTH_IN} {...OUT} />
          <path d="M -19 -7 Q 0 -10 19 -7 L 17 -1 Q 0 -3 -17 -1 Z" fill="#fff" />
          <ellipse cx={0} cy={21} rx={12} ry={6} fill={TONGUE} />
        </g>
      );
    case "E": // O: rounded
      return (
        <g>
          <ellipse cx={0} cy={4} rx={15} ry={17} fill={MOUTH_IN} {...OUT} />
          <ellipse cx={0} cy={13} rx={8} ry={4} fill={TONGUE} />
        </g>
      );
    case "F": // U W: puckered
      return <ellipse cx={0} cy={2} rx={9} ry={10} fill={MOUTH_IN} {...OUT} />;
    case "G": // F V: top teeth on lip
      return (
        <g>
          <path d="M -20 -3 Q 0 -6 20 -3 Q 16 8 0 9 Q -16 8 -20 -3 Z" fill={MOUTH_IN} {...OUT} />
          <path d="M -15 -3 Q 0 -5 15 -3 L 14 4 Q 0 6 -14 4 Z" fill="#fff" />
        </g>
      );
    case "H": // L: open, tongue up
      return (
        <g>
          <path d="M -23 -6 Q 0 -10 23 -6 Q 19 20 0 22 Q -19 20 -23 -6 Z" fill={MOUTH_IN} {...OUT} />
          <ellipse cx={0} cy={2} rx={11} ry={7} fill={TONGUE} />
        </g>
      );
    case "smile":
      return (
        <g>
          <path d="M -26 -6 Q 0 -2 26 -6 Q 22 20 0 22 Q -22 20 -26 -6 Z" fill={MOUTH_IN} {...OUT} />
          <path d="M -20 -5 Q 0 -2 20 -5 L 18 2 Q 0 4 -18 2 Z" fill="#fff" />
          <ellipse cx={0} cy={15} rx={10} ry={4} fill={TONGUE} />
        </g>
      );
    case "frown":
      return <path d="M -18 6 Q 0 -6 18 6" fill="none" {...OUT} />;
    case "jaw": // jaw-drop amazement
      return (
        <g>
          <path d="M -22 -8 Q 0 -12 22 -8 Q 24 40 0 44 Q -24 40 -22 -8 Z" fill={MOUTH_IN} {...OUT} />
          <ellipse cx={0} cy={32} rx={12} ry={7} fill={TONGUE} />
        </g>
      );
    case "smirk":
      return <path d="M -16 3 Q 2 4 20 -6" fill="none" {...OUT} />;
    default: // X rest
      return <path d="M -14 0 Q 0 3 14 0" fill="none" {...OUT} />;
  }
};

const idleMouth: Record<HamzaExpression, Viseme | "smile" | "frown" | "jaw" | "smirk"> = {
  neutral: "X",
  squint: "frown",
  amazed: "jaw",
  suspicious: "smirk",
  delighted: "smile",
};

const Eye: React.FC<{ cx: number; kind: "open" | "squint" | "wide" | "half" | "happy"; blink: number; lx: number; ly: number }> = ({ cx, kind, blink, lx, ly }) => {
  const cy = 170;
  if (kind === "happy") return <path d={`M ${cx - 15} ${cy + 4} Q ${cx} ${cy - 12} ${cx + 15} ${cy + 4}`} fill="none" {...OUT} strokeWidth={6} />;
  const rx = kind === "wide" ? 19 : 16;
  const ryBase = kind === "wide" ? 23 : kind === "squint" ? 6 : kind === "half" ? 10 : 18;
  const ry = Math.max(1.5, ryBase * (1 - blink));
  const pr = kind === "wide" ? 6.5 : 8;
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#fff" {...OUT} strokeWidth={4} />
      {ry > 4 && <circle cx={cx + lx} cy={cy + ly} r={Math.min(pr, ry - 1)} fill={LINE} />}
      {ry > 6 && <circle cx={cx + lx + 3} cy={cy + ly - 3} r={2.4} fill="#fff" />}
      {(kind === "half" || kind === "squint") && <path d={`M ${cx - rx - 2} ${cy - ry + 1} L ${cx + rx + 2} ${cy - ry + 1}`} {...OUT} strokeWidth={5} />}
    </g>
  );
};

const Arm: React.FC<{ x: number; y: number; arm: HamzaArm; side: 1 | -1; hold?: React.ReactNode }> = ({ x, y, arm, side, hold }) => {
  // side = +1 for the viewer's left arm (outward = towards -x), -1 for the viewer's right arm
  const r1 = arm.rot * side;
  const r2 = -arm.bend * side;
  const upright = -(r1 + r2); // keep held props / palm upright
  return (
    <g transform={`translate(${x} ${y}) rotate(${r1})`}>
      <rect x={-17} y={-12} width={34} height={96} rx={17} fill={HOODIE} {...OUT} />
      <g transform={`translate(0 80) rotate(${r2})`}>
        <rect x={-15} y={-8} width={30} height={84} rx={15} fill={HOODIE} {...OUT} />
        <rect x={-15} y={58} width={30} height={14} rx={6} fill={HOODIE_DARK} {...OUT} strokeWidth={4} />
        <g transform={`translate(0 84) rotate(${upright})`}>
          {arm.hand === "five" ? (
            <g>
              {[-30, -12, 6, 24].map((a, i) => (
                <rect key={i} x={-5} y={-34} width={10} height={26} rx={5} fill={SKIN} {...OUT} strokeWidth={4} transform={`rotate(${a})`} />
              ))}
              <rect x={-26} y={-6} width={22} height={10} rx={5} fill={SKIN} {...OUT} strokeWidth={4} transform="rotate(-35)" />
              <circle r={17} fill={SKIN} {...OUT} />
            </g>
          ) : (
            <circle r={arm.hand === "fist" ? 15 : 17} fill={SKIN} {...OUT} />
          )}
          {hold ? (
            <foreignObject x={-300} y={-300} width={600} height={600} style={{ overflow: "visible" }}>
              <div style={{ position: "absolute", left: 300, top: 294, width: 0, height: 0 }}>{hold}</div>
            </foreignObject>
          ) : null}
          {arm.hand === "hold" && <path d="M -14 -6 Q 0 -16 14 -6" fill="none" {...OUT} strokeWidth={4} />}
        </g>
      </g>
    </g>
  );
};

export const Hamza: React.FC<HamzaProps> = ({
  width = 400,
  mouth = null,
  expression = "neutral",
  blink = 0,
  lookX = 0,
  lookY = 0,
  tilt = 0,
  lean = 0,
  leftArm = { rot: 8, bend: 10, hand: "open" },
  rightArm = { rot: 8, bend: 10, hand: "open" },
  holdRight,
  holdLeft,
  breathe = 0,
  style,
}) => {
  const ex = expression;
  const eyeL = ex === "squint" ? "squint" : ex === "amazed" ? "wide" : ex === "delighted" && !mouth ? "happy" : "open";
  const eyeR = ex === "squint" ? "squint" : ex === "amazed" ? "wide" : ex === "suspicious" ? "half" : ex === "delighted" && !mouth ? "happy" : "open";
  const browL = ex === "squint" ? { y: 146, a: 14 } : ex === "amazed" ? { y: 122, a: -6 } : ex === "suspicious" ? { y: 120, a: -14 } : ex === "delighted" ? { y: 132, a: -4 } : { y: 138, a: 0 };
  const browR = ex === "squint" ? { y: 146, a: -14 } : ex === "amazed" ? { y: 122, a: 6 } : ex === "suspicious" ? { y: 150, a: -8 } : ex === "delighted" ? { y: 132, a: 4 } : { y: 138, a: 0 };
  const m = mouth ?? idleMouth[ex];
  const lx = lookX * 6, ly = lookY * 5;
  const b = breathe * 3;
  return (
    <svg viewBox="0 0 400 760" width={width} height={(width * 760) / 400} style={{ overflow: "visible", ...style }}>
      <ellipse cx={200} cy={744} rx={110} ry={14} fill="#000" opacity={0.18} />
      {/* legs + sneakers */}
      <g>
        <rect x={144} y={470} width={52} height={238} rx={20} fill={JEANS} {...OUT} />
        <rect x={204} y={470} width={52} height={238} rx={20} fill={JEANS} {...OUT} />
        {[{ x: 120, f: -1 }, { x: 206, f: 1 }].map((s, i) => (
          <g key={i}>
            <path d={`M ${s.x} 740 L ${s.x} 712 Q ${s.x + 6} 692 ${s.x + 36} 692 L ${s.x + 60} 692 Q ${s.x + 76} 700 ${s.x + 76} 718 L ${s.x + 76} 740 Z`} fill="#fff" {...OUT} transform={s.f < 0 ? `translate(${2 * s.x + 76} 0) scale(-1 1)` : undefined} />
            <rect x={s.x - 2} y={730} width={80} height={12} rx={6} fill="#D9DEE8" {...OUT} strokeWidth={4} />
            <path d={`M ${s.x + 24} 712 L ${s.x + 54} 704`} stroke="#E0484F" strokeWidth={6} strokeLinecap="round" />
          </g>
        ))}
      </g>
      {/* arms behind torso? no: back arm drawn first */}
      <g transform={`translate(0 ${-b})`}>
        <Arm x={126} y={322} arm={leftArm} side={1} hold={holdLeft} />
        {/* torso (hoodie) */}
        <path d="M 126 300 Q 200 278 274 300 Q 292 400 284 500 L 116 500 Q 108 400 126 300 Z" fill={HOODIE} {...OUT} />
        <rect x={116} y={478} width={168} height={28} rx={10} fill={HOODIE_DARK} {...OUT} />
        <path d="M 150 420 L 250 420 L 240 468 L 160 468 Z" fill={HOODIE_DARK} {...OUT} strokeWidth={4} opacity={0.9} />
        {/* hood collar + strings */}
        <path d="M 150 296 Q 200 330 250 296 Q 236 282 200 280 Q 164 282 150 296 Z" fill={HOODIE_DARK} {...OUT} />
        <path d="M 186 312 L 182 360 M 214 312 L 218 360" stroke="#fff" strokeWidth={5} strokeLinecap="round" />
        <circle cx={182} cy={364} r={5} fill="#fff" />
        <circle cx={218} cy={364} r={5} fill="#fff" />
        {/* neck */}
        <rect x={182} y={252} width={36} height={40} rx={10} fill={SKIN_SHADE} {...OUT} />
        {/* HEAD */}
        <g transform={`translate(${lean} 0) rotate(${tilt} 200 260)`}>
          <ellipse cx={122} cy={182} rx={14} ry={20} fill={SKIN} {...OUT} />
          <ellipse cx={278} cy={182} rx={14} ry={20} fill={SKIN} {...OUT} />
          <path d="M 122 150 Q 120 76 200 74 Q 280 76 278 150 L 280 200 Q 274 268 200 272 Q 126 268 120 200 Z" fill={SKIN} {...OUT} />
          {/* light beard (stubble) */}
          <path d="M 124 196 Q 128 266 200 270 Q 272 266 276 196 Q 266 236 236 242 Q 200 250 164 242 Q 134 236 124 196 Z" fill="#5B3A2A" opacity={0.42} />
          <path d="M 176 210 Q 200 202 224 210" stroke="#5B3A2A" strokeWidth={6} strokeLinecap="round" opacity={0.5} fill="none" />
          {/* hair */}
          <path d="M 118 168 Q 108 70 200 62 Q 290 64 284 166 Q 276 116 246 108 Q 206 92 170 106 Q 130 116 118 168 Z" fill={HAIR} {...OUT} />
          <path d="M 168 72 Q 196 48 236 64 Q 214 70 204 84 Z" fill={HAIR} {...OUT} strokeWidth={4} />
          {/* brows */}
          <rect x={146} y={browL.y - 6} width={42} height={12} rx={6} fill={HAIR} transform={`rotate(${browL.a} 167 ${browL.y})`} />
          <rect x={212} y={browR.y - 6} width={42} height={12} rx={6} fill={HAIR} transform={`rotate(${browR.a} 233 ${browR.y})`} />
          {/* eyes */}
          <Eye cx={167} kind={eyeL} blink={blink} lx={lx} ly={ly} />
          <Eye cx={233} kind={eyeR} blink={blink} lx={lx} ly={ly} />
          {/* nose */}
          <path d="M 198 182 Q 190 204 200 208 Q 208 208 212 204" fill="none" stroke={SKIN_SHADE} strokeWidth={5} strokeLinecap="round" />
          {/* cheeks */}
          {ex === "delighted" && <><ellipse cx={150} cy={205} rx={14} ry={8} fill="#E58A7A" opacity={0.45} /><ellipse cx={250} cy={205} rx={14} ry={8} fill="#E58A7A" opacity={0.45} /></>}
          {/* mouth */}
          <g transform="translate(200 232)">{mouthShape(m)}</g>
        </g>
        <Arm x={274} y={322} arm={rightArm} side={-1} hold={holdRight} />
      </g>
    </svg>
  );
};
