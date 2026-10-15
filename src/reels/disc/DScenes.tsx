import React from "react";
import { interpolate } from "remotion";
import { COLORS, FONT } from "../../brand";
import { lerp, pop, ramp, shake, slam, sp } from "../../anim";
import { IconName, LineIcon } from "../../components/Icons";
import { ProductImage } from "../../components/ProductImage";
import { Burst, SceneShell, useSceneFrame } from "../../components/SceneShell";
import { dev, dscene, OFFICIAL } from "./timeline";

// 9:16 only (the user asked for no 1:1 version).
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const CX = 505;
type Img = { src: string; aspect: number };

const Chip: React.FC<{ frame: number; at: number; text: string; icon?: IconName; size?: number; solid?: boolean }> = ({ frame, at, text, icon, size = 36, solid }) => {
  if (frame < at - 1) return null;
  const p = sp(frame, at, { damping: 11, stiffness: 220, mass: 0.6 });
  const fg = solid ? COLORS.blue : "#fff";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.35, padding: `${size * 0.22}px ${size * 0.66}px`, borderRadius: 999, background: solid ? "#fff" : "rgba(255,255,255,0.18)", border: solid ? "none" : "3px solid rgba(255,255,255,0.75)", color: fg, fontFamily: FONT, fontWeight: 900, fontSize: size, whiteSpace: "nowrap", transform: `scale(${p})`, boxShadow: "0 12px 30px rgba(6,14,90,0.3)" }}>
      {icon ? <LineIcon name={icon} size={size * 1.2} stroke={7} color={fg} progress={ramp(frame, at, at + 10)} /> : null}
      {text}
    </div>
  );
};

const Prod: React.FC<{ img: Img; h: number; sweep?: number; shadow?: boolean }> = ({ img, h, sweep = -1, shadow = true }) => (
  <div style={{ filter: shadow ? "drop-shadow(0 30px 40px rgba(6,14,90,0.5))" : undefined }}>
    <ProductImage src={img.src} aspect={img.aspect} width={h / img.aspect} sweep={sweep} />
  </div>
);

/** drawn game disc (no logos) */
const Disc: React.FC<{ d: number; label?: string; spin?: number }> = ({ d, label, spin = 0 }) => (
  <div style={{ position: "relative", width: d, height: d }}>
    <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "conic-gradient(from 0deg, #dfe8f5, #ffffff, #b9c8e0, #f2f7ff, #c4d3ea, #ffffff, #dfe8f5)", border: "4px solid #fff", boxShadow: "0 14px 30px rgba(6,14,90,0.45)", transform: `rotate(${spin}deg)` }} />
    <div style={{ position: "absolute", left: d * 0.36, top: d * 0.36, width: d * 0.28, height: d * 0.28, borderRadius: "50%", background: "rgba(40,80,200,0.9)", border: "4px solid #fff" }} />
    {label && <div style={{ position: "absolute", left: 0, right: 0, top: d * 0.1, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: d * 0.17, color: COLORS.blue }}>{label}</div>}
  </div>
);

/** console with the drive module + cover assembled onto its lower-right side (fractions measured on the official render) */
const Assembled: React.FC<{ h: number; module: number; cover: number; sweep?: number }> = ({ h, module, cover, sweep }) => {
  const w = h / OFFICIAL.console.aspect;
  const cw = w * 0.59, ch = cw * OFFICIAL.cover.aspect;
  const mw = w * 0.5;
  return (
    <div style={{ position: "relative", width: w, height: h, filter: "drop-shadow(0 30px 40px rgba(6,14,90,0.5))" }}>
      <ProductImage src={OFFICIAL.console.src} aspect={OFFICIAL.console.aspect} width={w} sweep={sweep} />
      {module > 0 && (
        <div style={{ position: "absolute", left: w * 0.4 + (1 - module) * 520, top: h * 0.45, opacity: Math.min(1, module * 2) }}>
          <ProductImage src={OFFICIAL.module.src} aspect={OFFICIAL.module.aspect} width={mw} />
        </div>
      )}
      {cover > 0 && (
        <div style={{ position: "absolute", left: w * 0.36 + (1 - cover) * 560, top: h * 0.98 - ch, opacity: Math.min(1, cover * 2) }}>
          <ProductImage src={OFFICIAL.cover.src} aspect={OFFICIAL.cover.aspect} width={cw} />
        </div>
      )}
    </div>
  );
};

/*
 * 0.0-4.5 s HOOK ("bought a PS5 Digital or PS5 Pro and want to play discs? here's the fix!")
 * visual: the digital console, a game disc flies at it and bounces off (no slot) -> the drive snaps on
 */
export const DHook: React.FC = () => {
  const frame = useSceneFrame("hook");
  const cAt = dev("hook.console"), pAt = dev("hook.pro"), cdAt = dev("hook.cd"), fAt = dev("hook.fix");
  const H = 520, W = H / OFFICIAL.console.aspect, x = CX - W / 2 - 40, y = 270;
  const enter = sp(frame, cAt - 2, { damping: 12, stiffness: 130 });
  // disc flight: comes from the left, hits the console side, bounces away
  const hit = cdAt - 3; // the disc hits just as "CD" is said (it is only ~8 frames before "هاهوا")
  const dx = frame < hit ? interpolate(frame, [cdAt - 16, hit], [-500, x - 40], clamp) : interpolate(frame, [hit, hit + 14], [x - 40, x - 260], { ...clamp, easing: easeOut });
  const dy = frame < hit ? y + H * 0.45 : y + H * 0.45 + interpolate(frame, [hit, hit + 7, hit + 14], [0, -90, 60], clamp);
  const discOpacity = frame < cdAt - 16 ? 0 : interpolate(frame, [fAt, fAt + 4], [1, 0], clamp);
  const sk = shake(frame, hit, 14, 10);
  const snap = sp(frame, fAt, { damping: 12, stiffness: 200 });
  return (
    <SceneShell id="hook" shakeX={sk.x} shakeY={sk.y}>
      <Burst x={CX} y={y + H / 2} r={900} rot={frame * 0.8} opacity={0.22 * ramp(frame, fAt, fAt + 6)} rays={20} />
      <div style={{ position: "absolute", left: x, top: y, transform: `scale(${enter})`, transformOrigin: "50% 100%" }}>
        <Assembled h={H} module={snap} cover={snap} sweep={interpolate(frame, [fAt + 4, fAt + 20], [-0.3, 1.3], clamp)} />
      </div>
      <div style={{ position: "absolute", left: x + W + 40, top: y + 60, display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
        <Chip frame={frame} at={cAt} text="PS5 Digital" icon="controller" />
        <Chip frame={frame} at={pAt} text="PS5 Pro" icon="controller" />
      </div>
      {frame >= cdAt - 16 && (
        <div style={{ position: "absolute", left: dx - 90, top: dy - 90, opacity: discOpacity }}>
          <Disc d={180} spin={frame * 18} />
        </div>
      )}
      {frame >= hit && frame < fAt + 3 && (
        <div style={{ position: "absolute", left: x - 120, top: y + H * 0.2, width: 110, height: 110, borderRadius: "50%", background: "#FF3B5C", border: "6px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pop(frame, hit)})`, boxShadow: "0 12px 26px rgba(80,0,20,0.4)" }}>
          <svg viewBox="0 0 100 100" width={60} height={60}><path d="M22 22 L78 78 M78 22 L22 78" stroke="#fff" strokeWidth={14} strokeLinecap="round" /></svg>
        </div>
      )}
      {frame >= fAt - 1 && (
        <div style={{ position: "absolute", left: x + W + 30, top: y + H * 0.62, transform: `scale(${pop(frame, fAt + 4)})`, display: "flex", alignItems: "center", gap: 10, fontFamily: FONT, fontWeight: 900, fontSize: 46, color: "#fff", background: "#2BD27A", padding: "6px 26px 10px", borderRadius: 999, boxShadow: "0 12px 30px rgba(6,60,30,0.4)" }}>
          <LineIcon name="check" size={46} stroke={10} /> <span dir="rtl">الحل!</span>
        </div>
      )}
      <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: Math.max(interpolate(frame, [0, 1, 6], [0.5, 0.5, 0], clamp), interpolate(frame - fAt, [0, 1, 7], [0, 0.6, 0], clamp)) }} />
    </SceneShell>
  );
};

/** 4.5-7.5 s INTRO: PlayStation Disc Drive, DISPONIBLE (for PS5 Slim Digital & PS5 Pro). */
export const DIntro: React.FC = () => {
  const frame = useSceneFrame("intro");
  const nAt = dev("intro.name"), dAt = dev("intro.dispo");
  const enter = sp(frame, dscene("intro").from, { damping: 12, stiffness: 120, mass: 0.8 });
  const sk = shake(frame, nAt, 14, 9);
  const t = frame / 30;
  return (
    <SceneShell id="intro" shakeX={sk.x} shakeY={sk.y}>
      <Burst x={330} y={800} r={900} rot={frame * 0.6} opacity={0.18 * sp(frame, nAt)} rays={20} />
      <div style={{ position: "absolute", left: 0, right: 70, top: 226, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: FONT, fontWeight: 900, color: "#fff", whiteSpace: "nowrap", textShadow: "0 10px 30px rgba(8,20,110,0.4)" }}>
        <div style={{ ...slam(frame, nAt, 2), fontSize: 46, letterSpacing: 6 }}>PlayStation</div>
        <div style={{ ...slam(frame, nAt + 5, 2.2), fontSize: 104, lineHeight: 1 }}>Disc Drive</div>
      </div>
      <div style={{ position: "absolute", left: 130, top: 430, transform: `translateX(${(1 - enter) * -900}px) translateY(${Math.sin(t * Math.PI) * 10}px) rotate(${lerp(-10, -3, enter)}deg)` }}>
        <Prod img={OFFICIAL.drive} h={760} sweep={interpolate(frame, [nAt + 6, nAt + 22], [-0.3, 1.3], clamp)} />
      </div>
      <div style={{ position: "absolute", left: 560, right: 70, top: 640, display: "flex", flexDirection: "column", gap: 18, alignItems: "center" }}>
        {frame >= dAt - 1 && (
          <div style={{ ...slam(frame, dAt, 1.8), display: "flex", alignItems: "center", gap: 10, fontFamily: FONT, fontWeight: 900, fontSize: 34, color: COLORS.blue, background: "#fff", padding: "8px 22px", borderRadius: 999, letterSpacing: 2, boxShadow: "0 10px 26px rgba(6,14,90,0.3)" }}>
            <LineIcon name="store" size={44} stroke={7} color={COLORS.blue} />
            DISPONIBLE
          </div>
        )}
        {frame >= dAt + 8 && (
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 30, color: "#fff", textAlign: "center", lineHeight: 1.3, opacity: ramp(frame, dAt + 8, dAt + 14) }}>
            Compatible<br />PS5 Slim Digital<br />& PS5 Pro
          </div>
        )}
      </div>
    </SceneShell>
  );
};

/** 7.5-12.75 s snaps onto your console in a second; reads PS5 and even PS4 discs. */
export const DInstall: React.FC = () => {
  const frame = useSceneFrame("install");
  const sAt = dev("in.snap"), secAt = dev("in.sec"), rAt = dev("in.read"), p5 = dev("in.ps5"), p4 = dev("in.ps4");
  const module = sp(frame, sAt, { damping: 14, stiffness: 160 });
  const cover = sp(frame, sAt + 10, { damping: 14, stiffness: 180 });
  const enter = sp(frame, dscene("install").from, { damping: 13, stiffness: 130 });
  const clic = frame >= sAt + 12 ? interpolate(frame, [sAt + 12, sAt + 14, sAt + 24], [0, 1, 0], clamp) : 0;
  return (
    <SceneShell id="install">
      <div style={{ position: "absolute", left: 0, right: 70, top: 232, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 58, color: "#fff", opacity: sp(frame, sAt - 4), textShadow: "0 4px 18px rgba(8,20,110,0.35)" }}>Installation facile</div>
      <div style={{ position: "absolute", left: 150, top: 340, transform: `scale(${enter})`, transformOrigin: "50% 100%" }}>
        <Assembled h={720} module={module} cover={cover} />
      </div>
      {clic > 0 && <div style={{ position: "absolute", left: 120, top: 560, fontFamily: FONT, fontWeight: 900, fontSize: 60, color: "#fff", opacity: clic, transform: `scale(${1 + clic * 0.3}) rotate(-8deg)`, textShadow: "0 6px 20px rgba(8,20,110,0.5)" }}>CLIC !</div>}
      <div style={{ position: "absolute", left: 520, right: 70, top: 380, display: "flex", flexDirection: "column", gap: 26, alignItems: "center" }}>
        <Chip frame={frame} at={secAt} text="En 1 seconde" icon="stopwatch" solid />
        {frame >= p5 - 1 && <div style={{ transform: `scale(${pop(frame, p5)})` }}><Disc d={210} label="PS5" spin={Math.sin(frame * 0.1) * 6} /></div>}
        {frame >= p4 - 1 && <div style={{ transform: `scale(${pop(frame, p4)})`, marginTop: -10 }}><Disc d={170} label="PS4" spin={Math.sin(frame * 0.1 + 1) * 6} /></div>}
      </div>
      {frame >= rAt - 1 && frame < p5 && (
        <div style={{ position: "absolute", left: 520, right: 70, top: 520, display: "flex", justifyContent: "center", transform: `scale(${pop(frame, rAt)})` }}>
          <LineIcon name="spark" size={120} stroke={6} />
        </div>
      )}
      <div style={{ position: "absolute", left: 340, right: 70, top: 1150, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 24, color: "rgba(255,255,255,0.85)", opacity: ramp(frame, secAt, secAt + 8) }}>
        Connexion internet requise lors de l'installation
      </div>
    </SceneShell>
  );
};

/** drawn game case (no real titles) */
const GameCase: React.FC<{ w: number; tint: string; tag?: number }> = ({ w, tint, tag = 0 }) => (
  <div style={{ position: "relative", width: w, height: w * 1.25, borderRadius: 18, background: `linear-gradient(160deg, ${tint}, #1b2a6b)`, border: "6px solid #fff", boxShadow: "0 20px 40px rgba(6,14,90,0.45)", overflow: "hidden" }}>
    <div style={{ height: w * 0.16, background: "#2d5bff", display: "flex", alignItems: "center", paddingLeft: 14 }}><div style={{ width: w * 0.3, height: 8, borderRadius: 4, background: "#fff" }} /></div>
    <svg viewBox="0 0 100 100" width={w * 0.8} height={w * 0.8} style={{ margin: `${w * 0.12}px auto 0`, display: "block" }}>
      <path d="M10 80 L40 30 L58 60 L72 42 L92 80 Z" fill="rgba(255,255,255,0.85)" />
      <circle cx={74} cy={24} r={10} fill="#FFE07A" />
    </svg>
    {tag > 0 && (
      <div style={{ position: "absolute", left: -10, right: -10, top: w * 0.55, transform: `rotate(-14deg) scale(${tag})`, background: "#FFB020", color: "#3a2500", fontFamily: FONT, fontWeight: 900, fontSize: w * 0.13, textAlign: "center", padding: "4px 0" }}>OCCASION</div>
    )}
  </div>
);

/** 12.75-16.75 s buy used games for less, and swap them with your friends. */
export const DUsed: React.FC = () => {
  const frame = useSceneFrame("used");
  const uAt = dev("us.used"), cAt = dev("us.cheap"), sAt = dev("us.swap"), fAt = dev("us.friends");
  const from = dscene("used").from;
  const swap = ramp(frame, sAt, sAt + 14, (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2));
  const A = { x: 150, y: 420 }, B = { x: 560, y: 420 }, w = 300;
  const ax = lerp(A.x, B.x, swap), bx = lerp(B.x, A.x, swap);
  const arc = Math.sin(swap * Math.PI) * 140;
  const e1 = sp(frame, from + 1, { damping: 12, stiffness: 140 }), e2 = sp(frame, from + 5, { damping: 12, stiffness: 140 });
  const tag = pop(frame, uAt);
  return (
    <SceneShell id="used">
      <div style={{ position: "absolute", left: 0, right: 70, top: 232, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 58, color: "#fff", textShadow: "0 4px 18px rgba(8,20,110,0.35)", opacity: sp(frame, from + 2) }}>Jeux d'occasion</div>
      <div style={{ position: "absolute", left: ax, top: A.y - arc, transform: `scale(${e1}) rotate(${-6 + swap * 12}deg)` }}><GameCase w={w} tint="#ff5a7a" tag={frame >= uAt ? tag : 0} /></div>
      <div style={{ position: "absolute", left: bx, top: B.y + arc * 0.5, transform: `scale(${e2}) rotate(${6 - swap * 12}deg)` }}><GameCase w={w} tint="#2BD27A" tag={frame >= uAt ? tag : 0} /></div>
      {frame >= sAt - 1 && (
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
          <path d="M 330 380 Q 505 260 690 380" stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" strokeDasharray="4 16" opacity={ramp(frame, sAt, sAt + 6)} />
          <path d="M 690 840 Q 505 960 330 840" stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" strokeDasharray="4 16" opacity={ramp(frame, sAt, sAt + 6)} />
        </svg>
      )}
      <div style={{ position: "absolute", left: 340, right: 70, top: 1000, display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
        <Chip frame={frame} at={cAt} text="Moins cher" icon="bolt" solid />
        <Chip frame={frame} at={fAt} text="Échange avec tes amis" icon="chat" />
      </div>
    </SceneShell>
  );
};

/** 16.75-20.75 s also plays 4K Blu-ray movies in the best quality. */
export const DBluray: React.FC = () => {
  const frame = useSceneFrame("bluray");
  const bAt = dev("br.bd"), kAt = dev("br.k"), mAt = dev("br.movies");
  const from = dscene("bluray").from;
  const enter = sp(frame, from + 1, { damping: 13, stiffness: 130 });
  const H = 680, W = H / OFFICIAL.drive.aspect, x = 230, y = 380;
  // disc slides out of the slot (slot is at ~0.27 of the width, vertical)
  const out = ramp(frame, bAt, bAt + 14);
  const k = slam(frame, kAt, 2.6);
  return (
    <SceneShell id="bluray">
      <Burst x={720} y={620} r={800} rot={frame * 0.7} opacity={0.2 * ramp(frame, kAt, kAt + 6)} rays={20} />
      {frame >= bAt - 1 && (
        <div style={{ position: "absolute", left: x + W * 0.1 - 220 * out, top: y + H * 0.38, opacity: Math.min(1, out * 3) }}>
          <Disc d={230} spin={frame * 6} label="4K" />
        </div>
      )}
      <div style={{ position: "absolute", left: x, top: y, transform: `translateX(${(1 - enter) * -700}px) rotate(-3deg)` }}>
        <Prod img={OFFICIAL.drive} h={H} sweep={interpolate(frame, [kAt, kAt + 16], [-0.3, 1.3], clamp)} />
      </div>
      {frame >= kAt - 1 && (
        <div style={{ position: "absolute", left: 580, right: 60, top: 400, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: FONT, color: "#fff", ...k }}>
          <div style={{ fontWeight: 900, fontSize: 180, lineHeight: 0.95, textShadow: "0 10px 30px rgba(8,20,110,0.45)" }}>4K</div>
          <div style={{ fontWeight: 900, fontSize: 26, letterSpacing: 1, background: "#fff", color: COLORS.blue, padding: "4px 14px 8px", whiteSpace: "nowrap", borderRadius: 12, marginTop: 6 }}>ULTRA HD BLU-RAY</div>
        </div>
      )}
      <div style={{ position: "absolute", left: 580, right: 60, top: 760, display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
        <Chip frame={frame} at={mAt} text="Films" icon="play" />
        <Chip frame={frame} at={mAt + 12} text="Qualité max" icon="bright" solid />
      </div>
    </SceneShell>
  );
};
