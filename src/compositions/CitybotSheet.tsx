import React from "react";
import { AbsoluteFill } from "remotion";
import { COLORS, FONT } from "../brand";
import { BrandBackground } from "../components/BrandBackground";
import { Citybot } from "../citybot/Citybot";
import { MOUTHS, VISEMES } from "../citybot/Mouths";

const Label: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 30 }) => (
  <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: size, color: COLORS.white, textAlign: "center", letterSpacing: 1, textShadow: "0 3px 12px rgba(8,20,110,.35)" }}>
    {children}
  </div>
);

/** Approval still: front pose + 3 expressions + the 9 Rhubarb mouth shapes. */
export const CitybotSheet: React.FC = () => (
  <AbsoluteFill>
    <BrandBackground drift={false} />
    <div style={{ position: "absolute", left: 70, top: 46 }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 64, color: "#fff", letterSpacing: 2 }}>CITYBOT</div>
      <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 26, color: "#fff", opacity: 0.85 }}>
        Mascotte City Store · fiche personnage (pose de face + 3 expressions + bouches)
      </div>
    </div>

    {/* front pose */}
    <div style={{ position: "absolute", left: 60, top: 170, width: 560, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Citybot id="front" width={470} mouth="smile" expression="neutral" leftArm={{ rot: 18, hand: "open" }} rightArm={{ rot: 18, hand: "open" }} />
      <Label>FACE · neutre</Label>
    </div>

    {/* expressions */}
    <div style={{ position: "absolute", left: 640, top: 200, display: "flex", gap: 40 }}>
      {[
        { label: "EXCITÉ (hook)", props: { expression: "excited" as const, mouth: "grin" as const, leftArm: { rot: 118, hand: "wave" as const }, rightArm: { rot: 118, hand: "wave" as const }, tilt: -4 } },
        { label: "POUCE LEVÉ (original)", props: { expression: "proud" as const, mouth: "smile" as const, rightArm: { rot: 70, hand: "thumb" as const }, tilt: 6 } },
        { label: "CLIN D'ŒIL (fin)", props: { expression: "wink" as const, mouth: "smile" as const, leftArm: { rot: 112, hand: "wave" as const }, tilt: -7 } },
      ].map(({ label, props }, i) => (
        <div key={i} style={{ width: 380, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Citybot id={`ex${i}`} width={330} {...props} />
          <Label size={26}>{label}</Label>
        </div>
      ))}
    </div>

    {/* viseme strip */}
    <div style={{ position: "absolute", left: 640, top: 830, display: "flex", gap: 16 }}>
      {VISEMES.map((v) => (
        <div key={v} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <svg width={118} height={118} viewBox="-50 -45 100 90" style={{ background: `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.cyan})`, borderRadius: 22, border: `5px solid #fff` }}>
            {MOUTHS[v]}
          </svg>
          <Label size={24}>{v}</Label>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);
