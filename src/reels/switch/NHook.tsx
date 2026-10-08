import React from "react";
import { interpolate } from "remotion";
import { COLORS, FONT } from "../../brand";
import { lerp, pop, ramp, shake, slam, sp } from "../../anim";
import { useLayout } from "../../layout";
import { LineIcon } from "../../components/Icons";
import { ProductImage } from "../../components/ProductImage";
import { Burst, SceneShell, useSceneFrame } from "../../components/SceneShell";
import { NEON, nev, OFFICIAL } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Generic TV (not any real brand) showing "someone else's" programme. */
const Tv: React.FC<{ w: number; frame: number }> = ({ w, frame }) => {
  const h = w * 0.6;
  return (
    <div style={{ position: "relative", width: w, height: h + w * 0.1 }}>
      <div style={{ width: w, height: h, borderRadius: w * 0.035, background: "#15171e", padding: w * 0.025, boxShadow: "0 24px 50px rgba(6,14,90,0.45)" }}>
        <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: w * 0.015, overflow: "hidden", background: "linear-gradient(#2fa84f, #1f7a39)" }}>
          {/* a generic football pitch: someone else is watching the match */}
          <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 3, background: "rgba(255,255,255,0.7)" }} />
          <div style={{ position: "absolute", left: "50%", top: "50%", width: w * 0.16, height: w * 0.16, marginLeft: -w * 0.08, marginTop: -w * 0.08, borderRadius: "50%", border: "3px solid rgba(255,255,255,0.7)" }} />
          <div style={{ position: "absolute", left: `${30 + Math.sin(frame * 0.25) * 18}%`, top: `${45 + Math.cos(frame * 0.3) * 18}%`, width: w * 0.035, height: w * 0.035, borderRadius: "50%", background: "#fff" }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: w * 0.42, bottom: 0, width: w * 0.16, height: w * 0.1, background: "#15171e", clipPath: "polygon(30% 0, 70% 0, 100% 100%, 0 100%)" }} />
    </div>
  );
};

/*
 * 0.0-2.0 s HOOK ("your brother took the TV and you want to play? here's the solution!")
 * visual: a TV showing a match gets an "OCCUPÉE" stamp; Citybot sulks; on "هاهوا الحل!" the TV is pushed
 *         away and the official Switch OLED (handheld) slams in
 * written: "خوك شاد التلفزة؟" -> "هاهوا الحل!"   verbal: VO line 1
 */
export const NHook: React.FC = () => {
  const frame = useSceneFrame("hook");
  const L = useLayout();
  const P = L.portrait;
  const G = P
    ? { title: 236, tsize: 92, tv: { x: 250, y: 380, w: 560 }, sw: { x: 70, y: 400, w: 870 } }
    : { title: 40, tsize: 64, tv: { x: 330, y: 130, w: 420 }, sw: { x: 230, y: 140, w: 620 } };
  const tvAt = nev("hook.tv"), playAt = nev("hook.play"), sol = nev("hook.solution");
  const tvIn = sp(frame, 0, { damping: 13, stiffness: 160 });
  const tvOut = ramp(frame, sol, sol + 8);
  const sw = sp(frame, sol, { damping: 11, stiffness: 150, mass: 0.8 });
  const sk = shake(frame, sol, 16, 11);
  const stamp = slam(frame, tvAt, 2.6);
  const t1 = slam(frame, tvAt, 2);
  const t2 = slam(frame, sol, 2.4);
  const t = frame / 30;
  return (
    <SceneShell id="hook" shakeX={sk.x} shakeY={sk.y}>
      <Burst x={G.sw.x + G.sw.w / 2} y={G.sw.y + 180} r={P ? 900 : 640} rot={frame * 0.6} opacity={0.22 * sw} rays={20} />
      <div style={{ position: "absolute", left: 0, right: P ? 70 : 0, top: G.title, display: "flex", justifyContent: "center" }}>
        {frame < sol ? (
          frame >= tvAt - 1 && (
            <div dir="rtl" style={{ ...t1, fontFamily: FONT, fontWeight: 900, fontSize: G.tsize * 0.85, color: "#fff", lineHeight: 1.2, whiteSpace: "nowrap", textShadow: "0 10px 34px rgba(8,20,110,0.45)" }}>
              خوك شاد التلفزة؟
            </div>
          )
        ) : (
          <div dir="rtl" style={{ ...t2, fontFamily: FONT, fontWeight: 900, fontSize: G.tsize, color: COLORS.blue, background: "#fff", padding: "0 36px 10px", borderRadius: 24, lineHeight: 1.3, whiteSpace: "nowrap", boxShadow: "0 14px 34px rgba(6,14,90,0.35)" }}>
            هاهوا الحل!
          </div>
        )}
      </div>
      {/* the TV that's taken */}
      {tvOut < 1 && (
        <div style={{ position: "absolute", left: G.tv.x, top: G.tv.y, transform: `translateY(${(1 - tvIn) * -600}px) translateX(${-tvOut * 900}px) rotate(${-tvOut * 25}deg)`, opacity: 1 - tvOut }}>
          <Tv w={G.tv.w} frame={frame} />
          {frame >= tvAt && (
            <div style={{ position: "absolute", left: 0, right: 0, top: G.tv.w * 0.2, display: "flex", justifyContent: "center" }}>
              <div style={{ ...stamp, transform: `${stamp.transform ?? ""} rotate(-10deg)`, fontFamily: FONT, fontWeight: 900, fontSize: G.tv.w * 0.11, color: "#FF3B5C", border: `${G.tv.w * 0.012}px solid #FF3B5C`, background: "rgba(255,255,255,0.92)", padding: `0 ${G.tv.w * 0.04}px`, borderRadius: 12, letterSpacing: 3 }}>
                OCCUPÉE
              </div>
            </div>
          )}
          {frame >= playAt && (
            <div style={{ position: "absolute", right: -G.tv.w * 0.05, top: -G.tv.w * 0.12, width: G.tv.w * 0.2, height: G.tv.w * 0.2, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pop(frame, playAt)})`, boxShadow: "0 10px 24px rgba(6,14,90,0.35)" }}>
              <LineIcon name="controller" size={G.tv.w * 0.12} stroke={7} color={COLORS.blue} />
              <div style={{ position: "absolute", right: -6, top: -10, fontFamily: FONT, fontWeight: 900, fontSize: G.tv.w * 0.07, color: "#FF3B5C" }}>?</div>
            </div>
          )}
        </div>
      )}
      {/* the solution: the Switch OLED in handheld mode */}
      {frame >= sol - 1 && (
        <div style={{ position: "absolute", left: G.sw.x, top: G.sw.y, transform: `scale(${lerp(2.2, 1, sw)}) rotate(${lerp(-14, -3, sw) + Math.sin(t * Math.PI * 0.7) * 1.5}deg)`, opacity: Math.min(1, sw * 2), filter: "drop-shadow(0 30px 40px rgba(6,14,90,0.5))" }}>
          <ProductImage src={OFFICIAL.handheld.src} aspect={OFFICIAL.handheld.aspect} width={G.sw.w} sweep={interpolate(frame, [sol + 6, sol + 22], [-0.3, 1.3], clamp)} />
        </div>
      )}
      <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: Math.max(interpolate(frame, [0, 1, 7], [0.7, 0.7, 0], clamp), interpolate(frame - sol, [0, 1, 7], [0, 0.75, 0], clamp)) }} />
    </SceneShell>
  );
};

/** 2.0-6.0 s INTRO: Nintendo Switch OLED, DISPONIBLE, noir (Joy-Con néon) & blanc. */
export const NIntro: React.FC = () => {
  const frame = useSceneFrame("intro");
  const L = useLayout();
  const P = L.portrait;
  const G = P
    ? { name: 236, nsize: 78, a: { x: 50, y: 400, w: 520 }, b: { x: 450, y: 640, w: 560 }, sw: { x: 340, y: 1010, size: 58 }, pill: { x: 340, y: 360, size: 34 } }
    : { name: 40, nsize: 56, a: { x: 30, y: 170, w: 380 }, b: { x: 330, y: 380, w: 380 }, sw: { x: 740, y: 330, size: 50 }, pill: { x: 740, y: 200, size: 28 } };
  const nameAt = nev("intro.name"), bAt = nev("intro.black"), wAt = nev("intro.white");
  const a = sp(frame, nameAt, { damping: 12, stiffness: 120, mass: 0.8 });
  const b = sp(frame, nameAt + 8, { damping: 12, stiffness: 120, mass: 0.8 });
  const sk = shake(frame, nameAt, 14, 9);
  const n1 = slam(frame, nameAt, 2);
  const n2 = slam(frame, nev("intro.oled"), 2.6);
  const dispo = slam(frame, nev("intro.dispo"), 1.8);
  const focusB = ramp(frame, bAt, bAt + 5) * (1 - ramp(frame, wAt, wAt + 5));
  const focusW = ramp(frame, wAt, wAt + 5);
  const t = frame / 30;
  const sweepA = interpolate(frame, [bAt, bAt + 16], [-0.3, 1.3], clamp);
  const sweepB = interpolate(frame, [wAt, wAt + 16], [-0.3, 1.3], clamp);
  const swatch = (at: number, label: string, fill: string, active: number, dx: number) =>
    frame >= at - 1 && (
      <div style={{ display: "flex", alignItems: "center", gap: 14, transform: `scale(${pop(frame, at) * (1 + 0.08 * active)})`, transformOrigin: "left center", marginLeft: dx }}>
        <div style={{ width: G.sw.size, height: G.sw.size, borderRadius: "50%", background: fill, boxShadow: `0 0 0 ${4 + 4 * active}px rgba(255,255,255,${0.6 + 0.4 * active}), 0 10px 22px rgba(6,14,90,0.4)` }} />
        <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: G.sw.size * 0.5, color: "#fff", whiteSpace: "nowrap", opacity: 0.7 + 0.3 * active, textShadow: "0 4px 14px rgba(8,20,110,0.35)" }}>{label}</div>
      </div>
    );
  return (
    <SceneShell id="intro" shakeX={sk.x} shakeY={sk.y}>
      <div style={{ position: "absolute", left: P ? 0 : 40, right: P ? 70 : undefined, top: G.name, display: "flex", justifyContent: P ? "center" : "flex-start", alignItems: "center", gap: 18, fontFamily: FONT, fontWeight: 900, whiteSpace: "nowrap" }}>
        <div style={{ ...n1, fontSize: G.nsize, color: "#fff", textShadow: "0 10px 30px rgba(8,20,110,0.4)" }}>Nintendo Switch</div>
        {frame >= nev("intro.oled") - 1 && <div style={{ ...n2, fontSize: G.nsize * 0.8, color: COLORS.blue, background: "#fff", padding: "0 20px 6px", borderRadius: 16 }}>OLED</div>}
      </div>
      {frame >= nev("intro.dispo") - 1 && (
        <div style={{ position: "absolute", left: G.pill.x, right: P ? 70 : 40, top: G.pill.y, display: "flex", justifyContent: P ? "center" : "flex-start" }}>
          <div style={{ ...dispo, display: "flex", alignItems: "center", gap: 12, fontFamily: FONT, fontWeight: 900, fontSize: G.pill.size, color: COLORS.blue, background: "#fff", padding: "8px 26px", borderRadius: 999, letterSpacing: 3, boxShadow: "0 10px 26px rgba(6,14,90,0.3)" }}>
            <LineIcon name="store" size={G.pill.size * 1.3} stroke={7} color={COLORS.blue} />
            DISPONIBLE
          </div>
        </div>
      )}
      <div style={{ position: "absolute", left: G.a.x, top: G.a.y, transform: `translateX(${(1 - a) * -900}px) rotate(${lerp(-16, -3, a)}deg) translateY(${Math.sin(t * Math.PI * 1.1) * 8}px) scale(${1 + 0.06 * focusB})`, filter: `drop-shadow(0 30px 40px rgba(6,14,90,0.45)) brightness(${1 - 0.25 * focusW})` }}>
        <ProductImage src={OFFICIAL.neonDock.src} aspect={OFFICIAL.neonDock.aspect} width={G.a.w} sweep={sweepA} />
      </div>
      <div style={{ position: "absolute", left: G.b.x, top: G.b.y, transform: `translateX(${(1 - b) * 900}px) rotate(${lerp(16, 2, b)}deg) translateY(${Math.sin(t * Math.PI * 1.1 + 1) * 8}px) scale(${1 + 0.06 * focusW})`, filter: `drop-shadow(0 30px 40px rgba(6,14,90,0.45)) brightness(${1 - 0.25 * focusB})` }}>
        <ProductImage src={OFFICIAL.whiteDock.src} aspect={OFFICIAL.whiteDock.aspect} width={G.b.w} sweep={sweepB} />
      </div>
      <div style={{ position: "absolute", left: G.sw.x, top: G.sw.y, display: "flex", flexDirection: "column", gap: 18 }}>
        {swatch(bAt, "Noir · Joy-Con néon", `linear-gradient(135deg, ${NEON.blue} 0 33%, #1d1f25 33% 67%, ${NEON.red} 67%)`, focusB, 0)}
        {swatch(wAt, "Blanc", "radial-gradient(circle at 35% 30%, #ffffff, #e6e8ee)", focusW, 0)}
      </div>
    </SceneShell>
  );
};
