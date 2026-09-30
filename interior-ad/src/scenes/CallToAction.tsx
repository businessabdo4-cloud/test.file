import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Background} from '../components/Background';
import {archPath, beat, color, ease, ev, font, FPS, lerp, NB, pop, prog, shadow, TL, wordStart} from '../theme';
import {Word} from './Hook';

const B4 = beat(4);
const HANDLE = ''; // contact handle (none provided)
const BRAND = ''; // brand name (none provided)

const CARD = {x: 110, y: 360, w: 860, h: 820};
const SHRINK_AT = ev.send + 0.55; // once the sent bubble has landed

const PersonIcon: React.FC = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={color.paper} strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="8.5" r="3.8" />
    <path d="M4.5 20c1.3-3.6 4.2-5.4 7.5-5.4s6.2 1.8 7.5 5.4" />
  </svg>
);

const Plane: React.FC = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill={color.paper}>
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
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: CARD.w, height: CARD.h, borderRadius: 44, background: color.paper, boxShadow: shadow.lift, overflow: 'hidden', transform: `translateY(${(1 - enter) * 1700}px)`}}>
      {/* header */}
      <div style={{height: 120, display: 'flex', alignItems: 'center', gap: 22, padding: '0 36px', borderBottom: `1.5px solid ${color.line}`, fontFamily: font.sans}}>
        <div style={{width: 72, height: 72, borderRadius: 36, background: color.green, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <PersonIcon />
        </div>
        <div>
          <div style={{fontWeight: 800, fontSize: 32, color: color.ink}}>Nouveau message</div>
          <div style={{fontWeight: 500, fontSize: 24, color: color.inkSoft, display: 'flex', alignItems: 'center', gap: 8}}>
            <span style={{width: 12, height: 12, borderRadius: 6, background: '#4E8B63'}} /> en ligne
          </div>
        </div>
      </div>
      {/* body */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontFamily: font.sans, fontWeight: 700, fontSize: 22, color: color.inkSoft, letterSpacing: 1}}>
        AUJOURD’HUI
      </div>
      <div style={{position: 'absolute', left: 36, top: 210, padding: '18px 26px', borderRadius: '28px 28px 28px 8px', background: color.sandDeep, fontFamily: font.sans, fontWeight: 600, fontSize: 32, color: color.ink, opacity: prog(t, B4.start + 0.1, 0.3), transform: `translateY(${(1 - prog(t, B4.start + 0.1, 0.3)) * 16}px)`}}>
        Bonjour{NB}!
      </div>
      {/* composer */}
      <div style={{position: 'absolute', left: 28, right: 28, bottom: 28, height: 104, display: 'flex', alignItems: 'center', gap: 18, transform: `translateY(${(1 - prog(t, B4.start + 0.05, 0.45)) * 140}px)`}}>
        <div style={{flex: 1, height: 96, borderRadius: 48, background: '#fff', border: `2px solid ${typed ? color.accent : color.line}`, display: 'flex', alignItems: 'center', padding: '0 34px', fontFamily: font.sans, fontSize: 40, fontWeight: 800, color: color.ink, letterSpacing: 4}}>
          {!sent && typed === 0 && <span style={{color: '#A89E92', fontWeight: 500, fontSize: 32, letterSpacing: 0}}>Écrire un message…</span>}
          {!sent && 'SITE'.slice(0, typed)}
          {!sent && <span style={{display: 'inline-block', width: 4, height: 46, marginLeft: 4, background: color.accent, opacity: caretOn ? 1 : 0}} />}
        </div>
        <div style={{width: 96, height: 96, borderRadius: 48, background: color.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${(1 + 0.08 * Math.min(1, typed / 4)) * (1 - 0.14 * press)})`, boxShadow: `0 10px 24px ${color.accent}66`}}>
          <Plane />
        </div>
      </div>
      {/* flying / sent bubble */}
      {sent && (
        <div style={{position: 'absolute', left: bx, top: by, transform: `scale(${lerp(0.8, 1, fly)})`, transformOrigin: '100% 100%'}}>
          <div style={{padding: '18px 34px', borderRadius: '28px 28px 8px 28px', background: color.accent, fontFamily: font.sans, fontWeight: 800, fontSize: 40, letterSpacing: 4, color: color.paper, boxShadow: `0 10px 26px ${color.accent}55`}}>
            SITE
          </div>
          <div style={{textAlign: 'right', marginTop: 8, fontFamily: font.sans, fontWeight: 600, fontSize: 22, color: color.inkSoft, opacity: landed}}>Envoyé ✓</div>
        </div>
      )}
    </div>
  );
};

export const CallToAction: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const shrink = prog(t, SHRINK_AT, 0.6, ease.inOut);
  const cardScale = lerp(1, 0.56, shrink);
  const cardCY = lerp(CARD.y + CARD.h / 2, 222 + (CARD.h * 0.56) / 2, shrink);
  const big = pop(frame, SHRINK_AT + 0.2, {damping: 11, stiffness: 140});
  const bigIn = prog(t, SHRINK_AT + 0.2, 0.3);
  const pulse = 1 + 0.025 * Math.sin(Math.max(0, t - SHRINK_AT - 0.8) * 2 * Math.PI * 0.9) * prog(t, SHRINK_AT + 0.8, 0.4);
  const archDraw = prog(t, SHRINK_AT + 0.15, 0.8, ease.inOut);
  const cam = 1 + 0.03 * prog(t, B4.start - 0.3, TL.videoDuration - B4.start + 0.3, ease.inOut);
  return (
    <AbsoluteFill>
      <Background t={t} />
      <AbsoluteFill style={{transform: `scale(${cam})`, transformOrigin: '50% 50%'}}>
        <div style={{position: 'absolute', left: CARD.x, top: cardCY - CARD.h / 2, width: CARD.w, height: CARD.h, transform: `scale(${cardScale})`, transformOrigin: '50% 50%'}}>
          <Chat t={t} frame={frame} />
        </div>
        {/* big « SITE » */}
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <path d={archPath(560, 380, 260, 800)} fill={color.accent} fillOpacity={0.07 * archDraw} stroke={color.brass} strokeWidth={3} strokeOpacity={0.75 * Math.min(1, archDraw * 4)}
            strokeDasharray={1900} strokeDashoffset={1900 * (1 - archDraw)} />
        </svg>
        <div style={{position: 'absolute', left: 0, right: 0, top: 900, textAlign: 'center', fontFamily: font.serif, fontWeight: 600, fontSize: 176, letterSpacing: 2, color: color.accent, opacity: bigIn, transform: `translateY(${(1 - big) * 50}px) scale(${(0.86 + 0.14 * big) * pulse})`, textShadow: `0 8px 30px ${color.accent}40`}}>
          «{NB}SITE{NB}»
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 1196, textAlign: 'center', fontFamily: font.sans, fontWeight: 700, fontSize: 56, color: color.ink}}>
          <Word t={t} at={wordStart(40)}>pour</Word> <Word t={t} at={wordStart(41)}>commencer</Word>
        </div>
        {HANDLE && (
          <div style={{position: 'absolute', left: 0, right: 0, top: 1280, textAlign: 'center', fontFamily: font.sans, fontWeight: 600, fontSize: 38, color: color.inkSoft}}>{HANDLE}</div>
        )}
        {BRAND && (
          <div style={{position: 'absolute', left: 0, right: 0, top: 240, textAlign: 'center', fontFamily: font.serif, fontSize: 40, color: color.ink}}>{BRAND}</div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
