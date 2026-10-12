import React from "react";
import { interpolate } from "remotion";
import { COLORS, FONT } from "../../brand";
import { lerp, pop, ramp, shake, slam, sp } from "../../anim";
import { useLayout } from "../../layout";
import { IconName, LineIcon } from "../../components/Icons";
import { ProductImage } from "../../components/ProductImage";
import { Burst, SceneShell, useSceneFrame } from "../../components/SceneShell";
import { gev, gscene, LENS, OFFICIAL } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const HERO = OFFICIAL.hero;

const Heading: React.FC<{ frame: number; at: number; title: string; P: boolean }> = ({ frame, at, title, P }) => {
  const h = sp(frame, at);
  return (
    <div style={{ position: "absolute", left: 0, right: P ? 70 : 0, top: P ? 232 : 40, textAlign: P ? "center" : "left", paddingLeft: P ? 0 : 40, fontFamily: FONT, fontWeight: 900, fontSize: P ? 60 : 44, color: "#fff", opacity: h, transform: `translateY(${(1 - h) * -40}px)`, textShadow: "0 4px 18px rgba(8,20,110,0.35)", whiteSpace: "nowrap" }}>
      {title}
    </div>
  );
};

const Chip: React.FC<{ frame: number; at: number; text: string; icon?: IconName; size: number; solid?: boolean }> = ({ frame, at, text, icon, size, solid }) => {
  if (frame < at - 1) return null;
  const p = sp(frame, at, { damping: 11, stiffness: 220, mass: 0.6 });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.35, padding: `${size * 0.22}px ${size * 0.7}px`, borderRadius: 999, background: solid ? "#fff" : "rgba(255,255,255,0.18)", border: solid ? "none" : "3px solid rgba(255,255,255,0.75)", color: solid ? COLORS.blue : "#fff", fontFamily: FONT, fontWeight: 900, fontSize: size, whiteSpace: "nowrap", transform: `scale(${p})`, boxShadow: "0 12px 30px rgba(6,14,90,0.3)" }}>
      {icon ? <LineIcon name={icon} size={size * 1.2} stroke={7} color={solid ? COLORS.blue : "#fff"} progress={ramp(frame, at, at + 10)} /> : null}
      {text}
    </div>
  );
};

/** the official HERO13 Black render with a light sweep */
const Cam: React.FC<{ w: number; sweep?: number; flash?: number }> = ({ w, sweep = -1, flash = 0 }) => (
  <div style={{ position: "relative", width: w, height: w * HERO.aspect, filter: "drop-shadow(0 30px 40px rgba(6,14,90,0.5))" }}>
    <ProductImage src={HERO.src} aspect={HERO.aspect} width={w} sweep={sweep} />
    {flash > 0 && <div style={{ position: "absolute", left: LENS.x * w - w * 0.5, top: LENS.y * w * HERO.aspect - w * 0.5, width: w, height: w, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.95), rgba(255,255,255,0) 60%)", opacity: flash }} />}
  </div>
);

/*
 * 0.0-5.0 s HOOK ("want to film underwater, on the motorbike or in the mountains? The phone can't... GoPro can!")
 * visual: three adventure tiles, a phone that gets crossed out, then the HERO13 slams in
 */
export const GHook: React.FC = () => {
  const frame = useSceneFrame("hook");
  const L = useLayout();
  const P = L.portrait;
  const G = P ? { tiles: 250, tile: 190, gap: 40, mid: { y: 510, phone: 280, cam: 540 }, size: 34 } : { tiles: 50, tile: 150, gap: 30, mid: { y: 300, phone: 220, cam: 400 }, size: 28 };
  const TILES: { at: number; icon: IconName; label: string }[] = [
    { at: gev("hook.water"), icon: "dive", label: "تحت الما" },
    { at: gev("hook.moto"), icon: "moto", label: "فوق الموطور" },
    { at: gev("hook.mount"), icon: "mountain", label: "فالجبل" },
  ];
  const phAt = gev("hook.phone"), noAt = gev("hook.no"), gpAt = gev("hook.gopro");
  const sk = shake(frame, gpAt, 18, 12);
  const phone = pop(frame, phAt);
  const phoneOut = interpolate(frame, [gpAt - 2, gpAt + 6], [0, 1], clamp);
  const x = ramp(frame, noAt, noAt + 6);
  const cam = slam(frame, gpAt, 2.6);
  const totalW = G.tile * 3 + G.gap * 2;
  return (
    <SceneShell id="hook" shakeX={sk.x} shakeY={sk.y}>
      <Burst x={L.w / 2 - (P ? 35 : 0)} y={G.mid.y + 100} r={P ? 900 : 640} rot={frame * 0.8} opacity={0.22 * ramp(frame, gpAt, gpAt + 6)} rays={20} />
      <div style={{ position: "absolute", left: (L.w - (P ? 70 : 0) - totalW) / 2, top: G.tiles, display: "flex", gap: G.gap, opacity: 1 - ramp(frame, gpAt - 2, gpAt + 3), transform: `translateY(${-200 * ramp(frame, gpAt - 2, gpAt + 6)}px)` }}>
        {TILES.map((t, i) => {
          const p = frame >= t.at - 1 ? pop(frame, t.at) : 0;
          return (
            <div key={i} style={{ width: G.tile, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, transform: `scale(${p})` }}>
              <div style={{ width: G.tile, height: G.tile, borderRadius: G.tile * 0.28, background: "rgba(255,255,255,0.2)", border: "4px solid rgba(255,255,255,0.85)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 14px 30px rgba(6,14,90,0.3)" }}>
                <LineIcon name={t.icon} size={G.tile * 0.62} stroke={6} progress={ramp(frame, t.at, t.at + 12)} />
              </div>
              <div dir="rtl" style={{ fontFamily: FONT, fontWeight: 900, fontSize: G.size, color: "#fff", whiteSpace: "nowrap", textShadow: "0 4px 14px rgba(8,20,110,0.4)" }}>{t.label}</div>
            </div>
          );
        })}
      </div>
      {frame >= phAt - 1 && phoneOut < 1 && (
        <div style={{ position: "absolute", left: L.w / 2 - (P ? 35 : 0) - G.mid.phone / 2, top: G.mid.y, transform: `scale(${phone}) translateY(${phoneOut * 900}px) rotate(${phoneOut * 40 + (frame >= noAt ? Math.sin(frame * 1.4) * 6 * (1 - phoneOut) : 0)}deg)` }}>
          <LineIcon name="phone" size={G.mid.phone} stroke={6} />
          <svg viewBox="0 0 100 100" style={{ position: "absolute", left: 0, top: 0, width: G.mid.phone, height: G.mid.phone, overflow: "visible" }}>
            {x > 0 && <path d={`M 18 18 L ${18 + 64 * x} ${18 + 64 * x}`} stroke="#FF3B5C" strokeWidth={10} strokeLinecap="round" />}
            {x > 0.5 && <path d={`M 82 18 L ${82 - 64 * (x - 0.5) * 2} ${18 + 64 * (x - 0.5) * 2}`} stroke="#FF3B5C" strokeWidth={10} strokeLinecap="round" />}
          </svg>
        </div>
      )}
      {frame >= gpAt - 1 && (
        <div style={{ position: "absolute", left: L.w / 2 - (P ? 35 : 0) - G.mid.cam / 2, top: G.mid.y - (P ? 190 : 120), ...cam }}>
          <Cam w={G.mid.cam} sweep={interpolate(frame, [gpAt + 4, gpAt + 20], [-0.3, 1.3], clamp)} />
        </div>
      )}
      <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: Math.max(interpolate(frame, [0, 1, 6], [0.5, 0.5, 0], clamp), interpolate(frame - gpAt, [0, 1, 7], [0, 0.6, 0], clamp)) }} />
    </SceneShell>
  );
};

/** 5.0-8.0 s INTRO: GoPro HERO13 Black, DISPONIBLE. */
export const GIntro: React.FC = () => {
  const frame = useSceneFrame("intro");
  const L = useLayout();
  const P = L.portrait;
  const G = P ? { cam: { x: 160, y: 440, w: 740 }, name: 226, nsize: 92, pill: { y: 1190, size: 38 } } : { cam: { x: 40, y: 230, w: 560 }, name: 40, nsize: 64, pill: { y: 600, size: 30 } };
  const nAt = gev("intro.name"), dAt = gev("intro.dispo");
  const enter = sp(frame, gscene("intro").from, { damping: 12, stiffness: 120, mass: 0.8 });
  const sk = shake(frame, nAt, 14, 9);
  const t = frame / 30;
  return (
    <SceneShell id="intro" shakeX={sk.x} shakeY={sk.y}>
      <Burst x={G.cam.x + G.cam.w / 2} y={G.cam.y + G.cam.w * HERO.aspect * 0.5} r={P ? 900 : 640} rot={frame * 0.6} opacity={0.18 * sp(frame, nAt)} rays={20} />
      <div style={{ position: "absolute", left: P ? 0 : 640, right: P ? 70 : 30, top: G.name, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, fontFamily: FONT, fontWeight: 900, color: "#fff", whiteSpace: "nowrap", textShadow: "0 10px 30px rgba(8,20,110,0.4)" }}>
        <div style={{ ...slam(frame, nAt, 2), fontSize: G.nsize * 0.55, letterSpacing: 6 }}>GoPro</div>
        <div style={{ ...slam(frame, nAt + 5, 2.2), fontSize: G.nsize, lineHeight: 1 }}>HERO13</div>
        <div style={{ ...slam(frame, nAt + 9, 2), fontSize: G.nsize * 0.5, letterSpacing: 14, background: "#fff", color: "#111", padding: "0 18px 6px 32px", borderRadius: 10, textShadow: "none", marginTop: 8 }}>BLACK</div>
      </div>
      <div style={{ position: "absolute", left: G.cam.x, top: G.cam.y + (P ? 20 : 0), transform: `translateX(${(1 - enter) * -1000}px) translateY(${Math.sin(t * Math.PI) * 10}px) rotate(${lerp(-14, 0, enter) + Math.sin(t * 2) * 1.5}deg)` }}>
        <Cam w={G.cam.w} sweep={interpolate(frame, [nAt + 6, nAt + 22], [-0.3, 1.3], clamp)} />
      </div>
      {frame >= dAt - 1 && (
        <div style={{ position: "absolute", left: P ? 340 : 640, right: P ? 70 : 30, top: G.pill.y, display: "flex", justifyContent: "center" }}>
          <div style={{ ...slam(frame, dAt, 1.8), display: "flex", alignItems: "center", gap: 12, fontFamily: FONT, fontWeight: 900, fontSize: G.pill.size, color: COLORS.blue, background: "#fff", padding: "8px 26px", borderRadius: 999, letterSpacing: 3, boxShadow: "0 10px 26px rgba(6,14,90,0.3)" }}>
            <LineIcon name="store" size={G.pill.size * 1.3} stroke={7} color={COLORS.blue} />
            DISPONIBLE
          </div>
        </div>
      )}
    </SceneShell>
  );
};

/** 8.0-11.75 s video in 5.3K, photos at 27 MP. */
export const GRes: React.FC = () => {
  const frame = useSceneFrame("res");
  const L = useLayout();
  const P = L.portrait;
  const vAt = gev("res.video"), kAt = gev("res.k"), pAt = gev("res.photo"), mAt = gev("res.mp");
  const G = P ? { cam: { x: 270, y: 300, w: 480 }, cards: { x: 90, y: 800, w: 380, h: 330, gap: 50 } } : { cam: { x: 60, y: 200, w: 440 }, cards: { x: 560, y: 120, w: 400, h: 250, gap: 40 } };
  const k = (5.3 * easeOut(ramp(frame, kAt, kAt + 14))).toFixed(1);
  const mp = Math.round(27 * easeOut(ramp(frame, mAt, mAt + 14)));
  const t = frame / 30;
  const card = (at: number, big: React.ReactNode, label: string, icon: IconName, solid: boolean, i: number) => {
    if (frame < at - 1) return null;
    const p = sp(frame, at, { damping: 11, stiffness: 200 });
    const left = P ? G.cards.x + i * (G.cards.w + G.cards.gap) : G.cards.x;
    const top = P ? G.cards.y : G.cards.y + i * (G.cards.h + G.cards.gap);
    return (
      <div style={{ position: "absolute", left, top, width: G.cards.w, height: G.cards.h, borderRadius: 40, background: solid ? "#fff" : "rgba(255,255,255,0.18)", border: solid ? "none" : "4px solid rgba(255,255,255,0.8)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, color: solid ? COLORS.blue : "#fff", fontFamily: FONT, transform: `scale(${p}) rotate(${(i ? 3 : -3) * (1 - p)}deg)`, boxShadow: "0 20px 46px rgba(6,14,90,0.35)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontWeight: 900, fontSize: G.cards.h * 0.12, letterSpacing: 3 }}>
          <LineIcon name={icon} size={G.cards.h * 0.16} stroke={7} color={solid ? COLORS.blue : "#fff"} />
          {label}
        </div>
        {big}
      </div>
    );
  };
  return (
    <SceneShell id="res">
      <div style={{ position: "absolute", left: G.cam.x, top: G.cam.y, transform: `translateY(${Math.sin(t * Math.PI) * 8}px) scale(${lerp(0.8, 1, sp(frame, gscene("res").from))})` }}>
        <Cam w={G.cam.w} sweep={interpolate(frame, [kAt, kAt + 16], [-0.3, 1.3], clamp)} flash={interpolate(frame, [pAt, pAt + 1, pAt + 10], [0, 1, 0], clamp)} />
      </div>
      {frame >= vAt - 1 && frame < pAt + 4 && (
        <div style={{ position: "absolute", left: G.cam.x + G.cam.w * 0.05, top: G.cam.y - 10, display: "flex", alignItems: "center", gap: 10, fontFamily: FONT, fontWeight: 900, fontSize: P ? 30 : 24, color: "#fff", background: "#FF3B5C", padding: "4px 16px", borderRadius: 999, transform: `scale(${pop(frame, vAt)})`, opacity: Math.floor(frame / 8) % 2 ? 1 : 0.75 }}>
          ● REC
        </div>
      )}
      {card(kAt, <div style={{ fontWeight: 900, fontSize: G.cards.h * 0.42, lineHeight: 1 }}>{k}<span style={{ fontSize: "0.55em" }}>K</span></div>, "VIDÉO", "camera", true, 0)}
      {card(mAt, <div style={{ fontWeight: 900, fontSize: G.cards.h * 0.42, lineHeight: 1 }}>{mp}<span style={{ fontSize: "0.45em" }}> MP</span></div>, "PHOTO", "lens", false, 1)}
    </SceneShell>
  );
};

/** drawn landscape inside a viewfinder: stays level (HyperSmooth) while the camera shakes */
const Viewfinder: React.FC<{ w: number; frame: number; jitter: number; steady: number }> = ({ w, frame, jitter, steady }) => {
  const h = w * 0.5625;
  const j = jitter * (1 - steady);
  const dx = Math.sin(frame * 1.7) * 26 * j, dy = Math.cos(frame * 2.3) * 20 * j, rot = Math.sin(frame * 1.1) * 7 * j;
  return (
    <div style={{ width: w, height: h, borderRadius: 30, overflow: "hidden", border: "6px solid #fff", background: "linear-gradient(180deg, #7fd3ff, #c9f0ff)", position: "relative", boxShadow: "0 24px 50px rgba(6,14,90,0.45)" }}>
      <svg viewBox="0 0 320 180" width={w} height={h} style={{ position: "absolute", left: 0, top: 0, transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(1.12)` }}>
        <circle cx={250} cy={45} r={18} fill="#FFE07A" />
        <path d="M0 130 L70 60 L110 100 L160 40 L230 120 L270 90 L320 130 V180 H0 Z" fill="#2f6fd6" />
        <path d="M150 52 L160 40 L170 52 L163 50 L157 55 Z" fill="#fff" />
        <path d="M0 150 Q 80 136 160 150 T 320 148 V180 H0 Z" fill="#1e4fb0" />
        <path d="M150 180 L170 150 L190 180" fill="none" stroke="#fff" strokeWidth={3} opacity={0.6} />
      </svg>
      <div style={{ position: "absolute", left: 16, top: 12, fontFamily: FONT, fontWeight: 900, fontSize: w * 0.045, color: "#fff", background: "#FF3B5C", padding: "2px 12px", borderRadius: 999 }}>● 00:13</div>
      <svg viewBox="0 0 320 180" width={w} height={h} style={{ position: "absolute", left: 0, top: 0 }}>
        <path d="M150 90 H170 M160 80 V100" stroke="#fff" strokeWidth={2.5} opacity={0.9} />
        <path d="M8 30 V8 H30 M290 8 H312 V30 M312 150 V172 H290 M30 172 H8 V150" stroke="#fff" strokeWidth={3} fill="none" />
      </svg>
    </div>
  );
};

/** 11.75-15.5 s HyperSmooth: the footage stays steady while you run, jump or fall. */
export const GSmooth: React.FC = () => {
  const frame = useSceneFrame("smooth");
  const L = useLayout();
  const P = L.portrait;
  const tAt = gev("sm.title"), sAt = gev("sm.steady"), rAt = gev("sm.run"), jAt = gev("sm.jump"), fAt = gev("sm.fall");
  const G = P ? { cam: { x: 330, y: 320, w: 400 }, vf: { x: 140, y: 730, w: 760 }, chips: 1205 } : { cam: { x: 60, y: 170, w: 360 }, vf: { x: 470, y: 160, w: 560 }, chips: 520 };
  // camera bumps around: harder on run / jump / fall
  const amp = frame < rAt ? 10 : frame < jAt ? 22 : frame < fAt ? 36 : 44;
  const bx = Math.sin(frame * 1.3) * amp, by = -Math.abs(Math.sin(frame * 0.9)) * amp * 1.4 + (frame >= fAt ? interpolate(frame, [fAt, fAt + 5, fAt + 12], [0, 80, 30], clamp) : 0);
  const br = Math.sin(frame * 0.8) * amp * 0.4 + (frame >= fAt ? interpolate(frame, [fAt, fAt + 6], [0, 30], clamp) : 0);
  const steady = ramp(frame, sAt - 2, sAt + 6);
  const enter = sp(frame, tAt, { damping: 13, stiffness: 120 });
  return (
    <SceneShell id="smooth">
      <Heading frame={frame} at={tAt} title="HyperSmooth" P={P} />
      <div style={{ position: "absolute", left: G.cam.x, top: G.cam.y, transform: `translate(${bx}px, ${by}px) rotate(${br}deg) scale(${enter})` }}>
        <Cam w={G.cam.w} />
      </div>
      <div style={{ position: "absolute", left: G.vf.x, top: G.vf.y, transform: `translateY(${(1 - enter) * 700}px)` }}>
        <Viewfinder w={G.vf.w} frame={frame} jitter={1} steady={steady} />
        {frame >= sAt - 1 && (
          <div style={{ position: "absolute", right: -10, top: -34, ...slam(frame, sAt, 2.2) }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, transform: "rotate(-6deg)", fontFamily: FONT, fontWeight: 900, fontSize: P ? 40 : 32, color: COLORS.blue, background: "#fff", padding: "4px 22px 8px", borderRadius: 16, boxShadow: "0 12px 30px rgba(6,14,90,0.4)" }}>
              <LineIcon name="check" size={P ? 44 : 34} stroke={10} color="#2BD27A" />
              STABLE
            </div>
          </div>
        )}
      </div>
      <div style={{ position: "absolute", left: P ? 340 : 470, right: P ? 70 : 40, top: G.chips, display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
        <Chip frame={frame} at={rAt} text="Course" icon="run" size={P ? 38 : 30} />
        <Chip frame={frame} at={jAt} text="Sauts" icon="spark" size={P ? 38 : 30} />
        <Chip frame={frame} at={fAt} text="Chutes" icon="bolt" size={P ? 38 : 30} solid />
      </div>
    </SceneShell>
  );
};

/** 15.5-20.0 s waterproof to 10 m without a housing, + GPS that records speed and route. */
export const GWater: React.FC = () => {
  const frame = useSceneFrame("water");
  const L = useLayout();
  const P = L.portrait;
  const dAt = gev("wt.dive"), mAt = gev("wt.m"), nAt = gev("wt.nobox"), gAt = gev("wt.gps"), sAt = gev("wt.speed"), rAt = gev("wt.route");
  const from = gscene("water").from;
  const G = P ? { surf: 640, cam: { x: 250, y: 470, w: 560 }, depth: 260, chips: 1150, map: { x: 120, y: 300, w: 800, h: 560 } } : { surf: 380, cam: { x: 100, y: 230, w: 440 }, depth: 60, chips: 500, map: { x: 560, y: 120, w: 470, h: 330 } };
  const surf = interpolate(frame, [from, dAt + 10], [L.h + 40, G.surf], { ...clamp, easing: easeOut });
  const meters = Math.round(10 * easeOut(ramp(frame, mAt, mAt + 14)));
  const gps = ramp(frame, gAt - 2, gAt + 8);
  const sink = interpolate(frame, [dAt, dAt + 14], [-140, 120], { ...clamp, easing: easeOut });
  const t = frame / 30;
  const wave = Array.from({ length: 13 }, (_, i) => `${i === 0 ? "M" : "L"} ${i * (L.w / 12)} ${Math.sin(i * 0.9 + t * 3) * 12}`).join(" ");
  const bubbles = Array.from({ length: 12 }).map((_, k) => {
    const life = ((frame * 2 + k * 37) % 260) / 260;
    const bx = G.cam.x + 60 + ((k * 83) % (G.cam.w - 60));
    const by = G.cam.y + sink + G.cam.w * HERO.aspect - life * 420;
    if (by < surf + 20) return null;
    return <div key={k} style={{ position: "absolute", left: bx + Math.sin(life * 12 + k) * 10, top: by, width: 10 + (k % 3) * 6, height: 10 + (k % 3) * 6, borderRadius: "50%", border: "3px solid rgba(255,255,255,0.8)", opacity: ramp(frame, dAt, dAt + 8) * (1 - gps) }} />;
  });
  // GPS route (unit coordinates inside the map card)
  const route = [[0.08, 0.82], [0.22, 0.62], [0.36, 0.7], [0.5, 0.45], [0.64, 0.52], [0.78, 0.28], [0.9, 0.18]];
  const pr = ramp(frame, gAt + 4, rAt + 10, (x) => x);
  const n = Math.max(2, Math.round(route.length * pr));
  const pts = route.slice(0, n).map(([u, v], i) => `${i ? "L" : "M"} ${u * G.map.w} ${v * G.map.h}`).join(" ");
  const end = route[n - 1];
  return (
    <SceneShell id="water">
      <div style={{ position: "absolute", left: G.cam.x, top: G.cam.y + sink - gps * (P ? 120 : 60), opacity: 1 - gps, transform: `rotate(${Math.sin(t * 2) * 3}deg) scale(${lerp(1, 0.7, gps)})`, transformOrigin: "50% 0%" }}>
        <Cam w={G.cam.w} sweep={interpolate(frame, [mAt, mAt + 16], [-0.3, 1.3], clamp)} />
      </div>
      <div style={{ position: "absolute", left: 0, top: surf, width: L.w, height: L.h, background: "linear-gradient(180deg, rgba(40,200,255,0.55), rgba(10,60,190,0.75))" }}>
        <svg width={L.w} height={40} style={{ position: "absolute", left: 0, top: -12, overflow: "visible" }}>
          <path d={wave} stroke="#fff" strokeWidth={6} fill="none" opacity={0.85} />
        </svg>
      </div>
      {bubbles}
      {frame >= mAt - 1 && gps < 1 && (
        <div style={{ position: "absolute", left: 0, right: P ? 70 : 0, top: G.depth, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: FONT, color: "#fff", ...slam(frame, mAt, 2), opacity: (1 - gps) * slam(frame, mAt, 2).opacity }}>
          <div style={{ fontWeight: 900, fontSize: P ? 160 : 110, lineHeight: 1, textShadow: "0 10px 30px rgba(8,20,110,0.45)" }}>{meters}<span style={{ fontSize: "0.42em" }}> m</span></div>
          <div style={{ fontWeight: 800, fontSize: P ? 36 : 28 }}>étanche</div>
        </div>
      )}
      {gps > 0 && (
        <div style={{ position: "absolute", left: G.map.x, top: G.map.y, width: G.map.w, height: G.map.h, borderRadius: 36, background: "rgba(8,30,110,0.8)", border: "5px solid rgba(255,255,255,0.9)", overflow: "hidden", opacity: gps, transform: `scale(${lerp(0.8, 1, gps)})`, boxShadow: "0 24px 50px rgba(6,14,90,0.45)" }}>
          <svg width={G.map.w} height={G.map.h} style={{ position: "absolute", left: 0, top: 0 }}>
            {Array.from({ length: 8 }).map((_, i) => <path key={i} d={`M ${(i + 1) * G.map.w / 8} 0 V ${G.map.h} M 0 ${(i + 1) * G.map.h / 8} H ${G.map.w}`} stroke="rgba(255,255,255,0.12)" strokeWidth={2} />)}
            <path d={pts} stroke="#6CF3FF" strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={route[0][0] * G.map.w} cy={route[0][1] * G.map.h} r={14} fill="#fff" />
          </svg>
          <div style={{ position: "absolute", left: end[0] * G.map.w - 36, top: end[1] * G.map.h - 70 }}>
            <LineIcon name="pin" size={72} stroke={7} />
          </div>
          <div style={{ position: "absolute", left: 22, top: 18, display: "flex", alignItems: "center", gap: 10, fontFamily: FONT, fontWeight: 900, fontSize: P ? 40 : 30, color: "#fff" }}>
            <LineIcon name="satellite" size={P ? 52 : 40} stroke={7} /> GPS
          </div>
        </div>
      )}
      <div style={{ position: "absolute", left: P ? 340 : 560, right: P ? 70 : 40, top: G.chips, display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
        {gps < 1 ? <Chip frame={frame} at={nAt} text="Sans caisson" icon="dive" size={P ? 38 : 30} solid /> : null}
        <Chip frame={frame} at={sAt} text="Vitesse" icon="stopwatch" size={P ? 38 : 30} />
        <Chip frame={frame} at={rAt} text="Trajet" icon="pin" size={P ? 38 : 30} solid />
      </div>
    </SceneShell>
  );
};

/** 20.0-22.75 s magnetic mount: on and off in a second. */
export const GMount: React.FC = () => {
  const frame = useSceneFrame("mount");
  const L = useLayout();
  const P = L.portrait;
  const tAt = gev("mt.title"), onAt = gev("mt.on"), offAt = gev("mt.off"), secAt = gev("mt.sec");
  const G = P ? { cam: { x: 290, w: 480, rest: 540 }, base: { x: 330, y: 540 + 480 * HERO.aspect - 10, w: 400 }, chips: 1190 } : { cam: { x: 110, w: 380, rest: 200 }, base: { x: 140, y: 200 + 380 * HERO.aspect - 10, w: 320 }, chips: 520 };
  // drop on (snap), lift off, snap on again
  const lift = (f: number) => interpolate(f, [gscene("mount").from, onAt], [-170, -170], clamp);
  let y = lift(frame);
  if (frame >= onAt) y = interpolate(frame, [onAt, onAt + 4], [-170, 0], { ...clamp, easing: (x) => x * x });
  if (frame >= offAt) y = interpolate(frame, [offAt, offAt + 6], [0, -150], { ...clamp, easing: easeOut });
  if (frame >= secAt - 4) y = interpolate(frame, [secAt - 4, secAt], [-150, 0], { ...clamp, easing: (x) => x * x });
  const snap = (at: number) => (frame >= at ? interpolate(frame, [at, at + 2, at + 12], [0, 1, 0], clamp) : 0);
  const clic = Math.max(snap(onAt + 4), snap(secAt));
  const enter = sp(frame, gscene("mount").from, { damping: 14, stiffness: 140 });
  return (
    <SceneShell id="mount">
      <Heading frame={frame} at={tAt} title="Support magnétique" P={P} />
      <div style={{ position: "absolute", left: G.base.x, top: G.base.y, width: G.base.w, height: G.base.w * 0.32, borderRadius: 24, background: "linear-gradient(180deg,#3b3f4a,#1b1d26)", border: "4px solid rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${enter})`, boxShadow: `0 0 ${40 * clic}px ${COLORS.cyan}, 0 20px 40px rgba(6,14,90,0.45)` }}>
        <LineIcon name="magnet" size={G.base.w * 0.24} stroke={7} progress={ramp(frame, tAt, tAt + 12)} />
      </div>
      <div style={{ position: "absolute", left: G.cam.x, top: G.cam.rest + y, transform: `scale(${enter})` }}>
        <Cam w={G.cam.w} />
      </div>
      {clic > 0 && (
        <div style={{ position: "absolute", left: 0, right: P ? 70 : undefined, width: P ? undefined : 600, top: G.base.y + G.base.w * 0.4, display: "flex", justifyContent: "center", fontFamily: FONT, fontWeight: 900, fontSize: P ? 60 : 44, color: "#fff", opacity: clic, transform: `scale(${1 + clic * 0.3})`, textShadow: "0 6px 20px rgba(8,20,110,0.5)" }}>
          CLIC !
        </div>
      )}
      <div style={{ position: "absolute", left: P ? 340 : 560, right: P ? 70 : 40, top: G.chips, display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
        <Chip frame={frame} at={onAt} text="Tu l'accroches" icon="magnet" size={P ? 36 : 30} />
        <Chip frame={frame} at={offAt} text="Tu l'enlèves" icon="power" size={P ? 36 : 30} />
        <Chip frame={frame} at={secAt} text="En 1 seconde" icon="stopwatch" size={P ? 36 : 30} solid />
      </div>
    </SceneShell>
  );
};
