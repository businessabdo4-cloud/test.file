import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';

// Color grades for footage (CSS filters — tweak here).
export const GRADES = {
  problem: 'saturate(0.35) brightness(0.62) contrast(1.15) sepia(0.12) hue-rotate(-8deg)',
  problemCool: 'saturate(0.4) brightness(0.68) contrast(1.12) hue-rotate(12deg)',
  solution: 'saturate(1.05) brightness(1.12) contrast(1.05) hue-rotate(-4deg)',
  warm: 'saturate(1.15) brightness(1.08) contrast(1.04) sepia(0.08)',
  blurBg: 'blur(18px) brightness(1.05) saturate(0.9)',
} as const;

/** Still photo with a slow Ken-Burns move (used for the real kitchen photos). */
export const KenBurns: React.FC<{
  src: string;
  from?: [number, number, number]; // scale, x%, y%
  to?: [number, number, number];
  grade?: string;
  style?: React.CSSProperties;
}> = ({src, from = [1.1, 0, 0], to = [1.22, 0, -2], grade = 'none', style}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const p = interpolate(frame, [0, durationInFrames], [0, 1], {extrapolateRight: 'clamp'});
  const lerp = (i: number) => from[i] + (to[i] - from[i]) * p;
  return (
    <AbsoluteFill style={{overflow: 'hidden', ...style}}>
      <Img
        src={staticFile(src)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: grade,
          transform: `translate(${lerp(1)}%, ${lerp(2)}%) scale(${lerp(0)})`,
        }}
      />
    </AbsoluteFill>
  );
};
