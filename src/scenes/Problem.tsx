import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {BottleIcon, MoneyIcon} from '../components/Icons';
import {GRADES, StockVideo} from '../components/Media';
import {Pop} from '../components/Motion';
import {SubtitleScrim} from '../components/Subtitles';
import {COLORS} from '../config';
import {STOCK} from '../media';

// Pyramid of bottles that piles up during "كل سيمانة"
const ROWS = [5, 4, 3, 2];
const B = 150;
const SLOTS = ROWS.flatMap((n, row) =>
  new Array(n).fill(0).map((_, i) => ({
    x: 540 - (n * B * 0.78) / 2 + i * B * 0.78 + B * 0.39 - B / 2,
    y: 1230 - row * B * 0.98 - B,
    tilt: ((i * 37 + row * 11) % 14) - 7,
  })),
);

export const Problem: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const step = Math.max(2, Math.floor((durationInFrames - 20) / SLOTS.length));
  const landed = SLOTS.filter((_, i) => frame > 4 + i * step + 8).length;
  const pump = spring({frame: frame - (4 + (landed - 1) * step + 8), fps, config: {damping: 10, stiffness: 300}});

  return (
    <AbsoluteFill>
      {STOCK.problem ? (
        <StockVideo clip={STOCK.problem} grade={GRADES.problemCool} />
      ) : (
        <Background variant="problem" bubbles={8} />
      )}
      {STOCK.problem && <AbsoluteFill style={{background: 'rgba(6,18,40,0.35)'}} />}
      {SLOTS.map((s, i) => {
        const start = 4 + i * step;
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
      {/* counter */}
      <div
        style={{
          position: 'absolute',
          top: 230,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 18,
          fontFamily: 'Montserrat',
          fontWeight: 900,
          fontSize: 150,
          color: COLORS.white,
          textShadow: '0 8px 30px rgba(0,0,0,0.6)',
          transform: `scale(${1 + (1 - pump) * 0.18})`,
        }}
      >
        <BottleIcon size={130} />
        <span>×{landed}</span>
      </div>
      {/* money flying away */}
      {[0, 1, 2].map((i) => (
        <Pop key={i} at={10 + i * 12} from={0.4} style={{position: 'absolute', left: [110, 760, 430][i], top: [470, 520, 400][i]}}>
          <div
            style={{
              transform: `translate(${Math.sin(frame / 7 + i) * 30 + (i === 1 ? 1 : -1) * frame * 1.5}px, ${-frame * 3}px) rotate(${Math.sin(frame / 5 + i) * 20}deg)`,
              opacity: interpolate(frame, [durationInFrames - 20, durationInFrames], [1, 0], {extrapolateLeft: 'clamp'}),
            }}
          >
            <MoneyIcon size={170} />
          </div>
        </Pop>
      ))}
      <SubtitleScrim strength={0.65} />
    </AbsoluteFill>
  );
};
