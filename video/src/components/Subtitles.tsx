import React from 'react';
import { ARABIC, C } from '../brand';
import { LINES, Line } from '../data';
import { ease } from '../acting';
import { groupSegs, segment } from './bidi';

const TAGS: Record<'hamza' | 'citybot', { name: string; bg: string; fg: string }> = {
	hamza: { name: 'حمزة', bg: C.hamzaTag, fg: '#3A2600' },
	citybot: { name: 'سيتي بوت', bg: C.citybotTag, fg: '#04205A' },
};

const activeLine = (t: number): Line | undefined => {
	for (let i = 0; i < LINES.length; i++) {
		const l = LINES[i];
		const next = LINES[i + 1];
		const until = next ? Math.min(l.end + 0.35, next.start - 0.12) : l.end + 0.6;
		if (t >= l.start - 0.12 && t <= until) return l;
	}
	return undefined;
};

/** Burned-in Darija subtitles: script text (never ASR), RTL, speaker tag, word-by-word highlight. */
export const Subtitles: React.FC<{ t: number; top: number; left: number; width: number; fontSize: number; only?: string }> = ({ t, top, left, width, fontSize, only }) => {
	const l = activeLine(t);
	if (!l || (only && l.id !== only)) return null;
	const idx = LINES.indexOf(l);
	const next = LINES[idx + 1];
	const until = next ? Math.min(l.end + 0.35, next.start - 0.12) : l.end + 0.6;
	const inK = ease(t, l.start - 0.12, l.start + 0.06, 0, 1);
	const outK = ease(t, until - 0.12, until, 1, 0);
	const op = Math.min(inK, outK);
	const fs = l.text.length > 40 ? fontSize * 0.88 : fontSize;
	const speakers: ('hamza' | 'citybot')[] = l.speaker === 'both' ? ['hamza', 'citybot'] : [l.speaker];
	const hl = l.speaker === 'both' ? null : TAGS[l.speaker].bg;
	return (
		<div style={{ position: 'absolute', left, top, width, opacity: op, transform: `translateY(${(1 - inK) * 18}px)`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
			<div style={{ display: 'flex', gap: 10, direction: 'rtl' }}>
				{speakers.map((s) => (
					<span key={s} style={{ fontFamily: ARABIC, fontWeight: 800, fontSize: fs * 0.46, lineHeight: 1.25, padding: '2px 16px', borderRadius: 999, background: TAGS[s].bg, color: TAGS[s].fg, boxShadow: '0 3px 10px rgba(0,0,0,0.25)' }}>
						{TAGS[s].name}
					</span>
				))}
			</div>
			<div
				style={{
					direction: 'rtl',
					textAlign: 'center',
					fontFamily: ARABIC,
					fontWeight: 800,
					fontSize: fs,
					lineHeight: 1.42,
					color: '#FFFFFF',
					background: 'rgba(12, 18, 64, 0.42)',
					borderRadius: 28,
					padding: `${fs * 0.12}px ${fs * 0.42}px ${fs * 0.2}px`,
					textShadow: '0 3px 10px rgba(0,0,0,0.35)',
				}}
			>
				{groupSegs(segment(l.words.map((x) => x.text))).map((g, gi, all) => {
					const segEls = g.segs.map((sg, si) => {
						const wd = l.words[sg.word];
						const end = l.words[sg.word + 1]?.start ?? l.end + 0.2;
						const on = t >= wd.start && t < end;
						const style: React.CSSProperties = on
							? hl
								? { color: hl }
								: { backgroundImage: `linear-gradient(90deg, ${C.hamzaTag}, ${C.citybotTag})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', textShadow: 'none' }
							: {};
						const gap = si > 0 && sg.spaceBefore ? ' ' : '';
						return (
							<React.Fragment key={si}>
								{gap}
								<span style={style}>{sg.text}</span>
							</React.Fragment>
						);
					});
					const next = all[gi + 1];
					// a prefix particle (فـ / لـ) never wraps away from the word it attaches to
					const glue = g.segs[g.segs.length - 1].text.endsWith('ـ');
					const space = next && next.segs[0].spaceBefore ? (glue ? '\u00A0' : ' ') : '';
					return (
						<React.Fragment key={gi}>
							<span dir={g.ltr ? 'ltr' : undefined} style={{ unicodeBidi: g.ltr ? 'isolate' : undefined, whiteSpace: g.ltr ? 'nowrap' : undefined }}>
								{segEls}
							</span>
							{space}
						</React.Fragment>
					);
				})}
			</div>
		</div>
	);
};
