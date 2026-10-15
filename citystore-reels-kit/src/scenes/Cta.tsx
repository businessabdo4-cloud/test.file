import React from "react";
import { Img, interpolate, staticFile } from "remotion";
import { COLORS, FONT } from "../brand";
import { SOCIAL } from "../config";
import { lerp, pop, ramp, slam, sp } from "../anim";
import { useLayout } from "../layout";
import { ev, scene } from "../timeline";
import { FacebookGlyph, IconName, LineIcon } from "../components/Icons";
import { PhoneArt } from "../components/PhoneArt";
import { SceneShell, useSceneFrame } from "../components/SceneShell";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const TILES: IconName[] = ["phone", "laptop", "watch", "headphones", "controller", "camera"];

/** Generic social-profile screen for the phone mockup (not a copy of any app UI). */
const ProfileScreen: React.FC<{ frame: number }> = ({ frame }) => {
  const tap = ev("cta.tap");
  const tapped = frame >= tap + 3;
  const ripple = ramp(frame, tap, tap + 12);
  const press = interpolate(frame - tap, [0, 3, 8], [1, 0.9, 1], clamp);
  return (
    <div style={{ width: 276, height: 594, background: "#fff", fontFamily: FONT, position: "relative", overflow: "hidden" }}>
      <div style={{ height: 70 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "0 18px" }}>
        <div style={{ width: 74, height: 74, borderRadius: "50%", padding: 3, background: `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.cyan})` }}>
          <Img src={staticFile("logo/logo.png")} style={{ width: 68, height: 68, borderRadius: "50%", border: "3px solid #fff" }} />
        </div>
        <div style={{ lineHeight: 1.15 }}>
          <div style={{ fontWeight: 900, fontSize: 20, color: "#0b1030" }}>City Store</div>
          <div style={{ fontWeight: 600, fontSize: 15, color: "#5a6080" }}>{SOCIAL.instagram}</div>
        </div>
      </div>
      <div style={{ padding: "12px 18px 0", fontSize: 13, fontWeight: 600, color: "#30365a", lineHeight: 1.35 }}>
        Smartphones · Laptops · Gaming
        <br />
        {SOCIAL.website}
      </div>
      <div style={{ padding: "14px 18px", position: "relative" }}>
        <div
          style={{
            height: 40,
            borderRadius: 12,
            background: tapped ? "#eef1fb" : `linear-gradient(90deg, ${COLORS.blue}, ${COLORS.cyan})`,
            color: tapped ? "#0b1030" : "#fff",
            fontWeight: 800,
            fontSize: 17,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${press})`,
          }}
        >
          {tapped ? "Abonné ✓" : "Suivre"}
        </div>
        {frame >= tap && ripple < 1 && (
          <div style={{ position: "absolute", left: 138 - 60 * ripple, top: 34 - 60 * ripple, width: 120 * ripple, height: 120 * ripple, borderRadius: "50%", background: "rgba(47,59,255,0.25)", opacity: 1 - ripple }} />
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 3, padding: "0 0" }}>
        {TILES.map((t, i) => (
          <div key={t} style={{ aspectRatio: "1", background: `linear-gradient(${120 + i * 25}deg, ${COLORS.blue}, ${COLORS.cyan})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LineIcon name={t} size={50} stroke={6} />
          </div>
        ))}
      </div>
      {/* finger tap indicator */}
      {frame >= tap - 10 && frame < tap + 16 && (
        <div
          style={{
            position: "absolute",
            left: 120,
            top: lerp(320, 222, ramp(frame, tap - 10, tap)),
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "rgba(11,16,48,0.25)",
            border: "3px solid rgba(255,255,255,0.9)",
            opacity: interpolate(frame - tap, [-10, -6, 10, 16], [0, 1, 1, 0], clamp),
          }}
        />
      )}
    </div>
  );
};

/** 20.0-26.0 s CTA: order on citystore.ma, write us on Instagram / Facebook. */
export const Cta: React.FC = () => {
  const frame = useSceneFrame("cta");
  const L = useLayout();
  const P = L.portrait;
  const G = P
    ? { headX: 0, headW: 1010, head: 236, headSize: 46, url: 300, urlSize: 92, align: "center" as const, phone: { cx: 690, top: 480, w: 290 }, ig: { x: 50, y: 660 }, fb: { x: 50, y: 830 }, pill: 42 }
    : { headX: 60, headW: 560, head: 64, headSize: 38, url: 118, urlSize: 70, align: "flex-start" as const, phone: { cx: 830, top: 96, w: 245 }, ig: { x: 60, y: 300 }, fb: { x: 60, y: 430 }, pill: 38 };
  const enter = sp(frame, scene("cta").from, { damping: 14, stiffness: 110 });
  const float = Math.sin((frame / 30) * Math.PI * 0.9) * 10;
  const pill = (start: number, children: React.ReactNode, pos: { x: number; y: number }, from: number) => {
    const p = sp(frame, start, { damping: 12, stiffness: 200 });
    return (
      <div
        style={{
          position: "absolute",
          left: pos.x,
          top: pos.y,
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: `${G.pill * 0.3}px ${G.pill * 0.7}px ${G.pill * 0.3}px ${G.pill * 0.3}px`,
          borderRadius: 999,
          background: "rgba(255,255,255,0.18)",
          border: "2px solid rgba(255,255,255,0.6)",
          backdropFilter: "blur(14px)",
          boxShadow: "0 14px 34px rgba(6,14,90,0.3)",
          transform: `translateX(${(1 - p) * from}px) scale(${lerp(0.6, 1, p)})`,
          opacity: Math.min(1, p * 1.5),
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: G.pill,
          color: "#fff",
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </div>
    );
  };
  const igIcon = ramp(frame, ev("cta.instagram"), ev("cta.instagram") + 10);
  return (
    <SceneShell id="cta">
      <div style={{ position: "absolute", left: G.headX, width: G.headW, top: G.head, display: "flex", justifyContent: G.align }}>
        <div style={{ ...slam(frame, scene("cta").from + 2, 1.6), fontFamily: FONT, fontWeight: 800, fontSize: G.headSize, color: "#fff", letterSpacing: 4 }}>COMMANDEZ SUR</div>
      </div>
      <div style={{ position: "absolute", left: G.headX, width: G.headW, top: G.url, display: "flex", justifyContent: G.align }}>
        <div
          style={{
            ...slam(frame, ev("cta.url"), 2.2),
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: G.urlSize,
            color: COLORS.blue,
            background: "#fff",
            padding: `${G.urlSize * 0.12}px ${G.urlSize * 0.4}px`,
            borderRadius: G.urlSize * 0.3,
            boxShadow: "0 16px 40px rgba(6,14,90,0.35)",
            letterSpacing: -1,
          }}
        >
          {SOCIAL.website}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: G.phone.cx - G.phone.w / 2,
          top: G.phone.top,
          transform: `translateY(${(1 - enter) * 900 + float}px) rotate(${lerp(18, -5, enter)}deg)`,
          filter: "drop-shadow(0 34px 44px rgba(6,14,90,0.45))",
        }}
      >
        <PhoneArt id="cta-phone" model="pro" colour={{ name: "Silver", hex: "#E3E4E6" }} view="front" width={G.phone.w} screen={<ProfileScreen frame={frame} />} />
      </div>

      {pill(
        ev("cta.instagram"),
        <>
          <div style={{ width: G.pill * 1.6, height: G.pill * 1.6, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LineIcon name="instagram" size={G.pill * 1.15} progress={igIcon} stroke={8} />
          </div>
          {SOCIAL.instagram}
        </>,
        G.ig,
        -300,
      )}
      {pill(
        ev("cta.facebook"),
        <>
          <div style={{ transform: `scale(${pop(frame, ev("cta.facebook") + 2)})`, display: "flex" }}>
            <FacebookGlyph size={G.pill * 1.6} />
          </div>
          {SOCIAL.facebook}
        </>,
        G.fb,
        -300,
      )}
    </SceneShell>
  );
};
