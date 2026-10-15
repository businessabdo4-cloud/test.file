import timelineJson from "../../../public/oneplus/data/timeline.json";
import productsJson from "../../../public/oneplus/data/products.json";
import { evIn, evListIn, sceneIn, Timeline } from "../../timeline";

// OnePlus Watch 3 reel timeline (reels/oneplus/build_timeline.py), shared with its audio mix.
export const OTL = timelineJson as unknown as Timeline;
export const oscene = (id: string) => sceneIn(OTL, id);
export const oev = (k: string) => evIn(OTL, k);
export const oevList = (k: string) => evListIn(OTL, k);
// Official images (reels/oneplus/cutout.py, public/oneplus/products)
type P = { src: string; w: number; h: number };
const PR = productsJson as Record<string, P>;
const img = (k: string) => ({ src: PR[k].src, aspect: PR[k].h / PR[k].w });
export const OFFICIAL = { front: img("front"), angle: img("angle"), side: img("side"), lifestyle: img("lifestyle") };
// strap / dial green sampled from the official images
export const EMERALD = "#7A8A70";
