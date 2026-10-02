import timingsJson from '../../assets/vo/timings.json';
import lipsyncJson from '../../assets/vo/lipsync.json';
import logoPartsJson from '../../assets/logo/logo_parts.json';
import productsJson from '../../assets/products/manifest.json';
import musicJson from '../../assets/music/music.json';
import type { Viseme } from './characters/Mouth';

export type Speaker = 'hamza' | 'citybot' | 'both';
export type Word = { text: string; start: number; end: number };
export type Line = { id: string; speaker: Speaker; text: string; start: number; end: number; fileStart: number; words: Word[] };
export type Cue = { start: number; end: number; value: Viseme };

export const FPS: number = timingsJson.fps;
export const DURATION_SEC: number = timingsJson.durationSec;
export const DURATION_FRAMES: number = timingsJson.durationInFrames;
export const LINES = timingsJson.lines as Line[];
export const LIPSYNC = lipsyncJson as Record<string, Cue[]>;
export const LOGO = logoPartsJson;
export const MUSIC = musicJson as { file: string | null; gainDb: number; duckDb: number; rampSec: number };

export type ProductColor = 'black' | 'silver' | 'glacier' | 'burgundy';
/** 'pair' = Apple's back+front composite in one image. */
export type ProductSide = 'front' | 'back' | 'pair';
export type ProductManifest = Record<string, Partial<Record<ProductColor, Partial<Record<ProductSide, string>>>>>;
export const PRODUCTS = productsJson as ProductManifest;

export const line = (id: string): Line => {
	const l = LINES.find((x) => x.id === id);
	if (!l) throw new Error(`No line ${id} in timings.json`);
	return l;
};
/** Word onset (seconds) — index into the script words of a line. */
export const w = (id: string, i: number) => line(id).words[i].start;
export const wEnd = (id: string, i: number) => line(id).words[i].end;
export const toFrame = (s: number) => Math.round(s * FPS);

const L = (id: string) => line(id);
const mid = (a: string, b: string) => (L(a).end + L(b).start) / 2;

/** Scene boundaries (seconds), all derived from the recorded dialogue. */
export const SCENES = {
	s1: { start: 0, end: L('L1').end + 0.06 },
	s2: { start: L('L1').end + 0.06, end: L('L2').end },
	s3: { start: L('L2').end, end: mid('L4', 'L5') },
	s4: { start: mid('L4', 'L5'), end: mid('L5', 'L6') },
	s5: { start: mid('L5', 'L6'), end: L('L6').end + 0.05 },
	s6: { start: L('L6').end + 0.05, end: DURATION_SEC },
} as const;
export type SceneKey = keyof typeof SCENES;
