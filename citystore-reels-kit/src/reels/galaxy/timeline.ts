import timelineJson from "../../../public/galaxy/data/timeline.json";
import productsJson from "../../../public/galaxy/data/products.json";
import { evIn, evListIn, sceneIn, Timeline } from "../../timeline";

// Samsung Galaxy Watch8 Classic / Ultra2 reel timeline (reels/galaxy/build_timeline.py), shared with its audio mix.
export const GTL = timelineJson as unknown as Timeline;
export const gscene = (id: string) => sceneIn(GTL, id);
export const gev = (k: string) => evIn(GTL, k);
export const gevList = (k: string) => evListIn(GTL, k);
type P = { src: string; w: number; h: number };
const PR = productsJson as Record<string, P>;
export const IMG = {
  classicFront: { src: PR.classic_front.src, aspect: PR.classic_front.h / PR.classic_front.w },
  classicAngle: { src: PR.classic_angle.src, aspect: PR.classic_angle.h / PR.classic_angle.w },
  ultraFront: { src: PR.ultra2_front.src, aspect: PR.ultra2_front.h / PR.ultra2_front.w },
  ultraAngle: { src: PR.ultra2_angle.src, aspect: PR.ultra2_angle.h / PR.ultra2_angle.w },
};
// Rotating-bezel annulus measured on classic_front.png (px in the cut-out): centre + radii
export const BEZEL = { cx: 205, cy: 332, r1: 160, r2: 218, w: PR.classic_front.w };
