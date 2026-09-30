import React from 'react';
import {ease, prog} from '../theme';

/** Masked word reveal: slides up out of a clip line, synced to the word's start time. */
export const Word: React.FC<{t: number; at: number; children: React.ReactNode; style?: React.CSSProperties; lead?: number}> = ({
  t,
  at,
  children,
  style,
  lead = 0.06,
}) => {
  const p = prog(t, at - lead, 0.42, ease.out);
  return (
    <span style={{display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', paddingBottom: '0.08em', ...style}}>
      <span style={{display: 'inline-block', transform: `translateY(${(1 - p) * 105}%)`, opacity: Math.min(1, p * 1.6)}}>{children}</span>
    </span>
  );
};

/** Exponential decay that starts at `at` (0 before). */
export const decay = (t: number, at: number, tau: number) => (t < at ? 0 : Math.exp(-(t - at) / tau));

/** Camera shake from a list of [time, amplitude px, tau s] hits. */
export const shake = (t: number, hits: [number, number, number][]) => {
  const a = hits.reduce((s, [at, amp, tau]) => s + amp * decay(t, at, tau), 0);
  return {x: a * Math.sin(t * 91.7) * Math.cos(t * 13.1), y: a * Math.sin(t * 77.3 + 1.3)};
};

/** Slam: accelerates in from `from`× scale and lands on `at` with a damped wobble. */
export const slam = (t: number, at: number, from = 2.6, dur = 0.34) => {
  const k = prog(t, at - dur, dur, ease.in);
  if (t < at) return {scale: from - (from - 1) * k, opacity: Math.min(1, 0.3 + k), k};
  return {scale: 1 - 0.06 * Math.exp(-(t - at) * 9) * Math.cos((t - at) * 38), opacity: 1, k: 1};
};
