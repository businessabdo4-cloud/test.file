import timelineJson from "../../../public/gopro/data/timeline.json";
import productsJson from "../../../public/gopro/data/products.json";
import { evIn, evListIn, sceneIn, Timeline } from "../../timeline";

// GoPro HERO13 Black reel timeline (reels/gopro/build_timeline.py), shared with its mix. 30 s.
export const GTL = timelineJson as unknown as Timeline;
export const gscene = (id: string) => sceneIn(GTL, id);
export const gev = (k: string) => evIn(GTL, k);
export const gevList = (k: string) => evListIn(GTL, k);
type P = { src: string; w: number; h: number };
const PR = productsJson as unknown as Record<string, P>;
export const OFFICIAL = { hero: { src: PR.hero.src, aspect: PR.hero.h / PR.hero.w } };
/** lens centre inside the hero image (fractions), for flashes */
export const LENS = { x: 0.56, y: 0.32 };
