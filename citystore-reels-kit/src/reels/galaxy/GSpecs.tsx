import React from "react";
import { interpolate } from "remotion";
import { FONT } from "../../brand";
import { lerp, ramp, sp } from "../../anim";
import { useLayout } from "../../layout";
import { IconName, LineIcon } from "../../components/Icons";
import { ProductImage } from "../../components/ProductImage";
import { SceneShell, useSceneFrame } from "../../components/SceneShell";
import { gev, IMG } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 13.0-18.0 s Ultra2 specs (verified on samsung.com): up to 5,000 nits, up to 60 h, fast charging. */
export const GSpecs: React.FC = () => {
  const frame = useSceneFrame("specs");
  const L = useLayout();
  const P = L.portrait;
  const G = P
    ? { watch: { cx: 505, top: 220, w: 300 }, x: 80, w: 850, y0: 720, dy: 132, h: 118, num: 66, unit: 34, sub: 23 }
    : { watch: { cx: 190, top: 110, w: 250 }, x: 380, w: 650, y0: 90, dy: 170, h: 140, num: 64, unit: 32, sub: 22 };
  const glow = interpolate(frame, [gev("specs.screen"), gev("specs.nits"), gev("specs.nits") + 10, gev("specs.battery")], [0, 0.6, 1, 0.35], clamp);
  const sweep = interpolate(frame, [gev("specs.nits"), gev("specs.nits") + 14], [-0.3, 1.3], clamp);
  const enter = sp(frame, gev("specs.screen") - 8, { damping: 14, stiffness: 120 });
  const count = (at: number, to: number) => Math.round(to * interpolate(frame, [at, at + 18], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) }));
  const rows: { at: number; icon: IconName; value: string; unit: string; sub: string }[] = [
    { at: gev("specs.nits"), icon: "bright", value: count(gev("specs.nits"), 5000).toLocaleString("fr-FR"), unit: "nits", sub: "Luminosité maximale de l'écran" },
    { at: gev("specs.battery"), icon: "battery", value: String(count(gev("specs.battery"), 60)), unit: "h", sub: "Jusqu'à 60 h, écran toujours allumé" },
    { at: gev("specs.charge"), icon: "bolt", value: "Charge", unit: "rapide", sub: "40 % en 30 min" },
  ];
  const t = frame / 30;
  return (
    <SceneShell id="specs">
      {/* screen brightness glow behind the watch */}
      <div style={{ position: "absolute", left: G.watch.cx - G.watch.w * 1.2, top: G.watch.top - G.watch.w * 0.2, width: G.watch.w * 2.4, height: G.watch.w * 2.4, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.95), rgba(255,220,160,0.35) 35%, rgba(255,255,255,0) 65%)", opacity: glow }} />
      <div style={{ position: "absolute", left: G.watch.cx - G.watch.w / 2, top: G.watch.top, opacity: Math.min(1, enter * 1.5), transform: `translateY(${(1 - enter) * -300 + Math.sin(t * Math.PI) * 8}px) scale(${lerp(0.6, 1, enter)})`, filter: `drop-shadow(0 26px 34px rgba(6,14,90,0.45)) brightness(${1 + glow * 0.25})` }}>
        <ProductImage src={IMG.ultraFront.src} aspect={IMG.ultraFront.aspect} width={G.watch.w} sweep={sweep} />
      </div>
      {rows.map((r, i) => {
        if (frame < r.at - 1) return null;
        const p = sp(frame, r.at, { damping: 13, stiffness: 190 });
        const draw = ramp(frame, r.at + 1, r.at + 12);
        const active = rows.filter((x) => frame >= x.at).length - 1 === i;
        return (
          <div key={i} style={{ position: "absolute", left: G.x, top: G.y0 + i * G.dy, width: G.w, height: G.h, display: "flex", alignItems: "center", gap: 22, padding: "0 26px 0 18px", borderRadius: 30, background: `rgba(255,255,255,${active ? 0.26 : 0.13})`, border: `2px solid rgba(255,255,255,${active ? 0.8 : 0.4})`, backdropFilter: "blur(14px)", opacity: Math.min(1, p * 1.4), transform: `translateX(${(1 - p) * 300}px) scale(${active ? 1 : 0.97})`, transformOrigin: "left center" }}>
            <div style={{ width: 84, height: 84, borderRadius: 24, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <LineIcon name={r.icon} size={62} progress={draw} stroke={6} />
            </div>
            <div style={{ fontFamily: FONT, color: "#fff", lineHeight: 1.02 }}>
              <div style={{ whiteSpace: "nowrap" }}>
                <span style={{ fontWeight: 900, fontSize: G.num }}>{r.value}</span>
                <span style={{ fontWeight: 800, fontSize: G.unit, marginLeft: 10 }}>{r.unit}</span>
              </div>
              <div style={{ fontWeight: 600, fontSize: G.sub, opacity: 0.9 }}>{r.sub}</div>
            </div>
          </div>
        );
      })}
    </SceneShell>
  );
};
