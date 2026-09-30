import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {StockClip as Clip} from '../media';

// Color grades for footage (CSS filters — tweak here).
export const GRADES = {
  problem: 'saturate(0.35) brightness(0.62) contrast(1.15) sepia(0.12) hue-rotate(-8deg)',
  problemCool: 'saturate(0.4) brightness(0.68) contrast(1.12) hue-rotate(12deg)',
  solution: 'saturate(1.05) brightness(1.12) contrast(1.05) hue-rotate(-4deg)',
  warm: 'saturate(1.15) brightness(1.08) contrast(1.04) sepia(0.08)',
  blurBg: 'blur(18px) brightness(1.05) saturate(0.9)',
} as const;

/** Full-frame stock clip (already cropped to 9:16 by scripts/fetch_stock.py). */
export const StockVideo: React.FC<{
  clip: Clip;
  grade: string;
  zoom?: [number, number];
  style?: React.CSSProperties;
}> = ({clip, grade, zoom = [1.05, 1.12], style}) => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  const s = interpolate(frame, [0, durationInFrames], zoom);
  return (
    <AbsoluteFill style={{overflow: 'hidden', ...style}}>
      <OffthreadVideo
        src={staticFile(clip.file)}
        muted
        playbackRate={clip.playbackRate ?? 1}
        trimBefore={Math.round((clip.trimStart ?? 0) * fps)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: `${(clip.focusX ?? 0.5) * 100}% 50%`,
          filter: grade,
          transform: `scale(${s})`,
        }}
      />
    </AbsoluteFill>
  );
};

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
