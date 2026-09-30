import React from 'react';

/** Elegant placeholder interiors (flat SVG): arch window, sofa, lamp, plant, rug. viewBox 400×500. */
const PALETTES = [
  {wall: ['#E9D8C4', '#D9BFA3'], floor: '#B98A64', sofa: '#6E7F6A', accent: '#C2703D', sky: ['#F6E7CF', '#E8C9A2'], rug: '#E7DCCB'},
  {wall: ['#DCE3DC', '#BFCBC2'], floor: '#8E6E54', sofa: '#C9A27C', accent: '#1E3B33', sky: ['#F4EEE3', '#D8E0D6'], rug: '#EDE4D6'},
  {wall: ['#F1E3D3', '#E3C7AC'], floor: '#A36F4E', sofa: '#EFE6DA', accent: '#B8925A', sky: ['#FBF1E2', '#F0D2AE'], rug: '#C97C4F'},
  {wall: ['#2C4A42', '#1E3B33'], floor: '#7A5A43', sofa: '#D8B48A', accent: '#DE8A55', sky: ['#F2D9B6', '#D99A6C'], rug: '#B8925A'},
  {wall: ['#EADFD2', '#D6C3AE'], floor: '#9A7457', sofa: '#8C5A3C', accent: '#1E3B33', sky: ['#F7EBDD', '#E2CFB8'], rug: '#F1E9DD'},
];

const pointed = (x: number, y: number, w: number, h: number) => {
  const R = 0.8 * w;
  const s = Math.sqrt(R * R - (R - w / 2) ** 2);
  return `M${x},${y + h} L${x},${y + s} A${R},${R} 0 0 1 ${x + w / 2},${y} A${R},${R} 0 0 1 ${x + w},${y + s} L${x + w},${y + h} Z`;
};

export const InteriorArt: React.FC<{variant?: number; light?: number; id: string}> = ({variant = 0, light = 1, id}) => {
  const p = PALETTES[variant % PALETTES.length];
  const v = variant % 3;
  return (
    <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" style={{display: 'block'}}>
      <defs>
        <linearGradient id={`${id}w`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.wall[0]} />
          <stop offset="1" stopColor={p.wall[1]} />
        </linearGradient>
        <linearGradient id={`${id}s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.sky[0]} />
          <stop offset="1" stopColor={p.sky[1]} />
        </linearGradient>
        <radialGradient id={`${id}l`} cx="0.5" cy="0.3" r="0.7">
          <stop offset="0" stopColor="#FFF4DF" stopOpacity={0.55 * light} />
          <stop offset="1" stopColor="#FFF4DF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="500" fill={`url(#${id}w)`} />
      {/* arch window / doorway */}
      <path d={pointed(v === 1 ? 60 : 130, 70, 150, 260)} fill={`url(#${id}s)`} />
      <path d={pointed(v === 1 ? 60 : 130, 70, 150, 260)} fill="none" stroke={p.accent} strokeOpacity="0.35" strokeWidth="6" />
      {v === 1 && <path d={pointed(230, 110, 110, 220)} fill={p.accent} opacity="0.18" />}
      {/* floor */}
      <rect y="380" width="400" height="120" fill={p.floor} />
      <rect y="378" width="400" height="6" fill="#000" opacity="0.08" />
      <ellipse cx="200" cy="445" rx="165" ry="30" fill={p.rug} opacity="0.9" />
      {/* sofa */}
      <g transform={`translate(${v === 2 ? 40 : 70} 0)`}>
        <rect x="20" y="300" width="230" height="70" rx="22" fill={p.sofa} />
        <rect x="8" y="318" width="40" height="72" rx="16" fill={p.sofa} />
        <rect x="222" y="318" width="40" height="72" rx="16" fill={p.sofa} />
        <rect x="40" y="278" width="92" height="52" rx="18" fill={p.sofa} style={{filter: 'brightness(1.08)'}} />
        <rect x="138" y="278" width="92" height="52" rx="18" fill={p.sofa} style={{filter: 'brightness(1.08)'}} />
        <rect x="30" y="360" width="210" height="18" rx="8" fill="#000" opacity="0.12" />
        <circle cx="70" cy="300" r="16" fill={p.accent} opacity="0.85" />
      </g>
      {/* floor lamp */}
      {v !== 2 && (
        <g transform="translate(330 0)">
          <rect x="-2" y="210" width="4" height="170" fill="#2A2420" />
          <path d="M-30,210 L30,210 L18,170 L-18,170 Z" fill={p.accent} />
          <ellipse cx="0" cy="380" rx="22" ry="5" fill="#2A2420" />
          <circle cx="0" cy="225" r="60" fill={`url(#${id}l)`} />
        </g>
      )}
      {/* pendant */}
      {v === 2 && (
        <g>
          <rect x="299" y="0" width="2" height="120" fill="#2A2420" />
          <path d="M270,150 Q300,105 330,150 Z" fill={p.accent} />
          <circle cx="300" cy="170" r="80" fill={`url(#${id}l)`} />
        </g>
      )}
      {/* plant */}
      <g transform={`translate(${v === 1 ? 330 : 40} 0)`}>
        <path d="M-18,340 L18,340 L13,382 L-13,382 Z" fill="#C9A27C" />
        {[-40, -15, 10, 35, -60, 60].map((a, i) => (
          <ellipse key={i} cx={Math.sin((a * Math.PI) / 180) * 26} cy={300 - Math.cos((a * Math.PI) / 180) * 26} rx="9" ry="30"
            fill={i % 2 ? '#4E6B4C' : '#3E5A3E'} transform={`rotate(${a} ${Math.sin((a * Math.PI) / 180) * 26} ${300 - Math.cos((a * Math.PI) / 180) * 26})`} />
        ))}
      </g>
      {/* side table + vase */}
      <g transform={`translate(${v === 2 ? 300 : 250} 0)`}>
        <rect x="-4" y="352" width="44" height="6" rx="3" fill="#2A2420" opacity="0.8" />
        <rect x="16" y="358" width="4" height="22" fill="#2A2420" opacity="0.8" />
        <path d="M10,352 Q6,330 14,322 L22,322 Q30,330 26,352 Z" fill={p.accent} opacity="0.9" />
      </g>
      <rect width="400" height="500" fill={`url(#${id}l)`} opacity={0.6} />
    </svg>
  );
};
