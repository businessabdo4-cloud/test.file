import React from "react";
import { evolvePath } from "@remotion/paths";
import { interpolate, random } from "remotion";
import { COLORS, FONT } from "../../brand";
import { lerp, ramp, shake, slam, sp } from "../../anim";
import { useLayout } from "../../layout";
import { LineIcon } from "../../components/Icons";
import { Burst, SceneShell, SweepText, useSceneFrame } from "../../components/SceneShell";
import { gev } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const CHECK = "M 30 52 L 45 67 L 72 36";

/** 21.5-24.5 s "أوريجينال مية فالمية و كاتسناك عند City Store" */
export const GTrust: React.FC = () => {
  const frame = useSceneFrame("trust");
  const L = useLayout();
  const P = L.portrait;
  const G = P ? { cx: 505, cy: 560, r: 270, pill: 960, pillSize: 50 } : { cx: 540, cy: 360, r: 210, pill: 680, pillSize: 40 };
  const b = gev("trust.badge");
  const badge = sp(frame, b, { damping: 10, stiffness: 200, mass: 0.7 });
  const pct = slam(frame, gev("trust.original"), 2.2);
  const check = ramp(frame, gev("trust.original") + 2, gev("trust.original") + 12);
  const checkPop = sp(frame, gev("trust.original") + 1, { damping: 9, stiffness: 260 });
  const evo = evolvePath(Math.max(0.0001, check), CHECK);
  const store = slam(frame, gev("trust.store"), 2);
  const sweep = interpolate(frame, [gev("trust.original") + 8, gev("trust.original") + 24], [-0.3, 1.3], clamp);
  const sk = shake(frame, b, 14, 8);
  const sk2 = shake(frame, gev("trust.store"), 10, 7);
  const r = G.r;
  const conf = Array.from({ length: 30 }).map((_, i) => {
    const t = (frame - gev("trust.original")) / 30;
    if (t < 0 || t > 1.5) return null;
    const ang = random(`gc-a-${i}`) * Math.PI * 2;
    const spd = (400 + random(`gc-s-${i}`) * 500) * (P ? 1 : 0.7);
    const size = 10 + random(`gc-z-${i}`) * 14;
    return <div key={i} style={{ position: "absolute", left: G.cx + Math.cos(ang) * spd * t, top: G.cy + Math.sin(ang) * spd * t + 480 * t * t, width: size, height: size * (i % 3 ? 0.45 : 1), borderRadius: i % 3 ? 3 : "50%", background: i % 2 ? "#fff" : COLORS.cyan, opacity: interpolate(t, [0, 1.1, 1.5], [1, 1, 0], clamp), transform: `rotate(${t * 600 * (random(`gc-r-${i}`) - 0.5)}deg)` }} />;
  });
  return (
    <SceneShell id="trust" shakeX={sk.x + sk2.x} shakeY={sk.y + sk2.y}>
      <Burst x={G.cx} y={G.cy} r={r * 2.6} rot={frame * 0.8} opacity={0.22 * badge} rays={22} />
      <svg style={{ position: "absolute", left: G.cx - r * 1.28, top: G.cy - r * 1.28, width: r * 2.56, height: r * 2.56, transform: `rotate(${frame * 1.2}deg)`, opacity: badge }} viewBox="-100 -100 200 200">
        <circle r={96} fill="none" stroke="#fff" strokeOpacity={0.7} strokeWidth={1.6} strokeDasharray="5 7" />
      </svg>
      <div style={{ position: "absolute", left: G.cx - r, top: G.cy - r, width: r * 2, height: r * 2, borderRadius: "50%", transform: `scale(${badge}) rotate(${lerp(-25, 0, badge)}deg)`, background: `radial-gradient(circle at 35% 28%, rgba(255,255,255,0.35), rgba(255,255,255,0) 55%), linear-gradient(135deg, ${COLORS.blue}, ${COLORS.cyan})`, border: `${r * 0.05}px solid #fff`, boxShadow: "0 30px 70px rgba(6,14,90,0.45)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT, color: "#fff", lineHeight: 0.95 }}>
        <div style={{ fontWeight: 900, fontSize: r * 0.22, letterSpacing: 2 }}>ORIGINAL</div>
        <div style={{ ...pct }}>
          <SweepText text="100%" sweep={sweep} style={{ fontWeight: 900, fontSize: r * 0.56, letterSpacing: -3 }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: G.cx + r * 0.52, top: G.cy - r * 1.02, width: r * 0.6, height: r * 0.6, transform: `scale(${checkPop})` }}>
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <circle cx={50} cy={50} r={46} fill="#fff" />
          <path d={CHECK} fill="none" stroke={COLORS.blue} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={evo.strokeDasharray} strokeDashoffset={evo.strokeDashoffset} />
        </svg>
      </div>
      <div style={{ position: "absolute", left: 0, right: P ? 70 : 0, top: G.pill, display: "flex", justifyContent: "center" }}>
        <div dir="rtl" style={{ ...store, display: "flex", alignItems: "center", gap: 16, fontFamily: FONT, fontWeight: 900, fontSize: G.pillSize, color: COLORS.blue, background: "#fff", padding: `0 ${G.pillSize * 0.6}px ${G.pillSize * 0.15}px`, borderRadius: 999, boxShadow: "0 12px 30px rgba(6,14,90,0.3)" }}>
          <LineIcon name="store" size={G.pillSize * 1.1} stroke={7} color={COLORS.blue} />
          كاتسناك عند CITY STORE
        </div>
      </div>
      {conf}
    </SceneShell>
  );
};
