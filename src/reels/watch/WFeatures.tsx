import React from "react";
import { interpolate } from "remotion";
import { FONT } from "../../brand";
import { lerp, ramp, sp } from "../../anim";
import { useLayout } from "../../layout";
import { IconName, LineIcon } from "../../components/Icons";
import { SceneShell, useSceneFrame } from "../../components/SceneShell";
import { WatchImage } from "./WatchImage";
import { wev } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 8.0-17.0 s FEATURES: one row per spoken feature (verified on apple.com, see SOURCES.md). */
export const WFeatures: React.FC = () => {
  const frame = useSceneFrame("features");
  const L = useLayout();
  const P = L.portrait;
  const sosOn = frame >= wev("feat.sos");
  const rows: { at: number; icon: IconName; title: string; sub: string }[] = [
    { at: wev("feat.sapphire"), icon: "sapphire", title: "Écran saphir", sub: "Cristal saphir plat" },
    { at: wev("feat.battery"), icon: "battery", title: "Jusqu'à 50 h", sub: "d'autonomie" },
    { at: wev("feat.gps"), icon: "pin", title: "GPS double fréquence", sub: "Précision maximale" },
    sosOn
      ? { at: wev("feat.sos"), icon: "satellite", title: "SOS par satellite*", sub: "Même sans réseau" }
      : { at: wev("feat.nosignal"), icon: "nosignal", title: "Pas de réseau ?", sub: "" },
  ];
  const G = P
    ? { watch: { cx: 505, top: 228, w: 300 }, x: 80, w: 850, y0: 610, dy: 112, h: 98, title: 38, sub: 24, icon: 58, foot: { x: 80, y: 1068, w: 850, size: 22 } }
    : { watch: { cx: 190, top: 120, w: 270 }, x: 360, w: 670, y0: 70, dy: 140, h: 120, title: 40, sub: 25, icon: 62, foot: { x: 360, y: 640, w: 670, size: 20 } };
  const lastRow = rows.reduce((acc, r, i) => (frame >= r.at ? i : acc), -1);
  const t = frame / 30;
  const bumpAt = rows.filter((r) => frame >= r.at).map((r) => r.at).pop() ?? -100;
  const bump = interpolate(frame - bumpAt, [0, 3, 10], [1, 1.06, 1], clamp);
  const sweep = interpolate(frame, [bumpAt, bumpAt + 14], [-0.3, 1.3], clamp);
  const enter = sp(frame, wev("feat.sapphire") - 8, { damping: 14, stiffness: 120 });

  return (
    <SceneShell id="features">
      <div
        style={{
          position: "absolute",
          left: G.watch.cx - G.watch.w / 2,
          top: G.watch.top,
          transform: `translateY(${(1 - enter) * -300 + Math.sin(t * Math.PI) * 8}px) scale(${bump * lerp(0.6, 1, enter)}) rotate(${Math.sin(t * Math.PI * 0.7) * 3}deg)`,
          opacity: Math.min(1, enter * 1.5),
          filter: "drop-shadow(0 26px 34px rgba(6,14,90,0.45))",
        }}
      >
        <WatchImage width={G.watch.w} sweep={sweep} />
      </div>
      {rows.map((r, i) => {
        if (frame < r.at - 1) return null;
        const p = sp(frame, r.at, { damping: 14, stiffness: 180 });
        const swap = i === 3 && sosOn ? sp(frame, wev("feat.sos"), { damping: 10, stiffness: 240 }) : 1;
        const active = i === lastRow;
        const draw = ramp(frame, r.at + 1, r.at + 12);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: G.x,
              top: G.y0 + i * G.dy,
              width: G.w,
              height: G.h,
              display: "flex",
              alignItems: "center",
              gap: 20,
              padding: "0 24px 0 16px",
              borderRadius: 30,
              background: `rgba(255,255,255,${active ? 0.26 : 0.13})`,
              border: `2px solid rgba(255,255,255,${active ? 0.8 : 0.4})`,
              backdropFilter: "blur(14px)",
              boxShadow: active ? "0 16px 36px rgba(6,14,90,0.3)" : "none",
              opacity: Math.min(1, p * 1.4),
              transform: `translateX(${(1 - p) * 300}px) scale(${(active ? 1 : 0.97) * lerp(0.92, 1, swap)})`,
              transformOrigin: "left center",
            }}
          >
            <div style={{ width: G.icon + 18, height: G.icon + 18, borderRadius: 22, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <LineIcon name={r.icon} size={G.icon} progress={draw} stroke={6} />
            </div>
            <div style={{ fontFamily: FONT, color: "#fff", lineHeight: 1.08 }}>
              <div style={{ fontWeight: 900, fontSize: G.title, whiteSpace: "nowrap" }}>{r.title}</div>
              {r.sub ? <div style={{ fontWeight: 600, fontSize: G.sub, opacity: 0.9 }}>{r.sub}</div> : null}
            </div>
          </div>
        );
      })}
      {/* satellite availability footnote (Morocco is not on Apple's list of supported countries) */}
      <div
        style={{
          position: "absolute",
          left: G.foot.x,
          top: G.foot.y,
          width: G.foot.w,
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: G.foot.size,
          color: "#fff",
          opacity: 0.9 * ramp(frame, wev("feat.sos") + 4, wev("feat.sos") + 12),
          textShadow: "0 2px 8px rgba(6,14,90,0.5)",
        }}
      >
        *Fonction satellite disponible uniquement dans certains pays (pas au Maroc à ce jour).
      </div>
    </SceneShell>
  );
};
