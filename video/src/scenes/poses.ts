import { Easing } from 'remotion';
import { blinkAt, breatheAt, ease, mouthAt, pop, track, trackN } from '../acting';
import { SCENES, line, w } from '../data';
import type { HamzaProps } from '../characters/Hamza';

/** Hamza in scene 1 (shared with scene 2's first frames for continuity). */
export const hamzaStreet = (t: number): Omit<HamzaProps, 'x' | 'y' | 'scale'> => {
	const L1 = line('L1');
	const burst = SCENES.s1.end;
	const glow = ease(t, burst - 0.42, burst, 0, 1, Easing.in(Easing.quad));
	const shake = t > w('L1', 5) && t < L1.end ? Math.sin((t - w('L1', 5)) * 2 * Math.PI * 3.2) * ease(t, w('L1', 5), w('L1', 5) + 0.15, 0, 1) * ease(t, L1.end - 0.25, L1.end, 1, 0) : 0;
	return {
		expr: 'worried',
		exprTo: 'shocked',
		exprT: ease(t, burst - 0.4, burst - 0.15, 0, 1),
		mouth: mouthAt(t, 'hamza'),
		blink: blinkAt(t, 'hamza'),
		breathe: breatheAt(t) + (t < 0.5 ? ease(t, 0, 0.5, 2, 0) : 0),
		look: track(t, [
			[0, { x: 0.55, y: 0.8 }],
			[w('L1', 2) - 0.1, { x: 0.55, y: 0.8 }],
			[w('L1', 2) + 0.15, { x: 0, y: 0 }],
			[burst - 0.45, { x: 0, y: 0 }],
			[burst - 0.25, { x: 0.8, y: 0.2 }],
		]),
		headTilt: trackN(t, [
			[0, -7],
			[w('L1', 2), -7],
			[w('L1', 2) + 0.3, -1],
		]) + shake * 7,
		handL: track(t, [
			[0, { x: -70, y: -150 }],
			[w('L1', 3), { x: -70, y: -150 }],
			[w('L1', 4) - 0.05, { x: -156, y: 64 }],
			[w('L1', 6), { x: -146, y: 30 }],
			[L1.end, { x: -128, y: 96 }],
		]),
		handKindL: 'open',
		handR: track(t, [
			[0, { x: 56, y: 96 }],
			[w('L1', 2) - 0.2, { x: 56, y: 96 }],
			[w('L1', 2) + 0.2, { x: 104, y: 6 }],
			[burst - 0.45, { x: 104, y: 6 }],
			[burst - 0.1, { x: 156, y: -20 }],
		]),
		held: {
			kind: 'cracked',
			glow,
			offset: { x: -18, y: -46 },
			angle: trackN(t, [
				[w('L1', 2) - 0.2, -14],
				[w('L1', 2) + 0.2, -4],
			]),
			size: trackN(t, [
				[w('L1', 2) - 0.2, 1],
				[w('L1', 2) + 0.2, 1.18],
			]),
			stamp: pop(t, w('L1', 6)) * ease(t, burst - 0.4, burst - 0.25, 1, 0),
		},
	};
};
