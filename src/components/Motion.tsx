import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONTS} from '../config';

export const useSpring = (delay = 0, config: Parameters<typeof spring>[0]['config'] = {damping: 14, stiffness: 180, mass: 0.7}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config});
};

/** Pop-in: scale + fade, with a slight overshoot. */
export const Pop: React.FC<{
  at: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  from?: number;
  y?: number;
  x?: number;
  rotate?: number;
  bouncy?: boolean;
}> = ({at, children, style, from = 0.3, y = 0, x = 0, rotate = 0, bouncy = true}) => {
  const s = useSpring(at, bouncy ? {damping: 9, stiffness: 200, mass: 0.6} : {damping: 16, stiffness: 160, mass: 0.8});
  const frame = useCurrentFrame();
  if (frame < at) return null;
  return (
    <div
      style={{
        ...style,
        opacity: Math.min(1, s * 2),
        transform: `${style?.transform ?? ''} translate(${(1 - s) * x}px, ${(1 - s) * y}px) scale(${from + (1 - from) * s}) rotate(${(1 - s) * rotate}deg)`,
      }}
    >
      {children}
    </div>
  );
};

/** Scene entrance: punch-zoom / swipe so every cut has energy. */
export const SceneEnter: React.FC<{
  kind: 'zoom' | 'swipeLeft' | 'swipeUp' | 'none';
  children: React.ReactNode;
}> = ({kind, children}) => {
  const s = useSpring(0, {damping: 18, stiffness: 170, mass: 0.8});
  let transform = 'none';
  let filter = 'none';
  if (kind === 'zoom') {
    transform = `scale(${interpolate(s, [0, 1], [1.25, 1])})`;
    filter = `blur(${interpolate(s, [0, 0.6], [14, 0], {extrapolateRight: 'clamp'})}px)`;
  } else if (kind === 'swipeLeft') {
    transform = `translateX(${interpolate(s, [0, 1], [-1080, 0])}px)`;
  } else if (kind === 'swipeUp') {
    transform = `translateY(${interpolate(s, [0, 1], [1920, 0])}px)`;
  }
  return <AbsoluteFill style={{transform, filter}}>{children}</AbsoluteFill>;
};

/** Diagonal color panel that sweeps across the frame (covers a cut). */
export const Wipe: React.FC<{at: number; color?: string; duration?: number; direction?: 1 | -1}> = ({
  at,
  color = COLORS.water,
  duration = 14,
  direction = 1,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [at, at + duration], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (p <= 0 || p >= 1) return null;
  const x = interpolate(p, [0, 1], [-1.6, 1.6]) * 1080 * direction;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          top: -400,
          left: 0,
          width: 1400,
          height: 2800,
          transform: `translateX(${x - 160}px) rotate(14deg)`,
          background: `linear-gradient(90deg, rgba(255,255,255,0) 0%, ${color} 18%, ${color} 82%, rgba(255,255,255,0) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};

/** Quick white flash. */
export const Flash: React.FC<{at: number; duration?: number; opacity?: number}> = ({at, duration = 8, opacity = 0.9}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at, at + 2, at + duration], [0, opacity, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (o <= 0) return null;
  return <AbsoluteFill style={{background: 'white', opacity: o, pointerEvents: 'none'}} />;
};

/** Glassy rounded badge with icon and Arabic label. */
export const Badge: React.FC<{
  icon?: React.ReactNode;
  children: React.ReactNode;
  fontSize?: number;
  bg?: string;
  color?: string;
  style?: React.CSSProperties;
}> = ({icon, children, fontSize = 56, bg = 'rgba(255,255,255,0.92)', color = COLORS.navy, style}) => (
  <div
    dir="rtl"
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 22,
      padding: '18px 34px 18px 30px',
      borderRadius: 999,
      background: bg,
      boxShadow: '0 18px 40px rgba(6,26,58,0.28), inset 0 2px 0 rgba(255,255,255,0.9)',
      border: '3px solid rgba(255,255,255,0.95)',
      fontFamily: FONTS.arabic,
      fontWeight: 900,
      fontSize,
      color,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {icon}
    <span style={{lineHeight: 1.25}}>{children}</span>
  </div>
);

export const countUp = (frame: number, from: number, dur: number, target: number) =>
  Math.round(
    interpolate(frame, [from, from + dur], [0, target], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: (t) => 1 - Math.pow(1 - t, 3),
    }),
  );

/** Camera shake offset. */
export const shake = (frame: number, strength: number) => ({
  x: Math.sin(frame * 2.1) * strength + Math.sin(frame * 5.3) * strength * 0.4,
  y: Math.cos(frame * 1.7) * strength * 0.8 + Math.sin(frame * 4.1) * strength * 0.3,
});
