import timelineJson from "../public/data/timeline.json";
import productsJson from "../public/data/products.json";

// Shared with the audio mixer (scripts/build_timeline.py generates it), so picture and sound never drift.
export const TL = timelineJson;
export type SceneId = "hook" | "hero" | "ecosystem" | "trust" | "cta" | "end";

export const scene = (id: SceneId) => {
  const s = TL.scenes.find((x) => x.id === id);
  if (!s) throw new Error(`no scene ${id}`);
  return s;
};

type EventKey = keyof typeof TL.events;
/** Absolute frame of a named event. */
export const ev = (k: EventKey): number => TL.events[k] as number;
export const evList = (k: EventKey): number[] => TL.events[k] as unknown as number[];

/** Official product images present in public/products (scripts/scan_products.py). */
export const PRODUCTS: Record<string, string> = productsJson as Record<string, string>;
