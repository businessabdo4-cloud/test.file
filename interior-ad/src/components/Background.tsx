import React from 'react';
import {AbsoluteFill} from 'remotion';
import {color} from '../theme';
import {Zellige} from './Zellige';

/** Slowly drifting warm gradient + faint zellige pattern (parallax: pattern drifts slower than content). */
export const Background: React.FC<{t: number; variant?: 'sand' | 'green'}> = ({t, variant = 'sand'}) => {
  const gx = 50 + 18 * Math.sin(t * 0.35);
  const gy = 30 + 12 * Math.cos(t * 0.27);
  const bg =
    variant === 'sand'
      ? `radial-gradient(120% 80% at ${gx}% ${gy}%, ${color.paper} 0%, ${color.sand} 45%, ${color.sandDeep} 100%)`
      : `radial-gradient(120% 80% at ${gx}% ${gy}%, ${color.greenSoft} 0%, ${color.green} 55%, #16302A 100%)`;
  return (
    <AbsoluteFill style={{background: bg}}>
      <Zellige
        color={variant === 'sand' ? color.brass : '#E9DCC6'}
        opacity={variant === 'sand' ? 0.1 : 0.07}
        x={t * 6}
        y={-t * 9}
        rotate={2 * Math.sin(t * 0.15)}
      />
      {/* soft vignette to keep the eye centred */}
      <AbsoluteFill
        style={{
          background:
            variant === 'sand'
              ? 'radial-gradient(90% 70% at 50% 45%, rgba(0,0,0,0) 60%, rgba(94,70,48,0.10) 100%)'
              : 'radial-gradient(90% 70% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.28) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};
