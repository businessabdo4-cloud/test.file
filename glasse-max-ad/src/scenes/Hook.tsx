import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {CrossIcon, PinIcon, QuestionIcon, WarningIcon} from '../components/Icons';
import {Glitch, Pop, shake} from '../components/Motion';
import {SubtitleScrim} from '../components/Subtitles';
import {COLORS, FONTS} from '../config';
import {at} from '../timeline';

/** Motion-graphics fallback: cloudy tap water pouring into a glass. */
const MurkyGlass: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fill = interpolate(frame, [0, 2.2 * fps], [0.35, 0.78], {extrapolateRight: 'clamp'});
  const glassTop = 620;
  const glassBottom = 1260;
  const waterY = glassBottom - (glassBottom - glassTop) * fill;
  const wave = (x: number) => Math.sin(x / 40 + frame / 3) * 8;
  let surface = `M 330 ${waterY + wave(330)}`;
  for (let x = 340; x <= 750; x += 10) surface += ` L ${x} ${waterY + wave(x)}`;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <defs>
        <linearGradient id="murk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#B9B48A" stopOpacity="0.75" />
          <stop offset="1" stopColor="#6E6A48" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="chrome" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8A9099" />
          <stop offset="0.5" stopColor="#E6E9EE" />
          <stop offset="1" stopColor="#6C727B" />
        </linearGradient>
        <clipPath id="glass">
          <path d="M300 600 L780 600 L735 1270 Q732 1300 700 1300 L380 1300 Q348 1300 345 1270 Z" />
        </clipPath>
      </defs>
      {/* tap */}
      <rect x="470" y="150" width="240" height="70" rx="30" fill="url(#chrome)" />
      <rect x="500" y="200" width="70" height="120" rx="18" fill="url(#chrome)" />
      {/* stream */}
      <path
        d={`M512 320 Q${520 + Math.sin(frame / 2) * 6} 500 ${525 + Math.sin(frame / 3) * 5} ${waterY} L ${555 + Math.sin(frame / 3) * 5} ${waterY} Q${552 + Math.sin(frame / 2.5) * 6} 500 558 320 Z`}
        fill="#A9A57C"
        opacity="0.85"
      />
      {/* water */}
      <g clipPath="url(#glass)">
        <path d={`${surface} L 800 1320 L 280 1320 Z`} fill="url(#murk)" />
        {new Array(40).fill(0).map((_, i) => {
          const x = 350 + random(`p${i}`) * 380;
          const y = waterY + 20 + ((random(`q${i}`) * 600 + frame * (0.6 + random(`s${i}`))) % Math.max(40, glassBottom - waterY));
          return <circle key={i} cx={x + Math.sin(frame / 10 + i) * 8} cy={y} r={2 + random(`r${i}`) * 5} fill="#4A4630" opacity={0.7} />;
        })}
        {/* splash foam */}
        <ellipse cx="540" cy={waterY + 6} rx={50 + Math.sin(frame) * 6} ry="14" fill="#D8D4B0" opacity="0.6" />
      </g>
      {/* glass outline + highlight */}
      <path d="M300 600 L780 600 L735 1270 Q732 1300 700 1300 L380 1300 Q348 1300 345 1270 Z" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.65)" strokeWidth="8" />
      <path d="M335 650 L375 1240" stroke="rgba(255,255,255,0.35)" strokeWidth="14" strokeLinecap="round" />
    </svg>
  );
};

/** "كتسكن فآسفي؟" — a pin drops on a Safi badge. */
const SafiPin: React.FC<{start: number; end: number}> = ({start, end}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const drop = spring({frame: frame - start, fps, config: {damping: 9, stiffness: 180, mass: 0.6}});
  const card = spring({frame: frame - start - 3, fps, config: {damping: 12, stiffness: 200, mass: 0.6}});
  // after the first beat the badge shrinks into the top-right corner and stays
  const dock = spring({frame: frame - end, fps, config: {damping: 16, stiffness: 160}});
  const ring = ((frame - start) % 24) / 24;
  if (frame < start) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: interpolate(dock, [0, 1], [540, 850]),
        top: interpolate(dock, [0, 1], [760, 330]),
        transform: `translate(-50%, -50%) scale(${interpolate(dock, [0, 1], [1, 0.42])})`,
      }}
    >
      {/* pulse ring */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 250,
          width: 340,
          height: 120,
          borderRadius: '50%',
          border: `8px solid ${COLORS.danger}`,
          transform: `translate(-50%, -50%) scale(${0.4 + ring * 1.2})`,
          opacity: (1 - ring) * card * (1 - dock),
        }}
      />
      <div style={{position: 'absolute', left: '50%', top: 250 - 330 + (1 - drop) * -700, transform: 'translateX(-50%)'}}>
        <PinIcon size={330} style={{filter: 'drop-shadow(0 22px 30px rgba(0,0,0,0.5))'}} />
      </div>
      <div
        dir="rtl"
        style={{
          position: 'absolute',
          top: 290,
          left: 0,
          width: 'max-content',
          transform: `translateX(-50%) scale(${card})`,
          padding: '6px 70px 16px',
          borderRadius: 40,
          background: COLORS.white,
          color: COLORS.navy,
          fontFamily: FONTS.arabic,
          fontWeight: 900,
          fontSize: 170,
          lineHeight: 1.25,
          whiteSpace: 'nowrap',
          boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
          textAlign: 'center',
        }}
      >
        آسفي
        <div style={{fontFamily: FONTS.latin, fontSize: 44, letterSpacing: 18, marginTop: -18, color: COLORS.logoBlue}}>SAFI</div>
      </div>
    </div>
  );
};

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tGlass = Math.max(10, at('hook', 2) - 2);
  const tBad = at('hook', 3);
  const intensity = interpolate(frame, [0, 8, 30], [26, 10, 3], {extrapolateRight: 'clamp'}) + (frame >= tBad && frame < tBad + 10 ? 14 : 0);
  const {x, y} = shake(frame, intensity);
  const pulse = 1 + Math.sin(frame / 4) * 0.06;
  const glass = spring({frame: frame - tGlass, fps, config: {damping: 14, stiffness: 150}});
  const stamp = spring({frame: frame - tBad - 4, fps, config: {damping: 8, stiffness: 260, mass: 0.6}});
  return (
    <Glitch at={tBad} duration={8}>
      <AbsoluteFill style={{transform: `translate(${x}px, ${y}px) scale(1.04)`}}>
        <Background variant="murky" bubbles={14} />
        {frame >= tGlass && (
          <AbsoluteFill style={{opacity: Math.min(1, glass * 1.5), transform: `translateY(${(1 - glass) * 500}px)`}}>
            <MurkyGlass />
          </AbsoluteFill>
        )}
        <AbsoluteFill style={{background: 'radial-gradient(75% 60% at 50% 45%, transparent 40%, rgba(0,0,0,0.7) 100%)'}} />
      </AbsoluteFill>
      <SubtitleScrim strength={0.7} />
      <SafiPin start={0} end={tGlass} />
      <Pop at={tGlass + 4} from={0.2} rotate={-25} style={{position: 'absolute', left: 70, top: 420}}>
        <div style={{transform: `scale(${pulse}) rotate(-8deg)`}}>
          <WarningIcon size={210} style={{filter: 'drop-shadow(0 12px 30px rgba(255,180,0,0.55))'}} />
        </div>
      </Pop>
      <Pop at={tGlass + 9} from={0.2} rotate={25} style={{position: 'absolute', right: 80, top: 640}}>
        <div style={{transform: `scale(${2 - pulse}) rotate(10deg)`}}>
          <QuestionIcon size={170} style={{filter: 'drop-shadow(0 12px 30px rgba(255,59,59,0.5))'}} />
        </div>
      </Pop>
      {/* red X stamp on "ماء الروبيني" */}
      {frame >= tBad + 4 && (
        <div style={{position: 'absolute', left: 540, top: 950, transform: `translate(-50%, -50%) scale(${interpolate(stamp, [0, 1], [2.6, 1])}) rotate(-8deg)`, opacity: Math.min(1, stamp * 2)}}>
          <CrossIcon size={300} style={{filter: 'drop-shadow(0 18px 40px rgba(255,59,59,0.6))'}} />
        </div>
      )}
    </Glitch>
  );
};
