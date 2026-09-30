import React from 'react';
import {AbsoluteFill, Sequence, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {CoffeeIcon, FamilyIcon, HeartIcon, SteamIcon, TeaGlassIcon} from '../components/Icons';
import {GRADES, KenBurns, StockVideo} from '../components/Media';
import {Flash, Pop} from '../components/Motion';
import {Product} from '../components/Product';
import {SubtitleScrim} from '../components/Subtitles';
import {COLORS} from '../config';
import {PRODUCTS, STOCK, StockClip} from '../media';
import {at} from '../timeline';

/** Clear water filling a glass (fallback for "ما صافي"). */
const ClearGlass: React.FC = () => {
  const frame = useCurrentFrame();
  const fill = interpolate(frame, [0, 24], [0.15, 0.85], {extrapolateRight: 'clamp'});
  const top = 640;
  const bottom = 1260;
  const wy = bottom - (bottom - top) * fill;
  let surface = `M 330 ${wy}`;
  for (let x = 330; x <= 760; x += 10) surface += ` L ${x} ${wy + Math.sin(x / 35 + frame / 2.5) * 7}`;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <defs>
        <linearGradient id="clear" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#DFF4FF" stopOpacity="0.9" />
          <stop offset="1" stopColor="#7FD3FF" stopOpacity="0.95" />
        </linearGradient>
        <clipPath id="g2">
          <path d="M300 620 L780 620 L735 1270 Q732 1300 700 1300 L380 1300 Q348 1300 345 1270 Z" />
        </clipPath>
      </defs>
      <path d={`M522 0 L558 0 L${556 + Math.sin(frame / 3) * 3} ${wy} L${524 + Math.sin(frame / 3) * 3} ${wy} Z`} fill="#BFE9FF" opacity="0.9" />
      <g clipPath="url(#g2)">
        <path d={`${surface} L 800 1320 L 280 1320 Z`} fill="url(#clear)" />
        {new Array(18).fill(0).map((_, i) => (
          <circle key={i} cx={360 + random(`b${i}`) * 360} cy={1280 - ((frame * (3 + random(`v${i}`) * 3) + random(`o${i}`) * 500) % 600)} r={4 + random(`z${i}`) * 7} fill="white" opacity="0.8" />
        ))}
      </g>
      <path d="M300 620 L780 620 L735 1270 Q732 1300 700 1300 L380 1300 Q348 1300 345 1270 Z" fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="9" />
      <path d="M338 670 L378 1240" stroke="white" strokeWidth="16" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
};

const Beat: React.FC<{
  clip: StockClip | null;
  photo?: string | null;
  bg: 'bright' | 'warm';
  children: React.ReactNode;
}> = ({clip, photo, bg, children}) => (
  <AbsoluteFill>
    {clip ? (
      <StockVideo clip={clip} grade={bg === 'warm' ? GRADES.warm : GRADES.solution} />
    ) : photo ? (
      <>
        <KenBurns src={photo} grade="blur(3px) brightness(1.05)" />
        <AbsoluteFill style={{background: bg === 'warm' ? 'rgba(255,214,150,0.45)' : 'rgba(234,247,255,0.45)'}} />
      </>
    ) : (
      <Background variant={bg} bubbles={14} seed={`ben-${bg}`} />
    )}
    {children}
  </AbsoluteFill>
);

const BigIcon: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({frame, fps, config: {damping: 9, stiffness: 180, mass: 0.6}});
  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: 520,
        transform: `translateX(-50%) scale(${0.3 + 0.7 * s}) rotate(${(1 - s) * -20 + Math.sin(frame / 8) * 3}deg)`,
        filter: 'drop-shadow(0 30px 40px rgba(90,40,0,0.35))',
      }}
    >
      {children}
    </div>
  );
};

export const Benefits: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  const b1 = 0;
  const b2 = at('benefits', 19);
  const b3 = at('benefits', 20);
  const b4 = at('benefits', 21);
  const productIn = spring({frame: frame - (durationInFrames - 16), fps, config: {damping: 14, stiffness: 150}});

  return (
    <AbsoluteFill>
      <Sequence from={b1} durationInFrames={b2 - b1} layout="none">
        <Beat clip={STOCK.benefitsPure} bg="bright">
          {!STOCK.benefitsPure && <ClearGlass />}
        </Beat>
      </Sequence>
      <Sequence from={b2} durationInFrames={b3 - b2} layout="none">
        <Beat clip={STOCK.benefitsTea} photo={PRODUCTS.kitchenRed} bg="warm">
          <BigIcon>
            <SteamIcon t={frame} size={200} style={{position: 'absolute', left: 150, top: -150}} />
            <TeaGlassIcon size={440} />
          </BigIcon>
        </Beat>
      </Sequence>
      <Sequence from={b3} durationInFrames={b4 - b3} layout="none">
        <Beat clip={STOCK.benefitsCoffee} photo={PRODUCTS.kitchenBlue} bg="warm">
          <BigIcon>
            <SteamIcon t={frame} size={200} style={{position: 'absolute', left: 100, top: -130}} />
            <CoffeeIcon size={440} />
          </BigIcon>
        </Beat>
      </Sequence>
      <Sequence from={b4} layout="none">
        <Beat clip={STOCK.benefitsFamily} photo={PRODUCTS.kitchenBlue} bg="bright">
          <AbsoluteFill style={{background: STOCK.benefitsFamily ? 'transparent' : `radial-gradient(60% 40% at 50% 45%, ${COLORS.water}55, transparent)`}} />
          <Pop at={0} from={0.3} style={{position: 'absolute', left: 290, top: 470}}>
            <div style={{filter: 'drop-shadow(0 20px 30px rgba(6,26,58,0.5))'}}>
              <FamilyIcon size={500} />
            </div>
          </Pop>
          {[0, 1, 2, 3, 4].map((i) => (
            <Pop key={i} at={3 + i * 3} from={0.2} style={{position: 'absolute', left: [180, 800, 250, 760, 500][i], top: [440, 480, 900, 880, 330][i]}}>
              <div style={{transform: `translateY(${-(frame - b4) * 2}px)`}}>
                <HeartIcon size={[90, 110, 70, 80, 100][i]} />
              </div>
            </Pop>
          ))}
        </Beat>
      </Sequence>
      {/* quick flashes on the cuts */}
      <Flash at={b2} opacity={0.6} />
      <Flash at={b3} opacity={0.6} />
      <Flash at={b4} opacity={0.6} />
      <SubtitleScrim strength={0.5} />
      {/* product slides back in to lead into the colors scene */}
      {frame > durationInFrames - 16 && (
        <div style={{position: 'absolute', left: '50%', top: 560, transform: `translateX(-50%) translateX(${(1 - productIn) * 1100}px)`}}>
          <Product src={PRODUCTS.pairCutout ?? PRODUCTS.blueCutout} width={760} float={false} />
        </div>
      )}
    </AbsoluteFill>
  );
};
