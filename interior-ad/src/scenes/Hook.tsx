import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Background} from '../components/Background';
import {archPath, color, ease, ev, font, FPS, lerp, NB, pop, prog, radius, shadow, wordStart} from '../theme';

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

const NOTIFS = [
  {title: 'Nouvelle demande', sub: `Projet${NB}: salon · Casablanca`},
  {title: 'Nouvelle demande', sub: `Rénovation villa · Marrakech`},
  {title: 'Nouvelle demande', sub: `Appartement · Rabat`},
];

const HouseIcon: React.FC<{c: string}> = ({c}) => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5.5 9v11h13V9" />
    <path d="M10 20v-5.5a2 2 0 0 1 4 0V20" />
  </svg>
);

const Notifications: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  const top = 1012;
  const h = 92;
  const gap = 16;
  const w = 780;
  return (
    <>
      {NOTIFS.map((n, i) => {
        const at = ev.notif[i];
        const enter = pop(frame, at, {damping: 15, stiffness: 170});
        if (t < at - 0.02) return null;
        // every later arrival pushes this card one slot down
        let slot = 0;
        for (let j = i + 1; j < NOTIFS.length; j++) slot += pop(frame, ev.notif[j], {damping: 18, stiffness: 170});
        const y = top + slot * (h + gap);
        const x = (1 - enter) * 700;
        const glow = Math.max(0, 1 - prog(t, at + 0.15, 0.6)) * (slot < 0.5 ? 1 : 0);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: (1080 - w) / 2,
              top: y,
              width: w,
              height: h,
              transform: `translateX(${x}px) scale(${1 - 0.035 * slot})`,
              opacity: Math.min(1, enter * 1.4) * (1 - 0.18 * slot),
              background: color.paper,
              borderRadius: radius.card,
              boxShadow: glow > 0 ? `${shadow.soft}, 0 0 0 ${2 * glow}px ${color.accent}55` : shadow.soft,
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              padding: '0 26px',
              boxSizing: 'border-box',
              fontFamily: font.sans,
              zIndex: 10 - i + NOTIFS.length,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 18,
                background: `${color.accent}1F`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 'none',
              }}
            >
              <HouseIcon c={color.accent} />
            </div>
            <div style={{flex: 1, minWidth: 0}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
                <span style={{fontWeight: 800, fontSize: 30, color: color.ink}}>{n.title}</span>
                <span style={{fontWeight: 500, fontSize: 22, color: color.inkSoft}}>à l’instant</span>
              </div>
              <div style={{fontWeight: 500, fontSize: 25, color: color.inkSoft, marginTop: 2}}>{n.sub}</div>
            </div>
            <div style={{width: 12, height: 12, borderRadius: 6, background: color.accent, flex: 'none'}} />
          </div>
        );
      })}
    </>
  );
};

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const cam = 1 + 0.035 * prog(t, 0, 3.9, ease.inOut);
  const floatY = Math.sin(t * 1.6) * 4;

  // arch highlight behind "Maroc"
  const archP = prog(t, wordStart(3) - 0.08, 0.5, ease.out);
  const archW = 420;
  const archH = 176;

  const line: React.CSSProperties = {position: 'absolute', left: 0, right: 0, textAlign: 'center', color: color.ink};
  return (
    <AbsoluteFill>
      <Background t={t} />
      <AbsoluteFill style={{transform: `scale(${cam})`, transformOrigin: '50% 42%'}}>
        <div style={{...line, top: 236 + floatY, fontFamily: font.serif, fontWeight: 600, fontSize: 156, letterSpacing: -2, lineHeight: 1.05}}>
          <Word t={t} at={wordStart(0)} lead={0.22}>
            Designers
          </Word>
        </div>
        <div style={{...line, top: 402 + floatY, fontFamily: font.serif, fontStyle: 'italic', fontWeight: 500, fontSize: 128, lineHeight: 1.05}}>
          <Word t={t} at={wordStart(1)}>d’intérieur</Word>
        </div>

        {/* au + Maroc in an arch */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 572 + floatY, height: archH, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 22}}>
          <div style={{fontFamily: font.sans, fontWeight: 700, fontSize: 54, color: color.inkSoft, paddingBottom: 34}}>
            <Word t={t} at={wordStart(2)}>au</Word>
          </div>
          <div style={{position: 'relative', width: archW, height: archH}}>
            <svg width={archW} height={archH} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
              <defs>
                <clipPath id="archGrow">
                  <rect x={0} y={archH * (1 - archP)} width={archW} height={archH * archP} />
                </clipPath>
              </defs>
              <path d={archPath(archW, archH)} fill={color.accent} clipPath="url(#archGrow)" />
              <path
                d={archPath(archW + 24, archH + 14, -12, -14)}
                fill="none"
                stroke={color.brass}
                strokeWidth={2.5}
                strokeDasharray={1400}
                strokeDashoffset={1400 * (1 - prog(t, wordStart(3) + 0.1, 0.7, ease.inOut))}
                opacity={0.8}
              />
            </svg>
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                paddingBottom: 14,
                fontFamily: font.serif,
                fontWeight: 600,
                fontSize: 104,
                color: color.paper,
              }}
            >
              <Word t={t} at={wordStart(3) + 0.04}>Maroc</Word>
            </div>
          </div>
        </div>

        <div style={{...line, top: 782, fontFamily: font.sans, fontWeight: 700, fontSize: 56, color: color.ink}}>
          <Word t={t} at={wordStart(4)}>vous</Word> <Word t={t} at={wordStart(5)}>voulez</Word>{' '}
          <Word t={t} at={wordStart(6)}>attirer</Word>
        </div>
        <div style={{...line, top: 862, fontFamily: font.serif, fontWeight: 600, fontSize: 96, letterSpacing: -1}}>
          <Word t={t} at={wordStart(7)} style={{color: color.accent}}>plus</Word>{' '}
          <Word t={t} at={wordStart(8)} style={{color: color.accent}}>de</Word>{' '}
          <Word t={t} at={wordStart(9)}>
            <span style={{color: color.accent}}>clients</span>
            {NB}?
          </Word>
        </div>
        {/* underline sweep under "plus de clients" */}
        <div
          style={{
            position: 'absolute',
            top: 985,
            left: 540 - 250,
            width: 500 * prog(t, wordStart(9) + 0.05, 0.4, ease.out),
            height: 5,
            borderRadius: 3,
            background: color.accent,
            opacity: 0.85,
          }}
        />
        <Notifications t={t} frame={frame} />
      </AbsoluteFill>
      {/* brass hairline accents drifting (parallax) */}
      <div
        style={{
          position: 'absolute',
          left: lerp(80, 60, prog(t, 0, 4)),
          top: 200,
          width: 2,
          height: 120 * prog(t, 0.1, 0.8),
          background: color.brass,
          opacity: 0.5,
        }}
      />
    </AbsoluteFill>
  );
};
