import timelineJson from "../../../public/rayban/data/timeline.json";
import productsJson from "../../../public/rayban/data/products.json";
import { evIn, evListIn, sceneIn, Timeline } from "../../timeline";

// Ray-Ban Meta Gen 2 reel timeline (reels/rayban/build_timeline.py), shared with its audio mix.
export const RTL = timelineJson as unknown as Timeline;
export const rscene = (id: string) => sceneIn(RTL, id);
export const rev = (k: string) => evIn(RTL, k);
export const revList = (k: string) => evListIn(RTL, k);
// Official images (reels/rayban/cutout.py, public/rayban/products)
type P = { src: string; w: number; h: number };
const PR = productsJson as Record<string, P>;
const img = (k: string) => ({ src: PR[k].src, aspect: PR[k].h / PR[k].w });
export const OFFICIAL = {
  headlinerFront: img("headliner_front"),
  headlinerAngle: img("headliner_angle"),
  wayfarerFront: img("wayfarer_front"),
  wayfarerAngle: img("wayfarer_angle"),
};
// lens tints for Citybot's own (generic) shades
export const LENS = { green: "#24382c", graphite: "#22262e" };
