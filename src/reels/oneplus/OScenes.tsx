import React from "react";
import { Img, interpolate, staticFile } from "remotion";
import { COLORS, FONT } from "../../brand";
import { lerp, pop, ramp, shake, slam, sp } from "../../anim";
import { useLayout } from "../../layout";
import { IconName, LineIcon } from "../../components/Icons";
import { ProductImage } from "../../components/ProductImage";
import { SceneShell, useSceneFrame } from "../../components/SceneShell";
import { EMERALD, OFFICIAL, oev, oscene } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const FADE_STRAP = "linear-gradient(to bottom, transparent 0%, #000 14%, #000 84%, transparent 100%)";

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

/** 4.5-7.5 s EMERALD TITANIUM: official lifestyle shot as a photo card + the green swatch. */
export const OEmerald: React.FC = () => {
  const frame = useSceneFrame("emerald");
  const L = useLayout();
  const P = L.portrait;
  const G = P
    ? { card: { x: 60, y: 300, w: 890 }, title: 820, tsize: 82, sw: { x: 340, y: 1050, size: 70 } }
    : { card: { x: 40, y: 50, w: 620 }, title: 400, tsize: 56, sw: { x: 680, y: 160, size: 56 } };
  const at = oev("em.reveal");
  const cardP = sp(frame, at, { damping: 13, stiffness: 120, mass: 0.8 });
  const cardH = G.card.w * OFFICIAL.lifestyle.aspect;
  const zoom = interpolate(frame, [at, at + 90], [1.12, 1.0], clamp);
  const nameAt = oev("em.name");
  const n1 = slam(frame, nameAt, 2);
  const n2 = slam(frame, nameAt + 5, 2.4);
  const greenAt = oev("em.green");
  const sw = pop(frame, greenAt);
  const sk = shake(frame, nameAt, 10, 6);
  return (
    <SceneShell id="emerald" shakeX={sk.x} shakeY={sk.y}>
      <div style={{ position: "absolute", left: G.card.x, top: G.card.y, width: G.card.w, height: cardH, borderRadius: 40, overflow: "hidden", border: "6px solid #fff", boxShadow: "0 30px 70px rgba(6,14,90,0.5)", transform: `translateY(${(1 - cardP) * 900}px) rotate(${lerp(8, -2, cardP)}deg)` }}>
        <Img src={staticFile(OFFICIAL.lifestyle.src)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})` }} />
      </div>
      {frame >= nameAt - 1 && (
        <div style={{ position: "absolute", left: P ? 0 : G.card.x, right: P ? 70 : undefined, top: G.title, display: "flex", flexDirection: "column", alignItems: P ? "center" : "flex-start", gap: 6, fontFamily: FONT, fontWeight: 900, whiteSpace: "nowrap" }}>
          <div style={{ ...n1, fontSize: G.tsize, color: "#fff", letterSpacing: 2, textShadow: "0 10px 30px rgba(8,20,110,0.4)" }}>EMERALD</div>
          <div style={{ ...n2, fontSize: G.tsize * 0.62, color: COLORS.blue, background: "#fff", padding: "0 26px 6px", borderRadius: 16, letterSpacing: 6 }}>TITANIUM</div>
        </div>
      )}
      {frame >= greenAt - 1 && (
        <div style={{ position: "absolute", left: G.sw.x, top: G.sw.y, display: "flex", alignItems: "center", gap: G.sw.size * 0.3, transform: `scale(${sw})`, transformOrigin: "left center" }}>
          <div style={{ width: G.sw.size, height: G.sw.size, borderRadius: "50%", background: `radial-gradient(circle at 34% 28%, rgba(255,255,255,0.45), rgba(255,255,255,0) 40%), ${EMERALD}`, boxShadow: "0 0 0 6px rgba(255,255,255,0.95), 0 10px 22px rgba(6,14,90,0.4)" }} />
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: G.sw.size * 0.48, color: "#fff", whiteSpace: "nowrap", textShadow: "0 4px 14px rgba(8,20,110,0.35)" }}>Vert émeraude</div>
        </div>
      )}
    </SceneShell>
  );
};

/** 7.5-10.5 s titanium bezel close-up + "classe avec tous les looks". */
export const OTitanium: React.FC = () => {
  const frame = useSceneFrame("titanium");
  const L = useLayout();
  const P = L.portrait;
  // dial centre on front.png sits at ~(0.47, 0.5) of the image; bezel outer radius ~0.43 of its width
  const G = P ? { w: 760, cx: 520, cy: 650, clipTop: 230, clipBottom: 1090, chips: { x: 360, y: 1130 }, size: 42 } : { w: 520, cx: 300, cy: 450, clipTop: 40, clipBottom: 860, chips: { x: 640, y: 300 }, size: 34 };
  const imgH = G.w * OFFICIAL.front.aspect;
  const left = G.cx - 0.47 * G.w, top = G.cy - 0.5 * imgH;
  const zoomIn = sp(frame, oscene("titanium").from, { damping: 16, stiffness: 90 });
  const bezelAt = oev("ti.bezel");
  const ring = ramp(frame, bezelAt, bezelAt + 16);
  const r = 0.43 * G.w;
  const t = frame / 30;
  const label = sp(frame, bezelAt + 4, { damping: 12, stiffness: 200 });
  return (
    <SceneShell id="titanium">
      <div style={{ position: "absolute", left: 0, top: G.clipTop, width: L.w, height: G.clipBottom - G.clipTop, overflow: "hidden", WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 10%, #000 88%, transparent 100%)" }}>
        <div style={{ position: "absolute", left, top: top - G.clipTop, transformOrigin: `${0.47 * G.w}px ${0.5 * imgH}px`, transform: `scale(${lerp(0.8, 1, zoomIn)}) rotate(${Math.sin(t * Math.PI * 0.5) * 2}deg)`, filter: "drop-shadow(0 30px 40px rgba(6,14,90,0.45))" }}>
          <ProductImage src={OFFICIAL.front.src} aspect={OFFICIAL.front.aspect} width={G.w} sweep={interpolate(frame, [bezelAt, bezelAt + 18], [-0.3, 1.3], clamp)} />
        </div>
      </div>
      {/* highlight sweeping around the titanium bezel */}
      <svg width={L.w} height={L.h} style={{ position: "absolute", left: 0, top: 0 }}>
        <circle cx={G.cx} cy={G.cy} r={r + 10} fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" strokeDasharray={`${2 * Math.PI * (r + 10) * ring} ${2 * Math.PI * (r + 10)}`} transform={`rotate(-90 ${G.cx} ${G.cy})`} opacity={0.9 * (1 - ramp(frame, bezelAt + 40, bezelAt + 52))} style={{ filter: `drop-shadow(0 0 10px ${COLORS.cyan})` }} />
      </svg>
      {frame >= bezelAt + 3 && (
        <div style={{ position: "absolute", left: P ? G.cx + r * 0.2 : G.cx + r * 0.35, top: G.cy - r - (P ? 70 : 40), transform: `scale(${label})`, transformOrigin: "left bottom", display: "flex", alignItems: "center", gap: 12, padding: "10px 24px", borderRadius: 999, background: "#fff", color: COLORS.blue, fontFamily: FONT, fontWeight: 900, fontSize: G.size * 0.9, boxShadow: "0 12px 30px rgba(6,14,90,0.35)", whiteSpace: "nowrap" }}>
          <LineIcon name="bezel" size={G.size * 1.1} stroke={7} color={COLORS.blue} />
          Lunette en titane
        </div>
      )}
      <div style={{ position: "absolute", left: G.chips.x, right: P ? 70 : undefined, top: G.chips.y, display: "flex", flexDirection: P ? "row" : "column", gap: 18, justifyContent: "center", alignItems: "flex-start" }}>
        <Chip frame={frame} at={oev("ti.classe")} text="Classe" size={G.size} />
        <Chip frame={frame} at={oev("ti.look")} text="Avec tous les looks" icon="check" size={G.size} solid rot={-3} />
      </div>
    </SceneShell>
  );
};

/** 10.5-14.0 s sapphire display, bright in full sun (up to 2,200 nits). */
export const ODisplay: React.FC = () => {
  const frame = useSceneFrame("display");
  const L = useLayout();
  const P = L.portrait;
  const G = P
    ? { img: { x: 270, y: 300, w: 520 }, sun: { x: 900, y: 320, r: 90 }, chip: { x: 360, y: 1130 }, nits: { x: 360, y: 1220, size: 92 }, size: 42 }
    : { img: { x: 50, y: 70, w: 360 }, sun: { x: 960, y: 130, r: 70 }, chip: { x: 470, y: 230 }, nits: { x: 470, y: 380, size: 84 }, size: 34 };
  const imgH = G.img.w * OFFICIAL.front.aspect;
  const enter = sp(frame, oscene("display").from, { damping: 13, stiffness: 120 });
  const sapAt = oev("dp.sapphire"), brAt = oev("dp.bright"), sunAt = oev("dp.sun");
  const sunP = sp(frame, brAt, { damping: 12, stiffness: 90 });
  const glow = interpolate(frame, [brAt, brAt + 20, sunAt, sunAt + 6], [0, 0.55, 0.55, 0.9], clamp);
  const nits = Math.round(2200 * easeOut(ramp(frame, brAt + 4, brAt + 30)) / 10) * 10;
  const nitsP = slam(frame, brAt + 4, 1.8);
  const tap = shake(frame, oev("dp.strong"), 10, 7);
  const t = frame / 30;
  const dial = { x: G.img.x + 0.47 * G.img.w, y: G.img.y + 0.5 * imgH };
  return (
    <SceneShell id="display" shakeX={tap.x} shakeY={tap.y}>
      {/* the sun rising top-right */}
      {frame >= brAt - 1 && (
        <div style={{ position: "absolute", left: G.sun.x - G.sun.r, top: G.sun.y - G.sun.r + (1 - sunP) * 300, width: G.sun.r * 2, height: G.sun.r * 2, opacity: sunP }}>
          <div style={{ position: "absolute", inset: -G.sun.r * 1.6, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,236,160,0.55), rgba(255,236,160,0) 65%)" }} />
          <div style={{ position: "absolute", inset: 0, transform: `rotate(${frame * 2}deg)` }}>
            <LineIcon name="sun" size={G.sun.r * 2} stroke={6} color="#FFE9A0" />
          </div>
        </div>
      )}
      <div style={{ position: "absolute", left: G.img.x, top: G.img.y, transform: `translateY(${(1 - enter) * 800 + Math.sin(t * Math.PI) * 8}px) rotate(${-2 + Math.sin(t * Math.PI * 0.6) * 2}deg)`, filter: "drop-shadow(0 30px 40px rgba(6,14,90,0.45))" }}>
        <ProductImage src={OFFICIAL.front.src} aspect={OFFICIAL.front.aspect} width={G.img.w} sweep={interpolate(frame, [sapAt, sapAt + 16], [-0.3, 1.3], clamp)} imgStyle={{ WebkitMaskImage: FADE_STRAP }} />
      </div>
      {/* screen brightness bloom on the dial */}
      <div style={{ position: "absolute", left: dial.x - G.img.w * 0.42, top: dial.y - G.img.w * 0.42, width: G.img.w * 0.84, height: G.img.w * 0.84, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.55), rgba(255,255,255,0) 70%)", mixBlendMode: "screen", opacity: glow }} />
      {frame >= sapAt - 1 && (
        <div style={{ position: "absolute", left: G.chip.x, right: P ? 70 : undefined, top: G.chip.y, display: "flex", justifyContent: "center" }}>
          <Chip frame={frame} at={sapAt} text="Verre saphir" icon="sapphire" size={G.size} solid />
        </div>
      )}
      {frame >= brAt + 3 && (
        <div style={{ position: "absolute", left: G.nits.x, right: P ? 70 : undefined, top: G.nits.y, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: FONT, color: "#fff", ...nitsP }}>
          <div style={{ fontWeight: 900, fontSize: G.nits.size, lineHeight: 1, textShadow: "0 10px 30px rgba(8,20,110,0.4)" }}>
            {nits.toLocaleString("fr-FR").replace(/ /g, " ")} <span style={{ fontSize: G.nits.size * 0.4 }}>nits</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: G.nits.size * 0.3, opacity: 0.9 }}>luminosité max · lisible au soleil</div>
        </div>
      )}
    </SceneShell>
  );
};

/** 14.0-18.5 s battery: up to 5 days (typical use), up to 16 days in power-saver mode. */
export const OBattery: React.FC = () => {
  const frame = useSceneFrame("battery");
  const L = useLayout();
  const P = L.portrait;
  const G = P
    ? { r1: { x: 80, y: 300 }, r2: { x: 80, y: 700 }, num: 190, pill: 54, side: { x: 480, y: 1050, w: 440 } }
    : { r1: { x: 60, y: 60 }, r2: { x: 60, y: 400 }, num: 140, pill: 42, side: { x: 660, y: 520, w: 380 } };
  const dAt = oev("bat.days"), nAt = oev("bat.normal"), eAt = oev("bat.eco"), mAt = oev("bat.mode");
  const days = Math.round(5 * easeOut(ramp(frame, dAt, dAt + 14)));
  const eco = Math.round(16 * easeOut(ramp(frame, eAt, eAt + 18)));
  const d1 = slam(frame, dAt, 1.8);
  const e1 = slam(frame, eAt, 2.2);
  const sk = shake(frame, eAt, 14, 9);
  const enter = sp(frame, oscene("battery").from, { damping: 14, stiffness: 120 });
  const t = frame / 30;
  const DAYS5 = ["L", "M", "M", "J", "V"];
  return (
    <SceneShell id="battery" shakeX={sk.x} shakeY={sk.y}>
      {/* row 1: 5 days */}
      <div style={{ position: "absolute", left: G.r1.x, top: G.r1.y, display: "flex", flexDirection: "column", gap: 14, fontFamily: FONT, color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 18, ...(frame >= dAt ? d1 : { opacity: 0 }) }}>
          <span style={{ fontWeight: 900, fontSize: G.num, lineHeight: 0.9, textShadow: "0 10px 30px rgba(8,20,110,0.4)" }}>{days}</span>
          <span style={{ fontWeight: 900, fontSize: G.num * 0.36 }}>JOURS</span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {DAYS5.map((d, i) => {
            const on = ramp(frame, dAt + 3 + i * 3, dAt + 6 + i * 3);
            return (
              <div key={i} style={{ width: G.pill * 1.3, height: G.pill * 1.3, borderRadius: G.pill * 0.36, background: on > 0.5 ? "#fff" : "rgba(255,255,255,0.15)", border: "3px solid rgba(255,255,255,0.8)", color: COLORS.blue, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: G.pill * 0.6, transform: `scale(${0.85 + 0.15 * on})` }}>
                {on > 0.5 ? d : ""}
              </div>
            );
          })}
        </div>
        <div style={{ fontWeight: 700, fontSize: G.pill * 0.62, opacity: ramp(frame, nAt, nAt + 8) }}>en usage normal (jusqu'à)</div>
      </div>
      {/* row 2: 16 days power saver */}
      {frame >= eAt - 1 && (
        <div style={{ position: "absolute", left: G.r2.x, top: G.r2.y, display: "flex", flexDirection: "column", gap: 14, fontFamily: FONT, color: "#fff" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 18, ...e1 }}>
            <span style={{ fontWeight: 900, fontSize: G.num * 1.15, lineHeight: 0.9, color: COLORS.blue, background: "#fff", padding: `0 ${G.num * 0.15}px ${G.num * 0.05}px`, borderRadius: G.num * 0.16 }}>{eco}</span>
            <span style={{ fontWeight: 900, fontSize: G.num * 0.36 }}>JOURS</span>
          </div>
          <div style={{ display: "flex" }}>
            <Chip frame={frame} at={mAt} text="Mode économie" icon="battery" size={G.pill * 0.75} />
          </div>
        </div>
      )}
      <div style={{ position: "absolute", left: G.side.x, top: G.side.y, opacity: enter, transform: `translateY(${(1 - enter) * 300 + Math.sin(t * Math.PI) * 6}px)`, filter: "drop-shadow(0 24px 34px rgba(6,14,90,0.45))" }}>
        <ProductImage src={OFFICIAL.side.src} aspect={OFFICIAL.side.aspect} width={G.side.w} />
      </div>
    </SceneShell>
  );
};

/** 18.5-23.5 s GPS, heart, sleep, sport, then Wear OS apps. */
export const OHealth: React.FC = () => {
  const frame = useSceneFrame("health");
  const L = useLayout();
  const P = L.portrait;
  const G = P
    ? { tiles: { x: 70, y: 280, w: 420, h: 230, gx: 450, gy: 260 }, wear: { x: 340, y: 830, w: 610, h: 300 }, icon: 84, text: 38 }
    : { tiles: { x: 40, y: 50, w: 290, h: 190, gx: 310, gy: 215 }, wear: { x: 660, y: 60, w: 380, h: 420 }, icon: 64, text: 28 };
  const TILES: { at: number; icon: IconName; text: string; sub: string }[] = [
    { at: oev("hl.gps"), icon: "pin", text: "GPS", sub: "bi-fréquence" },
    { at: oev("hl.heart"), icon: "heart", text: "Cardio", sub: "fréquence cardiaque" },
    { at: oev("hl.sleep"), icon: "moon", text: "Sommeil", sub: "suivi des nuits" },
    { at: oev("hl.sport"), icon: "run", text: "Sport", sub: "suivi des séances" },
  ];
  const wearAt = oev("hl.wear"), appsAt = oev("hl.apps");
  const wearP = sp(frame, wearAt, { damping: 12, stiffness: 160 });
  const APPS: IconName[] = ["note", "chat", "pin", "heart", "sun", "camera", "stopwatch", "store", "moon"];
  return (
    <SceneShell id="health">
      {TILES.map((tl, i) => {
        if (frame < tl.at - 1) return null;
        const p = sp(frame, tl.at, { damping: 12, stiffness: 200 });
        const x = G.tiles.x + (i % 2) * G.tiles.gx, y = G.tiles.y + Math.floor(i / 2) * G.tiles.gy;
        const beat = tl.icon === "heart" ? 1 + 0.12 * Math.max(0, Math.sin(((frame - tl.at) / 30) * Math.PI * 2.6)) : 1;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: G.tiles.w, height: G.tiles.h, borderRadius: 34, background: "rgba(255,255,255,0.18)", border: "3px solid rgba(255,255,255,0.7)", boxShadow: "0 16px 40px rgba(6,14,90,0.3)", display: "flex", alignItems: "center", gap: 20, padding: "0 26px", transform: `scale(${p})`, fontFamily: FONT, color: "#fff" }}>
            <div style={{ width: G.icon * 1.35, height: G.icon * 1.35, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transform: `scale(${beat})` }}>
              <LineIcon name={tl.icon} size={G.icon} stroke={7} color={COLORS.blue} progress={ramp(frame, tl.at, tl.at + 12)} />
            </div>
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ fontWeight: 900, fontSize: G.text }}>{tl.text}</div>
              <div style={{ fontWeight: 600, fontSize: G.text * 0.55, opacity: 0.9 }}>{tl.sub}</div>
            </div>
          </div>
        );
      })}
      {frame >= wearAt - 1 && (
        <div style={{ position: "absolute", left: G.wear.x, top: G.wear.y, width: G.wear.w, height: G.wear.h, borderRadius: 40, background: "#fff", boxShadow: "0 24px 60px rgba(6,14,90,0.4)", transform: `scale(${wearP}) rotate(${lerp(-8, 0, wearP)}deg)`, display: "flex", flexDirection: P ? "row" : "column", alignItems: "center", justifyContent: "center", gap: P ? 34 : 20, fontFamily: FONT }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: P ? "flex-start" : "center", color: COLORS.navy }}>
            <div style={{ fontWeight: 900, fontSize: G.text * 1.5, lineHeight: 1 }}>Wear OS</div>
            <div style={{ fontWeight: 700, fontSize: G.text * 0.6, color: COLORS.blue }}>tes applis au poignet</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {APPS.map((a, i) => {
              const p = pop(frame, appsAt + i * 2);
              return (
                <div key={a} style={{ width: G.icon * 0.95, height: G.icon * 0.95, borderRadius: "50%", background: `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.cyan})`, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${frame >= appsAt + i * 2 ? p : 0})` }}>
                  <LineIcon name={a} size={G.icon * 0.55} stroke={7} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </SceneShell>
  );
};
