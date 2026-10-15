import React from "react";
import { evolvePath } from "@remotion/paths";
import { interpolate } from "remotion";
import { COLORS, FONT } from "../../brand";
import { lerp, pop, ramp, shake, slam, sp } from "../../anim";
import { useLayout } from "../../layout";
import { IconName, LineIcon } from "../../components/Icons";
import { ProductImage } from "../../components/ProductImage";
import { Burst, SceneShell, useSceneFrame } from "../../components/SceneShell";
import { OFFICIAL, rev } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/* pin points on headliner_front.png (fractions of the image box) */
const PIN = { camera: [0.04, 0.19], speaker: [0.9, 0.86], ai: [0.5, 0.1] } as const;

/*
 * 0.0-3.5 s HOOK ("these aren't just glasses")
 * visual: the official Headliner Gen 2 slams in; Citybot puts on its own shades; an x-ray scan line
 *         crosses the frame and pins what's inside: camera / open-ear audio / Meta AI
 * written: "ماشي غير نضاضر…" + the three tags
 * verbal: VO lines 1-2a
 */
export const RHook: React.FC = () => {
  const frame = useSceneFrame("hook");
  const L = useLayout();
  const P = L.portrait;
  const G = P
    ? { title: 236, tsize: 104, img: { cx: 505, top: 420, w: 840 }, chip: 40,
        chips: { camera: { x: 60, y: 800 }, speaker: { x: 712, y: 800 }, ai: { x: 60, y: 950 } } }
    : { title: 46, tsize: 70, img: { cx: 540, top: 150, w: 600 }, chip: 30,
        chips: { camera: { x: 60, y: 420 }, speaker: { x: 770, y: 420 }, ai: { x: 60, y: 540 } } };
  const imgH = G.img.w * OFFICIAL.headlinerFront.aspect;
  const slamIn = sp(frame, rev("hook.slam"), { damping: 11, stiffness: 150, mass: 0.8 });
  const sk = shake(frame, 1, 14, 10);
  const t = frame / 30;
  const scanAt = rev("hook.scan");
  const scan = interpolate(frame, [scanAt, scanAt + 14], [-0.05, 1.05], clamp);
  const title = slam(frame, rev("hook.text"), 2.2);
  const x0 = G.img.cx - G.img.w / 2;
  const floatY = Math.sin(t * Math.PI * 0.9) * 8;
  const pinXY = (k: keyof typeof PIN) => ({ x: x0 + PIN[k][0] * G.img.w, y: G.img.top + floatY + PIN[k][1] * imgH });
  const TAGS: { k: keyof typeof PIN; at: number; icon: IconName; text: string; anchor: "left" | "right" }[] = [
    { k: "camera", at: rev("hook.camera"), icon: "camera", text: "Caméra", anchor: "left" },
    { k: "speaker", at: rev("hook.casque"), icon: "headphones", text: "Audio", anchor: "right" },
    { k: "ai", at: rev("hook.ai"), icon: "spark", text: "Meta AI*", anchor: "left" },
  ];
  const chipH = G.chip * 1.9;

  return (
    <SceneShell id="hook" shakeX={sk.x} shakeY={sk.y}>
      <Burst x={G.img.cx} y={G.img.top + imgH / 2} r={P ? 900 : 640} rot={frame * 0.6} opacity={0.2 * slamIn} rays={20} />
      {/* written hook */}
      {frame >= rev("hook.text") - 1 && (
        <div style={{ position: "absolute", left: 0, right: P ? 70 : 0, top: G.title, display: "flex", justifyContent: "center" }}>
          <div dir="rtl" style={{ ...title, fontFamily: FONT, fontWeight: 900, fontSize: G.tsize, color: "#fff", lineHeight: 1.2, whiteSpace: "nowrap", textShadow: "0 10px 34px rgba(8,20,110,0.45)" }}>
            ماشي غير{" "}
            <span style={{ position: "relative", display: "inline-block" }}>
              نضاضر…
              {/* underline swipe on "نضاضر" */}
              <span style={{ position: "absolute", left: 0, right: 0, bottom: G.tsize * 0.02, height: G.tsize * 0.1, borderRadius: 99, background: COLORS.cyan, transform: `scaleX(${ramp(frame, rev("hook.glasses"), rev("hook.glasses") + 8)})`, transformOrigin: "right" }} />
            </span>
          </div>
        </div>
      )}
      {/* the glasses: slam in from huge */}
      <div style={{ position: "absolute", left: x0, top: G.img.top + floatY, transform: `scale(${lerp(2.4, 1, slamIn)}) rotate(${lerp(-12, 0, slamIn) + Math.sin(t * Math.PI * 0.7) * 1.5}deg)`, opacity: Math.min(1, slamIn * 2), filter: "drop-shadow(0 30px 40px rgba(6,14,90,0.5))" }}>
        <ProductImage src={OFFICIAL.headlinerFront.src} aspect={OFFICIAL.headlinerFront.aspect} width={G.img.w} sweep={interpolate(frame, [8, 26], [-0.3, 1.3], clamp)} />
        {/* x-ray scan line */}
        {scan > -0.05 && scan < 1.05 && (
          <div style={{ position: "absolute", top: -30, bottom: -30, left: scan * G.img.w - 3, width: 6, borderRadius: 3, background: "#fff", boxShadow: `0 0 24px 8px ${COLORS.cyan}` }} />
        )}
      </div>
      {/* pins + tag chips with connector lines */}
      <svg width={L.w} height={L.h} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        {TAGS.map((tg) => {
          if (frame < tg.at) return null;
          const p = pinXY(tg.k);
          const c = G.chips[tg.k];
          const cx = tg.anchor === "left" ? c.x + chipH / 2 : c.x + chipH / 2;
          const d = `M ${p.x} ${p.y} L ${cx} ${c.y}`;
          const evo = evolvePath(Math.max(0.0001, ramp(frame, tg.at, tg.at + 8)), d);
          const ring = ((frame - tg.at) % 24) / 24;
          return (
            <g key={tg.k}>
              <path d={d} stroke="#fff" strokeWidth={4} strokeDasharray={evo.strokeDasharray} strokeDashoffset={evo.strokeDashoffset} strokeLinecap="round" opacity={0.9} />
              <circle cx={p.x} cy={p.y} r={10 * pop(frame, tg.at)} fill="#fff" />
              <circle cx={p.x} cy={p.y} r={10 + 26 * ring} fill="none" stroke="#fff" strokeWidth={3} opacity={1 - ring} />
            </g>
          );
        })}
      </svg>
      {TAGS.map((tg) => {
        if (frame < tg.at + 4) return null;
        const p = pop(frame, tg.at + 4);
        const c = G.chips[tg.k];
        return (
          <div key={tg.k} style={{ position: "absolute", left: c.x, top: c.y, height: chipH, display: "flex", alignItems: "center", gap: 14, padding: `0 ${G.chip * 0.7}px 0 ${G.chip * 0.25}px`, borderRadius: 999, background: "#fff", boxShadow: "0 14px 34px rgba(6,14,90,0.35)", transform: `scale(${p})`, transformOrigin: "left center", fontFamily: FONT, fontWeight: 900, fontSize: G.chip, color: COLORS.blue, whiteSpace: "nowrap" }}>
            <div style={{ width: chipH * 0.78, height: chipH * 0.78, borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.cyan})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LineIcon name={tg.icon} size={chipH * 0.5} stroke={7} progress={ramp(frame, tg.at + 4, tg.at + 14)} />
            </div>
            {tg.text}
          </div>
        );
      })}
      {/* camera flash on "كاميرا" + white slam flash at the start */}
      <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: Math.max(interpolate(frame - rev("hook.camera"), [0, 1, 6], [0, 0.55, 0], clamp), interpolate(frame, [0, 1, 7], [0.7, 0.7, 0], clamp)) }} />
    </SceneShell>
  );
};

/** 3.5-6.0 s REVEAL: "Ray-Ban Meta Gen 2", both frames fly in, DISPONIBLE (+ Meta AI footnote). */
export const RIntro: React.FC = () => {
  const frame = useSceneFrame("intro");
  const L = useLayout();
  const P = L.portrait;
  const G = P
    ? { name: 236, nsize: 92, gen: 120, a: { x: 70, y: 470, w: 820 }, b: { x: 160, y: 820, w: 800 }, pill: { y: 1200, size: 40 }, foot: { x: 360, y: 1290, w: 590, size: 22 } }
    : { name: 46, nsize: 64, gen: 80, a: { x: 40, y: 250, w: 560 }, b: { x: 480, y: 420, w: 560 }, pill: { y: 670, size: 32 }, foot: { x: 300, y: 760, w: 720, size: 18 } };
  const reveal = rev("intro.reveal");
  const nameAt = rev("intro.name");
  const a = sp(frame, reveal, { damping: 13, stiffness: 120, mass: 0.8 });
  const b = sp(frame, reveal + 6, { damping: 13, stiffness: 120, mass: 0.8 });
  const sk = shake(frame, reveal, 16, 10);
  const nameP = slam(frame, nameAt, 2);
  const genP = slam(frame, nameAt + 6, 2.6);
  const dispo = slam(frame, rev("intro.dispo"), 1.8);
  const t = frame / 30;
  const sweepA = interpolate(frame, [nameAt, nameAt + 16], [-0.3, 1.3], clamp);
  const sweepB = interpolate(frame, [nameAt + 8, nameAt + 24], [-0.3, 1.3], clamp);
  return (
    <SceneShell id="intro" shakeX={sk.x} shakeY={sk.y}>
      <div style={{ position: "absolute", left: 0, right: P ? 70 : 0, top: G.name, display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
        <div style={{ ...nameP, fontFamily: FONT, fontWeight: 900, fontSize: G.nsize, color: "#fff", whiteSpace: "nowrap", letterSpacing: -1, textShadow: "0 10px 34px rgba(8,20,110,0.4)" }}>Ray-Ban Meta</div>
        <div style={{ ...genP, marginTop: 6, fontFamily: FONT, fontWeight: 900, fontSize: G.nsize * 0.62, color: COLORS.blue, background: "#fff", padding: "0 28px 4px", borderRadius: 18, boxShadow: "0 12px 30px rgba(6,14,90,0.3)" }}>Gen 2</div>
      </div>
      <div style={{ position: "absolute", left: G.a.x, top: G.a.y, transform: `translateX(${(1 - a) * -1100}px) rotate(${lerp(-20, -4, a) + Math.sin(t * Math.PI * 0.7) * 2}deg) translateY(${Math.sin(t * Math.PI * 1.1) * 8}px)`, filter: "drop-shadow(0 30px 40px rgba(6,14,90,0.45))" }}>
        <ProductImage src={OFFICIAL.headlinerAngle.src} aspect={OFFICIAL.headlinerAngle.aspect} width={G.a.w} sweep={sweepA} />
      </div>
      <div style={{ position: "absolute", left: G.b.x, top: G.b.y, transform: `translateX(${(1 - b) * 1100}px) rotate(${lerp(20, 3, b) + Math.sin(t * Math.PI * 0.6 + 1) * 2}deg) translateY(${Math.sin(t * Math.PI * 1.1 + 1) * 8}px)`, filter: "drop-shadow(0 30px 40px rgba(6,14,90,0.45))" }}>
        <ProductImage src={OFFICIAL.wayfarerAngle.src} aspect={OFFICIAL.wayfarerAngle.aspect} width={G.b.w} sweep={sweepB} />
      </div>
      {frame >= rev("intro.dispo") - 1 && (
        <div style={{ position: "absolute", left: P ? 340 : 0, right: P ? 70 : 0, top: G.pill.y, display: "flex", justifyContent: "center" }}>
          <div style={{ ...dispo, display: "flex", alignItems: "center", gap: 14, fontFamily: FONT, fontWeight: 900, fontSize: G.pill.size, color: COLORS.blue, background: "#fff", padding: "10px 30px", borderRadius: 999, letterSpacing: 3, boxShadow: "0 10px 26px rgba(6,14,90,0.3)" }}>
            <LineIcon name="store" size={G.pill.size * 1.3} stroke={7} color={COLORS.blue} />
            DISPONIBLES
          </div>
        </div>
      )}
      {/* Meta AI availability depends on country/language (not confirmed for Morocco) */}
      <div style={{ position: "absolute", left: G.foot.x, top: G.foot.y, width: G.foot.w, fontFamily: FONT, fontWeight: 600, fontSize: G.foot.size, color: "#fff", opacity: 0.8 * ramp(frame, reveal + 10, reveal + 20), textAlign: P ? "center" : "left" }}>
        * Fonctions Meta AI selon le pays et la langue.
      </div>
    </SceneShell>
  );
};
