import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Background} from '../components/Background';
import {Stripes} from '../components/Brand';
import {EyeSlash, Heart} from '../components/Icons';
import {InteriorArt} from '../components/InteriorArt';
import {decay, shake, slam, Word} from '../components/Kinetic';
import {brand, ease, ev, font, FPS, pop, prog, wordStart} from '../theme';

const TILE = 340;
const GAP = 10;

/** Full-bleed feed of interior posts: scrolls fast, then freezes hard on the beat and drains of colour. */
const Feed: React.FC<{t: number}> = ({t}) => {
  // scroll position: fast constant scroll, braking to a dead stop at the freeze
  const v = 820; // px/s
  const brake = 0.22;
  const tf = ev.freeze;
  const y = t < tf - brake ? v * t : v * (tf - brake) + v * brake * (1 - Math.pow(1 - Math.min(1, (t - (tf - brake)) / brake), 2)) / 2;
  const dead = prog(t, tf, 0.35, ease.out); // colour drains after the freeze
  const rows = 9;
  const offset = y % ((TILE + GAP) * 3);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 20, top: 180 - offset, filter: `grayscale(${dead}) brightness(${1 - 0.25 * dead})`}}>
        {Array.from({length: rows * 3}).map((_, i) => {
          const r = Math.floor(i / 3);
          const c = i % 3;
          return (
            <div key={i} style={{position: 'absolute', left: c * (TILE + GAP), top: r * (TILE + GAP), width: TILE, height: TILE, borderRadius: 22, overflow: 'hidden'}}>
              <InteriorArt variant={(i * 7 + r) % 5} id={`f${i}`} />
              {/* "0" view chip appears on every post once the feed is dead */}
              <div style={{position: 'absolute', left: 14, bottom: 14, display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 999, background: 'rgba(0,12,34,0.72)', color: brand.white, fontFamily: font.sans, fontWeight: 800, fontSize: 24, opacity: prog(t, ev.zeroView + (i % 5) * 0.03, 0.25)}}>
                <Heart size={22} color={brand.white} stroke={2.4} /> 0
              </div>
            </div>
          );
        })}
      </div>
      {/* darken the top so the headline reads, keep the lower feed visible */}
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${brand.navy}F2 0%, ${brand.navy}E6 40%, ${brand.navy}99 62%, ${brand.navy}CC 100%)`}} />
    </AbsoluteFill>
  );
};

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const IMPACT = ev.impact;
  const sh = shake(t, [[IMPACT, 18, 0.11], [ev.personne + 0.05, 10, 0.09], [ev.freeze, 6, 0.06]]);
  const flash = 0.5 * decay(t, IMPACT, 0.07) + 0.2 * decay(t, ev.personne + 0.05, 0.06);
  const cam = (1.12 - 0.12 * prog(t, IMPACT, 0.4, ease.out)) * (1 + 0.03 * prog(t, 0.7, 3.4, ease.inOut));

  const s1 = slam(t, IMPACT, 2.7, 0.34);
  const s2 = slam(t, ev.personne + 0.05, 1.9, 0.18);
  const stripes = prog(t, -0.12, 0.55, ease.out);
  const shineT = (t - 0.55) % 1.7;
  const swap = prog(t, ev.freeze + 0.02, 0.25, ease.in); // part A exits upward on the beat
  const badge = pop(frame, ev.zeroView, {damping: 11, stiffness: 180});

  const center: React.CSSProperties = {position: 'absolute', left: 120, right: 0, textAlign: 'center'};
  return (
    <AbsoluteFill>
      <Background t={t} />
      <Feed t={t} />
      <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px) scale(${cam})`, transformOrigin: '52% 28%'}}>
        <Stripes x={64} y={232} w={952} h={560} draw={stripes} stroke={16} gap={12} shine={shineT >= 0 && shineT <= 1 ? shineT : -1} />

        {/* part A: ARRÊTEZ de poster vos projets / sur les réseaux sociaux… */}
        {swap < 1 && (
          <div style={{opacity: 1 - swap, transform: `translateY(${-60 * swap}px)`}}>
            <div style={{...center, top: 330, fontFamily: font.sans, fontWeight: 800, fontSize: 124, letterSpacing: 3, color: brand.white, opacity: s1.opacity, transform: `scale(${s1.scale})`, transformOrigin: '50% 55%'}}>
              ARRÊTEZ
            </div>
            <div style={{...center, top: 476, fontFamily: font.serif, fontStyle: 'italic', fontWeight: 500, fontSize: 74, color: brand.yellow}}>
              <Word t={t} at={wordStart(1)}>de</Word> <Word t={t} at={wordStart(2)}>poster</Word> <Word t={t} at={wordStart(3)}>vos</Word>{' '}
              <Word t={t} at={wordStart(4)}>projets</Word>
            </div>
            <div style={{...center, top: 588, fontFamily: font.sans, fontWeight: 700, fontSize: 52, color: brand.white}}>
              <Word t={t} at={wordStart(5)}>sur</Word> <Word t={t} at={wordStart(6)}>les</Word> <Word t={t} at={wordStart(7)}>réseaux</Word>{' '}
              <Word t={t} at={wordStart(8)}>sociaux…</Word>
            </div>
          </div>
        )}

        {/* part B: si c’est pour que / PERSONNE / ne les voie. */}
        {t >= ev.freeze && (
          <>
            <div style={{...center, top: 338, fontFamily: font.sans, fontWeight: 700, fontSize: 52, color: brand.white}}>
              <Word t={t} at={wordStart(9)}>si</Word> <Word t={t} at={wordStart(10)}>c’est</Word> <Word t={t} at={wordStart(11)}>pour</Word>{' '}
              <Word t={t} at={wordStart(12)}>que</Word>
            </div>
            <div style={{...center, top: 410, fontFamily: font.sans, fontWeight: 800, fontSize: 128, letterSpacing: 2, color: brand.yellow, opacity: t < ev.personne - 0.2 ? 0 : s2.opacity, transform: `scale(${s2.scale})`, transformOrigin: '50% 55%'}}>
              PERSONNE
            </div>
            <div style={{...center, top: 568, fontFamily: font.serif, fontStyle: 'italic', fontWeight: 500, fontSize: 80, color: brand.white}}>
              <Word t={t} at={wordStart(14)}>ne</Word> <Word t={t} at={wordStart(15)}>les</Word> <Word t={t} at={wordStart(16)}>voie.</Word>
            </div>
          </>
        )}

        {/* eye-slash + 0 vue */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 870, display: 'flex', justifyContent: 'center', opacity: Math.min(1, badge * 2), transform: `scale(${0.5 + 0.5 * badge})`}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '22px 44px', borderRadius: 999, background: brand.navyDeep, border: `3px solid ${brand.yellow}`, boxShadow: `0 20px 50px rgba(0,6,20,0.6), 0 0 40px ${brand.yellow}44`}}>
            <EyeSlash size={70} color={brand.yellow} stroke={2.2} />
            <span style={{fontFamily: font.sans, fontWeight: 800, fontSize: 72, color: brand.white}}>0 vue</span>
          </div>
        </div>
      </AbsoluteFill>
      {flash > 0.005 && <AbsoluteFill style={{background: brand.white, opacity: flash}} />}
    </AbsoluteFill>
  );
};
