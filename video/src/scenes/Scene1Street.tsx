import React from 'react';
import { Easing } from 'remotion';
import { Street } from '../backgrounds/Street';
import { Hamza } from '../characters/Hamza';
import { ease } from '../acting';
import { SCENES } from '../data';
import { Camera, pick, toScreen, useFmt, useT } from './common';
import { hamzaStreet } from './poses';

export const STREET_LAYOUT = (sq: boolean) => pick(sq, { G: 1480, hx: 540, hy: 1600, hs: 1.12, oy: 1000 }, { G: 860, hx: 560, hy: 970, hs: 0.98, oy: 430 });
export const streetZoom = (t: number) => 1 + 0.06 * ease(t, 0, SCENES.s1.end, 0, 1, Easing.inOut(Easing.quad));

/** Where the glowing phone is on screen at the burst — Citybot comes out of it and the brand world grows from it. */
export const burstOrigin = (sq: boolean) => {
	const L = STREET_LAYOUT(sq);
	const p = toScreen({ x: 156 - 18, y: -20 - 46 }, L.hx, L.hy, L.hs, 500);
	const z = streetZoom(SCENES.s1.end);
	return { x: 540 + (p.x - 540) * z, y: L.oy + (p.y - L.oy) * z };
};

/** The street as it looks at time t (scene 1 and the start of scene 2's wipe). */
export const StreetShot: React.FC<{ t: number; hideHamza?: boolean }> = ({ t, hideHamza }) => {
	const { W, H, sq } = useFmt();
	const L = STREET_LAYOUT(sq);
	return (
		<Camera zoom={streetZoom(t)} ox={540} oy={L.oy}>
			<Street width={W} height={H} ground={L.G} lanternGlow={0.72 + 0.12 * Math.sin(t * 3.1)} />
			{hideHamza ? null : <Hamza x={L.hx} y={L.hy} scale={L.hs} {...hamzaStreet(t)} />}
		</Camera>
	);
};

/** SCENE 1 — L1 — warm street corner: Hamza worried over his cracked fake phone. */
export const Scene1Street: React.FC<{ from: number }> = ({ from }) => {
	const t = useT(from);
	return <StreetShot t={t} />;
};
