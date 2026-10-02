import React from 'react';
import { LATIN } from '../brand';

const INK = '#4A3226';

const crenels = (x0: number, x1: number, y: number, w = 26, h = 18) => {
	let d = `M ${x0} ${y}`;
	for (let x = x0; x < x1; x += w * 2) {
		const xe = Math.min(x + w, x1);
		d += ` L ${x} ${y - h} L ${xe} ${y - h} L ${xe} ${y}`;
		d += ` L ${Math.min(xe + w, x1)} ${y}`;
	}
	return d + ` L ${x1} ${y + 4} L ${x0} ${y + 4} Z`;
};

const horseshoe = (cx: number, cy: number, r: number, ground: number) => {
	const dx = r * 0.94;
	const dy = r * 0.34;
	return `M ${cx - dx} ${ground} L ${cx - dx} ${cy + dy} A ${r} ${r} 0 1 1 ${cx + dx} ${cy + dy} L ${cx + dx} ${ground} Z`;
};

const archWindow = (x: number, y: number, w: number, h: number) =>
	`M ${x} ${y + h} L ${x} ${y + w / 2} A ${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2} L ${x + w} ${y + h} Z`;

/** Warm "real world" street corner. All geometry hangs off `ground` so the same set works for 9:16 and 1:1. */
export const Street: React.FC<{ width: number; height: number; ground: number; lanternGlow?: number; sunShift?: number }> = ({ width, height, ground: G, lanternGlow = 0.8, sunShift = 0 }) => {
	const W = width;
	const aTop = G - 1100;
	const bTop = G - 980;
	return (
		<svg width={W} height={height} viewBox={`0 0 ${W} ${height}`} style={{ position: 'absolute', inset: 0 }}>
			<defs>
				<linearGradient id="st-sky" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0" stopColor="#FFE9C7" />
					<stop offset="1" stopColor="#F8BE8A" />
				</linearGradient>
				<radialGradient id="st-sun" cx="0.5" cy="0.5" r="0.5">
					<stop offset="0" stopColor="#FFF6DD" stopOpacity={0.95} />
					<stop offset="1" stopColor="#FFE2B0" stopOpacity={0} />
				</radialGradient>
				<radialGradient id="st-lamp" cx="0.5" cy="0.5" r="0.5">
					<stop offset="0" stopColor="#FFE39A" stopOpacity={0.9} />
					<stop offset="1" stopColor="#FFC766" stopOpacity={0} />
				</radialGradient>
				<pattern id="st-zellige" width={72} height={72} patternUnits="userSpaceOnUse" x={0} y={G - 250}>
					<rect width={72} height={72} fill="#F3E6CF" />
					<path d="M 0 0 L 72 0 L 72 72 L 0 72 Z" fill="none" stroke="#DCC7A6" strokeWidth={1.2} />
					<g transform="translate(36 36)">
						<rect x={-17} y={-17} width={34} height={34} fill="#1F5FA8" />
						<rect x={-17} y={-17} width={34} height={34} fill="#1F5FA8" transform="rotate(45)" />
						<circle r={9} fill="#F3E6CF" />
						<circle r={5} fill="#D9893B" />
					</g>
					{[
						[0, 0],
						[72, 0],
						[0, 72],
						[72, 72],
					].map(([x, y], i) => (
						<rect key={i} x={x - 8} y={y - 8} width={16} height={16} fill="#2E8B6A" transform={`rotate(45 ${x} ${y})`} />
					))}
					{[
						[36, 0],
						[0, 36],
						[72, 36],
						[36, 72],
					].map(([x, y], i) => (
						<circle key={`c${i}`} cx={x} cy={y} r={4} fill="#D9893B" />
					))}
				</pattern>
				<linearGradient id="st-glass" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stopColor="#6E5A54" />
					<stop offset="1" stopColor="#4B3B37" />
				</linearGradient>
				<linearGradient id="st-shade" x1="0" y1="0" x2="1" y2="0">
					<stop offset="0" stopColor="#5B2E1A" stopOpacity={0.22} />
					<stop offset="1" stopColor="#5B2E1A" stopOpacity={0} />
				</linearGradient>
			</defs>

			{/* sky + sun */}
			<rect width={W} height={height} fill="url(#st-sky)" />
			<circle cx={860 + sunShift} cy={aTop - 40} r={260} fill="url(#st-sun)" />

			{/* distant minaret + palm (hazy) */}
			<g opacity={0.5} fill="#E5A27C">
				<rect x={700} y={aTop - 330} width={96} height={460} />
				<path d={crenels(696, 800, aTop - 330, 13, 14)} />
				<rect x={728} y={aTop - 410} width={40} height={70} />
				<path d={crenels(726, 770, aTop - 410, 8, 10)} />
				<circle cx={748} cy={aTop - 432} r={10} />
				<line x1={748} y1={aTop - 444} x2={748} y2={aTop - 470} stroke="#E5A27C" strokeWidth={4} />
				<path d={archWindow(733, aTop - 270, 30, 54)} fill="#D88D66" />
				<path d={archWindow(733, aTop - 160, 30, 54)} fill="#D88D66" />
			</g>
			<g opacity={0.45}>
				<path d={`M 300 ${aTop + 40} C 310 ${aTop - 80} 290 ${aTop - 160} 312 ${aTop - 250}`} stroke="#B9875E" strokeWidth={14} fill="none" strokeLinecap="round" />
				{[-165, -130, -95, -55, -20, 15, 50].map((a, i) => {
					const r = (a * Math.PI) / 180;
					const L = 130 - Math.abs(a + 60) * 0.25;
					const cx = 312;
					const cy = aTop - 252;
					const tx = cx + Math.cos(r) * L;
					const ty = cy + Math.sin(r) * L * 0.55 + 45;
					const mx = cx + Math.cos(r) * L * 0.5;
					const my = cy + Math.sin(r) * L * 0.5 - 22;
					return <path key={i} d={`M ${cx} ${cy} Q ${mx - Math.sin(r) * 16} ${my - 10} ${tx} ${ty} Q ${mx + Math.sin(r) * 6} ${my + 14} ${cx} ${cy} Z`} fill="#B9875E" />;
				})}
			</g>

			{/* building A — ochre house with horseshoe door */}
			<rect x={-10} y={aTop} width={470} height={G - aTop + 10} fill="#E8B27A" />
			<path d={crenels(-10, 460, aTop)} fill="#E8B27A" />
			<rect x={-10} y={aTop + 4} width={470} height={14} fill="#D69A61" />
			<rect x={400} y={aTop} width={60} height={G - aTop} fill="#D69A61" opacity={0.55} />
			<rect x={-10} y={G - 240} width={470} height={240} fill="url(#st-zellige)" />
			<rect x={-10} y={G - 252} width={470} height={14} fill="#F1D9B5" stroke={INK} strokeWidth={3} />
			{/* upper window with grille */}
			<path d={archWindow(110, aTop + 170, 150, 210)} fill="#F4DDBA" stroke={INK} strokeWidth={4} />
			<path d={archWindow(126, aTop + 186, 118, 186)} fill="#3D5F66" />
			<g stroke="#2B211B" strokeWidth={4}>
				{[146, 166, 186, 206, 226].map((x) => (
					<line key={x} x1={x} y1={aTop + 200} x2={x} y2={aTop + 372} />
				))}
				<line x1={126} x2={244} y1={aTop + 270} y2={aTop + 270} />
				<line x1={126} x2={244} y1={aTop + 330} y2={aTop + 330} />
			</g>
			<rect x={100} y={aTop + 380} width={170} height={16} rx={4} fill="#C98A55" stroke={INK} strokeWidth={3} />
			{/* potted plant on the sill */}
			<path d={`M 150 ${aTop + 380} L 156 ${aTop + 352} L 214 ${aTop + 352} L 220 ${aTop + 380} Z`} fill="#C4623C" stroke={INK} strokeWidth={3} />
			<g fill="#4F8F55" stroke={INK} strokeWidth={2.5}>
				<ellipse cx={170} cy={aTop + 336} rx={14} ry={22} transform={`rotate(-25 170 ${aTop + 336})`} />
				<ellipse cx={200} cy={aTop + 334} rx={14} ry={24} transform={`rotate(20 200 ${aTop + 334})`} />
				<ellipse cx={186} cy={aTop + 326} rx={12} ry={24} />
			</g>
			{/* doorway */}
			<path d={horseshoe(215, G - 420, 140, G)} fill="#F4DDBA" stroke={INK} strokeWidth={4} />
			<path d={horseshoe(215, G - 400, 112, G)} fill="#2C7C80" stroke={INK} strokeWidth={4} />
			<g stroke="#1F5C60" strokeWidth={4}>
				{[150, 182, 215, 248, 280].map((x) => (
					<line key={x} x1={x} y1={G - 470} x2={x} y2={G - 6} />
				))}
			</g>
			<g fill="#E2B85C">
				{[0, 1, 2, 3].map((r) =>
					[160, 195, 235, 270].map((x) => <circle key={`${r}-${x}`} cx={x} cy={G - 450 + r * 55} r={4} />),
				)}
			</g>
			<circle cx={246} cy={G - 360} r={12} fill="none" stroke="#C9963B" strokeWidth={5} />
			{/* lantern */}
			<path d={`M 380 ${G - 700} L 430 ${G - 700} L 430 ${G - 690}`} stroke={INK} strokeWidth={5} fill="none" />
			<circle cx={405} cy={G - 610} r={110} fill="url(#st-lamp)" opacity={lanternGlow} />
			<line x1={405} y1={G - 700} x2={405} y2={G - 664} stroke={INK} strokeWidth={3} />
			<path d={`M 388 ${G - 664} L 422 ${G - 664} L 430 ${G - 630} L 420 ${G - 580} L 390 ${G - 580} L 380 ${G - 630} Z`} fill="#FFD27A" stroke="#8A5A1E" strokeWidth={4} strokeLinejoin="round" />
			<path d={`M 396 ${G - 664} L 405 ${G - 680} L 414 ${G - 664} Z M 392 ${G - 580} L 418 ${G - 580} L 405 ${G - 566} Z`} fill="#C9963B" stroke="#8A5A1E" strokeWidth={3} />
			<path d={`M 405 ${G - 660} L 405 ${G - 584} M 384 ${G - 630} L 426 ${G - 630}`} stroke="#C9963B" strokeWidth={3} />

			{/* building B — pink facade with phone shop */}
			<rect x={455} y={bTop} width={640} height={G - bTop + 10} fill="#DE9068" />
			<path d={crenels(455, 1095, bTop)} fill="#DE9068" />
			<rect x={455} y={bTop + 4} width={640} height={14} fill="#C97A55" />
			<rect x={455} y={bTop} width={26} height={G - bTop} fill="#C97A55" />
			<rect x={455} y={G - 240} width={640} height={240} fill="url(#st-zellige)" />
			<rect x={455} y={G - 252} width={640} height={14} fill="#F1D9B5" stroke={INK} strokeWidth={3} />
			{/* satellite dish + AC unit */}
			<g stroke={INK} strokeWidth={3.5}>
				<line x1={980} y1={bTop + 4} x2={994} y2={bTop - 60} />
				<rect x={968} y={bTop - 4} width={26} height={10} rx={3} fill="#EDE7DD" />
				<ellipse cx={1000} cy={bTop - 78} rx={38} ry={30} fill="#EDE7DD" transform={`rotate(-25 1000 ${bTop - 78})`} />
				<rect x={492} y={bTop + 190} width={84} height={56} rx={6} fill="#EDE7DD" />
				<circle cx={518} cy={bTop + 218} r={17} fill="#C9C1B5" />
			</g>
			{/* upper windows with teal shutters + balcony */}
			{[690, 900].map((x) => (
				<g key={x}>
					<path d={archWindow(x - 60, bTop + 80, 120, 190)} fill="#3D5F66" stroke={INK} strokeWidth={4} />
					<path d={`M ${x - 60} ${bTop + 140} L ${x - 104} ${bTop + 130} L ${x - 104} ${bTop + 280} L ${x - 60} ${bTop + 270} Z`} fill="#2C7C80" stroke={INK} strokeWidth={3.5} />
					<path d={`M ${x + 60} ${bTop + 140} L ${x + 104} ${bTop + 130} L ${x + 104} ${bTop + 280} L ${x + 60} ${bTop + 270} Z`} fill="#2C7C80" stroke={INK} strokeWidth={3.5} />
					<rect x={x - 80} y={bTop + 260} width={160} height={14} fill="#B56A47" stroke={INK} strokeWidth={3} />
					<g stroke="#2B211B" strokeWidth={3.5}>
						<line x1={x - 76} y1={bTop + 274} x2={x - 76} y2={bTop + 328} />
						<line x1={x + 76} y1={bTop + 274} x2={x + 76} y2={bTop + 328} />
						<line x1={x - 76} y1={bTop + 328} x2={x + 76} y2={bTop + 328} />
						{[-50, -25, 0, 25, 50].map((o) => (
							<circle key={o} cx={x + o} cy={bTop + 302} r={10} fill="none" />
						))}
					</g>
				</g>
			))}
			{/* shop sign */}
			<rect x={540} y={G - 640} width={470} height={86} rx={10} fill="#2C7C80" stroke={INK} strokeWidth={4} />
			<text x={800} y={G - 582} textAnchor="middle" fontFamily={LATIN} fontWeight={900} fontSize={44} fill="#FFF4E0" letterSpacing={3}>
				TÉLÉPHONIE
			</text>
			<g transform={`translate(588 ${G - 597})`}>
				<rect x={-16} y={-28} width={32} height={56} rx={6} fill="none" stroke="#FFF4E0" strokeWidth={5} />
				<circle cx={0} cy={18} r={3} fill="#FFF4E0" />
			</g>
			{/* striped awning */}
			<clipPath id="st-awn">
				<path d={`M 520 ${G - 540} L 1040 ${G - 540} L 1080 ${G - 440} L 480 ${G - 440} Z`} />
			</clipPath>
			<g clipPath="url(#st-awn)">
				<rect x={470} y={G - 545} width={620} height={110} fill="#F6E3C6" />
				{Array.from({ length: 11 }).map((_, i) => (
					<path key={i} d={`M ${520 + i * 104 - 52} ${G - 540} L ${520 + i * 104} ${G - 540} L ${480 + i * 120 + 60} ${G - 440} L ${480 + i * 120} ${G - 440} Z`} fill="#C8463D" />
				))}
			</g>
			<path d={`M 520 ${G - 540} L 1040 ${G - 540} L 1080 ${G - 440} L 480 ${G - 440} Z`} fill="none" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
			{Array.from({ length: 10 }).map((_, i) => (
				<path key={i} d={`M ${480 + i * 60} ${G - 440} a 30 22 0 0 0 60 0`} fill={i % 2 ? '#F6E3C6' : '#C8463D'} stroke={INK} strokeWidth={3.5} />
			))}
			{/* shop window: shelves with generic boxes and phones */}
			<rect x={530} y={G - 400} width={330} height={250} fill="url(#st-glass)" stroke={INK} strokeWidth={4} />
			<g stroke="#2E2420" strokeWidth={4}>
				<line x1={530} x2={860} y1={G - 320} y2={G - 320} />
				<line x1={530} x2={860} y1={G - 240} y2={G - 240} />
			</g>
			{[
				[548, '#E9C46A'],
				[600, '#7FB3D5'],
				[652, '#F4A261'],
				[740, '#E76F51'],
				[790, '#9AD1B0'],
			].map(([x, c], i) => (
				<rect key={i} x={x as number} y={G - 360} width={40} height={38} rx={3} fill={c as string} opacity={0.85} />
			))}
			{[560, 610, 660, 710, 760, 810].map((x, i) => (
				<rect key={i} x={x} y={G - 300 + (i % 2) * 4} width={22} height={40} rx={5} fill="#232830" stroke="#9AA4AE" strokeWidth={2} />
			))}
			<path d={`M 548 ${G - 392} L 600 ${G - 392} L 548 ${G - 330} Z`} fill="#FFFFFF" opacity={0.12} />
			{/* shop door */}
			<rect x={880} y={G - 400} width={140} height={400} fill="#2C7C80" stroke={INK} strokeWidth={4} />
			<rect x={900} y={G - 380} width={100} height={130} fill="url(#st-glass)" stroke={INK} strokeWidth={3} />
			<circle cx={990} cy={G - 230} r={6} fill="#E2B85C" />

			{/* shop window kickplate */}
			<rect x={530} y={G - 150} width={330} height={150} fill="#B56A47" stroke={INK} strokeWidth={4} />
			<rect x={548} y={G - 130} width={294} height={110} rx={6} fill="none" stroke="#8E4E33" strokeWidth={3} />

			{/* street cat on the doorstep */}
			<g transform={`translate(330 ${G - 4})`} stroke={INK} strokeWidth={3} strokeLinejoin="round">
				<path d="M 34 -6 C 70 -6 74 -40 56 -48" fill="none" stroke="#D98A3D" strokeWidth={9} strokeLinecap="round" />
				<path d="M 34 -6 C 70 -6 74 -40 56 -48" fill="none" strokeWidth={0} />
				<path d="M -26 0 C -30 -40 -18 -66 4 -68 C 28 -66 38 -40 34 0 Z" fill="#E59A4B" />
				<path d="M -14 -64 L -18 -96 L 2 -74 Z M 10 -74 L 28 -96 L 24 -62 Z" fill="#E59A4B" />
				<ellipse cx={4} cy={-72} rx={22} ry={19} fill="#E59A4B" />
				<path d="M -6 -74 q 4 -4 8 0 M 8 -74 q 4 -4 8 0" fill="none" strokeWidth={2.5} />
				<path d="M 2 -64 l 4 3 l 4 -3" fill="none" strokeWidth={2} />
			</g>

			{/* sidewalk + street */}
			<rect x={0} y={G} width={W} height={height - G} fill="#8E7D73" />
			<rect x={0} y={G} width={W} height={170} fill="#D9C4A6" />
			<g stroke="#C4AC8C" strokeWidth={3}>
				{Array.from({ length: 13 }).map((_, i) => (
					<line key={i} x1={i * 90 - 40} y1={G} x2={i * 90 - 80} y2={G + 170} />
				))}
				<line x1={0} x2={W} y1={G + 85} y2={G + 85} />
			</g>
			<rect x={0} y={G + 168} width={W} height={26} fill="#B79D80" />
			<rect x={0} y={G} width={W} height={6} fill="#B79D80" opacity={0.6} />
			<g stroke="#A99A90" strokeWidth={8} strokeDasharray="70 60" opacity={0.6}>
				<line x1={0} x2={W} y1={G + 330} y2={G + 330} />
			</g>

			{/* warm light: soft shade from an off-frame wall + vignette */}
			<path d={`M 0 0 L 300 0 L 0 ${G + 200} Z`} fill="url(#st-shade)" />
			<rect width={W} height={height} fill="#FF9F4A" opacity={0.06} />
		</svg>
	);
};
