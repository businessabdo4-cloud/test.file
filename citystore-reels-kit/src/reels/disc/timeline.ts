import timelineJson from "../../../public/disc/data/timeline.json";
import productsJson from "../../../public/disc/data/products.json";
import { evIn, evListIn, sceneIn, Timeline } from "../../timeline";

// PlayStation Disc Drive reel timeline (reels/disc/build_timeline.py), shared with its mix. 30 s, 9:16 only.
export const DTL = timelineJson as unknown as Timeline;
export const dscene = (id: string) => sceneIn(DTL, id);
export const dev = (k: string) => evIn(DTL, k);
export const devList = (k: string) => evListIn(DTL, k);
type P = { src: string; w: number; h: number };
const PR = productsJson as unknown as Record<string, P>;
const img = (k: string) => ({ src: PR[k].src, aspect: PR[k].h / PR[k].w });
export const OFFICIAL = { drive: img("drive"), console: img("console"), module: img("module"), cover: img("cover") };
