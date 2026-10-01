import React from 'react';
import {AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {BottleIcon, CoinIcon, CrossIcon, MoneyIcon} from '../components/Icons';
import {Badge, Flash, Pop} from '../components/Motion';
import {SubtitleScrim} from '../components/Subtitles';
import {COLORS} from '../config';
import {at} from '../timeline';

// Pile of water jugs ("القراعي") that builds up during the first line.
const ROWS = [5, 4, 3];
const B = 160;
const SLOTS = ROWS.flatMap((n, row) =>
  new Array(n).fill(0).map((_, i) => ({
    x: 540 - (n * B * 0.8) / 2 + i * B * 0.8 + B * 0.4 - B / 2,
    y: 1180 - row * B * 0.98 - B,
    tilt: ((i * 37 + row * 11) % 14) - 7,
  })),
);

/** "باش توفر على راسك مصاريف القراعي" — bottles pile up with money flying away, then get crossed out. */
export const Savings: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tCross = Math.max(18, at('savings', 7) + 6);
  const step = Math.max(2, Math.floor((tCross - 8) / SLOTS.length));
  const cross = spring({frame: frame - tCross, fps, config: {damping: 8, stiffness: 240, mass: 0.6}});
  const fadePile = interpolate(frame, [tCross + 6, tCross + 16], [1, 0.35], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const landed = SLOTS.filter((_, i) => frame > 2 + i * step + 8).length;

  return (
    <AbsoluteFill>
      <Background variant={frame < tCross ? 'problem' : 'deep'} bubbles={10} seed="savings" />
      {/* bottles */}
      <AbsoluteFill style={{opacity: fadePile, filter: frame >= tCross ? 'grayscale(0.7)' : 'none'}}>
        {SLOTS.map((s, i) => {
          const start = 2 + i * step;
          const p = spring({frame: frame - start, fps, config: {damping: 11, stiffness: 170, mass: 0.7}});
          if (frame < start) return null;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: s.x,
                top: interpolate(p, [0, 1], [-260, s.y]),
                transform: `rotate(${s.tilt + (1 - p) * 40}deg)`,
                filter: 'drop-shadow(0 10px 14px rgba(0,0,0,0.45))',
              }}
            >
              <BottleIcon size={B} />
            </div>
          );
        })}
      </AbsoluteFill>
      {/* bottle counter */}
      {frame < tCross + 4 && (
        <div style={{position: 'absolute', top: 210, width: '100%', display: 'flex', justifyContent: 'center'}}>
          <Pop at={2} from={0.4}>
            <div
              dir="rtl"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                padding: '8px 40px',
                borderRadius: 30,
                background: 'rgba(255,59,59,0.92)',
                color: COLORS.white,
                fontFamily: 'Cairo',
                fontWeight: 900,
                fontSize: 64,
                boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
              }}
            >
              <BottleIcon size={96} />
              <span style={{fontFamily: 'Montserrat', fontSize: 92, direction: 'ltr'}}>×{landed}</span>
            </div>
          </Pop>
        </div>
      )}
      {/* money flying away */}
      {frame < tCross &&
        [0, 1, 2, 3].map((i) => (
          <Pop key={i} at={6 + i * 8} from={0.4} style={{position: 'absolute', left: [90, 780, 420, 650][i], top: [520, 560, 430, 700][i]}}>
            <div
              style={{
                transform: `translate(${Math.sin(frame / 7 + i) * 30 + (i % 2 ? 1 : -1) * frame * 2}px, ${-frame * 4}px) rotate(${Math.sin(frame / 5 + i) * 20}deg)`,
              }}
            >
              <MoneyIcon size={150} />
            </div>
          </Pop>
        ))}
      {/* big X over the pile */}
      {frame >= tCross && (
        <div
          style={{
            position: 'absolute',
            left: 540,
            top: 900,
            transform: `translate(-50%, -50%) scale(${interpolate(cross, [0, 1], [2.8, 1])}) rotate(-6deg)`,
            opacity: Math.min(1, cross * 2),
          }}
        >
          <CrossIcon size={360} style={{filter: 'drop-shadow(0 18px 40px rgba(255,59,59,0.6))'}} />
        </div>
      )}
      {/* coins raining into savings */}
      {frame >= tCross &&
        new Array(14).fill(0).map((_, i) => {
          const t = frame - tCross - i * 1.5;
          if (t < 0) return null;
          const x = 80 + random(`cx${i}`) * 920;
          const yy = -120 + t * (26 + random(`cv${i}`) * 14);
          return (
            <div key={i} style={{position: 'absolute', left: x, top: yy, transform: `rotate(${t * 9 + i * 30}deg)`, opacity: interpolate(yy, [1000, 1300], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
              <CoinIcon size={90} />
            </div>
          );
        })}
      {frame >= tCross && (
        <div style={{position: 'absolute', top: 210, width: '100%', display: 'flex', justifyContent: 'center'}}>
          <Pop at={tCross + 4} from={0.3} y={-60}>
            <Badge fontSize={70} icon={<CoinIcon size={96} />} bg={COLORS.price} color={COLORS.navy}>
              وفّر فلوسك
            </Badge>
          </Pop>
        </div>
      )}
      <Flash at={tCross} opacity={0.45} duration={6} />
      <SubtitleScrim strength={0.55} />
    </AbsoluteFill>
  );
};
