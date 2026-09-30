import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';

export type BgVariant = 'murky' | 'problem' | 'bright' | 'red' | 'teal' | 'price' | 'warm' | 'cta';

const GRADIENTS: Record<BgVariant, [string, string, string]> = {
  murky: ['#3A3F3A', '#23261F', '#0E100C'],
  problem: ['#2B3542', '#18202B', '#0B1017'],
  bright: ['#FFFFFF', '#D9F1FF', '#8CCFF5'],
  red: ['#FFFFFF', '#FFE1E1', '#F7A3A3'],
  teal: ['#FFFFFF', '#D6F4F7', '#8CD5DE'],
  price: ['#1A6BFF', '#0B3D91', '#061A3A'],
  warm: ['#FFF6E5', '#FFD9A0', '#F29D52'],
  cta: ['#FFFFFF', '#E3F6FF', '#A9DDF7'],
};

/** Animated gradient + drifting light + bubbles. Every scene sits on one of these. */
export const Background: React.FC<{variant: BgVariant; bubbles?: number; seed?: string}> = ({
  variant,
  bubbles = 18,
  seed = variant,
}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const [a, b, c] = GRADIENTS[variant];
  const dark = variant === 'murky' || variant === 'problem' || variant === 'price';
  const drift = Math.sin(frame / 40) * 60;

  return (
    <AbsoluteFill style={{background: `radial-gradient(120% 80% at 50% ${38 + Math.sin(frame / 50) * 4}%, ${a} 0%, ${b} 55%, ${c} 100%)`}}>
      {/* moving soft light blobs */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(40% 25% at ${30 + drift / 20}% 20%, rgba(255,255,255,${dark ? 0.08 : 0.55}) 0%, transparent 70%),
                       radial-gradient(35% 22% at ${75 - drift / 25}% 70%, rgba(${dark ? '120,170,255' : '255,255,255'},${dark ? 0.1 : 0.5}) 0%, transparent 70%)`,
        }}
      />
      {/* bubbles / particles */}
      {new Array(bubbles).fill(0).map((_, i) => {
        const r = 6 + random(`${seed}-r-${i}`) * 26;
        const x = random(`${seed}-x-${i}`) * width;
        const speed = 1.2 + random(`${seed}-s-${i}`) * 2.8;
        const y = height + 80 - ((frame * speed + random(`${seed}-y-${i}`) * height * 1.3) % (height * 1.3));
        const wobble = Math.sin(frame / 12 + i) * 14;
        const op = dark ? 0.12 + random(`${seed}-o-${i}`) * 0.15 : 0.35 + random(`${seed}-o-${i}`) * 0.4;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x + wobble,
              top: y,
              width: r * 2,
              height: r * 2,
              borderRadius: '50%',
              opacity: op,
              background: dark
                ? 'radial-gradient(circle at 35% 35%, rgba(200,200,170,0.7), rgba(140,140,110,0.1))'
                : 'radial-gradient(circle at 32% 30%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.25) 35%, rgba(31,162,255,0.25) 100%)',
              border: dark ? 'none' : '2px solid rgba(255,255,255,0.8)',
            }}
          />
        );
      })}
      {/* light rays for bright scenes */}
      {!dark && (
        <AbsoluteFill
          style={{
            opacity: 0.35,
            background: `repeating-conic-gradient(from ${interpolate(frame, [0, 900], [0, 40])}deg at 50% -10%, rgba(255,255,255,0.0) 0deg 8deg, rgba(255,255,255,0.55) 10deg 13deg, rgba(255,255,255,0) 15deg 22deg)`,
            maskImage: 'linear-gradient(to bottom, black 0%, transparent 65%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 65%)',
          }}
        />
      )}
    </AbsoluteFill>
  );
};
