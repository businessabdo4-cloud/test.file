import timelineJson from "../../../public/osmo/data/timeline.json";
import productsJson from "../../../public/osmo/data/products.json";
import { evIn, evListIn, sceneIn, Timeline } from "../../timeline";

// DJI Osmo Pocket 4 / Pocket 3 Creator Combo reel timeline (reels/osmo/build_timeline.py), shared with its mix.
// 56 s long: the user approved going over the usual 30 s limit for this reel.
export const XTL = timelineJson as unknown as Timeline;
export const xscene = (id: string) => sceneIn(XTL, id);
export const xev = (k: string) => evIn(XTL, k);
export const xevList = (k: string) => evListIn(XTL, k);
type P = { src: string; w: number; h: number };
const PR = productsJson as Record<string, P>;
const img = (k: string) => ({ src: PR[k].src, aspect: PR[k].h / PR[k].w });
export const OFFICIAL = { pocket4: img("pocket4"), combo: img("pocket3_combo"), box: img("pocket3_box") };
