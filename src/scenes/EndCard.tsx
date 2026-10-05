import React from "react";
import { Img, interpolate, staticFile } from "remotion";
import { FONT } from "../brand";
import { SOCIAL } from "../config";
import { lerp, shake, slam, sp } from "../anim";
import { useLayout } from "../layout";
import { evIn, useTL } from "../timeline";
import { LineIcon } from "../components/Icons";
import { SceneShell, useSceneFrame } from "../components/SceneShell";
import logo from "../../public/logo/layout.json";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 26.0-30.0 s END CARD: logo rebuilt from the real wordmark; final frame held from 29.0 s. */
/** tagline: optional slogan pill (e.g. Darija) shown instead of the Instagram handle, at event "end.tagline". */
export const EndCard: React.FC<{ tagline?: string }> = ({ tagline }) => {
  const frame = useSceneFrame("end");
  const TL = useTL();
  const ev = (k: string) => evIn(TL, k);
  const L = useLayout();
  const P = L.portrait;
  const box = P ? { x: 75, y: 220, size: 860 } : { x: 30, y: 170, size: 640 };
  const k = box.size / logo.size;
  const at = (b: { x: number; y: number; w: number; h: number }): React.CSSProperties => ({
    position: "absolute",
    left: box.x + b.x * k,
    top: box.y + b.y * k,
    width: b.w * k,
    height: b.h * k,
  });

  const cityAt = ev("end.city");
  const city = slam(frame, cityAt, 1.9);
  const sk = shake(frame, cityAt, 20, 10);
  const typed = Math.max(0, Math.min(8, Math.floor((frame - ev("end.typeStart")) / (TL.fps * (TL.eventsSec["end.typeStep"] as number))) + 1));
  const typeEndFrame = ev("end.typeStart") + Math.round(8 * TL.fps * (TL.eventsSec["end.typeStep"] as number));
  const clipW = typed === 0 ? 0 : logo.storemaLetters[typed - 1] + 8;
  const cursorOn = frame >= ev("end.typeStart") - 6 && (frame < typeEndFrame + 12 ? Math.floor(frame / 4) % 2 === 0 || frame < typeEndFrame : false);
  const iconStep = TL.fps * (TL.eventsSec["end.iconStep"] as number);
  const sweep = interpolate(frame, [ev("end.wink") - 10, ev("end.wink") + 8], [-0.3, 1.3], clamp);
  const handleAt = tagline && TL.events["end.tagline"] !== undefined ? ev("end.tagline") : ev("end.icons") + 14;
  const handle = sp(frame, handleAt, { damping: 14, stiffness: 160 });

  return (
    <SceneShell id="end" shakeX={sk.x} shakeY={sk.y} noOut>
      <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: interpolate(frame - cityAt, [0, 1, 7], [0, 0.4, 0], clamp) }} />
      {/* CITY */}
      <div style={{ ...at(logo.city), ...city }}>
        <Img src={staticFile(logo.city.file)} style={{ width: "100%", height: "100%" }} />
        {sweep > -0.3 && sweep < 1.3 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              WebkitMaskImage: `url(${staticFile(logo.city.file)})`,
              WebkitMaskSize: "100% 100%",
              background: `linear-gradient(105deg, rgba(255,255,255,0) ${sweep * 140 - 30}%, rgba(120,225,255,1) ${sweep * 140 - 15}%, rgba(255,255,255,0) ${sweep * 140}%)`,
            }}
          />
        )}
      </div>
      {/* STORE.MA typing */}
      <div style={{ ...at(logo.storema), overflow: "hidden", width: clipW * k }}>
        <Img src={staticFile(logo.storema.file)} style={{ width: logo.storema.w * k, height: logo.storema.h * k, maxWidth: "none" }} />
      </div>
      {cursorOn && (
        <div style={{ position: "absolute", left: box.x + (logo.storema.x + clipW + 6) * k, top: box.y + (logo.storema.y + 10) * k, width: 10 * k, height: (logo.storema.h - 20) * k, background: "#fff", borderRadius: 3 }} />
      )}
      {/* icon row */}
      {logo.icons.map((ic, i) => {
        const s = ev("end.icons") + Math.round(i * iconStep);
        const p = sp(frame, s, { damping: 9, stiffness: 260, mass: 0.5 });
        return (
          <div key={i} style={{ ...at(ic), transform: `scale(${p}) translateY(${(1 - p) * 30}px) rotate(${lerp(-25, 0, p)}deg)`, opacity: Math.min(1, p * 2) }}>
            <Img src={staticFile(ic.file)} style={{ width: "100%", height: "100%" }} />
          </div>
        );
      })}
      {/* handle */}
      <div
        style={{
          position: "absolute",
          left: P ? 0 : box.x,
          width: P ? 1010 : box.size,
          top: box.y + (tagline ? 856 : 868) * k,
          display: "flex",
          justifyContent: "center",
          opacity: handle,
          transform: `translateY(${(1 - handle) * 24}px)`,
        }}
      >
        {tagline ? (
          <div dir="rtl" style={{ fontFamily: FONT, fontWeight: 900, fontSize: P ? 46 : 38, color: "#2E3EFE", background: "#fff", borderRadius: 999, padding: "0 30px 8px", boxShadow: "0 12px 30px rgba(6,14,90,0.3)", transform: `scale(${0.7 + 0.3 * handle}) rotate(${(1 - handle) * -6}deg)` }}>
            {tagline}
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontFamily: FONT, fontWeight: 800, fontSize: P ? 40 : 32, color: "#fff", background: "rgba(255,255,255,0.16)", border: "2px solid rgba(255,255,255,0.55)", borderRadius: 999, padding: "8px 26px 8px 12px" }}>
            <LineIcon name="instagram" size={P ? 46 : 38} stroke={8} />
            {SOCIAL.instagram}
          </div>
        )}
      </div>
    </SceneShell>
  );
};
