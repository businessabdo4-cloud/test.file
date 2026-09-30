import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Background} from '../components/Background';
import {archPath, beat, color, ease, ev, font, FPS, pop, prog, wordStart} from '../theme';
import {Word} from './Hook';

const B3 = beat(3);

const Check: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  const size = 230;
  const r = 100;
  const circ = 2 * Math.PI * r;
  const ring = prog(t, ev.check - 0.02, 0.36, ease.inOut);
  const tick = prog(t, ev.check + 0.2, 0.3, ease.out);
  const done = pop(frame, ev.check + 0.45, {damping: 9, stiffness: 180});
  const tickLen = 150;
  return (
    <div style={{position: 'absolute', left: 540 - size / 2, top: 985, width: size, height: size, transform: `scale(${0.94 + 0.06 * done})`}}>
      {/* soft glow once complete */}
      <div style={{position: 'absolute', inset: -30, borderRadius: '50%', background: `radial-gradient(circle, ${color.accentOnDark}55 0%, transparent 65%)`, opacity: tick}} />
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{position: 'absolute', inset: 0}}>
        {/* waiting ring */}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E9DCC6" strokeOpacity={0.18} strokeWidth={6} strokeDasharray="4 14"
          transform={`rotate(${t * 40} ${size / 2} ${size / 2})`} />
        <circle cx={size / 2} cy={size / 2} r={r} fill={`${color.accentOnDark}1A`} fillOpacity={tick} stroke={color.accentOnDark} strokeWidth={9}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - ring)} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        <path d="M70 118 L102 150 L162 86" fill="none" stroke={color.paper} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray={tickLen} strokeDashoffset={tickLen * (1 - tick)} />
      </svg>
    </div>
  );
};

export const Guarantee: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const cam = 1 + 0.03 * prog(t, B3.start - 0.4, 2.6, ease.inOut);
  const badge = prog(t, B3.start - 0.05, 0.45, ease.out);
  const emph = prog(t, wordStart(30) + 0.1, 0.45, ease.out); // underline under "que si"
  const line: React.CSSProperties = {position: 'absolute', left: 0, right: 0, textAlign: 'center', fontFamily: font.serif, color: color.paper};
  return (
    <AbsoluteFill>
      <Background t={t} variant="green" />
      <AbsoluteFill style={{transform: `scale(${cam})`, transformOrigin: '50% 45%'}}>
        {/* badge */}
        <div style={{position: 'absolute', top: 262, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: badge, transform: `translateY(${(1 - badge) * 20}px)`}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14, padding: '14px 30px', borderRadius: 999, border: `2px solid ${color.brass}`, background: 'rgba(233,220,198,0.06)', fontFamily: font.sans, fontWeight: 700, fontSize: 30, letterSpacing: 0.5, color: '#EBDDC6'}}>
            <svg width="26" height="30" viewBox="0 0 26 30">
              <path d={archPath(22, 26, 2, 2)} fill="none" stroke={color.brass} strokeWidth="2.5" />
            </svg>
            Satisfait ou pas de paiement
          </div>
        </div>
        <div style={{...line, top: 380, fontWeight: 500, fontSize: 96}}>
          <Word t={t} at={wordStart(27)}>Vous</Word> <Word t={t} at={wordStart(28)}>ne</Word> <Word t={t} at={wordStart(29)}>payez</Word>
        </div>
        <div style={{...line, top: 488, fontStyle: 'italic', fontWeight: 500, fontSize: 158, color: color.accentOnDark, lineHeight: 1.1}}>
          <Word t={t} at={wordStart(30)}>que</Word> <Word t={t} at={wordStart(31)}>si</Word>
        </div>
        <div style={{position: 'absolute', top: 672, left: 540 - 190, width: 380 * emph, height: 6, borderRadius: 3, background: color.accentOnDark, opacity: 0.9}} />
        <div style={{...line, top: 712, fontWeight: 500, fontSize: 96}}>
          <Word t={t} at={wordStart(32)}>le</Word> <Word t={t} at={wordStart(33)}>résultat</Word>
        </div>
        <div style={{...line, top: 828, fontWeight: 500, fontSize: 96}}>
          <Word t={t} at={wordStart(34)}>vous</Word> <Word t={t} at={wordStart(35)} style={{fontStyle: 'italic'}}>plaît.</Word>
        </div>
        <Check t={t} frame={frame} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
