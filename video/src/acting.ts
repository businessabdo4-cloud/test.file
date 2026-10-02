import { Easing, interpolate, random, spring } from 'remotion';
import { FPS, LINES, LIPSYNC, Speaker } from './data';
import { MouthParams, VISEMES, mixMouth } from './characters/Mouth';
import type { Pt } from './characters/rig';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

/** Eased value between two times (seconds). */
export const ease = (t: number, t0: number, t1: number, from: number, to: number, easing = Easing.inOut(Easing.cubic)) =>
	interpolate(t, [t0, t1], [from, to], { ...clamp, easing });

/** Spring starting at time t0 (seconds); 0 before t0. */
export const sp = (t: number, t0: number, config: Partial<{ damping: number; stiffness: number; mass: number }> = {}) =>
	t < t0 ? 0 : spring({ frame: (t - t0) * FPS, fps: FPS, config: { damping: 12, stiffness: 160, mass: 0.7, ...config } });

/** Overshooting pop (cartoon). */
export const pop = (t: number, t0: number) => sp(t, t0, { damping: 9, stiffness: 220, mass: 0.6 });

/** Squash & stretch impulse after an event: positive = stretch, then squash, settling to 0. */
export const squashAt = (t: number, t0: number, amount = 0.14, freq = 7) => {
	if (t < t0) return 0;
	const d = t - t0;
	return amount * Math.sin(d * freq * 2 * Math.PI) * Math.exp(-d * 6);
};

export const mixPt = (a: Pt, b: Pt, k: number): Pt => ({ x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k });

/** Keyframed point track: [[time, point], …] eased between keys. */
export const track = (t: number, keys: [number, Pt][], easing = Easing.inOut(Easing.cubic)): Pt => {
	if (t <= keys[0][0]) return keys[0][1];
	for (let i = 0; i < keys.length - 1; i++) {
		const [t0, a] = keys[i];
		const [t1, b] = keys[i + 1];
		if (t <= t1) return mixPt(a, b, easing((t - t0) / Math.max(1e-6, t1 - t0)));
	}
	return keys[keys.length - 1][1];
};

/** Keyframed scalar track. */
export const trackN = (t: number, keys: [number, number][], easing = Easing.inOut(Easing.cubic)) => track(t, keys.map(([k, v]) => [k, { x: v, y: 0 }] as [number, Pt]), easing).x;

/** Natural blinks every 2–5 s (deterministic per character). Returns lid closure 0..1. */
export const blinkAt = (t: number, seed: string) => {
	let bt = 0.5 + random(`${seed}-0`) * 1.6;
	for (let i = 1; bt < t + 0.5 && i < 60; i++) {
		const d = t - bt;
		if (d >= 0 && d < 0.2) return d < 0.07 ? d / 0.07 : Math.max(0, 1 - (d - 0.07) / 0.13);
		bt += 2 + random(`${seed}-${i}`) * 3;
	}
	return 0;
};

export const breatheAt = (t: number, rate = 0.28) => 0.5 + 0.5 * Math.sin(t * rate * 2 * Math.PI);

/** Lip-sync: Rhubarb cues for the lines this character speaks, blended over ~2 frames. undefined = not speaking. */
export const mouthAt = (t: number, who: 'hamza' | 'citybot'): MouthParams | undefined => {
	for (const l of LINES) {
		const speaks = l.speaker === who || l.speaker === ('both' as Speaker);
		if (!speaks || t < l.fileStart || t > l.end + 0.12) continue;
		const cues = LIPSYNC[l.id];
		const i = cues.findIndex((c) => t >= c.start && t < c.end);
		if (i < 0) return undefined;
		const cur = VISEMES[cues[i].value];
		const prev = i > 0 ? VISEMES[cues[i - 1].value] : VISEMES.X;
		const k = Math.min(1, (t - cues[i].start) / 0.065);
		return mixMouth(prev, cur, Easing.out(Easing.quad)(k));
	}
	return undefined;
};

/** Is someone speaking at t (used for listener reactions and music ducking). */
export const speakingAt = (t: number, who?: 'hamza' | 'citybot') =>
	LINES.some((l) => t >= l.start && t <= l.end && (!who || l.speaker === who || l.speaker === 'both'));

/** Small camera shake after an impact. */
export const shakeAt = (t: number, t0: number, amp = 14) => {
	if (t < t0 || t > t0 + 0.35) return { x: 0, y: 0 };
	const d = t - t0;
	const k = Math.exp(-d * 12) * amp;
	return { x: Math.sin(d * 90) * k, y: Math.cos(d * 70) * k * 0.7 };
};
