import timelineJson from "../../../public/shokz/data/timeline.json";
import productsJson from "../../../public/shokz/data/products.json";
import { evIn, evListIn, sceneIn, Timeline } from "../../timeline";

// Shokz OpenRun Pro reel timeline (reels/shokz/build_timeline.py), shared with its mix.
// 40 s long: the user approved going over the usual 30 s limit for this reel.
export const ZTL = timelineJson as unknown as Timeline;
export const zscene = (id: string) => sceneIn(ZTL, id);
export const zev = (k: string) => evIn(ZTL, k);
export const zevList = (k: string) => evListIn(ZTL, k);
type P = { src: string; w: number; h: number };
const PR = productsJson as unknown as Record<string, P> & { _standIn?: boolean };
const img = (k: string) => ({ src: PR[k].src, aspect: PR[k].h / PR[k].w });
export const OFFICIAL = { hero: img("hero"), front: img("front"), side: img("side"), runner: img("runner") };
/** true while the OpenRun Pro 2 images are used as stand-ins (a visible "provisional" tag is drawn) */
export const STAND_IN = Boolean(PR._standIn);
