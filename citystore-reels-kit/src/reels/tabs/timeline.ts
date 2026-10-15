import timelineJson from "../../../public/tabs/data/timeline.json";
import productsJson from "../../../public/tabs/data/products.json";
import { evIn, evListIn, sceneIn, Timeline } from "../../timeline";

// Tablets comparison reel timeline (reels/tabs/build_timeline.py), shared with its mix.
// 42 s long: the user approved going over the usual 30 s limit for this reel.
export const TTL = timelineJson as unknown as Timeline;
export const tscene = (id: string) => sceneIn(TTL, id);
export const tev = (k: string) => evIn(TTL, k);
export const tevList = (k: string) => evListIn(TTL, k);
type P = { src: string; w: number; h: number };
const PR = productsJson as unknown as Record<string, P>;
const img = (k: string) => ({ src: PR[k].src, aspect: PR[k].h / PR[k].w });
export const OFFICIAL = { a9: img("a9"), a11: img("a11"), lenovo: img("lenovo"), xiaomi: img("xiaomi") };
/** Lenovo screen corners as fractions of its image (TL, TR, BR, BL), for the pen scribble overlay */
export const LENOVO_SCREEN: [number, number][] = [[0.25, 0.15], [0.85, 0.2], [0.667, 0.9], [0.035, 0.7]];
