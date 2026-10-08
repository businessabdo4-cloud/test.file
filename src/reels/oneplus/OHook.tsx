import React from "react";
import { interpolate } from "remotion";
import { COLORS, FONT } from "../../brand";
import { lerp, pop, ramp, shake, slam, sp } from "../../anim";
import { useLayout } from "../../layout";
import { LineIcon } from "../../components/Icons";
import { ProductImage } from "../../components/ProductImage";
import { Burst, SceneShell, useSceneFrame } from "../../components/SceneShell";
import { OFFICIAL, oev } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const DAYS = ["LUN", "MAR", "MER", "JEU", "VEN"]; // 5 days = the rated battery life in normal use

/*
 * 0.0-2.0 s HOOK ("this watch lasts days without charging")
 * visual: the watch slams in; a calendar flips through the days while a battery gauge stays full;
 *         on "بلا شارج" a charging bolt is crossed out
 * written: "أيام بلا شارج!"   verbal: VO line 1
 */
export const OHook: React.FC = () => {
  const frame = useSceneFrame("hook");
  const L = useLayout();
  const P = L.portrait;
  const G = P
    ? { title: 236, tsize: 112, watch: { x: 560, y: 380, w: 370 }, cal: { x: 90, y: 420, w: 360, h: 300 }, bolt: { x: 420, y: 640, r: 74 } }
    : { title: 40, tsize: 76, watch: { x: 650, y: 150, w: 290 }, cal: { x: 90, y: 170, w: 280, h: 230 }, bolt: { x: 450, y: 380, r: 56 } };
  const slamIn = sp(frame, oev("hook.slam"), { damping: 11, stiffness: 150, mass: 0.8 });
  const sk = shake(frame, 1, 14, 10);
  const daysAt = oev("hook.days"), noAt = oev("hook.noCharge");
  const sk2 = shake(frame, noAt, 12, 9);
  const t = frame / 30;
  // calendar flips every 4 frames from the watch slam until "أيام"
  const flipStart = oev("hook.watch");
  const flips = Math.max(0, Math.min(DAYS.length - 1, Math.floor((frame - flipStart) / 4)));
  const flipPhase = ((frame - flipStart) % 4) / 4;
  const calP = sp(frame, flipStart - 2, { damping: 13, stiffness: 180 });
  const title = slam(frame, daysAt, 2.2);
  const boltP = pop(frame, noAt);
  const slash = ramp(frame, noAt + 3, noAt + 9);
  return (
    <SceneShell id="hook" shakeX={sk.x + sk2.x} shakeY={sk.y + sk2.y}>
      <Burst x={G.watch.x + G.watch.w / 2} y={G.watch.y + G.watch.w * 0.55} r={P ? 900 : 640} rot={frame * 0.6} opacity={0.2 * slamIn} rays={20} />
      {frame >= daysAt - 1 && (
        <div style={{ position: "absolute", left: 0, right: P ? 70 : 0, top: G.title, display: "flex", justifyContent: "center" }}>
          <div dir="rtl" style={{ ...title, fontFamily: FONT, fontWeight: 900, fontSize: G.tsize, color: "#fff", lineHeight: 1.2, whiteSpace: "nowrap", textShadow: "0 10px 34px rgba(8,20,110,0.45)" }}>
            أيام بلا شارج!
          </div>
        </div>
      )}
      {/* calendar flipping through the days, battery stays full */}
      <div style={{ position: "absolute", left: G.cal.x, top: G.cal.y, width: G.cal.w, height: G.cal.h, transform: `scale(${calP}) rotate(${-6 + Math.sin(t * 3) * 1.5}deg)`, borderRadius: 34, background: "#fff", boxShadow: "0 24px 50px rgba(6,14,90,0.4)", overflow: "hidden", fontFamily: FONT }}>
        <div style={{ height: G.cal.h * 0.24, background: `linear-gradient(90deg, ${COLORS.blue}, ${COLORS.cyan})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: G.cal.h * 0.11, letterSpacing: 3 }}>
          JOUR {flips + 1}
        </div>
        <div style={{ height: G.cal.h * 0.46, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: G.cal.h * 0.3, color: COLORS.navy, transform: frame < daysAt ? `translateY(${-flipPhase * 18}px)` : undefined, opacity: frame < daysAt ? 1 - flipPhase * 0.5 : 1 }}>
          {DAYS[flips]}
        </div>
        {/* battery: full the whole time */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <div style={{ position: "relative", width: G.cal.w * 0.42, height: G.cal.h * 0.16, borderRadius: 10, border: `5px solid ${COLORS.navy}`, padding: 4 }}>
            <div style={{ width: "100%", height: "100%", borderRadius: 5, background: "#2BD27A" }} />
            <div style={{ position: "absolute", right: -12, top: "28%", width: 7, height: "44%", borderRadius: 3, background: COLORS.navy }} />
          </div>
          <div style={{ fontWeight: 900, fontSize: G.cal.h * 0.1, color: "#16a35f" }}>100%</div>
        </div>
      </div>
      {/* the watch */}
      <div style={{ position: "absolute", left: G.watch.x, top: G.watch.y, transform: `scale(${lerp(2.2, 1, slamIn)}) rotate(${lerp(14, 4, slamIn) + Math.sin(t * Math.PI * 0.7) * 2}deg) translateY(${Math.sin(t * Math.PI * 1.1) * 8}px)`, opacity: Math.min(1, slamIn * 2), filter: "drop-shadow(0 30px 40px rgba(6,14,90,0.5))" }}>
        <ProductImage src={OFFICIAL.angle.src} aspect={OFFICIAL.angle.aspect} width={G.watch.w} sweep={interpolate(frame, [8, 26], [-0.3, 1.3], clamp)} />
      </div>
      {/* crossed-out charging bolt */}
      {frame >= noAt && (
        <div style={{ position: "absolute", left: G.bolt.x - G.bolt.r, top: G.bolt.y - G.bolt.r, width: G.bolt.r * 2, height: G.bolt.r * 2, borderRadius: "50%", background: "#fff", boxShadow: "0 16px 40px rgba(6,14,90,0.4)", transform: `scale(${boltP}) rotate(${lerp(-30, 0, boltP)}deg)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <LineIcon name="bolt" size={G.bolt.r * 1.2} stroke={7} color={COLORS.blue} />
          <svg viewBox="0 0 100 100" style={{ position: "absolute", inset: 0 }}>
            <circle cx={50} cy={50} r={44} fill="none" stroke="#FF3B5C" strokeWidth={8} opacity={slash} />
            <path d={`M 20 20 L ${20 + 60 * slash} ${20 + 60 * slash}`} stroke="#FF3B5C" strokeWidth={9} strokeLinecap="round" />
          </svg>
        </div>
      )}
      <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: interpolate(frame, [0, 1, 7], [0.7, 0.7, 0], clamp) }} />
    </SceneShell>
  );
};

/** 2.0-4.5 s REVEAL: "OnePlus Watch 3", DISPONIBLE. */
export const OIntro: React.FC = () => {
  const frame = useSceneFrame("intro");
  const L = useLayout();
  const P = L.portrait;
  const G = P
    ? { name: 236, nsize: 96, img: { cx: 540, y: 470, w: 430 }, pill: { x: 340, y: 1190, size: 40 } }
    : { name: 230, nsize: 72, img: { cx: 290, y: 90, w: 300 }, pill: { x: 520, y: 560, size: 32 } };
  const reveal = oev("intro.reveal");
  const enter = sp(frame, reveal, { damping: 12, stiffness: 110, mass: 0.8 });
  const sk = shake(frame, reveal, 16, 10);
  const nameP = slam(frame, oev("intro.name") + 2, 2);
  const numP = slam(frame, oev("intro.name") + 10, 2.8);
  const dispo = slam(frame, oev("intro.dispo"), 1.8);
  const t = frame / 30;
  const sweep = interpolate(frame, [reveal + 8, reveal + 26], [-0.3, 1.3], clamp);
  return (
    <SceneShell id="intro" shakeX={sk.x} shakeY={sk.y}>
      <div style={{ position: "absolute", left: P ? 0 : 500, right: P ? 70 : 40, top: G.name, display: "flex", flexDirection: P ? "row" : "column", justifyContent: "center", alignItems: "center", gap: P ? 22 : 4, fontFamily: FONT, fontWeight: 900, color: "#fff", whiteSpace: "nowrap", textShadow: "0 10px 34px rgba(8,20,110,0.4)" }}>
        <div style={{ ...nameP, fontSize: G.nsize, letterSpacing: -1 }}>OnePlus Watch</div>
        <div style={{ ...numP, fontSize: G.nsize * 1.05, color: COLORS.blue, background: "#fff", padding: `0 ${G.nsize * 0.28}px ${G.nsize * 0.05}px`, borderRadius: G.nsize * 0.2, textShadow: "none" }}>3</div>
      </div>
      <div style={{ position: "absolute", left: G.img.cx - G.img.w * 1.1, top: G.img.y + G.img.w * 0.5, width: G.img.w * 2.2, height: G.img.w * 1.4, background: "radial-gradient(ellipse at center, rgba(255,255,255,0.3), rgba(255,255,255,0) 65%)", opacity: enter }} />
      <div style={{ position: "absolute", left: G.img.cx - G.img.w / 2, top: G.img.y, transform: `translateY(${(1 - enter) * 1200 + Math.sin(t * Math.PI * 1.1) * 10}px) rotate(${lerp(-25, -3, enter) + Math.sin(t * Math.PI * 0.6) * 2}deg) scale(${lerp(1.3, 1, enter)})`, filter: "drop-shadow(0 34px 44px rgba(6,14,90,0.5))" }}>
        <ProductImage src={OFFICIAL.front.src} aspect={OFFICIAL.front.aspect} width={G.img.w} sweep={sweep} imgStyle={{ WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 12%, #000 86%, transparent 100%)" }} />
      </div>
      {frame >= oev("intro.dispo") - 1 && (
        <div style={{ position: "absolute", left: G.pill.x, right: P ? 70 : 40, top: G.pill.y, display: "flex", justifyContent: "center" }}>
          <div style={{ ...dispo, display: "flex", alignItems: "center", gap: 14, fontFamily: FONT, fontWeight: 900, fontSize: G.pill.size, color: COLORS.blue, background: "#fff", padding: "10px 30px", borderRadius: 999, letterSpacing: 3, boxShadow: "0 10px 26px rgba(6,14,90,0.3)" }}>
            <LineIcon name="store" size={G.pill.size * 1.3} stroke={7} color={COLORS.blue} />
            DISPONIBLE
          </div>
        </div>
      )}
    </SceneShell>
  );
};
