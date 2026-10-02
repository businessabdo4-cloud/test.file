import React from 'react';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import data from '../../../assets/pricelists/pricelists.json';
import products from '../../../assets/pricelists/products/products.json';
import { ARABIC, C, LATIN } from '../brand';
import { BrandWorld } from '../backgrounds/BrandWorld';
import { InstagramIcon, LogoPart } from '../components/Props';

type Item = { name: string; note: string; price: number; icon: string };
type Sheet = { id: string; title: string; columns: number; items: Item[] };
const SHEETS = data.sheets as Sheet[];
const PRODUCT_SIZE = products as Record<string, { w: number; h: number }>;

/** "1400" → "1 400" with a no-break space, as on the original sheets. */
const fmtPrice = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');

/** 'AIRPODS (3^e GÉNÉRATION)' → superscript e */
const Name: React.FC<{ text: string }> = ({ text }) => (
	<>{text.split(/\^(\w+)/).map((part, i) => (i % 2 ? <sup key={i} style={{ fontSize: '0.6em', lineHeight: 0 }}>{part}</sup> : part))}</>
);

const Card: React.FC<{ item: Item; w: number; h: number; s: number }> = ({ item, w, h, s }) => {
	const size = PRODUCT_SIZE[item.icon];
	const photoH = h * 0.53;
	const photoW = w * 0.84;
	const k = size ? Math.min(photoW / size.w, photoH / size.h) : 1;
	const disc = Math.min(w * 0.8, photoH * 1.12);
	return (
		<div
			style={{
				width: w,
				height: h,
				borderRadius: 26 * s,
				background: 'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 100%)',
				border: `${2 * s}px solid rgba(255,255,255,0.55)`,
				boxShadow: `0 ${12 * s}px ${28 * s}px rgba(5,15,90,0.22), inset 0 ${1 * s}px 0 rgba(255,255,255,0.4)`,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				padding: `${14 * s}px ${10 * s}px ${14 * s}px`,
				boxSizing: 'border-box',
			}}
		>
			<div style={{ fontFamily: LATIN, fontWeight: 900, fontSize: 21 * s, lineHeight: 1.08, color: '#FFFFFF', textAlign: 'center', minHeight: 2.16 * 21 * s, display: 'flex', alignItems: 'center', letterSpacing: 0.2 * s, textShadow: '0 2px 8px rgba(0,10,80,0.25)' }}>
				<span>
					<Name text={item.name} />
				</span>
			</div>
			<div style={{ fontFamily: LATIN, fontWeight: 800, fontSize: 12.5 * s, color: 'rgba(255,255,255,0.9)', letterSpacing: 0.6 * s, marginTop: 4 * s, textAlign: 'center' }}>{item.note}</div>
			<div style={{ flex: 1, width: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
				<div style={{ position: 'absolute', width: disc, height: disc, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.12) 62%, rgba(255,255,255,0.04) 100%)', border: `${2 * s}px solid rgba(255,255,255,0.28)` }} />
				{size ? (
					<Img
						src={staticFile(`pricelists/products/${item.icon}.png`)}
						style={{ position: 'relative', width: size.w * k, height: size.h * k, filter: `drop-shadow(0 ${10 * s}px ${12 * s}px rgba(0,10,70,0.38))` }}
					/>
				) : null}
			</div>
			<div style={{ background: '#FFFFFF', color: C.blue, fontFamily: LATIN, fontWeight: 900, fontSize: 30 * s, lineHeight: 1, padding: `${8 * s}px ${20 * s}px ${7 * s}px`, borderRadius: 999, boxShadow: `0 ${6 * s}px 0 rgba(10,20,90,0.22)`, whiteSpace: 'nowrap' }}>
				{fmtPrice(item.price)}
				<span style={{ fontSize: 19 * s, marginLeft: 6 * s }}>DH</span>
			</div>
		</div>
	);
};

/** City Store price list: brand gradient + grid, logo, frosted product cards, white price pills, footer. */
export const PriceSheet: React.FC<{ sheet: number; square?: boolean }> = ({ sheet, square }) => {
	const sh = SHEETS[sheet];
	const W = 1080;
	const H = square ? 1080 : 1350;
	const margin = 34;
	const gap = 18;
	const header = square ? 192 : 252;
	const footer = square ? 64 : 82;
	const rows = Math.ceil(sh.items.length / sh.columns);
	const cardW = (W - margin * 2 - gap * (sh.columns - 1)) / sh.columns;
	const cardH = (H - header - footer - margin * 0.5 - gap * (rows - 1)) / rows;
	// content scale: 4-column cards are the reference; larger cards scale type up a little
	const s = Math.min(1.3, Math.min(cardW / 238, cardH / 316)) * (square ? 0.98 : 1);
	const logoW = square ? 215 : 272;
	return (
		<AbsoluteFill>
			<BrandWorld width={W} height={H} />
			<AbsoluteFill style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.28), rgba(255,255,255,0) 55%)' }} />
			{/* header: real City Store wordmark + sheet title */}
			<div style={{ position: 'absolute', top: square ? 24 : 34, left: 0, width: W, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: square ? 6 : 10 }}>
				<LogoPart part="city" width={logoW} />
				<LogoPart part="storema" width={logoW} />
				<div style={{ marginTop: square ? 6 : 10, fontFamily: LATIN, fontWeight: 900, fontSize: square ? 19 : 22, letterSpacing: 3, color: C.blue, background: '#FFFFFF', borderRadius: 999, padding: square ? '5px 20px' : '6px 24px', boxShadow: '0 5px 0 rgba(10,20,90,0.2)' }}>{sh.title}</div>
			</div>
			{/* product grid */}
			<div style={{ position: 'absolute', top: header, left: margin, width: W - margin * 2, display: 'grid', gridTemplateColumns: `repeat(${sh.columns}, ${cardW}px)`, gap }}>
				{sh.items.map((it) => (
					<Card key={it.icon} item={it} w={cardW} h={cardH} s={s} />
				))}
			</div>
			{/* footer */}
			<div style={{ position: 'absolute', left: margin, right: margin, bottom: square ? 14 : 22, height: footer - (square ? 22 : 30), display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#FFFFFF' }}>
				<div style={{ fontFamily: LATIN, fontWeight: 900, fontSize: square ? 22 : 26 }}>citystore.ma</div>
				<div style={{ fontFamily: ARABIC, fontWeight: 900, fontSize: square ? 26 : 32, direction: 'rtl' }}>الأصلي ديما</div>
				<div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: LATIN, fontWeight: 800, fontSize: square ? 20 : 23 }}>
					<InstagramIcon size={square ? 30 : 36} />@citystore.ma
				</div>
			</div>
		</AbsoluteFill>
	);
};
