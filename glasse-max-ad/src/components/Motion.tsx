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

/** Headline that pops in at `from` and scales away at `to` (top of frame, under the logo). */
export const Headline: React.FC<{from: number; to: number; top?: number; children: React.ReactNode}> = ({from, to, top = 190, children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < from || frame >= to) return null;
  const s = spring({frame: frame - from, fps, config: {damping: 10, stiffness: 200, mass: 0.6}});
  const out = interpolate(frame, [to - 5, to], [1, 0], {extrapolateLeft: 'clamp'});
  return (
    <div
      style={{
        position: 'absolute',
        top,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        opacity: Math.min(1, s * 2) * out,
        transform: `scale(${(0.4 + 0.6 * s) * (0.8 + 0.2 * out)})`,
      }}
    >
      {children}
    </div>
  );
};

/** Short digital glitch: RGB-split copies + slice jitter for `duration` frames from `at`. */
export const Glitch: React.FC<{at: number; duration?: number; children: React.ReactNode}> = ({at, duration = 7, children}) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  const on = t >= 0 && t < duration;
  if (!on) return <AbsoluteFill>{children}</AbsoluteFill>;
  const k = Math.sin(t * 12.9898) * 43758.5453;
  const r = k - Math.floor(k);
  const dx = (r - 0.5) * 60;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `translateX(${dx}px)`}}>{children}</AbsoluteFill>
      <AbsoluteFill style={{transform: `translateX(${-dx * 0.6 - 14}px)`, mixBlendMode: 'screen', opacity: 0.55, filter: 'sepia(1) saturate(8) hue-rotate(-50deg)'}}>
        {children}
      </AbsoluteFill>
      <AbsoluteFill style={{transform: `translateX(${dx * 0.6 + 14}px)`, mixBlendMode: 'screen', opacity: 0.55, filter: 'sepia(1) saturate(8) hue-rotate(160deg)'}}>
        {children}
      </AbsoluteFill>
      {[0, 1, 2].map((i) => {
        const y = ((r * 1000 + i * 613) % 1700) + 60;
        return <div key={i} style={{position: 'absolute', left: 0, right: 0, top: y, height: 18 + i * 22, background: 'rgba(255,255,255,0.18)', transform: `translateX(${(i % 2 ? 1 : -1) * dx * 1.5}px)`}} />;
      })}
    </AbsoluteFill>
  );
};
