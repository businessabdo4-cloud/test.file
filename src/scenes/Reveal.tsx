import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {GRADES, StockVideo} from '../components/Media';
import {Product} from '../components/Product';
import {COLORS} from '../config';
import {PRODUCTS, STOCK} from '../media';
import {at} from '../timeline';

/** Liquid splash wipe: a wobbly water circle that expands from the center. */
const SplashWipe: React.FC<{progress: number}> = ({progress}) => {
  const frame = useCurrentFrame();
  const R = interpolate(progress, [0, 1], [0, 1500]);
  const pts: string[] = [];
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * Math.PI * 2;
    const r = R * (1 + 0.08 * Math.sin(a * 7 + frame / 2) + 0.05 * Math.sin(a * 13 - frame / 3));
    pts.push(`${540 + Math.cos(a) * r},${960 + Math.sin(a) * r}`);
  }
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <defs>
        <radialGradient id="splash">
          <stop offset="0.6" stopColor="#FFFFFF" />
          <stop offset="0.85" stopColor={COLORS.sky} />
          <stop offset="1" stopColor={COLORS.water} />
        </radialGradient>
      </defs>
      <polygon points={pts.join(' ')} fill="url(#splash)" />
    </svg>
  );
};

const Title: React.FC<{start: number}> = ({start}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const letters = 'GLASSE\u00A0POWER'.split('');
  return (
    <div
      style={{
        position: 'absolute',
        top: 175,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        fontFamily: 'Montserrat',
        fontWeight: 900,
        fontSize: 112,
        letterSpacing: -2,
        direction: 'ltr',
      }}
    >
      {letters.map((l, i) => {
        const s = spring({frame: frame - start - i * 1.5, fps, config: {damping: 10, stiffness: 220, mass: 0.6}});
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              width: l === '\u00A0' ? 30 : undefined,
              opacity: Math.min(1, s * 2),
              transform: `translateY(${(1 - s) * -120}px) scale(${0.4 + 0.6 * s})`,
              background: `linear-gradient(180deg, ${COLORS.water} 0%, ${COLORS.deepBlue} 100%)`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              filter: 'drop-shadow(0 6px 0 rgba(255,255,255,0.9)) drop-shadow(0 14px 24px rgba(6,26,58,0.35))',
            }}
          >
            {l}
          </span>
        );
      })}
    </div>
  );
};

export const Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const wipe = interpolate(frame, [0, 12], [0, 1], {extrapolateRight: 'clamp', easing: (t) => 1 - Math.pow(1 - t, 2)});
  const titleAt = Math.max(8, at('reveal', 8) - 4);
  const fly = spring({frame: frame - 6, fps, config: {damping: 12, stiffness: 120, mass: 0.9}});
  const product = PRODUCTS.pairCutout ?? PRODUCTS.blueCutout;

  return (
    <AbsoluteFill>
      <Background variant="bright" bubbles={22} seed="reveal" />
      {STOCK.splash && frame < 16 && (
        <AbsoluteFill style={{opacity: interpolate(frame, [10, 16], [1, 0], {extrapolateLeft: 'clamp'})}}>
          <StockVideo clip={STOCK.splash} grade={GRADES.solution} zoom={[1.2, 1.05]} />
        </AbsoluteFill>
      )}
      {!STOCK.splash && wipe < 1 && <SplashWipe progress={wipe} />}
      {/* glow behind product */}
      <div
        style={{
          position: 'absolute',
          left: 90,
          top: 480,
          width: 900,
          height: 900,
          borderRadius: '50%',
          background: 'radial-gradient(closest-side, rgba(255,255,255,1), rgba(127,211,255,0.45) 60%, rgba(127,211,255,0))',
          transform: `scale(${0.6 + fly * 0.4 + Math.sin(frame / 10) * 0.03})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 420,
          transform: `translateX(-50%) translateY(${(1 - fly) * 1100}px) rotate(${(1 - fly) * -18}deg) scale(${0.7 + fly * 0.3})`,
        }}
      >
        <Product src={product} width={product === PRODUCTS.pairCutout ? 900 : 680} shine={24} />
      </div>
      <Title start={titleAt} />
    </AbsoluteFill>
  );
};
