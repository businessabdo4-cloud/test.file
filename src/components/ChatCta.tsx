import React from "react";
import { Img, interpolate, staticFile } from "remotion";
import { COLORS, FONT } from "../brand";
import { SOCIAL } from "../config";
import { lerp, pop, ramp, slam, sp } from "../anim";
import { useLayout } from "../layout";
import { FacebookGlyph, LineIcon } from "./Icons";
import { PhoneArt } from "./PhoneArt";
import { SceneShell, useSceneFrame } from "./SceneShell";
import { evIn, sceneIn, useTL } from "../timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Generic chat screen for the phone mockup (not a copy of any messaging app). */
const ChatScreen: React.FC<{ frame: number; message: string }> = ({ frame, message: MSG }) => {
  const TL = useTL();
  const at = evIn(TL, "cta.message");
  const typed = Math.round(interpolate(frame, [sceneIn(TL, "cta").from + 4, at], [0, MSG.length], clamp));
  const sent = pop(frame, at);
  return (
    <div style={{ width: 276, height: 594, background: "#f3f5fb", fontFamily: FONT, position: "relative", overflow: "hidden" }}>
      <div style={{ height: 64 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", background: "#fff", borderBottom: "1px solid #e3e6f0" }}>
        <Img src={staticFile("logo/logo.png")} style={{ width: 40, height: 40, borderRadius: "50%" }} />
        <div style={{ lineHeight: 1.1 }}>
          <div style={{ fontWeight: 900, fontSize: 16, color: "#0b1030" }}>City Store</div>
          <div style={{ fontWeight: 600, fontSize: 12, color: "#20a35a" }}>● En ligne</div>
        </div>
      </div>
      {frame >= at && (
        <div style={{ position: "absolute", right: 12, top: 150, maxWidth: 210, padding: "10px 14px", borderRadius: "18px 18px 4px 18px", background: `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.cyan})`, color: "#fff", fontWeight: 700, fontSize: 15, lineHeight: 1.3, transform: `scale(${sent})`, transformOrigin: "bottom right" }}>
          {MSG}
        </div>
      )}
      <div style={{ position: "absolute", left: 10, right: 10, bottom: 16, height: 44, borderRadius: 22, background: "#fff", border: "1px solid #dfe3ee", display: "flex", alignItems: "center", padding: "0 6px 0 14px", gap: 8 }}>
        <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: frame >= at ? "#9aa0b8" : "#0b1030", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {frame >= at ? "Message…" : MSG.slice(0, typed)}
        </div>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: COLORS.blue, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${interpolate(frame - at, [-2, 0, 4], [1, 0.8, 1], clamp)})` }}>
          <svg viewBox="0 0 24 24" width={18} height={18}><path d="M3 12 L21 4 L14 21 L11 13 Z" fill="#fff" /></svg>
        </div>
      </div>
    </div>
  );
};

/** CTA scene shared by the Darija reels: "صيفط لينا ميساج، ولا دخل لـ citystore.ma" + chat mockup + socials. */
export const ChatCta: React.FC<{ message: string }> = ({ message }) => {
  const frame = useSceneFrame("cta");
  const TL = useTL();
  const wev = (k: string) => evIn(TL, k);
  const wscene = (id: string) => sceneIn(TL, id);
  const L = useLayout();
  const P = L.portrait;
  const G = P
    ? { headX: 0, headW: 1010, head: 226, headSize: 64, url: 330, urlSize: 88, align: "center" as const, phone: { cx: 690, top: 480, w: 290 }, ig: { x: 50, y: 660 }, fb: { x: 50, y: 830 }, pill: 42 }
    : { headX: 60, headW: 560, head: 50, headSize: 50, url: 140, urlSize: 68, align: "flex-start" as const, phone: { cx: 830, top: 96, w: 245 }, ig: { x: 60, y: 320 }, fb: { x: 60, y: 450 }, pill: 38 };
  const enter = sp(frame, wscene("cta").from, { damping: 14, stiffness: 120 });
  const float = Math.sin((frame / 30) * Math.PI * 0.9) * 10;
  const pill = (start: number, children: React.ReactNode, pos: { x: number; y: number }) => {
    const p = sp(frame, start, { damping: 12, stiffness: 200 });
    return (
      <div style={{ position: "absolute", left: pos.x, top: pos.y, display: "flex", alignItems: "center", gap: 16, padding: `${G.pill * 0.3}px ${G.pill * 0.7}px ${G.pill * 0.3}px ${G.pill * 0.3}px`, borderRadius: 999, background: "rgba(255,255,255,0.18)", border: "2px solid rgba(255,255,255,0.6)", backdropFilter: "blur(14px)", boxShadow: "0 14px 34px rgba(6,14,90,0.3)", transform: `translateX(${(1 - p) * -300}px) scale(${lerp(0.6, 1, p)})`, opacity: Math.min(1, p * 1.5), fontFamily: FONT, fontWeight: 800, fontSize: G.pill, color: "#fff", whiteSpace: "nowrap" }}>
        {children}
      </div>
    );
  };
  return (
    <SceneShell id="cta">
      <div style={{ position: "absolute", left: G.headX, width: G.headW, top: G.head, display: "flex", justifyContent: G.align }}>
        <div dir="rtl" style={{ ...slam(frame, wscene("cta").from + 2, 1.6), display: "flex", alignItems: "center", gap: 16, fontFamily: FONT, fontWeight: 900, fontSize: G.headSize, color: "#fff", textShadow: "0 6px 22px rgba(8,20,110,0.35)" }}>
          صيفط لينا ميساج
          <LineIcon name="chat" size={G.headSize * 1.05} stroke={7} progress={ramp(frame, wscene("cta").from + 4, wscene("cta").from + 16)} />
        </div>
      </div>
      <div style={{ position: "absolute", left: G.headX, width: G.headW, top: G.url, display: "flex", justifyContent: G.align }}>
        <div style={{ ...slam(frame, wev("cta.url"), 2.2), fontFamily: FONT, fontWeight: 900, fontSize: G.urlSize, color: COLORS.blue, background: "#fff", padding: `${G.urlSize * 0.1}px ${G.urlSize * 0.4}px`, borderRadius: G.urlSize * 0.3, boxShadow: "0 16px 40px rgba(6,14,90,0.35)", letterSpacing: -1 }}>
          {SOCIAL.website}
        </div>
      </div>
      <div style={{ position: "absolute", left: G.phone.cx - G.phone.w / 2, top: G.phone.top, transform: `translateY(${(1 - enter) * 900 + float}px) rotate(${lerp(18, -5, enter)}deg)`, filter: "drop-shadow(0 34px 44px rgba(6,14,90,0.45))" }}>
        <PhoneArt id="wcta-phone" model="pro" colour={{ name: "Silver", hex: "#E3E4E6" }} view="front" width={G.phone.w} screen={<ChatScreen frame={frame} message={message} />} />
      </div>
      {pill(wev("cta.socials"), <><div style={{ width: G.pill * 1.6, height: G.pill * 1.6, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><LineIcon name="instagram" size={G.pill * 1.15} progress={ramp(frame, wev("cta.socials"), wev("cta.socials") + 10)} stroke={8} /></div>{SOCIAL.instagram}</>, G.ig)}
      {pill(wev("cta.socials") + 8, <><FacebookGlyph size={G.pill * 1.6} />{SOCIAL.facebook}</>, G.fb)}
    </SceneShell>
  );
};
