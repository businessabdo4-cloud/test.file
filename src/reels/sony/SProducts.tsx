import React from "react";
import { interpolate } from "remotion";
import { COLORS, FONT } from "../../brand";
import { lerp, pop, ramp, shake, slam, sp } from "../../anim";
import { useLayout } from "../../layout";
import { Callout } from "../../components/Callout";
import { HeadphoneArt, SONY_COLOURS } from "../../components/HeadphoneArt";
import { LineIcon } from "../../components/Icons";
import { SceneShell, useSceneFrame } from "../../components/SceneShell";
import { OFFICIAL, sev, sscene } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const NAMES = { black: "Noir", blue: "Bleu nuit" };

const Heading: React.FC<{ frame: number; at: number; title: string; sub?: string; P: boolean }> = ({ frame, at, title, sub, P }) => {
  const h = sp(frame, at);
  return (
    <div style={{ position: "absolute", left: 0, right: P ? 70 : 0, top: P ? 232 : 40, textAlign: P ? "center" : "left", paddingLeft: P ? 0 : 40, fontFamily: FONT, color: "#fff", opacity: h, transform: `translateY(${(1 - h) * -40}px)`, textShadow: "0 4px 18px rgba(8,20,110,0.35)" }}>
      {sub ? <span style={{ fontWeight: 700, fontSize: P ? 34 : 28, marginRight: 12, opacity: 0.85 }}>{sub}</span> : null}
      <span style={{ fontWeight: 900, fontSize: P ? 56 : 42 }}>{title}</span>
    </div>
  );
};

const Swatches: React.FC<{ frame: number; items: { key: "black" | "blue"; at: number }[]; active: "black" | "blue"; x: number; y: number; size: number }> = ({ frame, items, active, x, y, size }) => (
  <div style={{ position: "absolute", left: x, top: y, display: "flex", gap: size * 0.9, alignItems: "flex-start" }}>
    {items.map((it) => {
      if (frame < it.at - 1) return null;
      const p = pop(frame, it.at);
      const a = it.key === active ? 1 : 0;
      return (
        <div key={it.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, transform: `scale(${p})` }}>
          <div style={{ width: size, height: size, borderRadius: "50%", background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.45), rgba(255,255,255,0) 45%), ${SONY_COLOURS[it.key]}`, boxShadow: `0 0 0 ${3 + a * 5}px rgba(255,255,255,${0.45 + a * 0.55}), 0 8px 18px rgba(6,14,90,0.35)`, transform: `scale(${1 + 0.18 * a})` }} />
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: size * 0.42, color: "#fff", opacity: 0.6 + 0.4 * a, letterSpacing: 2 }}>{NAMES[it.key].toUpperCase()}</div>
        </div>
      );
    })}
  </div>
);

/** 3.5-7.5 s WH-1000XM6: reveal, "disponible", Noir -> Bleu nuit. */
export const SXm6: React.FC = () => {
  const frame = useSceneFrame("xm6");
  const L = useLayout();
  const P = L.portrait;
  const G = P ? { hp: { cx: 540, top: 330, w: 560 }, sw: { x: 330, y: 990, size: 70 }, pill: { x: 0, y: 300 } } : { hp: { cx: 330, top: 120, w: 420 }, sw: { x: 680, y: 380, size: 64 }, pill: { x: 640, y: 220 } };
  const enter = sp(frame, sev("xm6.reveal"), { damping: 12, stiffness: 110, mass: 0.8 });
  const blueAt = sev("xm6.blue");
  const blue = ramp(frame, blueAt, blueAt + 6);
  const sweepAt = [sev("xm6.reveal") + 8, blueAt].filter((s) => frame >= s).pop() ?? -100;
  const sweep = interpolate(frame, [sweepAt, sweepAt + 16], [-0.3, 1.3], clamp);
  const sk = shake(frame, sev("xm6.reveal"), 16, 9);
  const t = frame / 30;
  const art = (colour: string, op: number, key: string, official: string | null) => (
    <div key={key} style={{ position: "absolute", inset: 0, opacity: op }}>
      <HeadphoneArt id={`xm6-${key}`} width={G.hp.w} colour={colour} sweep={sweep} official={official} />
    </div>
  );
  const dispo = slam(frame, sev("xm6.black") - 30, 1.8);
  return (
    <SceneShell id="xm6" shakeX={sk.x} shakeY={sk.y}>
      <Heading frame={frame} at={sev("xm6.reveal") + 2} title="WH-1000XM6" sub="Sony" P={P} />
      <div style={{ position: "absolute", left: G.hp.cx - 520, top: G.hp.top + G.hp.w * 0.7, width: 1040, height: 560, background: "radial-gradient(ellipse at center, rgba(255,255,255,0.3), rgba(255,255,255,0) 65%)", opacity: enter }} />
      <div style={{ position: "absolute", left: G.hp.cx - G.hp.w / 2, top: G.hp.top, width: G.hp.w, height: G.hp.w * 1.1, transform: `translateY(${(1 - enter) * 1000 + Math.sin(t * Math.PI * 1.1) * 10}px) rotate(${lerp(-25, -4, enter) + Math.sin(t * Math.PI * 0.6) * 3}deg) scale(${lerp(1.3, 1, enter)})`, filter: "drop-shadow(0 34px 44px rgba(6,14,90,0.5))" }}>
        {art(SONY_COLOURS.black, 1 - blue, "black", OFFICIAL.xm6Black)}
        {blue > 0 && art(SONY_COLOURS.blue, blue, "blue", OFFICIAL.xm6Blue)}
      </div>
      {frame >= sev("xm6.black") - 31 && (
        <div style={{ position: "absolute", left: P ? 0 : G.pill.x, right: P ? 70 : undefined, top: G.pill.y, display: "flex", justifyContent: "center" }}>
          <div style={{ ...dispo, fontFamily: FONT, fontWeight: 900, fontSize: P ? 34 : 30, color: COLORS.blue, background: "#fff", padding: "8px 26px", borderRadius: 999, letterSpacing: 3, boxShadow: "0 10px 26px rgba(6,14,90,0.3)" }}>DISPONIBLE</div>
        </div>
      )}
      <Swatches frame={frame} items={[{ key: "black", at: sev("xm6.black") }, { key: "blue", at: blueAt }]} active={frame >= blueAt ? "blue" : "black"} x={G.sw.x} y={G.sw.y} size={G.sw.size} />
    </SceneShell>
  );
};

/** 7.5-11.5 s noise cancelling, sound, foldable. */
export const SAnc: React.FC = () => {
  const frame = useSceneFrame("anc");
  const L = useLayout();
  const P = L.portrait;
  const G = P ? { hp: { cx: 700, top: 380, w: 420 }, calls: [430, 610, 790], x: 36, side: -1 as const } : { hp: { cx: 250, top: 150, w: 330 }, calls: [170, 340, 510], x: 500, side: 1 as const };
  const fold = sp(frame, sev("anc.fold"), { damping: 14, stiffness: 120 }) * (1 - sp(frame, sev("anc.fold") + 38, { damping: 16, stiffness: 120 }));
  const t = frame / 30;
  const cx = G.hp.cx, cy = G.hp.top + G.hp.w * 0.62;
  // incoming noise rings that collapse into nothing once NC kicks in
  const ncAt = sev("anc.nc");
  const rings = Array.from({ length: 5 }).map((_, k) => {
    const life = ((frame - ncAt + k * 6) % 30) / 30;
    if (frame < ncAt - 12) return null;
    const r = G.hp.w * (1.2 - 0.75 * life);
    const op = (1 - life) * 0.55 * interpolate(frame, [ncAt + 60, ncAt + 80], [1, 0.25], clamp);
    return <div key={k} style={{ position: "absolute", left: cx - r, top: cy - r, width: r * 2, height: r * 2, borderRadius: "50%", border: "4px dashed rgba(255,255,255,0.8)", opacity: op }} />;
  });
  return (
    <SceneShell id="anc">
      <Heading frame={frame} at={sev("anc.nc") - 6} title="WH-1000XM6" sub="Sony" P={P} />
      {rings}
      <div style={{ position: "absolute", left: cx - G.hp.w / 2, top: G.hp.top, transform: `translateY(${Math.sin(t * Math.PI) * 8}px) rotate(${-4 + Math.sin(t * Math.PI * 0.6) * 3}deg)`, filter: "drop-shadow(0 30px 40px rgba(6,14,90,0.45))" }}>
        <HeadphoneArt id="anc" width={G.hp.w} colour={SONY_COLOURS.blue} fold={fold} official={OFFICIAL.xm6Blue} />
      </div>
      <Callout frame={frame} at={ncAt} icon="headphones" value="Réduction de bruit" label="La plus avancée de Sony · QN3" x={G.x} y={G.calls[0]} width={300} side={G.side} />
      <Callout frame={frame} at={sev("anc.sound")} icon="note" value="Son pur" label="12 micros, réglage auto" x={G.x} y={G.calls[1]} width={300} side={G.side} />
      <Callout frame={frame} at={sev("anc.fold")} icon="fold" value="Pliable" label="Étui de transport inclus" x={G.x} y={G.calls[2]} width={300} side={G.side} />
    </SceneShell>
  );
};

/** 11.5-17.0 s "Sony quality for less": WH-1000XM5 in black. */
export const SXm5: React.FC = () => {
  const frame = useSceneFrame("xm5");
  const L = useLayout();
  const P = L.portrait;
  const rev = sev("xm5.reveal");
  const k1 = slam(frame, sev("xm5.value"), 1.8);
  const k2 = slam(frame, sev("xm5.value") + 12, 1.8);
  const kOut = ramp(frame, rev - 6, rev + 2);
  const enter = sp(frame, rev, { damping: 11, stiffness: 120, mass: 0.8 });
  const sk = shake(frame, rev, 18, 9);
  const G = P ? { hp: { cx: 540, top: 360, w: 520 }, sw: { x: 420, y: 990, size: 70 }, kin: 420 } : { hp: { cx: 330, top: 130, w: 400 }, sw: { x: 700, y: 380, size: 64 }, kin: 220 };
  const t = frame / 30;
  const sweep = interpolate(frame, [rev + 8, rev + 24], [-0.3, 1.3], clamp);
  return (
    <SceneShell id="xm5" shakeX={sk.x} shakeY={sk.y}>
      {kOut < 1 && (
        <div style={{ position: "absolute", left: 0, right: P ? 70 : 0, top: G.kin, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: 1 - kOut, transform: `scale(${lerp(1, 0.6, kOut)})` }}>
          <div style={{ ...k1, fontFamily: FONT, fontWeight: 900, fontSize: P ? 96 : 76, color: "#fff", textShadow: "0 10px 34px rgba(8,20,110,0.4)" }}>QUALITÉ SONY</div>
          <div style={{ ...k2, fontFamily: FONT, fontWeight: 900, fontSize: P ? 62 : 50, color: COLORS.blue, background: "#fff", padding: "4px 30px", borderRadius: 18 }}>PRIX PLUS DOUX</div>
        </div>
      )}
      {frame >= rev - 1 && (
        <>
          <Heading frame={frame} at={rev + 2} title="WH-1000XM5" sub="Sony" P={P} />
          <div style={{ position: "absolute", left: G.hp.cx - G.hp.w / 2, top: G.hp.top, transform: `translateY(${(1 - enter) * 1000 + Math.sin(t * Math.PI * 1.1) * 10}px) rotate(${lerp(18, 3, enter)}deg) scale(${lerp(1.3, 1, enter)})`, filter: "drop-shadow(0 34px 44px rgba(6,14,90,0.5))" }}>
            <HeadphoneArt id="xm5" variant="xm5" width={G.hp.w} colour={SONY_COLOURS.black} sweep={sweep} official={OFFICIAL.xm5Black} />
          </div>
          <Swatches frame={frame} items={[{ key: "black", at: sev("xm5.black") }]} active="black" x={G.sw.x} y={G.sw.y} size={G.sw.size} />
        </>
      )}
    </SceneShell>
  );
};

/** 17.0-21.5 s battery: up to 30 h with NC on; 3 min charge = 3 h of music. */
export const SBattery: React.FC = () => {
  const frame = useSceneFrame("battery");
  const L = useLayout();
  const P = L.portrait;
  const hAt = sev("bat.hours"), cAt = sev("bat.charge"), mAt = sev("bat.music");
  const hours = Math.round(30 * interpolate(frame, [hAt, hAt + 20], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) }));
  const fill = interpolate(frame, [hAt, hAt + 24], [0.05, 1], clamp);
  const h1 = slam(frame, hAt, 1.8);
  const c1 = sp(frame, cAt, { damping: 12, stiffness: 190 });
  const m1 = sp(frame, mAt, { damping: 10, stiffness: 220 });
  const arrow = ramp(frame, cAt + 6, mAt);
  const G = P ? { bat: { x: 230, y: 330, w: 560, h: 250 }, num: 170, row: 760, card: 250 } : { bat: { x: 90, y: 150, w: 400, h: 190 }, num: 130, row: 0, card: 200 };
  const enter = sp(frame, sscene("battery").from + 1, { damping: 14, stiffness: 140 });
  return (
    <SceneShell id="battery">
      {/* battery gauge with the 30 h counter */}
      <div style={{ position: "absolute", left: G.bat.x, top: G.bat.y, width: G.bat.w, height: G.bat.h, borderRadius: 40, border: "10px solid #fff", padding: 14, opacity: enter, transform: `scale(${lerp(0.7, 1, enter)})`, boxShadow: "0 20px 50px rgba(6,14,90,0.35)" }}>
        <div style={{ position: "absolute", right: -40, top: G.bat.h * 0.3, width: 26, height: G.bat.h * 0.4, borderRadius: 8, background: "#fff" }} />
        <div style={{ width: `${fill * 100}%`, height: "100%", borderRadius: 22, background: `linear-gradient(90deg, #6CF3FF, #ffffff)`, opacity: 0.9 }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: FONT, color: COLORS.blue, ...h1 }}>
          <span style={{ fontWeight: 900, fontSize: G.num }}>{hours}</span>
          <span style={{ fontWeight: 900, fontSize: G.num * 0.45 }}>h</span>
        </div>
      </div>
      <div style={{ position: "absolute", left: P ? 0 : G.bat.x, right: P ? 70 : undefined, width: P ? undefined : G.bat.w, top: G.bat.y + G.bat.h + 24, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: P ? 32 : 26, color: "#fff", opacity: ramp(frame, hAt + 6, hAt + 14) }}>
        d'autonomie, réduction de bruit activée (jusqu'à)
      </div>
      {/* 3 min -> 3 h */}
      <div style={{ position: "absolute", left: P ? 110 : 560, top: P ? G.row : 110, display: "flex", flexDirection: P ? "row" : "column", alignItems: "center", gap: 26 }}>
        <div style={{ width: G.card, height: G.card, borderRadius: 40, background: "rgba(255,255,255,0.2)", border: "3px solid rgba(255,255,255,0.7)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `scale(${c1})`, fontFamily: FONT, color: "#fff" }}>
          <LineIcon name="stopwatch" size={G.card * 0.42} progress={ramp(frame, cAt, cAt + 12)} stroke={6} />
          <div style={{ fontWeight: 900, fontSize: G.card * 0.24 }}>3 MIN</div>
          <div style={{ fontWeight: 600, fontSize: G.card * 0.1, opacity: 0.9 }}>de charge</div>
        </div>
        <svg viewBox="0 0 100 40" width={P ? 120 : 80} height={P ? 48 : 32} style={{ transform: P ? undefined : "rotate(90deg)" }}>
          <path d={`M 4 20 H ${4 + 80 * arrow}`} stroke="#fff" strokeWidth={8} strokeLinecap="round" />
          {arrow > 0.95 && <path d="M 72 6 L 90 20 L 72 34" fill="none" stroke="#fff" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />}
        </svg>
        <div style={{ width: G.card, height: G.card, borderRadius: 40, background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `scale(${m1})`, fontFamily: FONT, color: COLORS.blue }}>
          <LineIcon name="note" size={G.card * 0.42} progress={ramp(frame, mAt, mAt + 12)} stroke={7} color={COLORS.blue} />
          <div style={{ fontWeight: 900, fontSize: G.card * 0.24 }}>3 H</div>
          <div style={{ fontWeight: 600, fontSize: G.card * 0.1 }}>de musique</div>
        </div>
      </div>
    </SceneShell>
  );
};
