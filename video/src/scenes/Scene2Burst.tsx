import React from 'react';
import { AbsoluteFill, Easing } from 'remotion';
import { BrandWorld } from '../backgrounds/BrandWorld';
import { Hamza, HamzaExpr } from '../characters/Hamza';
import { Citybot, CitybotExpr } from '../characters/Citybot';
import { blinkAt, breatheAt, ease, mouthAt, pop, sp, squashAt, track } from '../acting';
import { SCENES, line, w } from '../data';
import { KText } from '../components/Props';
import { pick, useFmt, useT } from './common';
import { STREET_LAYOUT, StreetShot, burstOrigin, streetZoom } from './Scene1Street';

const S2 = (sq: boolean) => ({
	hamza: pick(sq, { x: 300, y: 1720, s: 1.18 }, { x: 300, y: 1085, s: 0.78 }),
	bot: pick(sq, { x: 790, y: 1640, s: 1.38 }, { x: 770, y: 990, s: 0.9 }),
	pct: pick(sq, { x: 540, y: 670, size: 200 }, { x: 540, y: 300, size: 112 }),
});

export const hamzaExprS2 = (t: number): { expr: HamzaExpr; exprTo: HamzaExpr; exprT: number } =>
	t < w('L2', 4) ? { expr: 'shocked', exprTo: 'neutral', exprT: ease(t, w('L2', 1), w('L2', 3), 0, 1) } : { expr: 'neutral', exprTo: 'happy', exprT: ease(t, w('L2', 8) - 0.05, w('L2', 8) + 0.3, 0, 1) };

const botExpr = (t: number): CitybotExpr => {
	if (t < line('L2').start) return 'surprised';
	if (t >= w('L2', 3) && t < w('L2', 4) + 0.1) return 'wink';
	if (t >= w('L2', 7) && t < w('L2', 9)) return 'confident';
	if (t >= w('L2', 9)) return 'proud';
	return 'happy';
};

/** SCENE 2 — L2 — Citybot bursts out of the phone; the City Store world (gradient + grid) sweeps over the street. */
export const Scene2Burst: React.FC<{ from: number }> = ({ from }) => {
	const t = useT(from);
	const { W, H, sq } = useFmt();
	const B = SCENES.s2.start;
	const o = burstOrigin(sq);
	const lay = S2(sq);
	const r = ease(t, B, B + 0.5, 0, Math.hypot(W, H) * 1.05, Easing.inOut(Easing.cubic));
	const wipeDone = t > B + 0.52;

	// Hamza: from his street framing into the brand world
	const S = STREET_LAYOUT(sq);
	const z = streetZoom(B);
	const k = ease(t, B + 0.12, B + 0.8, 0, 1, Easing.inOut(Easing.cubic));
	const hx = 540 + (S.hx - 540) * z + (lay.hamza.x - (540 + (S.hx - 540) * z)) * k;
	const hy = S.oy + (S.hy - S.oy) * z + (lay.hamza.y - (S.oy + (S.hy - S.oy) * z)) * k;
	const hs = S.hs * z + (lay.hamza.s - S.hs * z) * k;
	const nod = t > w('L2', 9) ? 5 * Math.sin((t - w('L2', 9)) * 2 * Math.PI * 2.2) : 0;

	// Citybot: springs out of the phone to his hover spot
	const kk = sp(t, B, { damping: 11, stiffness: 120, mass: 0.8 });
	const bs = 0.05 + (lay.bot.s - 0.05) * kk;
	const cTarget = { x: lay.bot.x, y: lay.bot.y - 320 * lay.bot.s };
	const cx = o.x + (cTarget.x - o.x) * kk;
	const cy = o.y + (cTarget.y - o.y) * kk;
	const iconLogo = Math.min(ease(t, w('L2', 5) - 0.05, w('L2', 5) + 0.1, 0, 1), ease(t, w('L2', 7) - 0.15, w('L2', 7), 1, 0));
	const iconCheck = Math.min(ease(t, w('L2', 8), w('L2', 8) + 0.12, 0, 1), ease(t, w('L2', 9) + 0.05, w('L2', 9) + 0.2, 1, 0));
	const icon = iconCheck > 0 ? 'check' : iconLogo > 0 ? 'logo' : null;

	const pctK = pop(t, w('L2', 9));
	return (
		<AbsoluteFill>
			{!wipeDone ? <StreetShot t={B} hideHamza /> : null}
			<AbsoluteFill style={{ clipPath: wipeDone ? undefined : `circle(${r}px at ${o.x}px ${o.y}px)` }}>
				<BrandWorld width={W} height={H} gridShift={t * 18} />
			</AbsoluteFill>
			{!wipeDone ? (
				<svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
					<circle cx={o.x} cy={o.y} r={r} fill="none" stroke="#FFFFFF" strokeWidth={18} opacity={0.6} />
				</svg>
			) : null}
			<Hamza
				x={hx}
				y={hy}
				scale={hs}
				{...hamzaExprS2(t)}
				mouth={mouthAt(t, 'hamza')}
				blink={blinkAt(t, 'hamza')}
				breathe={breatheAt(t)}
				lean={-9 * ease(t, B, B + 0.12, 0, 1) * (1 - ease(t, B + 0.4, B + 1.0, 0, 1))}
				squash={squashAt(t, B, 0.08)}
				look={{ x: 0.85 * k, y: -0.25 * k }}
				headNod={nod}
				headTilt={4 * k}
				handL={track(t, [
					[B, { x: -128, y: 96 }],
					[B + 0.15, { x: -118, y: -70 }],
					[w('L2', 1) + 0.2, { x: -118, y: -70 }],
					[w('L2', 3), { x: -104, y: 196 }],
				])}
				handR={track(t, [
					[B, { x: 156, y: -20 }],
					[B + 0.15, { x: 118, y: -70 }],
					[w('L2', 1) + 0.2, { x: 118, y: -70 }],
					[w('L2', 3), { x: 104, y: 196 }],
				])}
				handKindL={t < w('L2', 2) ? 'open' : 'fist'}
				handKindR={t < w('L2', 2) ? 'open' : 'fist'}
			/>
			<Citybot
				x={cx}
				y={cy + 320 * bs}
				scale={bs}
				rotate={(1 - kk) * -40}
				squash={squashAt(t, B + 0.32, 0.16)}
				hover={18 + 10 * Math.sin(t * 2 * Math.PI * 0.7)}
				thrust={0.6 + 0.2 * Math.sin(t * 17)}
				expr={botExpr(t)}
				mouth={mouthAt(t, 'citybot')}
				blink={blinkAt(t, 'citybot')}
				look={{ x: -0.7, y: 0.1 }}
				headTilt={3 * Math.sin(t * 2.4) + (t > w('L2', 9) ? -6 : 0)}
				icon={icon}
				iconAmount={iconCheck > 0 ? iconCheck : iconLogo}
				screenFlash={ease(t, B, B + 0.25, 0.9, 0)}
				handL={track(t, [
					[B, { x: -96, y: 66 }],
					[line('L2').start, { x: -140, y: 8 }],
					[w('L2', 4) - 0.05, { x: -140, y: 8 }],
					[w('L2', 5), { x: -118, y: -46 }],
					[w('L2', 7) - 0.05, { x: -118, y: -46 }],
					[w('L2', 7) + 0.2, { x: -80, y: 52 }],
				])}
				handR={track(t, [
					[B, { x: 96, y: 66 }],
					[w('L2', 4) - 0.05, { x: 96, y: 66 }],
					[w('L2', 5), { x: 118, y: -46 }],
					[w('L2', 7) - 0.05, { x: 118, y: -46 }],
					[w('L2', 7) + 0.2, { x: 80, y: 52 }],
					[w('L2', 9) - 0.05, { x: 80, y: 52 }],
					[w('L2', 9) + 0.15, { x: 128, y: -64 }],
				])}
				handKindL={t > w('L2', 7) + 0.1 ? 'fist' : 'open'}
				handKindR={t > w('L2', 7) + 0.1 && t < w('L2', 9) ? 'fist' : 'open'}
			/>
			{pctK > 0 ? (
				<div style={{ position: 'absolute', left: lay.pct.x, top: lay.pct.y, transform: `translate(-50%, -50%) scale(${pctK}) rotate(${-6 + 3 * Math.sin(t * 5)}deg)` }}>
					<KText size={lay.pct.size}>100%</KText>
				</div>
			) : null}
			<AbsoluteFill style={{ background: '#FFFFFF', opacity: ease(t, B, B + 0.2, 0.85, 0), pointerEvents: 'none' }} />
		</AbsoluteFill>
	);
};
