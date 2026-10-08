import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS, FONT } from "../../brand";
import { BrandBackground } from "../../components/BrandBackground";
import { Burst } from "../../components/SceneShell";
import { ProductImage } from "../../components/ProductImage";
import { Citybot } from "../../citybot/Citybot";
import { OFFICIAL } from "./timeline";

/** 1080x1920 cover for the OnePlus Watch 3 reel (key content inside the centre 4:5 band). */
export const OneplusCover: React.FC = () => {
  const heavy: React.CSSProperties = { fontFamily: FONT, fontWeight: 900, color: "#fff", lineHeight: 1, textShadow: "0 10px 34px rgba(8,20,110,0.4)", whiteSpace: "nowrap" };
  return (
    <AbsoluteFill>
      <BrandBackground drift={false} />
      <Burst x={600} y={1050} r={1100} rot={8} opacity={0.22} rays={20} />
      <div style={{ position: "absolute", top: 280, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div dir="rtl" style={{ background: "#fff", color: COLORS.blue, fontFamily: FONT, fontWeight: 900, fontSize: 58, padding: "0 40px 10px", borderRadius: 999 }}>أيام بلا شارج!</div>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 16 }}>
          <div style={{ ...heavy, fontSize: 112, letterSpacing: -3 }}>OnePlus Watch</div>
          <div style={{ ...heavy, fontSize: 118, color: COLORS.blue, background: "#fff", padding: "0 28px 6px", borderRadius: 22, textShadow: "none" }}>3</div>
        </div>
        <div style={{ ...heavy, fontSize: 44, letterSpacing: 6, opacity: 0.95 }}>EMERALD TITANIUM</div>
      </div>
      <div style={{ position: "absolute", left: 400, top: 700, transform: "rotate(5deg)", filter: "drop-shadow(0 40px 50px rgba(6,14,90,0.5))" }}>
        <ProductImage src={OFFICIAL.angle.src} aspect={OFFICIAL.angle.aspect} width={600} sweep={0.45} />
      </div>
      <div style={{ position: "absolute", left: 20, top: 1060 }}>
        <Citybot id="ocover" width={400} expression="happy" mouth="grin" tilt={-6} rightArm={{ rot: 72, hand: "thumb" }} leftArm={{ rot: 30, hand: "open" }} hover={12} />
      </div>
      <div style={{ position: "absolute", top: 1600, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div dir="rtl" style={{ transform: "rotate(-4deg)", background: "#fff", color: COLORS.blue, fontFamily: FONT, fontWeight: 900, fontSize: 58, padding: "4px 40px 14px", borderRadius: 20, boxShadow: "0 16px 40px rgba(6,14,90,0.35)" }}>
          متوفرة عند CITY STORE
        </div>
      </div>
    </AbsoluteFill>
  );
};
