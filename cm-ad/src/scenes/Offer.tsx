import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Background} from '../components/Background';
import {Logo} from '../components/Brand';
import {Calendar, Camera, Chat, Check, Target} from '../components/Icons';
import {Word} from '../components/Kinetic';
import {beat, brand, ease, ev, font, FPS, lerp, pop, prog, wordStart} from '../theme';

const B3 = beat(3);
const PHASE2 = ev.tiles[0] - 0.12; // logo docks to the top, tiles take over

const TILES = [
  {label: 'Stratégie', Icon: Target},
  {label: 'Création de contenu', Icon: Camera},
  {label: 'Publication', Icon: Calendar},
  {label: 'Réponses à votre communauté', Icon: Chat},
];

/** A→Z: four brand stripes race from an « A » disc to a « Z » disc. */
const AtoZ: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  const [ta, tz] = ev.aToZ;
  const a = pop(frame, ta - 0.04, {damping: 11, stiffness: 190});
  const z = pop(frame, tz - 0.02, {damping: 11, stiffness: 190});
  const draw = prog(t, ta + 0.02, tz - ta + 0.08, ease.inOut);
  const y = 900;
  const x0 = 240;
  const x1 = 840;
  const disc = (letter: string, x: number, k: number) => (
    <div style={{position: 'absolute', left: x - 78, top: y - 78, width: 156, height: 156, borderRadius: 78, background: brand.yellow, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font.serif, fontWeight: 600, fontSize: 96, color: brand.navy, transform: `scale(${k})`, boxShadow: `0 0 ${40 * k}px ${brand.yellow}66`}}>
      {letter}
    </div>
  );
  return (
    <>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {[0, 1, 2, 3].map((i) => {
          const yy = y - 45 + i * 30;
          const len = Math.max(0, Math.min(1, draw * 1.12 - i * 0.04));
          if (len <= 0.005) return null; // round caps would otherwise show as dots before drawing
          return <line key={i} x1={x0} y1={yy} x2={lerp(x0, x1, Math.max(0, Math.min(1, draw * 1.12 - i * 0.04)))} y2={yy} stroke={brand.yellow} strokeWidth={14} strokeLinecap="round" />;
        })}
      </svg>
      {disc('A', x0 - 30, a)}
      {disc('Z', x1 + 30, z)}
    </>
  );
};

const Tile: React.FC<{t: number; frame: number; i: number}> = ({t, frame, i}) => {
  const at = ev.tiles[i];
  const next = ev.tiles[i + 1] ?? B3.end + 0.3;
  const k = pop(frame, at - 0.06, {damping: 13, stiffness: 170});
  const active = t >= at && t < next;
  const done = t >= next;
  const checkK = pop(frame, next - 0.05, {damping: 12, stiffness: 200});
  const {label, Icon} = TILES[i];
  const w = 430;
  const h = 330;
  const x = i % 2 === 0 ? 95 : 555;
  const y = i < 2 ? 450 : 820;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: 34,
        background: active ? '#0E3170' : brand.navySoft,
        border: `3px solid ${active ? brand.yellow : done ? `${brand.yellow}88` : brand.line}`,
        boxShadow: active ? `0 20px 60px rgba(0,6,20,0.55), 0 0 50px ${brand.yellow}55` : '0 16px 40px rgba(0,6,20,0.45)',
        opacity: Math.min(1, k * 1.5),
        transform: `translateY(${(1 - k) * 60}px) scale(${(0.7 + 0.3 * k) * (active ? 1.03 : 1)})`,
        padding: '34px 34px',
        boxSizing: 'border-box',
      }}
    >
      <div style={{width: 112, height: 112, borderRadius: 30, background: brand.yellow, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Icon size={62} color={brand.navy} stroke={2} />
      </div>
      <div style={{marginTop: 26, fontFamily: font.sans, fontWeight: 800, fontSize: i === 3 ? 36 : 42, lineHeight: 1.15, color: brand.white}}>{label}</div>
      {done && (
        <div style={{position: 'absolute', right: 24, top: 24, width: 54, height: 54, borderRadius: 27, background: brand.yellow, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${checkK})`}}>
          <Check size={34} color={brand.navy} stroke={3} />
        </div>
      )}
    </div>
  );
};

export const Offer: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const cam = 1 + 0.03 * prog(t, B3.start - 0.4, B3.end - B3.start + 0.8, ease.inOut);
  const logoWipe = prog(t, ev.logo - 0.02, 0.55, ease.out);
  const dock = prog(t, PHASE2, 0.45, ease.inOut);
  const logoW = lerp(720, 420, dock);
  const logoTop = lerp(330, 226, dock);
  const phase1Out = prog(t, PHASE2, 0.3, ease.in);
  return (
    <AbsoluteFill>
      <Background t={t} />
      <AbsoluteFill style={{transform: `scale(${cam})`, transformOrigin: '50% 45%'}}>
        {/* Chez + logo */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 262, textAlign: 'center', fontFamily: font.sans, fontWeight: 800, fontSize: 38, letterSpacing: 10, color: brand.yellow, opacity: 1 - phase1Out}}>
          <Word t={t} at={wordStart(31)}>CHEZ</Word>
        </div>
        <div style={{position: 'absolute', left: (1080 - logoW) / 2, top: logoTop, clipPath: `inset(0 ${100 - 100 * logoWipe}% 0 0)`}}>
          <Logo width={logoW} />
        </div>

        {phase1Out < 1 && (
          <div style={{opacity: 1 - phase1Out, transform: `translateY(${-50 * phase1Out}px)`}}>
            <div style={{position: 'absolute', left: 0, right: 0, top: 660, textAlign: 'center', fontFamily: font.sans, fontWeight: 700, fontSize: 58, color: brand.white}}>
              <Word t={t} at={wordStart(34)}>on</Word> <Word t={t} at={wordStart(35)}>gère</Word> <Word t={t} at={wordStart(36)}>vos</Word>{' '}
              <Word t={t} at={wordStart(37)} style={{color: brand.yellow}}>réseaux</Word> <Word t={t} at={wordStart(38)} style={{color: brand.yellow}}>sociaux</Word>
            </div>
            <AtoZ t={t} frame={frame} />
          </div>
        )}

        {t >= PHASE2 - 0.1 && TILES.map((_, i) => <Tile key={i} t={t} frame={frame} i={i} />)}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
