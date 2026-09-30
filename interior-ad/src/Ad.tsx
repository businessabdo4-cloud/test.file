import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Captions} from './components/Captions';
import {loadFonts} from './fonts';
import {CallToAction} from './scenes/CallToAction';
import {Guarantee} from './scenes/Guarantee';
import {Hook} from './scenes/Hook';
import {Offer} from './scenes/Offer';
import {archPath, color, ease, FPS, prog, TR} from './theme';

loadFonts();

/**
 * Three transition styles, each landing on a beat boundary:
 *  T1 hook→offer      arch-shaped mask wipe (Moroccan arch grows from the bottom)
 *  T2 offer→guarantee horizontal slide
 *  T3 guarantee→CTA   soft zoom-through
 */
export const Ad: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const [a1, b1] = TR.t1;
  const [a2, b2] = TR.t2;
  const [a3, b3] = TR.t3;
  const p1 = prog(t, a1, b1 - a1, ease.inOut);
  const p2 = prog(t, a2, b2 - a2, ease.inOut);
  const p3 = prog(t, a3, b3 - a3, ease.inOut);

  // arch wipe geometry: grows from a slim arch at the bottom centre to cover the frame
  const aw = 80 + p1 * 2900;
  const ah = 60 + p1 * 3300;
  const ax = 540 - aw / 2;
  const ay = 1920 - ah + p1 * 500;
  const band = 26;

  return (
    <AbsoluteFill style={{background: color.sand}}>
      {t < b1 && (
        <AbsoluteFill style={{transform: `scale(${1 + 0.06 * p1})`}}>
          <Hook />
        </AbsoluteFill>
      )}
      {t >= a1 && t < b2 && (
        <AbsoluteFill style={{transform: `translateX(${-1080 * p2}px)`}}>
          {p1 < 1 && (
            <AbsoluteFill style={{background: color.accent, clipPath: `path('${archPath(aw + 2 * band, ah + band, ax - band, ay - band)}')`}} />
          )}
          <AbsoluteFill style={{clipPath: p1 < 1 ? `path('${archPath(aw, ah, ax, ay)}')` : undefined}}>
            <Offer />
          </AbsoluteFill>
        </AbsoluteFill>
      )}
      {/* CTA sits underneath; the guarantee zooms through and dissolves off the top of it */}
      {t >= a3 && (
        <AbsoluteFill style={{transform: `scale(${0.92 + 0.08 * p3})`}}>
          <CallToAction />
        </AbsoluteFill>
      )}
      {t >= a2 && t < b3 && (
        <AbsoluteFill
          style={{
            transform: `translateX(${1080 * (1 - p2)}px) scale(${1 + 0.3 * p3})`,
            opacity: 1 - p3,
            filter: p3 > 0 ? `blur(${10 * p3}px)` : undefined,
          }}
        >
          <Guarantee />
        </AbsoluteFill>
      )}
      <Captions />
    </AbsoluteFill>
  );
};
