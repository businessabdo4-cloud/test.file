import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';
import brandJson from '../../assets/brand.json';

// Google Fonts Cairo (Arabic) + Montserrat (Latin), self-hosted from assets/fonts — the same variable
// woff2 files @remotion/google-fonts would fetch, kept local so renders don't depend on fonts.gstatic.com.
const ARABIC_RANGE =
	'U+0600-06FF, U+0750-077F, U+0870-088E, U+0890-0891, U+0897-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC';
const LATIN_RANGE =
	'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';

export const ARABIC = 'Cairo';
export const LATIN = 'Montserrat';

loadFont({ family: ARABIC, url: staticFile('fonts/Cairo-arabic.woff2'), weight: '200 1000', unicodeRange: ARABIC_RANGE });
loadFont({ family: ARABIC, url: staticFile('fonts/Cairo-latin.woff2'), weight: '200 1000', unicodeRange: LATIN_RANGE });
loadFont({ family: LATIN, url: staticFile('fonts/Montserrat-latin.woff2'), weight: '100 900', unicodeRange: LATIN_RANGE });

/** Sampled from assets/logo.png (see assets/brand.json). */
export const C = {
	blue: brandJson.gradient.start,
	mid: brandJson.gradient.mid,
	cyan: brandJson.gradient.end,
	white: '#FFFFFF',
	navy: '#16206B',
	hamzaTag: brandJson.speakerTags.hamza,
	citybotTag: brandJson.speakerTags.citybot,
	gridOpacity: brandJson.grid.opacity,
};
export const BRAND_GRADIENT = `linear-gradient(90deg, ${C.blue} 0%, ${C.mid} 50%, ${C.cyan} 100%)`;
