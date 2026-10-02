import React from 'react';
import { AbsoluteFill, Easing, random } from 'remotion';
import { BrandWorld } from '../backgrounds/BrandWorld';
import { Hamza } from '../characters/Hamza';
import { Citybot, CitybotExpr } from '../characters/Citybot';
import { blinkAt, breatheAt, ease, mouthAt, pop, sp, squashAt, track } from '../acting';
import { SCENES, line, w } from '../data';
import { COLORS, CityBox, KText, LightBurst, Model, ProductImage, Swatch, colorFor, productSrc } from '../components/Props';
import { pick, useFmt, useT } from './common';

const LAYOUT = (sq: boolean) =>
	pick(
		sq,
		{
			box: { x: 540, y: 1250, size: 440 },
			phone: { x: 540, y: 790, h: 520 },
			split: { maxX: 345, proX: 735, k: 0.86 },
			title: { y: 1070, size: 76 },
			label: { y: 1048, size: 34 },
			swatch: { y: 1060, size: 58, gap: 150 },
			hamza: { x: 205, y: 1960, s: 0.95 },
			bot: { x: 878, y: 1835, s: 1.05 },
		},
		{
			box: { x: 540, y: 760, size: 270 },
			phone: { x: 540, y: 375, h: 330 },
			split: { maxX: 410, proX: 670, k: 0.88 },
			title: { y: 560, size: 46 },
			label: { y: 556, size: 22 },
			swatch: { y: 600, size: 38, gap: 104 },
			hamza: { x: 150, y: 1150, s: 0.66 },
			bot: { x: 930, y: 1068, s: 0.7 },
		},
	);

const Sparkles: React.FC<{ t: number; t0: number; cx: number; cy: number; spread: number }> = ({ t, t0, cx, cy, spread }) => (
	<>
		{Array.from({ length: 9 }).map((_, i) => {
			const st = t0 + random(`sp${i}`) * 0.35;
			const k = ease(t, st, st + 0.5, 0, 1);
			if (k <= 0 || k >= 1) return null;
			const a = random(`spa${i}`) * Math.PI * 2;
			const r = spread * (0.55 + 0.45 * random(`spr${i}`));
			const s = 18 + 26 * random(`sps${i}`);
			return (
				<svg key={i} width={s * 2} height={s * 2} viewBox="-10 -10 20 20" style={{ position: 'absolute', left: cx + Math.cos(a) * r - s, top: cy + Math.sin(a) * r * 1.3 - s, opacity: Math.sin(k * Math.PI), transform: `scale(${Math.sin(k * Math.PI)}) rotate(${k * 90}deg)` }}>
					<path d="M 0 -10 Q 1.5 -1.5 10 0 Q 1.5 1.5 0 10 Q -1.5 1.5 -10 0 Q -1.5 -1.5 0 -10 Z" fill="#FFFFFF" />
				</svg>
			);
		})}
	</>
);

/** A product that turns in fake 3D (scaleX = cos), showing its back then its front. */
const SpinningPhone: React.FC<{ model: Model; color: (typeof COLORS)[number]['key']; x: number; y: number; h: number; scale: number; angle: number; opacity?: number }> = ({ model, color, x, y, h, scale, angle, opacity = 1 }) => {
	if (productSrc(model, color, 'pair')) {
		// Apple's back+front composite: present it upright with a gentle sway instead of a fake 3D flip
		const sway = 3 * Math.sin((angle * Math.PI) / 180);
		return (
			<div style={{ position: 'absolute', left: x, top: y, opacity, transform: `translate(-50%, -50%) scale(${scale}) rotate(${sway}deg)` }}>
				<ProductImage model={model} color={color} side="pair" height={h} />
			</div>
		);
	}
	const c = Math.cos((angle * Math.PI) / 180);
	return (
		<div style={{ position: 'absolute', left: x, top: y, opacity, transform: `translate(-50%, -50%) scale(${scale}) scaleX(${Math.max(0.04, Math.abs(c))})` }}>
			<ProductImage model={model} color={color} side={c >= 0 ? 'back' : 'front'} height={h} />
		</div>
	);
};

const botExpr = (t: number): CitybotExpr => {
	if (t < line('L4').start) return t > w('L3', 1) ? 'proud' : 'happy';
	if (t >= w('L4', 3)) return 'laughing';
	return 'confident';
};

/** SCENE 3 — L3 + L4 — unboxing: the box drops and opens, iPhone 18 Pro Max rises and turns; the 18 Pro joins with colour swatches. */
export const Scene3Unboxing: React.FC<{ from: number }> = ({ from }) => {
	const t = useT(from);
	const { W, H, sq } = useFmt();
	const lay = LAYOUT(sq);
	const T0 = SCENES.s3.start;
	const land = T0 + 0.24;
	const O = w('L3', 0);
	const R = O + 0.1;
	const P = w('L4', 1);
	const C0 = w('L4', 3);

	// box
	const boxH = lay.box.size * 1.25;
	const dropY = ease(t, T0, land, -boxH - 200, lay.box.y, Easing.in(Easing.quad));
	const boxSq = t > land ? 0.22 * Math.sin((t - land) * 22) * Math.exp(-(t - land) * 9) : 0;
	const open = ease(t, O, O + 0.45, 0, 1, Easing.out(Easing.cubic));
	const boxExit = ease(t, R + 0.32, R + 0.68, 0, 1, Easing.in(Easing.cubic));
	const boxTopY = lay.box.y - lay.box.size * 0.55;

	// phones
	const rise = ease(t, R, R + 0.55, 0, 1, Easing.out(Easing.back(1.6)));
	const phoneY = boxTopY + (lay.phone.y - boxTopY) * rise;
	const spin = 360 * ease(t, R + 0.3, line('L3').end + 0.2, 0, 1, Easing.inOut(Easing.cubic)) + (t > line('L3').end + 0.2 ? 22 * Math.sin((t - line('L3').end) * 2.2) : 0);
	const split = ease(t, P - 0.1, P + 0.35, 0, 1, Easing.inOut(Easing.cubic));
	const maxX = lay.phone.x + (lay.split.maxX - lay.phone.x) * split;
	const maxScale = (0.25 + 0.75 * rise) * (1 - (1 - lay.split.k) * split);
	const proK = pop(t, P);
	const ci = t < C0 ? -1 : Math.min(3, Math.floor((t - C0) / 0.22));
	const maxColor = colorFor('iphone-18-pro-max', ci < 0 ? 'burgundy' : COLORS[ci].key);
	const proColor = colorFor('iphone-18-pro', ci < 0 ? 'burgundy' : COLORS[ci].key);

	// Hamza: cartoon jaw drop on "iPhone 18 Pro Max"
	const jaw = sp(t, w('L3', 1), { damping: 8, stiffness: 180 }) * (1 - ease(t, line('L3').end + 0.05, line('L3').end + 0.45, 0, 1));
	const nod = t > w('L4', 3) ? 5 * Math.sin((t - w('L4', 3)) * 2 * Math.PI * 2.4) : 0;
	const titleWords = ['iPhone', '18', 'Pro', 'Max'];
	const titleOut = ease(t, P - 0.15, P + 0.1, 1, 0);

	return (
		<AbsoluteFill>
			<BrandWorld width={W} height={H} gridShift={t * 18} />
			<AbsoluteFill style={{ background: `radial-gradient(circle at 50% ${(lay.phone.y / H) * 100}%, rgba(255,255,255,0.35), rgba(255,255,255,0) 55%)` }} />
			{/* light burst from the opened box, then behind the phones */}
			{t >= O ? (
				<div style={{ position: 'absolute', left: lay.phone.x, top: t < R + 0.5 ? boxTopY + (lay.phone.y - boxTopY) * rise : lay.phone.y, transform: 'translate(-50%, -50%)' }}>
					<LightBurst size={lay.phone.h * 2.2} rot={t * 35} opacity={ease(t, O, O + 0.15, 0, 1) * (0.55 + 0.45 * (1 - split))} />
				</div>
			) : null}
			{/* the box */}
			{boxExit < 1 ? (
				<div
					style={{
						position: 'absolute',
						left: lay.box.x - (lay.box.size * 1.2) / 2,
						top: dropY - boxH + boxExit * 700,
						opacity: 1 - boxExit,
						transform: `scale(${1 + boxSq * 0.6}, ${1 - boxSq})`,
						transformOrigin: '50% 100%',
					}}
				>
					<CityBox size={lay.box.size} open={open} lidAngle={open * 28} />
				</div>
			) : null}
			{/* phones */}
			{t >= R ? <SpinningPhone model="iphone-18-pro-max" color={maxColor} x={maxX} y={phoneY} h={lay.phone.h} scale={maxScale} angle={spin} /> : null}
			{proK > 0 ? <SpinningPhone model="iphone-18-pro" color={proColor} x={lay.split.proX} y={lay.phone.y + lay.phone.h * 0.035} h={lay.phone.h * 0.93} scale={lay.split.k * proK} angle={-spin * 0.6} /> : null}
			<Sparkles t={t} t0={line('L3').end} cx={lay.phone.x} cy={lay.phone.y} spread={lay.phone.h * 0.5} />
			{/* kinetic product name, word by word */}
			{titleOut > 0 && t >= w('L3', 1) ? (
				<div style={{ position: 'absolute', left: 0, width: W, top: lay.title.y, display: 'flex', justifyContent: 'center', gap: lay.title.size * 0.4, opacity: titleOut }}>
					{titleWords.map((wd, i) => {
						const k = pop(t, w('L3', i + 1));
						return k > 0 ? (
							<div key={wd} style={{ transform: `translateY(${(1 - k) * 40}px) scale(${k})` }}>
								<KText size={lay.title.size}>{wd}</KText>
							</div>
						) : null;
					})}
				</div>
			) : null}
			{/* labels after the split */}
			{split > 0
				? [
						{ x: lay.split.maxX, name: 'iPhone 18 Pro Max', k: pop(t, P + 0.12) },
						{ x: lay.split.proX, name: 'iPhone 18 Pro', k: pop(t, P + 0.22) },
					].map((lb) =>
						lb.k > 0 ? (
							<div key={lb.name} style={{ position: 'absolute', left: lb.x, top: lay.label.y, transform: `translate(-50%, 0) scale(${lb.k})` }}>
								<KText size={lay.label.size}>{lb.name}</KText>
							</div>
						) : null,
					)
				: null}
			{/* colour swatches on "وبجميع الألوان" */}
			<div style={{ position: 'absolute', left: 0, width: W, top: lay.swatch.y + lay.label.size * 1.3, display: 'flex', justifyContent: 'center', gap: lay.swatch.gap - lay.swatch.size }}>
				{COLORS.map((c, j) => {
					const k = pop(t, C0 + j * 0.12);
					return (
						<div key={c.key} style={{ transform: `scale(${k})`, opacity: k > 0 ? 1 : 0 }}>
							<Swatch color={c} size={lay.swatch.size} selected={j === ci} />
						</div>
					);
				})}
			</div>
			<Hamza
				x={lay.hamza.x}
				y={lay.hamza.y}
				scale={lay.hamza.s}
				expr={t < O ? 'shocked' : t < line('L4').start ? 'amazed' : 'happy'}
				jawDrop={jaw}
				mouth={mouthAt(t, 'hamza')}
				blink={blinkAt(t, 'hamza')}
				breathe={breatheAt(t)}
				squash={squashAt(t, w('L3', 1), 0.1)}
				look={{ x: 0.55, y: -0.7 }}
				headTilt={6}
				headNod={nod}
				lean={4 * jaw}
				handL={track(t, [
					[T0, { x: -104, y: 196 }],
					[O + 0.1, { x: -100, y: -64 }],
					[line('L3').end + 0.1, { x: -100, y: -64 }],
					[line('L3').end + 0.5, { x: -104, y: 196 }],
				])}
				handR={track(t, [
					[T0, { x: 104, y: 196 }],
					[O + 0.1, { x: 100, y: -64 }],
					[line('L3').end + 0.1, { x: 100, y: -64 }],
					[line('L3').end + 0.5, { x: 104, y: 196 }],
					[C0, { x: 104, y: 196 }],
					[C0 + 0.25, { x: 136, y: 10 }],
				])}
				handKindL={t < line('L3').end + 0.3 ? 'open' : 'fist'}
				handKindR={t < line('L3').end + 0.3 ? 'open' : t > C0 ? 'thumb' : 'fist'}
			/>
			<Citybot
				x={lay.bot.x}
				y={lay.bot.y}
				scale={lay.bot.s}
				hover={22 + 10 * Math.sin(t * 2 * Math.PI * 0.7)}
				thrust={0.6 + 0.2 * Math.sin(t * 17)}
				expr={botExpr(t)}
				mouth={mouthAt(t, 'citybot')}
				blink={blinkAt(t, 'citybot')}
				look={t < line('L4').start ? { x: -0.7, y: 0.2 } : { x: -0.5, y: -0.6 }}
				headTilt={3 * Math.sin(t * 2.4) + (t < line('L4').start ? -6 : 0)}
				icon={t > line('L4').end - 0.35 ? 'heart' : null}
				iconAmount={ease(t, line('L4').end - 0.35, line('L4').end - 0.2, 0, 1)}
				handL={track(t, [
					[T0, { x: -80, y: 52 }],
					[line('L4').start - 0.05, { x: -80, y: 52 }],
					[P - 0.05, { x: -134, y: -50 }],
					[C0 - 0.05, { x: -134, y: -50 }],
					[C0 + 0.15, { x: -118, y: -46 }],
				])}
				handR={track(t, [
					[T0, { x: 80, y: 52 }],
					[C0 - 0.05, { x: 80, y: 52 }],
					[C0 + 0.15, { x: 118, y: -46 }],
				])}
				handKindL={t < line('L4').start ? 'fist' : 'open'}
				handKindR={t < C0 ? 'fist' : 'open'}
			/>
		</AbsoluteFill>
	);
};
