import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS, FONT } from "../../brand";
import { BrandBackground } from "../../components/BrandBackground";
import { Burst } from "../../components/SceneShell";
import { Hamza } from "./Hamza";
import { Foldable, Match, SmallPhone } from "./Props";

/** 1080x1920 thumbnail: Hamza squinting at a tiny phone (left), the unfolded iPhone Duo with the match (right). */
export const DuoCover: React.FC = () => {
  const tiny = (
    <div style={{ transform: "translate(-10%, -10%) rotate(-8deg)" }}>
      <SmallPhone w={62}>
        <Match w={52} h={100} t={2} ball={1} />
      </SmallPhone>
    </div>
  );
  return (
    <AbsoluteFill>
      <BrandBackground drift={false} />
      <Burst x={700} y={900} r={1100} rot={8} opacity={0.22} rays={20} />
      <div style={{ position: "absolute", top: 250, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <div dir="rtl" style={{ fontFamily: FONT, fontWeight: 900, fontSize: 120, color: "#fff", lineHeight: 1.1, textShadow: "0 10px 34px rgba(8,20,110,0.45)", whiteSpace: "nowrap" }}>الكورة قد النملة</div>
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 54, color: COLORS.blue, background: "#fff", padding: "4px 34px 10px", borderRadius: 999 }}>iPhone Duo</div>
      </div>
      <div style={{ position: "absolute", left: 470, top: 640, transform: "rotate(5deg)" }}>
        <Foldable W={560} open={1} inner={(w, h) => <Match w={w} h={h} t={2} ball={9} glow={1} />} />
      </div>
      <div style={{ position: "absolute", left: 20, top: 760 }}>
        <Hamza width={500} expression="squint" tilt={6} lean={10} lookX={0.4} lookY={0.5} rightArm={{ rot: -6, bend: 100, hand: "hold" }} leftArm={{ rot: 8, bend: 12, hand: "open" }} holdRight={tiny} />
      </div>
      <div style={{ position: "absolute", top: 1660, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div dir="rtl" style={{ transform: "rotate(-4deg)", background: "#fff", color: COLORS.blue, fontFamily: FONT, fontWeight: 900, fontSize: 58, padding: "4px 40px 14px", borderRadius: 20, boxShadow: "0 16px 40px rgba(6,14,90,0.35)" }}>
          متوفر عند CITY STORE
        </div>
      </div>
    </AbsoluteFill>
  );
};
