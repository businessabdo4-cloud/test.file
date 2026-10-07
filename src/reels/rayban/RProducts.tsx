import React from "react";
import { interpolate } from "remotion";
import { COLORS, FONT } from "../../brand";
import { lerp, pop, ramp, shake, slam, sp } from "../../anim";
import { useLayout } from "../../layout";
import { Callout } from "../../components/Callout";
import { IconName, LineIcon } from "../../components/Icons";
import { ProductImage } from "../../components/ProductImage";
import { SceneShell, useSceneFrame } from "../../components/SceneShell";
import { OFFICIAL, rev, rscene } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
type Img = { src: string; aspect: number };

const Heading: React.FC<{ frame: number; at: number; title: string; sub?: string; P: boolean }> = ({ frame, at, title, sub, P }) => {
  const h = sp(frame, at);
  return (
    <div style={{ position: "absolute", left: 0, right: P ? 70 : 0, top: P ? 232 : 40, textAlign: P ? "center" : "left", paddingLeft: P ? 0 : 40, fontFamily: FONT, color: "#fff", opacity: h, transform: `translateY(${(1 - h) * -40}px)`, textShadow: "0 4px 18px rgba(8,20,110,0.35)", whiteSpace: "nowrap" }}>
      {sub ? <span style={{ fontWeight: 700, fontSize: P ? 34 : 28, marginRight: 12, opacity: 0.85 }}>{sub}</span> : null}
      <span style={{ fontWeight: 900, fontSize: P ? 58 : 42 }}>{title}</span>
    </div>
  );
};

/** frame colour swatch: glossy (shiny) or flat (matte) black */
const Swatch: React.FC<{ frame: number; at: number; name: string; glossy: boolean; x: number; y: number; size: number }> = ({ frame, at, name, glossy, x, y, size }) => {
  if (frame < at - 1) return null;
  const p = pop(frame, at);
  return (
    <div style={{ position: "absolute", left: x, top: y, display: "flex", alignItems: "center", gap: size * 0.3, transform: `scale(${p})`, transformOrigin: "left center" }}>
      <div style={{ width: size, height: size, borderRadius: "50%", background: glossy ? "radial-gradient(circle at 34% 28%, rgba(255,255,255,0.75), rgba(255,255,255,0) 32%), #0d0e12" : "#26272b", boxShadow: "0 0 0 6px rgba(255,255,255,0.95), 0 10px 22px rgba(6,14,90,0.4)" }} />
      <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: size * 0.46, color: "#fff", letterSpacing: 2, whiteSpace: "nowrap", textShadow: "0 4px 14px rgba(8,20,110,0.35)" }}>{name}</div>
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

const Hero: React.FC<{ img: Img; frame: number; at: number; from: -1 | 1; x: number; y: number; w: number; sweepAt: number[]; rot?: number }> = ({ img, frame, at, from, x, y, w, sweepAt, rot = 0 }) => {
  const enter = sp(frame, at, { damping: 12, stiffness: 110, mass: 0.8 });
  const s = sweepAt.filter((v) => frame >= v).pop() ?? -100;
  const t = frame / 30;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translateX(${(1 - enter) * 1100 * from}px) translateY(${Math.sin(t * Math.PI * 1.1) * 10}px) rotate(${lerp(14 * from, rot, enter) + Math.sin(t * Math.PI * 0.6) * 2}deg) scale(${lerp(1.25, 1, enter)})`, filter: "drop-shadow(0 34px 44px rgba(6,14,90,0.5))" }}>
      <ProductImage src={img.src} aspect={img.aspect} width={w} sweep={interpolate(frame, [s, s + 16], [-0.3, 1.3], clamp)} />
    </div>
  );
};

/** 6.0-10.5 s Headliner Gen 2, Shiny Black: classique & élégant, goes with any look. */
export const RHeadliner: React.FC = () => {
  const frame = useSceneFrame("headliner");
  const L = useLayout();
  const P = L.portrait;
  const G = P
    ? { hero: { x: 80, y: 380, w: 860 }, sw: { x: 330, y: 810, size: 74 }, chips: 980, look: 1090, size: 42 }
    : { hero: { x: 30, y: 150, w: 600 }, sw: { x: 660, y: 170, size: 60 }, chips: 330, look: 480, size: 34 };
  const at = rev("hl.reveal");
  const sk = shake(frame, at, 14, 8);
  return (
    <SceneShell id="headliner" shakeX={sk.x} shakeY={sk.y}>
      <Heading frame={frame} at={at + 2} title="Headliner Gen 2" sub="Ray-Ban Meta" P={P} />
      <div style={{ position: "absolute", left: G.hero.x - 100, top: G.hero.y + G.hero.w * 0.3, width: G.hero.w + 200, height: 400, background: "radial-gradient(ellipse at center, rgba(255,255,255,0.28), rgba(255,255,255,0) 65%)" }} />
      <Hero img={OFFICIAL.headlinerAngle} frame={frame} at={at} from={1} x={G.hero.x} y={G.hero.y} w={G.hero.w} sweepAt={[at + 8, rev("hl.colour"), rev("hl.elegant")]} rot={-3} />
      <Swatch frame={frame} at={rev("hl.colour")} name="SHINY BLACK" glossy x={G.sw.x} y={G.sw.y} size={G.sw.size} />
      <div style={{ position: "absolute", left: P ? 0 : 640, right: P ? 70 : undefined, top: G.chips, display: "flex", justifyContent: P ? "center" : "flex-start", gap: 24, flexDirection: P ? "row" : "column", alignItems: "flex-start" }}>
        <Chip frame={frame} at={rev("hl.classic")} text="Classique" size={G.size} />
        <Chip frame={frame} at={rev("hl.elegant")} text="Élégant" size={G.size} />
      </div>
      <div style={{ position: "absolute", left: P ? 340 : 640, right: P ? 70 : undefined, top: G.look, display: "flex", justifyContent: "center" }}>
        <Chip frame={frame} at={rev("hl.look")} text="Avec tous les looks" icon="check" size={G.size} solid rot={-3} />
      </div>
    </SceneShell>
  );
};

/** 10.5-15.0 s Wayfarer Gen 2, Matte Black: the iconic Ray-Ban, matte finish. */
export const RWayfarer: React.FC = () => {
  const frame = useSceneFrame("wayfarer");
  const L = useLayout();
  const P = L.portrait;
  const G = P
    ? { hero: { x: 110, y: 380, w: 820 }, sw: { x: 330, y: 810, size: 74 }, stamp: 950, ssize: 96, matte: 1120, size: 42 }
    : { hero: { x: 30, y: 150, w: 600 }, sw: { x: 660, y: 170, size: 60 }, stamp: 310, ssize: 66, matte: 500, size: 34 };
  const at = rev("wf.reveal");
  const sk = shake(frame, at, 14, 8);
  const stampAt = rev("wf.icon");
  const stamp = slam(frame, stampAt, 2.6);
  const ssk = shake(frame, stampAt, 10, 8);
  return (
    <SceneShell id="wayfarer" shakeX={sk.x + ssk.x} shakeY={sk.y + ssk.y}>
      <Heading frame={frame} at={at + 2} title="Wayfarer Gen 2" sub="Ray-Ban Meta" P={P} />
      <div style={{ position: "absolute", left: G.hero.x - 100, top: G.hero.y + G.hero.w * 0.3, width: G.hero.w + 200, height: 400, background: "radial-gradient(ellipse at center, rgba(255,255,255,0.28), rgba(255,255,255,0) 65%)" }} />
      <Hero img={OFFICIAL.wayfarerAngle} frame={frame} at={at} from={-1} x={G.hero.x} y={G.hero.y} w={G.hero.w} sweepAt={[at + 8, rev("wf.colour")]} rot={2} />
      <Swatch frame={frame} at={rev("wf.colour")} name="MATTE BLACK" glossy={false} x={G.sw.x} y={G.sw.y} size={G.sw.size} />
      {frame >= stampAt - 1 && (
        <div style={{ position: "absolute", left: P ? 0 : 640, right: P ? 70 : undefined, top: G.stamp, display: "flex", justifyContent: "center" }}>
          <div style={{ ...stamp, transform: `${stamp.transform ?? ""} rotate(-7deg)`, fontFamily: FONT, fontWeight: 900, fontSize: G.ssize, color: "#fff", border: `${G.ssize * 0.07}px solid #fff`, borderRadius: G.ssize * 0.18, padding: `0 ${G.ssize * 0.3}px ${G.ssize * 0.06}px`, letterSpacing: 4, textShadow: "0 6px 20px rgba(8,20,110,0.35)", boxShadow: "0 10px 30px rgba(6,14,90,0.25)" }}>
            ICONIQUE
          </div>
        </div>
      )}
      <div style={{ position: "absolute", left: P ? 340 : 640, right: P ? 70 : undefined, top: G.matte, display: "flex", justifyContent: "center" }}>
        <Chip frame={frame} at={rev("wf.matte")} text="Finition mate" icon="spark" size={G.size} solid />
      </div>
    </SceneShell>
  );
};

/** 15.0-17.5 s camera: viewfinder on the frame's camera, 12 MP, 3K video. */
export const RCamera: React.FC = () => {
  const frame = useSceneFrame("camera");
  const L = useLayout();
  const P = L.portrait;
  const G = P
    ? { img: { x: 100, y: 420, w: 820 }, vf: { x: 70, y: 250, w: 880, h: 1060 }, mp: { x: 120, y: 790, size: 170 }, k3: { x: 560, y: 820, size: 110 }, rec: 26 }
    : { img: { x: 60, y: 150, w: 560 }, vf: { x: 40, y: 40, w: 1000, h: 800 }, mp: { x: 660, y: 150, size: 130 }, k3: { x: 660, y: 420, size: 90 }, rec: 22 };
  const img = OFFICIAL.wayfarerFront;
  const camAt = rev("cam.cam"), mpAt = rev("cam.mp"), vAt = rev("cam.video"), kAt = rev("cam.k3");
  const enter = sp(frame, rscene("camera").from, { damping: 14, stiffness: 140 });
  // zoom towards the camera lens on "كاميرا", back out for the numbers
  const zoom = interpolate(frame, [camAt, camAt + 10, mpAt - 2, mpAt + 8], [1, 1.9, 1.9, 1], { ...clamp, easing: (x) => x * x * (3 - 2 * x) });
  const lens = { x: 0.04 * G.img.w, y: 0.185 * G.img.w * img.aspect };
  const mp = Math.round(12 * interpolate(frame, [mpAt, mpAt + 10], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) }));
  const mpP = slam(frame, mpAt, 1.8);
  const kP = slam(frame, kAt, 2.4);
  const vP = sp(frame, vAt, { damping: 12, stiffness: 200 });
  const corners = ramp(frame, camAt - 4, camAt + 6);
  const sk = shake(frame, kAt, 12, 9);
  const recOn = frame >= vAt && Math.floor(frame / 8) % 2 === 0;
  const secs = Math.max(0, frame - vAt) / 30;
  const cl = 70 * corners;
  return (
    <SceneShell id="camera" shakeX={sk.x} shakeY={sk.y}>
      {/* viewfinder corners + REC */}
      <svg width={L.w} height={L.h} style={{ position: "absolute", left: 0, top: 0 }}>
        {[[0, 0, 1, 1], [1, 0, -1, 1], [0, 1, 1, -1], [1, 1, -1, -1]].map(([cx, cy, dx, dy], i) => {
          const x = G.vf.x + cx * G.vf.w, y = G.vf.y + cy * G.vf.h;
          return <path key={i} d={`M ${x} ${y + dy * cl} L ${x} ${y} L ${x + dx * cl} ${y}`} fill="none" stroke="#fff" strokeWidth={8} strokeLinecap="round" opacity={0.9 * corners} />;
        })}
      </svg>
      {frame >= vAt && (
        <div style={{ position: "absolute", left: G.vf.x + 30, top: G.vf.y + 26, display: "flex", alignItems: "center", gap: 12, fontFamily: FONT, fontWeight: 800, fontSize: G.rec, color: "#fff", letterSpacing: 2, opacity: vP }}>
          <div style={{ width: G.rec * 0.8, height: G.rec * 0.8, borderRadius: "50%", background: "#FF3B5C", opacity: recOn ? 1 : 0.25 }} />
          REC 00:0{Math.floor(secs)}:{String(Math.floor((secs % 1) * 30)).padStart(2, "0")}
        </div>
      )}
      <div style={{ position: "absolute", left: G.img.x, top: G.img.y, width: G.img.w, transformOrigin: `${lens.x}px ${lens.y}px`, transform: `translateY(${(1 - enter) * 600}px) scale(${zoom})`, opacity: enter, filter: "drop-shadow(0 30px 40px rgba(6,14,90,0.45))" }}>
        <ProductImage src={img.src} aspect={img.aspect} width={G.img.w} />
        {/* focus ring on the camera */}
        {frame >= camAt && frame < mpAt + 8 && (
          <div style={{ position: "absolute", left: lens.x - 26, top: lens.y - 26, width: 52, height: 52, borderRadius: "50%", border: "3px solid #fff", transform: `scale(${lerp(2.2, 1, sp(frame, camAt, { damping: 12, stiffness: 200 }))})`, boxShadow: `0 0 18px ${COLORS.cyan}` }} />
        )}
      </div>
      {frame >= mpAt - 1 && (
        <div style={{ position: "absolute", left: G.mp.x, top: G.mp.y, display: "flex", alignItems: "baseline", gap: 10, fontFamily: FONT, fontWeight: 900, color: "#fff", textShadow: "0 10px 34px rgba(8,20,110,0.4)", ...mpP }}>
          <span style={{ fontSize: G.mp.size, lineHeight: 1 }}>{mp}</span>
          <span style={{ fontSize: G.mp.size * 0.4 }}>MP</span>
        </div>
      )}
      {frame >= vAt - 1 && (
        <div style={{ position: "absolute", left: G.k3.x, top: G.k3.y, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4, fontFamily: FONT, fontWeight: 900, color: "#fff" }}>
          <div style={{ fontSize: G.k3.size * 0.36, letterSpacing: 4, opacity: vP, transform: `translateX(${(1 - vP) * 80}px)` }}>VIDÉO</div>
          {frame >= kAt - 1 && <div style={{ ...kP, fontSize: G.k3.size, lineHeight: 1, color: COLORS.blue, background: "#fff", padding: `0 ${G.k3.size * 0.25}px ${G.k3.size * 0.06}px`, borderRadius: G.k3.size * 0.18, boxShadow: "0 14px 34px rgba(6,14,90,0.35)" }}>3K</div>}
        </div>
      )}
      {/* shutter flash on the photo */}
      <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: interpolate(frame - mpAt, [0, 1, 7], [0, 0.85, 0], clamp) }} />
    </SceneShell>
  );
};

/** 17.5-20.5 s open-ear speakers: music + calls. */
export const RAudio: React.FC = () => {
  const frame = useSceneFrame("audio");
  const L = useLayout();
  const P = L.portrait;
  const G = P
    ? { img: { x: 150, y: 330, w: 780 }, calls: [790, 925, 1060], x: 360, w: 300 }
    : { img: { x: 20, y: 180, w: 540 }, calls: [150, 300, 450], x: 545, w: 240 };
  const img = OFFICIAL.wayfarerAngle;
  const enter = sp(frame, rscene("audio").from, { damping: 13, stiffness: 120 });
  const t = frame / 30;
  // speaker sits in the temple, near the ear end of the arm
  const spk = { x: G.img.x + 0.8 * G.img.w, y: G.img.y + 0.2 * G.img.w * img.aspect };
  const spAt = rev("au.speakers");
  const waves = [0, 1, 2, 3].map((k) => {
    const life = ((frame - spAt + k * 7) % 28) / 28;
    if (frame < spAt) return null;
    const r = 30 + 170 * life;
    return <div key={k} style={{ position: "absolute", left: spk.x - r, top: spk.y - r, width: r * 2, height: r * 2, borderRadius: "50%", border: "5px solid rgba(255,255,255,0.85)", clipPath: "polygon(50% 50%, 100% 0, 100% 100%)", transform: "rotate(-60deg)", opacity: (1 - life) * 0.9 }} />;
  });
  const notes = [0, 1, 2].map((k) => {
    const at = rev("au.music") + k * 9;
    const life = (frame - at) / 40;
    if (life < 0 || life > 1) return null;
    return (
      <div key={k} style={{ position: "absolute", left: spk.x + 60 + k * 40 + Math.sin(life * 6 + k) * 20, top: spk.y - 40 - life * 220, opacity: interpolate(life, [0, 0.15, 0.8, 1], [0, 1, 1, 0]) }}>
        <LineIcon name="note" size={P ? 64 : 48} stroke={6} />
      </div>
    );
  });
  return (
    <SceneShell id="audio">
      <Heading frame={frame} at={rscene("audio").from + 2} title="Audio open-ear" P={P} />
      <div style={{ position: "absolute", left: G.img.x, top: G.img.y, transform: `translateY(${(1 - enter) * 700 + Math.sin(t * Math.PI) * 8}px) rotate(${-3 + Math.sin(t * Math.PI * 0.6) * 2}deg)`, filter: "drop-shadow(0 30px 40px rgba(6,14,90,0.45))" }}>
        <ProductImage src={img.src} aspect={img.aspect} width={G.img.w} />
      </div>
      {waves}
      {notes}
      <Callout frame={frame} at={spAt} icon="headphones" value="Haut-parleurs open-ear" label="Oreilles libres" x={G.x} y={G.calls[0]} width={G.w} side={-1} scale={P ? 1 : 0.8} />
      <Callout frame={frame} at={rev("au.music")} icon="note" value="Musique" label="Son stéréo" x={G.x} y={G.calls[1]} width={G.w} side={-1} scale={P ? 1 : 0.8} />
      <Callout frame={frame} at={rev("au.calls")} icon="phone" value="Appels" label="5 micros intégrés" x={G.x} y={G.calls[2]} width={G.w} side={-1} scale={P ? 1 : 0.8} />
    </SceneShell>
  );
};

/** 20.5-24.0 s battery: up to 8 h (typical use) + charging case up to 48 h more. */
export const RBattery: React.FC = () => {
  const frame = useSceneFrame("battery");
  const L = useLayout();
  const P = L.portrait;
  const hAt = rev("bat.hours"), cAt = rev("bat.case"), mAt = rev("bat.more");
  const hours = Math.round(8 * interpolate(frame, [hAt, hAt + 16], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) }));
  const fill = interpolate(frame, [rscene("battery").from + 2, hAt + 18], [0.05, 1], clamp);
  const h1 = slam(frame, hAt, 1.8);
  const c1 = sp(frame, cAt, { damping: 12, stiffness: 190 });
  const m1 = sp(frame, mAt, { damping: 10, stiffness: 220 });
  const arrow = ramp(frame, cAt + 6, mAt);
  const G = P ? { bat: { x: 230, y: 330, w: 560, h: 250 }, num: 170, row: 760, card: 250 } : { bat: { x: 90, y: 150, w: 400, h: 190 }, num: 130, row: 0, card: 200 };
  const enter = sp(frame, rscene("battery").from + 1, { damping: 14, stiffness: 140 });
  return (
    <SceneShell id="battery">
      <div style={{ position: "absolute", left: G.bat.x, top: G.bat.y, width: G.bat.w, height: G.bat.h, borderRadius: 40, border: "10px solid #fff", padding: 14, opacity: enter, transform: `scale(${lerp(0.7, 1, enter)})`, boxShadow: "0 20px 50px rgba(6,14,90,0.35)" }}>
        <div style={{ position: "absolute", right: -40, top: G.bat.h * 0.3, width: 26, height: G.bat.h * 0.4, borderRadius: 8, background: "#fff" }} />
        <div style={{ width: `${fill * 100}%`, height: "100%", borderRadius: 22, background: "linear-gradient(90deg, #6CF3FF, #ffffff)", opacity: 0.9 }} />
        {frame >= hAt - 1 && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: FONT, color: COLORS.blue, ...h1 }}>
            <span style={{ fontWeight: 900, fontSize: G.num }}>{hours}</span>
            <span style={{ fontWeight: 900, fontSize: G.num * 0.45 }}>h</span>
          </div>
        )}
      </div>
      <div style={{ position: "absolute", left: P ? 0 : G.bat.x - 40, right: P ? 70 : undefined, width: P ? undefined : G.bat.w + 80, top: G.bat.y + G.bat.h + 24, textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: P ? 32 : 24, color: "#fff", opacity: ramp(frame, hAt + 6, hAt + 14) }}>
        d'autonomie (jusqu'à, usage typique)
      </div>
      <div style={{ position: "absolute", left: P ? 110 : 560, top: P ? G.row : 110, display: "flex", flexDirection: P ? "row" : "column", alignItems: "center", gap: 26 }}>
        <div style={{ width: G.card, height: G.card, borderRadius: 40, background: "rgba(255,255,255,0.2)", border: "3px solid rgba(255,255,255,0.7)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `scale(${c1})`, fontFamily: FONT, color: "#fff", gap: 6 }}>
          <LineIcon name="box" size={G.card * 0.42} progress={ramp(frame, cAt, cAt + 12)} stroke={6} />
          <div style={{ fontWeight: 900, fontSize: G.card * 0.14, textAlign: "center", lineHeight: 1.05 }}>Étui de<br />charge</div>
        </div>
        <svg viewBox="0 0 100 40" width={P ? 120 : 80} height={P ? 48 : 32} style={{ transform: P ? undefined : "rotate(90deg)" }}>
          {arrow > 0 && <path d={`M 4 20 H ${4 + 80 * arrow}`} stroke="#fff" strokeWidth={8} strokeLinecap="round" />}
          {arrow > 0.95 && <path d="M 72 6 L 90 20 L 72 34" fill="none" stroke="#fff" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />}
        </svg>
        <div style={{ width: G.card, height: G.card, borderRadius: 40, background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `scale(${m1})`, fontFamily: FONT, color: COLORS.blue }}>
          <LineIcon name="battery" size={G.card * 0.38} progress={ramp(frame, mAt, mAt + 12)} stroke={7} color={COLORS.blue} />
          <div style={{ fontWeight: 900, fontSize: G.card * 0.26 }}>+48 h</div>
          <div style={{ fontWeight: 600, fontSize: G.card * 0.1 }}>de plus (jusqu'à)</div>
        </div>
      </div>
    </SceneShell>
  );
};
