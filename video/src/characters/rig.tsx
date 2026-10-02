import React from 'react';

export type Pt = { x: number; y: number };
export type HandKind = 'fist' | 'open' | 'thumb' | 'point';

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const lerpPt = (a: Pt, b: Pt, t: number): Pt => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });
export const svgId = (id: string) => id.replace(/[^a-zA-Z0-9_-]/g, '');

/** Two-bone IK: shoulder s → hand target t. The elbow bends outward (away from the body centre) on `side`. */
export function solveArm(s: Pt, t: Pt, l1: number, l2: number, side: 1 | -1): { e: Pt; h: Pt } {
	const d = Math.hypot(t.x - s.x, t.y - s.y);
	const dd = Math.min(l1 + l2 - 0.5, Math.max(Math.abs(l1 - l2) + 0.5, d));
	const th = Math.atan2(t.y - s.y, t.x - s.x);
	const a = Math.acos((l1 * l1 + dd * dd - l2 * l2) / (2 * l1 * dd));
	const c1 = { x: s.x + l1 * Math.cos(th + a), y: s.y + l1 * Math.sin(th + a) };
	const c2 = { x: s.x + l1 * Math.cos(th - a), y: s.y + l1 * Math.sin(th - a) };
	const e = side * c1.x > side * c2.x ? c1 : c2;
	return { e, h: { x: s.x + dd * Math.cos(th), y: s.y + dd * Math.sin(th) } };
}

/** Sleeve/arm drawn as a thick round-capped polyline with an ink outline pass, plus an optional cuff band. */
export const Limb: React.FC<{ s: Pt; e: Pt; h: Pt; w: number; fill: string; ink: string; ol: number; cuff?: string }> = ({ s, e, h, w, fill, ink, ol, cuff }) => {
	const d = `M ${s.x} ${s.y} L ${e.x} ${e.y} L ${h.x} ${h.y}`;
	const a = lerpPt(e, h, 0.6);
	const b = lerpPt(e, h, 0.74);
	return (
		<g>
			<path d={d} stroke={ink} strokeWidth={w + ol * 2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
			<path d={d} stroke={fill} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
			{cuff ? <path d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} stroke={cuff} strokeWidth={w} strokeLinecap="butt" /> : null}
		</g>
	);
};

/** Two-pass (ink outline, then fill) capsule stroke. */
const Capsule: React.FC<{ d: string; w: number; fill: string; ink: string; ol: number }> = ({ d, w, fill, ink, ol }) => (
	<>
		<path d={d} stroke={ink} strokeWidth={w + ol * 2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
		<path d={d} stroke={fill} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none" />
	</>
);

/**
 * Cartoon hand at p. `ang` = forearm direction (radians).
 * open  — palm with four spread fingers + thumb (waves, presenting, high-five)
 * fist  — closed hand with knuckle lines
 * thumb — thumbs-up, always drawn upright in world space (knuckles facing the viewer, thumb clearly on top)
 * point — index finger extended from the top edge of the fist, thumb tucked alongside
 */
export const Hand: React.FC<{ p: Pt; ang: number; kind: HandKind; r: number; fill: string; ink: string; ol: number; side: 1 | -1 }> = ({ p, ang, kind, r, fill, ink, ol, side }) => {
	const deg = (ang * 180) / Math.PI;
	if (kind === 'thumb') {
		const w = r * 2.2;
		const h = r * 1.7;
		return (
			<g transform={`translate(${p.x} ${p.y}) scale(${side} 1)`}>
				<Capsule d={`M ${-r * 0.35} ${-h * 0.35} L ${-r * 0.2} ${-h * 0.35 - r * 1.35}`} w={r * 0.78} fill={fill} ink={ink} ol={ol} />
				<rect x={-w / 2 - ol} y={-h / 2 - ol} width={w + ol * 2} height={h + ol * 2} rx={r * 0.6 + ol} fill={ink} />
				<rect x={-w / 2} y={-h / 2} width={w} height={h} rx={r * 0.6} fill={fill} />
				<path d={`M ${-r * 0.35} ${-h * 0.35} L ${-r * 0.22} ${-h * 0.35 - r * 1.3}`} stroke={fill} strokeWidth={r * 0.78} strokeLinecap="round" />
				{[-0.12, 0.2].map((k) => (
					<path key={k} d={`M ${-w * 0.08} ${h * k} L ${w * 0.42} ${h * k}`} stroke={ink} strokeWidth={ol * 0.75} strokeLinecap="round" opacity={0.7} />
				))}
				<path d={`M ${-w * 0.42} ${-h * 0.05} Q ${-w * 0.15} ${h * 0.1} ${-w * 0.1} ${-h * 0.3}`} stroke={ink} strokeWidth={ol * 0.75} fill="none" strokeLinecap="round" opacity={0.7} />
			</g>
		);
	}
	const fw = r * 0.5;
	const ty = -side * r * 0.62;
	const fingers =
		kind === 'open'
			? [-0.8, -0.27, 0.27, 0.8].map((k) => `M ${r * 0.35} ${k * r * 0.6} L ${r * 1.75 - Math.abs(k) * r * 0.35} ${k * r * 1.15}`)
			: kind === 'point'
				? [`M ${r * 0.3} ${-ty * 0.55} L ${r * 2.1} ${-ty * 0.55}`]
				: [];
	const thumb = kind === 'open' ? `M ${r * 0.1} ${ty * 0.7} L ${r * 0.8} ${ty * 1.85}` : `M ${r * 0.2} ${ty * 0.75} L ${r * 0.85} ${ty * 0.95}`;
	return (
		<g transform={`translate(${p.x} ${p.y}) rotate(${deg})`}>
			{fingers.map((d, i) => (
				<path key={`o${i}`} d={d} stroke={ink} strokeWidth={fw + ol * 2} strokeLinecap="round" fill="none" />
			))}
			<path d={thumb} stroke={ink} strokeWidth={fw + ol * 2} strokeLinecap="round" fill="none" />
			<ellipse rx={r * 1.05 + ol} ry={r * 0.95 + ol} fill={ink} />
			{fingers.map((d, i) => (
				<path key={`f${i}`} d={d} stroke={fill} strokeWidth={fw} strokeLinecap="round" fill="none" />
			))}
			<ellipse rx={r * 1.05} ry={r * 0.95} fill={fill} />
			<path d={thumb} stroke={fill} strokeWidth={fw} strokeLinecap="round" fill="none" />
			{kind !== 'open'
				? [-0.3, 0.3].map((k) => (
						<path key={k} d={`M ${r * 0.25} ${k * r * 1.1 - side * r * 0.1} L ${r * 0.85} ${k * r * 1.0 - side * r * 0.1}`} stroke={ink} strokeWidth={ol * 0.7} strokeLinecap="round" opacity={0.6} />
					))
				: null}
		</g>
	);
};

/** Wraps a character: positions the SVG so local (0, groundY) lands on pixel (x, y); applies squash/stretch about the ground. */
export const CharacterFrame: React.FC<{
	x: number;
	y: number;
	scale: number;
	viewBox: [number, number, number, number];
	groundY: number;
	flip?: boolean;
	squash?: number;
	rotate?: number;
	opacity?: number;
	children: React.ReactNode;
}> = ({ x, y, scale, viewBox, groundY, flip, squash = 0, rotate = 0, opacity = 1, children }) => {
	const [vx, vy, vw, vh] = viewBox;
	const sx = (flip ? -1 : 1) * (1 - squash * 0.6);
	const sy = 1 + squash;
	return (
		<svg
			viewBox={viewBox.join(' ')}
			width={vw * scale}
			height={vh * scale}
			style={{ position: 'absolute', left: x + vx * scale, top: y - (groundY - vy) * scale, overflow: 'visible', opacity }}
		>
			<g transform={`translate(0 ${groundY}) rotate(${rotate}) scale(${sx} ${sy}) translate(0 ${-groundY})`}>{children}</g>
		</svg>
	);
};
