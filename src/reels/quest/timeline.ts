import timelineJson from "../../../public/quest/data/timeline.json";
import productsJson from "../../../public/quest/data/products.json";
import { evIn, evListIn, sceneIn, Timeline } from "../../timeline";

// Meta Quest 3 (512GB) reel timeline (reels/quest/build_timeline.py), shared with its mix.
// 38.5 s long: standing user approval to go over the usual 30 s limit. 9:16 only (the user asked for no 1:1).
export const QTL = timelineJson as unknown as Timeline;
export const qscene = (id: string) => sceneIn(QTL, id);
export const qev = (k: string) => evIn(QTL, k);
export const qevList = (k: string) => evListIn(QTL, k);
type P = { src: string; w: number; h: number };
const PR = productsJson as unknown as Record<string, P>;
const img = (k: string) => ({ src: PR[k].src, aspect: PR[k].h / PR[k].w });
export const OFFICIAL = { hero: img("hero"), rear: img("rear"), ctrlL: img("ctrlL"), ctrlR: img("ctrlR") };
/** lens centres in the rear image (fractions) */
export const LENSES = [{ x: 0.325, y: 0.68 }, { x: 0.53, y: 0.64 }];
