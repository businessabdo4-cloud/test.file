import React, { createContext, useContext } from "react";
import timelineJson from "../public/data/timeline.json";
import productsJson from "../public/data/products.json";

/** Shape of public/<reel>/data/timeline.json (written by the reel's build_timeline script). */
export interface Timeline {
  fps: number;
  bpm: number;
  beatFrames: number;
  totalFrames: number;
  holdFrom: number;
  scenes: { id: string; from: number; to: number }[];
  events: Record<string, number | number[]>;
  eventsSec: Record<string, number | number[]>;
  sfx: { name: string; t: number; gainDb: number }[];
  subtitles: {
    text: string;
    start: number;
    end: number;
    from: number;
    to: number;
    line: number;
    words: { word: string; start: number; frame: number }[];
  }[];
  vo: { id: string; from: number; start: number; duration: number; mouthCues: { start: number; end: number; value: string }[] }[];
}

// ---- iPhone 18 reel (the original reel's scenes import these directly)
export const TL = timelineJson as unknown as Timeline;
export type SceneId = string;
export const sceneIn = (tl: Timeline, id: SceneId) => {
  const s = tl.scenes.find((x) => x.id === id);
  if (!s) throw new Error(`no scene ${id}`);
  return s;
};
export const evIn = (tl: Timeline, k: string): number => tl.events[k] as number;
export const evListIn = (tl: Timeline, k: string): number[] => tl.events[k] as number[];
export const scene = (id: SceneId) => sceneIn(TL, id);
export const ev = (k: string) => evIn(TL, k);
export const evList = (k: string) => evListIn(TL, k);

/** Official product images present in public/products (scripts/scan_products.py). */
export const PRODUCTS: Record<string, string> = productsJson as Record<string, string>;

// ---- per-reel timeline context, used by the shared components (subtitles, Citybot, scene shell, end card)
const Ctx = createContext<Timeline>(TL);
export const TimelineProvider: React.FC<{ tl: Timeline; children: React.ReactNode }> = ({ tl, children }) =>
  React.createElement(Ctx.Provider, { value: tl }, children);
export const useTL = () => useContext(Ctx);
