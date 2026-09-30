import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {LOGO_WATERMARK} from '../config';
import {scene} from '../timeline';
import {Logo} from './Logo';

/**
 * WATER MAROC logo kept on screen for the whole ad (top-left, on a white pill).
 * On the trust + end-card scenes the big logo is already on screen, so this one
 * hands over to it instead of showing two logos.
 */
export const Watermark: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {width, top, left, handOffToBigLogo} = LOGO_WATERMARK;
  const enter = spring({frame: frame - 3, fps, config: {damping: 14, stiffness: 160}});
  const bigLogoFrom = scene('trust').from;
  const hide = handOffToBigLogo
    ? interpolate(frame, [bigLogoFrom - 2, bigLogoFrom + 6], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    : 1;
  if (hide <= 0) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left,
        padding: '10px 22px 8px 16px',
        borderRadius: 26,
        background: 'rgba(255,255,255,0.9)',
        boxShadow: '0 8px 24px rgba(6,26,58,0.25)',
        opacity: Math.min(1, enter * 1.5) * hide,
        transform: `translateY(${(1 - enter) * -40}px) scale(${0.85 + 0.15 * enter})`,
        transformOrigin: 'left top',
        pointerEvents: 'none',
      }}
    >
      <Logo width={width} style={{display: 'block'}} />
    </div>
  );
};
