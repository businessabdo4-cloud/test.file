import timelineJson from "../../../public/duo/data/timeline.json";
import productsJson from "../../../public/duo/data/products.json";
import { evIn, evListIn, sceneIn, Timeline } from "../../timeline";
import { Viseme } from "../../citybot/Mouths";
import { LAYOUT_9x16, Layout } from "../../layout";

// Episode 2 "الكورة قد النملة" (iPhone Duo) timeline (reels/duo/build_timeline.py), shared with its mix. 26 s, 9:16 only.
type Speaker = "hamza" | "citybot" | "both";
export type DuoTimeline = Timeline & { vo: (Timeline["vo"][number] & { speaker: Speaker })[] };
export const ETL = timelineJson as unknown as DuoTimeline;
export const esc = (id: string) => sceneIn(ETL, id);
export const eev = (k: string) => evIn(ETL, k);
export const eevList = (k: string) => evListIn(ETL, k);
type P = { src: string; w: number; h: number };
const PR = productsJson as unknown as Record<string, P>;
export const DUO = { src: PR.duo.src, aspect: PR.duo.h / PR.duo.w };

/** current viseme for a character: only the speaker of the line moves their mouth (both on L8) */
export const visemeFor = (who: "hamza" | "citybot", frame: number): Viseme | null => {
  for (const line of ETL.vo) {
    if (line.speaker !== who && line.speaker !== "both") continue;
    const t = (frame - line.from) / ETL.fps;
    if (t < 0 || t > line.duration) continue;
    const cue = line.mouthCues.find((c) => t >= c.start && t < c.end);
    return (cue?.value as Viseme) ?? "X";
  }
  return null;
};

/** subtitles centred under the characters for the whole sketch */
export const LAYOUT_DUO: Layout = {
  ...LAYOUT_9x16,
  subs: {
    hook: { x: 60, bottom: 1505, w: 890, align: "center", size: 52 },
    corner: { x: 60, bottom: 1505, w: 890, align: "center", size: 52 },
    end: { x: 60, bottom: 1505, w: 890, align: "center", size: 52 },
  },
};
