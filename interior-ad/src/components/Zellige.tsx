import React from 'react';

/** Faint zellige-inspired tessellation: 8-point stars (two rotated squares) with linking lattice. */
export const Zellige: React.FC<{color: string; opacity: number; size?: number; x?: number; y?: number; rotate?: number}> = ({
  color,
  opacity,
  size = 132,
  x = 0,
  y = 0,
  rotate = 0,
}) => {
  const s = size;
  const c = s / 2;
  const r = s * 0.3;
  const sq = (rot: number) => {
    const pts = [0, 1, 2, 3].map((i) => {
      const a = ((i * 90 + 45 + rot) * Math.PI) / 180;
      return `${c + r * Math.cos(a)},${c + r * Math.sin(a)}`;
    });
    return pts.join(' ');
  };
  const k = r * 0.42;
  return (
    <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, opacity}}>
      <defs>
        <pattern
          id={`zel-${color.replace('#', '')}`}
          width={s}
          height={s}
          patternUnits="userSpaceOnUse"
          patternTransform={`translate(${x} ${y}) rotate(${rotate})`}
        >
          <g fill="none" stroke={color} strokeWidth={1.6} strokeLinejoin="round">
            <polygon points={sq(0)} />
            <polygon points={sq(45)} />
            <circle cx={c} cy={c} r={k} />
            {/* lattice arms connecting stars across tiles */}
            <path d={`M${c},0 L${c},${c - r} M${c},${c + r} L${c},${s} M0,${c} L${c - r},${c} M${c + r},${c} L${s},${c}`} />
            <path d={`M0,0 L${s * 0.14},${s * 0.14} M${s},0 L${s * 0.86},${s * 0.14} M0,${s} L${s * 0.14},${s * 0.86} M${s},${s} L${s * 0.86},${s * 0.86}`} />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#zel-${color.replace('#', '')})`} />
    </svg>
  );
};
