import React from 'react';
import { AbsoluteFill, Easing } from 'remotion';
import { BrandWorld } from '../backgrounds/BrandWorld';
import { Hamza } from '../characters/Hamza';
import { Citybot } from '../characters/Citybot';
import { blinkAt, breatheAt, ease, mouthAt, pop, shakeAt, sp, squashAt, track, trackN } from '../acting';
import { DURATION_SEC, LOGO, SCENES, line, w } from '../data';
import { KText, LogoPart } from '../components/Props';
import { ARABIC } from '../brand';
import { Camera, pick, toScreen, useFmt, useT } from './common';

const LAYOUT = (sq: boolean) =>
	pick(
		sq,
		{ logo: { top: 250, width: 840 }, tagline: { y: 880, size: 100 }, hamza: { x0: 290, x1: 420, y: 1950, s: 0.9 }, bot: { x0: 800, y: 1800, s: 1.0 } },
		{ logo: { top: 215, width: 470 }, tagline: { y: 566, size: 56 }, hamza: { x0: 360, x1: 450, y: 1110, s: 0.55 }, bot: { x0: 760, y: 1030, s: 0.62 } },
	);

export const HOLD_FROM = DURATION_SEC - 1.0;
const HIGH_FIVE_HAND = { x: 172, y: -62 };
/** Citybot's hand for the high-five, out to his side so the contact (and spark) stays clear of his face. */
const BOT_FIVE_HAND = { x: -112, y: -78 };

/** SCENE 6 — L7 — end card: CITY slams in, STORE.MA types on, icon row pops, tagline, high-five, ~1 s final hold. */
export const Scene6EndCard: React.FC<{ from: number }> = ({ from }) => {
	const t = Math.min(useT(from), HOLD_FROM);
	const { W, H, sq } = useFmt();
	const lay = LAYOUT(sq);
	const S = SCENES.s6.start;
	const L7 = line('L7');
	const full = LOGO.parts.full;
	const k = lay.logo.width / full.w;
	const left0 = (W - lay.logo.width) / 2;
	const place = (p: { x: number; y: number; w: number; h: number }) => ({ left: left0 + (p.x - full.x) * k, top: lay.logo.top + (p.y - full.y) * k, width: p.w * k, height: p.h * k });

	// CITY slam
	const city = place(LOGO.parts.city);
	const slam = 1.55 - 0.55 * sp(t, S, { damping: 9, stiffness: 300, mass: 0.6 });
	const ring = ease(t, S, S + 0.4, 0, 1, Easing.out(Easing.cubic));
	// STORE.MA type-on
	const sm = place(LOGO.parts.storema);
	const glyphs = LOGO.storemaGlyphs;
	const T1 = w('L7', 1) - 0.05;
	const typed = Math.floor(ease(t, T1, T1 + 0.45, 0, glyphs.length, Easing.linear) + 1e-6);
	const revealPx = typed <= 0 ? 0 : glyphs[Math.min(typed, glyphs.length) - 1][1] * k;
	const cursorOn = t >= T1 - 0.1 && (typed < glyphs.length || Math.floor(t * 3) % 2 === 0) && t < T1 + 1.2;
	// icon row
	const iconKeys = ['icon_phone', 'icon_laptop', 'icon_watch', 'icon_headphones', 'icon_controller', 'icon_camera'] as const;
	const TI = T1 + 0.5;

	// high-five: Hamza steps in, Citybot flies in so their hands actually meet
	const H5 = L7.end + 0.06;
	const appr = ease(t, H5 - 0.42, H5 - 0.02, 0, 1, Easing.inOut(Easing.cubic));
	const hx = lay.hamza.x0 + (lay.hamza.x1 - lay.hamza.x0) * appr;
	const M = toScreen(HIGH_FIVE_HAND, lay.hamza.x1, lay.hamza.y, lay.hamza.s, 500);
	const botX1 = M.x - BOT_FIVE_HAND.x * lay.bot.s;
	const hover1 = BOT_FIVE_HAND.y - (M.y - lay.bot.y) / lay.bot.s - 220;
	const hover = 22 + 10 * Math.sin(t * 2 * Math.PI * 0.7) * (1 - appr) + (hover1 - 22) * appr;
	const bx = lay.bot.x0 + (botX1 - lay.bot.x0) * appr;
	const impact = pop(t, H5);
	const after = t > H5;

	return (
		<Camera shake={shakeAt(t, S, sq ? 10 : 16)} ox={540} oy={sq ? 540 : 960}>
			<BrandWorld width={W} height={H} gridShift={t * 18} />
			{/* impact ring */}
			{ring < 1 ? (
				<svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
					<circle cx={W / 2} cy={city.top + city.height / 2} r={ring * W * 0.8} fill="none" stroke="#FFFFFF" strokeWidth={30 * (1 - ring)} opacity={0.7 * (1 - ring)} />
				</svg>
			) : null}
			<div style={{ position: 'absolute', left: city.left, top: city.top, transform: `scale(${slam})`, transformOrigin: '50% 60%' }}>
				<LogoPart part="city" width={city.width} />
			</div>
			<div style={{ position: 'absolute', left: sm.left, top: sm.top, width: sm.width, height: sm.height, clipPath: `inset(0 ${Math.max(0, sm.width - revealPx)}px 0 0)` }}>
				<LogoPart part="storema" width={sm.width} />
			</div>
			{cursorOn ? <div style={{ position: 'absolute', left: sm.left + revealPx + 6, top: sm.top, width: 8 * k * 1.4, height: sm.height, background: '#FFFFFF', borderRadius: 3 }} /> : null}
			{iconKeys.map((key, i) => {
				const p = place(LOGO.parts[key]);
				const s = pop(t, TI + i * 0.07);
				return s > 0 ? (
					<div key={key} style={{ position: 'absolute', left: p.left, top: p.top, transform: `scale(${s})`, transformOrigin: '50% 100%' }}>
						<LogoPart part={key} width={p.width} />
					</div>
				) : null;
			})}
			{/* tagline */}
			<div style={{ position: 'absolute', left: 0, width: W, top: lay.tagline.y, display: 'flex', justifyContent: 'center', gap: lay.tagline.size * 0.3, direction: 'rtl' }}>
				{[
					{ text: 'الأصلي', t0: w('L7', 2) },
					{ text: 'ديما', t0: w('L7', 3) },
				].map((wd) => {
					const s = pop(t, wd.t0);
					return s > 0 ? (
						<div key={wd.text} style={{ transform: `translateY(${(1 - s) * 30}px) scale(${s})` }}>
							<KText size={lay.tagline.size} arabic style={{ fontFamily: ARABIC }}>
								{wd.text}
							</KText>
						</div>
					) : null;
				})}
			</div>
			<Hamza
				x={hx}
				y={lay.hamza.y}
				scale={lay.hamza.s}
				expr="happy"
				mouth={mouthAt(t, 'hamza')}
				blink={t < HOLD_FROM - 0.3 ? blinkAt(t, 'hamza') : 0}
				breathe={breatheAt(t)}
				squash={squashAt(t, H5, 0.07)}
				look={after ? { x: 0.7, y: -0.2 } : { x: 0, y: 0 }}
				headTilt={trackN(t, [
					[S, 0],
					[H5 - 0.2, 0],
					[H5, 6],
				])}
				handR={track(t, [
					[S, { x: 104, y: 196 }],
					[H5 - 0.45, { x: 104, y: 196 }],
					[H5 - 0.02, HIGH_FIVE_HAND],
				])}
				handKindR={t > H5 - 0.4 ? 'open' : 'fist'}
				handL={track(t, [
					[S, { x: -104, y: 196 }],
					[w('L7', 2), { x: -104, y: 196 }],
					[w('L7', 2) + 0.25, { x: -138, y: 8 }],
				])}
				handKindL={t > w('L7', 2) ? 'thumb' : 'fist'}
			/>
			<Citybot
				x={bx}
				y={lay.bot.y}
				scale={lay.bot.s}
				hover={hover}
				thrust={0.6 + 0.2 * Math.sin(t * 17)}
				expr={after ? 'laughing' : 'proud'}
				mouth={after ? undefined : mouthAt(t, 'citybot')}
				blink={t < HOLD_FROM - 0.3 ? blinkAt(t, 'citybot') : 0}
				squash={squashAt(t, H5, 0.08)}
				look={after ? { x: -0.7, y: -0.2 } : { x: 0, y: 0 }}
				headTilt={after ? -6 : 3 * Math.sin(t * 2.4)}
				handL={track(t, [
					[S, { x: -80, y: 52 }],
					[H5 - 0.45, { x: -80, y: 52 }],
					[H5 - 0.02, BOT_FIVE_HAND],
				])}
				handKindL={t > H5 - 0.4 ? 'open' : 'fist'}
				handR={{ x: 80, y: 52 }}
			/>
			{/* high-five spark */}
			{impact > 0 ? (
				<svg width={150} height={150} viewBox="-110 -110 220 220" style={{ position: 'absolute', left: M.x - 75, top: M.y - 75, opacity: Math.max(0, 1 - (t - H5) * 1.4), transform: `scale(${impact})` }}>
					{Array.from({ length: 8 }).map((_, i) => (
						<path key={i} d="M 0 -40 L 0 -95" stroke="#FFFFFF" strokeWidth={12} strokeLinecap="round" transform={`rotate(${i * 45})`} />
					))}
					<path d="M 0 -36 L 10 -10 L 36 0 L 10 10 L 0 36 L -10 10 L -36 0 L -10 -10 Z" fill="#FFF5B0" />
				</svg>
			) : null}
		</Camera>
	);
};
