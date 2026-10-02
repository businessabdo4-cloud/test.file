/** Splits script words into Arabic / Latin(+digits) / Arabic-punctuation segments so Latin runs ("City Store",
 *  "iPhone 18 Pro Max", "18 Pro") can be isolated left-to-right inside the RTL subtitle — otherwise the bidi
 *  algorithm shows "الـ 18 Pro" as "Pro 18". Shared by the burned-in subtitles and the .srt export. */
export type Seg = { text: string; kind: 'ar' | 'lat' | 'punct'; word: number; spaceBefore: boolean };

const LAT = /[A-Za-z0-9@.…]+/;
const AR_PUNCT = /^[،؛؟!؟،.]+$/;

export const segment = (words: string[]): Seg[] => {
	const out: Seg[] = [];
	words.forEach((wd, wi) => {
		// split into maximal runs of Latin-ish vs other characters
		const parts = wd.match(/[A-Za-z0-9@.…]+|[^A-Za-z0-9@.…]+/g) ?? [wd];
		let pendingSpace = wi > 0;
		parts.forEach((p) => {
			const txt = p.trim();
			if (!txt) {
				pendingSpace = true;
				return;
			}
			const kind = LAT.test(txt) && /[A-Za-z0-9]/.test(txt) ? 'lat' : AR_PUNCT.test(txt) ? 'punct' : 'ar';
			out.push({ text: txt, kind, word: wi, spaceBefore: pendingSpace || /^\s/.test(p) });
			pendingSpace = /\s$/.test(p);
		});
	});
	return out;
};

export type Group = { ltr: boolean; segs: Seg[] };
/** Consecutive Latin segments become one LTR group; everything else stays in the RTL flow. */
export const groupSegs = (segs: Seg[]): Group[] => {
	const groups: Group[] = [];
	for (const s of segs) {
		const last = groups[groups.length - 1];
		if (s.kind === 'lat' && last?.ltr) last.segs.push(s);
		else groups.push({ ltr: s.kind === 'lat', segs: [s] });
	}
	return groups;
};

/** Plain-text form for .srt with LRI…PDI isolates around Latin runs. */
export const isolatedText = (words: string[]) =>
	groupSegs(segment(words))
		.map((g, i, all) => {
			const txt = g.segs.map((s, j) => (j > 0 && s.spaceBefore ? ' ' : '') + s.text).join('');
			const next = all[i + 1];
			const space = next && next.segs[0].spaceBefore ? (g.segs[g.segs.length - 1].text.endsWith('ـ') ? '\u00A0' : ' ') : '';
			return (g.ltr ? `⁦${txt}⁩` : txt) + space;
		})
		.join('');
