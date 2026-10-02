import React, { useId } from 'react';
import { lerp, svgId } from './rig';

/** Rhubarb mouth shapes: A=MBP, B=K/S/T/EE, C=EH/AE, D=AA, E=AO/ER, F=UW/OW/W, G=F/V, H=L, X=rest */
export type Viseme = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'X';
export const VISEME_KEYS: Viseme[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'X'];

export type MouthParams = { w: number; h: number; round: number; teethTop: number; teethBot: number; tongue: number; pressed: number };

export const VISEMES: Record<Viseme, MouthParams> = {
	X: { w: 36, h: 0, round: 0, teethTop: 0, teethBot: 0, tongue: 0, pressed: 0 },
	A: { w: 31, h: 0, round: 0, teethTop: 0, teethBot: 0, tongue: 0, pressed: 1 },
	B: { w: 40, h: 9, round: 0, teethTop: 1, teethBot: 1, tongue: 0, pressed: 0 },
	C: { w: 42, h: 17, round: 0.1, teethTop: 1, teethBot: 0.3, tongue: 0.35, pressed: 0 },
	D: { w: 46, h: 30, round: 0.25, teethTop: 1, teethBot: 0.15, tongue: 0.65, pressed: 0 },
	E: { w: 32, h: 21, round: 0.65, teethTop: 0.5, teethBot: 0, tongue: 0.35, pressed: 0 },
	F: { w: 20, h: 15, round: 1, teethTop: 0, teethBot: 0, tongue: 0, pressed: 0 },
	G: { w: 38, h: 8, round: 0, teethTop: 1, teethBot: 0, tongue: 0, pressed: 0 },
	H: { w: 40, h: 19, round: 0.2, teethTop: 1, teethBot: 0, tongue: 1, pressed: 0 },
};

export const mixMouth = (a: MouthParams, b: MouthParams, t: number): MouthParams => ({
	w: lerp(a.w, b.w, t),
	h: lerp(a.h, b.h, t),
	round: lerp(a.round, b.round, t),
	teethTop: lerp(a.teethTop, b.teethTop, t),
	teethBot: lerp(a.teethBot, b.teethBot, t),
	tongue: lerp(a.tongue, b.tongue, t),
	pressed: lerp(a.pressed, b.pressed, t),
});

export type MouthStyle = { ink: string; inkW: number; inside: string; teeth: string; tongue: string };

/** Parametric cartoon mouth centred on (x, y). `smile` lifts (+) or drops (−) the corners. */
export const Mouth: React.FC<{ p: MouthParams; smile: number; x: number; y: number; scale?: number; style: MouthStyle }> = ({ p, smile, x, y, scale = 1, style }) => {
	const id = svgId(useId());
	const hw = p.w / 2;
	const c = smile;
	if (p.h < 2) {
		const d = `M ${-hw} ${-c} Q 0 ${c * 0.9 + 2 - p.pressed} ${hw} ${-c}`;
		return (
			<g transform={`translate(${x} ${y}) scale(${scale})`}>
				<path d={d} stroke={style.ink} strokeWidth={style.inkW * (1 + 0.45 * p.pressed)} fill="none" strokeLinecap="round" />
			</g>
		);
	}
	const up = p.h * (0.12 + 0.22 * p.round);
	const k = 0.5 + 0.45 * p.round;
	const yu = (-up + 0.25 * c) / 0.75;
	const yl = (p.h + 0.25 * c) / 0.75;
	const d = `M ${-hw} ${-c} C ${-hw * k} ${yu} ${hw * k} ${yu} ${hw} ${-c} C ${hw * k} ${yl} ${-hw * k} ${yl} ${-hw} ${-c} Z`;
	const tt = Math.min(8, p.h * 0.42) * p.teethTop;
	const tb = Math.min(6, p.h * 0.32) * p.teethBot;
	return (
		<g transform={`translate(${x} ${y}) scale(${scale})`}>
			<clipPath id={`m${id}`}>
				<path d={d} />
			</clipPath>
			<path d={d} fill={style.inside} />
			<g clipPath={`url(#m${id})`}>
				{p.tongue > 0.02 ? <ellipse cx={0} cy={p.h * 0.95} rx={hw * 0.62} ry={p.h * 0.42 * p.tongue + 1} fill={style.tongue} /> : null}
				{tt > 0.3 ? <rect x={-hw} y={-up - c - 6} width={p.w} height={tt + 6 + Math.max(0, c)} fill={style.teeth} /> : null}
				{tb > 0.3 ? <rect x={-hw} y={p.h - tb} width={p.w} height={tb + 8} fill={style.teeth} /> : null}
			</g>
			<path d={d} stroke={style.ink} strokeWidth={style.inkW} fill="none" strokeLinejoin="round" />
		</g>
	);
};
