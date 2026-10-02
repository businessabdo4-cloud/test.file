import media from './data/media.json';
import {VARIANT} from './variant';

type Products = Record<keyof typeof media.products, string | null>;
type Generated = Record<keyof typeof media.generated, string | null>;

export const VOICEOVER: string = VARIANT.voiceover;
export const LOGO: string | null = media.logo;
export const LOGO_DROPS: string | null = media.logoDrops;
export const MUSIC: string | null = media.music;
export const PRODUCTS = media.products as Products;
export const GENERATED = media.generated as Generated;

/** Best single-unit cut-out available (teal first: it is the most colorful on white backgrounds). */
export const HERO: string | null = PRODUCTS.tealCutout ?? PRODUCTS.whiteCutout ?? PRODUCTS.blackCutout ?? PRODUCTS.trioCutout;
