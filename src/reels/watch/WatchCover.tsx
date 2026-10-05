import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS, FONT } from "../../brand";
import { BrandBackground } from "../../components/BrandBackground";
import { Burst } from "../../components/SceneShell";
import { Citybot } from "../../citybot/Citybot";
import { WatchImage } from "./WatchImage";

/** 1080x1920 cover for the Apple Watch Ultra 4 reel (key content inside the centre 4:5 band). */
export const WatchCover: React.FC = () => {
  const heavy: React.CSSProperties = { fontFamily: FONT, fontWeight: 900, color: "#fff", lineHeight: 1, textShadow: "0 10px 34px rgba(8,20,110,0.4)" };
  return (
    <AbsoluteFill>
      <BrandBackground drift={false} />
      <Burst x={560} y={1060} r={1100} rot={8} opacity={0.22} rays={20} />
      <div style={{ position: "absolute", top: 300, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <div dir="rtl" style={{ background: "#fff", color: COLORS.blue, fontFamily: FONT, fontWeight: 900, fontSize: 54, padding: "0 40px 8px", borderRadius: 999 }}>الجديد وصل!</div>
        <div style={{ ...heavy, fontSize: 132, letterSpacing: -2, marginTop: 18 }}>Apple Watch</div>
        <div style={{ ...heavy, fontSize: 250, letterSpacing: -7 }}>Ultra 4</div>
      </div>
      <div style={{ position: "absolute", left: 470, top: 860, transform: "rotate(-6deg)", filter: "drop-shadow(0 40px 50px rgba(6,14,90,0.5))" }}>
        <WatchImage width={540} sweep={0.45} />
      </div>
      <div style={{ position: "absolute", left: 30, top: 960 }}>
        <Citybot id="wcover" width={430} expression="excited" mouth="grin" tilt={6} lookX={0.7} lookY={-0.2} rightArm={{ rot: 128, hand: "point" }} leftArm={{ rot: 40, hand: "open" }} hover={12} />
      </div>
      <div style={{ position: "absolute", top: 1560, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div dir="rtl" style={{ transform: "rotate(-4deg)", background: "#fff", color: COLORS.blue, fontFamily: FONT, fontWeight: 900, fontSize: 60, padding: "4px 40px 14px", borderRadius: 20, boxShadow: "0 16px 40px rgba(6,14,90,0.35)" }}>
          وصل لـ CITY STORE!
        </div>
      </div>
    </AbsoluteFill>
  );
};
