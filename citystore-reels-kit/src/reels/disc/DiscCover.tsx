import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS, FONT } from "../../brand";
import { BrandBackground } from "../../components/BrandBackground";
import { Burst } from "../../components/SceneShell";
import { ProductImage } from "../../components/ProductImage";
import { Citybot } from "../../citybot/Citybot";
import { OFFICIAL } from "./timeline";

/** 1080x1920 cover for the PlayStation Disc Drive reel (key content inside the centre 4:5 band). */
export const DiscCover: React.FC = () => {
  const heavy: React.CSSProperties = { fontFamily: FONT, fontWeight: 900, color: "#fff", lineHeight: 1, textShadow: "0 10px 34px rgba(8,20,110,0.4)", whiteSpace: "nowrap" };
  const h = 760;
  return (
    <AbsoluteFill>
      <BrandBackground drift={false} />
      <Burst x={540} y={1000} r={1100} rot={8} opacity={0.22} rays={20} />
      <div style={{ position: "absolute", top: 270, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <div dir="rtl" style={{ background: "#fff", color: COLORS.blue, fontFamily: FONT, fontWeight: 900, fontSize: 52, padding: "0 40px 10px", borderRadius: 999 }}>العب بالـ CD على PS5 ديالك!</div>
        <div style={{ ...heavy, fontSize: 52, letterSpacing: 6, marginTop: 14 }}>PlayStation</div>
        <div style={{ ...heavy, fontSize: 120 }}>Disc Drive</div>
      </div>
      <div style={{ position: "absolute", left: 540 - (h / OFFICIAL.drive.aspect) / 2 + 60, top: 700, transform: "rotate(-4deg)", filter: "drop-shadow(0 40px 50px rgba(6,14,90,0.5))" }}>
        <ProductImage src={OFFICIAL.drive.src} aspect={OFFICIAL.drive.aspect} width={h / OFFICIAL.drive.aspect} sweep={0.45} />
      </div>
      <div style={{ position: "absolute", right: 90, top: 760, transform: "rotate(6deg)", background: "#fff", color: COLORS.blue, fontFamily: FONT, fontWeight: 900, fontSize: 34, padding: "6px 20px 10px", borderRadius: 16, textAlign: "center", lineHeight: 1.2, boxShadow: "0 14px 34px rgba(6,14,90,0.4)" }}>PS5 Slim Digital<br />& PS5 Pro</div>
      <div style={{ position: "absolute", left: 20, top: 1150 }}>
        <Citybot id="dcover" width={370} expression="excited" mouth="grin" tilt={-6} rightArm={{ rot: 72, hand: "thumb" }} leftArm={{ rot: 30, hand: "open" }} hover={12} />
      </div>
      <div style={{ position: "absolute", top: 1610, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div dir="rtl" style={{ transform: "rotate(-4deg)", background: "#fff", color: COLORS.blue, fontFamily: FONT, fontWeight: 900, fontSize: 58, padding: "4px 40px 14px", borderRadius: 20, boxShadow: "0 16px 40px rgba(6,14,90,0.35)" }}>
          متوفر عند CITY STORE
        </div>
      </div>
    </AbsoluteFill>
  );
};
