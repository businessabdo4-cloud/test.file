import React from "react";
import { evolvePath } from "@remotion/paths";
import { interpolate, random } from "remotion";
import { COLORS, FONT } from "../brand";
import { lerp, ramp, shake, slam, sp } from "../anim";
import { useLayout } from "../layout";
import { IconName, LineIcon } from "./Icons";
import { Burst, SceneShell, useSceneFrame } from "./SceneShell";
import { evIn, evListIn, useTL } from "../timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const CHECK = "M 30 52 L 45 67 L 72 36";
const ITEMS: { icon: IconName; text: string }[] = [
  { icon: "box", text: "Boîte fermée" },
  { icon: "lock", text: "Jamais ouvert" },
  { icon: "power", text: "Jamais activé" },
];

/** TRUST scene shared by the Darija reels: "PRODUIT ORIGINAL" seal + checklist ticking on the VO
 * (events trust.badge / trust.original / trust.checks[3]). */
export const ChecklistTrust: React.FC = () => {
  const frame = useSceneFrame("trust");
  const TL = useTL();
  const wev = (k: string) => evIn(TL, k);
  const wevList = (k: string) => evListIn(TL, k);
  const L = useLayout();
  const P = L.portrait;
  const checks = wevList("trust.checks");
  const G = P
    ? { cx: 505, cy: 450, r: 190, title: 680, tsize: 70, rows: { x: 150, y: 820, dy: 100, w: 710, size: 42 } }
    : { cx: 300, cy: 300, r: 150, title: 500, tsize: 50, rows: { x: 580, y: 170, dy: 130, w: 450, size: 38 } };
  const badge = sp(frame, wev("trust.badge"), { damping: 10, stiffness: 200, mass: 0.7 });
  const seal = ramp(frame, wev("trust.badge") + 2, wev("trust.badge") + 16);
  const title = slam(frame, wev("trust.original"), 2);
  const sk = shake(frame, wev("trust.original"), 12, 8);
  const conf = Array.from({ length: 30 }).map((_, i) => {
    const t = (frame - wev("trust.original")) / 30;
    if (t < 0 || t > 1.5) return null;
    const ang = random(`wc-a-${i}`) * Math.PI * 2;
    const spd = (380 + random(`wc-s-${i}`) * 480) * (P ? 1 : 0.7);
    const size = 10 + random(`wc-z-${i}`) * 14;
    return (
      <div key={i} style={{ position: "absolute", left: G.cx + Math.cos(ang) * spd * t, top: G.cy + Math.sin(ang) * spd * t + 480 * t * t, width: size, height: size * (i % 3 ? 0.45 : 1), borderRadius: i % 3 ? 3 : "50%", background: i % 2 ? "#fff" : COLORS.cyan, opacity: interpolate(t, [0, 1.1, 1.5], [1, 1, 0], clamp), transform: `rotate(${t * 600 * (random(`wc-r-${i}`) - 0.5)}deg)` }} />
    );
  });

  return (
    <SceneShell id="trust" shakeX={sk.x} shakeY={sk.y}>
      <Burst x={G.cx} y={G.cy} r={G.r * 2.8} rot={frame * 0.8} opacity={0.22 * badge} rays={22} />
      <div style={{ position: "absolute", left: G.cx - G.r, top: G.cy - G.r, width: G.r * 2, height: G.r * 2, borderRadius: "50%", transform: `scale(${badge}) rotate(${lerp(-25, 0, badge)}deg)`, background: `radial-gradient(circle at 35% 28%, rgba(255,255,255,0.35), rgba(255,255,255,0) 55%), linear-gradient(135deg, ${COLORS.blue}, ${COLORS.cyan})`, border: `${G.r * 0.05}px solid #fff`, boxShadow: "0 30px 70px rgba(6,14,90,0.45)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <LineIcon name="seal" size={G.r * 1.3} progress={seal} stroke={5} />
      </div>
      <div style={{ position: "absolute", left: P ? 0 : G.cx - 300, right: P ? 70 : undefined, width: P ? undefined : 600, top: G.title, display: "flex", justifyContent: "center" }}>
        <div style={{ ...title, fontFamily: FONT, fontWeight: 900, fontSize: G.tsize, color: "#fff", textAlign: "center", lineHeight: 1, textShadow: "0 8px 30px rgba(8,20,110,0.35)" }}>
          PRODUIT ORIGINAL
        </div>
      </div>
      {ITEMS.map((it, i) => {
        const at = checks[i];
        const p = sp(frame, at - 2, { damping: 14, stiffness: 190 });
        const c = ramp(frame, at + 2, at + 11);
        const evo = evolvePath(Math.max(0.0001, c), CHECK);
        const cp = sp(frame, at + 1, { damping: 9, stiffness: 260 });
        return (
          <div key={i} style={{ position: "absolute", left: G.rows.x, top: G.rows.y + i * G.rows.dy, width: G.rows.w, display: "flex", alignItems: "center", gap: 18, opacity: Math.min(1, p * 1.4), transform: `translateX(${(1 - p) * 240}px)`, fontFamily: FONT, fontWeight: 800, fontSize: G.rows.size, color: "#fff" }}>
            <LineIcon name={it.icon} size={G.rows.size * 1.4} stroke={6} />
            <span style={{ flex: 1, whiteSpace: "nowrap" }}>{it.text}</span>
            <svg viewBox="0 0 100 100" width={G.rows.size * 1.5} height={G.rows.size * 1.5} style={{ transform: `scale(${cp})` }}>
              <circle cx={50} cy={50} r={46} fill="#fff" />
              <path d={CHECK} fill="none" stroke={COLORS.blue} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={evo.strokeDasharray} strokeDashoffset={evo.strokeDashoffset} />
            </svg>
          </div>
        );
      })}
      {conf}
    </SceneShell>
  );
};
