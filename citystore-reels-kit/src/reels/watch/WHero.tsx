import React from "react";
import { interpolate, random } from "remotion";
import { FONT } from "../../brand";
import { lerp, ramp, shake, sp } from "../../anim";
import { useLayout } from "../../layout";
import { IconName, LineIcon } from "../../components/Icons";
import { SceneShell, useSceneFrame } from "../../components/SceneShell";
import { WatchImage } from "./WatchImage";
import { wev } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Verified on apple.com (see reels/watch/SOURCES): 49 mm, black titanium case, Burgundy Trail Loop.
const CALLOUTS: { icon: IconName; value: string; label: string; at: string }[] = [
  { icon: "ruler", value: "49 mm", label: "Boîtier Ultra", at: "hero.size" },
  { icon: "seal", value: "Titane noir", label: "Titane grade 5", at: "hero.titanium" },
  { icon: "watch", value: "Trail Loop", label: "Bracelet bordeaux", at: "hero.band" },
];

/** 3.0-8.0 s HERO: the watch floats in (3D tilt, sweep, reflection) with the spoken spec callouts. */
export const WHero: React.FC = () => {
  const frame = useSceneFrame("hero");
  const L = useLayout();
  const P = L.portrait;
  const G = P
    ? { head: 232, headSize: 52, watch: { cx: 655, top: 330, w: 480 }, calls: [430, 610, 790].map((y) => ({ x: 36, y, side: -1 })), callW: 360 }
    : { head: 40, headSize: 40, watch: { cx: 300, top: 110, w: 360 }, calls: [180, 350, 520].map((y) => ({ x: 600, y, side: 1 })), callW: 400 };
  const t = frame / 30;
  const enter = sp(frame, wev("hero.watch"), { damping: 13, stiffness: 95, mass: 0.9 });
  const rotY = lerp(-40, 0, enter) + Math.sin(t * Math.PI * 0.55) * 10;
  const rotZ = lerp(14, -4, enter) + Math.sin(t * Math.PI * 0.8) * 2;
  const floatY = Math.sin(t * Math.PI * 1.1) * 12;
  const sweepAt = [wev("hero.watch") + 8, wev("hero.titanium"), wev("hero.sparkle")].filter((s) => frame >= s).pop() ?? -100;
  const sweep = interpolate(frame, [sweepAt, sweepAt + 16], [-0.3, 1.3], clamp);
  const head = sp(frame, wev("hero.watch") + 2);
  const sk = shake(frame, wev("hero.watch") + 6, 10, 8);
  const ww = G.watch.w;
  const wh = ww * (716 / 618);

  // sparkles on "كيحمّق"
  const sparkles = Array.from({ length: 12 }).map((_, i) => {
    const s = wev("hero.sparkle") + i * 1.5;
    const k = (frame - s) / 14;
    if (k < 0 || k > 1) return null;
    const x = G.watch.cx + (random(`sx-${i}`) - 0.5) * ww * 1.1;
    const y = G.watch.top + random(`sy-${i}`) * wh;
    const size = (24 + random(`sz-${i}`) * 36) * Math.sin(Math.PI * k);
    return (
      <svg key={i} viewBox="-10 -10 20 20" style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, transform: `rotate(${k * 90}deg)` }}>
        <path d="M0 -10 L2 -2 L10 0 L2 2 L0 10 L-2 2 L-10 0 L-2 -2 Z" fill="#fff" />
      </svg>
    );
  });

  return (
    <SceneShell id="hero" shakeX={sk.x} shakeY={sk.y}>
      <div style={{ position: "absolute", left: 0, right: P ? 70 : 0, top: G.head, textAlign: P ? "center" : "left", paddingLeft: P ? 0 : 40, fontFamily: FONT, fontWeight: 900, fontSize: G.headSize, color: "#fff", opacity: head, transform: `translateY(${(1 - head) * -40}px)`, textShadow: "0 4px 18px rgba(8,20,110,0.35)" }}>
        Apple Watch Ultra 4
      </div>
      <div style={{ position: "absolute", left: G.watch.cx - 520, top: G.watch.top + wh * 0.5, width: 1040, height: 560, background: "radial-gradient(ellipse at center, rgba(255,255,255,0.3), rgba(255,255,255,0) 65%)", opacity: ramp(frame, wev("hero.watch"), wev("hero.watch") + 10) }} />
      <div style={{ position: "absolute", inset: 0, perspective: 1400 }}>
        <div
          style={{
            position: "absolute",
            left: G.watch.cx - ww / 2,
            top: G.watch.top,
            transform: `translateY(${(1 - enter) * 1000 + floatY}px) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${lerp(0.7, 1, enter)})`,
            filter: "drop-shadow(0 34px 44px rgba(6,14,90,0.5))",
          }}
        >
          <WatchImage width={ww} sweep={sweep} reflection={0.18} />
        </div>
      </div>
      {sparkles}
      {CALLOUTS.map((c, i) => {
        const s = wev(c.at);
        const p = sp(frame, s, { damping: 15, stiffness: 170 });
        const pos = G.calls[i];
        const draw = ramp(frame, s + 2, s + 14);
        return (
          <div
            key={c.value}
            style={{
              position: "absolute",
              left: pos.x,
              top: pos.y,
              width: G.callW,
              opacity: Math.min(1, p * 1.4),
              transform: `translateX(${(1 - p) * 260 * pos.side}px)`,
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "14px 22px 14px 16px",
              borderRadius: 28,
              background: "rgba(255,255,255,0.16)",
              border: "2px solid rgba(255,255,255,0.55)",
              backdropFilter: "blur(14px)",
              boxShadow: "0 12px 30px rgba(6,14,90,0.25)",
            }}
          >
            <div style={{ width: 66, height: 66, borderRadius: 20, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <LineIcon name={c.icon} size={50} progress={draw} stroke={6} />
            </div>
            <div style={{ fontFamily: FONT, color: "#fff", lineHeight: 1.05 }}>
              <div style={{ fontWeight: 900, fontSize: 38, whiteSpace: "nowrap" }}>{c.value}</div>
              <div style={{ fontWeight: 600, fontSize: 24, opacity: 0.9, whiteSpace: "nowrap" }}>{c.label}</div>
            </div>
          </div>
        );
      })}
    </SceneShell>
  );
};
