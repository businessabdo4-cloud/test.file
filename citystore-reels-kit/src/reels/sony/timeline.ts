import timelineJson from "../../../public/sony/data/timeline.json";
import productsJson from "../../../public/sony/data/products.json";
import { evIn, evListIn, sceneIn, Timeline } from "../../timeline";

// Sony WH-1000XM6 / XM5 reel timeline (reels/sony/build_timeline.py), shared with its audio mix.
export const STL = timelineJson as unknown as Timeline;
export const sscene = (id: string) => sceneIn(STL, id);
export const sev = (k: string) => evIn(STL, k);
export const sevList = (k: string) => evListIn(STL, k);
// Official images (reels/sony/cutout.py): keys xm6_black, xm6_blue, xm5_black (public/sony/products)
type P = { src: string; w: number; h: number };
const PR = productsJson as Record<string, P>;
const img = (k: string) => (PR[k] ? { src: PR[k].src, aspect: PR[k].h / PR[k].w } : null);
export const OFFICIAL = { xm6Black: img("xm6_black"), xm6Blue: img("xm6_blue"), xm5Black: img("xm5_black") };
