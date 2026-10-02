import React, { useId } from 'react';
import { CharacterFrame, Hand, HandKind, Limb, Pt, lerp, solveArm, svgId } from './rig';
import { Mouth, MouthParams, MouthStyle, VISEMES, Viseme } from './Mouth';

const INK = '#2B1D16';
const SKIN = '#C98A5E';
const SKIN_SH = '#A86C44';
const HAIR = '#1E1510';
const HAIR_HI = '#3E2C21';
const HOOD = '#E8743B';
const HOOD_SH = '#C55A27';
const HOOD_HI = '#F59765';
const DENIM = '#34466E';
const DENIM_SH = '#26355A';
const SHOE = '#FBFAF6';
const SHOE_SH = '#D8D4CB';
const SHOE_ACC = '#D9433B';
const OL = 4;

const MOUTH_STYLE: MouthStyle = { ink: INK, inkW: 4, inside: '#5B1F25', teeth: '#FFFFFF', tongue: '#D9606A' };

export type HamzaExpr = 'neutral' | 'worried' | 'shocked' | 'amazed' | 'happy';
type ExprDef = { lift: number; inner: number; arch: number; eye: number; lid: number; squint: number; smile: number; pupil: number; blush: number; sweat: number };
const EXPR: Record<HamzaExpr, ExprDef> = {
	neutral: { lift: 0, inner: 0, arch: 4, eye: 1, lid: 0.14, squint: 0, smile: 2, pupil: 1, blush: 0, sweat: 0 },
	worried: { lift: 4, inner: 12, arch: 1, eye: 1, lid: 0.22, squint: 0, smile: -6, pupil: 0.95, blush: 0, sweat: 1 },
	shocked: { lift: 14, inner: 5, arch: 7, eye: 1.2, lid: 0, squint: 0, smile: -3, pupil: 0.62, blush: 0, sweat: 0.6 },
	amazed: { lift: 18, inner: -1, arch: 9, eye: 1.34, lid: 0, squint: 0, smile: 4, pupil: 1.28, blush: 0.6, sweat: 0 },
	happy: { lift: 6, inner: -3, arch: 6, eye: 1, lid: 0.04, squint: 0.42, smile: 8, pupil: 1, blush: 0.8, sweat: 0 },
};
export const HAMZA_REST: Record<HamzaExpr, Viseme> = { neutral: 'X', worried: 'X', shocked: 'E', amazed: 'D', happy: 'X' };

const mixExpr = (a: ExprDef, b: ExprDef, t: number): ExprDef =>
	Object.fromEntries(Object.keys(a).map((k) => [k, lerp(a[k as keyof ExprDef], b[k as keyof ExprDef], t)])) as ExprDef;

export type Held = { kind: 'cracked' | 'image'; glow?: number; src?: string; tint?: string; label?: string; angle?: number; size?: number; offset?: Pt; stamp?: number };

export type HamzaPose = {
	expr?: HamzaExpr;
	exprTo?: HamzaExpr;
	exprT?: number;
	mouth?: MouthParams;
	blink?: number;
	look?: Pt;
	headTilt?: number;
	headNod?: number;
	jawDrop?: number;
	handL?: Pt;
	handR?: Pt;
	handKindL?: HandKind;
	handKindR?: HandKind;
	held?: Held | null;
	breathe?: number;
	lean?: number;
};

export type HamzaProps = HamzaPose & { x: number; y: number; scale: number; crop?: 'full' | 'head'; flip?: boolean; squash?: number; opacity?: number };

const SHOULDER_L: Pt = { x: -80, y: 32 };
const SHOULDER_R: Pt = { x: 80, y: 32 };
const L1 = 92;
const L2 = 86;
export const HAMZA_HANDS_IDLE = { L: { x: -104, y: 196 }, R: { x: 104, y: 196 } };

export const HAMZA_VIEWBOX: Record<'full' | 'head', [number, number, number, number]> = {
	full: [-230, -280, 460, 800],
	head: [-115, -250, 230, 290],
};

const Eye: React.FC<{ cx: number; cy: number; e: ExprDef; blink: number; look: Pt; uid: string }> = ({ cx, cy, e, blink, look, uid }) => {
	const s = e.eye;
	const rx = 14 * s;
	const ry = 17 * s;
	const lid = Math.max(e.lid, blink);
	if (lid > 0.88) {
		return <path d={`M ${cx - rx} ${cy + 2} Q ${cx} ${cy + 9} ${cx + rx} ${cy + 2}`} stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
	}
	const top = cy - ry;
	const lidY = top + 2 * ry * lid;
	const botY = cy + ry - 2 * ry * e.squint * (1 - blink);
	const px = cx + look.x * 5 * s;
	const py = cy + look.y * 4 * s + 1;
	return (
		<g>
			<clipPath id={uid}>
				<ellipse cx={cx} cy={cy} rx={rx} ry={ry} />
			</clipPath>
			<ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#FFFFFF" />
			<g clipPath={`url(#${uid})`}>
				<circle cx={px} cy={py} r={9.5 * s * Math.sqrt(e.pupil)} fill="#5A3520" />
				<circle cx={px} cy={py} r={5.2 * s * e.pupil} fill="#120B07" />
				<circle cx={px + 3.2 * s} cy={py - 4 * s} r={2.8 * s} fill="#FFFFFF" />
				<circle cx={px - 3 * s} cy={py + 3.5 * s} r={1.3 * s} fill="#FFFFFF" />
				<rect x={cx - rx - 2} y={top - 2} width={2 * rx + 4} height={lidY - top + 2} fill={SKIN} />
				<rect x={cx - rx - 2} y={botY} width={2 * rx + 4} height={cy + ry - botY + 2} fill={SKIN} />
				{lid > 0.02 ? <line x1={cx - rx} x2={cx + rx} y1={lidY} y2={lidY} stroke={INK} strokeWidth={4} /> : null}
				{e.squint > 0.02 ? <path d={`M ${cx - rx} ${botY + 3} Q ${cx} ${botY - 4} ${cx + rx} ${botY + 3}`} stroke={INK} strokeWidth={3} fill="none" /> : null}
			</g>
			<ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={INK} strokeWidth={3} />
			{lid <= 0.02 ? <path d={`M ${cx - rx} ${cy - 2} A ${rx} ${ry} 0 0 1 ${cx + rx} ${cy - 2}`} stroke={INK} strokeWidth={4.5} fill="none" /> : null}
		</g>
	);
};

const HeldPhone: React.FC<{ held: Held; at: Pt; uid: string }> = ({ held, at, uid }) => {
	const size = held.size ?? 1;
	const off = held.offset ?? { x: -6, y: -40 };
	const glow = held.glow ?? 0;
	const tf = `translate(${at.x + off.x} ${at.y + off.y}) rotate(${held.angle ?? -8}) scale(${size})`;
	if (held.kind === 'image') {
		return (
			<g transform={tf}>
				{held.src ? (
					<image href={held.src} x={-40} y={-80} width={80} height={160} preserveAspectRatio="xMidYMid meet" />
				) : (
					// placeholder until the official product image is available — deliberately not a phone render
					<g>
						<rect x={-38} y={-78} width={76} height={156} rx={14} fill={held.tint ?? '#888'} stroke="#FFFFFF" strokeWidth={3} strokeDasharray="8 6" />
						<text x={0} y={-6} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={11} fill="#FFFFFF">{held.label ?? 'PRODUCT'}</text>
						<text x={0} y={12} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={8} fill="#FFFFFF">IMAGE PENDING</text>
					</g>
				)}
			</g>
		);
	}
	return (
		<g transform={tf}>
			{glow > 0 ? (
				<>
					<radialGradient id={`g${uid}`}>
						<stop offset="0" stopColor="#BFF3FF" stopOpacity={0.9} />
						<stop offset="1" stopColor="#00C5F7" stopOpacity={0} />
					</radialGradient>
					<circle r={150 * glow + 40} fill={`url(#g${uid})`} opacity={glow} />
				</>
			) : null}
			<rect x={-29} y={-52} width={58} height={104} rx={11} fill="#3B4049" stroke={INK} strokeWidth={3.5} />
			<rect x={-23} y={-44} width={46} height={86} rx={6} fill="#7F93A3" />
			<rect x={-23} y={-44} width={46} height={86} rx={6} fill="#E8FBFF" opacity={glow} />
			<g stroke="#FFFFFF" strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.95 - glow * 0.6}>
				<path d="M 12 -42 L 2 -22 L 10 -6 L -6 14 L 0 26 L -10 40" />
				<path d="M 2 -22 L -20 -30" />
				<path d="M -6 14 L -21 8" />
				<path d="M 10 -6 L 22 2" />
			</g>
			<circle cx={0} cy={47} r={2.5} fill="#22262C" />
			{held.stamp ? (
				<g transform={`rotate(-12) scale(${held.stamp})`} opacity={Math.min(1, held.stamp * 1.5)}>
					<circle r={30} fill="#E8333A" stroke="#FFFFFF" strokeWidth={4} />
					<path d="M -12 -12 L 12 12 M 12 -12 L -12 12" stroke="#FFFFFF" strokeWidth={7} strokeLinecap="round" />
				</g>
			) : null}
		</g>
	);
};

export const Hamza: React.FC<HamzaProps> = (props) => {
	const uid = svgId(useId());
	const {
		expr = 'neutral',
		exprTo,
		exprT = 0,
		blink = 0,
		look = { x: 0, y: 0 },
		headTilt = 0,
		headNod = 0,
		jawDrop = 0,
		handKindL = 'fist',
		handKindR = 'fist',
		held = null,
		breathe = 0,
		lean = 0,
	} = props;
	const e = exprTo ? mixExpr(EXPR[expr], EXPR[exprTo], exprT) : EXPR[expr];
	const mouth = props.mouth ?? VISEMES[HAMZA_REST[exprTo && exprT > 0.5 ? exprTo : expr]];
	const jd = jawDrop;
	const chinY = -2 + jd * 46;
	const mouthY = -50 + jd * 16;
	const mouthP: MouthParams = { ...mouth, h: mouth.h + jd * 62, w: mouth.w + jd * 8, round: Math.min(1, mouth.round + jd * 0.3), teethTop: Math.max(mouth.teethTop, jd), tongue: Math.max(mouth.tongue, jd * 0.8) };
	const handL = props.handL ?? HAMZA_HANDS_IDLE.L;
	const handR = props.handR ?? HAMZA_HANDS_IDLE.R;
	const armL = solveArm(SHOULDER_L, handL, L1, L2, -1);
	const armR = solveArm(SHOULDER_R, handR, L1, L2, 1);
	const angL = Math.atan2(armL.h.y - armL.e.y, armL.h.x - armL.e.x);
	const angR = Math.atan2(armR.h.y - armR.e.y, armR.h.x - armR.e.x);
	const crop = props.crop ?? 'full';

	const face = `M -70 -128 C -72 -80 -60 ${chinY - 36} -30 ${chinY - 8} Q 0 ${chinY + 6} 30 ${chinY - 8} C 60 ${chinY - 36} 72 -80 70 -128 C 70 -196 -70 -196 -70 -128 Z`;
	const beard = `M -71 -112 C -71 -70 -58 ${chinY - 30} -30 ${chinY - 8} Q 0 ${chinY + 6} 30 ${chinY - 8} C 58 ${chinY - 30} 71 -70 71 -112 C 66 -86 54 -64 34 ${mouthY + 2} C 18 ${mouthY - 12} -18 ${mouthY - 12} -34 ${mouthY + 2} C -54 -64 -66 -86 -71 -112 Z`;
	const brow = (side: 1 | -1) => {
		const xi = side * 13;
		const xo = side * 47;
		const yb = -142 - e.lift;
		const yi = yb - e.inner;
		const yo = yb + e.inner * 0.35;
		return `M ${xi} ${yi} Q ${(xi + xo) / 2} ${Math.min(yi, yo) - e.arch} ${xo} ${yo}`;
	};

	const head = (
		<g transform={`translate(0 ${-6 + headNod}) rotate(${headTilt})`}>
			{/* ears */}
			{[-1, 1].map((s) => (
				<g key={s}>
					<ellipse cx={s * 70} cy={-104} rx={13} ry={19} fill={SKIN} stroke={INK} strokeWidth={OL} />
					<path d={`M ${s * 66} ${-114} Q ${s * 76} ${-104} ${s * 67} ${-94}`} stroke={SKIN_SH} strokeWidth={4} fill="none" strokeLinecap="round" />
				</g>
			))}
			<path d={face} fill={SKIN} stroke={INK} strokeWidth={OL} strokeLinejoin="round" />
			{/* soft shadow down the right side of the face */}
			<clipPath id={`f${uid}`}>
				<path d={face} />
			</clipPath>
			<g clipPath={`url(#f${uid})`}>
				<ellipse cx={78} cy={-90} rx={30} ry={110} fill={SKIN_SH} opacity={0.45} />
			</g>
			<path d={beard} fill={INK} opacity={0.3} />
			<path d={`M -22 ${mouthY - 13} Q 0 ${mouthY - 22} 22 ${mouthY - 13} Q 10 ${mouthY - 8} 0 ${mouthY - 11} Q -10 ${mouthY - 8} -22 ${mouthY - 13} Z`} fill={INK} opacity={0.45} />
			{/* blush */}
			<ellipse cx={-44} cy={-74} rx={13} ry={7} fill="#E46B5D" opacity={0.35 * e.blush} />
			<ellipse cx={44} cy={-74} rx={13} ry={7} fill="#E46B5D" opacity={0.35 * e.blush} />
			{/* nose */}
			<path d="M -2 -104 Q -14 -76 -4 -70 Q 4 -66 12 -71" stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
			<Mouth p={mouthP} smile={e.smile} x={0} y={mouthY} style={MOUTH_STYLE} />
			<Eye cx={-29} cy={-110} e={e} blink={blink} look={look} uid={`el${uid}`} />
			<Eye cx={29} cy={-110} e={e} blink={blink} look={look} uid={`er${uid}`} />
			<path d={brow(-1)} stroke={HAIR} strokeWidth={8.5} fill="none" strokeLinecap="round" />
			<path d={brow(1)} stroke={HAIR} strokeWidth={8.5} fill="none" strokeLinecap="round" />
			{/* hair: short fade with a messy quiff */}
			<path
				d="M -75 -100 C -82 -150 -72 -198 -20 -209 C 22 -217 68 -200 77 -150 L 75 -100 C 71 -118 69 -134 63 -146 C 42 -157 14 -150 -4 -159 C -24 -150 -50 -157 -63 -146 C -69 -134 -71 -118 -75 -100 Z"
				fill={HAIR}
				stroke={INK}
				strokeWidth={OL}
				strokeLinejoin="round"
			/>
			<path d="M -46 -196 L -40 -224 L -24 -204 L -12 -232 L 4 -207 L 18 -229 L 28 -203 L 48 -218 L 46 -192 Z" fill={HAIR} stroke={INK} strokeWidth={OL} strokeLinejoin="round" />
			<path d="M -42 -192 C -20 -206 14 -206 44 -190" stroke={HAIR} strokeWidth={12} fill="none" />
			<path d="M -30 -186 Q -6 -198 20 -192" stroke={HAIR_HI} strokeWidth={4} fill="none" strokeLinecap="round" />
			{/* sweat drop */}
			{e.sweat > 0.05 ? (
				<path d="M 60 -160 Q 72 -138 66 -130 Q 56 -124 52 -134 Q 52 -144 60 -160 Z" fill="#9FE3FF" stroke={INK} strokeWidth={2.5} opacity={e.sweat} />
			) : null}
		</g>
	);

	const legs = (
		<g>
			{[-1, 1].map((s) => (
				<g key={s}>
					<path d={`M ${s * 84} 226 L ${s * 78} 470 L ${s * 20} 470 L ${s * 6} 232 Z`} fill={DENIM} stroke={INK} strokeWidth={OL} strokeLinejoin="round" />
					<path d={`M ${s * 64} 300 Q ${s * 54} 320 ${s * 60} 336`} stroke={DENIM_SH} strokeWidth={4} fill="none" strokeLinecap="round" />
					<rect x={s > 0 ? 18 : -80} y={454} width={62} height={14} fill={DENIM_SH} />
					{/* sneakers */}
					<path
						d={s > 0 ? 'M 14 470 L 14 500 L 104 500 C 108 488 100 476 84 472 L 76 466 Z' : 'M -14 470 L -14 500 L -104 500 C -108 488 -100 476 -84 472 L -76 466 Z'}
						fill={SHOE}
						stroke={INK}
						strokeWidth={OL}
						strokeLinejoin="round"
					/>
					<rect x={s > 0 ? 14 : -104} y={490} width={90} height={10} fill={SHOE_SH} stroke={INK} strokeWidth={3} />
					<path d={`M ${s * 30} 484 L ${s * 70} 478`} stroke={SHOE_ACC} strokeWidth={6} strokeLinecap="round" />
				</g>
			))}
		</g>
	);

	const torso = (
		<g>
			<path d="M -54 6 C -62 -24 62 -24 54 6 C 30 20 -30 20 -54 6 Z" fill={HOOD_SH} stroke={INK} strokeWidth={OL} />
			<rect x={-19} y={-34} width={38} height={44} fill={SKIN} stroke={INK} strokeWidth={OL} />
			<rect x={-19} y={-10} width={38} height={14} fill={SKIN_SH} opacity={0.6} />
			<path d="M -60 8 C -82 12 -94 24 -96 46 L -90 232 Q 0 244 90 232 L 96 46 C 94 24 82 12 60 8 Q 0 -2 -60 8 Z" fill={HOOD} stroke={INK} strokeWidth={OL} strokeLinejoin="round" />
			<path d="M 62 20 C 80 30 88 60 86 230 L 70 233 C 74 120 70 50 56 24 Z" fill={HOOD_SH} opacity={0.55} />
			<path d="M -70 30 C -76 60 -78 100 -76 150" stroke={HOOD_HI} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.7} />
			<path d="M -40 6 C -22 28 22 28 40 6" stroke={HOOD_SH} strokeWidth={11} fill="none" strokeLinecap="round" />
			<path d="M -40 6 C -22 28 22 28 40 6" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
			<path d="M -13 22 L -16 86" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" />
			<path d="M 13 22 L 17 92" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" />
			<rect x={-19} y={84} width={6} height={10} rx={2} fill={INK} />
			<rect x={14} y={90} width={6} height={10} rx={2} fill={INK} />
			<path d="M -54 148 L 54 148 L 64 206 L -64 206 Z" fill={HOOD_SH} opacity={0.35} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
			<path d="M -54 148 L -64 206 M 54 148 L 64 206" stroke={INK} strokeWidth={3.5} />
			<path d="M -88 212 Q 0 222 88 212 L 90 232 Q 0 244 -90 232 Z" fill={HOOD_SH} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
		</g>
	);

	const arm = (a: { e: Pt; h: Pt }, s: Pt, ang: number, kind: HandKind, side: 1 | -1) => (
		<g>
			<Limb s={s} e={a.e} h={a.h} w={36} fill={HOOD} ink={INK} ol={OL} cuff={HOOD_SH} />
			<Hand p={a.h} ang={ang} kind={kind} r={21} fill={SKIN} ink={INK} ol={OL} side={side} />
		</g>
	);

	const [vx, vy, vw, vh] = HAMZA_VIEWBOX[crop];
	return (
		<CharacterFrame x={props.x} y={props.y} scale={props.scale} viewBox={[vx, vy, vw, vh]} groundY={crop === 'full' ? 500 : 40} flip={props.flip} squash={props.squash} opacity={props.opacity}>
			{crop === 'full' ? legs : null}
			<g transform={`rotate(${lean} 0 230) translate(0 ${-breathe * 2.5})`}>
				{torso}
				{head}
				{crop === 'full' ? arm(armL, SHOULDER_L, angL, handKindL, -1) : null}
				{crop === 'full' && held ? <HeldPhone held={held} at={armR.h} uid={`p${uid}`} /> : null}
				{crop === 'full' ? arm(armR, SHOULDER_R, angR, handKindR, 1) : null}
			</g>
		</CharacterFrame>
	);
};
