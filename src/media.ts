import media from './data/media.json';

export type StockClip = {
  file: string;
  trimStart?: number; // seconds into the clip
  playbackRate?: number; // <1 = slow motion
  focusX?: number; // 0..1 horizontal focus if the clip is wider than 9:16
};

type Products = Record<keyof typeof media.products, string | null>;
type Stock = Record<keyof typeof media.stock, StockClip | null>;

export const LOGO: string | null = media.logo;
export const MUSIC: string | null = media.music;
export const PRODUCTS = media.products as Products;
export const STOCK = media.stock as unknown as Stock;
