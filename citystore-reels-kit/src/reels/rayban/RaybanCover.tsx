import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS, FONT } from "../../brand";
import { BrandBackground } from "../../components/BrandBackground";
import { Burst } from "../../components/SceneShell";
import { ProductImage } from "../../components/ProductImage";
import { Citybot } from "../../citybot/Citybot";
import { LENS, OFFICIAL } from "./timeline";

/** 1080x1920 cover for the Ray-Ban Meta reel (key content inside the centre 4:5 band). */
export const RaybanCover: React.FC = () => {
  const heavy: React.CSSProperties = { fontFamily: FONT, fontWeight: 900, color: "#fff", lineHeight: 1, textShadow: "0 10px 34px rgba(8,20,110,0.4)", whiteSpace: "nowrap" };
  return (
    <AbsoluteFill>
      <BrandBackground drift={false} />
      <Burst x={540} y={1000} r={1100} rot={8} opacity={0.22} rays={20} />
      <div style={{ position: "absolute", top: 290, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <div dir="rtl" style={{ background: "#fff", color: COLORS.blue, fontFamily: FONT, fontWeight: 900, fontSize: 54, padding: "0 40px 8px", borderRadius: 999 }}>ماشي غير نضاضر…</div>
        <div style={{ ...heavy, fontSize: 124, letterSpacing: -3, marginTop: 20 }}>Ray-Ban Meta</div>
        <div style={{ ...heavy, fontSize: 64, color: COLORS.blue, background: "#fff", padding: "4px 30px 10px", borderRadius: 20, textShadow: "none" }}>Gen 2</div>
      </div>
      <div style={{ position: "absolute", left: 60, top: 760, transform: "rotate(-5deg)", filter: "drop-shadow(0 34px 44px rgba(6,14,90,0.5))" }}>
        <ProductImage src={OFFICIAL.headlinerAngle.src} aspect={OFFICIAL.headlinerAngle.aspect} width={640} sweep={0.45} />
      </div>
      <div style={{ position: "absolute", left: 400, top: 980, transform: "rotate(4deg)", filter: "drop-shadow(0 34px 44px rgba(6,14,90,0.5))" }}>
        <ProductImage src={OFFICIAL.wayfarerAngle.src} aspect={OFFICIAL.wayfarerAngle.aspect} width={620} sweep={0.6} />
      </div>
      <div style={{ position: "absolute", left: 20, top: 1080 }}>
        <Citybot id="rcover" width={380} expression="happy" mouth="grin" tilt={-6} rightArm={{ rot: 72, hand: "thumb" }} leftArm={{ rot: 30, hand: "open" }} hover={12} glasses={{ p: 1, lens: LENS.graphite, led: 0.6 }} />
      </div>
      <div style={{ position: "absolute", top: 1600, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div dir="rtl" style={{ transform: "rotate(-4deg)", background: "#fff", color: COLORS.blue, fontFamily: FONT, fontWeight: 900, fontSize: 58, padding: "4px 40px 14px", borderRadius: 20, boxShadow: "0 16px 40px rgba(6,14,90,0.35)" }}>
          متوفرين عند CITY STORE
        </div>
      </div>
    </AbsoluteFill>
  );
};
