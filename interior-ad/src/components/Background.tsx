import React from 'react';
import {AbsoluteFill} from 'remotion';
import {brand} from '../theme';
import {Zellige} from './Zellige';

/** Slowly drifting brand gradient + faint zellige pattern (parallax: pattern drifts slower than content). */
export const Background: React.FC<{t: number; variant?: 'navy' | 'royal'}> = ({t, variant = 'navy'}) => {
  const gx = 50 + 18 * Math.sin(t * 0.35);
  const gy = 32 + 12 * Math.cos(t * 0.27);
  const bg =
    variant === 'navy'
      ? `radial-gradient(120% 80% at ${gx}% ${gy}%, ${brand.navySoft} 0%, ${brand.navy} 50%, ${brand.navyDeep} 100%)`
      : `radial-gradient(120% 80% at ${gx}% ${gy}%, #1C4FC4 0%, ${brand.royal} 50%, ${brand.royalDeep} 100%)`;
  return (
    <AbsoluteFill style={{background: bg}}>
      <Zellige color={variant === 'navy' ? brand.yellow : brand.white} opacity={variant === 'navy' ? 0.07 : 0.07} x={t * 6} y={-t * 9} rotate={2 * Math.sin(t * 0.15)} />
      <AbsoluteFill style={{background: 'radial-gradient(90% 70% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,6,20,0.45) 100%)'}} />
    </AbsoluteFill>
  );
};
