import React from 'react';

type P = {size?: number; color?: string; stroke?: number; style?: React.CSSProperties};
const Svg: React.FC<P & {children: React.ReactNode; fill?: string}> = ({size = 40, color = 'currentColor', stroke = 2, style, children, fill = 'none'}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={{display: 'block', ...style}}>
    {children}
  </svg>
);

export const Eye: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);
export const EyeSlash: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M10.6 5.1A10.5 10.5 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-2.9 3.9M6.6 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7a9.6 9.6 0 0 0 5.4-1.6" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    <path d="M3 3l18 18" />
  </Svg>
);
export const Search: React.FC<P> = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.6-3.6" />
  </Svg>
);
export const Phone: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
  </Svg>
);
export const Target: React.FC<P> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5" />
    <circle cx="12" cy="12" r="1.2" />
    <path d="M17 7l3-3M17 4v3h3" />
  </Svg>
);
export const Camera: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </Svg>
);
export const Calendar: React.FC<P> = (p) => (
  <Svg {...p}>
    <rect x="3" y="4.5" width="18" height="17" rx="2.5" />
    <path d="M16 2.5v4M8 2.5v4M3 10h18" />
    <path d="M8.5 15.5l2.2 2.2 4.8-4.8" />
  </Svg>
);
export const Chat: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.9-.9L3 20.5l1.5-4.6A8.4 8.4 0 0 1 3 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5z" />
    <path d="M8 11.5h.01M12 11.5h.01M16 11.5h.01" strokeWidth={3} />
  </Svg>
);
export const Heart: React.FC<P & {filled?: boolean}> = ({filled, ...p}) => (
  <Svg {...p} fill={filled ? p.color : 'none'}>
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.2l7.8-7.8 1-1.1a5.5 5.5 0 0 0 0-7.7z" />
  </Svg>
);
export const Comment: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.9-.9L3 20.5l1.5-4.6A8.4 8.4 0 0 1 3 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5z" />
  </Svg>
);
export const Send: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
  </Svg>
);
export const Bookmark: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </Svg>
);
export const UserPlus: React.FC<P> = (p) => (
  <Svg {...p}>
    <circle cx="9" cy="7.5" r="4" />
    <path d="M1.5 21c.9-3.9 4-6 7.5-6s6.6 2.1 7.5 6M19.5 8v6M16.5 11h6" />
  </Svg>
);
export const Mail: React.FC<P> = (p) => (
  <Svg {...p}>
    <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
    <path d="M3 6l9 7 9-7" />
  </Svg>
);
export const Check: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M4.5 12.5l5 5L19.5 7" />
  </Svg>
);
export const ArrowUp: React.FC<P> = (p) => (
  <Svg {...p}>
    <path d="M12 20V5M5.5 11.5L12 5l6.5 6.5" />
  </Svg>
);
