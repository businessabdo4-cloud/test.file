import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Background} from '../components/Background';
import {InteriorArt} from '../components/InteriorArt';
import {archPath, beat, brand, color, ease, ev, font, FPS, pop, prog, shadow} from '../theme';

// Phone geometry (kept above the caption box: bottom ≤ ~1331 px even at max zoom)
const PH = {x: (1080 - 574) / 2, y: 230, w: 574, h: 1080, bezel: 14};
const SCREEN = {w: PH.w - 2 * PH.bezel, h: PH.h - 2 * PH.bezel};
const STATUS = 54;
const VIEW_H = SCREEN.h - STATUS;
const PAGE_H = 1940;
const MAX_SCROLL = PAGE_H - VIEW_H;

const B2 = beat(2);
const BUILD0 = B2.start + 0.18; // skeleton -> content during "Je crée votre site web"

/** Skeleton placeholder that resolves into real content ("built from code"). */
const Build: React.FC<{t: number; at: number; style: React.CSSProperties; r?: number; children: React.ReactNode}> = ({t, at, style, r = 10, children}) => {
  const p = prog(t, at, 0.34, ease.out);
  const shimmer = ((t * 1.4) % 1) * 160 - 30;
  return (
    <div style={{position: 'absolute', ...style}}>
      {p < 1 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: r,
            opacity: 1 - p,
            background: `linear-gradient(100deg, ${color.sandDeep} ${shimmer - 30}%, #F3ECE2 ${shimmer}%, ${color.sandDeep} ${shimmer + 30}%)`,
          }}
        />
      )}
      <div style={{position: 'absolute', inset: 0, opacity: p, transform: `translateY(${(1 - p) * 12}px)`}}>{children}</div>
    </div>
  );
};

const PROJECTS = [
  {title: 'Salon contemporain', city: 'Casablanca'},
  {title: 'Riad rénové', city: 'Marrakech'},
  {title: 'Suite parentale', city: 'Rabat'},
  {title: 'Cuisine ouverte', city: 'Tanger'},
];

const Page: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  const W = SCREEN.w;
  const pad = 26;
  const serif: React.CSSProperties = {fontFamily: font.serif, color: color.ink};
  const sans: React.CSSProperties = {fontFamily: font.sans, color: color.inkSoft};
  const heroW = W - 2 * 38;
  const cardW = (W - 3 * 22) / 2;
  const btnAt = ev.devisButton;
  const btnPop = pop(frame, btnAt, {damping: 12, stiffness: 170});
  const pulse = prog(t, ev.devisPulse, 0.55, ease.out);
  const press = Math.sin(Math.PI * prog(t, ev.devisPulse, 0.18, ease.inOut));
  return (
    <div style={{position: 'relative', width: W, height: PAGE_H, background: color.paper}}>
      {/* nav */}
      <Build t={t} at={BUILD0} style={{left: pad, top: 18, width: 190, height: 40}}>
        <div style={{...serif, fontSize: 28, fontWeight: 600, lineHeight: '40px'}}>Votre Studio</div>
      </Build>
      <Build t={t} at={BUILD0 + 0.06} style={{right: pad, top: 22, width: 36, height: 30}} r={6}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{position: 'absolute', left: 4, right: 4, top: 6 + i * 9, height: 3, borderRadius: 2, background: color.ink}} />
        ))}
      </Build>
      {/* hero */}
      <Build t={t} at={BUILD0 + 0.16} style={{left: pad, top: 100, width: 330, height: 22}} r={6}>
        <div style={{...sans, fontSize: 15, fontWeight: 800, letterSpacing: 3, color: color.accent}}>ARCHITECTURE D’INTÉRIEUR</div>
      </Build>
      <Build t={t} at={BUILD0 + 0.26} style={{left: pad, top: 132, width: W - 2 * pad, height: 112}} r={10}>
        <div style={{...serif, fontSize: 44, fontWeight: 600, lineHeight: 1.18, letterSpacing: -0.5}}>
          Des intérieurs qui <span style={{fontStyle: 'italic', fontWeight: 500, color: color.accent}}>vous ressemblent</span>
        </div>
      </Build>
      <Build t={t} at={BUILD0 + 0.36} style={{left: pad, top: 256, width: 330, height: 24}} r={6}>
        <div style={{...sans, fontSize: 18, fontWeight: 500}}>Casablanca · Marrakech · Rabat</div>
      </Build>
      <Build t={t} at={BUILD0 + 0.5} style={{left: 38, top: 300, width: heroW, height: 320}} r={24}>
        <div style={{position: 'absolute', inset: 0, clipPath: `path('${archPath(heroW, 320)}')`}}>
          <div style={{width: heroW, height: 320, transform: `scale(${1.08 - 0.08 * prog(t, BUILD0 + 0.5, 3, ease.out)})`}}>
            <InteriorArt variant={0} id="hero" />
          </div>
        </div>
      </Build>
      <Build t={t} at={BUILD0 + 0.7} style={{left: pad, top: 642, width: 240, height: 52}} r={26}>
        <div style={{height: 52, borderRadius: 26, border: `2px solid ${color.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...sans, color: color.ink, fontSize: 18, fontWeight: 700}}>
          Voir les projets
        </div>
      </Build>

      {/* projects */}
      <div style={{position: 'absolute', left: pad, top: 740, ...serif, fontSize: 40, fontWeight: 600, opacity: prog(t, ev.realisations - 0.35, 0.3)}}>
        Nos réalisations
      </div>
      <div style={{position: 'absolute', left: pad, top: 798, ...sans, fontSize: 17, fontWeight: 500, opacity: prog(t, ev.realisations - 0.25, 0.3)}}>
        Sélection de projets
      </div>
      {PROJECTS.map((pr, i) => {
        const at = ev.realisations + i * 0.13; // ≈4-frame stagger
        const k = pop(frame, at, {damping: 14, stiffness: 150});
        const glow = Math.max(0, 1 - prog(t, at + 0.25, 0.9));
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = 22 + col * (cardW + 22);
        const y = 850 + row * 370;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y, width: cardW, opacity: Math.min(1, k * 1.5), transform: `translateY(${(1 - k) * 40}px) scale(${0.9 + 0.1 * k})`}}>
            <div style={{width: cardW, height: 290, position: 'relative', filter: glow > 0.01 ? `drop-shadow(0 0 ${18 * glow}px ${color.accent}AA)` : undefined}}>
              <div style={{position: 'absolute', inset: 0, clipPath: `path('${archPath(cardW, 290)}')`}}>
                <InteriorArt variant={i + 1} id={`c${i}`} />
              </div>
              <svg width={cardW} height={290} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
                <path d={archPath(cardW, 290)} fill="none" stroke={color.brass} strokeOpacity={0.5 + 0.5 * glow} strokeWidth={2} />
              </svg>
            </div>
            <div style={{...serif, fontSize: 21, fontWeight: 600, marginTop: 12}}>{pr.title}</div>
            <div style={{...sans, fontSize: 15, fontWeight: 500, marginTop: 2}}>{pr.city}</div>
          </div>
        );
      })}

      {/* quote section */}
      <div style={{position: 'absolute', left: 20, right: 20, top: 1610, height: 270, borderRadius: 28, background: color.ink, padding: '34px 30px', boxSizing: 'border-box'}}>
        <div style={{fontFamily: font.serif, fontSize: 34, fontWeight: 600, color: color.paper}}>Parlons de votre projet</div>
        <div style={{fontFamily: font.sans, fontSize: 18, fontWeight: 500, color: '#CFC5B8', marginTop: 8}}>Décrivez votre projet en quelques lignes.</div>
        <div style={{position: 'absolute', left: 30, bottom: 32, width: 290, height: 62}}>
          {/* pulse ring */}
          {pulse > 0 && pulse < 1 && (
            <div style={{position: 'absolute', inset: 0, borderRadius: 31, border: `3px solid ${color.accentOnDark}`, transform: `scale(${1 + 0.35 * pulse})`, opacity: 1 - pulse}} />
          )}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 31,
              background: color.accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: font.sans,
              fontWeight: 800,
              fontSize: 21,
              color: color.paper,
              opacity: Math.min(1, btnPop * 1.5),
              transform: `scale(${(0.6 + 0.4 * btnPop) * (1 - 0.06 * press)})`,
              boxShadow: `0 10px 26px ${color.accent}66`,
            }}
          >
            Demander un devis
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1900, textAlign: 'center', ...sans, fontSize: 14}}>© Votre Studio</div>
    </div>
  );
};

const QuoteSheet: React.FC<{t: number; frame: number}> = ({t, frame}) => {
  const k = pop(frame, ev.devisForm, {damping: 15, stiffness: 160});
  if (t < ev.devisForm - 0.02) return null;
  const fields: [string, string][] = [
    ['Nom', 'Votre nom'],
    ['Ville', 'Casablanca'],
    ['Projet', 'Salon & salle à manger'],
  ];
  return (
    <>
      <div style={{position: 'absolute', inset: 0, background: 'rgba(31,27,24,0.38)', opacity: Math.min(1, k)}} />
      <div
        style={{
          position: 'absolute',
          left: 12,
          right: 12,
          bottom: 12,
          height: 500,
          borderRadius: 34,
          background: color.paper,
          boxShadow: shadow.lift,
          transform: `translateY(${(1 - k) * 540}px)`,
          padding: '20px 28px',
          boxSizing: 'border-box',
          fontFamily: font.sans,
        }}
      >
        <div style={{width: 60, height: 6, borderRadius: 3, background: color.sandDeep, margin: '0 auto 22px'}} />
        <div style={{fontFamily: font.serif, fontSize: 32, fontWeight: 600, color: color.ink}}>Demande de devis</div>
        {fields.map(([label, val], i) => (
          <div key={label} style={{marginTop: 16, opacity: prog(t, ev.devisForm + 0.08 + i * 0.1, 0.25)}}>
            <div style={{fontSize: 15, fontWeight: 700, color: color.inkSoft, letterSpacing: 0.5}}>{label}</div>
            <div style={{marginTop: 6, height: 50, borderRadius: 14, border: `1.5px solid ${color.line}`, background: '#fff', display: 'flex', alignItems: 'center', padding: '0 16px', fontSize: 19, fontWeight: 500, color: color.ink}}>
              {val}
            </div>
          </div>
        ))}
        <div style={{marginTop: 22, height: 58, borderRadius: 29, background: color.accent, color: color.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, opacity: prog(t, ev.devisForm + 0.35, 0.25)}}>
          Envoyer la demande
        </div>
      </div>
    </>
  );
};

export const Offer: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const rise = prog(t, B2.start - 0.16, 0.75, ease.out);
  const zoom = 1 + 0.04 * prog(t, B2.start + 0.5, B2.end - B2.start, ease.inOut);
  const scroll = interpolate(
    t,
    [B2.start + 1.45, ev.realisations + 0.05, ev.realisations + 1.35, ev.devisButton - 0.2],
    [0, 700, 760, MAX_SCROLL],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease.inOut},
  );
  const archDraw = prog(t, B2.start, 1.2, ease.inOut);
  return (
    <AbsoluteFill>
      <Background t={t} />
      {/* decorative arch behind the phone (parallax: moves less than the phone) */}
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, transform: `translateY(${(1 - rise) * 260}px) scale(${1 + 0.02 * (zoom - 1) * 25})`, transformOrigin: '50% 45%'}}>
        <path d={archPath(820, 1150, 130, 250)} fill={`${brand.yellow}10`} stroke={brand.yellow} strokeWidth={3} strokeOpacity={0.75}
          strokeDasharray={4200} strokeDashoffset={4200 * (1 - archDraw)} />
      </svg>
      <div
        style={{
          position: 'absolute',
          left: PH.x,
          top: PH.y,
          width: PH.w,
          height: PH.h,
          transform: `translateY(${(1 - rise) * 1150}px) rotate(${(1 - rise) * -4}deg) scale(${zoom})`,
          transformOrigin: '50% 50%',
          borderRadius: 78,
          background: '#171411',
          boxShadow: `0 30px 80px rgba(0,6,20,0.6), 0 0 0 3px ${brand.yellow}55, inset 0 0 0 2px #3A332D`,
        }}
      >
        <div style={{position: 'absolute', left: PH.bezel, top: PH.bezel, width: SCREEN.w, height: SCREEN.h, borderRadius: 64, overflow: 'hidden', background: color.paper}}>
          <div style={{position: 'absolute', left: 0, top: STATUS, width: SCREEN.w, height: VIEW_H, overflow: 'hidden'}}>
            <div style={{transform: `translateY(${-scroll}px)`}}>
              <Page t={t} frame={frame} />
            </div>
          </div>
          {/* status bar */}
          <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: STATUS, background: color.paper, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 42px', boxSizing: 'border-box', fontFamily: font.sans, fontWeight: 700, fontSize: 19, color: color.ink}}>
            <span>9:41</span>
            <div style={{position: 'absolute', left: '50%', top: 12, width: 120, height: 32, marginLeft: -60, borderRadius: 16, background: '#171411'}} />
            <span style={{display: 'flex', gap: 6, alignItems: 'center'}}>
              <span style={{width: 22, height: 12, borderRadius: 3, border: `2px solid ${color.ink}`}} />
            </span>
          </div>
          <QuoteSheet t={t} frame={frame} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

