import React from 'react';
import {AbsoluteFill, interpolate, interpolateColors, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background} from '../components/Background';
import {CartridgeIcon, DropIcon} from '../components/Icons';
import {Badge, Headline, Pop, countUp} from '../components/Motion';
import {COLORS, FONTS, SPECS} from '../config';
import {at} from '../timeline';

const SIZE = 230;
// two rows of three, read right-to-left like the Arabic copy
const CELLS = [0, 1, 2, 3, 4, 5].map((i) => ({
  x: 540 + (1 - (i % 3)) * 300 - SIZE / 2,
  y: 430 + Math.floor(i / 3) * 360,
}));

/** "هاد السيستيم فيه 6 ديال المراحل ديال التصفية باش ينقص من الشوائب" */
export const Stages: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const tCount = 2;
  const stepF = Math.max(5, Math.floor((at('stages', 11) - 6) / 6));
  const tDirty = at('stages', 12);
  const n = countUp(frame, tCount + 2, stepF * 6, SPECS.stages);
  const dirtyIn = spring({frame: frame - tDirty, fps, config: {damping: 13, stiffness: 160}});

  return (
    <AbsoluteFill>
      <Background variant="bright" bubbles={14} seed="stages" />
      <Headline from={tCount} to={10_000}>
        <Badge
          fontSize={66}
          icon={<span style={{fontFamily: FONTS.latin, fontWeight: 900, fontSize: 120, color: COLORS.water, lineHeight: 1}}>{n}</span>}
        >
          {SPECS.stagesLabel}
        </Badge>
      </Headline>

      {/* connecting pipe (draws itself through the stages) */}
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <path
          d={`M ${CELLS[0].x + SIZE / 2 + 170} ${CELLS[0].y + SIZE / 2} L ${CELLS[2].x + SIZE / 2} ${CELLS[2].y + SIZE / 2} Q ${CELLS[2].x - 40} ${(CELLS[2].y + CELLS[5].y) / 2 + SIZE / 2} ${CELLS[3].x + SIZE / 2} ${CELLS[3].y + SIZE / 2} L ${CELLS[5].x + SIZE / 2} ${CELLS[5].y + SIZE / 2} L ${CELLS[5].x + SIZE / 2 - 190} ${CELLS[5].y + SIZE / 2}`}
          fill="none"
          stroke={COLORS.sky}
          strokeWidth={26}
          strokeLinecap="round"
          strokeDasharray={2600}
          strokeDashoffset={interpolate(frame, [tCount, tCount + stepF * 6 + 6], [2600, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}
          opacity={0.8}
        />
      </svg>

      {CELLS.map((c, i) => {
        const tOn = tCount + 2 + i * stepF;
        const on = spring({frame: frame - tOn, fps, config: {damping: 11, stiffness: 220, mass: 0.6}});
        const fill = interpolate(frame, [tOn, tOn + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        // water gets cleaner stage after stage
        const color = interpolateColors(i / 5, [0, 0.5, 1], [COLORS.murk, '#7FB9C8', COLORS.water]);
        if (frame < tOn - 2) return null;
        return (
          <div key={i} style={{position: 'absolute', left: c.x, top: c.y, transform: `scale(${0.5 + 0.5 * on})`, opacity: Math.min(1, on * 2)}}>
            <CartridgeIcon size={SIZE} fill={color} level={fill} style={{filter: 'drop-shadow(0 16px 24px rgba(6,26,58,0.25))'}} />
            <div
              style={{
                position: 'absolute',
                top: -26,
                right: -6,
                width: 84,
                height: 84,
                borderRadius: '50%',
                background: COLORS.water,
                border: '6px solid white',
                color: COLORS.white,
                fontFamily: FONTS.latin,
                fontWeight: 900,
                fontSize: 46,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 18px rgba(6,26,58,0.3)',
              }}
            >
              {i + 1}
            </div>
          </div>
        );
      })}

      {/* before → after: murky drop in, clean drop out */}
      {frame >= tDirty && (
        <div
          dir="rtl"
          style={{
            position: 'absolute',
            top: 1150,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 40,
            opacity: Math.min(1, dirtyIn * 2),
            transform: `translateY(${(1 - dirtyIn) * 120}px)`,
          }}
        >
          <div style={{position: 'relative'}}>
            <DropIcon size={170} color={COLORS.murk} />
            {new Array(7).fill(0).map((_, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: 50 + random(`dd${i}`) * 70,
                  top: 80 + random(`de${i}`) * 60 + Math.sin(frame / 5 + i) * 4,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: '#4A4630',
                }}
              />
            ))}
          </div>
          <svg width={180} height={80} viewBox="0 0 180 80">
            <path d="M170 40 H30 M60 12 L28 40 L60 68" fill="none" stroke={COLORS.deepBlue} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="300" strokeDashoffset={interpolate(frame, [tDirty + 4, tDirty + 14], [300, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
          </svg>
          <Pop at={tDirty + 12} from={0.3}>
            <DropIcon size={190} style={{filter: 'drop-shadow(0 0 30px rgba(31,162,255,0.8))'}} />
          </Pop>
        </div>
      )}
    </AbsoluteFill>
  );
};
