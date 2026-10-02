import React from 'react';
import { AbsoluteFill, Easing } from 'remotion';
import { BrandWorld } from '../backgrounds/BrandWorld';
import { Hamza } from '../characters/Hamza';
import { Citybot } from '../characters/Citybot';
import { blinkAt, breatheAt, ease, mouthAt, pop, sp, squashAt, track } from '../acting';
import { SCENES, line, w } from '../data';
import { LogoPart } from '../components/Props';
import type { Pt } from '../characters/rig';
import { Camera, pick, useFmt, useT } from './common';

type Item = { icon: 'icon_laptop' | 'icon_watch' | 'icon_headphones' | 'icon_controller'; word: number };
const ITEMS: Item[] = [
	{ icon: 'icon_laptop', word: 1 },
	{ icon: 'icon_watch', word: 2 },
	{ icon: 'icon_headphones', word: 3 },
	{ icon: 'icon_controller', word: 4 },
];

const LAYOUT = (sq: boolean) =>
	pick(
		sq,
		{
			cards: [
				{ x: 345, y: 650 },
				{ x: 735, y: 650 },
				{ x: 345, y: 990 },
				{ x: 735, y: 990 },
			],
			card: { w: 350, h: 300, icon: 150 },
			bot: { x: 540, y: 1835, s: 1.15 },
			hamza: { x: 150, y: 1995, s: 0.8 },
			floorY: 1800,
		},
		{
			cards: [
				{ x: 165, y: 370 },
				{ x: 405, y: 370 },
				{ x: 645, y: 370 },
				{ x: 885, y: 370 },
			],
			card: { w: 214, h: 190, icon: 92 },
			bot: { x: 560, y: 1075, s: 0.8 },
			hamza: { x: 130, y: 1160, s: 0.56 },
			floorY: 1050,
		},
	);

/** Presenting gestures, one per item (Citybot's local coords). */
const HOST: { L: Pt; R: Pt }[] = [
	{ L: { x: -132, y: -72 }, R: { x: 80, y: 52 } },
	{ L: { x: -80, y: 52 }, R: { x: 132, y: -72 } },
	{ L: { x: -140, y: -14 }, R: { x: 80, y: 52 } },
	{ L: { x: -118, y: -62 }, R: { x: 118, y: -62 } },
];

const Spotlights: React.FC<{ W: number; H: number; t: number }> = ({ W, H, t }) => (
	<svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
		<defs>
			<linearGradient id="spot" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#FFFFFF" stopOpacity={0.45} />
				<stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
			</linearGradient>
		</defs>
		{[
			{ x: 60, a: 18 + 12 * Math.sin(t * 1.6) },
			{ x: W - 60, a: -18 - 12 * Math.sin(t * 1.6 + 1) },
		].map((s, i) => (
			<path key={i} d={`M ${s.x - 20} -10 L ${s.x + 20} -10 L ${s.x + 220} ${H} L ${s.x - 220} ${H} Z`} fill="url(#spot)" transform={`rotate(${s.a} ${s.x} 0)`} opacity={0.55} />
		))}
	</svg>
);

/** SCENE 4 — L5 — showroom: beat-synced carousel of laptops, watches, headphones, consoles; Citybot hosts, Hamza nods faster and faster. */
export const Scene4Showroom: React.FC<{ from: number }> = ({ from }) => {
	const t = useT(from);
	const { W, H, sq } = useFmt();
	const lay = LAYOUT(sq);
	const L5 = line('L5');
	const S = SCENES.s4.start;
	const times = ITEMS.map((it) => w('L5', it.word));
	const current = times.filter((x) => t >= x - 0.05).length - 1;
	const host = current < 0 ? { L: { x: -96, y: 66 }, R: { x: 96, y: 66 } } : HOST[current];
	const prev = current <= 0 ? { L: { x: -96, y: 66 }, R: { x: 96, y: 66 } } : HOST[current - 1];
	const hk = current < 0 ? 0 : ease(t, times[current] - 0.08, times[current] + 0.1, 0, 1, Easing.out(Easing.cubic));
	const mix = (a: Pt, b: Pt) => ({ x: a.x + (b.x - a.x) * hk, y: a.y + (b.y - a.y) * hk });
	// nodding that speeds up across the line
	const tau = Math.max(0, t - L5.start);
	const D = L5.end - L5.start;
	const nodPhase = 2 * Math.PI * (1.3 * tau + (1.6 * tau * tau) / D);
	const nod = t > L5.start ? 6 * Math.sin(nodPhase) : 0;
	const beat = (i: number) => times.slice(i + 1).reduce((acc, bt) => acc + (t > bt ? 0.07 * Math.sin(Math.min(Math.PI, (t - bt) * 14)) : 0), 0);

	return (
		<Camera zoom={ease(t, S, S + 0.25, 1.08, 1, Easing.out(Easing.cubic))} ox={540} oy={sq ? 540 : 960}>
			<BrandWorld width={W} height={H} gridShift={t * 18} />
			<Spotlights W={W} H={H} t={t} />
			<svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
				<defs>
					<radialGradient id="floor">
						<stop offset="0" stopColor="#FFFFFF" stopOpacity={0.3} />
						<stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
					</radialGradient>
				</defs>
				<ellipse cx={540} cy={lay.floorY} rx={620} ry={120} fill="url(#floor)" />
			</svg>
			{ITEMS.map((it, i) => {
				const tp = times[i];
				const frame = sp(t, tp - 0.02, { damping: 13, stiffness: 170 });
				const ik = pop(t, tp);
				if (frame <= 0) return null;
				const c = lay.cards[i];
				const shine = ease(t, tp + 0.15, tp + 0.6, -0.4, 1.4);
				return (
					<div key={it.icon} style={{ position: 'absolute', left: c.x, top: c.y, transform: `translate(-50%, -50%) scale(${1 + beat(i)})` }}>
						<div
							style={{
								width: lay.card.w,
								height: lay.card.h,
								borderRadius: lay.card.w * 0.11,
								background: 'rgba(255,255,255,0.14)',
								border: '3px solid rgba(255,255,255,0.85)',
								boxShadow: '0 18px 40px rgba(0,10,80,0.25), inset 0 0 40px rgba(255,255,255,0.12)',
								transform: `scale(${0.55 + 0.45 * frame})`,
								opacity: Math.min(1, frame * 1.4),
								position: 'relative',
								overflow: 'hidden',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<div style={{ position: 'absolute', top: '-20%', bottom: '-20%', width: '30%', left: `${shine * 100}%`, background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.45), rgba(255,255,255,0))', transform: 'skewX(-18deg)' }} />
							<div style={{ transform: `scale(${ik * 1.0}) rotate(${(1 - Math.min(1, ik)) * -25}deg)` }}>
								<LogoPart part={it.icon} height={lay.card.icon} style={{ maxWidth: lay.card.w * 0.78, objectFit: 'contain', filter: 'drop-shadow(0 6px 10px rgba(0,20,90,0.35))' }} />
							</div>
						</div>
					</div>
				);
			})}
			<Hamza
				x={lay.hamza.x}
				y={lay.hamza.y}
				scale={lay.hamza.s}
				expr="happy"
				exprTo="amazed"
				exprT={ease(t, times[3], times[3] + 0.3, 0, 0.6)}
				mouth={mouthAt(t, 'hamza')}
				blink={blinkAt(t, 'hamza')}
				breathe={breatheAt(t)}
				headNod={nod}
				headTilt={3}
				look={current < 0 ? { x: 0.8, y: -0.4 } : { x: [0.2, 0.9, 0.3, 0.9][current], y: [-0.9, -0.9, -0.5, -0.5][current] }}
				handL={{ x: -104, y: 196 }}
				handR={track(t, [
					[S, { x: 104, y: 196 }],
					[times[3], { x: 104, y: 196 }],
					[times[3] + 0.25, { x: 136, y: 10 }],
				])}
				handKindR={t > times[3] ? 'thumb' : 'fist'}
			/>
			<Citybot
				x={lay.bot.x}
				y={lay.bot.y}
				scale={lay.bot.s}
				hover={26 + 12 * Math.sin(t * 2 * Math.PI * 1.0)}
				thrust={0.6 + 0.35 * (current >= 0 ? Math.exp(-(t - times[current]) * 5) : 0) + 0.1 * Math.sin(t * 17)}
				expr={t > L5.end - 0.3 ? 'laughing' : current === 1 ? 'wink' : 'confident'}
				mouth={mouthAt(t, 'citybot')}
				blink={blinkAt(t, 'citybot')}
				squash={current >= 0 ? squashAt(t, times[current], 0.06) : squashAt(t, S, 0.1)}
				look={current < 0 ? { x: 0, y: 0 } : { x: [-0.8, 0.8, -0.8, 0][current], y: -0.6 }}
				headTilt={current < 0 ? 0 : [-8, 8, -6, 0][current]}
				handL={mix(prev.L, host.L)}
				handR={mix(prev.R, host.R)}
				handKindL={host.L.y < 0 ? 'open' : 'fist'}
				handKindR={host.R.y < 0 ? 'open' : 'fist'}
			/>
		</Camera>
	);
};
