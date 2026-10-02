import React from 'react';
import { AbsoluteFill } from 'remotion';
import { BrandWorld } from './backgrounds/BrandWorld';
import { Hamza } from './characters/Hamza';
import { Citybot } from './characters/Citybot';
import { VISEMES } from './characters/Mouth';
import { ARABIC, C } from './brand';
import { LightBurst, LogoPart, PRODUCTS_READY, PreviewBadge, ProductImage } from './components/Props';

/** Reel cover 1080×1920 — key elements kept inside the centre 4:5 area (y ≈ 285–1635) used by the profile grid. */
export const Thumbnail: React.FC = () => (
	<AbsoluteFill>
		<BrandWorld width={1080} height={1920} />
		<AbsoluteFill style={{ background: 'radial-gradient(circle at 55% 52%, rgba(255,255,255,0.4), rgba(255,255,255,0) 45%)' }} />
		<div style={{ position: 'absolute', left: 0, right: 0, top: 290, textAlign: 'center', direction: 'rtl', fontFamily: ARABIC, fontWeight: 900, lineHeight: 1.0 }}>
			<div style={{ fontSize: 150, color: '#FFFFFF', textShadow: '0 8px 0 rgba(10,20,90,0.3), 0 0 40px rgba(0,30,120,0.4)' }}>واش</div>
			<div style={{ fontSize: 172, color: C.hamzaTag, textShadow: '0 9px 0 rgba(10,20,90,0.35), 0 0 40px rgba(0,30,120,0.45)', marginTop: -10 }}>أوريجينال؟</div>
		</div>
		<div style={{ position: 'absolute', left: 600, top: 1060, transform: 'translate(-50%, -50%)' }}>
			<LightBurst size={1100} rot={8} opacity={0.9} />
		</div>
		<div style={{ position: 'absolute', left: 610, top: 1050, transform: 'translate(-50%, -50%) rotate(9deg)' }}>
			<ProductImage model="iphone-18-pro-max" color="burgundy" side="back" height={640} />
		</div>
		<Citybot x={880} y={1660} scale={1.2} expr="wink" hover={30} handL={{ x: -140, y: -40 }} handKindL="open" handR={{ x: 80, y: 52 }} headTilt={-8} />
		<Hamza crop="head" x={290} y={1640} scale={2.45} expr="shocked" exprTo="amazed" exprT={0.5} jawDrop={0.75} mouth={VISEMES.E} look={{ x: 0.7, y: -0.5 }} headTilt={-6} />
		<div style={{ position: 'absolute', left: 735, top: 1690 }}>
			<LogoPart part="full" width={290} />
		</div>
		<PreviewBadge show={!PRODUCTS_READY} top={1880} />
	</AbsoluteFill>
);
