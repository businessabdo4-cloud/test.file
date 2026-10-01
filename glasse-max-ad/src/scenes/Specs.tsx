import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {DropIcon, MembraneIcon, PumpIcon} from '../components/Icons';
import {Badge, Flash, Pop, countUp} from '../components/Motion';
import {COLORS, FONTS, SPECS} from '../config';
import {at} from '../timeline';

/** Blueprint grid + scan line, for the technical spec scenes. */
const TechGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const scan = (frame * 14) % 2200 - 140;
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          backgroundImage:
            'linear-gradient(rgba(127,211,255,0.10) 2px, transparent 2px), linear-gradient(90deg, rgba(127,211,255,0.10) 2px, transparent 2px)',
          backgroundSize: '90px 90px',
          backgroundPosition: `0 ${frame * 1.5}px`,
        }}
      />
      <div style={{position: 'absolute', left: 0, right: 0, top: scan, height: 140, background: 'linear-gradient(transparent, rgba(127,211,255,0.16), transparent)'}} />
    </AbsoluteFill>
  );
};

/** Spinning hero part with a glowing ring. */
const Hero: React.FC<{children: React.ReactNode; enter: number}> = ({children, enter}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{position: 'absolute', left: 540, top: 720, transform: `translate(-50%, -50%) scale(${enter})`}}>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 640,
          height: 640,
          borderRadius: '50%',
          transform: `translate(-50%, -50%) rotate(${frame * 2}deg)`,
          background: `conic-gradient(from 0deg, ${COLORS.water}, transparent 30%, ${COLORS.sky} 50%, transparent 80%, ${COLORS.water})`,
          WebkitMaskImage: 'radial-gradient(closest-side, transparent 86%, black 88%, black 100%)',
          maskImage: 'radial-gradient(closest-side, transparent 86%, black 88%, black 100%)',
          opacity: 0.85,
        }}
      />
      <div style={{position: 'absolute', left: '50%', top: '50%', width: 560, height: 560, borderRadius: '50%', transform: 'translate(-50%, -50%)', background: 'radial-gradient(closest-side, rgba(31,162,255,0.45), rgba(31,162,255,0))'}} />
      <div style={{position: 'relative'}}>{children}</div>
    </div>
  );
};

/** Big number/name + small label, e.g. "80 GPD" / "HK 2". */
const BigSpec: React.FC<{value: React.ReactNode; label: string; at: number}> = ({value, label, at: t}) => (
  <div style={{position: 'absolute', top: 1060, width: '100%', display: 'flex', justifyContent: 'center'}}>
    <Pop at={t} from={0.3} y={80}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div dir="rtl" style={{fontFamily: FONTS.arabic, fontWeight: 900, fontSize: 64, color: COLORS.sky, lineHeight: 1.1}}>
          {label}
        </div>
        <div
          style={{
            fontFamily: FONTS.latin,
            fontWeight: 900,
            fontSize: 190,
            lineHeight: 1,
            color: COLORS.white,
            direction: 'ltr',
            whiteSpace: 'nowrap',
            textShadow: `0 0 40px rgba(31,162,255,0.9), 0 10px 0 ${COLORS.deepBlue}`,
          }}
        >
          {value}
        </div>
      </div>
    </Pop>
  </div>
);

/** "وفيه ممبران 80 GPD من LG" */
export const Membrane: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame, fps, config: {damping: 12, stiffness: 140, mass: 0.8}});
  const tLG = at('membrane', 17);
  const gpd = countUp(frame, 8, 26, SPECS.membrane.value);
  const lg = spring({frame: frame - tLG, fps, config: {damping: 7, stiffness: 260, mass: 0.6}});
  return (
    <AbsoluteFill>
      <Background variant="deep" bubbles={14} seed="membrane" />
      <TechGrid />
      <Hero enter={enter}>
        <MembraneIcon size={470} spin={frame * 4} />
      </Hero>
      <BigSpec
        at={6}
        label={SPECS.membrane.label}
        value={
          <>
            {gpd} <span style={{fontSize: 120, color: COLORS.sky}}>{SPECS.membrane.unit}</span>
          </>
        }
      />
      {/* LG stamp */}
      {frame >= tLG && (
        <div
          style={{
            position: 'absolute',
            left: 830,
            top: 420,
            transform: `translate(-50%, -50%) scale(${interpolate(lg, [0, 1], [2.6, 1])}) rotate(${interpolate(lg, [0, 1], [-30, -8])}deg)`,
            opacity: Math.min(1, lg * 2),
          }}
        >
          <div
            style={{
              width: 250,
              height: 250,
              borderRadius: '50%',
              background: COLORS.white,
              border: `10px solid ${COLORS.price}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 20px 50px rgba(0,0,0,0.45)',
              color: COLORS.navy,
            }}
          >
            <span dir="rtl" style={{fontFamily: FONTS.arabic, fontWeight: 800, fontSize: 40, lineHeight: 1}}>من</span>
            <span style={{fontFamily: FONTS.latin, fontWeight: 900, fontSize: 110, lineHeight: 1}}>{SPECS.membrane.brand}</span>
          </div>
        </div>
      )}
      <Flash at={tLG} opacity={0.35} duration={6} />
    </AbsoluteFill>
  );
};

/** "وزايد فيه بومبا HK 2 باش مايضيعش ليك الماء" */
export const Pump: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame, fps, config: {damping: 12, stiffness: 140, mass: 0.8}});
  const tSave = at('pump', 19);
  const spin = frame * 18;
  return (
    <AbsoluteFill>
      <Background variant="deep" bubbles={14} seed="pump" />
      <TechGrid />
      <Hero enter={enter}>
        <div style={{transform: `translate(${Math.sin(frame * 2.3) * 2}px, ${Math.cos(frame * 2.9) * 2}px)`}}>
          <PumpIcon size={500} spin={spin} />
        </div>
      </Hero>
      <BigSpec at={4} label={SPECS.pump.label} value={SPECS.pump.name} />
      {/* "doesn't waste water" — drop in a recycling loop */}
      <div style={{position: 'absolute', top: 230, width: '100%', display: 'flex', justifyContent: 'center'}}>
        <Pop at={tSave} from={0.3} y={-60}>
          <Badge
            fontSize={62}
            icon={
              <div style={{position: 'relative', width: 96, height: 96}}>
                <svg width={96} height={96} viewBox="0 0 100 100" style={{position: 'absolute', transform: `rotate(${frame * 6}deg)`}}>
                  <path d="M50 8 A42 42 0 1 1 14 30" fill="none" stroke={COLORS.eco} strokeWidth="9" strokeLinecap="round" />
                  <path d="M6 18 L14 34 L28 24" fill="none" stroke={COLORS.eco} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <DropIcon size={52} style={{position: 'absolute', left: 22, top: 20}} />
              </div>
            }
          >
            {SPECS.pump.note}
          </Badge>
        </Pop>
      </div>
    </AbsoluteFill>
  );
};
