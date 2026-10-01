import React from "react";
import { evolvePath } from "@remotion/paths";
import { interpolate, random } from "remotion";
import { COLORS, FONT } from "../brand";
import { lerp, ramp, shake, slam, sp } from "../anim";
import { useLayout } from "../layout";
import { ev } from "../timeline";
import { Burst, SceneShell, SweepText, useSceneFrame } from "../components/SceneShell";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const CHECK = "M 30 52 L 45 67 L 72 36";

/** 15.5-20.0 s TRUST: "100% ORIGINAL" badge, checkmark drawing on, confetti, Citybot thumbs up. */
export const Trust: React.FC = () => {
  const frame = useSceneFrame("trust");
  const L = useLayout();
  const P = L.portrait;
  const G = P ? { cx: 505, cy: 640, r: 300, sub: 1040 } : { cx: 540, cy: 400, r: 230, sub: 700 };
  const b = ev("trust.badge");
  const badge = sp(frame, b, { damping: 10, stiffness: 200, mass: 0.7 });
  const ring = ramp(frame, b - 6, b + 10);
  const check = ramp(frame, ev("trust.check"), ev("trust.check") + 10);
  const checkPop = sp(frame, ev("trust.check"), { damping: 9, stiffness: 260 });
  const orig = slam(frame, ev("trust.original"), 2);
  const sweep = interpolate(frame, [ev("trust.sparkle"), ev("trust.sparkle") + 16], [-0.3, 1.3], clamp);
  const sk = shake(frame, b, 16, 9);
  const sk2 = shake(frame, ev("trust.original"), 9, 7);
  const evo = evolvePath(Math.max(0.0001, check), CHECK);
  const r = G.r;

  // confetti burst on "original"
  const conf = Array.from({ length: 34 }).map((_, i) => {
    const t = (frame - ev("trust.original")) / 30;
    if (t < 0 || t > 1.6) return null;
    const ang = random(`c-a-${i}`) * Math.PI * 2;
    const spd = (420 + random(`c-s-${i}`) * 520) * (P ? 1 : 0.75);
    const x = G.cx + Math.cos(ang) * spd * t;
    const y = G.cy + Math.sin(ang) * spd * t + 500 * t * t;
    const size = 10 + random(`c-z-${i}`) * 16;
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: size,
          height: size * (i % 3 === 0 ? 1 : 0.45),
          borderRadius: i % 3 === 0 ? "50%" : 3,
          background: i % 2 ? "#fff" : COLORS.cyan,
          transform: `rotate(${t * 720 * (random(`c-r-${i}`) - 0.5)}deg)`,
          opacity: interpolate(t, [0, 1.2, 1.6], [1, 1, 0], clamp),
        }}
      />
    );
  });

  return (
    <SceneShell id="trust" shakeX={sk.x + sk2.x} shakeY={sk.y + sk2.y}>
      <Burst x={G.cx} y={G.cy} r={r * 2.6} rot={frame * 0.8} opacity={0.22 * badge} rays={22} />
      {/* rotating dashed ring */}
      <svg style={{ position: "absolute", left: G.cx - r * 1.28, top: G.cy - r * 1.28, width: r * 2.56, height: r * 2.56, transform: `rotate(${frame * 1.2}deg)`, opacity: ring }} viewBox="-100 -100 200 200">
        <circle r={96} fill="none" stroke="#fff" strokeOpacity={0.7} strokeWidth={1.6} strokeDasharray="5 7" />
        <circle r={88} fill="none" stroke="#fff" strokeOpacity={0.25} strokeWidth={0.8} />
      </svg>
      {/* badge */}
      <div
        style={{
          position: "absolute",
          left: G.cx - r,
          top: G.cy - r,
          width: r * 2,
          height: r * 2,
          borderRadius: "50%",
          transform: `scale(${badge}) rotate(${lerp(-25, 0, badge)}deg)`,
          background: `radial-gradient(circle at 35% 28%, rgba(255,255,255,0.35), rgba(255,255,255,0) 55%), linear-gradient(135deg, ${COLORS.blue}, ${COLORS.cyan})`,
          border: `${r * 0.05}px solid #fff`,
          boxShadow: "0 30px 70px rgba(6,14,90,0.45), inset 0 0 50px rgba(255,255,255,0.25)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT,
          color: "#fff",
          lineHeight: 0.95,
        }}
      >
        <SweepText text="100%" sweep={sweep} style={{ fontWeight: 900, fontSize: r * 0.58, letterSpacing: -3 }} />
        <div style={{ ...orig, fontWeight: 900, fontSize: r * 0.25, letterSpacing: 2, marginTop: r * 0.04 }}>ORIGINAL</div>
      </div>
      {/* check seal */}
      <div style={{ position: "absolute", left: G.cx + r * 0.52, top: G.cy - r * 1.02, width: r * 0.62, height: r * 0.62, transform: `scale(${checkPop})` }}>
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <circle cx={50} cy={50} r={46} fill="#fff" />
          <path d={CHECK} fill="none" stroke={COLORS.blue} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={evo.strokeDasharray} strokeDashoffset={evo.strokeDashoffset} />
        </svg>
      </div>
      {/* sub line */}
      <div style={{ position: "absolute", left: 0, width: G.cx * 2, top: G.sub, display: "flex", justifyContent: "center" }}>
        <div
          style={{
            opacity: ramp(frame, ev("trust.sparkle"), ev("trust.sparkle") + 8),
            transform: `translateY(${(1 - ramp(frame, ev("trust.sparkle"), ev("trust.sparkle") + 10)) * 30}px)`,
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: P ? 40 : 32,
            color: COLORS.blue,
            background: "#fff",
            padding: "12px 30px",
            borderRadius: 999,
            boxShadow: "0 10px 26px rgba(6,14,90,0.3)",
          }}
        >
          Produits authentiques
        </div>
      </div>
      {conf}
    </SceneShell>
  );
};
