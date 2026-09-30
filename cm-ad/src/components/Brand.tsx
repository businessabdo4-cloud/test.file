import React from 'react';
import {Img, staticFile} from 'remotion';
import {brand} from '../theme';

/** Logo (keyed from the supplied artwork; always placed on brand navy). Native aspect 1134×444. */
export const Logo: React.FC<{width: number; style?: React.CSSProperties}> = ({width, style}) => (
  <Img src={staticFile('brand/roia-media-logo.png')} style={{width, height: (width * 444) / 1134, display: 'block', ...style}} />
);

/**
 * The logo's racetrack motif: four parallel stripes that run along the top, wrap round a rounded left
 * end and return along the bottom (a "C" open to the right). `draw` 0→1 races the stripes in from the
 * top-right tail; `shine` sweeps a highlight along them.
 */
export const Stripes: React.FC<{
  x: number; y: number; w: number; h: number; draw: number; shine?: number; bottomLen?: number;
  stroke?: number; gap?: number; opacity?: number;
}> = ({x, y, w, h, draw, shine = -1, bottomLen = 0.62, stroke = 14, gap = 12, opacity = 1}) => {
  const lines = [0, 1, 2, 3];
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible', opacity}}>
      {lines.map((i) => {
        const o = i * (stroke + gap); // inset of this stripe
        const top = y + o;
        const bot = y + h - o;
        const r = (bot - top) / 2;
        const left = x + o;
        const right = x + w;
        const bottomEnd = x + o + r + (w - o - r) * bottomLen;
        const d = `M${right},${top} L${left + r},${top} A${r},${r} 0 0 0 ${left + r},${bot} L${bottomEnd},${bot}`;
        const len = right - (left + r) + Math.PI * r + (bottomEnd - (left + r));
        const p = Math.max(0, Math.min(1, draw * 1.15 - i * 0.05));
        return (
          <g key={i}>
            <path d={d} fill="none" stroke={brand.yellow} strokeWidth={stroke} strokeLinecap="round"
              strokeDasharray={`${len} ${len}`} strokeDashoffset={len * (1 - p)} />
            {shine >= 0 && shine <= 1 && (
              <path d={d} fill="none" stroke="#FFF6CC" strokeWidth={stroke} strokeLinecap="round" opacity={0.85}
                strokeDasharray={`90 ${len}`} strokeDashoffset={-(len + 90) * shine + 90 + i * 30} />
            )}
          </g>
        );
      })}
    </svg>
  );
};

/** Logo asterisk (8 arms) as a vector so it can pop and spin crisply. */
export const Asterisk: React.FC<{size: number; color?: string; rotate?: number; style?: React.CSSProperties}> = ({size, color = brand.yellow, rotate = 0, style}) => (
  <svg width={size} height={size} viewBox="-50 -50 100 100" style={{display: 'block', transform: `rotate(${rotate}deg)`, ...style}}>
    {[0, 45, 90, 135].map((a) => (
      <rect key={a} x={-6} y={-46} width={12} height={92} rx={6} fill={color} transform={`rotate(${a})`} />
    ))}
  </svg>
);
