import React from "react";
import { Img, interpolate, random, staticFile } from "remotion";
import { COLORS, FONT } from "../../brand";
import { lerp, pop, ramp, shake, slam, sp } from "../../anim";
import { useLayout } from "../../layout";
import { IconName, LineIcon } from "../../components/Icons";
import { ProductImage } from "../../components/ProductImage";
import { Burst, SceneShell, useSceneFrame } from "../../components/SceneShell";
import { mev, mscene, OFFICIAL } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

/** waveform path: noisy (k=1) -> clean voice (k=0) */
const wavePath = (frame: number, w: number, h: number, noisy: number, seed: string) =>
  Array.from({ length: 121 }, (_, i) => {
    const x = (i / 120) * w;
    const env = Math.sin((i / 120) * Math.PI);
    const voice = Math.sin(i * 0.35 + frame * 0.5) * 0.45 * (0.6 + 0.4 * Math.sin(i * 0.07 + frame * 0.1));
    const noise = (random(`${seed}-${i}-${Math.floor(frame / 2)}`) - 0.5) * 2;
    const y = h / 2 + (voice * (1 - noisy) + noise * noisy) * env * h * 0.45;
    return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");

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

const PhotoCard: React.FC<{ img: { src: string; aspect: number }; x: number; y: number; w: number; p: number; rot?: number; zoom?: number; dark?: boolean }> = ({ img, x, y, w, p, rot = -2, zoom = 1, dark }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: w * img.aspect, borderRadius: 34, overflow: "hidden", border: `6px solid ${dark ? "rgba(255,255,255,0.9)" : "#fff"}`, boxShadow: "0 30px 70px rgba(6,14,90,0.5)", transform: `translateY(${(1 - p) * 900}px) rotate(${lerp(8, rot, p)}deg)`, background: "#fff" }}>
    <Img src={staticFile(img.src)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})` }} />
  </div>
);

/*
 * 0.0-1.5 s HOOK ("your videos' sound is bad?")
 * visual: a red, distorted waveform with noise labels, shaking; written: "الصوت خايب؟"; verbal: VO line 1
 */
export const MHook: React.FC = () => {
  const frame = useSceneFrame("hook");
  const L = useLayout();
  const P = L.portrait;
  const G = P ? { title: 250, tsize: 110, wave: { x: 60, y: 520, w: 900, h: 300 } } : { title: 50, tsize: 80, wave: { x: 90, y: 230, w: 900, h: 260 } };
  const badAt = mev("hook.bad");
  const t1 = slam(frame, 0, 2);
  const t2 = slam(frame, badAt, 2.6);
  const jx = (random(`hx-${frame}`) - 0.5) * 14, jy = (random(`hy-${frame}`) - 0.5) * 14;
  const LABELS = [{ t: "Bruit", x: 0.05, y: -0.15, r: -8 }, { t: "Vent", x: 0.62, y: -0.1, r: 7 }, { t: "Écho", x: P ? 0.36 : 0.72, y: P ? -0.42 : 1.0, r: -4 }];
  return (
    <SceneShell id="hook" shakeX={jx} shakeY={jy}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, rgba(255,60,90,0.35), rgba(255,60,90,0) 70%)" }} />
      <div style={{ position: "absolute", left: 0, right: P ? 70 : 0, top: G.title, display: "flex", justifyContent: "center" }}>
        <div dir="rtl" style={{ ...(frame >= badAt ? t2 : t1), fontFamily: FONT, fontWeight: 900, fontSize: G.tsize, color: "#fff", lineHeight: 1.25, whiteSpace: "nowrap", textShadow: "0 10px 34px rgba(8,20,110,0.45)" }}>
          {frame >= badAt ? "الصوت خايب؟" : "الصوت…"}
        </div>
      </div>
      <svg viewBox={`0 0 ${G.wave.w} ${G.wave.h}`} style={{ position: "absolute", left: G.wave.x, top: G.wave.y, width: G.wave.w, height: G.wave.h }}>
        <path d={wavePath(frame, G.wave.w, G.wave.h, 1, "h")} fill="none" stroke="#FF3B5C" strokeWidth={7} strokeLinejoin="round" />
      </svg>
      {LABELS.map((l, i) => (
        <div key={i} style={{ position: "absolute", left: G.wave.x + l.x * G.wave.w, top: G.wave.y + l.y * G.wave.h, transform: `scale(${pop(frame, 3 + i * 6)}) rotate(${l.r + Math.sin(frame * 1.3 + i) * 4}deg)`, fontFamily: FONT, fontWeight: 900, fontSize: P ? 48 : 40, color: "#fff", background: "#FF3B5C", padding: "0 22px 6px", borderRadius: 14, boxShadow: "0 10px 26px rgba(80,0,20,0.35)" }}>
          {l.t}
        </div>
      ))}
      <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: interpolate(frame, [0, 1, 6], [0.5, 0.5, 0], clamp) }} />
    </SceneShell>
  );
};

/** 1.5-6.5 s INTRO: the waveform turns clean, the mic slams in next to a finger-size marker; DJI Mic Mini 2, DISPONIBLE. */
export const MIntro: React.FC = () => {
  const frame = useSceneFrame("intro");
  const L = useLayout();
  const P = L.portrait;
  const G = P
    ? { hero: { x: 110, y: 420, w: 820 }, wave: { x: 60, y: 260, w: 900, h: 140 }, name: 1110, nsize: 76, pill: { y: 1230, size: 36 }, finger: { x: 700, y: 330 } }
    : { hero: { x: 60, y: 210, w: 560 }, wave: { x: 60, y: 40, w: 960, h: 120 }, name: 300, nsize: 60, pill: { y: 420, size: 30 }, finger: { x: 820, y: 170 } };
  const micAt = mev("intro.mic"), fAt = mev("intro.finger"), cAt = mev("intro.change"), nAt = mev("intro.name"), dAt = mev("intro.dispo");
  const enter = sp(frame, micAt, { damping: 11, stiffness: 140, mass: 0.8 });
  const sk = shake(frame, micAt, 16, 11);
  const clean = ramp(frame, micAt, micAt + 14);
  const name = slam(frame, nAt, 2);
  const dispo = slam(frame, dAt, 1.8);
  const t = frame / 30;
  return (
    <SceneShell id="intro" shakeX={sk.x} shakeY={sk.y}>
      <Burst x={G.hero.x + G.hero.w / 2} y={G.hero.y + G.hero.w * 0.4} r={P ? 900 : 640} rot={frame * 0.6} opacity={0.2 * enter} rays={20} />
      <svg viewBox={`0 0 ${G.wave.w} ${G.wave.h}`} style={{ position: "absolute", left: G.wave.x, top: G.wave.y, width: G.wave.w, height: G.wave.h, opacity: 1 - ramp(frame, nAt - 4, nAt) }}>
        <path d={wavePath(frame, G.wave.w, G.wave.h, 1 - clean, "i")} fill="none" stroke={clean > 0.5 ? "#fff" : "#FF3B5C"} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", left: G.hero.x, top: G.hero.y, transform: `translateY(${(1 - enter) * -900 + Math.sin(t * Math.PI * 1.1) * 8}px) scale(${lerp(1.5, 1, enter)}) rotate(${lerp(-12, -2, enter)}deg)`, filter: "drop-shadow(0 30px 40px rgba(6,14,90,0.5))" }}>
        <ProductImage src={OFFICIAL.hero.src} aspect={OFFICIAL.hero.aspect} width={G.hero.w} sweep={interpolate(frame, [nAt, nAt + 16], [-0.3, 1.3], clamp)} />
      </div>
      {frame >= fAt - 1 && frame < nAt && (
        <div style={{ position: "absolute", left: G.finger.x, top: G.finger.y, transform: `scale(${pop(frame, fAt)}) rotate(-6deg)`, display: "flex", alignItems: "center", gap: 10, fontFamily: FONT, fontWeight: 900, fontSize: P ? 40 : 32, color: COLORS.blue, background: "#fff", padding: "6px 22px 10px", borderRadius: 999, boxShadow: "0 10px 26px rgba(6,14,90,0.35)", whiteSpace: "nowrap" }}>
          <span dir="rtl">قد الصبع</span> ☝
        </div>
      )}
      {frame >= cAt && frame < nAt && (
        <div style={{ position: "absolute", left: P ? 340 : 0, right: P ? 70 : 0, top: P ? 1120 : 400, display: "flex", justifyContent: "center" }}>
          <div dir="rtl" style={{ ...slam(frame, cAt, 2), fontFamily: FONT, fontWeight: 900, fontSize: P ? 60 : 56, color: "#fff", textShadow: "0 10px 30px rgba(8,20,110,0.4)", whiteSpace: "nowrap" }}>غادي يبدّل كلشي!</div>
        </div>
      )}
      {frame >= nAt - 1 && (
        <div style={{ position: "absolute", left: P ? 0 : 640, right: P ? 70 : 40, top: G.name, display: "flex", justifyContent: "center" }}>
          <div style={{ ...name, fontFamily: FONT, fontWeight: 900, fontSize: G.nsize, color: "#fff", whiteSpace: "nowrap", textShadow: "0 10px 30px rgba(8,20,110,0.4)" }}>DJI Mic Mini 2</div>
        </div>
      )}
      {frame >= dAt - 1 && (
        <div style={{ position: "absolute", left: P ? 340 : 640, right: P ? 70 : 40, top: G.pill.y, display: "flex", justifyContent: "center" }}>
          <div style={{ ...dispo, display: "flex", alignItems: "center", gap: 12, fontFamily: FONT, fontWeight: 900, fontSize: G.pill.size, color: COLORS.blue, background: "#fff", padding: "8px 26px", borderRadius: 999, letterSpacing: 3, boxShadow: "0 10px 26px rgba(6,14,90,0.3)" }}>
            <LineIcon name="store" size={G.pill.size * 1.3} stroke={7} color={COLORS.blue} />
            DISPONIBLE
          </div>
        </div>
      )}
    </SceneShell>
  );
};

/** 6.5-10.5 s tiny & light: 11 g, clips on clothes, barely visible. */
export const MSize: React.FC = () => {
  const frame = useSceneFrame("size");
  const L = useLayout();
  const P = L.portrait;
  const G = P ? { card: { x: 70, y: 330, w: 520 }, g: { x: 650, y: 440, s: 170 }, chips: { y: 1170 } } : { card: { x: 60, y: 110, w: 380 }, g: { x: 520, y: 150, s: 140 }, chips: { y: 480 } };
  const at = mscene("size").from;
  const enter = sp(frame, at, { damping: 13, stiffness: 120 });
  const gAt = mev("sz.grams"), cAt = mev("sz.clip"), hAt = mev("sz.hidden");
  const grams = Math.round(11 * easeOut(ramp(frame, gAt, gAt + 12)));
  const g1 = slam(frame, gAt, 2);
  return (
    <SceneShell id="size">
      <Heading frame={frame} at={at + 2} title="Ultra léger" P={P} />
      <PhotoCard img={OFFICIAL.osmoDirect} x={G.card.x} y={G.card.y} w={G.card.w} p={enter} zoom={1 + 0.08 * ramp(frame, cAt, cAt + 30)} />
      {frame >= gAt - 1 && (
        <div style={{ position: "absolute", left: G.g.x, top: G.g.y, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, fontFamily: FONT, color: "#fff", ...g1 }}>
          <LineIcon name="pin" size={G.g.s * 0.5} stroke={6} />
          <div style={{ fontWeight: 900, fontSize: G.g.s, lineHeight: 1, textShadow: "0 10px 30px rgba(8,20,110,0.4)" }}>{grams}<span style={{ fontSize: "0.4em" }}> g</span></div>
          <div style={{ fontWeight: 700, fontSize: G.g.s * 0.17, textAlign: "center" }}>émetteur<br />(sans clip)</div>
        </div>
      )}
      <div style={{ position: "absolute", left: P ? 340 : 520, right: P ? 70 : 40, top: G.chips.y, display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
        <Chip frame={frame} at={mev("sz.small")} text="Mini" icon="ruler" size={P ? 38 : 32} />
        <Chip frame={frame} at={cAt} text="Clip & aimant" icon="lock" size={P ? 38 : 32} />
        <Chip frame={frame} at={hAt} text="Discret" icon="check" size={P ? 38 : 32} solid />
      </div>
    </SceneShell>
  );
};

/** 10.5-14.75 s 24-bit audio + noise cancelling (street, wind). */
export const MAudio: React.FC = () => {
  const frame = useSceneFrame("audio");
  const L = useLayout();
  const P = L.portrait;
  const G = P ? { wave: { x: 60, y: 420, w: 900, h: 260 }, bit: { y: 760 }, chips: { y: 1050 } } : { wave: { x: 60, y: 150, w: 960, h: 220 }, bit: { y: 400 }, chips: { y: 560 } };
  const bitAt = mev("au.bit"), ncAt = mev("au.nc"), sAt = mev("au.street"), wAt = mev("au.wind");
  // noise layer fades out when noise cancelling kicks in
  const nc = ramp(frame, ncAt, ncAt + 18);
  const bit = slam(frame, bitAt, 2);
  return (
    <SceneShell id="audio">
      <Heading frame={frame} at={mscene("audio").from + 2} title="Son clair" P={P} />
      <svg viewBox={`0 0 ${G.wave.w} ${G.wave.h}`} style={{ position: "absolute", left: G.wave.x, top: G.wave.y, width: G.wave.w, height: G.wave.h }}>
        <path d={wavePath(frame, G.wave.w, G.wave.h, 0.85, "an")} fill="none" stroke="#FF3B5C" strokeWidth={5} opacity={0.8 * (1 - nc)} />
        <path d={wavePath(frame, G.wave.w, G.wave.h, 0, "av")} fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" opacity={0.4 + 0.6 * nc} />
      </svg>
      {frame >= bitAt - 1 && (
        <div style={{ position: "absolute", left: 0, right: P ? 70 : 0, top: G.bit.y, display: "flex", justifyContent: "center", gap: 18, alignItems: "baseline", fontFamily: FONT, color: "#fff", ...bit }}>
          <span style={{ fontWeight: 900, fontSize: P ? 140 : 110, lineHeight: 1, textShadow: "0 10px 30px rgba(8,20,110,0.4)" }}>24-bit</span>
          <span style={{ fontWeight: 800, fontSize: P ? 34 : 28 }}>48 kHz</span>
        </div>
      )}
      <div style={{ position: "absolute", left: P ? 340 : 60, right: P ? 70 : 40, top: G.chips.y, display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
        <Chip frame={frame} at={ncAt} text="Réduction de bruit" icon="headphones" size={P ? 38 : 32} solid />
        <Chip frame={frame} at={sAt} text="Rue" icon="car" size={P ? 38 : 32} />
        <Chip frame={frame} at={wAt} text="Vent" icon="wave" size={P ? 38 : 32} />
      </div>
    </SceneShell>
  );
};

/** 14.75-19.25 s battery: up to 11.5 h (transmitter) and up to 48 h with the charging case. */
export const MBattery: React.FC = () => {
  const frame = useSceneFrame("battery");
  const L = useLayout();
  const P = L.portrait;
  const G = P ? { card: { x: 210, y: 300, w: 600 }, num: 140, row: { y: 960 } } : { card: { x: 60, y: 120, w: 440 }, num: 110, row: { y: 160 } };
  const at = mscene("battery").from;
  const enter = sp(frame, at, { damping: 13, stiffness: 120 });
  const txAt = mev("bat.tx"), cAt = mev("bat.case");
  const tx = (11.5 * easeOut(ramp(frame, txAt, txAt + 14))).toFixed(1).replace(".", ",").replace(",0", "");
  const cs = Math.round(48 * easeOut(ramp(frame, cAt, cAt + 18)));
  const card = (at2: number, value: React.ReactNode, label: string, solid: boolean) => {
    if (frame < at2 - 1) return null;
    const p = slam(frame, at2, 1.8);
    return (
      <div style={{ ...p, width: P ? 360 : 300, whiteSpace: "nowrap", padding: "18px 10px", borderRadius: 34, background: solid ? "#fff" : "rgba(255,255,255,0.18)", border: solid ? "none" : "3px solid rgba(255,255,255,0.7)", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: FONT, color: solid ? COLORS.blue : "#fff", boxShadow: "0 16px 40px rgba(6,14,90,0.3)" }}>
        <div style={{ fontWeight: 900, fontSize: G.num * 0.75, lineHeight: 1 }}>{value}</div>
        <div style={{ fontWeight: 700, fontSize: G.num * 0.17, textAlign: "center" }}>{label}</div>
      </div>
    );
  };
  return (
    <SceneShell id="battery">
      <PhotoCard img={OFFICIAL.studio} x={G.card.x} y={G.card.y} w={P ? G.card.w : G.card.w} p={enter} zoom={1 + 0.06 * ramp(frame, at, at + 120)} dark />
      <div style={{ position: "absolute", left: P ? 60 : 540, right: P ? 70 : 40, top: G.row.y, display: "flex", flexDirection: P ? "row" : "column", gap: 24, justifyContent: "center", alignItems: "center" }}>
        {card(txAt, <>{tx} h</>, "par micro (jusqu'à)", false)}
        {card(cAt, <>{cs} h</>, "avec l'étui de charge", true)}
      </div>
    </SceneShell>
  );
};

/** 19.25-23.5 s connect to the phone, and direct to Osmo Pocket / Osmo Action without receiver. */
export const MConnect: React.FC = () => {
  const frame = useSceneFrame("connect");
  const L = useLayout();
  const P = L.portrait;
  const G = P ? { card: { x: 90, y: 300, w: 840 }, y: 920, size: 40 } : { card: { x: 40, y: 80, w: 500 }, y: 0, size: 27 };
  const at = mscene("connect").from;
  const enter = sp(frame, at, { damping: 13, stiffness: 120 });
  const ROWS: { at: number; icon: IconName; text: string; solid?: boolean }[] = [
    { at: mev("cn.phone"), icon: "phone", text: "Smartphone" },
    { at: mev("cn.pocket"), icon: "camera", text: "Osmo Pocket — direct" },
    { at: mev("cn.action"), icon: "camera", text: "Osmo Action — direct" },
  ];
  const nrAt = mev("cn.norx");
  const nr = slam(frame, nrAt, 2.2);
  return (
    <SceneShell id="connect">
      <PhotoCard img={OFFICIAL.kit} x={G.card.x} y={G.card.y} w={G.card.w} p={enter} zoom={1 + 0.06 * ramp(frame, at, at + 120)} />
      <div style={{ position: "absolute", left: P ? 340 : 580, right: P ? 70 : 30, top: P ? G.y : 110, display: "flex", flexDirection: "column", gap: 14, alignItems: P ? "center" : "flex-start" }}>
        {ROWS.map((r) => <Chip key={r.text} frame={frame} at={r.at} text={r.text} icon={r.icon} size={G.size} />)}
        {frame >= nrAt - 1 && (
          <div style={{ ...nr, display: "flex", alignItems: "center", gap: 12, fontFamily: FONT, fontWeight: 900, fontSize: G.size * 1.05, color: COLORS.blue, background: "#fff", padding: "10px 28px", borderRadius: 999, boxShadow: "0 14px 34px rgba(6,14,90,0.35)", whiteSpace: "nowrap" }}>
            <LineIcon name="check" size={G.size * 1.2} stroke={8} color={COLORS.blue} />
            Sans récepteur
          </div>
        )}
      </div>
    </SceneShell>
  );
};
