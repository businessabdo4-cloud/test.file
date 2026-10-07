import timelineJson from "../../../public/sony/data/timeline.json";
import productsJson from "../../../public/sony/data/products.json";
import { evIn, evListIn, sceneIn, Timeline } from "../../timeline";

// Sony WH-1000XM6 / XM5 reel timeline (reels/sony/build_timeline.py), shared with its audio mix.
export const STL = timelineJson as unknown as Timeline;
export const sscene = (id: string) => sceneIn(STL, id);
export const sev = (k: string) => evIn(STL, k);
export const sevList = (k: string) => evListIn(STL, k);
// Official images, when supplied: keys xm6_black, xm6_blue, xm5_black (public/sony/products)
const PR = productsJson as Record<string, string>;
export const OFFICIAL = { xm6Black: PR.xm6_black ?? null, xm6Blue: PR.xm6_blue ?? null, xm5Black: PR.xm5_black ?? null };
