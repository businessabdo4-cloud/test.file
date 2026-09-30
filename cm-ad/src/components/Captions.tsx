import React from 'react';
import {useCurrentFrame} from 'remotion';
import {brand, ease, font, FPS, pop, prog, SAFE, TL} from '../theme';

export const CAPTION_CENTER_Y = 1440; // box centre; a two-line box stays above SAFE.bottom (1536)
const MAX_W = 900;

/** Word-synced captions: 2–4 words per group, espresso backing box, active word in accent with a pop. */
export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const gi = TL.groups.findIndex((g) => t >= g.start && t < g.end);
  if (gi < 0) return null;
  const g = TL.groups[gi];
  const next = TL.groups[gi + 1];
  const joined = next && next.start - g.end < 0.05;

  const enter = pop(frame, g.start, {damping: 14, stiffness: 190});
  const fadeIn = prog(t, g.start, 0.1);
  const fadeOut = joined ? 0 : prog(t, g.end - 0.12, 0.12, ease.in);
  const opacity = fadeIn * (1 - fadeOut);
  const scale = 0.9 + 0.1 * enter;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: CAPTION_CENTER_Y,
        display: 'flex',
        justifyContent: 'center',
        transform: `translateY(-50%) translateY(${(1 - enter) * 14}px) scale(${scale})`,
        opacity,
      }}
    >
      <div
        style={{
          maxWidth: MAX_W,
          padding: '20px 36px 24px',
          borderRadius: 30,
          background: 'rgba(0,12,34,0.88)',
          border: `2px solid ${brand.line}`,
          boxShadow: '0 14px 34px rgba(0,6,20,0.45)',
          fontFamily: font.sans,
          fontWeight: 800,
          fontSize: 62,
          lineHeight: 1.18,
          letterSpacing: -0.5,
          color: brand.white,
          textAlign: 'center',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          columnGap: '0.3em',
          textShadow: '0 2px 8px rgba(0,0,0,0.35)',
        }}
      >
        {g.words.map((wi) => {
          const w = TL.words[wi];
          const nextStart = TL.words[wi + 1]?.start ?? Infinity;
          const active = t >= w.start && t < Math.min(w.end + 0.03, nextStart);
          const p = active ? pop(frame, w.start, {damping: 10, stiffness: 260}) : 0;
          return (
            <span
                key={wi}
                style={{
                  display: 'inline-block',
                  color: active ? brand.yellow : brand.white,
                  transform: `scale(${1 + 0.06 * p})`,
                  transformOrigin: '50% 60%',
                  whiteSpace: 'nowrap',
                }}
              >
                {w.text}
              </span>
          );
        })}
      </div>
    </div>
  );
};

// keep the bottom safe margin honest at compile time
export const CAPTION_LIMIT = SAFE.bottom;
