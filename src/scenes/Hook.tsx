import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {QuestionIcon, WarningIcon} from '../components/Icons';
import {GRADES, StockVideo} from '../components/Media';
import {Pop, shake} from '../components/Motion';
import {SubtitleScrim} from '../components/Subtitles';
import {STOCK} from '../media';

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

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const intensity = interpolate(frame, [0, 8, 30], [22, 10, 4], {extrapolateRight: 'clamp'});
  const {x, y} = shake(frame, intensity);
  const pulse = 1 + Math.sin(frame / 4) * 0.06;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `translate(${x}px, ${y}px) scale(1.04)`}}>
        {STOCK.hook ? (
          <StockVideo clip={STOCK.hook} grade={GRADES.problem} zoom={[1.15, 1.05]} />
        ) : (
          <>
            <Background variant="murky" bubbles={10} />
            <MurkyGlass />
          </>
        )}
        {/* vignette */}
        <AbsoluteFill style={{background: 'radial-gradient(75% 60% at 50% 45%, transparent 40%, rgba(0,0,0,0.65) 100%)'}} />
      </AbsoluteFill>
      <SubtitleScrim strength={0.7} />
      <Pop at={2} from={0.2} rotate={-25} style={{position: 'absolute', left: 90, top: 330}}>
        <div style={{transform: `scale(${pulse}) rotate(-8deg)`}}>
          <WarningIcon size={230} style={{filter: 'drop-shadow(0 12px 30px rgba(255,180,0,0.55))'}} />
        </div>
      </Pop>
      <Pop at={7} from={0.2} rotate={25} style={{position: 'absolute', right: 90, top: 560}}>
        <div style={{transform: `scale(${2 - pulse}) rotate(10deg)`}}>
          <QuestionIcon size={190} style={{filter: 'drop-shadow(0 12px 30px rgba(255,59,59,0.5))'}} />
        </div>
      </Pop>
    </AbsoluteFill>
  );
};
