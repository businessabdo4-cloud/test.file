import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS, FONT } from "../../brand";
import { BrandBackground } from "../../components/BrandBackground";
import { Burst } from "../../components/SceneShell";
import { ProductImage } from "../../components/ProductImage";
import { Citybot } from "../../citybot/Citybot";
import { IMG } from "./timeline";

/** 1080x1920 cover for the Galaxy Watch reel (key content inside the centre 4:5 band). */
export const GalaxyCover: React.FC = () => {
  const heavy: React.CSSProperties = { fontFamily: FONT, fontWeight: 900, color: "#fff", lineHeight: 1, textShadow: "0 10px 34px rgba(8,20,110,0.4)" };
  return (
    <AbsoluteFill>
      <BrandBackground drift={false} />
      <Burst x={560} y={1080} r={1100} rot={8} opacity={0.22} rays={20} />
      <div style={{ position: "absolute", top: 300, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <div dir="rtl" style={{ background: "#fff", color: COLORS.blue, fontFamily: FONT, fontWeight: 900, fontSize: 50, padding: "0 38px 8px", borderRadius: 999 }}>الجديد في SAMSUNG</div>
        <div style={{ ...heavy, fontSize: 132, letterSpacing: -3, marginTop: 14, whiteSpace: "nowrap" }}>Galaxy Watch</div>
        <div style={{ ...heavy, fontSize: 84, display: "flex", gap: 26, alignItems: "center" }}>
          <span>8 Classic</span>
          <span style={{ width: 14, height: 14, borderRadius: "50%", background: "#fff" }} />
          <span>Ultra2</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: 330, top: 820, transform: "rotate(-8deg)", filter: "drop-shadow(0 40px 50px rgba(6,14,90,0.5))" }}>
        <ProductImage src={IMG.classicAngle.src} aspect={IMG.classicAngle.aspect} width={430} sweep={0.4} />
      </div>
      <div style={{ position: "absolute", left: 640, top: 900, transform: "rotate(8deg)", filter: "drop-shadow(0 40px 50px rgba(6,14,90,0.5))" }}>
        <ProductImage src={IMG.ultraAngle.src} aspect={IMG.ultraAngle.aspect} width={410} />
      </div>
      <div style={{ position: "absolute", left: 10, top: 1010 }}>
        <Citybot id="gcover" width={380} expression="excited" mouth="grin" tilt={6} lookX={0.7} lookY={-0.2} rightArm={{ rot: 128, hand: "point" }} leftArm={{ rot: 40, hand: "open" }} hover={12} />
      </div>
      <div style={{ position: "absolute", top: 1590, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div dir="rtl" style={{ transform: "rotate(-4deg)", background: "#fff", color: COLORS.blue, fontFamily: FONT, fontWeight: 900, fontSize: 60, padding: "4px 40px 14px", borderRadius: 20, boxShadow: "0 16px 40px rgba(6,14,90,0.35)" }}>
          وصل لـ CITY STORE!
        </div>
      </div>
    </AbsoluteFill>
  );
};
