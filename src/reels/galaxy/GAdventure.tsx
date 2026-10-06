import React from "react";
import { FONT } from "../../brand";
import { lerp, ramp, sp } from "../../anim";
import { useLayout } from "../../layout";
import { IconName, LineIcon } from "../../components/Icons";
import { ProductImage } from "../../components/ProductImage";
import { SceneShell, useSceneFrame } from "../../components/SceneShell";
import { gev, IMG } from "./timeline";

/** 18.0-21.5 s "كتغطس بيها، كتجري بيها، وكتبقى معاك فين ما مشيتي" */
export const GAdventure: React.FC = () => {
  const frame = useSceneFrame("adventure");
  const L = useLayout();
  const P = L.portrait;
  const tiles: { at: number; icon: IconName; label: string; sub?: string }[] = [
    { at: gev("adv.dive"), icon: "dive", label: "PLONGÉE", sub: "jusqu'à 40 m" },
    { at: gev("adv.run"), icon: "run", label: "COURSE" },
    { at: gev("adv.everywhere"), icon: "mountain", label: "PARTOUT" },
  ];
  const G = P
    ? { watch: { cx: 505, top: 230, w: 400 }, tile: 262, gap: 22, ty: 740, x0: 80, icon: 120, label: 36 }
    : { watch: { cx: 220, top: 110, w: 330 }, tile: 200, gap: 18, ty: 0, x0: 0, icon: 92, label: 30 };
  const t = frame / 30;
  const enter = sp(frame, gev("adv.dive") - 9, { damping: 13, stiffness: 110 });
  const bumpAt = tiles.filter((x) => frame >= x.at).map((x) => x.at).pop() ?? -100;
  const bump = 1 + 0.05 * Math.exp(-(frame - bumpAt) / 4) * (frame >= bumpAt ? 1 : 0);
  return (
    <SceneShell id="adventure">
      <div style={{ position: "absolute", left: G.watch.cx - G.watch.w / 2, top: G.watch.top, opacity: Math.min(1, enter * 1.5), transform: `translateY(${(1 - enter) * 400 + Math.sin(t * Math.PI) * 10}px) rotate(${lerp(-20, -6, enter) + Math.sin(t * Math.PI * 0.8) * 3}deg) scale(${bump})`, filter: "drop-shadow(0 30px 40px rgba(6,14,90,0.45))" }}>
        <ProductImage src={IMG.ultraAngle.src} aspect={IMG.ultraAngle.aspect} width={G.watch.w} />
      </div>
      {tiles.map((x, i) => {
        if (frame < x.at - 1) return null;
        const p = sp(frame, x.at, { damping: 10, stiffness: 220, mass: 0.6 });
        const draw = ramp(frame, x.at + 1, x.at + 12);
        const left = P ? G.x0 + i * (G.tile + G.gap) : 600;
        const top = P ? G.ty : 110 + i * (G.tile * 0.82 + G.gap);
        return (
          <div key={i} style={{ position: "absolute", left, top, width: P ? G.tile : 420, height: P ? G.tile * 1.15 : G.tile * 0.82, borderRadius: 34, background: "rgba(255,255,255,0.18)", border: "3px solid rgba(255,255,255,0.6)", backdropFilter: "blur(14px)", display: "flex", flexDirection: P ? "column" : "row", alignItems: "center", justifyContent: "center", gap: P ? 8 : 22, transform: `scale(${p}) rotate(${(1 - p) * (i - 1) * 12}deg)`, boxShadow: "0 18px 40px rgba(6,14,90,0.3)" }}>
            <LineIcon name={x.icon} size={G.icon} progress={draw} stroke={5} glow />
            <div style={{ fontFamily: FONT, color: "#fff", textAlign: "center", lineHeight: 1.05 }}>
              <div style={{ fontWeight: 900, fontSize: G.label, letterSpacing: 1 }}>{x.label}</div>
              {x.sub ? <div style={{ fontWeight: 600, fontSize: G.label * 0.6, opacity: 0.9 }}>{x.sub}</div> : null}
            </div>
          </div>
        );
      })}
    </SceneShell>
  );
};
