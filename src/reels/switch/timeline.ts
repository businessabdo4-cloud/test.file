import timelineJson from "../../../public/switch/data/timeline.json";
import productsJson from "../../../public/switch/data/products.json";
import { evIn, evListIn, sceneIn, Timeline } from "../../timeline";

// Nintendo Switch OLED reel timeline (reels/switch/build_timeline.py), shared with its audio mix.
export const NTL = timelineJson as unknown as Timeline;
export const nscene = (id: string) => sceneIn(NTL, id);
export const nev = (k: string) => evIn(NTL, k);
export const nevList = (k: string) => evListIn(NTL, k);
type P = { src: string; w: number; h: number };
const PR = productsJson as Record<string, P>;
const img = (k: string) => ({ src: PR[k].src, aspect: PR[k].h / PR[k].w });
export const OFFICIAL = { neonDock: img("neon_dock"), whiteDock: img("white_dock"), handheld: img("white_handheld"), tabletop: img("neon_tabletop") };
// screen area inside white_handheld.png (fractions of the image box)
export const HANDHELD_SCREEN = { x0: 0.155, x1: 0.835, y0: 0.06, y1: 0.94 };
export const NEON = { blue: "#00C3E3", red: "#FF4554" };
