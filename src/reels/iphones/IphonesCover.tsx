import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS, FONT } from "../../brand";
import { BrandBackground } from "../../components/BrandBackground";
import { Burst } from "../../components/SceneShell";
import { ProductImage } from "../../components/ProductImage";
import { Citybot } from "../../citybot/Citybot";
import { OFFICIAL } from "./timeline";
import { SimCard } from "./IHook";

/** 1080x1920 cover for the iPhone 18 Pro / 17 Pro reel (key content inside the centre 4:5 band). */
export const IphonesCover: React.FC = () => {
  const heavy: React.CSSProperties = { fontFamily: FONT, fontWeight: 900, color: "#fff", lineHeight: 1, textShadow: "0 10px 34px rgba(8,20,110,0.4)", whiteSpace: "nowrap" };
  return (
    <AbsoluteFill>
      <BrandBackground drift={false} />
      <Burst x={540} y={1000} r={1100} rot={8} opacity={0.22} rays={20} />
      <div style={{ position: "absolute", top: 280, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={{ background: "#fff", color: COLORS.blue, fontFamily: FONT, fontWeight: 900, fontSize: 52, padding: "4px 40px 10px", borderRadius: 999 }}>18 Pro wla 17 Pro?</div>
        <div style={{ ...heavy, fontSize: 104, letterSpacing: -2, marginTop: 16 }}>iPhone 18 Pro</div>
        <div style={{ ...heavy, fontSize: 76, opacity: 0.95 }}>& iPhone 17 Pro</div>
      </div>
      <div style={{ position: "absolute", left: 90, top: 720, transform: "rotate(-5deg)", filter: "drop-shadow(0 40px 50px rgba(6,14,90,0.5))" }}>
        <ProductImage src={OFFICIAL.p18Burgundy.src} aspect={OFFICIAL.p18Burgundy.aspect} width={430} sweep={0.45} />
      </div>
      <div style={{ position: "absolute", left: 560, top: 760, transform: "rotate(5deg)", filter: "drop-shadow(0 40px 50px rgba(6,14,90,0.5))" }}>
        <ProductImage src={OFFICIAL.p17Orange.src} aspect={OFFICIAL.p17Orange.aspect} width={430} sweep={0.6} />
      </div>
      <div style={{ position: "absolute", left: 470, top: 1060, transform: "rotate(-10deg)", filter: "drop-shadow(0 16px 26px rgba(6,14,90,0.5))" }}>
        <SimCard w={140} />
      </div>
      <div style={{ position: "absolute", left: 10, top: 1150 }}>
        <Citybot id="icover" width={360} expression="excited" mouth="grin" tilt={-6} rightArm={{ rot: 72, hand: "thumb" }} leftArm={{ rot: 30, hand: "open" }} hover={12} />
      </div>
      <div style={{ position: "absolute", top: 1610, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div dir="rtl" style={{ transform: "rotate(-4deg)", background: "#fff", color: COLORS.blue, fontFamily: FONT, fontWeight: 900, fontSize: 58, padding: "4px 40px 14px", borderRadius: 20, boxShadow: "0 16px 40px rgba(6,14,90,0.35)" }}>
          متوفرين عند CITY STORE
        </div>
      </div>
    </AbsoluteFill>
  );
};
