import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {Badge, Pop} from '../components/Motion';
import {Product} from '../components/Product';
import {COLORS, FONTS} from '../config';
import {PRODUCTS} from '../media';
import {at} from '../timeline';

const Label: React.FC<{text: string; color: string; at: number}> = ({text, color, at: t}) => (
  <Pop at={t} from={0.2} y={60}>
    <div
      dir="rtl"
      style={{
        padding: '8px 46px',
        borderRadius: 999,
        background: color,
        color: COLORS.white,
        fontFamily: FONTS.arabic,
        fontWeight: 900,
        fontSize: 76,
        boxShadow: `0 16px 34px ${color}88`,
        border: '5px solid white',
      }}
    >
      {text}
    </div>
  </Pop>
);

export const Colors: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tRed = at('colors', 23);
  const tBlue = at('colors', 23, 0.45);
  const sRed = spring({frame: frame - tRed, fps, config: {damping: 16, stiffness: 160}});
  const sBlue = spring({frame: frame - tBlue, fps, config: {damping: 16, stiffness: 160}});
  // share of the screen taken by the red half (red is on the right: read first in RTL)
  const redShare = 0.5 + 0.2 * sRed - 0.4 * sBlue;
  const split = 1080 * (1 - redShare);
  const intro = spring({frame, fps, config: {damping: 14, stiffness: 140}});
  const redScale = 1 + 0.12 * sRed - 0.44 * sBlue;
  const blueScale = 1 - 0.32 * sRed + 0.44 * sBlue;

  return (
    <AbsoluteFill>
      {/* blue (teal) half */}
      <AbsoluteFill style={{clipPath: `inset(0 ${1080 - split}px 0 0)`}}>
        <Background variant="teal" bubbles={10} seed="c-teal" />
      </AbsoluteFill>
      {/* red half */}
      <AbsoluteFill style={{clipPath: `inset(0 0 0 ${split}px)`}}>
        <Background variant="red" bubbles={10} seed="c-red" />
      </AbsoluteFill>
      <div style={{position: 'absolute', left: split - 4, top: 0, width: 8, height: 1920, background: 'white', boxShadow: '0 0 30px rgba(255,255,255,0.9)'}} />

      {/* products */}
      <div style={{position: 'absolute', left: split / 2, top: 640, transform: `translateX(-50%) translateY(${(1 - intro) * 900}px) scale(${blueScale})`}}>
        <Product src={PRODUCTS.blueCutout} width={440} label="BLEU" />
      </div>
      <div style={{position: 'absolute', left: split + (1080 - split) / 2, top: 640, transform: `translateX(-50%) translateY(${(1 - intro) * 900}px) scale(${redScale})`}}>
        <Product src={PRODUCTS.redCutout} width={440} label="ROUGE" />
      </div>

      {/* title */}
      <div style={{position: 'absolute', top: 170, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <Pop at={2} from={0.3}>
          <Badge fontSize={70}>جوج ألوان</Badge>
        </Pop>
      </div>
      {/* labels */}
      <div style={{position: 'absolute', top: 1190, left: split + (1080 - split) / 2, transform: `translateX(-50%) scale(${Math.min(1, redScale)})`}}>
        <Label text="الأحمر" color={COLORS.red} at={tRed} />
      </div>
      <div style={{position: 'absolute', top: 1190, left: split / 2, transform: `translateX(-50%) scale(${Math.min(1, blueScale)})`}}>
        <Label text="الزرق" color={COLORS.teal} at={tBlue} />
      </div>
      {/* subtle vignette so subtitles pop on light backgrounds */}
      <AbsoluteFill style={{background: `linear-gradient(to bottom, transparent 70%, rgba(6,26,58,${interpolate(frame, [0, 10], [0, 0.35], {extrapolateRight: 'clamp'})}) 100%)`}} />
    </AbsoluteFill>
  );
};
