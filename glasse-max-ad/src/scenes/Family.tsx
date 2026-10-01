import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {FamilyIcon, HeartIcon, ShieldIcon} from '../components/Icons';
import {Pop} from '../components/Motion';
import {COLORS} from '../config';
import {at} from '../timeline';

const CX = 540;
const CY = 860;
const R = 360;

/** "وتحمي عائلتك من ماء الروبيني" — a water bubble shields the family; murky drops bounce off it. */
export const Family: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const shield = spring({frame: frame - 2, fps, config: {damping: 12, stiffness: 140, mass: 0.8}});
  const tDrops = Math.max(8, at('family', 9) - 6);
  const wobble = (a: number) => 1 + 0.025 * Math.sin(a * 6 + frame / 4) + 0.015 * Math.sin(a * 11 - frame / 3);

  const pts: string[] = [];
  for (let i = 0; i <= 72; i++) {
    const a = (i / 72) * Math.PI * 2;
    const r = R * shield * wobble(a);
    pts.push(`${CX + Math.cos(a) * r},${CY + Math.sin(a) * r}`);
  }

  return (
    <AbsoluteFill>
      <Background variant="warm" bubbles={10} seed="family" />
      {/* murky drops falling and bouncing off the bubble */}
      {new Array(12).fill(0).map((_, i) => {
        const t = frame - tDrops - i * 2.2;
        if (t < 0) return null;
        const x0 = CX + (random(`fx${i}`) - 0.5) * 2 * (R - 40);
        const dx = x0 - CX;
        const yHit = CY - Math.sqrt(Math.max(0, R * R - dx * dx)) - 30;
        const vy = 46;
        const tHit = (yHit + 120) / vy;
        let x = x0;
        let y = -120 + vy * t;
        let rot = 0;
        if (t > tHit) {
          const tb = t - tHit;
          const dir = dx >= 0 ? 1 : -1;
          x = x0 + dir * (14 + Math.abs(dx) * 0.05) * tb;
          y = yHit - 22 * tb + 2.4 * tb * tb;
          rot = dir * tb * 18;
        }
        return (
          <svg key={i} width={70} height={90} viewBox="0 0 100 130" style={{position: 'absolute', left: x - 35, top: y - 45, transform: `rotate(${rot}deg)`, opacity: 0.95}}>
            <path d="M50 4 C50 4 12 62 12 84 A38 38 0 0 0 88 84 C88 62 50 4 50 4Z" fill={COLORS.murk} stroke="#5E5733" strokeWidth="5" />
            <circle cx="40" cy="88" r="7" fill="#5E5733" />
            <circle cx="60" cy="74" r="5" fill="#5E5733" />
          </svg>
        );
      })}
      {/* the water bubble */}
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <defs>
          <radialGradient id="bubble" cx="0.4" cy="0.35">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="0.6" stopColor={COLORS.sky} stopOpacity="0.55" />
            <stop offset="1" stopColor={COLORS.water} stopOpacity="0.85" />
          </radialGradient>
        </defs>
        <polygon points={pts.join(' ')} fill="url(#bubble)" stroke="#FFFFFF" strokeWidth="10" />
        <ellipse cx={CX - R * 0.42 * shield} cy={CY - R * 0.48 * shield} rx={70 * shield} ry={34 * shield} fill="#FFFFFF" opacity="0.75" transform={`rotate(-35 ${CX - R * 0.42} ${CY - R * 0.48})`} />
      </svg>
      {/* family inside */}
      <div style={{position: 'absolute', left: CX, top: CY + 20, transform: `translate(-50%, -50%) scale(${shield})`}}>
        <div style={{width: 400, height: 400, borderRadius: '50%', background: COLORS.deepBlue, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 -14px 0 rgba(0,0,0,0.2)'}}>
          <FamilyIcon size={300} />
        </div>
      </div>
      <Pop at={10} from={0.2} rotate={-20} style={{position: 'absolute', left: 720, top: 470}}>
        <ShieldIcon size={190} style={{filter: 'drop-shadow(0 14px 26px rgba(6,26,58,0.4))'}} />
      </Pop>
      <Pop at={16} from={0.2} rotate={20} style={{position: 'absolute', left: 150, top: 520}}>
        <div style={{transform: `scale(${1 + 0.08 * Math.sin(frame / 3)})`}}>
          <HeartIcon size={150} style={{filter: 'drop-shadow(0 12px 24px rgba(255,77,109,0.5))'}} />
        </div>
      </Pop>
    </AbsoluteFill>
  );
};
