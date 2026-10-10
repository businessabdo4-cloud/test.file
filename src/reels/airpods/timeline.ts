import timelineJson from "../../../public/airpods/data/timeline.json";
import productsJson from "../../../public/airpods/data/products.json";
import { evIn, evListIn, sceneIn, Timeline } from "../../timeline";

// AirPods 5 reel timeline (reels/airpods/build_timeline.py), shared with its mix.
// 39 s long: the user approved going over the usual 30 s limit for this reel.
export const ATL = timelineJson as unknown as Timeline;
export const ascene = (id: string) => sceneIn(ATL, id);
export const aev = (k: string) => evIn(ATL, k);
export const aevList = (k: string) => evListIn(ATL, k);
type P = { src: string; w: number; h: number };
const PR = productsJson as Record<string, P>;
const img = (k: string) => ({ src: PR[k].src, aspect: PR[k].h / PR[k].w });
export const OFFICIAL = { openCase: img("open_case"), buds: img("buds"), case: img("case") };
