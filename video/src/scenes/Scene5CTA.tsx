import React from 'react';
import { AbsoluteFill, Easing, staticFile } from 'remotion';
import { BrandWorld } from '../backgrounds/BrandWorld';
import { Hamza } from '../characters/Hamza';
import { Citybot } from '../characters/Citybot';
import { blinkAt, breatheAt, ease, mouthAt, pop, squashAt, track } from '../acting';
import { PRODUCTS, SCENES, line, w } from '../data';
import { C, LATIN } from '../brand';
import { COLORS, FacebookIcon, InstagramIcon } from '../components/Props';
import { Camera, pick, useFmt, useT } from './common';

const LAYOUT = (sq: boolean) =>
	pick(
		sq,
		{ ig: { x: 330, y: 655, s: 190 }, fb: { x: 750, y: 655, s: 190 }, handle: { y: 775, size: 40 }, url: { y: 905, size: 82 }, hamza: { x: 320, y: 1935, s: 1.02 }, bot: { x: 835, y: 1770, s: 1.05 }, skyline: 1560 },
		{ ig: { x: 380, y: 300, s: 120 }, fb: { x: 700, y: 300, s: 120 }, handle: { y: 374, size: 26 }, url: { y: 468, size: 54 }, hamza: { x: 330, y: 1125, s: 0.7 }, bot: { x: 800, y: 1020, s: 0.72 }, skyline: 840 },
	);

/** White line-art skyline — the street, now seen through City Store's world. */
const Skyline: React.FC<{ W: number; y: number }> = ({ W, y }) => (
	<svg width={W} height={420} viewBox="0 0 1080 420" style={{ position: 'absolute', left: 0, top: y }}>
		<g stroke="#FFFFFF" strokeWidth={4} fill="none" opacity={0.22} strokeLinejoin="round" strokeLinecap="round">
			<path d="M 0 260 L 120 260 L 120 200 L 260 200 L 260 240 L 330 240 L 330 120 L 352 100 L 352 60 L 372 60 L 372 100 L 394 120 L 394 240 L 520 240 L 520 180 C 560 120 640 120 680 180 L 680 240 L 820 240 L 820 190 L 960 190 L 960 250 L 1080 250" />
			<path d="M 336 160 L 388 160 M 600 140 L 600 116 M 590 128 L 610 128" />
			<path d="M 900 190 C 905 120 895 80 910 30 M 910 30 C 870 20 840 40 830 60 M 910 30 C 950 15 980 35 990 55 M 910 30 C 890 0 860 0 850 10 M 910 30 C 935 0 965 2 975 12" />
			{[150, 200, 560, 640, 860].map((x) => (
				<path key={x} d={`M ${x} 270 L ${x} 240 A 14 14 0 0 1 ${x + 28} 240 L ${x + 28} 270`} />
			))}
			<path d="M 0 300 L 1080 300" />
		</g>
	</svg>
);

/** SCENE 5 — L6 — CTA: Hamza happy with his new iPhone; Instagram + Facebook pop on their words, then @citystore.ma / citystore.ma. */
export const Scene5CTA: React.FC<{ from: number }> = ({ from }) => {
	const t = useT(from);
	const { W, H, sq } = useFmt();
	const lay = LAYOUT(sq);
	const S = SCENES.s5.start;
	const L6 = line('L6');
	const tIG = w('L6', 2);
	const tFB = w('L6', 4);
	const tURL = w('L6', 7);
	const ig = pop(t, tIG);
	const fb = pop(t, tFB);
	const handle = pop(t, tIG + 0.35);
	const url = pop(t, tURL);
	const proMaxSrc = PRODUCTS['iphone-18-pro-max']?.burgundy?.front;
	const bob = (t0: number) => (t > t0 + 0.5 ? 6 * Math.sin((t - t0) * 3) : 0);
	return (
		<Camera zoom={ease(t, S, S + 0.25, 1.06, 1, Easing.out(Easing.cubic))} ox={540} oy={sq ? 540 : 960}>
			<BrandWorld width={W} height={H} gridShift={t * 18} />
			<Skyline W={W} y={lay.skyline} />
			{ig > 0 ? (
				<div style={{ position: 'absolute', left: lay.ig.x, top: lay.ig.y + bob(tIG), transform: `translate(-50%, -50%) scale(${ig}) rotate(${(1 - Math.min(1, ig)) * -30}deg)`, filter: 'drop-shadow(0 12px 18px rgba(0,10,80,0.35))' }}>
					<InstagramIcon size={lay.ig.s} />
				</div>
			) : null}
			{fb > 0 ? (
				<div style={{ position: 'absolute', left: lay.fb.x, top: lay.fb.y + bob(tFB), transform: `translate(-50%, -50%) scale(${fb}) rotate(${(1 - Math.min(1, fb)) * 30}deg)`, filter: 'drop-shadow(0 12px 18px rgba(0,10,80,0.35))' }}>
					<FacebookIcon size={lay.fb.s} />
				</div>
			) : null}
			{handle > 0 ? (
				<div style={{ position: 'absolute', left: lay.ig.x, top: lay.handle.y, transform: `translate(-50%, 0) scale(${handle})`, fontFamily: LATIN, fontWeight: 800, fontSize: lay.handle.size, color: '#FFFFFF', textShadow: '0 3px 10px rgba(0,10,80,0.4)', whiteSpace: 'nowrap' }}>
					@citystore.ma
				</div>
			) : null}
			{url > 0 ? (
				<div
					style={{
						position: 'absolute',
						left: 540,
						top: lay.url.y,
						transform: `translate(-50%, -50%) scale(${url})`,
						fontFamily: LATIN,
						fontWeight: 900,
						fontSize: lay.url.size,
						color: C.blue,
						background: '#FFFFFF',
						borderRadius: 999,
						padding: `${lay.url.size * 0.14}px ${lay.url.size * 0.5}px`,
						boxShadow: `0 10px 0 rgba(10,20,90,0.25), 0 0 0 ${lay.url.size * 0.08}px rgba(255,255,255,0.35)`,
						whiteSpace: 'nowrap',
					}}
				>
					citystore.ma
				</div>
			) : null}
			<Hamza
				x={lay.hamza.x}
				y={lay.hamza.y}
				scale={lay.hamza.s}
				expr="happy"
				mouth={mouthAt(t, 'hamza')}
				blink={blinkAt(t, 'hamza')}
				breathe={breatheAt(t)}
				squash={squashAt(t, S, 0.06)}
				look={t < tIG ? { x: 0, y: 0 } : t < tURL ? { x: 0.5, y: -0.9 } : { x: 0, y: 0 }}
				headTilt={-6 + 2 * Math.sin(t * 2)}
				lean={2}
				handR={{ x: 150, y: -22 }}
				held={{ kind: 'image', src: proMaxSrc ? staticFile(proMaxSrc) : undefined, tint: COLORS[3].hex, label: 'iPhone 18 Pro Max', size: 1.45, angle: 10, offset: { x: 4, y: -70 } }}
				handL={track(t, [
					[S, { x: -104, y: 196 }],
					[tURL, { x: -104, y: 196 }],
					[tURL + 0.25, { x: -138, y: 8 }],
				])}
				handKindL={t > tURL ? 'thumb' : 'fist'}
			/>
			<Citybot
				x={lay.bot.x}
				y={lay.bot.y}
				scale={lay.bot.s}
				hover={24 + 10 * Math.sin(t * 2 * Math.PI * 0.8)}
				thrust={0.6 + 0.2 * Math.sin(t * 17)}
				expr={t > tURL ? 'wink' : 'happy'}
				mouth={mouthAt(t, 'citybot')}
				blink={blinkAt(t, 'citybot')}
				squash={squashAt(t, tIG, 0.05) + squashAt(t, tFB, 0.05)}
				look={t < tIG ? { x: -0.6, y: 0 } : t < tFB ? { x: -0.9, y: -0.8 } : t < tURL ? { x: -0.3, y: -0.9 } : { x: -0.6, y: -0.3 }}
				headTilt={3 * Math.sin(t * 2.4)}
				icon={t > L6.end - 0.3 ? 'heart' : null}
				iconAmount={ease(t, L6.end - 0.3, L6.end - 0.15, 0, 1)}
				handL={track(t, [
					[S, { x: -96, y: 66 }],
					[tIG - 0.08, { x: -96, y: 66 }],
					[tIG + 0.1, { x: -134, y: -78 }],
					[tURL - 0.08, { x: -134, y: -78 }],
					[tURL + 0.12, { x: -118, y: -46 }],
				])}
				handR={track(t, [
					[S, { x: 110, y: 6 }],
					[tFB - 0.08, { x: 110, y: 6 }],
					[tFB + 0.1, { x: 128, y: -80 }],
					[tURL - 0.08, { x: 128, y: -80 }],
					[tURL + 0.12, { x: 118, y: -46 }],
				])}
				handKindL={t > tIG ? 'open' : 'fist'}
				handKindR="open"
			/>
		</Camera>
	);
};
