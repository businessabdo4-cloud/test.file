import React from "react";
import { interpolate } from "remotion";
import { COLORS, FONT } from "../../brand";
import { lerp, pop, ramp, shake, slam, sp } from "../../anim";
import { useLayout } from "../../layout";
import { IconName, LineIcon } from "../../components/Icons";
import { ProductImage } from "../../components/ProductImage";
import { Burst, SceneShell, useSceneFrame } from "../../components/SceneShell";
import { LENOVO_SCREEN, OFFICIAL, tev, tscene } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
type Img = { src: string; aspect: number };
type Key = "a9" | "a11" | "lenovo" | "xiaomi";

const Chip: React.FC<{ frame: number; at: number; text: string; icon?: IconName; size: number; solid?: boolean; swatch?: string; gold?: boolean }> = ({ frame, at, text, icon, size, solid, swatch, gold }) => {
  if (frame < at - 1) return null;
  const p = sp(frame, at, { damping: 11, stiffness: 220, mass: 0.6 });
  const fg = gold ? "#3a2500" : solid ? COLORS.blue : "#fff";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.35, padding: `${size * 0.22}px ${size * 0.62}px`, borderRadius: 999, background: gold ? "linear-gradient(90deg,#FFD25A,#FFB020)" : solid ? "#fff" : "rgba(255,255,255,0.18)", border: solid || gold ? "none" : "3px solid rgba(255,255,255,0.75)", color: fg, fontFamily: FONT, fontWeight: 900, fontSize: size, whiteSpace: "nowrap", transform: `scale(${p})`, boxShadow: "0 12px 30px rgba(6,14,90,0.3)" }}>
      {swatch ? <div style={{ width: size * 0.9, height: size * 0.9, borderRadius: "50%", background: swatch, border: "4px solid #fff", boxShadow: "0 0 0 2px rgba(6,14,90,0.25)" }} /> : null}
      {icon ? <LineIcon name={icon} size={size * 1.2} stroke={7} color={fg} progress={ramp(frame, at, at + 10)} /> : null}
      {text}
    </div>
  );
};

/** product image that fits a box, slides in, bobs and gets a light sweep on each beat in `sweeps` */
const Hero: React.FC<{ img: Img; frame: number; at: number; box: { x: number; y: number; w: number; h: number }; sweeps: number[]; from?: -1 | 1; children?: React.ReactNode }> = ({ img, frame, at, box, sweeps, from = -1, children }) => {
  const w = Math.min(box.w, box.h / img.aspect);
  const h = w * img.aspect;
  const enter = sp(frame, at, { damping: 12, stiffness: 120, mass: 0.8 });
  const s = sweeps.filter((v) => frame >= v).pop() ?? -100;
  const t = frame / 30;
  return (
    <div style={{ position: "absolute", left: box.x + (box.w - w) / 2, top: box.y + (box.h - h) / 2, width: w, height: h, transform: `translateX(${(1 - enter) * 1000 * from}px) translateY(${Math.sin(t * Math.PI * 0.9) * 8}px) rotate(${lerp(12 * from, 0, enter) + Math.sin(t * Math.PI * 0.5) * 1.2}deg)`, filter: "drop-shadow(0 34px 44px rgba(6,14,90,0.5))" }}>
      <ProductImage src={img.src} aspect={img.aspect} width={w} sweep={interpolate(frame, [s, s + 16], [-0.3, 1.3], clamp)} />
      {children}
    </div>
  );
};

const SPECS: Record<Key, { idx: number; brand: string; model: string; ram: string; sto: string; color?: [string, string] }> = {
  a9: { idx: 1, brand: "SAMSUNG", model: "Galaxy Tab A9+ 5G", ram: "4GB RAM", sto: "64GB" },
  a11: { idx: 2, brand: "SAMSUNG", model: "Galaxy Tab A11", ram: "4GB RAM", sto: "64GB", color: ["Gray", "#6d7077"] },
  lenovo: { idx: 3, brand: "LENOVO", model: "Idea Tab Plus", ram: "6GB RAM", sto: "128GB" },
  xiaomi: { idx: 4, brand: "XIAOMI", model: "Pad 8", ram: "8GB RAM", sto: "128GB", color: ["Blue", "#8fb4dc"] },
};

/** shared layout of the four product scenes: index badge + name, hero, spec chips, feature chips */
const ProductScene: React.FC<{ id: Key; features: (frame: number, size: number) => React.ReactNode; overlay?: (frame: number, w: number, h: number) => React.ReactNode; badge?: (frame: number, P: boolean) => React.ReactNode; colorAt?: number; from?: -1 | 1 }> = ({ id, features, overlay, badge, colorAt, from = -1 }) => {
  const frame = useSceneFrame(id);
  const L = useLayout();
  const P = L.portrait;
  const S = SPECS[id];
  const img = OFFICIAL[id];
  const nAt = Math.min(tev(`${id}.name`), tscene(id).from + 2), rAt = tev(`${id}.ram`), sAt = tev(`${id}.sto`);
  const G = P
    ? { head: 226, nsize: 76, box: { x: 70, y: 430, w: 880, h: 560 }, specs: { l: 60, y: 1030 }, feats: { l: 340, y: 1130 }, chip: 40, fchip: 38 }
    : { head: 36, nsize: 58, box: { x: 30, y: 170, w: 600, h: 560 }, specs: { l: 650, y: 230 }, feats: { l: 650, y: 520 }, chip: 34, fchip: 32 };
  const name = slam(frame, nAt + 3, 2);
  const sk = shake(frame, nAt, 10, 8);
  const w = Math.min(G.box.w, G.box.h / img.aspect);
  return (
    <SceneShell id={id} shakeX={sk.x} shakeY={sk.y}>
      <Burst x={G.box.x + G.box.w / 2} y={G.box.y + G.box.h / 2} r={P ? 900 : 640} rot={frame * 0.5} opacity={0.16 * sp(frame, nAt)} rays={20} />
      <div style={{ position: "absolute", left: P ? 0 : 40, right: P ? 70 : undefined, top: G.head, display: "flex", flexDirection: "column", alignItems: P ? "center" : "flex-start", gap: 6, fontFamily: FONT, fontWeight: 900, color: "#fff", whiteSpace: "nowrap", textShadow: "0 10px 30px rgba(8,20,110,0.4)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, ...slam(frame, nAt, 1.6) }}>
          <div style={{ background: "#fff", color: COLORS.blue, fontSize: G.nsize * 0.36, padding: "2px 18px 4px", borderRadius: 999, textShadow: "none" }}>{S.idx}/4</div>
          <div style={{ fontSize: G.nsize * 0.42, letterSpacing: 8 }}>{S.brand}</div>
        </div>
        <div style={{ ...name, fontSize: G.nsize, letterSpacing: -1 }}>{S.model}</div>
      </div>
      <Hero img={img} frame={frame} at={nAt} box={G.box} sweeps={[nAt + 8, rAt, sAt]} from={from}>
        {overlay?.(frame, w, w * img.aspect)}
      </Hero>
      {badge?.(frame, P)}
      <div style={{ position: "absolute", left: G.specs.l, right: P ? 130 : 30, top: G.specs.y, display: "flex", flexWrap: "wrap", gap: 16, justifyContent: P ? "center" : "flex-start" }}>
        <Chip frame={frame} at={rAt} text={S.ram} icon="chip" size={G.chip} solid />
        <Chip frame={frame} at={sAt} text={S.sto} icon="box" size={G.chip} solid />
        {S.color && colorAt !== undefined ? <Chip frame={frame} at={colorAt} text={S.color[0]} swatch={S.color[1]} size={G.chip} /> : null}
      </div>
      <div style={{ position: "absolute", left: G.feats.l, right: P ? 130 : 30, top: G.feats.y, display: "flex", flexWrap: "wrap", gap: 14, justifyContent: P ? "center" : "flex-start" }}>
        {features(frame, G.fchip)}
      </div>
    </SceneShell>
  );
};

/** stamp badge pinned to the top-right of the hero area */
const Stamp: React.FC<{ frame: number; at: number; P: boolean; children: React.ReactNode; bg?: string; color?: string; size?: number; y?: number }> = ({ frame, at, P, children, bg = "#fff", color = COLORS.blue, size, y }) => {
  if (frame < at - 1) return null;
  const s = slam(frame, at, 2.4);
  const fs = size ?? (P ? 64 : 48);
  return (
    <div style={{ position: "absolute", right: P ? 110 : 470, top: y ?? (P ? 400 : 200), ...s }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, transform: "rotate(-8deg)", background: bg, color, fontFamily: FONT, fontWeight: 900, fontSize: fs, padding: `${fs * 0.08}px ${fs * 0.4}px ${fs * 0.14}px`, borderRadius: fs * 0.3, boxShadow: "0 16px 40px rgba(6,14,90,0.45)", whiteSpace: "nowrap" }}>
        {children}
      </div>
    </div>
  );
};

/*
 * 0.0-3.5 s HOOK ("if you're browsing for a tablet for studying, don't buy before watching this!")
 * visual: the four tablets flip past like cards, then freeze in a fan and a red STOP pill slams in
 */
export const THook: React.FC = () => {
  const frame = useSceneFrame("hook");
  const L = useLayout();
  const P = L.portrait;
  const fAt = tev("hook.flip"), tAt = tev("hook.tab"), sAt = tev("hook.stop");
  const G = P ? { title: 236, tsize: 70, cx: 505, cy: 600, w: 520, fanDx: 190, stop: 470 } : { title: 40, tsize: 54, cx: 540, cy: 330, w: 380, fanDx: 150, stop: 250 };
  const keys: Key[] = ["a9", "a11", "lenovo", "xiaomi"];
  const sk = shake(frame, sAt, 16, 12);
  const fan = sp(frame, sAt, { damping: 13, stiffness: 160 });
  const t1 = slam(frame, 2, 2);
  const cards = keys.map((k, i) => {
    const img = OFFICIAL[k];
    const w = Math.min(G.w, (G.w * 0.8) / img.aspect);
    // flipping phase: each card swipes across in turn (card period 8 frames), looping until STOP
    const local = frame - fAt + 2 - i * 8;
    const cyc = ((local % 32) + 32) % 32;
    const swipeX = frame < fAt - 2 ? 1200 : interpolate(cyc, [0, 6, 10, 16], [900, 0, 0, -900], clamp);
    const fx = (i - 1.5) * G.fanDx * 1.25, fr = (i - 1.5) * 8, fy = Math.abs(i - 1.5) * 26;
    const x = lerp(swipeX, fx, fan), y = lerp(0, fy, fan), r = lerp(swipeX / 60, fr, fan), sc = lerp(1, 0.62, fan);
    return (
      <div key={k} style={{ position: "absolute", left: G.cx - w / 2, top: G.cy - (w * img.aspect) / 2, transform: `translate(${x}px, ${y}px) rotate(${r}deg) scale(${sc})`, filter: "drop-shadow(0 24px 30px rgba(6,14,90,0.45))", zIndex: i }}>
        <ProductImage src={img.src} aspect={img.aspect} width={w} />
      </div>
    );
  });
  return (
    <SceneShell id="hook" shakeX={sk.x} shakeY={sk.y}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, rgba(255,60,90,0.32), rgba(255,60,90,0) 70%)", opacity: ramp(frame, sAt - 3, sAt + 4) }} />
      <div style={{ position: "absolute", left: 0, right: P ? 70 : 0, top: G.title, display: "flex", justifyContent: "center" }}>
        <div dir="rtl" style={{ ...t1, fontFamily: FONT, fontWeight: 900, fontSize: G.tsize, color: "#fff", whiteSpace: "nowrap", textShadow: "0 10px 34px rgba(8,20,110,0.45)" }}>
          تابليت <span style={{ background: "#fff", color: COLORS.blue, padding: "0 18px 8px", borderRadius: 18, opacity: ramp(frame, tAt, tAt + 4) }}>للقراية</span>؟
        </div>
      </div>
      {cards}
      {frame >= sAt - 1 && (
        <div style={{ position: "absolute", left: 0, right: P ? 70 : 0, top: G.stop, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, zIndex: 10 }}>
          <div style={{ ...slam(frame, sAt, 2.6), display: "flex", alignItems: "center", gap: 14, fontFamily: FONT, fontWeight: 900, fontSize: P ? 64 : 50, color: "#fff", background: "#FF3B5C", padding: "6px 34px 10px", borderRadius: 999, boxShadow: "0 14px 34px rgba(80,0,20,0.45)", whiteSpace: "nowrap" }}>
            ✋ STOP
          </div>
        </div>
      )}
      <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: Math.max(interpolate(frame, [0, 1, 6], [0.5, 0.5, 0], clamp), interpolate(frame - sAt, [0, 1, 6], [0, 0.5, 0], clamp)) }} />
    </SceneShell>
  );
};

/** 3.5-11.0 s Galaxy Tab A9+ 5G, 4GB / 64GB: 5G, works with a SIM card wherever you go. */
export const TA9: React.FC = () => (
  <ProductScene
    id="a9"
    badge={(frame, P) => (
      <Stamp frame={frame} at={tev("a9.g5")} P={P}>
        <LineIcon name="signal" size={P ? 70 : 52} stroke={9} color={COLORS.blue} progress={ramp(frame, tev("a9.g5"), tev("a9.g5") + 12)} />
        5G
      </Stamp>
    )}
    overlay={(frame, w, h) => {
      const at = tev("a9.sim");
      if (frame < at - 1) return null;
      // SIM card slides into the tablet's right edge
      const x = interpolate(frame, [at, at + 12], [w * 0.4, 0], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
      const o = ramp(frame, at, at + 4) * interpolate(frame, [at + 16, at + 26], [1, 0.0], clamp);
      return (
        <div style={{ position: "absolute", left: w * 0.86 + x, top: h * 0.5, width: w * 0.16, height: w * 0.2, opacity: o, background: "#fff", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 24px rgba(6,14,90,0.45)" }}>
          <LineIcon name="sim" size={w * 0.15} stroke={7} color={COLORS.blue} />
        </div>
      );
    }}
    features={(frame, size) => (
      <>
        <Chip frame={frame} at={tev("a9.sim")} text="Carte SIM" icon="sim" size={size} />
        <Chip frame={frame} at={tev("a9.where")} text="Partout" icon="pin" size={size} solid />
      </>
    )}
  />
);

/** 11.0-18.25 s Galaxy Tab A11, 4GB / 64GB, Gray: light and practical for reading and videos. */
export const TA11: React.FC = () => (
  <ProductScene
    id="a11"
    from={1}
    colorAt={tev("a11.color")}
    overlay={(frame, w, h) => {
      // reading -> video: a book page, then a play button, on the screen
      const r = tev("a11.read"), v = tev("a11.video");
      const showBook = frame >= r - 1 && frame < v;
      const showPlay = frame >= v - 1;
      const cx = w * 0.4, cy = h * 0.62, sz = w * 0.26;
      return (
        <>
          {showBook && <div style={{ position: "absolute", left: cx - sz / 2, top: cy - sz / 2, transform: `scale(${pop(frame, r)})` }}><LineIcon name="book" size={sz} stroke={6} color="#fff" glow progress={ramp(frame, r, r + 10)} /></div>}
          {showPlay && <div style={{ position: "absolute", left: cx - sz / 2, top: cy - sz / 2, transform: `scale(${pop(frame, v)})` }}><LineIcon name="play" size={sz} stroke={6} color="#fff" glow progress={ramp(frame, v, v + 10)} /></div>}
        </>
      );
    }}
    features={(frame, size) => (
      <>
        <Chip frame={frame} at={tev("a11.light")} text="Légère" icon="feather" size={size} />
        <Chip frame={frame} at={tev("a11.read")} text="Lecture" icon="book" size={size} />
        <Chip frame={frame} at={tev("a11.video")} text="Vidéos" icon="play" size={size} solid />
      </>
    )}
  />
);

/** bilinear map of a unit-square point onto the Lenovo screen quad (fractions of the image) */
const onScreen = (u: number, v: number, w: number, h: number) => {
  const [tl, tr, br, bl] = LENOVO_SCREEN;
  const top = [lerp(tl[0], tr[0], u), lerp(tl[1], tr[1], u)];
  const bot = [lerp(bl[0], br[0], u), lerp(bl[1], br[1], u)];
  return [lerp(top[0], bot[0], v) * w, lerp(top[1], bot[1], v) * h];
};

/** 18.25-25.25 s Lenovo Idea Tab Plus, 6GB / 128GB: comes with the Tab Pen to write and draw. */
export const TLenovo: React.FC = () => (
  <ProductScene
    id="lenovo"
    badge={(frame, P) => (
      <Stamp frame={frame} at={tev("lenovo.pen")} P={P} size={P ? 48 : 38} y={P ? 380 : 200}>
        <LineIcon name="pen" size={P ? 54 : 42} stroke={8} color={COLORS.blue} />
        Tab Pen inclus
      </Stamp>
    )}
    overlay={(frame, w, h) => {
      const wAt = tev("lenovo.write"), dAt = tev("lenovo.draw");
      if (frame < wAt - 1) return null;
      // handwriting loops (write) then a star doodle (draw), traced onto the perspective screen
      const N = 80;
      const write = Array.from({ length: N + 1 }, (_, i) => {
        const t = i / N;
        return onScreen(0.12 + 0.5 * t + 0.03 * Math.sin(t * Math.PI * 10), 0.36 - 0.12 * Math.abs(Math.sin(t * Math.PI * 5)), w, h);
      });
      const star = Array.from({ length: 11 }, (_, i) => {
        const a = -Math.PI / 2 + (i * Math.PI * 4) / 5;
        return onScreen(0.72 + 0.13 * Math.cos(a), 0.6 + 0.24 * Math.sin(a), w, h);
      });
      const toD = (pts: number[][], p: number) => {
        const n = Math.max(2, Math.round(pts.length * p));
        return pts.slice(0, n).map((q, i) => `${i ? "L" : "M"} ${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(" ");
      };
      const pw = ramp(frame, wAt, wAt + 14, (t) => t);
      const pd = ramp(frame, dAt, dAt + 14, (t) => t);
      const tip = frame < dAt ? write[Math.min(N, Math.round(N * pw))] : star[Math.min(10, Math.round(10 * pd))];
      return (
        <svg width={w} height={h} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <path d={toD(write, pw)} fill="none" stroke="#fff" strokeWidth={w * 0.012} strokeLinecap="round" strokeLinejoin="round" />
          {frame >= dAt - 1 && <path d={toD(star, pd)} fill="none" stroke="#FFE07A" strokeWidth={w * 0.012} strokeLinecap="round" strokeLinejoin="round" />}
          <circle cx={tip[0]} cy={tip[1]} r={w * 0.012} fill="#fff" />
        </svg>
      );
    }}
    features={(frame, size) => (
      <>
        <Chip frame={frame} at={tev("lenovo.write")} text="Écrire" icon="pen" size={size} />
        <Chip frame={frame} at={tev("lenovo.draw")} text="Dessiner" icon="spark" size={size} solid />
      </>
    )}
  />
);

/** 25.25-32.25 s Xiaomi Pad 8, 8GB / 128GB, Blue: the most powerful of the four, for games and work. */
export const TXiaomi: React.FC = () => (
  <ProductScene
    id="xiaomi"
    from={1}
    colorAt={tev("xiaomi.color")}
    badge={(frame, P) => (
      <Stamp frame={frame} at={tev("xiaomi.power")} P={P} bg="linear-gradient(90deg,#FFD25A,#FFB020)" color="#3a2500" size={P ? 46 : 36} y={P ? 450 : 200}>
        <LineIcon name="trophy" size={P ? 54 : 42} stroke={8} color="#3a2500" progress={ramp(frame, tev("xiaomi.power"), tev("xiaomi.power") + 12)} />
        LA PLUS PUISSANTE
      </Stamp>
    )}
    features={(frame, size) => (
      <>
        <Chip frame={frame} at={tev("xiaomi.games")} text="Jeux" icon="controller" size={size} />
        <Chip frame={frame} at={tev("xiaomi.work")} text="Travail" icon="briefcase" size={size} solid />
      </>
    )}
  />
);

/** helper for the cover: all four tablets fanned */
export const TabsFan: React.FC<{ cx: number; cy: number; w: number; dx: number }> = ({ cx, cy, w, dx }) => (
  <>
    {(["a9", "a11", "lenovo", "xiaomi"] as Key[]).map((k, i) => {
      const img = OFFICIAL[k];
      const ww = Math.min(w, (w * 0.8) / img.aspect);
      return (
        <div key={k} style={{ position: "absolute", left: cx - ww / 2, top: cy - (ww * img.aspect) / 2, transform: `translate(${(i - 1.5) * dx}px, ${Math.abs(i - 1.5) * 30}px) rotate(${(i - 1.5) * 8}deg)`, filter: "drop-shadow(0 24px 30px rgba(6,14,90,0.45))" }}>
          <ProductImage src={img.src} aspect={img.aspect} width={ww} />
        </div>
      );
    })}
  </>
);
