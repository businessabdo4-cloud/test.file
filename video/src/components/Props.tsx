import React from 'react';
import { Img, staticFile } from 'remotion';
import { ARABIC, C, LATIN } from '../brand';
import { LOGO, PRODUCTS, ProductColor, ProductSide } from '../data';

export type Model = 'iphone-18-pro-max' | 'iphone-18-pro';
export const MODEL_NAME: Record<Model, string> = { 'iphone-18-pro-max': 'iPhone 18 Pro Max', 'iphone-18-pro': 'iPhone 18 Pro' };

/** Finishes confirmed on apple.com (search, Oct 2026). Hex values are approximate until sampled from the official images. */
export const COLORS: { key: ProductColor; name: string; hex: string }[] = [
	{ key: 'black', name: 'Black', hex: '#2B2B2E' },
	{ key: 'silver', name: 'Silver', hex: '#DCDDE0' },
	{ key: 'glacier', name: 'Glacier', hex: '#B9D7EA' },
	{ key: 'burgundy', name: 'Burgundy', hex: '#6B1F33' },
];

/** Body heights from Apple's tech specs (apple.com/iphone-18-pro/specs) — used to keep on-screen sizes honest. */
export const HEIGHT_MM: Record<Model, number> = { 'iphone-18-pro-max': 163.4, 'iphone-18-pro': 150.0 };

export const productSrc = (m: Model, c: ProductColor, s: ProductSide) => PRODUCTS[m]?.[c]?.[s];
export const hasColor = (m: Model, c: ProductColor) => Boolean(productSrc(m, c, 'pair') || productSrc(m, c, 'back') || productSrc(m, c, 'front'));
export const hasAnyImage = (m: Model) => COLORS.some((c) => hasColor(m, c.key));
/** The ad needs a real image of each model in its hero colour (burgundy); extra colours are optional. */
export const PRODUCTS_READY = hasColor('iphone-18-pro-max', 'burgundy') && hasColor('iphone-18-pro', 'burgundy');
/** Colour to show for a model during the colour run: only colours we have real images for (placeholders cycle freely). */
export const colorFor = (m: Model, wanted: ProductColor, hero: ProductColor = 'burgundy'): ProductColor => (!hasAnyImage(m) || hasColor(m, wanted) ? wanted : hero);

/**
 * Official product image from assets/products/manifest.json. Until the official Apple images are downloaded,
 * a deliberately obvious placeholder card is drawn instead (never a fake phone render).
 */
export const ProductImage: React.FC<{ model: Model; color: ProductColor; side: ProductSide; height: number; style?: React.CSSProperties }> = ({ model, color, side, height, style }) => {
	const src = PRODUCTS[model]?.[color]?.[side];
	if (src) {
		return <Img src={staticFile(src)} style={{ height, width: 'auto', display: 'block', filter: 'drop-shadow(0 24px 30px rgba(0,0,20,0.35))', ...style }} />;
	}
	const c = COLORS.find((x) => x.key === color)!;
	const w = height * 0.49;
	const dark = color === 'black' || color === 'burgundy';
	return (
		<div
			style={{
				width: w,
				height,
				borderRadius: height * 0.11,
				border: `${Math.max(3, height * 0.008)}px dashed rgba(255,255,255,0.95)`,
				background: `repeating-linear-gradient(135deg, ${c.hex} 0 ${height * 0.04}px, ${c.hex}E0 ${height * 0.04}px ${height * 0.08}px)`,
				boxShadow: '0 24px 40px rgba(0,0,30,0.3)',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				gap: height * 0.025,
				color: dark ? '#FFFFFF' : '#16206B',
				textAlign: 'center',
				fontFamily: LATIN,
				...style,
			}}
		>
			<div style={{ fontWeight: 900, fontSize: height * 0.062, lineHeight: 1.05, padding: '0 8%' }}>{MODEL_NAME[model]}</div>
			<div style={{ fontWeight: 800, fontSize: height * 0.035, opacity: 0.85 }}>{c.name} · {side}</div>
			<div style={{ fontWeight: 800, fontSize: height * 0.03, marginTop: height * 0.03, padding: '4px 10px', borderRadius: 8, background: 'rgba(0,0,0,0.35)', color: '#fff' }}>
				OFFICIAL IMAGE PENDING
			</div>
		</div>
	);
};

export const Swatch: React.FC<{ color: (typeof COLORS)[number]; size: number; selected?: boolean; showName?: boolean }> = ({ color, size, selected, showName = true }) => (
	<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: size * 0.18 }}>
		<div style={{ width: size, height: size, borderRadius: '50%', background: color.hex, border: `${size * 0.08}px solid #FFFFFF`, boxShadow: selected ? `0 0 0 ${size * 0.08}px ${C.cyan}, 0 8px 18px rgba(0,0,40,0.35)` : '0 8px 18px rgba(0,0,40,0.3)' }} />
		{showName ? <div style={{ fontFamily: LATIN, fontWeight: 800, fontSize: size * 0.32, color: '#FFFFFF', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>{color.name}</div> : null}
	</div>
);

type LogoKey = keyof typeof LOGO.parts;
/** A white piece of the real City Store logo (keyed from assets/logo.png). */
export const LogoPart: React.FC<{ part: LogoKey; width?: number; height?: number; style?: React.CSSProperties }> = ({ part, width, height, style }) => {
	const p = LOGO.parts[part];
	const w = width ?? (height ? (height * p.w) / p.h : p.w);
	const h = height ?? (w * p.h) / p.w;
	return <Img src={staticFile(`logo/${part}.png`)} style={{ width: w, height: h, display: 'block', ...style }} />;
};

export const InstagramIcon: React.FC<{ size: number }> = ({ size }) => (
	<svg width={size} height={size} viewBox="0 0 100 100">
		<defs>
			<radialGradient id="ig-g" cx="0.3" cy="1.07" r="1.2">
				<stop offset="0" stopColor="#FEDA75" />
				<stop offset="0.25" stopColor="#FA7E1E" />
				<stop offset="0.5" stopColor="#D62976" />
				<stop offset="0.75" stopColor="#962FBF" />
				<stop offset="1" stopColor="#4F5BD5" />
			</radialGradient>
		</defs>
		<rect x={2} y={2} width={96} height={96} rx={28} fill="url(#ig-g)" />
		<rect x={22} y={22} width={56} height={56} rx={17} fill="none" stroke="#fff" strokeWidth={7} />
		<circle cx={50} cy={50} r={13} fill="none" stroke="#fff" strokeWidth={7} />
		<circle cx={67} cy={33} r={4.5} fill="#fff" />
	</svg>
);

export const FacebookIcon: React.FC<{ size: number }> = ({ size }) => (
	<svg width={size} height={size} viewBox="0 0 100 100">
		<circle cx={50} cy={50} r={48} fill="#1877F2" />
		<path d="M 56 98 L 56 62 L 68 62 L 70 48 L 56 48 L 56 39 C 56 35 58 32 64 32 L 70 32 L 70 20 C 67 19.5 62 19 58 19 C 47 19 41 25.5 41 37 L 41 48 L 29 48 L 29 62 L 41 62 L 41 97 Z" fill="#fff" />
	</svg>
);

/** City Store gift box: open = 0 closed … 1 lid flown off. */
export const CityBox: React.FC<{ size: number; open: number; lidAngle?: number }> = ({ size, open, lidAngle = 0 }) => {
	return (
		<svg width={size * 1.2} height={size * 1.25} viewBox="-30 -120 360 375" style={{ overflow: 'visible' }}>
			<defs>
				<linearGradient id="box-g" x1="0" y1="0" x2="1" y2="0">
					<stop offset="0" stopColor={C.blue} />
					<stop offset="0.5" stopColor={C.mid} />
					<stop offset="1" stopColor={C.cyan} />
				</linearGradient>
			</defs>
			<ellipse cx={150} cy={238} rx={150} ry={14} fill="#0B1240" opacity={0.2} />
			{/* body */}
			<path d="M 10 70 L 290 70 L 280 232 L 20 232 Z" fill="url(#box-g)" stroke={C.navy} strokeWidth={6} strokeLinejoin="round" />
			<path d="M 10 70 L 290 70 L 288 96 L 12 96 Z" fill="#000" opacity={0.18} />
			<image href={staticFile('logo/full.png')} x={78} y={112} width={144} height={102} />
			<path d="M 230 70 L 222 232" stroke="#fff" strokeWidth={4} opacity={0.18} />
			{/* inside glow when open */}
			{open > 0 ? <ellipse cx={150} cy={70} rx={130} ry={16} fill="#E9FBFF" opacity={Math.min(1, open * 2)} /> : null}
			{/* lid */}
			<g transform={`translate(${150 + open * 120} ${70 - open * 230}) rotate(${lidAngle}) scale(${1 - open * 0.15})`} opacity={1 - Math.max(0, open - 0.6) * 2.5}>
				<rect x={-150} y={-44} width={300} height={48} rx={10} fill="url(#box-g)" stroke={C.navy} strokeWidth={6} />
				<rect x={-26} y={-44} width={52} height={48} fill="#FFFFFF" opacity={0.9} />
				<path d="M 0 -44 C -40 -100 -90 -80 -60 -50 C -45 -38 -20 -44 0 -44 C 20 -44 45 -38 60 -50 C 90 -80 40 -100 0 -44 Z" fill="#FFFFFF" stroke={C.navy} strokeWidth={5} strokeLinejoin="round" />
			</g>
			<rect x={124} y={70} width={52} height={162} fill="#FFFFFF" opacity={0.9} />
			<path d="M 124 70 L 124 232 M 176 70 L 176 232" stroke={C.navy} strokeWidth={3} opacity={0.3} />
		</svg>
	);
};

/** Rotating light rays + glow used for reveals. */
export const LightBurst: React.FC<{ size: number; rot: number; opacity: number; color?: string }> = ({ size, rot, opacity, color = '#FFFFFF' }) => (
	<svg width={size} height={size} viewBox="-100 -100 200 200" style={{ opacity, overflow: 'visible' }}>
		<defs>
			<radialGradient id="lb-g">
				<stop offset="0" stopColor={color} stopOpacity={0.9} />
				<stop offset="0.45" stopColor={color} stopOpacity={0.25} />
				<stop offset="1" stopColor={color} stopOpacity={0} />
			</radialGradient>
		</defs>
		<g transform={`rotate(${rot})`}>
			{Array.from({ length: 14 }).map((_, i) => (
				<path key={i} d="M 0 0 L -9 -100 L 9 -100 Z" fill={color} opacity={0.16} transform={`rotate(${(i * 360) / 14})`} />
			))}
		</g>
		<circle r={70} fill="url(#lb-g)" />
	</svg>
);

/** Big kinetic Latin title. */
export const KText: React.FC<{ children: React.ReactNode; size: number; color?: string; glow?: string; style?: React.CSSProperties; arabic?: boolean }> = ({ children, size, color = '#FFFFFF', glow = 'rgba(0,30,120,0.45)', style, arabic }) => (
	<div style={{ fontFamily: arabic ? ARABIC : LATIN, fontWeight: 900, fontSize: size, color, lineHeight: 1.05, textShadow: `0 6px 0 rgba(10,20,90,0.25), 0 0 30px ${glow}`, whiteSpace: 'nowrap', direction: arabic ? 'rtl' : 'ltr', ...style }}>
		{children}
	</div>
);

/** Corner badge shown while official product images are still placeholders. */
export const PreviewBadge: React.FC<{ show: boolean; top: number }> = ({ show, top }) =>
	show ? (
		<div style={{ position: 'absolute', left: 24, top, fontFamily: LATIN, fontWeight: 800, fontSize: 20, color: '#fff', background: 'rgba(200,30,60,0.85)', padding: '6px 12px', borderRadius: 8, letterSpacing: 1 }}>
			PREVIEW · official product images pending
		</div>
	) : null;
