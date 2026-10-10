import React from "react";
import { Img, interpolate, staticFile } from "remotion";
import { COLORS, FONT } from "../../brand";
import { lerp, pop, ramp, shake, slam, sp } from "../../anim";
import { useLayout } from "../../layout";
import { IconName, LineIcon } from "../../components/Icons";
import { ProductImage } from "../../components/ProductImage";
import { Burst, SceneShell, useSceneFrame } from "../../components/SceneShell";
import { OFFICIAL, STAND_IN, zev, zscene } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
type Img = { src: string; aspect: number };

/** visible marker while OpenRun Pro 2 stand-in images are used (must never ship) */
export const StandInTag: React.FC = () =>
  STAND_IN ? (
    <div style={{ position: "absolute", right: 12, top: 12, zIndex: 50, fontFamily: FONT, fontWeight: 900, fontSize: 22, color: "#fff", background: "#FF3B5C", padding: "4px 12px", borderRadius: 8 }}>
      IMAGE PROVISOIRE (Pro 2)
    </div>
  ) : null;

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

const Hero: React.FC<{ img: Img; frame: number; at: number; x: number; y: number; w: number; sweeps: number[]; from?: -1 | 1; rot?: number; bob?: number }> = ({ img, frame, at, x, y, w, sweeps, from = -1, rot = -2, bob = 8 }) => {
  const enter = sp(frame, at, { damping: 12, stiffness: 120, mass: 0.8 });
  const s = sweeps.filter((v) => frame >= v).pop() ?? -100;
  const t = frame / 30;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translateX(${(1 - enter) * 900 * from}px) translateY(${Math.sin(t * Math.PI * 1.1) * bob}px) rotate(${lerp(14 * from, rot, enter) + Math.sin(t * Math.PI * 0.6) * 1.5}deg)`, filter: "drop-shadow(0 30px 40px rgba(6,14,90,0.45))" }}>
      <ProductImage src={img.src} aspect={img.aspect} width={w} sweep={interpolate(frame, [s, s + 16], [-0.3, 1.3], clamp)} />
    </div>
  );
};

/** generic car (drawn, no brand) */
const Car: React.FC<{ w: number }> = ({ w }) => (
  <svg viewBox="0 0 200 90" width={w} height={w * 0.45}>
    <path d="M14 62 L24 38 Q30 26 46 24 L120 22 Q140 22 154 36 L176 44 Q190 48 190 62 L190 70 L14 70 Z" fill="#FF3B5C" stroke="#fff" strokeWidth={4} strokeLinejoin="round" />
    <path d="M48 32 L76 30 L76 46 L40 46 Z M84 30 L118 29 Q132 30 142 44 L84 46 Z" fill="#cfe9ff" />
    <circle cx={52} cy={72} r={14} fill="#1b1d26" stroke="#fff" strokeWidth={4} />
    <circle cx={150} cy={72} r={14} fill="#1b1d26" stroke="#fff" strokeWidth={4} />
    <circle cx={186} cy={54} r={5} fill="#FFE07A" />
  </svg>
);

/** generic in-ear earbud (drawn) */
const Earbud: React.FC<{ w: number }> = ({ w }) => (
  <svg viewBox="0 0 60 80" width={w} height={w * 1.33}>
    <ellipse cx={30} cy={24} rx={22} ry={20} fill="#fff" stroke={COLORS.navy} strokeWidth={4} />
    <rect x={22} y={36} width={16} height={38} rx={8} fill="#fff" stroke={COLORS.navy} strokeWidth={4} />
    <circle cx={36} cy={22} r={8} fill={COLORS.navy} opacity={0.8} />
  </svg>
);

/*
 * 0.0-3.0 s HOOK ("running with earbuds and you can't hear the cars passing?")
 * visual: sealed earbud blocks the sound waves, a car speeds in behind, DANGER flash
 * written: "Tu n'entends pas les voitures ?" style warning in Darija; verbal: VO line 1
 */
export const ZHook: React.FC = () => {
  const frame = useSceneFrame("hook");
  const L = useLayout();
  const P = L.portrait;
  const G = P ? { title: 236, tsize: 70, bud: { x: 640, y: 420, w: 200 }, car: { y: 760, w: 380 }, warn: { y: 1100 } } : { title: 40, tsize: 54, bud: { x: 720, y: 160, w: 150 }, car: { y: 380, w: 300 }, warn: { y: 600 } };
  const budAt = zev("hook.buds"), carAt = zev("hook.car"), dAt = zev("hook.danger");
  const bud = pop(frame, budAt);
  const carX = interpolate(frame, [carAt - 6, dAt + 10], [-(G.car.w + 40), L.w * 0.55], { ...clamp, easing: (x) => x * x });
  const sk = shake(frame, dAt, 16, 12);
  const warn = slam(frame, dAt, 2.4);
  const t1 = slam(frame, 2, 2);
  const blocked = Array.from({ length: 3 }).map((_, k) => {
    const life = ((frame + k * 8) % 24) / 24;
    const r = 60 + 110 * (1 - life);
    return <div key={k} style={{ position: "absolute", left: G.bud.x + G.bud.w * 0.5 - r, top: G.bud.y + G.bud.w * 0.4 - r, width: r * 2, height: r * 2, borderRadius: "50%", border: "4px dashed rgba(255,255,255,0.7)", opacity: life * 0.7 * bud }} />;
  });
  return (
    <SceneShell id="hook" shakeX={sk.x} shakeY={sk.y}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 55%, rgba(255,60,90,0.35), rgba(255,60,90,0) 70%)", opacity: ramp(frame, dAt - 4, dAt + 4) }} />
      <div style={{ position: "absolute", left: 0, right: P ? 70 : 0, top: G.title, display: "flex", justifyContent: "center" }}>
        <div dir="rtl" style={{ ...t1, fontFamily: FONT, fontWeight: 900, fontSize: G.tsize, color: "#fff", lineHeight: 1.2, whiteSpace: "nowrap", textShadow: "0 10px 34px rgba(8,20,110,0.45)" }}>كتجري بالكاسك؟</div>
      </div>
      {frame >= budAt - 1 && (
        <>
          {blocked}
          <div style={{ position: "absolute", left: G.bud.x, top: G.bud.y, transform: `scale(${bud}) rotate(-10deg)`, filter: "drop-shadow(0 16px 26px rgba(6,14,90,0.45))" }}>
            <Earbud w={G.bud.w} />
            <svg viewBox="0 0 100 100" style={{ position: "absolute", left: -20, top: -20, width: G.bud.w + 40, height: G.bud.w * 1.33 + 40 }}>
              <circle cx={50} cy={50} r={44} fill="none" stroke="#FF3B5C" strokeWidth={6} opacity={ramp(frame, carAt, carAt + 6)} />
              <path d={`M 20 20 L ${20 + 60 * ramp(frame, carAt, carAt + 6)} ${20 + 60 * ramp(frame, carAt, carAt + 6)}`} stroke="#FF3B5C" strokeWidth={7} strokeLinecap="round" />
            </svg>
          </div>
        </>
      )}
      {frame >= carAt - 6 && (
        <div style={{ position: "absolute", left: carX, top: G.car.y, filter: "drop-shadow(0 18px 24px rgba(6,14,90,0.45))" }}>
          <Car w={G.car.w} />
        </div>
      )}
      {frame >= dAt - 1 && (
        <div style={{ position: "absolute", left: P ? 340 : 0, right: P ? 70 : 0, top: G.warn.y, display: "flex", justifyContent: "center" }}>
          <div style={{ ...warn, display: "flex", alignItems: "center", gap: 12, fontFamily: FONT, fontWeight: 900, fontSize: P ? 46 : 40, color: "#fff", background: "#FF3B5C", padding: "8px 28px", borderRadius: 999, boxShadow: "0 12px 30px rgba(80,0,20,0.4)", whiteSpace: "nowrap" }}>
            ⚠ DANGER
          </div>
        </div>
      )}
      <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: Math.max(interpolate(frame, [0, 1, 6], [0.5, 0.5, 0], clamp), interpolate(frame - dAt, [0, 1, 6], [0, 0.5, 0], clamp)) }} />
      <StandInTag />
    </SceneShell>
  );
};

/** 3.0-6.25 s INTRO: Shokz OpenRun Pro, DISPONIBLE. */
export const ZIntro: React.FC = () => {
  const frame = useSceneFrame("intro");
  const L = useLayout();
  const P = L.portrait;
  const G = P ? { hero: { x: 90, y: 420, w: 880 }, name: 236, nsize: 80, pill: { x: 340, y: 1120, size: 38 } } : { hero: { x: 60, y: 260, w: 620 }, name: 40, nsize: 64, pill: { x: 680, y: 560, size: 30 } };
  const nAt = zev("intro.name"), dAt = zev("intro.dispo");
  const name = slam(frame, nAt, 2);
  const dispo = slam(frame, dAt, 1.8);
  const sk = shake(frame, nAt, 14, 9);
  return (
    <SceneShell id="intro" shakeX={sk.x} shakeY={sk.y}>
      <Burst x={G.hero.x + G.hero.w / 2} y={G.hero.y + G.hero.w * 0.3} r={P ? 900 : 640} rot={frame * 0.6} opacity={0.18 * sp(frame, nAt)} rays={20} />
      <div style={{ position: "absolute", left: 0, right: P ? 70 : 0, top: G.name, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontFamily: FONT, fontWeight: 900, color: "#fff", whiteSpace: "nowrap", textShadow: "0 10px 30px rgba(8,20,110,0.4)" }}>
        <div style={{ ...name, fontSize: G.nsize * 0.6, letterSpacing: 8 }}>SHOKZ</div>
        <div style={{ ...slam(frame, nAt + 6, 2.2), fontSize: G.nsize }}>OpenRun Pro</div>
      </div>
      <Hero img={OFFICIAL.front} frame={frame} at={nAt} x={G.hero.x} y={G.hero.y} w={G.hero.w} sweeps={[nAt + 8, dAt]} rot={0} />
      {frame >= dAt - 1 && (
        <div style={{ position: "absolute", left: G.pill.x, right: P ? 70 : 40, top: G.pill.y, display: "flex", justifyContent: "center" }}>
          <div style={{ ...dispo, display: "flex", alignItems: "center", gap: 12, fontFamily: FONT, fontWeight: 900, fontSize: G.pill.size, color: COLORS.blue, background: "#fff", padding: "8px 26px", borderRadius: 999, letterSpacing: 3, boxShadow: "0 10px 26px rgba(6,14,90,0.3)" }}>
            <LineIcon name="store" size={G.pill.size * 1.3} stroke={7} color={COLORS.blue} />
            DISPONIBLE
          </div>
        </div>
      )}
      <StandInTag />
    </SceneShell>
  );
};

/** 6.25-14.5 s bone conduction: sound through the cheekbones, ears stay open, you hear everything around you. */
export const ZBone: React.FC = () => {
  const frame = useSceneFrame("bone");
  const L = useLayout();
  const P = L.portrait;
  const G = P ? { head: { cx: 470, cy: 640, s: 1.4 }, chips: { y: 1080 }, size: 36 } : { head: { cx: 300, cy: 470, s: 1.05 }, chips: { y: 220 }, size: 32 };
  const tAt = zev("bn.tech"), bAt = zev("bn.bones"), eAt = zev("bn.ears"), oAt = zev("bn.open"), hAt = zev("bn.hear");
  const s = G.head.s;
  // vibration rings travel along the cheekbone
  const vib = Array.from({ length: 4 }).map((_, k) => {
    if (frame < bAt) return null;
    const life = ((frame - bAt + k * 6) % 24) / 24;
    const r = (20 + 70 * life) * s;
    return <circle key={k} cx={G.head.cx + 34 * s} cy={G.head.cy + 6 * s} r={r} fill="none" stroke={COLORS.cyan} strokeWidth={5} opacity={(1 - life) * 0.9} />;
  });
  // ambient sounds reaching the open ear
  const AMB: { at: number; icon: IconName; dx: number; dy: number }[] = [
    { at: hAt, icon: "car", dx: -260, dy: -170 },
    { at: hAt + 6, icon: "chat", dx: -300, dy: 40 },
    { at: hAt + 12, icon: "run", dx: -220, dy: 230 },
  ];
  const earX = G.head.cx - 20 * s, earY = G.head.cy - 10 * s;
  return (
    <SceneShell id="bone">
      <Heading frame={frame} at={tAt} title="Conduction osseuse" P={P} />
      <svg width={L.w} height={L.h} style={{ position: "absolute", left: 0, top: 0 }}>
        {/* side-view head silhouette (generic) */}
        <g opacity={sp(frame, tAt)}>
          <path d={`M ${G.head.cx - 120 * s} ${G.head.cy + 160 * s} C ${G.head.cx - 150 * s} ${G.head.cy + 40 * s}, ${G.head.cx - 160 * s} ${G.head.cy - 170 * s}, ${G.head.cx} ${G.head.cy - 190 * s} C ${G.head.cx + 130 * s} ${G.head.cy - 200 * s}, ${G.head.cx + 150 * s} ${G.head.cy - 60 * s}, ${G.head.cx + 150 * s} ${G.head.cy - 10 * s} L ${G.head.cx + 175 * s} ${G.head.cy + 50 * s} L ${G.head.cx + 145 * s} ${G.head.cy + 60 * s} C ${G.head.cx + 145 * s} ${G.head.cy + 130 * s}, ${G.head.cx + 90 * s} ${G.head.cy + 150 * s}, ${G.head.cx + 40 * s} ${G.head.cy + 150 * s} L ${G.head.cx + 30 * s} ${G.head.cy + 210 * s}`} fill="rgba(255,255,255,0.16)" stroke="#fff" strokeWidth={5} strokeLinejoin="round" />
          {/* ear */}
          <path d={`M ${earX} ${earY - 40 * s} C ${earX - 40 * s} ${earY - 40 * s}, ${earX - 44 * s} ${earY + 40 * s}, ${earX - 6 * s} ${earY + 44 * s}`} fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" />
          {/* headset: band around the back of the ear, transducer on the cheekbone */}
          <path d={`M ${earX - 70 * s} ${earY + 110 * s} C ${earX - 80 * s} ${earY - 20 * s}, ${earX - 40 * s} ${earY - 90 * s}, ${G.head.cx + 30 * s} ${G.head.cy - 20 * s}`} fill="none" stroke="#2c2f36" strokeWidth={14 * s} strokeLinecap="round" opacity={ramp(frame, tAt + 4, tAt + 12)} />
          <rect x={G.head.cx + 18 * s} y={G.head.cy - 20 * s} width={34 * s} height={46 * s} rx={12 * s} fill="#2c2f36" stroke={COLORS.cyan} strokeWidth={3} opacity={ramp(frame, tAt + 4, tAt + 12)} />
        </g>
        {vib}
        {/* open-ear check */}
        {frame >= oAt && (
          <g transform={`translate(${earX - 30 * s} ${earY - 110 * s}) scale(${pop(frame, oAt)})`}>
            <circle r={34} fill="#2BD27A" stroke="#fff" strokeWidth={5} />
            <path d="M -14 0 L -3 11 L 16 -12" fill="none" stroke="#fff" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        )}
      </svg>
      {AMB.map((a, i) => {
        if (frame < a.at) return null;
        const k = easeOut(ramp(frame, a.at, a.at + 18));
        const x = lerp(earX + a.dx, earX + a.dx * 0.55, k), y = lerp(earY + a.dy, earY + a.dy * 0.55, k);
        return (
          <div key={i} style={{ position: "absolute", left: x - 40, top: y - 40, width: 80, height: 80, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pop(frame, a.at)})`, boxShadow: "0 10px 24px rgba(6,14,90,0.35)" }}>
            <LineIcon name={a.icon} size={50} stroke={7} color={COLORS.blue} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: P ? 340 : 560, right: P ? 70 : 40, top: G.chips.y, display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
        <Chip frame={frame} at={bAt} text="Le son passe par les os" icon="wave" size={G.size} />
        <Chip frame={frame} at={oAt} text="Oreilles libres" icon="check" size={G.size} />
        <Chip frame={frame} at={hAt} text="Tu entends tout autour" icon="headphones" size={G.size} solid />
      </div>
    </SceneShell>
  );
};

/** 14.5-20.0 s light (29 g), stays in place even when running or jumping. */
export const ZLight: React.FC = () => {
  const frame = useSceneFrame("light");
  const L = useLayout();
  const P = L.portrait;
  const G = P ? { card: { x: 70, y: 320, w: 560 }, g: { x: 650, y: 420, s: 170 }, chips: { y: 1000 } } : { card: { x: 50, y: 90, w: 400 }, g: { x: 520, y: 140, s: 140 }, chips: { y: 470 } };
  const at = zscene("light").from;
  const gAt = zev("lt.grams"), sAt = zev("lt.steady"), rAt = zev("lt.run"), jAt = zev("lt.jump");
  const enter = sp(frame, at, { damping: 13, stiffness: 120 });
  const grams = Math.round(29 * easeOut(ramp(frame, gAt, gAt + 12)));
  const g1 = slam(frame, gAt, 2);
  // the runner photo bounces on "run/jump" while the headset stays put
  const bounce = frame >= rAt ? Math.abs(Math.sin((frame - rAt) * 0.45)) * -18 : 0;
  const imgH = G.card.w * OFFICIAL.runner.aspect;
  return (
    <SceneShell id="light">
      <Heading frame={frame} at={at + 2} title="Ultra léger" P={P} />
      <div style={{ position: "absolute", left: G.card.x, top: G.card.y, width: G.card.w, height: imgH, borderRadius: 34, overflow: "hidden", border: "6px solid #fff", background: "#fff", boxShadow: "0 30px 70px rgba(6,14,90,0.5)", transform: `translateY(${(1 - enter) * 900 + bounce}px) rotate(${lerp(8, -2, enter)}deg)` }}>
        <Img src={staticFile(OFFICIAL.runner.src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      {frame >= gAt - 1 && (
        <div style={{ position: "absolute", left: G.g.x, top: G.g.y, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, fontFamily: FONT, color: "#fff", ...g1 }}>
          <div style={{ fontWeight: 900, fontSize: G.g.s, lineHeight: 1, textShadow: "0 10px 30px rgba(8,20,110,0.4)" }}>{grams}<span style={{ fontSize: "0.4em" }}> g</span></div>
          <div style={{ fontWeight: 700, fontSize: G.g.s * 0.17 }}>seulement</div>
        </div>
      )}
      <div style={{ position: "absolute", left: P ? 340 : 480, right: P ? 70 : 40, top: G.chips.y, display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
        <Chip frame={frame} at={sAt} text="Reste en place" icon="lock" size={P ? 38 : 32} solid />
        <Chip frame={frame} at={rAt} text="Course" icon="run" size={P ? 38 : 32} />
        <Chip frame={frame} at={jAt} text="Sauts" icon="spark" size={P ? 38 : 32} />
      </div>
      <StandInTag />
    </SceneShell>
  );
};

/** 20.0-25.5 s battery: up to 10 h, 5 min charge = 1.5 h. */
export const ZBattery: React.FC = () => {
  const frame = useSceneFrame("battery");
  const L = useLayout();
  const P = L.portrait;
  const hAt = zev("bat.h"), cAt = zev("bat.charge"), gAt = zev("bat.give");
  const hours = Math.round(10 * easeOut(ramp(frame, hAt, hAt + 16)));
  const fill = interpolate(frame, [zscene("battery").from + 2, hAt + 18], [0.05, 1], clamp);
  const h1 = slam(frame, hAt, 1.8);
  const c1 = sp(frame, cAt, { damping: 12, stiffness: 190 });
  const m1 = sp(frame, gAt, { damping: 10, stiffness: 220 });
  const arrow = ramp(frame, cAt + 6, gAt);
  const G = P ? { bat: { x: 230, y: 330, w: 560, h: 250 }, num: 170, row: 760, card: 250 } : { bat: { x: 90, y: 150, w: 400, h: 190 }, num: 130, row: 0, card: 200 };
  const enter = sp(frame, zscene("battery").from + 1, { damping: 14, stiffness: 140 });
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
        d'autonomie (jusqu'à)
      </div>
      <div style={{ position: "absolute", left: P ? 110 : 560, top: P ? G.row : 110, display: "flex", flexDirection: P ? "row" : "column", alignItems: "center", gap: 26 }}>
        <div style={{ width: G.card, height: G.card, borderRadius: 40, background: "rgba(255,255,255,0.2)", border: "3px solid rgba(255,255,255,0.7)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `scale(${c1})`, fontFamily: FONT, color: "#fff" }}>
          <LineIcon name="stopwatch" size={G.card * 0.42} progress={ramp(frame, cAt, cAt + 12)} stroke={6} />
          <div style={{ fontWeight: 900, fontSize: G.card * 0.24 }}>5 MIN</div>
          <div style={{ fontWeight: 600, fontSize: G.card * 0.1, opacity: 0.9 }}>de charge</div>
        </div>
        <svg viewBox="0 0 100 40" width={P ? 120 : 80} height={P ? 48 : 32} style={{ transform: P ? undefined : "rotate(90deg)" }}>
          {arrow > 0 && <path d={`M 4 20 H ${4 + 80 * arrow}`} stroke="#fff" strokeWidth={8} strokeLinecap="round" />}
          {arrow > 0.95 && <path d="M 72 6 L 90 20 L 72 34" fill="none" stroke="#fff" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />}
        </svg>
        <div style={{ width: G.card, height: G.card, borderRadius: 40, background: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `scale(${m1})`, fontFamily: FONT, color: COLORS.blue }}>
          <LineIcon name="note" size={G.card * 0.42} progress={ramp(frame, gAt, gAt + 12)} stroke={7} color={COLORS.blue} />
          <div style={{ fontWeight: 900, fontSize: G.card * 0.24 }}>1H30</div>
          <div style={{ fontWeight: 600, fontSize: G.card * 0.1 }}>d'écoute</div>
        </div>
      </div>
    </SceneShell>
  );
};

/** 25.5-29.75 s sweat & rain resistant (IP55), made for sport, running, cycling. */
export const ZSport: React.FC = () => {
  const frame = useSceneFrame("sport");
  const L = useLayout();
  const P = L.portrait;
  const G = P ? { hero: { x: 150, y: 330, w: 760 }, ip: { y: 760 }, chips: { y: 1000 } } : { hero: { x: 40, y: 140, w: 520 }, ip: { y: 170 }, chips: { y: 400 } };
  const ipAt = zev("sp.ip");
  const ip = slam(frame, ipAt, 2);
  // rain drops falling over the headset
  const drops = Array.from({ length: 14 }).map((_, k) => {
    const x = G.hero.x + ((k * 97) % G.hero.w);
    const y = G.hero.y - 40 + (((frame * 14 + k * 61) % 420));
    return <div key={k} style={{ position: "absolute", left: x, top: y, width: 6, height: 26, borderRadius: 3, background: "rgba(255,255,255,0.75)", transform: "rotate(12deg)", opacity: ramp(frame, ipAt, ipAt + 6) * 0.8 }} />;
  });
  return (
    <SceneShell id="sport">
      <Heading frame={frame} at={zscene("sport").from + 2} title="Fait pour le sport" P={P} />
      <Hero img={OFFICIAL.hero} frame={frame} at={zscene("sport").from} x={G.hero.x} y={G.hero.y} w={G.hero.w} sweeps={[ipAt]} />
      {drops}
      {frame >= ipAt - 1 && (
        <div style={{ position: "absolute", left: P ? 0 : 600, right: P ? 70 : 40, top: G.ip.y, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, fontFamily: FONT, color: "#fff", ...ip }}>
          <div style={{ fontWeight: 900, fontSize: P ? 120 : 96, lineHeight: 1, textShadow: "0 10px 30px rgba(8,20,110,0.4)" }}>IP55</div>
          <div style={{ fontWeight: 700, fontSize: P ? 30 : 24 }}>résiste à la sueur et à la pluie</div>
        </div>
      )}
      <div style={{ position: "absolute", left: P ? 340 : 600, right: P ? 70 : 40, top: G.chips.y, display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
        <Chip frame={frame} at={zev("sp.sport")} text="Sport" icon="spark" size={P ? 38 : 32} />
        <Chip frame={frame} at={zev("sp.run")} text="Course" icon="run" size={P ? 38 : 32} />
        <Chip frame={frame} at={zev("sp.bike")} text="Vélo" icon="wave" size={P ? 38 : 32} solid />
      </div>
      <StandInTag />
    </SceneShell>
  );
};
