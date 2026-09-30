import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Background} from '../components/Background';
import {Asterisk, Stripes} from '../components/Brand';
import {archPath, brand, ease, ev, font, FPS, NB, pop, prog, radius, wordStart} from '../theme';

/** Masked word reveal: slides up out of a clip line, synced to the word's start time. */
export const Word: React.FC<{t: number; at: number; children: React.ReactNode; style?: React.CSSProperties; lead?: number}> = ({
  t,
  at,
  children,
  style,
  lead = 0.06,
}) => {
  const p = prog(t, at - lead, 0.42, ease.out);
  return (
    <span style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', paddingBottom: '0.08em', ...style}}>
      <span style={{display: 'inline-block', transform: `translateY(${(1 - p) * 105}%)`, opacity: Math.min(1, p * 1.6)}}>
        {children}
      </span>
    </span>
  );
};

// Hook beats (s). The slam lands on "Designers", the second hit on "Maroc" (sound design uses the same times).
export const IMPACT = ev.impact;
export const MAROC_HIT = ev.marocHit;

const decay = (t: number, at: number, tau: number) => (t < at ? 0 : Math.exp(-(t - at) / tau));
const shake = (t: number) => {
  const a = 18 * decay(t, IMPACT, 0.11) + 8 * decay(t, MAROC_HIT, 0.09);
  return {x: a * Math.sin(t * 91.7) * Math.cos(t * 13.1), y: a * Math.sin(t * 77.3 + 1.3)};
};

const NOTIFS = [
  {title: 'Nouvelle demande', sub: `Projet${NB}: salon · Casablanca`},
  {title: 'Nouvelle demande', sub: `Rénovation villa · Marrakech`},
  {title: 'Nouvelle demande', sub: `Appartement · Rabat`},
];

const HouseIcon: React.FC<{c: string}> = ({c}) => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5.5 9v11h13V9" />
    <path d="M10 20v-5.5a2 2 0 0 1 4 0V20" />
  </svg>
);

const Notifications: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  const top = 1064;
  const h = 84;
  const gap = 14;
  const w = 780;
  return (
    <>
      {NOTIFS.map((n, i) => {
        const at = ev.notif[i];
        const enter = pop(frame, at, {damping: 15, stiffness: 170});
        if (t < at - 0.02) return null;
        let slot = 0; // every later arrival pushes this card one slot down
        for (let j = i + 1; j < NOTIFS.length; j++) slot += pop(frame, ev.notif[j], {damping: 18, stiffness: 170});
        const glow = Math.max(0, 1 - prog(t, at + 0.15, 0.6)) * (slot < 0.5 ? 1 : 0);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: (1080 - w) / 2,
              top: top + slot * (h + gap),
              width: w,
              height: h,
              transform: `translateX(${(1 - enter) * 700}px) scale(${1 - 0.035 * slot})`,
              opacity: Math.min(1, enter * 1.4) * (1 - 0.2 * slot),
              background: brand.white,
              borderRadius: radius.card,
              boxShadow: `0 16px 36px rgba(0,6,20,0.45)${glow > 0 ? `, 0 0 0 ${3 * glow}px ${brand.yellow}, 0 0 ${30 * glow}px ${brand.yellow}88` : ''}`,
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              padding: '0 26px',
              boxSizing: 'border-box',
              fontFamily: font.sans,
              zIndex: 10 - i + NOTIFS.length,
            }}
          >
            <div style={{width: 54, height: 54, borderRadius: 17, background: brand.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>
              <HouseIcon c={brand.yellow} />
            </div>
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
                <span style={{fontWeight: 800, fontSize: 29, color: brand.navy}}>{n.title}</span>
                <span style={{fontWeight: 500, fontSize: 21, color: '#4A5875'}}>à l’instant</span>
              </div>
              <div style={{fontWeight: 500, fontSize: 24, color: '#4A5875', marginTop: 2}}>{n.sub}</div>
            </div>
            <div style={{width: 12, height: 12, borderRadius: 6, background: brand.yellow, flex: 'none'}} />
          </div>
        );
      })}
    </>
  );
};

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;

  // camera: starts punched in, snaps back on the impact, then drifts in slowly
  const cam = (1.12 - 0.12 * prog(t, IMPACT, 0.4, ease.out)) * (1 + 0.03 * prog(t, 0.7, 3.2, ease.inOut));
  const sh = shake(t);
  const flash = 0.55 * decay(t, IMPACT, 0.07) + 0.18 * decay(t, MAROC_HIT, 0.06);

  // "DESIGNERS" slam: accelerates in from huge, lands on IMPACT with a damped wobble
  const inP = prog(t, -0.12, IMPACT + 0.12, ease.in);
  const wob = t < IMPACT ? 0 : -0.06 * Math.exp(-(t - IMPACT) * 9) * Math.cos((t - IMPACT) * 38);
  const slam = t < IMPACT ? 2.7 - 1.7 * inP : 1 + wob;
  const slamOpacity = Math.min(1, 0.35 + inP);

  const stripes = prog(t, -0.12, 0.55, ease.out);
  const shineT = (t - 0.55) % 1.7;

  const intP = prog(t, wordStart(1) - 0.08, 0.36, ease.out); // d’intérieur sweeps in from the right
  const arch = pop(frame, MAROC_HIT - 0.06, {damping: 11, stiffness: 190});
  const star = pop(frame, MAROC_HIT, {damping: 9, stiffness: 160});

  const center: React.CSSProperties = {position: 'absolute', left: 120, right: 0, textAlign: 'center'};
  return (
    <AbsoluteFill>
      <Background t={t} />
      <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px) scale(${cam})`, transformOrigin: '52% 30%'}}>
        <Stripes x={64} y={232} w={952} h={588} draw={stripes} stroke={16} gap={12} shine={shineT >= 0 && shineT <= 1 ? shineT : -1} />

        <div style={{...center, top: 330, fontFamily: font.sans, fontWeight: 800, fontSize: 116, letterSpacing: 3, lineHeight: 1.05, color: brand.white, opacity: slamOpacity, transform: `scale(${slam})`, transformOrigin: '50% 55%', textShadow: t < IMPACT ? `0 0 ${24 * (1 - inP)}px ${brand.white}` : '0 8px 30px rgba(0,0,0,0.35)'}}>
          DESIGNERS
        </div>
        <div style={{...center, top: 458, fontFamily: font.serif, fontStyle: 'italic', fontWeight: 500, fontSize: 104, lineHeight: 1.05, color: brand.yellow, opacity: intP, transform: `translateX(${(1 - intP) * 420}px) skewX(${(1 - intP) * -12}deg)`}}>
          d’intérieur
        </div>

        {/* au + Maroc in a yellow Moroccan arch, with the logo asterisk popping on the hit */}
        <div style={{position: 'absolute', left: 120, right: 0, top: 594, height: 128, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 18}}>
          <div style={{fontFamily: font.sans, fontWeight: 700, fontSize: 46, color: brand.white, paddingBottom: 26}}>
            <Word t={t} at={wordStart(2)}>au</Word>
          </div>
          <div style={{position: 'relative', width: 370, height: 128, transform: `scale(${0.4 + 0.6 * arch})`, transformOrigin: '50% 100%', opacity: Math.min(1, arch * 2)}}>
            <svg width={370} height={128} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
              <path d={archPath(370, 128)} fill={brand.yellow} />
            </svg>
            <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 8, fontFamily: font.serif, fontWeight: 600, fontSize: 72, color: brand.navy}}>
              Maroc
            </div>
            <div style={{position: 'absolute', right: -52, top: -40, transform: `scale(${star})`, opacity: Math.min(1, star * 2)}}>
              <Asterisk size={64} rotate={(1 - star) * -120 + t * 30} color={brand.yellow} />
            </div>
          </div>
        </div>

        <div style={{position: 'absolute', left: 0, right: 0, textAlign: 'center', top: 842, fontFamily: font.sans, fontWeight: 700, fontSize: 52, color: brand.white}}>
          <Word t={t} at={wordStart(4)}>vous</Word> <Word t={t} at={wordStart(5)}>voulez</Word> <Word t={t} at={wordStart(6)}>attirer</Word>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, textAlign: 'center', top: 904, fontFamily: font.serif, fontWeight: 600, fontSize: 84, letterSpacing: -1, color: brand.white}}>
          <Word t={t} at={wordStart(7)} style={{color: brand.yellow}}>plus</Word> <Word t={t} at={wordStart(8)} style={{color: brand.yellow}}>de</Word>{' '}
          <Word t={t} at={wordStart(9)}>
            <span style={{color: brand.yellow}}>clients</span>
            {NB}?
          </Word>
        </div>
        <div style={{position: 'absolute', top: 1016, left: 540 - 230, width: 460 * prog(t, wordStart(9) + 0.05, 0.4, ease.out), height: 6, borderRadius: 3, background: brand.yellow}} />
        <Notifications t={t} frame={frame} />
      </AbsoluteFill>
      {/* impact flash */}
      {flash > 0.005 && <AbsoluteFill style={{background: brand.white, opacity: flash}} />}
    </AbsoluteFill>
  );
};
