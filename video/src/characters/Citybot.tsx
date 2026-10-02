import React, { useId } from 'react';
import { staticFile } from 'remotion';
import { CharacterFrame, Hand, HandKind, Limb, Pt, lerp, solveArm, svgId } from './rig';
import { Mouth, MouthParams, MouthStyle, VISEMES, Viseme } from './Mouth';

const NAVY = '#16206B';
const BLUE = '#2F3DFE';
const MID = '#0592FF';
const CYAN = '#00C5F7';
const WHITE = '#FFFFFF';
const SHELL = '#F4F7FC';
const SHELL_SH = '#D3DEEE';
const JOINT = '#A9B6CC';
const OL = 5;

const MOUTH_STYLE: MouthStyle = { ink: WHITE, inkW: 5, inside: '#0B1673', teeth: '#FFFFFF', tongue: '#62D6FF' };

export type CitybotExpr = 'neutral' | 'happy' | 'confident' | 'wink' | 'proud' | 'laughing' | 'surprised';
type Eyes = 'open' | 'arc' | 'winkL';
type ExprDef = { eyes: Eyes; eyeH: number; eyeScale: number; lid: number; slant: number; browY: number; browTilt: number; smile: number; blush: number };
const EXPR: Record<CitybotExpr, ExprDef> = {
	neutral: { eyes: 'open', eyeH: 40, eyeScale: 1, lid: 0, slant: 0, browY: 0, browTilt: 0, smile: 3, blush: 0 },
	happy: { eyes: 'open', eyeH: 40, eyeScale: 1.04, lid: 0, slant: 0, browY: -4, browTilt: -4, smile: 7, blush: 0.5 },
	confident: { eyes: 'open', eyeH: 40, eyeScale: 1, lid: 0.32, slant: 8, browY: 2, browTilt: 10, smile: 6, blush: 0 },
	wink: { eyes: 'winkL', eyeH: 40, eyeScale: 1.05, lid: 0, slant: 0, browY: -3, browTilt: -6, smile: 8, blush: 0.4 },
	proud: { eyes: 'arc', eyeH: 40, eyeScale: 1, lid: 0, slant: 0, browY: -6, browTilt: -8, smile: 7, blush: 0.6 },
	laughing: { eyes: 'arc', eyeH: 40, eyeScale: 1.1, lid: 0, slant: 0, browY: -9, browTilt: -10, smile: 6, blush: 0.9 },
	surprised: { eyes: 'open', eyeH: 46, eyeScale: 1.22, lid: 0, slant: 0, browY: -12, browTilt: 4, smile: 0, blush: 0 },
};
export const CITYBOT_REST: Record<CitybotExpr, Viseme> = { neutral: 'X', happy: 'X', confident: 'X', wink: 'X', proud: 'X', laughing: 'D', surprised: 'F' };

export type ScreenIcon = 'check' | 'heart' | 'logo';

export type CitybotPose = {
	expr?: CitybotExpr;
	mouth?: MouthParams;
	blink?: number;
	look?: Pt;
	headTilt?: number;
	handL?: Pt;
	handR?: Pt;
	handKindL?: HandKind;
	handKindR?: HandKind;
	icon?: ScreenIcon | null;
	iconAmount?: number;
	screenFlash?: number;
	thrust?: number;
	hover?: number;
};

export type CitybotProps = CitybotPose & { x: number; y: number; scale: number; crop?: 'full' | 'head'; flip?: boolean; squash?: number; rotate?: number; opacity?: number };

const SHOULDER_L: Pt = { x: -70, y: -6 };
const SHOULDER_R: Pt = { x: 70, y: -6 };
const L1 = 50;
const L2 = 46;
export const CITYBOT_HANDS_IDLE = { L: { x: -96, y: 66 }, R: { x: 96, y: 66 } };
export const CITYBOT_VIEWBOX: Record<'full' | 'head', [number, number, number, number]> = {
	full: [-185, -340, 370, 580],
	head: [-100, -325, 200, 300],
};
const GROUND = 220;

const eyePath = (w: number, h: number, lid: number, slant: number, side: 1 | -1) => {
	const hw = w / 2;
	const r = hw;
	const top = -h / 2;
	if (lid <= 0.01) {
		return `M ${-hw} ${top + r} A ${r} ${r} 0 0 1 ${hw} ${top + r} L ${hw} ${h / 2 - r} A ${r} ${r} 0 0 1 ${-hw} ${h / 2 - r} Z`;
	}
	// flat, slanted upper lid: the inner corner sits lower for a confident look
	const tIn = top + lid * h + slant;
	const tOut = top + lid * h - slant * 0.4;
	const yl = side > 0 ? tIn : tOut;
	const yr = side > 0 ? tOut : tIn;
	return `M ${-hw} ${yl} L ${hw} ${yr} L ${hw} ${h / 2 - r} A ${r} ${r} 0 0 1 ${-hw} ${h / 2 - r} Z`;
};

const Screen: React.FC<{ e: ExprDef; mouth: MouthParams; blink: number; look: Pt; icon: ScreenIcon | null; iconAmount: number; flash: number; uid: string }> = ({ e, mouth, blink, look, icon, iconAmount, flash, uid }) => {
	const faceOp = 1 - iconAmount;
	const lx = look.x * 6;
	const ly = look.y * 5;
	const eye = (side: 1 | -1) => {
		const cx = side * 29 + lx;
		const cy = -24 + ly;
		const arc = e.eyes === 'arc' || (e.eyes === 'winkL' && side < 0);
		if (arc) {
			return <path d={`M ${cx - 16} ${cy + 8} Q ${cx} ${cy - 16} ${cx + 16} ${cy + 8}`} stroke={WHITE} strokeWidth={8} fill="none" strokeLinecap="round" />;
		}
		const sc = e.eyeScale;
		const bl = Math.max(0.1, 1 - blink);
		return (
			<g transform={`translate(${cx} ${cy}) scale(${sc} ${sc * bl})`}>
				<path d={eyePath(30, e.eyeH, e.lid, e.slant, side)} fill={WHITE} />
				{bl > 0.5 ? <circle cx={6 + look.x * 3} cy={-e.eyeH / 2 + 12 + e.lid * e.eyeH * 0.6} r={4.5} fill={BLUE} opacity={0.85} /> : null}
			</g>
		);
	};
	const brow = (side: 1 | -1) => {
		const cx = side * 29 + lx;
		const y = -58 + e.browY + ly;
		const t = e.browTilt;
		return <path d={`M ${cx - side * 13} ${y + (t * 0.5)} L ${cx + side * 13} ${y - t * 0.5}`} stroke={WHITE} strokeWidth={6} strokeLinecap="round" opacity={0.95} />;
	};
	const pop = 0.6 + 0.4 * iconAmount;
	return (
		<g>
			<g opacity={faceOp}>
				{brow(-1)}
				{brow(1)}
				{eye(-1)}
				{eye(1)}
				<ellipse cx={-48} cy={10} rx={11} ry={6} fill="#FF7DB0" opacity={0.55 * e.blush} />
				<ellipse cx={48} cy={10} rx={11} ry={6} fill="#FF7DB0" opacity={0.55 * e.blush} />
				<Mouth p={mouth} smile={e.smile} x={lx * 0.6} y={32 + ly * 0.6} scale={1.3} style={MOUTH_STYLE} />
			</g>
			{icon && iconAmount > 0.01 ? (
				<g opacity={Math.min(1, iconAmount * 1.4)} transform={`scale(${pop})`}>
					{icon === 'check' ? (
						<g>
							<circle r={44} fill="none" stroke={WHITE} strokeWidth={8} />
							<path d="M -22 2 L -6 18 L 24 -16" stroke={WHITE} strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
						</g>
					) : icon === 'heart' ? (
						<path d="M 0 30 C -50 -4 -40 -44 -12 -40 C 0 -38 0 -26 0 -22 C 0 -26 0 -38 12 -40 C 40 -44 50 -4 0 30 Z" fill="#FF5C93" stroke={WHITE} strokeWidth={6} strokeLinejoin="round" transform="scale(1.25)" />
					) : (
						<g>
							<clipPath id={`lg${uid}`}>
								<rect x={-50} y={-50} width={100} height={100} rx={22} />
							</clipPath>
							<image href={staticFile('logo.png')} x={-50} y={-50} width={100} height={100} clipPath={`url(#lg${uid})`} />
							<rect x={-50} y={-50} width={100} height={100} rx={22} fill="none" stroke={WHITE} strokeWidth={4} />
						</g>
					)}
				</g>
			) : null}
			{flash > 0 ? <rect x={-70} y={-110} width={140} height={220} fill={WHITE} opacity={flash} /> : null}
		</g>
	);
};

export const Citybot: React.FC<CitybotProps> = (props) => {
	const uid = svgId(useId());
	const {
		expr = 'neutral',
		blink = 0,
		look = { x: 0, y: 0 },
		headTilt = 0,
		handKindL = 'fist',
		handKindR = 'fist',
		icon = null,
		iconAmount = 0,
		screenFlash = 0,
		thrust = 0.6,
		hover = 0,
	} = props;
	const e = EXPR[expr];
	const mouth = props.mouth ?? VISEMES[CITYBOT_REST[expr]];
	const handL = props.handL ?? CITYBOT_HANDS_IDLE.L;
	const handR = props.handR ?? CITYBOT_HANDS_IDLE.R;
	const armL = solveArm(SHOULDER_L, handL, L1, L2, -1);
	const armR = solveArm(SHOULDER_R, handR, L1, L2, 1);
	const angL = Math.atan2(armL.h.y - armL.e.y, armL.h.x - armL.e.x);
	const angR = Math.atan2(armR.h.y - armR.e.y, armR.h.x - armR.e.x);
	const crop = props.crop ?? 'full';

	const head = (
		<g transform={`translate(0 -40) rotate(${headTilt}) translate(0 -112)`}>
			<defs>
				<linearGradient id={`sg${uid}`} x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor={BLUE} />
					<stop offset="0.55" stopColor={MID} />
					<stop offset="1" stopColor={CYAN} />
				</linearGradient>
				<pattern id={`grid${uid}`} width={16} height={16} patternUnits="userSpaceOnUse" x={-63} y={-98}>
					<path d="M 16 0 L 0 0 0 16" fill="none" stroke={WHITE} strokeWidth={1} opacity={0.16} />
				</pattern>
				<clipPath id={`sc${uid}`}>
					<rect x={-63} y={-98} width={126} height={196} rx={27} />
				</clipPath>
			</defs>
			{/* antenna */}
			<line x1={0} y1={-110} x2={0} y2={-140} stroke={NAVY} strokeWidth={5} strokeLinecap="round" />
			<circle cx={0} cy={-146} r={17} fill={CYAN} opacity={0.25 + 0.15 * thrust} />
			<circle cx={0} cy={-146} r={9} fill={CYAN} stroke={NAVY} strokeWidth={4} />
			{/* side buttons */}
			<rect x={73} y={-62} width={8} height={30} rx={3} fill={NAVY} />
			<rect x={-81} y={-70} width={8} height={20} rx={3} fill={NAVY} />
			<rect x={-81} y={-42} width={8} height={20} rx={3} fill={NAVY} />
			{/* bezel */}
			<rect x={-76} y={-112} width={152} height={224} rx={38} fill={SHELL} stroke={NAVY} strokeWidth={OL} />
			<rect x={-63} y={-98} width={126} height={196} rx={27} fill={`url(#sg${uid})`} />
			<g clipPath={`url(#sc${uid})`}>
				<rect x={-63} y={-98} width={126} height={196} fill={`url(#grid${uid})`} />
				<Screen e={e} mouth={mouth} blink={blink} look={look} icon={icon} iconAmount={iconAmount} flash={screenFlash} uid={uid} />
				<path d="M -63 -40 L 10 -98 L 40 -98 L -63 -6 Z" fill={WHITE} opacity={0.1} />
			</g>
			<rect x={-63} y={-98} width={126} height={196} rx={27} fill="none" stroke={NAVY} strokeWidth={2.5} opacity={0.6} />
			<circle cx={0} cy={-105} r={3.5} fill={NAVY} />
		</g>
	);

	const body = (
		<g>
			{/* thruster glow */}
			<defs>
				<radialGradient id={`th${uid}`} cx="0.5" cy="0" r="1">
					<stop offset="0" stopColor="#E9FBFF" stopOpacity={0.95} />
					<stop offset="0.35" stopColor={CYAN} stopOpacity={0.75} />
					<stop offset="1" stopColor={CYAN} stopOpacity={0} />
				</radialGradient>
				<clipPath id={`bd${uid}`}>
					<path d="M -66 -28 C -74 -28 -78 -20 -78 -10 L -72 58 C -68 94 -38 110 0 110 C 38 110 68 94 72 58 L 78 -10 C 78 -20 74 -28 66 -28 Z" />
				</clipPath>
			</defs>
			<ellipse cx={0} cy={112 + 30 * thrust} rx={26 + 6 * thrust} ry={20 + 40 * thrust} fill={`url(#th${uid})`} />
			<ellipse cx={0} cy={110} rx={24} ry={9} fill="#5B6782" stroke={NAVY} strokeWidth={4} />
			<rect x={-17} y={-48} width={34} height={24} rx={6} fill={JOINT} stroke={NAVY} strokeWidth={4} />
			<path d="M -66 -28 C -74 -28 -78 -20 -78 -10 L -72 58 C -68 94 -38 110 0 110 C 38 110 68 94 72 58 L 78 -10 C 78 -20 74 -28 66 -28 Z" fill={WHITE} />
			<g clipPath={`url(#bd${uid})`}>
				<ellipse cx={74} cy={50} rx={42} ry={90} fill={SHELL_SH} />
				<ellipse cx={-46} cy={4} rx={12} ry={30} fill={WHITE} opacity={0.9} />
				<path d="M -80 66 Q 0 84 80 66" stroke={SHELL_SH} strokeWidth={4} fill="none" />
			</g>
			<path d="M -66 -28 C -74 -28 -78 -20 -78 -10 L -72 58 C -68 94 -38 110 0 110 C 38 110 68 94 72 58 L 78 -10 C 78 -20 74 -28 66 -28 Z" fill="none" stroke={NAVY} strokeWidth={OL} strokeLinejoin="round" />
			{/* chest badge: the brand gradient with a check */}
			<rect x={-19} y={6} width={38} height={38} rx={11} fill={`url(#sg${uid})`} stroke={NAVY} strokeWidth={3.5} />
			<path d="M -9 25 L -2 32 L 10 17" stroke={WHITE} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
		</g>
	);

	const arm = (a: { e: Pt; h: Pt }, s: Pt, ang: number, kind: HandKind, side: 1 | -1) => (
		<g>
			<Limb s={s} e={a.e} h={a.h} w={24} fill={WHITE} ink={NAVY} ol={OL} />
			<circle cx={a.e.x} cy={a.e.y} r={7} fill={JOINT} stroke={NAVY} strokeWidth={3} />
			<Hand p={a.h} ang={ang} kind={kind} r={15} fill={SHELL_SH} ink={NAVY} ol={OL} side={side} />
		</g>
	);

	const [vx, vy, vw, vh] = CITYBOT_VIEWBOX[crop];
	return (
		<CharacterFrame x={props.x} y={props.y} scale={props.scale} viewBox={[vx, vy, vw, vh]} groundY={crop === 'full' ? GROUND : -25} flip={props.flip} squash={props.squash} rotate={props.rotate} opacity={props.opacity}>
			{crop === 'full' ? <ellipse cx={0} cy={GROUND} rx={lerp(70, 46, Math.min(1, Math.max(0, hover / 60)))} ry={12} fill="#0B1240" opacity={0.18} /> : null}
			<g transform={`translate(0 ${-hover})`}>
				{crop === 'full' ? body : null}
				{head}
				{crop === 'full' ? arm(armL, SHOULDER_L, angL, handKindL, -1) : null}
				{crop === 'full' ? arm(armR, SHOULDER_R, angR, handKindR, 1) : null}
			</g>
		</CharacterFrame>
	);
};
