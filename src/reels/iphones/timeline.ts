import timelineJson from "../../../public/iphones/data/timeline.json";
import productsJson from "../../../public/iphones/data/products.json";
import { evIn, evListIn, sceneIn, Timeline } from "../../timeline";

// iPhone 18 Pro / iPhone 17 Pro reel timeline (reels/iphones/build_timeline.py), shared with its mix.
// 38 s long: the user approved going over the usual 30 s limit for this reel.
export const ITL = timelineJson as unknown as Timeline;
export const iscene = (id: string) => sceneIn(ITL, id);
export const iev = (k: string) => evIn(ITL, k);
export const ievList = (k: string) => evListIn(ITL, k);
type P = { src: string; w: number; h: number };
const PR = productsJson as Record<string, P>;
const img = (k: string) => ({ src: PR[k].src, aspect: PR[k].h / PR[k].w });
export const OFFICIAL = { p17Orange: img("p17_orange"), p17Silver: img("p17_silver"), p18Burgundy: img("p18_burgundy"), p18Front: img("p18_front") };
// finish colours sampled from the official images
export const FINISH = { burgundy: "#55262E", orange: "#F28B47", silver: "#EBEBE9" };
