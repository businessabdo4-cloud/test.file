import React from 'react';
import { AbsoluteFill } from 'remotion';
import { ARABIC, C, LATIN } from '../brand';
import { Hamza, HamzaPose } from '../characters/Hamza';
import { Citybot, CitybotPose } from '../characters/Citybot';
import { VISEME_KEYS, VISEMES } from '../characters/Mouth';
import { Street } from '../backgrounds/Street';
import { BrandWorld } from '../backgrounds/BrandWorld';

const Label: React.FC<{ x: number; y: number; children: React.ReactNode; size?: number; color?: string; w?: number; pill?: boolean }> = ({ x, y, children, size = 24, color = '#3B2A20', w = 300, pill }) => (
	<div style={{ position: 'absolute', left: x - w / 2, top: y, width: w, display: 'flex', justifyContent: 'center' }}>
		<span style={{ fontFamily: LATIN, fontWeight: 800, fontSize: size, color, ...(pill ? { background: '#FFFFFF', borderRadius: 999, padding: '2px 14px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' } : {}) }}>{children}</span>
	</div>
);

const Title: React.FC<{ en: string; ar: string; color: string; sub: string }> = ({ en, ar, color, sub }) => (
	<div style={{ position: 'absolute', left: 60, top: 36, right: 60, display: 'flex', alignItems: 'baseline', gap: 24 }}>
		<span style={{ fontFamily: LATIN, fontWeight: 900, fontSize: 52, color }}>{en}</span>
		<span style={{ fontFamily: ARABIC, fontWeight: 800, fontSize: 52, color, direction: 'rtl' }}>{ar}</span>
		<span style={{ fontFamily: LATIN, fontWeight: 800, fontSize: 22, color: '#8A7565', marginLeft: 'auto' }}>{sub}</span>
	</div>
);

const HAMZA_POSES: { label: string; pose: HamzaPose }[] = [
	{ label: 'Front · neutral', pose: {} },
	{
		label: 'Worried · head in hand',
		pose: { expr: 'worried', headTilt: -7, look: { x: 0.5, y: 0.8 }, handL: { x: -70, y: -150 }, handKindL: 'open', handR: { x: 56, y: 96 }, held: { kind: 'cracked', offset: { x: -18, y: -46 }, angle: -14 } },
	},
	{ label: 'Shocked', pose: { expr: 'shocked', handL: { x: -118, y: -70 }, handR: { x: 118, y: -70 }, handKindL: 'open', handKindR: 'open', headNod: -4 } },
	{ label: 'Amazed · jaw drop', pose: { expr: 'amazed', jawDrop: 1, handL: { x: -176, y: 40 }, handR: { x: 176, y: 40 }, handKindL: 'open', handKindR: 'open', headNod: 6 } },
	{ label: 'Happy · convinced', pose: { expr: 'happy', headTilt: 6, handR: { x: 136, y: 10 }, handKindR: 'thumb', lean: 2 } },
];

const CITYBOT_POSES: { label: string; pose: CitybotPose }[] = [
	{ label: 'Front · neutral', pose: { hover: 24 } },
	{ label: 'Confident', pose: { expr: 'confident', hover: 24, handL: { x: -80, y: 52 }, handR: { x: 80, y: 52 }, headTilt: -4 } },
	{ label: 'Wink · presenting', pose: { expr: 'wink', hover: 28, handR: { x: 146, y: -40 }, handKindR: 'open', headTilt: 6 } },
	{ label: 'Proud', pose: { expr: 'proud', hover: 34, handL: { x: -80, y: 52 }, handR: { x: 80, y: 52 }, headTilt: -8 } },
	{ label: 'Laughing', pose: { expr: 'laughing', hover: 20, handL: { x: -34, y: 74 }, handR: { x: 34, y: 74 }, headTilt: 9 } },
];

export const SheetHamza: React.FC = () => (
	<AbsoluteFill style={{ background: '#FFF4E6' }}>
		<Title en="HAMZA" ar="حمزة" color="#C55A27" sub="original character · rigged SVG · 9 mouth shapes" />
		{HAMZA_POSES.map(({ label, pose }, i) => (
			<React.Fragment key={label}>
				<Hamza x={210 + i * 375} y={690} scale={0.66} {...pose} />
				<Label x={210 + i * 375} y={706}>
					{label}
				</Label>
			</React.Fragment>
		))}
		<div style={{ position: 'absolute', left: 60, top: 760, right: 60, height: 2, background: '#E9D6BF' }} />
		{VISEME_KEYS.map((v, i) => (
			<React.Fragment key={v}>
				<Hamza crop="head" x={155 + i * 201} y={1050} scale={0.6} mouth={VISEMES[v]} expr="neutral" />
				<Label x={155 + i * 201} y={820} size={22} w={180} pill>
					{v === 'X' ? 'X · rest' : v}
				</Label>
			</React.Fragment>
		))}
	</AbsoluteFill>
);

export const SheetCitybot: React.FC = () => (
	<AbsoluteFill style={{ background: '#EEF4FF' }}>
		<Title en="CITYBOT" ar="سيتي بوت" color={C.blue} sub="original character · hovers · face-screen reactions" />
		{CITYBOT_POSES.map(({ label, pose }, i) => (
			<React.Fragment key={label}>
				<Citybot x={210 + i * 375} y={690} scale={0.92} {...pose} />
				<Label x={210 + i * 375} y={706} color={C.navy}>
					{label}
				</Label>
			</React.Fragment>
		))}
		<div style={{ position: 'absolute', left: 60, top: 760, right: 60, height: 2, background: '#D3DEEE' }} />
		{(['check', 'heart', 'logo'] as const).map((icon, i) => (
			<React.Fragment key={icon}>
				<Citybot crop="head" x={120 + i * 150} y={1020} scale={0.6} icon={icon} iconAmount={1} />
				<Label x={120 + i * 150} y={1030} size={20} w={140} color={C.navy} pill>
					{icon}
				</Label>
			</React.Fragment>
		))}
		{VISEME_KEYS.map((v, i) => (
			<React.Fragment key={v}>
				<Citybot crop="head" x={600 + i * 150} y={1020} scale={0.6} mouth={VISEMES[v]} expr="happy" />
				<Label x={600 + i * 150} y={1030} size={20} w={140} color={C.navy} pill>
					{v === 'X' ? 'X · rest' : v}
				</Label>
			</React.Fragment>
		))}
	</AbsoluteFill>
);

/** Scene 1 framing: warm street, Hamza worried over his cracked phone. */
export const StreetStill: React.FC<{ square?: boolean }> = ({ square }) => {
	const W = 1080;
	const H = square ? 1080 : 1920;
	const G = square ? 860 : 1480;
	return (
		<AbsoluteFill>
			<Street width={W} height={H} ground={G} />
			<Hamza
				x={square ? 560 : 540}
				y={G + (square ? 110 : 120)}
				scale={square ? 0.98 : 1.12}
				{...HAMZA_POSES[1].pose}
			/>
		</AbsoluteFill>
	);
};

/** The visual switch: brand gradient + grid takes over once Citybot appears. */
export const BrandStill: React.FC = () => (
	<AbsoluteFill>
		<BrandWorld width={1080} height={1920} />
		<Hamza x={330} y={1560} scale={1.0} expr="amazed" handL={{ x: -150, y: 20 }} handR={{ x: 150, y: 20 }} handKindL="open" handKindR="open" />
		<Citybot x={790} y={1420} scale={1.25} expr="wink" hover={40} handR={{ x: 146, y: -40 }} handKindR="open" headTilt={6} />
	</AbsoluteFill>
);
