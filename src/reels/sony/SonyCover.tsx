import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS, FONT } from "../../brand";
import { BrandBackground } from "../../components/BrandBackground";
import { Burst } from "../../components/SceneShell";
import { HeadphoneArt, SONY_COLOURS } from "../../components/HeadphoneArt";
import { Citybot } from "../../citybot/Citybot";
import { OFFICIAL } from "./timeline";

/** 1080x1920 cover for the Sony reel (key content inside the centre 4:5 band). */
export const SonyCover: React.FC = () => {
  const heavy: React.CSSProperties = { fontFamily: FONT, fontWeight: 900, color: "#fff", lineHeight: 1, textShadow: "0 10px 34px rgba(8,20,110,0.4)" };
  return (
    <AbsoluteFill>
      <BrandBackground drift={false} />
      <Burst x={560} y={1080} r={1100} rot={8} opacity={0.22} rays={20} />
      <div style={{ position: "absolute", top: 300, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div dir="rtl" style={{ background: "#fff", color: COLORS.blue, fontFamily: FONT, fontWeight: 900, fontSize: 54, padding: "0 40px 8px", borderRadius: 999 }}>ما سامع والو!</div>
        <div style={{ ...heavy, fontSize: 64, marginTop: 18 }}>Sony</div>
        <div style={{ ...heavy, fontSize: 150, letterSpacing: -4, whiteSpace: "nowrap" }}>WH-1000XM6</div>
      </div>
      <div style={{ position: "absolute", left: 470, top: 880, transform: "rotate(-6deg)", filter: "drop-shadow(0 40px 50px rgba(6,14,90,0.5))" }}>
        <HeadphoneArt id="cover-xm6" width={520} colour={SONY_COLOURS.blue} sweep={0.45} official={OFFICIAL.xm6Blue} />
      </div>
      <div style={{ position: "absolute", left: 30, top: 990 }}>
        <Citybot id="scover" width={420} expression="happy" mouth="smile" tilt={-6} rightArm={{ rot: 72, hand: "thumb" }} leftArm={{ rot: 30, hand: "open" }} hover={12} headphones={{ color: SONY_COLOURS.black, p: 1 }} />
      </div>
      <div style={{ position: "absolute", top: 1590, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div dir="rtl" style={{ transform: "rotate(-4deg)", background: "#fff", color: COLORS.blue, fontFamily: FONT, fontWeight: 900, fontSize: 60, padding: "4px 40px 14px", borderRadius: 20, boxShadow: "0 16px 40px rgba(6,14,90,0.35)" }}>
          متوفرين عند CITY STORE
        </div>
      </div>
    </AbsoluteFill>
  );
};
