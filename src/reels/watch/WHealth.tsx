import React from "react";
import { evolvePath } from "@remotion/paths";
import { interpolate } from "remotion";
import { FONT } from "../../brand";
import { pop, ramp, slam, sp } from "../../anim";
import { useLayout } from "../../layout";
import { LineIcon } from "../../components/Icons";
import { SceneShell, useSceneFrame } from "../../components/SceneShell";
import { wev, wscene, WTL } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
// ECG trace in a 140x100 design box, rebuilt in pixel space so the stroke stays uniform
const ECG_PTS: [number, number][] = [[0, 50], [34, 50], [40, 40], [46, 50], [52, 50], [58, 18], [66, 84], [72, 50], [80, 50], [86, 42], [92, 50], [140, 50]];
const ecgPath = (w: number, h: number) => ECG_PTS.map(([x, y], i) => `${i ? "L" : "M"}${((x / 140) * w).toFixed(1)} ${((y / 100) * h).toFixed(1)}`).join(" ");

/** 17.0-19.5 s HEALTH: heart pulsing on the beat, ECG trace, "jour et nuit". */
export const WHealth: React.FC = () => {
  const frame = useSceneFrame("health");
  const L = useLayout();
  const P = L.portrait;
  const s = wscene("health");
  const G = P ? { cx: 505, cy: 560, heart: 380, ecgW: 1080, title: 820, size: 76, row: 940 } : { cx: 540, cy: 320, heart: 280, ecgW: 1080, title: 560, size: 60, row: 650 };
  // heart pulse on every beat
  const sinceBeat = (frame - s.from) % WTL.beatFrames;
  const pulse = interpolate(sinceBeat, [0, 3, 9], [1.12, 1.0, 1.0], clamp);
  const heartIn = sp(frame, s.from, { damping: 10, stiffness: 180 });
  const ecg = ramp(frame, s.from + 2, wev("health.heart") + 10, (x) => x);
  const ECG = ecgPath(G.ecgW, 280);
  const evo = evolvePath(Math.max(0.0001, ecg), ECG);
  const titleA = slam(frame, wev("health.heart"), 1.8);
  const titleB = slam(frame, wev("health.health"), 1.8);
  const day = pop(frame, wev("health.day"));
  const night = pop(frame, wev("health.night"));

  return (
    <SceneShell id="health">
      <svg viewBox={`0 0 ${G.ecgW} 280`} style={{ position: "absolute", left: 0, top: G.cy - 140, width: G.ecgW, height: 280, opacity: 0.85 }}>
        <path d={ECG} fill="none" stroke="#fff" strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={evo.strokeDasharray} strokeDashoffset={evo.strokeDashoffset} />
      </svg>
      <div style={{ position: "absolute", left: G.cx - G.heart / 2, top: G.cy - G.heart / 2, width: G.heart, height: G.heart, transform: `scale(${heartIn * pulse})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", inset: "12%", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,80,120,0.55), rgba(255,80,120,0) 70%)" }} />
        <LineIcon name="heart" size={G.heart} stroke={5} glow />
      </div>
      <div style={{ position: "absolute", left: 0, right: P ? 70 : 0, top: G.title, display: "flex", justifyContent: "center", gap: 18, fontFamily: FONT, fontWeight: 900, fontSize: G.size, color: "#fff", textShadow: "0 6px 24px rgba(8,20,110,0.35)" }}>
        <span style={{ display: "inline-block", ...titleA }}>CŒUR</span>
        <span style={{ display: "inline-block", ...titleB }}>&amp; SANTÉ</span>
      </div>
      <div style={{ position: "absolute", left: 0, right: P ? 70 : 0, top: G.row, display: "flex", justifyContent: "center", alignItems: "center", gap: 26, fontFamily: FONT, fontWeight: 800, fontSize: G.size * 0.5, color: "#fff" }}>
        <div style={{ transform: `scale(${day})`, display: "flex", alignItems: "center", gap: 10 }}>
          <LineIcon name="sun" size={G.size * 0.9} stroke={6} />
          JOUR
        </div>
        <div style={{ transform: `scale(${night})`, display: "flex", alignItems: "center", gap: 10 }}>
          <LineIcon name="moon" size={G.size * 0.9} stroke={6} />
          NUIT
        </div>
      </div>
    </SceneShell>
  );
};
