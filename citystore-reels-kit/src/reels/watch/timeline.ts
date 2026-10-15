import timelineJson from "../../../public/watch/data/timeline.json";
import productsJson from "../../../public/watch/data/products.json";
import { evIn, evListIn, sceneIn, Timeline } from "../../timeline";

// Apple Watch Ultra 4 reel timeline (reels/watch/build_timeline.py) - shared with its audio mix.
export const WTL = timelineJson as unknown as Timeline;
export const wscene = (id: string) => sceneIn(WTL, id);
export const wev = (k: string) => evIn(WTL, k);
export const wevList = (k: string) => evListIn(WTL, k);
export const WATCH_IMG: string = (productsJson as Record<string, string>).watch;
export const WATCH_ASPECT = 716 / 618; // height / width of the cut-out
