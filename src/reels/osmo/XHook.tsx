import React from "react";
import { interpolate, random } from "remotion";
import { COLORS, FONT } from "../../brand";
import { lerp, pop, ramp, shake, slam, sp } from "../../anim";
import { useLayout } from "../../layout";
import { LineIcon } from "../../components/Icons";
import { ProductImage } from "../../components/ProductImage";
import { Burst, SceneShell, useSceneFrame } from "../../components/SceneShell";
import { OFFICIAL, xev } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Generic phone filming a shaky, tilted landscape (not any real phone). */
const ShakyPhone: React.FC<{ frame: number; w: number; level: number }> = ({ frame, w, level }) => {
  const h = w * 1.85;
  const jx = (random(`px-${frame}`) - 0.5) * 26 * level, jy = (random(`py-${frame}`) - 0.5) * 26 * level;
  const rot = Math.sin(frame * 0.9) * 7 * level;
  const blur = 1.5 + 4 * level;
  return (
    <div style={{ width: w, height: h, borderRadius: w * 0.16, background: "#11131a", padding: w * 0.05, boxShadow: "0 24px 50px rgba(6,14,90,0.45)" }}>
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: w * 0.11, overflow: "hidden", background: "#8fd3ff" }}>
        <div style={{ position: "absolute", inset: -60, transform: `translate(${jx}px, ${jy}px) rotate(${rot}deg)`, filter: `blur(${blur}px)` }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: "55%", background: "linear-gradient(#5cb8ff, #bfe6ff)" }} />
          <div style={{ position: "absolute", left: "55%", top: "18%", width: w * 0.22, height: w * 0.22, borderRadius: "50%", background: "#FFE07A" }} />
          <svg viewBox="0 0 100 60" preserveAspectRatio="none" style={{ position: "absolute", left: 0, right: 0, top: "35%", width: "100%", height: "35%" }}>
            <path d="M0 60 L22 18 L38 40 L58 8 L80 36 L100 22 L100 60 Z" fill="#4f6e8f" />
          </svg>
          <div style={{ position: "absolute", left: 0, right: 0, top: "62%", bottom: 0, background: "#6aa56a" }} />
        </div>
        <div style={{ position: "absolute", left: 12, top: 12, display: "flex", alignItems: "center", gap: 6, fontFamily: FONT, fontWeight: 800, fontSize: w * 0.08, color: "#fff" }}>
          <div style={{ width: w * 0.06, height: w * 0.06, borderRadius: "50%", background: "#FF3B5C", opacity: Math.floor(frame / 8) % 2 ? 1 : 0.3 }} />
          REC
        </div>
      </div>
    </div>
  );
};

/*
 * 0.0-4.0 s HOOK ("content creator still filming with your phone? this video is for you")
 * visual: shaky, blurry phone footage that gets worse; on "هاد الفيديو ليك!" the phone is crossed out
 *         and the official Osmo Pocket 4 slams in
 * written: "CONTENT CREATOR ?" -> "هاد الفيديو ليك!"   verbal: VO line 1
 */
export const XHook: React.FC = () => {
  const frame = useSceneFrame("hook");
  const L = useLayout();
  const P = L.portrait;
  const G = P
    ? { title: 236, tsize: 84, phone: { x: 110, y: 380, w: 230 }, osmo: { x: 650, y: 260, w: 200 } }
    : { title: 40, tsize: 60, phone: { x: 90, y: 130, w: 170 }, osmo: { x: 780, y: 100, w: 150 } };
  const crAt = xev("hook.creator"), phAt = xev("hook.phone"), you = xev("hook.you");
  const level = interpolate(frame, [0, phAt, phAt + 10], [0.3, 0.5, 1], clamp);
  const phoneIn = sp(frame, 2, { damping: 13, stiffness: 160 });
  const out = ramp(frame, you + 4, you + 14);
  const cross = ramp(frame, you, you + 6);
  const osmo = sp(frame, you, { damping: 11, stiffness: 150, mass: 0.8 });
  const sk = shake(frame, you, 16, 11);
  const t1 = slam(frame, crAt, 2);
  const t2 = slam(frame, you, 2.4);
  const t = frame / 30;
  return (
    <SceneShell id="hook" shakeX={sk.x} shakeY={sk.y}>
      <Burst x={G.osmo.x + G.osmo.w / 2} y={G.osmo.y + G.osmo.w} r={P ? 900 : 640} rot={frame * 0.6} opacity={0.22 * osmo} rays={20} />
      <div style={{ position: "absolute", left: 0, right: P ? 70 : 0, top: G.title, display: "flex", justifyContent: "center" }}>
        {frame < you ? (
          frame >= crAt - 1 && (
            <div style={{ ...t1, fontFamily: FONT, fontWeight: 900, fontSize: G.tsize * 0.8, color: COLORS.blue, background: "#fff", padding: "4px 30px 10px", borderRadius: 20, whiteSpace: "nowrap", boxShadow: "0 12px 30px rgba(6,14,90,0.3)" }}>
              CONTENT CREATOR ?
            </div>
          )
        ) : (
          <div dir="rtl" style={{ ...t2, fontFamily: FONT, fontWeight: 900, fontSize: G.tsize * 1.15, color: "#fff", lineHeight: 1.2, whiteSpace: "nowrap", textShadow: "0 10px 34px rgba(8,20,110,0.45)" }}>
            هاد الفيديو ليك!
          </div>
        )}
      </div>
      {/* the shaky phone, crossed out and pushed away */}
      <div style={{ position: "absolute", left: G.phone.x, top: G.phone.y, transform: `translateX(${(1 - phoneIn) * -500 - out * 500}px) rotate(${-8 - out * 20}deg) scale(${lerp(1, 0.8, out)})`, opacity: 1 - out }}>
        <ShakyPhone frame={frame} w={G.phone.w} level={level} />
        <svg viewBox="0 0 100 100" style={{ position: "absolute", inset: -20, width: G.phone.w + 40, height: G.phone.w * 1.85 + 40 }} preserveAspectRatio="none">
          <path d={`M 10 10 L ${10 + 80 * cross} ${10 + 80 * cross}`} stroke="#FF3B5C" strokeWidth={7} strokeLinecap="round" />
          <path d={`M 90 10 L ${90 - 80 * cross} ${10 + 80 * cross}`} stroke="#FF3B5C" strokeWidth={7} strokeLinecap="round" />
        </svg>
        {frame >= phAt && frame < you && (
          <div style={{ position: "absolute", left: G.phone.w * 0.05, top: G.phone.w * 1.85 + 18, transform: `scale(${pop(frame, phAt)}) rotate(-6deg)`, fontFamily: FONT, fontWeight: 900, fontSize: G.phone.w * 0.15, color: "#fff", background: "#FF3B5C", padding: "2px 16px 6px", borderRadius: 12, whiteSpace: "nowrap" }}>
            ça tremble…
          </div>
        )}
      </div>
      {/* the Osmo Pocket 4 slams in */}
      {frame >= you - 1 && (
        <div style={{ position: "absolute", left: G.osmo.x, top: G.osmo.y, transform: `translateY(${(1 - osmo) * -900 + Math.sin(t * Math.PI * 1.1) * 8}px) rotate(${lerp(-20, 3, osmo)}deg) scale(${lerp(1.4, 1, osmo)})`, filter: "drop-shadow(0 30px 40px rgba(6,14,90,0.5))" }}>
          <ProductImage src={OFFICIAL.pocket4.src} aspect={OFFICIAL.pocket4.aspect} width={G.osmo.w} sweep={interpolate(frame, [you + 6, you + 22], [-0.3, 1.3], clamp)} />
        </div>
      )}
      <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: Math.max(interpolate(frame, [0, 1, 7], [0.7, 0.7, 0], clamp), interpolate(frame - you, [0, 1, 7], [0, 0.7, 0], clamp)) }} />
    </SceneShell>
  );
};

/** 4.0-10.0 s INTRO: Osmo Pocket 4 + Pocket 3 Creator Combo, DISPONIBLES. */
export const XIntro: React.FC = () => {
  const frame = useSceneFrame("intro");
  const L = useLayout();
  const P = L.portrait;
  const G = P
    ? { title: 236, tsize: 64, a: { x: 120, y: 360, w: 250 }, b: { x: 520, y: 360, w: 370 }, lab: 1050, labSize: 34, pill: { x: 340, y: 1160, size: 40 } }
    : { title: 46, tsize: 48, a: { x: 120, y: 150, w: 160 }, b: { x: 330, y: 150, w: 240 }, lab: 600, labSize: 26, pill: { x: 640, y: 560, size: 32 } };
  const aAt = xev("intro.p4"), bAt = xev("intro.p3");
  const a = sp(frame, aAt, { damping: 12, stiffness: 120, mass: 0.8 });
  const b = sp(frame, bAt, { damping: 12, stiffness: 120, mass: 0.8 });
  const sk = shake(frame, aAt, 12, 8);
  const sk2 = shake(frame, bAt, 12, 8);
  const head = slam(frame, aAt - 6, 2);
  const dispo = slam(frame, xev("intro.dispo"), 1.8);
  const t = frame / 30;
  const label = (text: string, at: number, x: number, w: number) => (
    <div style={{ position: "absolute", left: x - 40, width: w + 80, top: G.lab, display: "flex", justifyContent: "center", opacity: ramp(frame, at + 4, at + 10) }}>
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: G.labSize, color: "#fff", textAlign: "center", lineHeight: 1.1, whiteSpace: "pre-line", textShadow: "0 4px 16px rgba(8,20,110,0.4)" }}>{text}</div>
    </div>
  );
  return (
    <SceneShell id="intro" shakeX={sk.x + sk2.x} shakeY={sk.y + sk2.y}>
      <div style={{ position: "absolute", left: P ? 0 : 600, right: P ? 70 : 40, top: G.title, display: "flex", justifyContent: "center" }}>
        <div style={{ ...head, fontFamily: FONT, fontWeight: 900, fontSize: G.tsize, color: "#fff", letterSpacing: 2, whiteSpace: "nowrap", textShadow: "0 10px 30px rgba(8,20,110,0.4)" }}>DJI OSMO</div>
      </div>
      <div style={{ position: "absolute", left: G.a.x, top: G.a.y, transform: `translateX(${(1 - a) * -900}px) rotate(${lerp(-18, -3, a) + Math.sin(t * Math.PI * 0.7) * 1.5}deg) translateY(${Math.sin(t * Math.PI * 1.1) * 8}px)`, filter: "drop-shadow(0 30px 40px rgba(6,14,90,0.45))" }}>
        <ProductImage src={OFFICIAL.pocket4.src} aspect={OFFICIAL.pocket4.aspect} width={G.a.w} sweep={interpolate(frame, [aAt + 6, aAt + 22], [-0.3, 1.3], clamp)} />
      </div>
      {frame >= bAt - 1 && (
        <div style={{ position: "absolute", left: G.b.x, top: G.b.y, transform: `translateX(${(1 - b) * 900}px) rotate(${lerp(18, 2, b) + Math.sin(t * Math.PI * 0.6 + 1) * 1.5}deg) translateY(${Math.sin(t * Math.PI * 1.1 + 1) * 8}px)`, filter: "drop-shadow(0 30px 40px rgba(6,14,90,0.45))" }}>
          <ProductImage src={OFFICIAL.combo.src} aspect={OFFICIAL.combo.aspect} width={G.b.w} sweep={interpolate(frame, [bAt + 6, bAt + 22], [-0.3, 1.3], clamp)} />
        </div>
      )}
      {P && label("Osmo Pocket 4", aAt, G.a.x, G.a.w)}
      {P && label("Osmo Pocket 3\nCreator Combo", bAt, G.b.x, G.b.w)}
      {!P && (
        <div style={{ position: "absolute", left: 640, top: 160, display: "flex", flexDirection: "column", gap: 16, fontFamily: FONT, fontWeight: 900, fontSize: 40, color: "#fff" }}>
          <div style={{ opacity: ramp(frame, aAt + 4, aAt + 10) }}>Osmo Pocket 4</div>
          <div style={{ opacity: ramp(frame, bAt + 4, bAt + 10), lineHeight: 1.1 }}>Osmo Pocket 3<br />Creator Combo</div>
        </div>
      )}
      {frame >= xev("intro.dispo") - 1 && (
        <div style={{ position: "absolute", left: G.pill.x, right: P ? 70 : 40, top: G.pill.y, display: "flex", justifyContent: "center" }}>
          <div style={{ ...dispo, display: "flex", alignItems: "center", gap: 14, fontFamily: FONT, fontWeight: 900, fontSize: G.pill.size, color: COLORS.blue, background: "#fff", padding: "10px 30px", borderRadius: 999, letterSpacing: 3, boxShadow: "0 10px 26px rgba(6,14,90,0.3)" }}>
            <LineIcon name="store" size={G.pill.size * 1.3} stroke={7} color={COLORS.blue} />
            DISPONIBLES
          </div>
        </div>
      )}
    </SceneShell>
  );
};
