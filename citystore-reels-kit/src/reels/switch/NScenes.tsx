import React from "react";
import { interpolate } from "remotion";
import { COLORS, FONT } from "../../brand";
import { lerp, pop, ramp, shake, slam, sp } from "../../anim";
import { useLayout } from "../../layout";
import { IconName, LineIcon } from "../../components/Icons";
import { ProductImage } from "../../components/ProductImage";
import { SceneShell, useSceneFrame } from "../../components/SceneShell";
import { HANDHELD_SCREEN, NEON, nev, nscene, OFFICIAL } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

const Heading: React.FC<{ frame: number; at: number; title: string; sub?: string; P: boolean }> = ({ frame, at, title, sub, P }) => {
  const h = sp(frame, at);
  return (
    <div style={{ position: "absolute", left: 0, right: P ? 70 : 0, top: P ? 232 : 40, textAlign: P ? "center" : "left", paddingLeft: P ? 0 : 40, fontFamily: FONT, color: "#fff", opacity: h, transform: `translateY(${(1 - h) * -40}px)`, textShadow: "0 4px 18px rgba(8,20,110,0.35)", whiteSpace: "nowrap" }}>
      {sub ? <span style={{ fontWeight: 700, fontSize: P ? 34 : 28, marginRight: 12, opacity: 0.85 }}>{sub}</span> : null}
      <span style={{ fontWeight: 900, fontSize: P ? 56 : 42 }}>{title}</span>
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

/** 6.0-10.5 s 7-inch OLED screen: vivid colours, deep contrast, immersion. */
export const NScreen: React.FC = () => {
  const frame = useSceneFrame("screen");
  const L = useLayout();
  const P = L.portrait;
  const G = P
    ? { img: { x: 90, y: 380, w: 880 }, size: { x: 0, y: 800, s: 150 }, chips: { x: 340, y: 1010 }, chip: 38 }
    : { img: { x: 230, y: 135, w: 600 }, size: { x: 60, y: 460, s: 110 }, chips: { x: 420, y: 480 }, chip: 32 };
  const enter = sp(frame, nscene("screen").from, { damping: 13, stiffness: 120 });
  const sizeAt = nev("sc.size"), colAt = nev("sc.colours"), conAt = nev("sc.contrast"), inAt = nev("sc.inside");
  const imgH = G.img.w * OFFICIAL.handheld.aspect;
  const sat = 1 + 0.45 * ramp(frame, colAt, colAt + 10);
  const con = 1 + 0.18 * ramp(frame, conAt, conAt + 8);
  const zoom = 1 + 0.22 * easeOut(ramp(frame, inAt, inAt + 24));
  const S = HANDHELD_SCREEN;
  const cx = (S.x0 + S.x1) / 2, cy = (S.y0 + S.y1) / 2;
  const sizeP = slam(frame, sizeAt, 2);
  const inches = (7 * easeOut(ramp(frame, sizeAt, sizeAt + 12))).toFixed(1).replace(".", ",").replace(",0", "");
  const t = frame / 30;
  return (
    <SceneShell id="screen">
      <Heading frame={frame} at={nscene("screen").from + 2} title="Écran OLED" P={P} />
      <div style={{ position: "absolute", left: G.img.x, top: G.img.y, transformOrigin: `${cx * G.img.w}px ${cy * imgH}px`, transform: `translateY(${(1 - enter) * 700 + Math.sin(t * Math.PI) * 6}px) scale(${zoom})`, filter: `saturate(${sat}) contrast(${con}) drop-shadow(0 30px 40px rgba(6,14,90,0.45))` }}>
        <ProductImage src={OFFICIAL.handheld.src} aspect={OFFICIAL.handheld.aspect} width={G.img.w} sweep={interpolate(frame, [colAt, colAt + 16], [-0.3, 1.3], clamp)} />
        {/* diagonal measuring line across the screen for "7 pouces" */}
        {frame >= sizeAt && (
          <svg width={G.img.w} height={imgH} style={{ position: "absolute", left: 0, top: 0, opacity: 1 - ramp(frame, colAt + 4, colAt + 10) }}>
            {(() => {
              const x0 = S.x0 * G.img.w + 10, y0 = S.y1 * imgH - 10, x1 = S.x1 * G.img.w - 10, y1 = S.y0 * imgH + 10;
              const k = easeOut(ramp(frame, sizeAt, sizeAt + 12));
              return <line x1={x0} y1={y0} x2={lerp(x0, x1, k)} y2={lerp(y0, y1, k)} stroke="#fff" strokeWidth={6} strokeDasharray="14 10" strokeLinecap="round" />;
            })()}
          </svg>
        )}
      </div>
      {frame >= sizeAt - 1 && (
        <div style={{ position: "absolute", left: G.size.x, right: P ? 70 : undefined, top: G.size.y, display: "flex", justifyContent: P ? "center" : "flex-start", alignItems: "baseline", gap: 14, fontFamily: FONT, color: "#fff", ...sizeP }}>
          <span style={{ fontWeight: 900, fontSize: G.size.s, lineHeight: 1, textShadow: "0 10px 30px rgba(8,20,110,0.4)" }}>{inches}″</span>
          <span style={{ fontWeight: 800, fontSize: G.size.s * 0.28 }}>pouces OLED</span>
        </div>
      )}
      <div style={{ position: "absolute", left: G.chips.x, right: P ? 70 : 40, top: G.chips.y, display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
        <Chip frame={frame} at={colAt} text="Couleurs vives" icon="bright" size={G.chip} />
        <Chip frame={frame} at={conAt} text="Contraste profond" icon="moon" size={G.chip} />
        <Chip frame={frame} at={inAt} text="Immersion totale" icon="controller" size={G.chip} solid />
      </div>
    </SceneShell>
  );
};

/** 10.5-15.0 s three modes: TV / portable / table, switch in a second and keep the same game. */
export const NModes: React.FC = () => {
  const frame = useSceneFrame("modes");
  const L = useLayout();
  const P = L.portrait;
  const G = P
    ? { card: { x: 90, w: 860, h: 220, ys: [270, 515, 760] }, imgW: 330, label: 46, chips: { y: 1010 } }
    : { card: { x: 40, w: 1000, h: 170, ys: [60, 250, 440] }, imgW: 280, label: 40, chips: { y: 640 } };
  const MODES: { at: number; img: { src: string; aspect: number }; text: string; icon: IconName }[] = [
    { at: nev("md.tv"), img: OFFICIAL.whiteDock, text: "Mode TV", icon: "display" },
    { at: nev("md.handheld"), img: OFFICIAL.handheld, text: "Mode portable", icon: "controller" },
    { at: nev("md.table"), img: OFFICIAL.tabletop, text: "Mode table", icon: "box" },
  ];
  const swAt = nev("md.switch"), resAt = nev("md.resume");
  // on "فثانية": a highlight races TV -> portable -> table in one second
  const cycle = frame >= swAt && frame < swAt + 30 ? Math.floor((frame - swAt) / 10) % 3 : -1;
  return (
    <SceneShell id="modes">
      {MODES.map((m, i) => {
        if (frame < m.at - 1) return null;
        const p = sp(frame, m.at, { damping: 12, stiffness: 180 });
        const hi = cycle === i ? 1 : 0;
        const imgH = Math.min(G.card.h - 24, G.imgW * m.img.aspect);
        const imgW = imgH / m.img.aspect;
        return (
          <div key={i} style={{ position: "absolute", left: G.card.x, top: G.card.ys[i], width: G.card.w, height: G.card.h, borderRadius: 36, background: hi ? "#fff" : "rgba(255,255,255,0.16)", border: `3px solid rgba(255,255,255,${hi ? 1 : 0.6})`, boxShadow: `0 16px 40px rgba(6,14,90,${0.25 + 0.2 * hi})`, display: "flex", alignItems: "center", gap: 26, padding: "0 30px", transform: `translateX(${(1 - p) * (i % 2 ? 900 : -900)}px) scale(${1 + 0.03 * hi})`, fontFamily: FONT }}>
            <div style={{ width: G.imgW, display: "flex", justifyContent: "center", flexShrink: 0, filter: "drop-shadow(0 12px 18px rgba(6,14,90,0.35))" }}>
              <ProductImage src={m.img.src} aspect={m.img.aspect} width={imgW} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, fontWeight: 900, fontSize: G.label, color: hi ? COLORS.blue : "#fff", whiteSpace: "nowrap" }}>
              <LineIcon name={m.icon} size={G.label * 1.2} stroke={7} color={hi ? COLORS.blue : "#fff"} />
              {m.text}
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: P ? 340 : 40, right: P ? 70 : 40, top: G.chips.y, display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
        <Chip frame={frame} at={swAt} text="En 1 seconde" icon="bolt" size={P ? 38 : 32} />
        <Chip frame={frame} at={resAt} text="Même partie, sans pause" icon="check" size={P ? 38 : 32} solid />
      </div>
    </SceneShell>
  );
};

/** 15.0-19.0 s 64 GB, adjustable stand, better sound than the standard Switch. */
export const NSpecs: React.FC = () => {
  const frame = useSceneFrame("specs");
  const L = useLayout();
  const P = L.portrait;
  const G = P
    ? { img: { x: 150, y: 290, w: 740 }, cards: { x: 340, w: 610, ys: [700, 870, 1040] }, size: 40 }
    : { img: { x: 30, y: 110, w: 520 }, cards: { x: 580, w: 460, ys: [110, 280, 450] }, size: 34 };
  const stAt = nev("sp.storage"), sdAt = nev("sp.stand"), auAt = nev("sp.audio"), vsAt = nev("sp.vs");
  const enter = sp(frame, nscene("specs").from, { damping: 13, stiffness: 120 });
  const gb = Math.round(64 * easeOut(ramp(frame, stAt, stAt + 14)));
  const imgH = G.img.w * OFFICIAL.tabletop.aspect;
  // the kickstand on tabletop image sits at ~(0.05-0.12, 0.45-0.75): highlight it when "support réglable" lands
  const stand = ramp(frame, sdAt, sdAt + 8) * (1 - ramp(frame, auAt, auAt + 6));
  const card = (at: number, icon: IconName, value: React.ReactNode, label: string, y: number, solid?: boolean) => {
    if (frame < at - 1) return null;
    const p = sp(frame, at, { damping: 12, stiffness: 190 });
    return (
      <div style={{ position: "absolute", left: G.cards.x, top: y, width: G.cards.w, display: "flex", alignItems: "center", gap: 18, padding: `${G.size * 0.3}px ${G.size * 0.45}px`, borderRadius: G.size * 0.6, background: solid ? "#fff" : "rgba(255,255,255,0.18)", border: solid ? "none" : "3px solid rgba(255,255,255,0.7)", boxShadow: "0 16px 40px rgba(6,14,90,0.3)", transform: `translateX(${(1 - p) * 300}px)`, opacity: Math.min(1, p * 1.4), fontFamily: FONT, color: solid ? COLORS.blue : "#fff" }}>
        <div style={{ width: G.size * 1.7, height: G.size * 1.7, borderRadius: "50%", background: solid ? `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.cyan})` : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <LineIcon name={icon} size={G.size * 1.05} stroke={7} color={solid ? "#fff" : COLORS.blue} progress={ramp(frame, at, at + 12)} />
        </div>
        <div style={{ lineHeight: 1.05 }}>
          <div style={{ fontWeight: 900, fontSize: G.size * 1.05, whiteSpace: "nowrap" }}>{value}</div>
          <div style={{ fontWeight: 700, fontSize: G.size * 0.5, opacity: 0.9 }}>{label}</div>
        </div>
      </div>
    );
  };
  return (
    <SceneShell id="specs">
      <Heading frame={frame} at={nscene("specs").from + 2} title="Switch OLED" sub="Nintendo" P={P} />
      <div style={{ position: "absolute", left: G.img.x, top: G.img.y, transform: `translateY(${(1 - enter) * 600}px)`, filter: "drop-shadow(0 30px 40px rgba(6,14,90,0.45))" }}>
        <ProductImage src={OFFICIAL.tabletop.src} aspect={OFFICIAL.tabletop.aspect} width={G.img.w} sweep={interpolate(frame, [sdAt, sdAt + 16], [-0.3, 1.3], clamp)} />
        {stand > 0 && (
          <div style={{ position: "absolute", left: G.img.w * 0.0, top: imgH * 0.38, width: G.img.w * 0.16, height: imgH * 0.5, borderRadius: 20, border: "5px solid #fff", boxShadow: `0 0 18px ${COLORS.cyan}`, opacity: stand }} />
        )}
      </div>
      {card(stAt, "chip", <>{gb} GB</>, "de stockage interne", G.cards.ys[0])}
      {card(sdAt, "ruler", "Support réglable", "large, plusieurs angles", G.cards.ys[1])}
      {card(auAt, "note", "Son amélioré", frame >= vsAt ? "meilleur que la Switch standard" : "haut-parleurs", G.cards.ys[2], true)}
    </SceneShell>
  );
};

/** 19.0-22.0 s two Joy-Con in the box: play with a friend. */
export const NJoycon: React.FC = () => {
  const frame = useSceneFrame("joycon");
  const L = useLayout();
  const P = L.portrait;
  const G = P ? { img: { x: 70, y: 420, w: 920 }, chip: { y: 1010 }, size: 40, num: 120 } : { img: { x: 40, y: 140, w: 640 }, chip: { y: 520 }, size: 34, num: 96 };
  const twoAt = nev("jc.two"), frAt = nev("jc.friend");
  const enter = sp(frame, nscene("joycon").from, { damping: 13, stiffness: 120 });
  const imgH = G.img.w * OFFICIAL.tabletop.aspect;
  const n = slam(frame, twoAt, 2.2);
  const sk = shake(frame, frAt, 10, 6);
  const t = frame / 30;
  // Joy-Con positions on neon_tabletop.png (blue lower-middle, red right)
  const PADS = [
    { x: 0.6, y: 0.8, c: NEON.blue, label: "J1" },
    { x: 0.88, y: 0.62, c: NEON.red, label: "J2" },
  ];
  return (
    <SceneShell id="joycon" shakeX={sk.x} shakeY={sk.y}>
      {frame >= twoAt - 1 && (
        <div style={{ position: "absolute", left: 0, right: P ? 70 : undefined, top: P ? 236 : 40, paddingLeft: P ? 0 : 40, display: "flex", justifyContent: P ? "center" : "flex-start", alignItems: "center", gap: 18, fontFamily: FONT, fontWeight: 900, color: "#fff", ...n }}>
          <span style={{ fontSize: G.num, lineHeight: 1, textShadow: "0 10px 30px rgba(8,20,110,0.4)" }}>2</span>
          <span style={{ fontSize: G.num * 0.42, lineHeight: 1.1 }}>Joy-Con<br /><span style={{ fontSize: "0.7em", opacity: 0.9 }}>inclus</span></span>
        </div>
      )}
      <div style={{ position: "absolute", left: G.img.x, top: G.img.y, transform: `translateY(${(1 - enter) * 600 + Math.sin(t * Math.PI) * 6}px)`, filter: "drop-shadow(0 30px 40px rgba(6,14,90,0.45))" }}>
        <ProductImage src={OFFICIAL.tabletop.src} aspect={OFFICIAL.tabletop.aspect} width={G.img.w} sweep={interpolate(frame, [twoAt, twoAt + 16], [-0.3, 1.3], clamp)} />
        {PADS.map((p, i) => {
          if (frame < frAt + i * 3) return null;
          const s = pop(frame, frAt + i * 3);
          return (
            <div key={i} style={{ position: "absolute", left: p.x * G.img.w - 40, top: p.y * imgH - 110, width: 80, height: 80, borderRadius: "50%", background: p.c, border: "5px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 900, fontSize: 32, color: "#fff", transform: `scale(${s}) translateY(${Math.sin(frame * 0.4 + i) * 4}px)`, boxShadow: "0 10px 24px rgba(6,14,90,0.4)" }}>
              {p.label}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: P ? 340 : 40, right: P ? 70 : 40, top: G.chip.y, display: "flex", justifyContent: "center" }}>
        <Chip frame={frame} at={frAt} text="Joue à deux avec ton pote" icon="controller" size={G.size} solid rot={-2} />
      </div>
    </SceneShell>
  );
};
