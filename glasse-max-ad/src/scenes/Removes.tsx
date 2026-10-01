import React from 'react';
import {AbsoluteFill, interpolate, interpolateColors, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {CheckIcon, CrossIcon, SparkleIcon} from '../components/Icons';
import {Badge, Pop} from '../components/Motion';
import {COLORS} from '../config';
import {at} from '../timeline';

/** A glass whose water goes from murky (with particles) to crystal clear as `clean` goes 0 → 1. */
const Glass: React.FC<{clean: number}> = ({clean}) => {
  const frame = useCurrentFrame();
  const top = 640;
  const bottom = 1250;
  const waterY = top + 90;
  const wave = (x: number) => Math.sin(x / 38 + frame / 4) * 7;
  let surface = `M 330 ${waterY + wave(330)}`;
  for (let x = 340; x <= 750; x += 10) surface += ` L ${x} ${waterY + wave(x)}`;
  const c1 = interpolateColors(clean, [0, 1], ['#B9B48A', '#CDEFFF']);
  const c2 = interpolateColors(clean, [0, 1], ['#6E6A48', '#4FB6F0']);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute'}}>
      <defs>
        <linearGradient id="rmWater" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={c1} stopOpacity="0.85" />
          <stop offset="1" stopColor={c2} stopOpacity="0.95" />
        </linearGradient>
        <clipPath id="rmGlass">
          <path d={`M300 ${top} L780 ${top} L735 ${bottom - 30} Q732 ${bottom} 700 ${bottom} L380 ${bottom} Q348 ${bottom} 345 ${bottom - 30} Z`} />
        </clipPath>
      </defs>
      <g clipPath="url(#rmGlass)">
        <path d={`${surface} L 800 ${bottom + 20} L 280 ${bottom + 20} Z`} fill="url(#rmWater)" />
        {new Array(46).fill(0).map((_, i) => {
          const x = 350 + random(`rp${i}`) * 380;
          const y = waterY + 20 + ((random(`rq${i}`) * 500 + frame * (0.5 + random(`rs${i}`))) % (bottom - waterY - 30));
          return <circle key={i} cx={x + Math.sin(frame / 9 + i) * 8} cy={y} r={2 + random(`rr${i}`) * 5} fill="#4A4630" opacity={0.75 * (1 - clean)} />;
        })}
        {/* rising fresh bubbles once clean */}
        {new Array(16).fill(0).map((_, i) => {
          const x = 360 + random(`rb${i}`) * 360;
          const y = bottom - ((frame * (3 + random(`rv${i}`) * 3) + random(`ry${i}`) * 500) % (bottom - waterY));
          return <circle key={`b${i}`} cx={x} cy={y} r={5 + random(`rz${i}`) * 7} fill="none" stroke="#FFFFFF" strokeWidth="3" opacity={0.8 * clean} />;
        })}
      </g>
      <path d={`M300 ${top} L780 ${top} L735 ${bottom - 30} Q732 ${bottom} 700 ${bottom} L380 ${bottom} Q348 ${bottom} 345 ${bottom - 30} Z`} fill="rgba(255,255,255,0.12)" stroke="#FFFFFF" strokeWidth="9" />
      <path d={`M335 ${top + 50} L375 ${bottom - 60}`} stroke="rgba(255,255,255,0.6)" strokeWidth="14" strokeLinecap="round" />
    </svg>
  );
};

/** "الكلور والأملاح اللي كتأثر على الجودة والطعم ديال الماء" */
export const Removes: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tChips = 2;
  const tKill = Math.max(tChips + 10, at('removes', 14) - 2);
  const tGood = at('removes', 15) - 4;
  const clean = interpolate(frame, [tKill, tGood + 6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const chips = [
    {label: 'الكلور', sym: 'Cl', x: 540, y: 470, at: tChips},
    {label: 'الأملاح', sym: 'NaCl', x: 90, y: 560, at: tChips + 3},
    {label: 'الشوائب', sym: '•••', x: 560, y: 1040, at: tChips + 6},
  ];

  return (
    <AbsoluteFill>
      <Background variant={clean > 0.5 ? 'bright' : 'problem'} bubbles={12} seed="removes" />
      <AbsoluteFill style={{opacity: clean, background: 'radial-gradient(60% 40% at 50% 55%, rgba(255,255,255,0.9), rgba(255,255,255,0))'}} />
      <Glass clean={clean} />
      {/* contaminant chips get knocked out */}
      {chips.map((c, i) => {
        const kill = spring({frame: frame - tKill - i * 3, fps, config: {damping: 14, stiffness: 200}});
        if (frame >= tKill + i * 3 + 14) return null;
        return (
          <Pop key={c.label} at={c.at} from={0.3} x={i % 2 ? -200 : 200} style={{position: 'absolute', left: c.x, top: c.y}}>
            <div style={{transform: `translateX(${(i % 2 ? -1 : 1) * kill * 700}px) rotate(${kill * (i % 2 ? -30 : 30)}deg)`, opacity: 1 - kill}}>
              <Badge fontSize={58} icon={<CrossIcon size={70} />} bg="rgba(255,255,255,0.96)">
                {c.label} <span style={{fontFamily: 'Montserrat', fontSize: 34, color: COLORS.danger, marginRight: 8}}>{c.sym}</span>
              </Badge>
            </div>
          </Pop>
        );
      })}
      {/* quality + taste */}
      {[
        {label: 'الجودة', y: 230, at: at('removes', 14) + 4},
        {label: 'الطعم', y: 1100, at: at('removes', 15)},
      ].map((g) => (
        <div key={g.label} style={{position: 'absolute', top: g.y, width: '100%', display: 'flex', justifyContent: 'center'}}>
          <Pop at={g.at} from={0.3} y={40}>
            <Badge fontSize={68} icon={<CheckIcon size={86} progress={interpolate(frame, [g.at + 2, g.at + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />}>
              {g.label}
            </Badge>
          </Pop>
        </div>
      ))}
      {clean > 0.6 &&
        [0, 1, 2].map((i) => {
          const t = (frame + i * 9) % 26;
          return (
            <div key={i} style={{position: 'absolute', left: [250, 780, 520][i], top: [760, 900, 640][i], opacity: Math.sin((t / 26) * Math.PI)}}>
              <SparkleIcon size={80} />
            </div>
          );
        })}
    </AbsoluteFill>
  );
};
