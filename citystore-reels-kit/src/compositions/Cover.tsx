import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { COLORS, FONT } from "../brand";
import { BrandBackground } from "../components/BrandBackground";
import { Burst } from "../components/SceneShell";
import { PhoneArt } from "../components/PhoneArt";
import { Citybot } from "../citybot/Citybot";
import { IPHONE } from "../config";
import { PRODUCTS } from "../timeline";

/** 1080x1920 cover / thumbnail. Key content sits inside the centre 4:5 band (profile grid crop). */
export const Cover: React.FC = () => {
  const burgundy = IPHONE.colours.find((c) => c.name === "Burgundy")!;
  const heavy: React.CSSProperties = { fontFamily: FONT, fontWeight: 900, color: "#fff", lineHeight: 1, textShadow: "0 10px 34px rgba(8,20,110,0.4)" };
  return (
    <AbsoluteFill>
      <BrandBackground drift={false} />
      <Burst x={540} y={980} r={1100} rot={8} opacity={0.22} rays={20} />
      <div style={{ position: "absolute", top: 300, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div style={{ background: "#fff", color: COLORS.blue, fontFamily: FONT, fontWeight: 900, fontSize: 44, letterSpacing: 6, padding: "10px 34px", borderRadius: 999 }}>NOUVEAU</div>
        <div style={{ ...heavy, fontSize: 170, letterSpacing: -3, marginTop: 14 }}>iPhone</div>
        <div style={{ ...heavy, fontSize: 230, letterSpacing: -6 }}>18 Pro</div>
        <div style={{ ...heavy, fontSize: 66, fontWeight: 800, marginTop: 6 }}>&amp; Pro Max</div>
      </div>
      {PRODUCTS["iphone-18-pro-max_burgundy_pair"] ? (
        <div style={{ position: "absolute", left: 480, top: 905, width: 520, height: 520 * (500 / 408), transform: "rotate(6deg)", filter: "drop-shadow(0 40px 50px rgba(6,14,90,0.5))" }}>
          <Img src={staticFile(PRODUCTS["iphone-18-pro-max_burgundy_pair"])} style={{ width: "100%", height: "100%" }} />
        </div>
      ) : (
        <>
          <div style={{ position: "absolute", left: 470, top: 860, transform: "rotate(8deg)", filter: "drop-shadow(0 40px 50px rgba(6,14,90,0.5))" }}>
            <PhoneArt id="cv-max" model="pro-max" colour={burgundy} view="back" width={300} sweep={0.55} />
          </div>
          <div style={{ position: "absolute", left: 700, top: 940, transform: "rotate(14deg)", filter: "drop-shadow(0 40px 50px rgba(6,14,90,0.5))" }}>
            <PhoneArt id="cv-pro" model="pro" colour={IPHONE.colours[0]} view="front" width={250} />
          </div>
        </>
      )}
      <div style={{ position: "absolute", left: 40, top: 960 }}>
        <Citybot id="cover" width={440} expression="excited" mouth="grin" tilt={6} lookX={0.7} lookY={-0.2} rightArm={{ rot: 128, hand: "point" }} leftArm={{ rot: 40, hand: "open" }} hover={12} />
      </div>
      <div style={{ position: "absolute", top: 1560, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ transform: "rotate(-4deg)", background: "#fff", color: COLORS.blue, fontFamily: FONT, fontWeight: 900, fontSize: 56, padding: "14px 38px", borderRadius: 20, boxShadow: "0 16px 40px rgba(6,14,90,0.35)" }}>
          DISPO CHEZ CITY STORE
        </div>
      </div>
    </AbsoluteFill>
  );
};
