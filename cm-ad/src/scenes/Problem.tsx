import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Background} from '../components/Background';
import {Phone, Search} from '../components/Icons';
import {InteriorArt} from '../components/InteriorArt';
import {Word} from '../components/Kinetic';
import {beat, brand, ease, ev, font, FPS, pop, prog, wordStart} from '../theme';

const B2 = beat(2);
const QUERY = 'designer d’intérieur casablanca';
const RESULTS = [
  {name: 'Studio d’architecture d’intérieur', city: 'Casablanca'},
  {name: 'Designer d’intérieur', city: 'Casablanca'},
  {name: 'Décoration & aménagement', city: 'Casablanca'},
];
const ink = brand.navy;
const soft = '#5A6782';

export const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const cam = 1 + 0.035 * prog(t, B2.start - 0.4, B2.end - B2.start + 0.8, ease.inOut);
  const card = pop(frame, wordStart(19) - 0.1, {damping: 16, stiffness: 140}); // « vos futurs clients »
  const [ts, te] = ev.searchType;
  const typed = Math.round(QUERY.length * prog(t, ts, te - ts, (x) => x));
  const caretOn = Math.floor(t * 2.4) % 2 === 0 || (t > ts && t < te + 0.1);
  const called = pop(frame, ev.call, {damping: 10, stiffness: 200});
  const ring = prog(t, ev.call, 0.7, ease.out);
  const ring2 = prog(t, ev.call + 0.25, 0.7, ease.out);

  return (
    <AbsoluteFill>
      <Background t={t} />
      <AbsoluteFill style={{transform: `scale(${cam})`, transformOrigin: '50% 45%'}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 236, textAlign: 'center', fontFamily: font.sans, fontWeight: 800, fontSize: 96, letterSpacing: 2, color: brand.white}}>
          <Word t={t} at={wordStart(17)}>DESIGNERS</Word>
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 344, textAlign: 'center', fontFamily: font.serif, fontStyle: 'italic', fontWeight: 500, fontSize: 84, color: brand.yellow}}>
          <Word t={t} at={wordStart(18)}>d’intérieur,</Word>
        </div>

        {/* the client's search, on a phone-like card */}
        <div
          style={{
            position: 'absolute',
            left: 100,
            top: 500,
            width: 880,
            height: 820,
            borderRadius: 44,
            background: brand.white,
            boxShadow: '0 30px 80px rgba(0,6,20,0.6)',
            overflow: 'hidden',
            transform: `translateY(${(1 - card) * 1500}px)`,
            fontFamily: font.sans,
          }}
        >
          <div style={{height: 96, display: 'flex', alignItems: 'center', gap: 16, padding: '0 34px', borderBottom: '1.5px solid rgba(0,22,56,0.08)'}}>
            <div style={{width: 18, height: 18, borderRadius: 9, background: brand.yellow}} />
            <span style={{fontWeight: 800, fontSize: 28, color: ink, letterSpacing: 0.5}}>Votre futur client</span>
            <span style={{marginLeft: 'auto', fontWeight: 600, fontSize: 22, color: soft}}>en ligne</span>
          </div>
          {/* search bar */}
          <div style={{margin: '26px 30px 0', height: 92, borderRadius: 46, background: '#EDF1F7', display: 'flex', alignItems: 'center', gap: 16, padding: '0 30px', border: `3px solid ${t > ts ? brand.yellow : 'transparent'}`}}>
            <Search size={38} color={soft} stroke={2.4} />
            <span style={{fontWeight: 700, fontSize: 32, color: typed ? ink : '#97A1B5'}}>{typed ? QUERY.slice(0, typed) : 'Rechercher…'}</span>
            <span style={{display: 'inline-block', width: 3, height: 40, marginLeft: -10, background: ink, opacity: caretOn && t < te + 0.3 ? 1 : 0}} />
          </div>
          {/* results */}
          {RESULTS.map((r, i) => {
            const k = pop(frame, ev.results + i * 0.09, {damping: 15, stiffness: 170});
            const top = t >= ev.call ? i === 0 : false;
            return (
              <div key={i} style={{margin: '22px 30px 0', height: 168, borderRadius: 26, background: top ? '#FFF7DA' : '#F6F8FB', border: `2px solid ${top ? brand.yellow : 'rgba(0,22,56,0.06)'}`, display: 'flex', alignItems: 'center', gap: 20, padding: '0 22px', opacity: Math.min(1, k * 1.4), transform: `translateY(${(1 - k) * 40}px)`}}>
                <div style={{display: 'flex', gap: 8, flex: 'none'}}>
                  {[0, 1].map((j) => (
                    <div key={j} style={{width: 112, height: 124, borderRadius: 16, overflow: 'hidden'}}>
                      <InteriorArt variant={(i * 2 + j + 1) % 5} id={`r${i}${j}`} />
                    </div>
                  ))}
                </div>
                <div style={{flex: 1, minWidth: 0}}>
                  <div style={{fontWeight: 800, fontSize: 27, color: ink, lineHeight: 1.2}}>{r.name}</div>
                  <div style={{fontWeight: 600, fontSize: 22, color: soft, marginTop: 6}}>{r.city}</div>
                </div>
                {i === 0 && (
                  <div style={{position: 'relative', width: 84, height: 84, flex: 'none'}}>
                    {[ring, ring2].map((rp, j) => rp > 0 && rp < 1 && (
                      <div key={j} style={{position: 'absolute', inset: 0, borderRadius: 42, border: `4px solid ${brand.yellow}`, transform: `scale(${1 + 0.8 * rp})`, opacity: 1 - rp}} />
                    ))}
                    <div style={{position: 'absolute', inset: 0, borderRadius: 42, background: t >= ev.call ? brand.yellow : '#E3E8F1', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 + 0.12 * called * Math.max(0, 1 - (t - ev.call) * 1.5)}) rotate(${t >= ev.call ? Math.sin((t - ev.call) * 40) * 10 * Math.max(0, 1 - (t - ev.call) * 1.4) : 0}deg)`}}>
                      <Phone size={38} color={ink} stroke={2.2} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
