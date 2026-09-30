import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Background} from '../components/Background';
import {ArrowUp, Bookmark, Comment, Eye, EyeSlash, Heart, Mail, Send, UserPlus} from '../components/Icons';
import {InteriorArt} from '../components/InteriorArt';
import {decay, Word} from '../components/Kinetic';
import {beat, brand, ease, ev, font, FPS, pop, prog, wordStart} from '../theme';

const B4 = beat(4);
const SWAP = wordStart(58) - 0.12; // « Nous, … »
const CARD = {x: 150, y: 450, w: 780};
const IMG_H = 560;
const ink = brand.navy;

const NOTIFS = [
  {label: 'Nouveau j’aime', Icon: Heart, x: 34, y: 560},
  {label: 'Nouveau commentaire', Icon: Comment, x: 560, y: 690},
  {label: 'Nouvel abonné', Icon: UserPlus, x: 44, y: 880},
  {label: 'Nouveau message', Icon: Mail, x: 590, y: 1010},
];

export const Punchline: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const P = ev.punch;
  const cam = 1 + 0.035 * prog(t, B4.start - 0.4, B4.end - B4.start + 0.8, ease.inOut);
  const alive = prog(t, P - 0.02, 0.3, ease.out);
  const bloom = 0.45 * decay(t, P, 0.12);
  const heartK = pop(frame, P + 0.04, {damping: 8, stiffness: 220});
  const chipFlip = pop(frame, P, {damping: 12, stiffness: 200});
  const swapOut = prog(t, SWAP, 0.22, ease.in);
  const underline = prog(t, P + 0.05, 0.35, ease.out);

  return (
    <AbsoluteFill>
      <Background t={t} />
      <AbsoluteFill style={{transform: `scale(${cam})`, transformOrigin: '50% 45%'}}>
        {/* title A → title B */}
        {swapOut < 1 && (
          <div style={{opacity: 1 - swapOut, transform: `translateY(${-50 * swapOut}px)`}}>
            <div style={{position: 'absolute', left: 0, right: 0, top: 236, textAlign: 'center', fontFamily: font.sans, fontWeight: 700, fontSize: 62, color: brand.white}}>
              <Word t={t} at={wordStart(53)}>Vous</Word> <Word t={t} at={wordStart(54)}>créez</Word>
            </div>
            <div style={{position: 'absolute', left: 0, right: 0, top: 310, textAlign: 'center', fontFamily: font.serif, fontStyle: 'italic', fontWeight: 500, fontSize: 84, color: brand.yellow}}>
              <Word t={t} at={wordStart(55)}>de</Word> <Word t={t} at={wordStart(56)}>beaux</Word> <Word t={t} at={wordStart(57)}>intérieurs.</Word>
            </div>
          </div>
        )}
        {t >= SWAP && (
          <>
            <div style={{position: 'absolute', left: 0, right: 0, top: 236, textAlign: 'center', fontFamily: font.sans, fontWeight: 700, fontSize: 62, color: brand.white}}>
              <Word t={t} at={wordStart(58)}>Nous,</Word> <Word t={t} at={wordStart(59)}>on</Word> <Word t={t} at={wordStart(60)}>les</Word>
            </div>
            <div style={{position: 'absolute', left: 0, right: 0, top: 304, textAlign: 'center', fontFamily: font.serif, fontStyle: 'italic', fontWeight: 600, fontSize: 96, color: brand.yellow}}>
              <Word t={t} at={wordStart(61)}>fait</Word> <Word t={t} at={wordStart(62)}>voir.</Word>
            </div>
            <div style={{position: 'absolute', top: 418, left: 540 - 180, width: 360 * underline, height: 7, borderRadius: 4, background: brand.yellow}} />
          </>
        )}

        {/* the post */}
        <div style={{position: 'absolute', left: CARD.x, top: CARD.y, width: CARD.w, borderRadius: 40, background: brand.white, overflow: 'hidden', boxShadow: `0 30px 80px rgba(0,6,20,0.6)${alive > 0 ? `, 0 0 ${80 * alive}px ${brand.yellow}${alive > 0.5 ? '66' : '33'}` : ''}`, fontFamily: font.sans}}>
          <div style={{height: 96, display: 'flex', alignItems: 'center', gap: 18, padding: '0 30px'}}>
            <div style={{width: 60, height: 60, borderRadius: 30, padding: 4, background: `conic-gradient(${brand.yellow}, ${brand.royal}, ${brand.yellow})`}}>
              <div style={{width: '100%', height: '100%', borderRadius: '50%', background: brand.navy, border: `3px solid ${brand.white}`, boxSizing: 'border-box'}} />
            </div>
            <div>
              <div style={{fontWeight: 800, fontSize: 27, color: ink}}>votre.studio</div>
              <div style={{fontWeight: 500, fontSize: 20, color: '#5A6782'}}>Architecture d’intérieur</div>
            </div>
            <div style={{marginLeft: 'auto', fontWeight: 800, fontSize: 30, color: ink, letterSpacing: 2}}>•••</div>
          </div>
          <div style={{position: 'relative', height: IMG_H, overflow: 'hidden'}}>
            <div style={{position: 'absolute', inset: 0, transform: `scale(${1.1 - 0.1 * prog(t, B4.start - 0.4, 3.4, ease.out)})`, filter: `grayscale(${0.75 * (1 - alive)}) brightness(${0.8 + 0.2 * alive})`}}>
              <InteriorArt variant={3} id="post" light={0.6 + 0.8 * alive} />
            </div>
            {bloom > 0.005 && <div style={{position: 'absolute', inset: 0, background: brand.white, opacity: bloom}} />}
            {/* views chip: eye-slash « 0 vue » → eye + arrow on « voir » */}
            <div style={{position: 'absolute', right: 22, top: 22, display: 'flex', alignItems: 'center', gap: 12, padding: '12px 22px', borderRadius: 999, background: t < P ? 'rgba(0,12,34,0.78)' : brand.yellow, transform: `scale(${t < P ? 1 : 0.7 + 0.3 * chipFlip})`}}>
              {t < P ? <EyeSlash size={34} color={brand.white} stroke={2.2} /> : <Eye size={34} color={ink} stroke={2.4} />}
              {t < P ? (
                <span style={{fontWeight: 800, fontSize: 30, color: brand.white}}>0 vue</span>
              ) : (
                <ArrowUp size={32} color={ink} stroke={3} />
              )}
            </div>
          </div>
          <div style={{height: 88, display: 'flex', alignItems: 'center', gap: 26, padding: '0 30px'}}>
            <div style={{transform: `scale(${t < P ? 1 : 0.6 + 0.4 * heartK})`}}>
              <Heart size={46} color={t < P ? ink : brand.yellow} filled={t >= P} stroke={2} />
            </div>
            <Comment size={44} color={ink} stroke={2} />
            <Send size={42} color={ink} stroke={2} />
            <div style={{marginLeft: 'auto'}}>
              <Bookmark size={42} color={ink} stroke={2} />
            </div>
          </div>
          <div style={{padding: '0 30px 26px', fontWeight: 700, fontSize: 24, color: t < P ? '#8A94A8' : ink}}>{t < P ? 'Aucune interaction' : 'Votre communauté réagit'}</div>
        </div>

        {/* floating hearts */}
        {t >= P &&
          Array.from({length: 9}).map((_, i) => {
            const st = P + 0.04 + i * 0.045;
            const p = prog(t, st, 0.9, ease.out);
            if (p <= 0 || p >= 1) return null;
            const x = CARD.x + 60 + Math.sin(i * 2.1) * 40 + p * (i % 2 ? 60 : -30);
            const y = CARD.y + 96 + IMG_H + 20 - p * (420 + (i % 3) * 90);
            return (
              <div key={i} style={{position: 'absolute', left: x, top: y, opacity: 1 - p, transform: `scale(${0.6 + 0.8 * Math.min(1, p * 3)}) rotate(${(i % 2 ? 1 : -1) * 14 * p}deg)`}}>
                <Heart size={54 - (i % 3) * 8} color={brand.yellow} filled stroke={1.5} />
              </div>
            );
          })}

        {/* notifications */}
        {NOTIFS.map((n, i) => {
          const k = pop(frame, P + 0.08 + i * 0.07, {damping: 12, stiffness: 190});
          if (k <= 0.001) return null;
          const {Icon} = n;
          return (
            <div key={i} style={{position: 'absolute', left: n.x, top: n.y, display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px 14px 14px', borderRadius: 999, background: brand.white, boxShadow: '0 16px 40px rgba(0,6,20,0.5)', transform: `scale(${k})`, transformOrigin: n.x < 300 ? '0% 50%' : '100% 50%', fontFamily: font.sans}}>
              <div style={{width: 52, height: 52, borderRadius: 26, background: brand.yellow, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Icon size={30} color={ink} stroke={2.4} />
              </div>
              <span style={{fontWeight: 800, fontSize: 27, color: ink}}>{n.label}</span>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
