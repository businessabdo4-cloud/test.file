import timelineJson from "../../../public/micmini/data/timeline.json";
import productsJson from "../../../public/micmini/data/products.json";
import { evIn, evListIn, sceneIn, Timeline } from "../../timeline";

// DJI Mic Mini 2 reel timeline (reels/micmini/build_timeline.py), shared with its audio mix.
export const MTL = timelineJson as unknown as Timeline;
export const mscene = (id: string) => sceneIn(MTL, id);
export const mev = (k: string) => evIn(MTL, k);
export const mevList = (k: string) => evListIn(MTL, k);
type P = { src: string; w: number; h: number };
const PR = productsJson as Record<string, P>;
const img = (k: string) => ({ src: PR[k].src, aspect: PR[k].h / PR[k].w });
// case_hero is a cut-out (enhanced 2x); kit / studio / osmo_direct are official photos used as cards
export const OFFICIAL = { hero: img("case_hero"), kit: img("kit"), studio: img("studio"), osmoDirect: img("osmo_direct") };
