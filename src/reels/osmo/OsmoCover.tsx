import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS, FONT } from "../../brand";
import { BrandBackground } from "../../components/BrandBackground";
import { Burst } from "../../components/SceneShell";
import { ProductImage } from "../../components/ProductImage";
import { Citybot } from "../../citybot/Citybot";
import { OFFICIAL } from "./timeline";

/** 1080x1920 cover for the DJI Osmo reel (key content inside the centre 4:5 band). */
export const OsmoCover: React.FC = () => {
  const heavy: React.CSSProperties = { fontFamily: FONT, fontWeight: 900, color: "#fff", lineHeight: 1, textShadow: "0 10px 34px rgba(8,20,110,0.4)", whiteSpace: "nowrap" };
  return (
    <AbsoluteFill>
      <BrandBackground drift={false} />
      <Burst x={600} y={1050} r={1100} rot={8} opacity={0.22} rays={20} />
      <div style={{ position: "absolute", top: 280, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div dir="rtl" style={{ background: "#fff", color: COLORS.blue, fontFamily: FONT, fontWeight: 900, fontSize: 52, padding: "0 40px 10px", borderRadius: 999 }}>باقي كتصوّر بالتيليفون؟</div>
        <div style={{ ...heavy, fontSize: 72, letterSpacing: 4, marginTop: 14 }}>DJI OSMO</div>
        <div style={{ ...heavy, fontSize: 92, letterSpacing: -2 }}>Pocket 4 & Pocket 3</div>
        <div style={{ ...heavy, fontSize: 40, letterSpacing: 6, color: COLORS.blue, background: "#fff", padding: "6px 24px 10px", borderRadius: 14, textShadow: "none" }}>CREATOR COMBO</div>
      </div>
      <div style={{ position: "absolute", left: 380, top: 760, transform: "rotate(-4deg)", filter: "drop-shadow(0 40px 50px rgba(6,14,90,0.5))" }}>
        <ProductImage src={OFFICIAL.pocket4.src} aspect={OFFICIAL.pocket4.aspect} width={250} sweep={0.45} />
      </div>
      <div style={{ position: "absolute", left: 690, top: 800, transform: "rotate(5deg)", filter: "drop-shadow(0 40px 50px rgba(6,14,90,0.5))" }}>
        <ProductImage src={OFFICIAL.combo.src} aspect={OFFICIAL.combo.aspect} width={360} sweep={0.6} />
      </div>
      <div style={{ position: "absolute", left: 20, top: 1080 }}>
        <Citybot id="xcover" width={400} expression="excited" mouth="grin" tilt={-6} rightArm={{ rot: 72, hand: "thumb" }} leftArm={{ rot: 30, hand: "open" }} hover={12} />
      </div>
      <div style={{ position: "absolute", top: 1610, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div dir="rtl" style={{ transform: "rotate(-4deg)", background: "#fff", color: COLORS.blue, fontFamily: FONT, fontWeight: 900, fontSize: 58, padding: "4px 40px 14px", borderRadius: 20, boxShadow: "0 16px 40px rgba(6,14,90,0.35)" }}>
          متوفرين عند CITY STORE
        </div>
      </div>
    </AbsoluteFill>
  );
};
