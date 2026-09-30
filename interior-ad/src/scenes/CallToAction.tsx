import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Background} from '../components/Background';
import {Logo} from '../components/Brand';
import {archPath, beat, brand, color, ease, ev, font, FPS, lerp, NB, pop, prog, TL, wordStart} from '../theme';
import {Word} from './Hook';

const B4 = beat(4);
const HANDLE = ''; // contact handle (none provided)

const CARD = {x: 110, y: 360, w: 860, h: 820};
// Once the sent bubble has landed the chat flies away and the brand end card takes over.
export const EXIT_AT = ev.send + 0.5;
export const BIG_AT = ev.bigSite; // big « SITE » lands (= EXIT_AT + 0.25; impact in the sound design)
const LOGO_AT = EXIT_AT + 0.18;

const PersonIcon: React.FC = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={brand.yellow} strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="8.5" r="3.8" />
    <path d="M4.5 20c1.3-3.6 4.2-5.4 7.5-5.4s6.2 1.8 7.5 5.4" />
  </svg>
);

const Plane: React.FC = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill={brand.navy}>
    <path d="M3.4 20.4 21 12 3.4 3.6l-.02 6.52L15 12 3.38 13.88z" />
  </svg>
);

const Chat: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  const enter = pop(frame, B4.start - 0.08, {damping: 16, stiffness: 140});
  const typed = ev.typing.filter((k) => t >= k).length;
  const sent = t >= ev.send + 0.04;
  const press = Math.sin(Math.PI * prog(t, ev.send - 0.04, 0.2, ease.inOut));
  const fly = prog(t, ev.send + 0.04, 0.38, ease.inOut);
  const landed = pop(frame, ev.send + 0.4, {damping: 12, stiffness: 200});
  const caretOn = Math.floor(t * 2.2) % 2 === 0 || (typed > 0 && !sent);
  // bubble path: from composer (left-bottom) to chat (right-top)
  const bx = lerp(150, CARD.w - 36 - 190, fly);
  const by = lerp(CARD.h - 122, 400, fly) - Math.sin(Math.PI * fly) * 60;
  const ink = brand.navy;
  const soft = '#4A5875';
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: CARD.w, height: CARD.h, borderRadius: 44, background: brand.white, boxShadow: '0 30px 80px rgba(0,6,20,0.55)', overflow: 'hidden', transform: `translateY(${(1 - enter) * 1700}px)`}}>
      {/* header */}
      <div style={{height: 120, display: 'flex', alignItems: 'center', gap: 22, padding: '0 36px', borderBottom: '1.5px solid rgba(0,22,56,0.1)', fontFamily: font.sans}}>
        <div style={{width: 72, height: 72, borderRadius: 36, background: brand.navy, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <PersonIcon />
        </div>
        <div>
          <div style={{fontWeight: 800, fontSize: 32, color: ink}}>Nouveau message</div>
          <div style={{fontWeight: 500, fontSize: 24, color: soft, display: 'flex', alignItems: 'center', gap: 8}}>
            <span style={{width: 12, height: 12, borderRadius: 6, background: '#3FA36B'}} /> en ligne
          </div>
        </div>
      </div>
      {/* body */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: font.sans, fontWeight: 700, fontSize: 22, color: soft, letterSpacing: 1}}>
        AUJOURD’HUI
      </div>
      <div style={{position: 'absolute', left: 36, top: 210, padding: '18px 26px', borderRadius: '28px 28px 28px 8px', background: '#E3E8F1', fontFamily: font.sans, fontWeight: 600, fontSize: 32, color: ink, opacity: prog(t, B4.start + 0.1, 0.3), transform: `translateY(${(1 - prog(t, B4.start + 0.1, 0.3)) * 16}px)`}}>
        Bonjour{NB}!
      </div>
      {/* composer */}
      <div style={{position: 'absolute', left: 28, right: 28, bottom: 28, height: 104, display: 'flex', alignItems: 'center', gap: 18, transform: `translateY(${(1 - prog(t, B4.start + 0.05, 0.45)) * 140}px)`}}>
        <div style={{flex: 1, height: 96, borderRadius: 48, background: '#fff', border: `3px solid ${typed ? brand.yellow : 'rgba(0,22,56,0.12)'}`, display: 'flex', alignItems: 'center', padding: '0 34px', fontFamily: font.sans, fontSize: 40, fontWeight: 800, color: ink, letterSpacing: 4}}>
          {!sent && typed === 0 && <span style={{color: '#8A94A8', fontWeight: 500, fontSize: 32, letterSpacing: 0}}>Écrire un message…</span>}
          {!sent && 'SITE'.slice(0, typed)}
          {!sent && <span style={{display: 'inline-block', width: 4, height: 46, marginLeft: 4, background: ink, opacity: caretOn ? 1 : 0}} />}
        </div>
        <div style={{width: 96, height: 96, borderRadius: 48, background: brand.yellow, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${(1 + 0.08 * Math.min(1, typed / 4)) * (1 - 0.14 * press)})`, boxShadow: `0 10px 24px ${brand.yellow}77`}}>
          <Plane />
        </div>
      </div>
      {/* flying / sent bubble */}
      {sent && (
        <div style={{position: 'absolute', left: bx, top: by, transform: `scale(${lerp(0.8, 1, fly)})`, transformOrigin: '100% 100%'}}>
          <div style={{padding: '18px 34px', borderRadius: '28px 28px 8px 28px', background: brand.yellow, fontFamily: font.sans, fontWeight: 800, fontSize: 40, letterSpacing: 4, color: brand.navy, boxShadow: `0 10px 26px ${brand.yellow}66`}}>
            SITE
          </div>
          <div style={{textAlign: 'right', marginTop: 8, fontFamily: font.sans, fontWeight: 600, fontSize: 22, color: soft, opacity: landed}}>Envoyé ✓</div>
        </div>
      )}
    </div>
  );
};

export const CallToAction: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const exit = prog(t, EXIT_AT, 0.45, ease.in);
  const big = pop(frame, BIG_AT, {damping: 10, stiffness: 150});
  const bigIn = prog(t, BIG_AT - 0.04, 0.2);
  const pulse = 1 + 0.03 * Math.sin(Math.max(0, t - BIG_AT - 0.6) * 2 * Math.PI * 0.9) * prog(t, BIG_AT + 0.6, 0.4);
  const archDraw = prog(t, BIG_AT - 0.05, 0.7, ease.inOut);
  const logoWipe = prog(t, LOGO_AT, 0.55, ease.out);
  const logoY = 16 * (1 - prog(t, LOGO_AT, 0.5, ease.out));
  const cam = 1 + 0.03 * prog(t, B4.start - 0.3, TL.videoDuration - B4.start + 0.3, ease.inOut);
  const glow = Math.exp(-Math.max(0, t - BIG_AT) / 0.25) * (t >= BIG_AT ? 1 : 0);
  return (
    <AbsoluteFill>
      <Background t={t} />
      <AbsoluteFill style={{transform: `scale(${cam})`, transformOrigin: '50% 50%'}}>
        {exit < 1 && (
          <div style={{position: 'absolute', left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h, transform: `translateY(${-1500 * exit}px) scale(${1 - 0.1 * exit})`, opacity: 1 - exit * 0.4}}>
            <Chat t={t} frame={frame} />
          </div>
        )}
        {/* brand sign-off: logo wipes in along its stripes */}
        <div style={{position: 'absolute', left: (1080 - 620) / 2, top: 250 + logoY, clipPath: `inset(0 ${100 - 100 * logoWipe}% 0 0)`}}>
          <Logo width={620} />
        </div>
        {/* big « SITE » in a Moroccan arch */}
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <path d={archPath(780, 420, 150, 575)} fill={brand.yellow} fillOpacity={0.08 * archDraw} stroke={brand.yellow} strokeWidth={4} strokeOpacity={0.9 * Math.min(1, archDraw * 4)}
            strokeDasharray={2500} strokeDashoffset={2500 * (1 - archDraw)} />
        </svg>
        <div style={{position: 'absolute', left: 0, right: 0, top: 706, textAlign: 'center', fontFamily: font.serif, fontWeight: 600, fontSize: 176, letterSpacing: 2, color: brand.yellow, opacity: bigIn, transform: `translateY(${(1 - big) * 50}px) scale(${(0.7 + 0.3 * big) * pulse})`, textShadow: `0 0 ${20 + 50 * glow}px ${brand.yellow}${glow > 0.3 ? 'AA' : '55'}`}}>
          «{NB}SITE{NB}»
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 1030, textAlign: 'center', fontFamily: font.sans, fontWeight: 700, fontSize: 56, color: brand.white}}>
          <Word t={t} at={wordStart(40)}>pour</Word> <Word t={t} at={wordStart(41)}>commencer</Word>
        </div>
        {HANDLE && (
          <div style={{position: 'absolute', left: 0, right: 0, top: 1120, textAlign: 'center', fontFamily: font.sans, fontWeight: 600, fontSize: 38, color: color.sandDeep}}>{HANDLE}</div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
