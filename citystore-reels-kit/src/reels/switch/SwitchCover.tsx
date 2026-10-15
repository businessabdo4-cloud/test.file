import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS, FONT } from "../../brand";
import { BrandBackground } from "../../components/BrandBackground";
import { Burst } from "../../components/SceneShell";
import { ProductImage } from "../../components/ProductImage";
import { Citybot } from "../../citybot/Citybot";
import { OFFICIAL } from "./timeline";

/** 1080x1920 cover for the Nintendo Switch OLED reel (key content inside the centre 4:5 band). */
export const SwitchCover: React.FC = () => {
  const heavy: React.CSSProperties = { fontFamily: FONT, fontWeight: 900, color: "#fff", lineHeight: 1, textShadow: "0 10px 34px rgba(8,20,110,0.4)", whiteSpace: "nowrap" };
  return (
    <AbsoluteFill>
      <BrandBackground drift={false} />
      <Burst x={560} y={1020} r={1100} rot={8} opacity={0.22} rays={20} />
      <div style={{ position: "absolute", top: 280, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div dir="rtl" style={{ background: "#fff", color: COLORS.blue, fontFamily: FONT, fontWeight: 900, fontSize: 56, padding: "0 40px 10px", borderRadius: 999 }}>خوك شاد التلفزة؟</div>
        <div style={{ ...heavy, fontSize: 100, letterSpacing: -2, marginTop: 16 }}>Nintendo Switch</div>
        <div style={{ ...heavy, fontSize: 84, color: COLORS.blue, background: "#fff", padding: "4px 30px 12px", borderRadius: 20, textShadow: "none" }}>OLED</div>
      </div>
      <div style={{ position: "absolute", left: 60, top: 720, transform: "rotate(-4deg)", filter: "drop-shadow(0 40px 50px rgba(6,14,90,0.5))" }}>
        <ProductImage src={OFFICIAL.neonDock.src} aspect={OFFICIAL.neonDock.aspect} width={520} sweep={0.45} />
      </div>
      <div style={{ position: "absolute", left: 470, top: 900, transform: "rotate(4deg)", filter: "drop-shadow(0 40px 50px rgba(6,14,90,0.5))" }}>
        <ProductImage src={OFFICIAL.whiteDock.src} aspect={OFFICIAL.whiteDock.aspect} width={560} sweep={0.6} />
      </div>
      <div style={{ position: "absolute", left: 20, top: 1110 }}>
        <Citybot id="ncover" width={380} expression="excited" mouth="grin" tilt={-6} rightArm={{ rot: 72, hand: "thumb" }} leftArm={{ rot: 30, hand: "open" }} hover={12} />
      </div>
      <div style={{ position: "absolute", top: 1610, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div dir="rtl" style={{ transform: "rotate(-4deg)", background: "#fff", color: COLORS.blue, fontFamily: FONT, fontWeight: 900, fontSize: 58, padding: "4px 40px 14px", borderRadius: 20, boxShadow: "0 16px 40px rgba(6,14,90,0.35)" }}>
          متوفرة عند CITY STORE
        </div>
      </div>
    </AbsoluteFill>
  );
};
