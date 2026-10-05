import React from "react";
import { COLORS } from "../brand";
import { MOUTHS, MouthShape } from "./Mouths";

/*
 * CITYBOT - original City Store mascot.
 * A small hovering robot whose head is a rounded smartphone; the screen is its face.
 * Every part is its own SVG group so it can be driven frame-by-frame:
 *   head (tilt) > screen > eyes (blink/look) > eyebrows > mouth (visemes)
 *   body, left arm, right arm (rotation + hand pose), hover thruster, ground shadow
 *
 * Coordinate space: viewBox 0 0 400 560. Head pivot = neck (200, 305).
 */

export type EyeStyle = "open" | "wide" | "happy" | "closed";
export type HandPose = "open" | "fist" | "point" | "thumb" | "wave";
export type Expression = "neutral" | "happy" | "excited" | "wink" | "proud";

export interface ArmPose {
  rot: number; // degrees; 0 = hanging down, positive = raised outward
  hand: HandPose;
}

export interface CitybotProps {
  width?: number;
  mouth?: MouthShape;
  expression?: Expression;
  blink?: number; // 0 open .. 1 closed
  lookX?: number; // -1..1
  lookY?: number; // -1..1
  tilt?: number; // head tilt, degrees
  leftArm?: ArmPose; // viewer's left
  rightArm?: ArmPose; // viewer's right
  hover?: number; // px the bot floats above its resting height (positive = up)
  squash?: number; // 1 = normal; <1 squashed (landing), >1 stretched (jump)
  flash?: number; // 0..1 white flash on the face screen
  thrust?: number; // 0..1 thruster glow intensity
  id?: string; // unique prefix for gradient/clip ids
  style?: React.CSSProperties;
  /** replaces the face (eyes/brows/mouth) with custom SVG drawn in screen space (x 108-292, y 68-287) */
  face?: React.ReactNode | null;
}

const EXPRESSIONS: Record<Expression, { left: EyeStyle; right: EyeStyle; browY: number; browAngle: number }> = {
  neutral: { left: "open", right: "open", browY: 0, browAngle: 0 },
  happy: { left: "happy", right: "happy", browY: -6, browAngle: 0 },
  excited: { left: "wide", right: "wide", browY: -12, browAngle: 8 },
  wink: { left: "open", right: "closed", browY: -4, browAngle: -6 },
  proud: { left: "happy", right: "happy", browY: -8, browAngle: -10 },
};

const OUTLINE = { stroke: COLORS.navy, strokeWidth: 6, strokeLinejoin: "round" as const };

const Eye: React.FC<{ cx: number; cy: number; style: EyeStyle; blink: number; mirror?: boolean }> = ({
  cx,
  cy,
  style,
  blink,
  mirror,
}) => {
  if (style === "happy" || style === "closed") {
    // ^ arc for happy, gentle downward curve for a wink / closed eye
    const d = style === "happy" ? "M -18 8 Q 0 -16 18 8" : "M -18 -2 Q 0 12 18 -2";
    return (
      <path d={d} transform={`translate(${cx} ${cy})`} fill="none" stroke={COLORS.white} strokeWidth={9} strokeLinecap="round" />
    );
  }
  const w = style === "wide" ? 38 : 32;
  const h = style === "wide" ? 56 : 48;
  const scaleY = Math.max(0.1, 1 - blink * 0.9);
  return (
    <g transform={`translate(${cx} ${cy}) scale(1 ${scaleY})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={w / 2} fill={COLORS.white} />
      {blink < 0.5 && (
        <>
          <circle cx={mirror ? -w * 0.18 : w * 0.18} cy={-h * 0.2} r={w * 0.17} fill={COLORS.mid} opacity={0.9} />
          <circle cx={mirror ? w * 0.12 : -w * 0.12} cy={h * 0.18} r={w * 0.08} fill={COLORS.cyan} opacity={0.6} />
        </>
      )}
    </g>
  );
};

const Hand: React.FC<{ pose: HandPose; armRot: number }> = ({ pose, armRot }) => {
  // Hand centre sits at (0, 76) in arm-local space.
  const counter = `rotate(${-armRot})`; // keeps thumb / wave fingers pointing up in world space
  switch (pose) {
    case "point":
      return (
        <g transform="translate(0 76)">
          <rect x={-7} y={4} width={14} height={34} rx={7} fill={COLORS.white} {...OUTLINE} />
          <circle r={17} fill={COLORS.white} {...OUTLINE} />
        </g>
      );
    case "thumb":
      return (
        <g transform="translate(0 76)">
          <g transform={counter}>
            <rect x={-7} y={-40} width={14} height={30} rx={7} fill={COLORS.white} {...OUTLINE} />
            <rect x={-18} y={-16} width={36} height={32} rx={14} fill={COLORS.white} {...OUTLINE} />
            <path d="M -10 -4 H 6 M -10 6 H 6" stroke={COLORS.navy} strokeWidth={3} strokeLinecap="round" opacity={0.5} />
          </g>
        </g>
      );
    case "wave":
      return (
        <g transform="translate(0 76)">
          <g transform={counter}>
            {[-26, 0, 26].map((a) => (
              <rect key={a} x={-6} y={-36} width={12} height={24} rx={6} fill={COLORS.white} {...OUTLINE} transform={`rotate(${a})`} />
            ))}
            <circle r={19} fill={COLORS.white} {...OUTLINE} />
          </g>
        </g>
      );
    case "fist":
      return <circle cx={0} cy={76} r={16} fill={COLORS.white} {...OUTLINE} />;
    default:
      return <circle cx={0} cy={76} r={19} fill={COLORS.white} {...OUTLINE} />;
  }
};

const Arm: React.FC<{ x: number; y: number; pose: ArmPose; side: 1 | -1 }> = ({ x, y, pose, side }) => {
  const rot = pose.rot * side;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-13} y={-10} width={26} height={78} rx={13} fill={COLORS.white} {...OUTLINE} />
      <rect x={-13} y={30} width={26} height={8} fill={COLORS.cyan} opacity={0.55} />
      <Hand pose={pose.hand} armRot={rot} />
    </g>
  );
};

export const Citybot: React.FC<CitybotProps> = ({
  width = 400,
  mouth = "X",
  expression = "neutral",
  blink = 0,
  lookX = 0,
  lookY = 0,
  tilt = 0,
  leftArm = { rot: 16, hand: "open" },
  rightArm = { rot: 16, hand: "open" },
  hover = 0,
  squash = 1,
  flash = 0,
  thrust = 0.6,
  id = "cb",
  style,
  face = null,
}) => {
  const ex = EXPRESSIONS[expression];
  const g = (n: string) => `${id}-${n}`;
  const lx = lookX * 7;
  const ly = lookY * 5;
  const shadowScale = 1 - Math.min(0.5, Math.max(0, hover) / 160);

  return (
    <svg
      viewBox="0 0 400 560"
      width={width}
      height={(width * 560) / 400}
      style={{ overflow: "visible", ...style }}
    >
      <defs>
        <linearGradient id={g("screen")} x1="0" y1="0" x2="1" y2="0.35">
          <stop offset="0" stopColor={COLORS.blue} />
          <stop offset="0.55" stopColor={COLORS.mid} />
          <stop offset="1" stopColor={COLORS.cyan} />
        </linearGradient>
        <radialGradient id={g("thrust")} cx="0.5" cy="0" r="1">
          <stop offset="0" stopColor={COLORS.white} stopOpacity={0.95} />
          <stop offset="0.35" stopColor={COLORS.cyan} stopOpacity={0.75} />
          <stop offset="1" stopColor={COLORS.cyan} stopOpacity={0} />
        </radialGradient>
        <filter id={g("soft")} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="#08146E" floodOpacity="0.32" />
        </filter>
        <clipPath id={g("screenClip")}>
          <rect x={108} y={68} width={184} height={219} rx={36} />
        </clipPath>
      </defs>

      {/* ground shadow (does not move with hover) */}
      <ellipse cx={200} cy={540} rx={74 * shadowScale} ry={11 * shadowScale} fill="#06104F" opacity={0.28 * shadowScale} />

      <g transform={`translate(0 ${-hover}) translate(200 520) scale(${1 / Math.sqrt(squash)} ${squash}) translate(-200 -520)`}>
        <g filter={`url(#${g("soft")})`}>
          {/* thruster glow */}
          <ellipse cx={200} cy={462} rx={22 + thrust * 6} ry={18 + thrust * 26} fill={`url(#${g("thrust")})`} opacity={0.35 + thrust * 0.6} />

          {/* ARMS (behind body) */}
          <g id="left-arm">
            <Arm x={146} y={350} pose={leftArm} side={1} />
          </g>
          <g id="right-arm">
            <Arm x={254} y={350} pose={rightArm} side={-1} />
          </g>

          {/* BODY */}
          <g id="body">
            <rect x={180} y={298} width={40} height={24} rx={8} fill={COLORS.navy} />
            <rect x={136} y={314} width={128} height={118} rx={46} fill={COLORS.white} {...OUTLINE} />
            <path d="M 152 334 Q 170 322 196 322" fill="none" stroke={COLORS.cyan} strokeWidth={5} strokeLinecap="round" opacity={0.45} />
            <circle cx={200} cy={370} r={19} fill={`url(#${g("screen")})`} stroke={COLORS.navy} strokeWidth={5} />
            <circle cx={200} cy={370} r={8} fill={COLORS.white} opacity={0.85} />
            <rect x={176} y={428} width={48} height={14} rx={7} fill={COLORS.navy} />
          </g>

          {/* HEAD */}
          <g id="head" transform={`rotate(${tilt} 200 305)`}>
            {/* antenna */}
            <rect x={196} y={20} width={8} height={34} rx={4} fill={COLORS.navy} />
            <circle cx={200} cy={18} r={11} fill={COLORS.cyan} stroke={COLORS.navy} strokeWidth={5} />
            <circle cx={196} cy={14} r={3.5} fill={COLORS.white} />
            {/* phone shell */}
            <rect x={312} y={112} width={9} height={40} rx={4} fill={COLORS.navy} />
            <rect x={79} y={104} width={9} height={26} rx={4} fill={COLORS.navy} />
            <rect x={88} y={50} width={224} height={256} rx={54} fill={COLORS.white} {...OUTLINE} />
            {/* screen = face */}
            <g id="screen" clipPath={`url(#${g("screenClip")})`}>
              <rect x={108} y={68} width={184} height={219} fill={`url(#${g("screen")})`} />
              {/* brand grid on the screen */}
              {Array.from({ length: 9 }).map((_, i) => (
                <line key={`v${i}`} x1={108 + i * 24} y1={68} x2={108 + i * 24} y2={287} stroke="#fff" strokeOpacity={0.1} strokeWidth={1.5} />
              ))}
              {Array.from({ length: 10 }).map((_, i) => (
                <line key={`h${i}`} x1={108} y1={68 + i * 24} x2={292} y2={68 + i * 24} stroke="#fff" strokeOpacity={0.1} strokeWidth={1.5} />
              ))}
              {/* glass reflection */}
              <path d="M 108 68 L 200 68 L 120 287 L 108 287 Z" fill="#fff" opacity={0.08} />
              <circle cx={200} cy={84} r={4.5} fill={COLORS.navy} opacity={0.45} />

              {face ? <g id="custom-face">{face}</g> : null}
              <g transform={`translate(${lx} ${ly})`} style={{ display: face ? "none" : undefined }}>
                {/* cheeks */}
                <ellipse cx={136} cy={214} rx={15} ry={8} fill="#fff" opacity={0.2} />
                <ellipse cx={264} cy={214} rx={15} ry={8} fill="#fff" opacity={0.2} />
                {/* eyebrows */}
                <g id="eyebrows">
                  <rect x={-15} y={-4} width={30} height={8} rx={4} fill="#fff" transform={`translate(160 ${116 + ex.browY}) rotate(${-ex.browAngle})`} />
                  <rect x={-15} y={-4} width={30} height={8} rx={4} fill="#fff" transform={`translate(240 ${116 + ex.browY}) rotate(${ex.browAngle})`} />
                </g>
                {/* eyes */}
                <g id="eyes">
                  <Eye cx={160} cy={160} style={ex.left} blink={blink} />
                  <Eye cx={240} cy={160} style={ex.right} blink={blink} mirror />
                </g>
                {/* mouth */}
                <g id="mouth" transform="translate(200 230)">
                  {MOUTHS[mouth]}
                </g>
              </g>
              {/* screen flash */}
              {flash > 0 && <rect x={108} y={68} width={184} height={219} fill="#fff" opacity={flash} />}
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};
