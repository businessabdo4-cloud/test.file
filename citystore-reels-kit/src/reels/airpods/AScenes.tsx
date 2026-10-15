import React from "react";
import { interpolate } from "remotion";
import { COLORS, FONT } from "../../brand";
import { lerp, pop, ramp, shake, slam, sp } from "../../anim";
import { useLayout } from "../../layout";
import { IconName, LineIcon } from "../../components/Icons";
import { ProductImage } from "../../components/ProductImage";
import { Burst, SceneShell, useSceneFrame } from "../../components/SceneShell";
import { aev, ascene, OFFICIAL } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
type Img = { src: string; aspect: number };

const Heading: React.FC<{ frame: number; at: number; title: string; P: boolean }> = ({ frame, at, title, P }) => {
  const h = sp(frame, at);
  return (
    <div style={{ position: "absolute", left: 0, right: P ? 70 : 0, top: P ? 232 : 40, textAlign: P ? "center" : "left", paddingLeft: P ? 0 : 40, fontFamily: FONT, fontWeight: 900, fontSize: P ? 58 : 44, color: "#fff", opacity: h, transform: `translateY(${(1 - h) * -40}px)`, textShadow: "0 4px 18px rgba(8,20,110,0.35)", whiteSpace: "nowrap" }}>
      {title}
    </div>
  );
};

const Chip: React.FC<{ frame: number; at: number; text: string; icon?: IconName; size: number; solid?: boolean; rot?: number }> = ({ frame, at, text, icon, size, solid, rot = 0 }) => {
  if (frame < at - 1) return null;
  const p = sp(frame, at, { damping: 11, stiffness: 220, mass: 0.6 });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.35, padding: `${size * 0.22}px ${size * 0.7}px`, borderRadius: 999, background: solid ? "#fff" : "rgba(255,255,255,0.18)", border: solid ? "none" : "3px solid rgba(255,255,255,0.75)", color: solid ? COLORS.blue : "#fff", fontFamily: FONT, fontWeight: 900, fontSize: size, whiteSpace: "nowrap", transform: `scale(${p}) rotate(${rot}deg)`, boxShadow: "0 12px 30px rgba(6,14,90,0.3)" }}>
      {icon ? <LineIcon name={icon} size={size * 1.2} stroke={7} color={solid ? COLORS.blue : "#fff"} progress={ramp(frame, at, at + 10)} /> : null}
      {text}
    </div>
  );
};

const Hero: React.FC<{ img: Img; frame: number; at: number; x: number; y: number; w: number; sweeps: number[]; from?: -1 | 1; rot?: number }> = ({ img, frame, at, x, y, w, sweeps, from = -1, rot = -2 }) => {
  const enter = sp(frame, at, { damping: 12, stiffness: 120, mass: 0.8 });
  const s = sweeps.filter((v) => frame >= v).pop() ?? -100;
  const t = frame / 30;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translateX(${(1 - enter) * 900 * from}px) translateY(${Math.sin(t * Math.PI * 1.1) * 8}px) rotate(${lerp(14 * from, rot, enter) + Math.sin(t * Math.PI * 0.6) * 1.5}deg)`, filter: "drop-shadow(0 30px 40px rgba(6,14,90,0.45))" }}>
      <ProductImage src={img.src} aspect={img.aspect} width={w} sweep={interpolate(frame, [s, s + 16], [-0.3, 1.3], clamp)} />
    </div>
  );
};

/** speech bubble that flips from a foreign phrase to its French translation */
const Bubble: React.FC<{ frame: number; at: number; flipAt: number; from: string; to: string; x: number; y: number; size: number; side: -1 | 1 }> = ({ frame, at, flipAt, from, to, x, y, size, side }) => {
  if (frame < at - 1) return null;
  const p = pop(frame, at);
  const flip = ramp(frame, flipAt, flipAt + 8);
  const sy = Math.abs(Math.cos(flip * Math.PI)); // card flip
  const translated = flip >= 0.5;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `scale(${p}) scaleY(${Math.max(0.05, sy)})`, transformOrigin: "center" }}>
      <div style={{ position: "relative", padding: `${size * 0.4}px ${size * 0.7}px`, borderRadius: size * 0.9, background: translated ? "#fff" : "rgba(255,255,255,0.22)", border: translated ? "none" : "3px solid rgba(255,255,255,0.8)", fontFamily: FONT, fontWeight: 900, fontSize: size, color: translated ? COLORS.blue : "#fff", whiteSpace: "nowrap", boxShadow: "0 14px 34px rgba(6,14,90,0.3)" }}>
        {translated ? to : from}
        {!translated && <span style={{ marginLeft: 12, color: "#FFD23F" }}>???</span>}
        <div style={{ position: "absolute", bottom: -size * 0.32, [side < 0 ? "left" : "right"]: size * 0.8, width: size * 0.6, height: size * 0.6, background: translated ? "#fff" : "rgba(255,255,255,0.22)", transform: "rotate(45deg)", borderRadius: 6 } as React.CSSProperties} />
      </div>
    </div>
  );
};

/*
 * 0.0-4.5 s HOOK ("talking with someone in a language you don't understand? AirPods 5 translate for you!")
 * visual: two foreign-language speech bubbles + "???", Citybot puzzled; the AirPods land and the bubbles flip
 *         into French translations (Live Translation; footnote on supported languages)
 * written: "ما فاهمش؟" -> "Traduction en direct"; verbal: VO lines 1-2
 */
export const AHook: React.FC = () => {
  const frame = useSceneFrame("hook");
  const L = useLayout();
  const P = L.portrait;
  const G = P
    ? { b1: { x: 60, y: 350 }, b2: { x: 370, y: 445 }, size: 44, buds: { x: 395, y: 540, w: 250 }, title: 236, tsize: 64, foot: { y: 314, size: 20 } }
    : { b1: { x: 40, y: 130 }, b2: { x: 560, y: 130 }, size: 34, buds: { x: 700, y: 330, w: 260 }, title: 36, tsize: 50, foot: { y: 100, size: 16 } };
  const land = aev("hook.airpods"), trAt = aev("hook.translate");
  const buds = sp(frame, land, { damping: 11, stiffness: 150, mass: 0.8 });
  const sk = shake(frame, land, 16, 10);
  const title = slam(frame, trAt, 2.2);
  const t = frame / 30;
  return (
    <SceneShell id="hook" shakeX={sk.x} shakeY={sk.y}>
      <Burst x={G.buds.x + G.buds.w / 2} y={G.buds.y + G.buds.w * 0.4} r={P ? 900 : 640} rot={frame * 0.6} opacity={0.2 * buds} rays={20} />
      <Bubble frame={frame} at={aev("hook.bubble1")} flipAt={trAt} from="Wie geht's dir?" to="Comment ça va ?" x={G.b1.x} y={G.b1.y} size={G.size} side={-1} />
      <Bubble frame={frame} at={aev("hook.bubble2")} flipAt={trAt + 4} from="¿Dónde está la estación?" to="Où est la gare ?" x={G.b2.x} y={G.b2.y} size={G.size * 0.85} side={1} />
      {frame >= land - 1 && (
        <div style={{ position: "absolute", left: G.buds.x, top: G.buds.y, transform: `translateY(${(1 - buds) * -900 + Math.sin(t * Math.PI * 1.1) * 8}px) scale(${lerp(1.5, 1, buds)}) rotate(${lerp(-14, -3, buds)}deg)`, filter: "drop-shadow(0 30px 40px rgba(6,14,90,0.5))" }}>
          <ProductImage src={OFFICIAL.buds.src} aspect={OFFICIAL.buds.aspect} width={G.buds.w} sweep={interpolate(frame, [trAt, trAt + 16], [-0.3, 1.3], clamp)} />
        </div>
      )}
      {frame >= trAt - 1 && (
        <>
          <div style={{ position: "absolute", left: 0, right: P ? 70 : 0, top: G.title, display: "flex", justifyContent: "center" }}>
            <div style={{ ...title, display: "flex", alignItems: "center", gap: 14, fontFamily: FONT, fontWeight: 900, fontSize: G.tsize * 0.75, color: COLORS.blue, background: "#fff", padding: "8px 28px", borderRadius: 999, whiteSpace: "nowrap", boxShadow: "0 14px 34px rgba(6,14,90,0.35)" }}>
              <LineIcon name="chat" size={G.tsize * 0.9} stroke={8} color={COLORS.blue} />
              Traduction en direct*
            </div>
          </div>
          <div style={{ position: "absolute", left: 40, right: P ? 110 : 40, top: G.foot.y, textAlign: "center", fontFamily: FONT, fontWeight: 600, fontSize: G.foot.size, color: "#fff", opacity: 0.85 * ramp(frame, trAt + 6, trAt + 14) }}>
            * Avec Apple Intelligence sur iPhone compatible, langues prises en charge uniquement.
          </div>
        </>
      )}
      <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: Math.max(interpolate(frame, [0, 1, 6], [0.5, 0.5, 0], clamp), interpolate(frame - land, [0, 1, 7], [0, 0.7, 0], clamp)) }} />
    </SceneShell>
  );
};

/** 4.5-8.75 s INTRO: AirPods 5 with wireless charging case, DISPONIBLES. */
export const AIntro: React.FC = () => {
  const frame = useSceneFrame("intro");
  const L = useLayout();
  const P = L.portrait;
  const G = P ? { hero: { x: 260, y: 360, w: 540 }, name: 236, nsize: 92, pill: { x: 340, y: 1180, size: 36 }, chip: { y: 1100 } } : { hero: { x: 80, y: 120, w: 380 }, name: 140, nsize: 78, pill: { x: 520, y: 560, size: 30 }, chip: { y: 420 } };
  const nAt = aev("intro.name"), cAt = aev("intro.case"), dAt = aev("intro.dispo");
  const name = slam(frame, nAt, 2);
  const dispo = slam(frame, dAt, 1.8);
  return (
    <SceneShell id="intro">
      <div style={{ position: "absolute", left: P ? 0 : 500, right: P ? 70 : 40, top: G.name, display: "flex", justifyContent: "center" }}>
        <div style={{ ...name, fontFamily: FONT, fontWeight: 900, fontSize: G.nsize, color: "#fff", whiteSpace: "nowrap", textShadow: "0 10px 30px rgba(8,20,110,0.4)" }}>AirPods 5</div>
      </div>
      <Hero img={OFFICIAL.openCase} frame={frame} at={nAt - 6} x={G.hero.x} y={G.hero.y} w={G.hero.w * 0.78} sweeps={[nAt + 6, cAt]} />
      <div style={{ position: "absolute", left: P ? 340 : 520, right: P ? 70 : 40, top: G.chip.y, display: "flex", justifyContent: "center" }}>
        <Chip frame={frame} at={cAt} text="Boîtier de charge sans fil" icon="bolt" size={P ? 36 : 30} />
      </div>
      {frame >= dAt - 1 && (
        <div style={{ position: "absolute", left: G.pill.x, right: P ? 70 : 40, top: G.pill.y, display: "flex", justifyContent: "center" }}>
          <div style={{ ...dispo, display: "flex", alignItems: "center", gap: 12, fontFamily: FONT, fontWeight: 900, fontSize: G.pill.size, color: COLORS.blue, background: "#fff", padding: "8px 26px", borderRadius: 999, letterSpacing: 3, boxShadow: "0 10px 26px rgba(6,14,90,0.3)" }}>
            <LineIcon name="store" size={G.pill.size * 1.3} stroke={7} color={COLORS.blue} />
            DISPONIBLES
          </div>
        </div>
      )}
    </SceneShell>
  );
};

/** 8.75-13.5 s newest AirPods, comfortable fit, stays in place. */
export const AFit: React.FC = () => {
  const frame = useSceneFrame("fit");
  const L = useLayout();
  const P = L.portrait;
  const G = P ? { hero: { x: 180, y: 330, w: 640 }, chips: { y: 1000 } } : { hero: { x: 80, y: 100, w: 440 }, chips: { y: 200 } };
  const at = ascene("fit").from;
  const sAt = aev("fit.stable");
  const steady = ramp(frame, sAt, sAt + 6);
  const wobble = (1 - steady) * Math.sin(frame * 0.5) * 4;
  const imgH = G.hero.w * OFFICIAL.buds.aspect;
  return (
    <SceneShell id="fit">
      <Heading frame={frame} at={at + 2} title="Les derniers AirPods" P={P} />
      <div style={{ position: "absolute", left: G.hero.x, top: G.hero.y, transform: `rotate(${wobble}deg) translateY(${(1 - sp(frame, at, { damping: 13, stiffness: 120 })) * 800}px)`, filter: "drop-shadow(0 30px 40px rgba(6,14,90,0.45))" }}>
        <ProductImage src={OFFICIAL.buds.src} aspect={OFFICIAL.buds.aspect} width={G.hero.w} sweep={interpolate(frame, [aev("fit.ear"), aev("fit.ear") + 16], [-0.3, 1.3], clamp)} />
        {/* "lock" brackets when they stay put */}
        {steady > 0 && [0, 1].map((k) => (
          <div key={k} style={{ position: "absolute", left: k ? G.hero.w * 0.52 : G.hero.w * 0.0, top: -10, width: G.hero.w * 0.48, height: imgH * 0.55, borderRadius: 40, border: "5px solid #fff", opacity: steady * 0.9, boxShadow: `0 0 18px ${COLORS.cyan}` }} />
        ))}
      </div>
      <div style={{ position: "absolute", left: P ? 340 : 560, right: P ? 70 : 40, top: G.chips.y, display: "flex", flexDirection: P ? "row" : "column", flexWrap: "wrap", gap: 14, justifyContent: "center", alignItems: "flex-start" }}>
        <Chip frame={frame} at={aev("fit.latest")} text="Nouveau" icon="spark" size={P ? 38 : 32} solid />
        <Chip frame={frame} at={aev("fit.ear")} text="Confortables" icon="headphones" size={P ? 38 : 32} />
        <Chip frame={frame} at={sAt} text="Tiennent bien" icon="lock" size={P ? 38 : 32} />
      </div>
    </SceneShell>
  );
};

/** 13.5-20.25 s ANC up to 50% stronger than AirPods 4 (ANC), Conversation Awareness → transparency. */
export const AAnc: React.FC = () => {
  const frame = useSceneFrame("anc");
  const L = useLayout();
  const P = L.portrait;
  const G = P ? { hero: { x: 300, y: 350, w: 420 }, pct: { y: 880, s: 150 }, chips: { y: 1080 } } : { hero: { x: 80, y: 140, w: 300 }, pct: { y: 150, s: 120 }, chips: { y: 400 } };
  const ncAt = aev("anc.nc"), pAt = aev("anc.pct"), swAt = aev("anc.switch"), trAt = aev("anc.transp"), tkAt = aev("anc.talk");
  const pct = Math.round(50 * easeOut(ramp(frame, pAt, pAt + 14)));
  const p1 = slam(frame, pAt, 2);
  const sk = shake(frame, pAt, 12, 8);
  const transp = ramp(frame, trAt, trAt + 10);
  const cx = G.hero.x + G.hero.w / 2, cy = G.hero.y + G.hero.w * OFFICIAL.buds.aspect / 2;
  // noise rings collapse while ANC is on, open back up for transparency mode
  const rings = Array.from({ length: 5 }).map((_, k) => {
    if (frame < ncAt - 6) return null;
    const life = ((frame - ncAt + k * 6) % 30) / 30;
    const r = G.hero.w * (transp > 0.5 ? 0.5 + 0.8 * life : 1.3 - 0.8 * life);
    return <div key={k} style={{ position: "absolute", left: cx - r, top: cy - r, width: r * 2, height: r * 2, borderRadius: "50%", border: `4px ${transp > 0.5 ? "solid" : "dashed"} rgba(255,255,255,0.8)`, opacity: (1 - life) * 0.5 }} />;
  });
  return (
    <SceneShell id="anc" shakeX={sk.x} shakeY={sk.y}>
      <Heading frame={frame} at={ncAt} title={transp > 0.5 ? "Mode Transparence" : "Réduction de bruit"} P={P} />
      {rings}
      <Hero img={OFFICIAL.buds} frame={frame} at={ascene("anc").from - 20} x={G.hero.x} y={G.hero.y} w={G.hero.w} sweeps={[pAt, trAt]} />
      {frame >= pAt - 1 && (
        <div style={{ position: "absolute", left: P ? 0 : 440, right: P ? 70 : 40, top: G.pct.y, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: FONT, color: "#fff", ...p1 }}>
          <div style={{ fontWeight: 900, fontSize: G.pct.s, lineHeight: 1, textShadow: "0 10px 30px rgba(8,20,110,0.4)" }}>+{pct}%</div>
          <div style={{ fontWeight: 700, fontSize: G.pct.s * 0.2, textAlign: "center" }}>de bruit en moins vs AirPods 4 (ANC), jusqu'à</div>
        </div>
      )}
      <div style={{ position: "absolute", left: P ? 340 : 440, right: P ? 70 : 40, top: G.chips.y, display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
        <Chip frame={frame} at={swAt} text="Bascule automatique" icon="bolt" size={P ? 36 : 30} />
        <Chip frame={frame} at={tkAt} text="Quand on te parle" icon="chat" size={P ? 36 : 30} solid />
      </div>
    </SceneShell>
  );
};

/** 20.25-25.75 s hands-free Siri, personalised spatial audio, sweat/dust/water resistant (IP57). */
export const AFeatures: React.FC = () => {
  const frame = useSceneFrame("features");
  const L = useLayout();
  const P = L.portrait;
  const G = P ? { hero: { x: 90, y: 360, w: 360 }, x: 480, w: 470, ys: [380, 580, 780], size: 36 } : { hero: { x: 50, y: 120, w: 280 }, x: 380, w: 640, ys: [100, 280, 460], size: 34 };
  const CARDS: { at: number; icon: IconName; value: string; label: string; solid?: boolean }[] = [
    { at: aev("ft.siri"), icon: "chat", value: "Siri", label: "mains libres" },
    { at: aev("ft.spatial"), icon: "note", value: "Audio spatial", label: "personnalisé" },
    { at: aev("ft.ip"), icon: "dive", value: "IP57", label: "sueur, poussière et eau", solid: true },
  ];
  return (
    <SceneShell id="features">
      <Heading frame={frame} at={ascene("features").from + 2} title="AirPods 5" P={P} />
      <Hero img={OFFICIAL.openCase} frame={frame} at={ascene("features").from} x={G.hero.x} y={G.hero.y} w={G.hero.w} sweeps={CARDS.map((c) => c.at)} />
      {CARDS.map((c, i) => {
        if (frame < c.at - 1) return null;
        const p = sp(frame, c.at, { damping: 12, stiffness: 190 });
        return (
          <div key={i} style={{ position: "absolute", left: G.x, top: G.ys[i], width: G.w, display: "flex", alignItems: "center", gap: 18, padding: `${G.size * 0.3}px ${G.size * 0.45}px`, borderRadius: G.size * 0.6, background: c.solid ? "#fff" : "rgba(255,255,255,0.18)", border: c.solid ? "none" : "3px solid rgba(255,255,255,0.7)", boxShadow: "0 16px 40px rgba(6,14,90,0.3)", transform: `translateX(${(1 - p) * 300}px)`, opacity: Math.min(1, p * 1.4), fontFamily: FONT, color: c.solid ? COLORS.blue : "#fff" }}>
            <div style={{ width: G.size * 1.7, height: G.size * 1.7, borderRadius: "50%", background: c.solid ? `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.cyan})` : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <LineIcon name={c.icon} size={G.size * 1.05} stroke={7} color={c.solid ? "#fff" : COLORS.blue} progress={ramp(frame, c.at, c.at + 12)} />
            </div>
            <div style={{ lineHeight: 1.05 }}>
              <div style={{ fontWeight: 900, fontSize: G.size * 1.0, whiteSpace: "nowrap" }}>{c.value}</div>
              <div style={{ fontWeight: 700, fontSize: G.size * 0.5, opacity: 0.9 }}>{c.label}</div>
            </div>
          </div>
        );
      })}
    </SceneShell>
  );
};

/** 25.75-29.75 s wireless charging: put the case on the charger and that's it. */
export const ACharging: React.FC = () => {
  const frame = useSceneFrame("charging");
  const L = useLayout();
  const P = L.portrait;
  const G = P ? { case: { x: 290, w: 440, y0: 300, y1: 560 }, pad: { cx: 510, y: 940, w: 560 }, chips: { y: 1080 } } : { case: { x: 120, w: 300, y0: 60, y1: 230 }, pad: { cx: 270, y: 520, w: 420 }, chips: { y: 300 } };
  const cAt = aev("ch.case"), putAt = aev("ch.put"), doneAt = aev("ch.done");
  const drop = easeOut(ramp(frame, putAt - 4, putAt + 6));
  const charging = ramp(frame, putAt + 4, putAt + 10);
  const caseH = G.case.w * OFFICIAL.case.aspect;
  const y = lerp(G.case.y0, G.pad.y - caseH + 30, drop);
  const t = frame / 30;
  const enter = sp(frame, ascene("charging").from, { damping: 13, stiffness: 120 });
  return (
    <SceneShell id="charging">
      <Heading frame={frame} at={cAt} title="Charge sans fil" P={P} />
      {/* generic round charging pad (no brand) */}
      <div style={{ position: "absolute", left: G.pad.cx - G.pad.w / 2, top: G.pad.y, width: G.pad.w, height: G.pad.w * 0.16, borderRadius: "50%", background: "linear-gradient(#e9edf5, #b9c1d3)", boxShadow: `0 20px 40px rgba(6,14,90,0.45), 0 0 ${40 * charging}px ${COLORS.cyan}`, opacity: enter }} />
      {[0, 1, 2].map((k) => {
        const life = ((frame - putAt + k * 8) % 24) / 24;
        if (frame < putAt + 4) return null;
        const w = G.pad.w * (0.5 + 0.7 * life);
        return <div key={k} style={{ position: "absolute", left: G.pad.cx - w / 2, top: G.pad.y + G.pad.w * 0.08 - w * 0.08, width: w, height: w * 0.16, borderRadius: "50%", border: "4px solid rgba(255,255,255,0.8)", opacity: (1 - life) * charging }} />;
      })}
      <div style={{ position: "absolute", left: G.case.x, top: y + (drop < 1 ? Math.sin(t * Math.PI) * 8 : 0), transform: `scale(${enter})`, filter: "drop-shadow(0 26px 34px rgba(6,14,90,0.45))" }}>
        <ProductImage src={OFFICIAL.case.src} aspect={OFFICIAL.case.aspect} width={G.case.w} sweep={interpolate(frame, [doneAt, doneAt + 16], [-0.3, 1.3], clamp)} />
      </div>
      <div style={{ position: "absolute", left: P ? 340 : 560, right: P ? 70 : 40, top: G.chips.y, display: "flex", flexDirection: "column", gap: 14, justifyContent: "center", alignItems: "center" }}>
        <Chip frame={frame} at={aev("ch.wireless")} text="Qi · chargeur Apple Watch" icon="bolt" size={P ? 32 : 30} />
        <Chip frame={frame} at={doneAt} text="Pose-le, c'est tout" icon="check" size={P ? 32 : 30} solid />
      </div>
    </SceneShell>
  );
};
