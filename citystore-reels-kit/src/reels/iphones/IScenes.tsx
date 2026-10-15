import React from "react";
import { interpolate } from "remotion";
import { COLORS, FONT } from "../../brand";
import { lerp, pop, ramp, shake, slam, sp } from "../../anim";
import { useLayout } from "../../layout";
import { IconName, LineIcon } from "../../components/Icons";
import { ProductImage } from "../../components/ProductImage";
import { SceneShell, useSceneFrame } from "../../components/SceneShell";
import { FINISH, iev, iscene, OFFICIAL } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
type Img = { src: string; aspect: number };

const Heading: React.FC<{ frame: number; at: number; title: string; P: boolean }> = ({ frame, at, title, P }) => {
  const h = sp(frame, at);
  return (
    <div style={{ position: "absolute", left: 0, right: P ? 70 : 0, top: P ? 232 : 40, textAlign: P ? "center" : "left", paddingLeft: P ? 0 : 40, fontFamily: FONT, fontWeight: 900, fontSize: P ? 60 : 44, color: "#fff", opacity: h, transform: `translateY(${(1 - h) * -40}px)`, textShadow: "0 4px 18px rgba(8,20,110,0.35)", whiteSpace: "nowrap" }}>
      {title}
    </div>
  );
};

const SpecCard: React.FC<{ frame: number; at: number; icon: IconName; value: React.ReactNode; label: string; x: number; y: number; w: number; size: number; solid?: boolean }> = ({ frame, at, icon, value, label, x, y, w, size, solid }) => {
  if (frame < at - 1) return null;
  const p = sp(frame, at, { damping: 12, stiffness: 190 });
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, display: "flex", alignItems: "center", gap: size * 0.45, padding: `${size * 0.3}px ${size * 0.45}px`, borderRadius: size * 0.6, background: solid ? "#fff" : "rgba(255,255,255,0.18)", border: solid ? "none" : "3px solid rgba(255,255,255,0.7)", boxShadow: "0 16px 40px rgba(6,14,90,0.3)", transform: `translateX(${(1 - p) * 300}px) scale(${lerp(0.7, 1, p)})`, opacity: Math.min(1, p * 1.4), fontFamily: FONT, color: solid ? COLORS.blue : "#fff" }}>
      <div style={{ width: size * 1.7, height: size * 1.7, borderRadius: "50%", background: solid ? `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.cyan})` : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <LineIcon name={icon} size={size * 1.05} stroke={7} color={solid ? "#fff" : COLORS.blue} progress={ramp(frame, at, at + 12)} />
      </div>
      <div style={{ lineHeight: 1.05, minWidth: 0 }}>
        <div style={{ fontWeight: 900, fontSize: size * 1.0, whiteSpace: "nowrap" }}>{value}</div>
        <div style={{ fontWeight: 700, fontSize: size * 0.5, opacity: 0.9 }}>{label}</div>
      </div>
    </div>
  );
};

const Swatch: React.FC<{ frame: number; at: number; name: string; fill: string; active: number; size: number }> = ({ frame, at, name, fill, active, size }) => {
  if (frame < at - 1) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.3, transform: `scale(${pop(frame, at) * (1 + 0.08 * active)})`, transformOrigin: "left center" }}>
      <div style={{ width: size, height: size, borderRadius: "50%", background: `radial-gradient(circle at 34% 28%, rgba(255,255,255,0.5), rgba(255,255,255,0) 42%), ${fill}`, boxShadow: `0 0 0 ${4 + 4 * active}px rgba(255,255,255,${0.6 + 0.4 * active}), 0 10px 22px rgba(6,14,90,0.4)` }} />
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: size * 0.5, color: "#fff", whiteSpace: "nowrap", opacity: 0.7 + 0.3 * active, letterSpacing: 2, textShadow: "0 4px 14px rgba(8,20,110,0.35)" }}>{name}</div>
    </div>
  );
};

const Hero: React.FC<{ img: Img; frame: number; at: number; x: number; y: number; w: number; sweeps: number[]; from?: -1 | 1; dim?: number }> = ({ img, frame, at, x, y, w, sweeps, from = -1, dim = 0 }) => {
  const enter = sp(frame, at, { damping: 12, stiffness: 120, mass: 0.8 });
  const s = sweeps.filter((v) => frame >= v).pop() ?? -100;
  const t = frame / 30;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translateX(${(1 - enter) * 900 * from}px) translateY(${Math.sin(t * Math.PI * 1.1) * 8}px) rotate(${lerp(14 * from, -2 * from, enter) + Math.sin(t * Math.PI * 0.6) * 1.5}deg)`, filter: `drop-shadow(0 30px 40px rgba(6,14,90,0.45)) brightness(${1 - 0.3 * dim})` }}>
      <ProductImage src={img.src} aspect={img.aspect} width={w} sweep={interpolate(frame, [s, s + 16], [-0.3, 1.3], clamp)} />
    </div>
  );
};

/** 10.0-17.0 s iPhone 18 Pro, Burgundy: the newest iPhone, A20 Pro, top performance, Apple's best camera. */
export const IP18: React.FC = () => {
  const frame = useSceneFrame("p18");
  const L = useLayout();
  const P = L.portrait;
  const G = P
    ? { hero: { x: 40, y: 340, w: 480 }, sw: { x: 80, y: 960, size: 64 }, x: 560, w: 400, ys: [350, 530, 710, 890], size: 36 }
    : { hero: { x: 40, y: 110, w: 320 }, sw: { x: 60, y: 540, size: 46 }, x: 420, w: 600, ys: [90, 240, 390, 540], size: 34 };
  const at = iscene("p18").from;
  const sk = shake(frame, at, 14, 9);
  const perfAt = iev("p18.perf");
  return (
    <SceneShell id="p18" shakeX={sk.x} shakeY={sk.y}>
      <Heading frame={frame} at={at + 2} title="iPhone 18 Pro" P={P} />
      <Hero img={OFFICIAL.p18Burgundy} frame={frame} at={at} x={G.hero.x} y={G.hero.y} w={G.hero.w} sweeps={[at + 8, iev("p18.colour"), iev("p18.chip"), iev("p18.camera")]} />
      <div style={{ position: "absolute", left: G.sw.x, top: G.sw.y }}>
        <Swatch frame={frame} at={iev("p18.colour")} name="BURGUNDY" fill={FINISH.burgundy} active={1} size={G.sw.size} />
      </div>
      <SpecCard frame={frame} at={iev("p18.latest")} icon="spark" value="Nouveau" label="le dernier iPhone sorti" x={G.x} y={G.ys[0]} w={G.w} size={G.size} solid />
      <SpecCard frame={frame} at={iev("p18.chip")} icon="chip" value="A20 Pro" label="puce" x={G.x} y={G.ys[1]} w={G.w} size={G.size} />
      <SpecCard frame={frame} at={perfAt} icon="bolt" value="Performance max" label="la plus puissante chez Apple" x={G.x} y={G.ys[2]} w={G.w} size={G.size} />
      <SpecCard frame={frame} at={iev("p18.camera")} icon="camera" value="Caméras Pro" label="3 × 48 MP" x={G.x} y={G.ys[3]} w={G.w} size={G.size} />
    </SceneShell>
  );
};

/** 17.0-26.5 s iPhone 17 Pro, Silver & Orange: A19 Pro, 3 × 48 MP cameras, up to 8x optical-quality zoom. */
export const IP17: React.FC = () => {
  const frame = useSceneFrame("p17");
  const L = useLayout();
  const P = L.portrait;
  const G = P
    ? { a: { x: 250, y: 520, w: 300 }, b: { x: 30, y: 330, w: 360 }, sw: { x: 60, y: 960, size: 54 }, x: 560, w: 400, ys: [380, 560, 740], size: 36 }
    : { a: { x: 200, y: 250, w: 200 }, b: { x: 30, y: 100, w: 240 }, sw: { x: 50, y: 520, size: 40 }, x: 440, w: 580, ys: [100, 270, 440], size: 34 };
  const at = iscene("p17").from;
  const sAt = iev("p17.silver"), oAt = iev("p17.orange"), mpAt = iev("p17.mp"), zAt = iev("p17.zoom"), x8At = iev("p17.x8");
  const sk = shake(frame, at, 14, 9);
  const sk2 = shake(frame, x8At, 12, 8);
  const front = frame >= oAt ? "orange" : "silver";
  const zoom = 1 + 7 * easeOut(ramp(frame, zAt + 4, x8At));
  const mp = Math.round(48 * easeOut(ramp(frame, mpAt, mpAt + 12)));
  const silverP = sp(frame, sAt - 6, { damping: 12, stiffness: 120 });
  return (
    <SceneShell id="p17" shakeX={sk.x + sk2.x} shakeY={sk.y + sk2.y}>
      <Heading frame={frame} at={at + 2} title="iPhone 17 Pro" P={P} />
      {/* orange front-left, silver behind-right; the one the VO names comes to the front */}
      <div style={{ position: "absolute", inset: 0, opacity: silverP, zIndex: front === "silver" ? 2 : 1 }}>
        <Hero img={OFFICIAL.p17Silver} frame={frame} at={sAt - 6} x={G.a.x} y={G.a.y} w={G.a.w} sweeps={[sAt]} dim={front === "silver" ? 0 : 0.8} from={1} />
      </div>
      <div style={{ position: "absolute", inset: 0, zIndex: front === "orange" ? 2 : 1 }}>
        <Hero img={OFFICIAL.p17Orange} frame={frame} at={at} x={G.b.x} y={G.b.y} w={G.b.w} sweeps={[oAt, mpAt, x8At]} dim={front === "orange" ? 0 : 0.8} />
      </div>
      <div style={{ position: "absolute", left: G.sw.x, top: G.sw.y, display: "flex", flexDirection: P ? "column" : "row", gap: 16, zIndex: 3 }}>
        <Swatch frame={frame} at={sAt} name="SILVER" fill={FINISH.silver} active={front === "silver" ? 1 : 0} size={G.sw.size} />
        <Swatch frame={frame} at={oAt} name="ORANGE" fill={FINISH.orange} active={front === "orange" ? 1 : 0} size={G.sw.size} />
      </div>
      <SpecCard frame={frame} at={iev("p17.chip")} icon="chip" value="A19 Pro" label="puce" x={G.x} y={G.ys[0]} w={G.w} size={G.size} />
      <SpecCard frame={frame} at={iev("p17.cams")} icon="camera" value={<>3 × {frame >= mpAt ? mp : 48} MP</>} label="trois caméras Fusion" x={G.x} y={G.ys[1]} w={G.w} size={G.size} />
      <SpecCard frame={frame} at={zAt} icon="lens" value={<>Zoom {zoom < 7.95 ? zoom.toFixed(1).replace(".", ",") : "8"}x</>} label="qualité optique (jusqu'à)" x={G.x} y={G.ys[2]} w={G.w} size={G.size} solid />
    </SceneShell>
  );
};

/** 26.5-29.0 s 6.3-inch ProMotion screen (up to 120 Hz). */
export const IScreen: React.FC = () => {
  const frame = useSceneFrame("screen");
  const L = useLayout();
  const P = L.portrait;
  const G = P ? { img: { x: 110, y: 300, w: 330 }, x: 490, size: 170, y: 420 } : { img: { x: 110, y: 50, w: 230 }, x: 430, size: 140, y: 150 };
  const enter = sp(frame, iscene("screen").from, { damping: 13, stiffness: 120 });
  const szAt = iev("sc.size"), pmAt = iev("sc.promo");
  const inches = (6.3 * easeOut(ramp(frame, szAt, szAt + 12))).toFixed(1).replace(".", ",");
  const s1 = slam(frame, szAt, 2);
  const imgH = G.img.w * OFFICIAL.p18Front.aspect;
  // smooth-scroll lines on the screen for ProMotion
  const lines = Array.from({ length: 6 }).map((_, k) => {
    if (frame < pmAt) return null;
    const y = ((frame - pmAt) * 14 + k * (imgH / 6)) % imgH;
    return <div key={k} style={{ position: "absolute", left: G.img.w * 0.12, right: G.img.w * 0.12, top: y, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.55)", opacity: ramp(frame, pmAt, pmAt + 6) }} />;
  });
  return (
    <SceneShell id="screen">
      <div style={{ position: "absolute", left: G.img.x, top: G.img.y, transform: `translateY(${(1 - enter) * 700}px) rotate(-3deg)`, filter: "drop-shadow(0 30px 40px rgba(6,14,90,0.45))" }}>
        <ProductImage src={OFFICIAL.p18Front.src} aspect={OFFICIAL.p18Front.aspect} width={G.img.w} sweep={interpolate(frame, [szAt, szAt + 16], [-0.3, 1.3], clamp)} />
        <div style={{ position: "absolute", left: 0, top: imgH * 0.04, width: G.img.w, height: imgH * 0.92, overflow: "hidden" }}>{lines}</div>
      </div>
      {frame >= szAt - 1 && (
        <div style={{ position: "absolute", left: G.x, top: G.y, display: "flex", flexDirection: "column", gap: 18, fontFamily: FONT, color: "#fff" }}>
          <div style={{ ...s1, display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontWeight: 900, fontSize: G.size, lineHeight: 1, textShadow: "0 10px 30px rgba(8,20,110,0.4)" }}>{inches}″</span>
            <span style={{ fontWeight: 800, fontSize: G.size * 0.22 }}>écran</span>
          </div>
          {frame >= pmAt - 1 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10, transform: `scale(${pop(frame, pmAt)})`, transformOrigin: "left center" }}>
              <div style={{ fontWeight: 900, fontSize: G.size * 0.32, color: COLORS.blue, background: "#fff", padding: "4px 22px 8px", borderRadius: 16 }}>ProMotion</div>
              <div style={{ fontWeight: 700, fontSize: G.size * 0.17 }}>fluide jusqu'à 120 Hz</div>
            </div>
          )}
        </div>
      )}
    </SceneShell>
  );
};
