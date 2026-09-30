import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Logo} from './components/Brand';
import {Captions} from './components/Captions';
import {loadFonts} from './fonts';
import {CallToAction} from './scenes/CallToAction';
import {Hook} from './scenes/Hook';
import {Offer} from './scenes/Offer';
import {Problem} from './scenes/Problem';
import {Punchline} from './scenes/Punchline';
import {archPath, beat, brand, ease, FPS, prog, TR} from './theme';

loadFonts();

/**
 * Three transition styles, each landing on the pause between beats:
 *  T1 hook→problem         arch-shaped mask wipe (yellow leading band)
 *  T2 problem→offer, T3 offer→punchline   horizontal slide
 *  T4 punchline→CTA        soft zoom-through
 */
export const Ad: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const [a1, b1] = TR.t1;
  const [a2, b2] = TR.t2;
  const [a3, b3] = TR.t3;
  const [a4, b4] = TR.t4;
  const p1 = prog(t, a1, b1 - a1, ease.inOut);
  const p2 = prog(t, a2, b2 - a2, ease.inOut);
  const p3 = prog(t, a3, b3 - a3, ease.inOut);
  const p4 = prog(t, a4, b4 - a4, ease.inOut);

  const aw = 80 + p1 * 2900;
  const ah = 60 + p1 * 3300;
  const ax = 540 - aw / 2;
  const ay = 1920 - ah + p1 * 500;
  const band = 26;

  // small logo watermark while the problem and the punchline play (the offer and CTA show the big logo)
  const wm = (s: number, e: number) => prog(t, s + 0.3, 0.4) * (1 - prog(t, e, 0.25));
  const watermark = Math.max(wm(beat(2).start, beat(2).end), wm(beat(4).start, beat(4).end));

  return (
    <AbsoluteFill style={{background: brand.navy}}>
      {t < b1 && (
        <AbsoluteFill style={{transform: `scale(${1 + 0.06 * p1})`}}>
          <Hook />
        </AbsoluteFill>
      )}
      {t >= a1 && t < b2 && (
        <AbsoluteFill style={{transform: `translateX(${-1080 * p2}px)`}}>
          {p1 < 1 && <AbsoluteFill style={{background: brand.yellow, clipPath: `path('${archPath(aw + 2 * band, ah + band, ax - band, ay - band)}')`}} />}
          <AbsoluteFill style={{clipPath: p1 < 1 ? `path('${archPath(aw, ah, ax, ay)}')` : undefined}}>
            <Problem />
          </AbsoluteFill>
        </AbsoluteFill>
      )}
      {t >= a2 && t < b3 && (
        <AbsoluteFill style={{transform: `translateX(${1080 * (1 - p2) - 1080 * p3}px)`}}>
          <Offer />
        </AbsoluteFill>
      )}
      {/* CTA sits underneath; the punchline zooms through and dissolves off the top of it */}
      {t >= a4 && (
        <AbsoluteFill style={{transform: `scale(${0.92 + 0.08 * p4})`}}>
          <CallToAction />
        </AbsoluteFill>
      )}
      {t >= a3 && t < b4 && (
        <AbsoluteFill style={{transform: `translateX(${1080 * (1 - p3)}px) scale(${1 + 0.3 * p4})`, opacity: 1 - p4, filter: p4 > 0 ? `brightness(${1 + 0.35 * p4})` : undefined}}>
          <Punchline />
        </AbsoluteFill>
      )}
      {watermark > 0.01 && (
        <div style={{position: 'absolute', left: 44, top: 196, opacity: 0.92 * watermark}}>
          <Logo width={180} />
        </div>
      )}
      <Captions />
    </AbsoluteFill>
  );
};
