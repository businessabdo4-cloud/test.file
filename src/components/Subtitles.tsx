import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONTS, SAFE} from '../config';
import {Highlight, PHRASES, Phrase} from '../timeline';

const ARABIC = /[؀-ۿ]/;

const OUTLINE = [
  // thick dark outline (ring of shadows) + soft drop shadow
  ...[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
    const r = (a * Math.PI) / 180;
    return `${(Math.cos(r) * 6).toFixed(1)}px ${(Math.sin(r) * 6).toFixed(1)}px 0 #06122B`;
  }),
  ...[22, 67, 112, 157, 202, 247, 292, 337].map((a) => {
    const r = (a * Math.PI) / 180;
    return `${(Math.cos(r) * 5).toFixed(1)}px ${(Math.sin(r) * 5).toFixed(1)}px 0 #06122B`;
  }),
  '0 10px 24px rgba(0,0,0,0.55)',
].join(', ');

const highlightColor = (word: string, hl: Highlight[]): string | null => {
  for (const h of hl) {
    if (typeof h === 'string' ? h === word : h.word === word) {
      return typeof h === 'string' ? COLORS.accent : h.color;
    }
  }
  return null;
};

const PhraseView: React.FC<{p: Phrase; next?: Phrase}> = ({p, next}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const inAt = (p.start - 0.06) * fps;
  const outAt = Math.min(next ? next.start - 0.03 : Infinity, p.end + 0.45) * fps;
  if (frame < inAt || frame > outAt) return null;

  const t = frame - inAt;
  const enter = spring({frame: t, fps, config: {damping: 13, stiffness: 220, mass: 0.6}});
  const exit = interpolate(frame, [outAt - 4, outAt], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const scale = interpolate(enter, [0, 1], [0.55, 1]) * interpolate(exit, [0, 1], [0.85, 1]);
  const y = interpolate(enter, [0, 1], [50, 0]);

  const words = p.text.split(' ');
  const isArabic = ARABIC.test(p.text);
  const size = p.text.length > 20 ? 84 : p.text.length > 13 ? 96 : 112;

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      style={{
        position: 'absolute',
        left: SAFE.side,
        right: SAFE.side,
        top: SAFE.subtitleCenterY,
        transform: `translateY(calc(-50% + ${y}px)) scale(${scale})`,
        opacity: Math.min(enter * 1.5, 1) * exit,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        columnGap: isArabic ? '0.28em' : '0.4em',
        fontFamily: isArabic ? FONTS.arabic : FONTS.latin,
        fontWeight: 900,
        fontSize: isArabic ? size : size * 0.9,
        lineHeight: 1.35,
        color: COLORS.white,
        textShadow: OUTLINE,
        textAlign: 'center',
      }}
    >
      {words.map((w, i) => {
        const color = highlightColor(w, p.highlight);
        // staggered pop on the key word
        const pop = color
          ? spring({frame: t - 3 - i, fps, config: {damping: 8, stiffness: 260, mass: 0.5}})
          : 1;
        const wScale = color ? interpolate(pop, [0, 1], [1.45, 1.04]) : 1;
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              margin: color ? '0 0.07em' : 0,
              color: color ?? COLORS.white,
              transform: `scale(${wScale}) rotate(${color ? interpolate(pop, [0, 1], [-6, 0]) : 0}deg)`,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

/** Dark gradient that keeps subtitles readable on top of footage. */
export const SubtitleScrim: React.FC<{strength?: number}> = ({strength = 0.6}) => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(to bottom, rgba(3,12,30,0) 58%, rgba(3,12,30,${strength * 0.75}) 72%, rgba(3,12,30,${strength}) 100%)`,
    }}
  />
);

export const Subtitles: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    {PHRASES.map((p, i) => (
      <PhraseView key={p.id} p={p} next={PHRASES[i + 1]} />
    ))}
  </AbsoluteFill>
);
