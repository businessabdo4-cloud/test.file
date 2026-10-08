import React from "react";
import { interpolate, random } from "remotion";
import { COLORS, FONT } from "../../brand";
import { lerp, pop, ramp, shake, slam, sp } from "../../anim";
import { useLayout } from "../../layout";
import { IconName, LineIcon } from "../../components/Icons";
import { ProductImage } from "../../components/ProductImage";
import { SceneShell, useSceneFrame } from "../../components/SceneShell";
import { OFFICIAL, xev, xscene } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
type Img = { src: string; aspect: number };

const Heading: React.FC<{ frame: number; at: number; title: string; sub?: string; P: boolean }> = ({ frame, at, title, sub, P }) => {
  const h = sp(frame, at);
  return (
    <div style={{ position: "absolute", left: 0, right: P ? 70 : 0, top: P ? 232 : 40, textAlign: P ? "center" : "left", paddingLeft: P ? 0 : 40, fontFamily: FONT, color: "#fff", opacity: h, transform: `translateY(${(1 - h) * -40}px)`, textShadow: "0 4px 18px rgba(8,20,110,0.35)", whiteSpace: "nowrap" }}>
      {sub ? <span style={{ fontWeight: 700, fontSize: P ? 34 : 28, marginRight: 12, opacity: 0.85 }}>{sub}</span> : null}
      <span style={{ fontWeight: 900, fontSize: P ? 56 : 42 }}>{title}</span>
    </div>
  );
};

/** floating product with entrance + light sweeps */
const Hero: React.FC<{ img: Img; frame: number; at: number; x: number; y: number; w: number; sweeps: number[]; from?: -1 | 1; steady?: { x: number; y: number } }> = ({ img, frame, at, x, y, w, sweeps, from = -1, steady }) => {
  const enter = sp(frame, at, { damping: 13, stiffness: 120, mass: 0.8 });
  const s = sweeps.filter((v) => frame >= v).pop() ?? -100;
  const t = frame / 30;
  const bob = steady ? 0 : Math.sin(t * Math.PI * 1.1) * 8;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(${(1 - enter) * 900 * from + (steady?.x ?? 0)}px, ${bob + (steady?.y ?? 0)}px) rotate(${lerp(16 * from, steady ? 0 : -2, enter) + (steady ? 0 : Math.sin(t * Math.PI * 0.6) * 1.5)}deg)`, filter: "drop-shadow(0 30px 40px rgba(6,14,90,0.45))" }}>
      <ProductImage src={img.src} aspect={img.aspect} width={w} sweep={interpolate(frame, [s, s + 16], [-0.3, 1.3], clamp)} />
    </div>
  );
};

/** glass spec card: icon + big value + label */
const SpecCard: React.FC<{ frame: number; at: number; icon?: IconName; glyph?: React.ReactNode; value: React.ReactNode; label: string; x: number; y: number; w: number; size: number; solid?: boolean }> = ({ frame, at, icon, glyph, value, label, x, y, w, size, solid }) => {
  if (frame < at - 1) return null;
  const p = sp(frame, at, { damping: 12, stiffness: 190 });
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, display: "flex", alignItems: "center", gap: size * 0.45, padding: `${size * 0.32}px ${size * 0.45}px`, borderRadius: size * 0.6, background: solid ? "#fff" : "rgba(255,255,255,0.18)", border: solid ? "none" : "3px solid rgba(255,255,255,0.7)", boxShadow: "0 16px 40px rgba(6,14,90,0.3)", transform: `translateX(${(1 - p) * 300}px) scale(${lerp(0.7, 1, p)})`, opacity: Math.min(1, p * 1.4), fontFamily: FONT, color: solid ? COLORS.blue : "#fff" }}>
      <div style={{ width: size * 1.7, height: size * 1.7, borderRadius: "50%", background: solid ? `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.cyan})` : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {glyph ?? (icon ? <LineIcon name={icon} size={size * 1.05} stroke={7} color={solid ? "#fff" : COLORS.blue} progress={ramp(frame, at, at + 12)} /> : null)}
      </div>
      <div style={{ lineHeight: 1.05, minWidth: 0 }}>
        <div style={{ fontWeight: 900, fontSize: size * 1.05, whiteSpace: "nowrap" }}>{value}</div>
        <div style={{ fontWeight: 700, fontSize: size * 0.5, opacity: 0.9 }}>{label}</div>
      </div>
    </div>
  );
};

/** 1-inch sensor glyph */
const SensorGlyph: React.FC<{ size: number; color?: string }> = ({ size, color = COLORS.blue }) => (
  <svg viewBox="0 0 40 40" width={size} height={size}>
    <rect x={6} y={8} width={28} height={24} rx={4} fill="none" stroke={color} strokeWidth={3.5} />
    <rect x={12} y={13} width={16} height={14} rx={2} fill={color} opacity={0.85} />
    {[10, 16, 22, 28].map((x) => <line key={x} x1={x} y1={3} x2={x} y2={8} stroke={color} strokeWidth={2.5} />)}
    {[10, 16, 22, 28].map((x) => <line key={`b${x}`} x1={x} y1={32} x2={x} y2={37} stroke={color} strokeWidth={2.5} />)}
  </svg>
);

const MicGlyph: React.FC<{ size: number; color?: string }> = ({ size, color = COLORS.blue }) => (
  <svg viewBox="0 0 40 40" width={size} height={size} fill="none" stroke={color} strokeWidth={3.5} strokeLinecap="round">
    <rect x={14} y={4} width={12} height={20} rx={6} />
    <path d="M8 19 a12 12 0 0 0 24 0" />
    <line x1={20} y1={31} x2={20} y2={37} />
  </svg>
);

const TripodGlyph: React.FC<{ size: number; color?: string }> = ({ size, color = COLORS.blue }) => (
  <svg viewBox="0 0 40 40" width={size} height={size} fill="none" stroke={color} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
    <rect x={14} y={4} width={12} height={10} rx={3} />
    <line x1={20} y1={14} x2={20} y2={22} />
    <path d="M20 22 L8 36 M20 22 L32 36 M20 22 L20 36" />
  </svg>
);

const SdGlyph: React.FC<{ size: number; crossed: number }> = ({ size, crossed }) => (
  <svg viewBox="0 0 40 40" width={size} height={size}>
    <path d="M10 4 H26 L32 10 V36 H10 Z" fill="none" stroke={COLORS.blue} strokeWidth={3.5} strokeLinejoin="round" />
    {[15, 20, 25].map((x) => <line key={x} x1={x} y1={8} x2={x} y2={14} stroke={COLORS.blue} strokeWidth={2.5} />)}
    <path d={`M 4 36 L ${4 + 32 * crossed} ${36 - 32 * crossed}`} stroke="#FF3B5C" strokeWidth={4.5} strokeLinecap="round" />
  </svg>
);

/** 10.0-15.5 s Pocket 4: 1-inch sensor, 4K up to 240 fps. */
export const XP4: React.FC = () => {
  const frame = useSceneFrame("p4");
  const L = useLayout();
  const P = L.portrait;
  const G = P
    ? { hero: { x: 110, y: 330, w: 280 }, x: 450, w: 500, ys: [360, 560, 760], size: 46 }
    : { hero: { x: 80, y: 120, w: 200 }, x: 360, w: 620, ys: [140, 320, 500], size: 40 };
  const fpsAt = xev("p4.fps");
  const fps = Math.round(240 * easeOut(ramp(frame, fpsAt, fpsAt + 16)));
  const sk = shake(frame, fpsAt, 12, 8);
  return (
    <SceneShell id="p4" shakeX={sk.x} shakeY={sk.y}>
      <Heading frame={frame} at={xev("p4.name")} title="Osmo Pocket 4" sub="DJI" P={P} />
      <Hero img={OFFICIAL.pocket4} frame={frame} at={xscene("p4").from} x={G.hero.x} y={G.hero.y} w={G.hero.w} sweeps={[xev("p4.name") + 4, xev("p4.sensor"), fpsAt]} />
      <SpecCard frame={frame} at={xev("p4.sensor")} glyph={<SensorGlyph size={G.size * 1.1} />} value="Capteur 1″" label="1 pouce · plus de lumière" x={G.x} y={G.ys[0]} w={G.w} size={G.size} />
      <SpecCard frame={frame} at={xev("p4.k4")} icon="display" value="4K" label="vidéo ultra nette" x={G.x} y={G.ys[1]} w={G.w} size={G.size} />
      <SpecCard frame={frame} at={fpsAt} icon="stopwatch" value={<>{fps} <span style={{ fontSize: "0.5em" }}>fps</span></>} label="jusqu'à 240 fps en 4K (ralenti)" x={G.x} y={G.ys[2]} w={G.w} size={G.size} solid />
    </SceneShell>
  );
};

/** 15.5-23.0 s Pocket 4: 2x lossless zoom, 37 MP photos, 107 GB built-in storage (no memory card). */
export const XP4More: React.FC = () => {
  const frame = useSceneFrame("p4more");
  const L = useLayout();
  const P = L.portrait;
  const G = P
    ? { hero: { x: 90, y: 340, w: 240 }, x: 380, w: 570, ys: [300, 500, 700, 900], size: 44 }
    : { hero: { x: 60, y: 120, w: 180 }, x: 290, w: 700, ys: [115, 275, 435, 595], size: 34 };
  const zAt = xev("p4.zoom"), phAt = xev("p4.photo"), stAt = xev("p4.storage"), gbAt = xev("p4.gb"), cAt = xev("p4.card");
  const zoom = 1 + easeOut(ramp(frame, zAt + 4, zAt + 20));
  const gb = Math.round(107 * easeOut(ramp(frame, gbAt, gbAt + 16)));
  const flash = interpolate(frame - phAt, [0, 1, 7], [0, 0.8, 0], clamp);
  return (
    <SceneShell id="p4more">
      <Heading frame={frame} at={xscene("p4more").from} title="Osmo Pocket 4" sub="DJI" P={P} />
      <Hero img={OFFICIAL.pocket4} frame={frame} at={xscene("p4more").from - 30} x={G.hero.x} y={G.hero.y} w={G.hero.w} sweeps={[phAt, gbAt]} />
      <SpecCard frame={frame} at={zAt} icon="lens" value={<>Zoom {zoom.toFixed(1).replace(".", ",")}x</>} label="sans perte de qualité (2x)" x={G.x} y={G.ys[0]} w={G.w} size={G.size} />
      <SpecCard frame={frame} at={phAt} icon="camera" value="37 MP" label="photos (mode SuperPhoto)" x={G.x} y={G.ys[1]} w={G.w} size={G.size} />
      <SpecCard frame={frame} at={stAt} icon="chip" value={frame >= gbAt ? <>{gb} GB</> : "Stockage"} label="intégré" x={G.x} y={G.ys[2]} w={G.w} size={G.size} solid />
      <SpecCard frame={frame} at={cAt} glyph={<SdGlyph size={G.size * 1.2} crossed={ramp(frame, cAt + 4, cAt + 10)} />} value="Pas de carte" label="mémoire nécessaire" x={G.x} y={G.ys[3]} w={G.w} size={G.size} />
      <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: flash }} />
    </SceneShell>
  );
};

/** 23.0-28.0 s Pocket 4 battery: up to 240 min (1080p), full charge in 32 min. */
export const XBattery: React.FC = () => {
  const frame = useSceneFrame("battery");
  const L = useLayout();
  const P = L.portrait;
  const mAt = xev("bat.min"), cAt = xev("bat.charge"), tAt = xev("bat.32"), rAt = xev("bat.rapid");
  const mins = Math.round(240 * easeOut(ramp(frame, mAt, mAt + 18)));
  const fill = interpolate(frame, [xscene("battery").from + 2, mAt + 20], [0.05, 1], clamp);
  const h1 = slam(frame, mAt, 1.8);
  const c1 = sp(frame, cAt, { damping: 12, stiffness: 190 });
  const m1 = sp(frame, tAt, { damping: 10, stiffness: 220 });
  const arrow = ramp(frame, cAt + 6, tAt);
  const G = P ? { bat: { x: 210, y: 330, w: 600, h: 250 }, num: 150, row: 760, card: 250 } : { bat: { x: 80, y: 150, w: 420, h: 190 }, num: 110, row: 0, card: 200 };
  const enter = sp(frame, xscene("battery").from + 1, { damping: 14, stiffness: 140 });
  return (
    <SceneShell id="battery">
      <div style={{ position: "absolute", left: G.bat.x, top: G.bat.y, width: G.bat.w, height: G.bat.h, borderRadius: 40, border: "10px solid #fff", padding: 14, opacity: enter, transform: `scale(${lerp(0.7, 1, enter)})`, boxShadow: "0 20px 50px rgba(6,14,90,0.35)" }}>
        <div style={{ position: "absolute", right: -40, top: G.bat.h * 0.3, width: 26, height: G.bat.h * 0.4, borderRadius: 8, background: "#fff" }} />
        <div style={{ width: `${fill * 100}%`, height: "100%", borderRadius: 22, background: "linear-gradient(90deg, #6CF3FF, #ffffff)", opacity: 0.9 }} />
        {frame >= mAt - 1 && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: FONT, color: COLORS.blue, ...h1 }}>
            <span style={{ fontWeight: 900, fontSize: G.num }}>{mins}</span>
            <span style={{ fontWeight: 900, fontSize: G.num * 0.4 }}>min</span>
          </div>
        )}
      </div>
      <div style={{ position: "absolute", left: P ? 0 : G.bat.x - 40, right: P ? 70 : undefined, width: P ? undefined : G.bat.w + 80, top: G.bat.y + G.bat.h + 24, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: P ? 30 : 22, color: "#fff", opacity: ramp(frame, mAt + 6, mAt + 14) }}>
        d'autonomie (jusqu'à, en 1080p)
      </div>
      <div style={{ position: "absolute", left: P ? 110 : 580, top: P ? G.row : 90, display: "flex", flexDirection: P ? "row" : "column", alignItems: "center", gap: 26 }}>
        <div style={{ width: G.card, height: G.card, borderRadius: 40, background: "rgba(255,255,255,0.2)", border: "3px solid rgba(255,255,255,0.7)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `scale(${c1})`, fontFamily: FONT, color: "#fff", gap: 6 }}>
          <LineIcon name="bolt" size={G.card * 0.42} progress={ramp(frame, cAt, cAt + 12)} stroke={6} />
          <div style={{ fontWeight: 900, fontSize: G.card * 0.13, textAlign: "center", lineHeight: 1.05 }}>Charge<br />rapide</div>
        </div>
        <svg viewBox="0 0 100 40" width={P ? 120 : 80} height={P ? 48 : 32} style={{ transform: P ? undefined : "rotate(90deg)" }}>
          {arrow > 0 && <path d={`M 4 20 H ${4 + 80 * arrow}`} stroke="#fff" strokeWidth={8} strokeLinecap="round" />}
          {arrow > 0.95 && <path d="M 72 6 L 90 20 L 72 34" fill="none" stroke="#fff" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />}
        </svg>
        <div style={{ width: G.card, height: G.card, borderRadius: 40, background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `scale(${m1})`, fontFamily: FONT, color: COLORS.blue }}>
          <LineIcon name="battery" size={G.card * 0.38} progress={ramp(frame, tAt, tAt + 12)} stroke={7} color={COLORS.blue} />
          <div style={{ fontWeight: 900, fontSize: G.card * 0.24 }}>32 min</div>
          <div style={{ fontWeight: 600, fontSize: G.card * 0.1, opacity: ramp(frame, rAt, rAt + 8) }}>pour 100 %</div>
        </div>
      </div>
    </SceneShell>
  );
};

/** 28.0-34.0 s Pocket 3 Creator Combo: 1-inch sensor, 4K up to 120 fps. */
export const XP3: React.FC = () => {
  const frame = useSceneFrame("p3");
  const L = useLayout();
  const P = L.portrait;
  const G = P
    ? { hero: { x: 60, y: 330, w: 400 }, x: 480, w: 470, ys: [380, 580, 780], size: 44 }
    : { hero: { x: 50, y: 110, w: 280 }, x: 380, w: 620, ys: [150, 330, 510], size: 40 };
  const at = xev("p3.name"), fAt = xev("p3.fps");
  const fps = Math.round(120 * easeOut(ramp(frame, fAt, fAt + 14)));
  const sk = shake(frame, at, 14, 9);
  return (
    <SceneShell id="p3" shakeX={sk.x} shakeY={sk.y}>
      <Heading frame={frame} at={at + 2} title="Pocket 3 Creator Combo" sub="DJI Osmo" P={P} />
      <Hero img={OFFICIAL.combo} frame={frame} at={at} x={G.hero.x} y={G.hero.y} w={G.hero.w} sweeps={[at + 8, xev("p3.sensor"), fAt]} from={1} />
      <SpecCard frame={frame} at={xev("p3.sensor")} glyph={<SensorGlyph size={G.size * 1.1} />} value="Capteur 1″" label="1 pouce" x={G.x} y={G.ys[0]} w={G.w} size={G.size} />
      <SpecCard frame={frame} at={xev("p3.k4")} icon="display" value="4K" label="vidéo ultra nette" x={G.x} y={G.ys[1]} w={G.w} size={G.size} />
      <SpecCard frame={frame} at={fAt} icon="stopwatch" value={<>{fps} <span style={{ fontSize: "0.5em" }}>fps</span></>} label="jusqu'à 120 fps en 4K" x={G.x} y={G.ys[2]} w={G.w} size={G.size} solid />
    </SceneShell>
  );
};

/** 34.0-41.5 s what's in the Creator Combo + "everything to start creating". */
export const XCombo: React.FC = () => {
  const frame = useSceneFrame("combo");
  const L = useLayout();
  const P = L.portrait;
  const G = P
    ? { hero: { x: 70, y: 340, w: 270 }, x: 370, w: 580, y0: 320, dy: 150, size: 40, banner: 940 }
    : { hero: { x: 60, y: 110, w: 210 }, x: 320, w: 680, y0: 115, dy: 125, size: 34, banner: 640 };
  const ITEMS: { at: number; glyph: React.ReactNode; value: string; label: string }[] = [
    { at: xev("cb.mic"), glyph: <MicGlyph size={G.size * 1.15} />, value: "DJI Mic 2", label: "micro sans fil" },
    { at: xev("cb.wide"), glyph: <LineIcon name="lens" size={G.size * 1.05} stroke={7} color={COLORS.blue} />, value: "Grand angle", label: "objectif" },
    { at: xev("cb.handle"), glyph: <LineIcon name="battery" size={G.size * 1.05} stroke={7} color={COLORS.blue} />, value: "Poignée batterie", label: "plus d'autonomie" },
    { at: xev("cb.tripod"), glyph: <TripodGlyph size={G.size * 1.15} />, value: "Mini trépied", label: "inclus" },
  ];
  const allAt = xev("cb.all");
  const banner = slam(frame, allAt, 2);
  return (
    <SceneShell id="combo">
      <Heading frame={frame} at={xscene("combo").from} title="Creator Combo" sub="Dans la boîte" P={P} />
      <Hero img={OFFICIAL.combo} frame={frame} at={xscene("combo").from - 30} x={G.hero.x} y={G.hero.y} w={G.hero.w} sweeps={ITEMS.map((i) => i.at)} />
      {ITEMS.map((it, i) => (
        <SpecCard key={i} frame={frame} at={it.at} glyph={it.glyph} value={it.value} label={it.label} x={G.x} y={G.y0 + i * G.dy} w={G.w} size={G.size} />
      ))}
      {frame >= allAt - 1 && (
        <div style={{ position: "absolute", left: P ? 340 : G.x, right: P ? 70 : 40, top: G.banner, display: "flex", justifyContent: "center" }}>
          <div style={{ ...banner, display: "flex", alignItems: "center", gap: 14, fontFamily: FONT, fontWeight: 900, fontSize: G.size * 0.95, color: COLORS.blue, background: "#fff", padding: "12px 28px", borderRadius: 999, boxShadow: "0 14px 34px rgba(6,14,90,0.35)", whiteSpace: "nowrap" }}>
            <LineIcon name="check" size={G.size * 1.2} stroke={8} color={COLORS.blue} />
            Le kit pour créer du contenu
          </div>
        </div>
      )}
    </SceneShell>
  );
};

/** 41.5-47.0 s 3-axis stabilisation: the world shakes (walk / run / ride), the camera stays level. */
export const XStab: React.FC = () => {
  const frame = useSceneFrame("stab");
  const L = useLayout();
  const P = L.portrait;
  const G = P
    ? { hero: { x: 300, y: 330, w: 260 }, chips: { x: 600, y: 560 }, size: 36, stamp: 230 }
    : { hero: { x: 120, y: 90, w: 200 }, chips: { x: 450, y: 420 }, size: 32, stamp: 150 };
  const wAt = xev("st.walk"), rAt = xev("st.run"), dAt = xev("st.ride"), sAt = xev("st.steady"), axAt = xev("st.axes");
  // ground shake grows walk -> run -> ride, stops on "ثابت"
  const amp = frame < wAt ? 0 : frame < rAt ? 6 : frame < dAt ? 12 : frame < sAt ? 9 : 0;
  const jx = (random(`sx-${frame}`) - 0.5) * 2 * amp, jy = (random(`sy-${frame}`) - 0.5) * 2 * amp;
  const imgH = G.hero.w * OFFICIAL.pocket4.aspect;
  const head = { x: G.hero.x + G.hero.w * 0.5, y: G.hero.y + imgH * 0.12 };
  const axes = ramp(frame, axAt - 4, axAt + 10);
  const stamp = slam(frame, sAt, 2.4);
  const CHIPS: { at: number; icon: IconName; text: string }[] = [
    { at: wAt, icon: "run", text: "En marchant" },
    { at: rAt, icon: "run", text: "En courant" },
    { at: dAt, icon: "car", text: "En roulant" },
  ];
  return (
    <SceneShell id="stab" shakeX={jx} shakeY={jy}>
      <Heading frame={frame} at={xev("st.name")} title="Stabilisation 3 axes" P={P} />
      {/* the camera itself stays perfectly still: cancel the scene shake */}
      <Hero img={OFFICIAL.pocket4} frame={frame} at={xscene("stab").from - 20} x={G.hero.x} y={G.hero.y} w={G.hero.w} sweeps={[sAt]} steady={{ x: -jx, y: -jy }} />
      {/* three gimbal axes orbiting the camera head */}
      <svg width={L.w} height={L.h} style={{ position: "absolute", left: -jx, top: -jy, opacity: axes }}>
        {[0, 60, 120].map((rot, i) => {
          const r = G.hero.w * (0.75 + i * 0.12);
          const dash = 2 * Math.PI * r;
          return (
            <ellipse key={i} cx={head.x} cy={head.y} rx={r} ry={r * 0.32} fill="none" stroke={i === 1 ? COLORS.cyan : "#fff"} strokeWidth={5} strokeDasharray={`${dash * 0.6 * axes} ${dash}`} strokeDashoffset={-frame * 6} transform={`rotate(${rot + frame * 0.6} ${head.x} ${head.y})`} opacity={0.85} />
          );
        })}
      </svg>
      <div style={{ position: "absolute", left: G.chips.x, right: P ? undefined : 40, top: G.chips.y, display: "flex", flexDirection: P ? "column" : "row", flexWrap: "wrap", gap: 14, justifyContent: "center", alignItems: "flex-start" }}>
        {CHIPS.map((c) => {
          if (frame < c.at - 1) return null;
          const p = pop(frame, c.at);
          return (
            <div key={c.text} style={{ display: "flex", alignItems: "center", gap: 10, padding: `${G.size * 0.2}px ${G.size * 0.55}px`, borderRadius: 999, background: "rgba(255,255,255,0.18)", border: "3px solid rgba(255,255,255,0.75)", color: "#fff", fontFamily: FONT, fontWeight: 900, fontSize: G.size, transform: `scale(${p})`, whiteSpace: "nowrap" }}>
              <LineIcon name={c.icon} size={G.size * 1.2} stroke={7} />
              {c.text}
            </div>
          );
        })}
      </div>
      {frame >= sAt - 1 && (
        <div style={{ position: "absolute", left: P ? 340 : 450, right: P ? 70 : 40, top: P ? 1090 : 250, display: "flex", justifyContent: "center" }}>
          <div style={{ ...stamp, transform: `${stamp.transform ?? ""} rotate(-6deg)`, fontFamily: FONT, fontWeight: 900, fontSize: P ? 64 : 54, color: COLORS.blue, background: "#fff", padding: "4px 26px 10px", borderRadius: 18, boxShadow: "0 14px 34px rgba(6,14,90,0.35)", whiteSpace: "nowrap" }}>
            VIDÉO STABLE
          </div>
        </div>
      )}
    </SceneShell>
  );
};
