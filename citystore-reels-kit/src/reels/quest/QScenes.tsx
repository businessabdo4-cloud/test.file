import React from "react";
import { interpolate } from "remotion";
import { COLORS, FONT } from "../../brand";
import { lerp, pop, ramp, shake, slam, sp } from "../../anim";
import { IconName, LineIcon } from "../../components/Icons";
import { ProductImage } from "../../components/ProductImage";
import { Burst, SceneShell, useSceneFrame } from "../../components/SceneShell";
import { LENSES, OFFICIAL, qev, qscene } from "./timeline";

// 9:16 only (the user asked for no 1:1 version of this reel).
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const CX = 505; // visual centre (right action column excluded)
type Img = { src: string; aspect: number };

const Heading: React.FC<{ frame: number; at: number; title: string }> = ({ frame, at, title }) => {
  const h = sp(frame, at);
  return (
    <div style={{ position: "absolute", left: 0, right: 70, top: 232, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 60, color: "#fff", opacity: h, transform: `translateY(${(1 - h) * -40}px)`, textShadow: "0 4px 18px rgba(8,20,110,0.35)", whiteSpace: "nowrap" }}>
      {title}
    </div>
  );
};

const Chip: React.FC<{ frame: number; at: number; text: string; icon?: IconName; size?: number; solid?: boolean; slash?: boolean }> = ({ frame, at, text, icon, size = 38, solid, slash }) => {
  if (frame < at - 1) return null;
  const p = sp(frame, at, { damping: 11, stiffness: 220, mass: 0.6 });
  const fg = solid ? COLORS.blue : "#fff";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.35, padding: `${size * 0.22}px ${size * 0.7}px`, borderRadius: 999, background: solid ? "#fff" : "rgba(255,255,255,0.18)", border: solid ? "none" : "3px solid rgba(255,255,255,0.75)", color: fg, fontFamily: FONT, fontWeight: 900, fontSize: size, whiteSpace: "nowrap", transform: `scale(${p})`, boxShadow: "0 12px 30px rgba(6,14,90,0.3)" }}>
      {icon ? (
        <div style={{ position: "relative", width: size * 1.2, height: size * 1.2 }}>
          <LineIcon name={icon} size={size * 1.2} stroke={7} color={fg} progress={ramp(frame, at, at + 10)} />
          {slash && <svg viewBox="0 0 100 100" style={{ position: "absolute", left: 0, top: 0, width: size * 1.2, height: size * 1.2, overflow: "visible" }}><path d={`M 6 6 L ${6 + 88 * ramp(frame, at + 4, at + 10)} ${6 + 88 * ramp(frame, at + 4, at + 10)}`} stroke="#FF3B5C" strokeWidth={12} strokeLinecap="round" /></svg>}
        </div>
      ) : null}
      {text}
    </div>
  );
};

const Prod: React.FC<{ img: Img; w: number; sweep?: number }> = ({ img, w, sweep = -1 }) => (
  <div style={{ filter: "drop-shadow(0 30px 40px rgba(6,14,90,0.5))" }}>
    <ProductImage src={img.src} aspect={img.aspect} width={w} sweep={sweep} />
  </div>
);

/** simple drawn game world (hills, coins, star, ship) */
const GameArt: React.FC<{ w: number; h: number; t: number }> = ({ w, h, t }) => (
  <svg viewBox="0 0 320 180" width={w} height={h} preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="qsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7b5cff" /><stop offset="1" stopColor="#3ad1ff" /></linearGradient>
    </defs>
    <rect width={320} height={180} fill="url(#qsky)" />
    <path d={`M0 140 Q 60 ${110 + Math.sin(t) * 4} 120 140 T 240 140 T 320 135 V180 H0 Z`} fill="#2BD27A" />
    <path d="M0 160 Q 80 146 160 160 T 320 158 V180 H0 Z" fill="#1aa65d" />
    {[0, 1, 2].map((i) => <circle key={i} cx={110 + i * 40} cy={90 + Math.sin(t * 3 + i) * 6} r={9} fill="#FFE07A" stroke="#fff" strokeWidth={2} />)}
    <path d={`M ${40 + (t * 30) % 260} 60 l 22 8 l -22 8 l 6 -8 Z`} fill="#fff" />
  </svg>
);

/*
 * 0.0-3.25 s HOOK ("want to get INTO the game for real, not just watch it on the TV?")
 * visual: a game on a TV; on "اللعبة" its pieces burst out of the screen around you; on "التلفزة" the TV is crossed out
 */
export const QHook: React.FC = () => {
  const frame = useSceneFrame("hook");
  const eAt = qev("hook.enter"), gAt = qev("hook.game"), tvAt = qev("hook.tv");
  const tv = { w: 640, h: 380, y: 300 };
  const shrink = sp(frame, tvAt, { damping: 13, stiffness: 160 });
  const sk = shake(frame, gAt, 18, 12);
  const glow = ramp(frame, eAt, gAt);
  const t = frame / 30;
  // burst pieces fly from the TV centre toward the viewer
  const pieces = Array.from({ length: 18 }).map((_, k) => {
    if (frame < gAt) return null;
    const life = ((frame - gAt) * 1.4 + k * 9) % 60 / 60;
    const ang = (k * 137.5 * Math.PI) / 180;
    const d = 40 + life * 760;
    const x = CX + Math.cos(ang) * d, y = tv.y + tv.h / 2 + Math.sin(ang) * d * 1.3;
    const s = 0.3 + life * 1.6;
    const kind = k % 3;
    return (
      <div key={k} style={{ position: "absolute", left: x - 30, top: y - 30, width: 60, height: 60, transform: `scale(${s}) rotate(${life * 360 + k * 20}deg)`, opacity: Math.min(1, (1 - life) * 2) }}>
        {kind === 0 ? <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#FFE07A", border: "6px solid #fff" }} /> : kind === 1 ? <div style={{ width: 54, height: 54, borderRadius: 12, background: "#7b5cff", border: "6px solid #fff" }} /> : <LineIcon name="spark" size={60} stroke={8} />}
      </div>
    );
  });
  return (
    <SceneShell id="hook" shakeX={sk.x} shakeY={sk.y}>
      <Burst x={CX} y={tv.y + tv.h / 2} r={1000} rot={frame * 1.2} opacity={0.25 * ramp(frame, gAt, gAt + 6)} rays={22} />
      <div style={{ position: "absolute", left: CX - tv.w / 2, top: tv.y, width: tv.w, transform: `scale(${lerp(1, 0.55, shrink)}) translateY(${shrink * -120}px)`, transformOrigin: "50% 0%" }}>
        <div style={{ width: tv.w, height: tv.h, borderRadius: 26, border: "14px solid #1b1d26", overflow: "hidden", boxShadow: `0 0 ${80 * glow}px rgba(108,243,255,${0.9 * glow}), 0 24px 50px rgba(6,14,90,0.5)` }}>
          <div style={{ transform: `scale(${1 + 0.3 * ramp(frame, eAt, gAt + 6)})` }}><GameArt w={tv.w - 28} h={tv.h - 28} t={t} /></div>
        </div>
        <div style={{ width: 200, height: 18, margin: "0 auto", background: "#1b1d26", borderRadius: "0 0 12px 12px" }} />
        {frame >= tvAt - 1 && (
          <svg viewBox="0 0 100 60" style={{ position: "absolute", left: 0, top: 0, width: tv.w, height: tv.h, overflow: "visible" }}>
            <path d={`M 8 6 L ${8 + 84 * ramp(frame, tvAt, tvAt + 5)} ${6 + 48 * ramp(frame, tvAt, tvAt + 5)}`} stroke="#FF3B5C" strokeWidth={4} strokeLinecap="round" />
            <path d={`M 92 6 L ${92 - 84 * ramp(frame, tvAt + 3, tvAt + 8)} ${6 + 48 * ramp(frame, tvAt + 3, tvAt + 8)}`} stroke="#FF3B5C" strokeWidth={4} strokeLinecap="round" />
          </svg>
        )}
      </div>
      {pieces}
      {frame >= tvAt - 1 && (
        <div style={{ position: "absolute", left: 0, right: 70, top: 600, display: "flex", justifyContent: "center" }}>
          <div dir="rtl" style={{ ...slam(frame, tvAt + 4, 2.2), fontFamily: FONT, fontWeight: 900, fontSize: 64, color: "#fff", whiteSpace: "nowrap", textShadow: "0 10px 30px rgba(8,20,110,0.5)" }}>
            ادخل <span style={{ background: "#fff", color: COLORS.blue, padding: "0 18px 8px", borderRadius: 18 }}>وسط</span> اللعبة!
          </div>
        </div>
      )}
      <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: Math.max(interpolate(frame, [0, 1, 6], [0.5, 0.5, 0], clamp), interpolate(frame - gAt, [0, 1, 7], [0, 0.6, 0], clamp)) }} />
    </SceneShell>
  );
};

/** 3.25-7.75 s INTRO: Meta Quest 3, 512 Go, DISPONIBLE. */
export const QIntro: React.FC = () => {
  const frame = useSceneFrame("intro");
  const nAt = qev("intro.name"), gAt = qev("intro.gb"), dAt = qev("intro.dispo");
  const enter = sp(frame, qscene("intro").from, { damping: 12, stiffness: 120, mass: 0.8 });
  const sk = shake(frame, nAt, 14, 9);
  const t = frame / 30;
  return (
    <SceneShell id="intro" shakeX={sk.x} shakeY={sk.y}>
      <Burst x={CX} y={760} r={900} rot={frame * 0.6} opacity={0.18 * sp(frame, nAt)} rays={20} />
      <div style={{ position: "absolute", left: 0, right: 70, top: 226, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: FONT, fontWeight: 900, color: "#fff", whiteSpace: "nowrap", textShadow: "0 10px 30px rgba(8,20,110,0.4)" }}>
        <div style={{ ...slam(frame, nAt, 2), fontSize: 50, letterSpacing: 8 }}>META</div>
        <div style={{ ...slam(frame, nAt + 5, 2.2), fontSize: 104, lineHeight: 1 }}>Quest 3</div>
      </div>
      <div style={{ position: "absolute", left: 100, top: 520, transform: `translateX(${(1 - enter) * 1000}px) translateY(${Math.sin(t * Math.PI) * 10}px) rotate(${lerp(14, 0, enter) + Math.sin(t * 2) * 1.5}deg)` }}>
        <Prod img={OFFICIAL.hero} w={820} sweep={interpolate(frame, [nAt + 6, nAt + 22], [-0.3, 1.3], clamp)} />
      </div>
      {frame >= gAt - 1 && (
        <div style={{ position: "absolute", right: 110, top: 470, ...slam(frame, gAt, 2.4) }}>
          <div style={{ transform: "rotate(-8deg)", background: "#fff", color: COLORS.blue, fontFamily: FONT, fontWeight: 900, fontSize: 64, padding: "2px 26px 10px", borderRadius: 20, boxShadow: "0 16px 40px rgba(6,14,90,0.45)", whiteSpace: "nowrap" }}>512 Go</div>
        </div>
      )}
      {frame >= dAt - 1 && (
        <div style={{ position: "absolute", left: 340, right: 70, top: 1100, display: "flex", justifyContent: "center" }}>
          <div style={{ ...slam(frame, dAt, 1.8), display: "flex", alignItems: "center", gap: 12, fontFamily: FONT, fontWeight: 900, fontSize: 38, color: COLORS.blue, background: "#fff", padding: "8px 26px", borderRadius: 999, letterSpacing: 3, boxShadow: "0 10px 26px rgba(6,14,90,0.3)" }}>
            <LineIcon name="store" size={50} stroke={7} color={COLORS.blue} />
            DISPONIBLE
          </div>
        </div>
      )}
    </SceneShell>
  );
};

/** 7.75-12.5 s 4K+ display: very sharp picture, you feel inside the game. */
export const QScreen: React.FC = () => {
  const frame = useSceneFrame("screen");
  const kAt = qev("sc.k"), cAt = qev("sc.clear"), fAt = qev("sc.feel"), iAt = qev("sc.inside");
  const w = 600, h = w * OFFICIAL.rear.aspect, x = CX - w / 2, y = 300;
  const enter = sp(frame, qscene("screen").from, { damping: 13, stiffness: 120 });
  const pulse = ramp(frame, cAt, cAt + 8) * (0.7 + 0.3 * Math.sin(frame * 0.3));
  const k = slam(frame, kAt, 2.4);
  const t = frame / 30;
  return (
    <SceneShell id="screen">
      <div style={{ position: "absolute", left: x, top: y, transform: `scale(${lerp(0.7, 1, enter)}) translateY(${Math.sin(t * Math.PI) * 8}px)`, opacity: enter }}>
        <Prod img={OFFICIAL.rear} w={w} sweep={interpolate(frame, [kAt, kAt + 16], [-0.3, 1.3], clamp)} />
        {pulse > 0 && LENSES.map((l, i) => (
          <div key={i} style={{ position: "absolute", left: l.x * w - 90, top: l.y * h - 90, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(108,243,255,0.9), rgba(108,243,255,0) 65%)", opacity: pulse, mixBlendMode: "screen" }} />
        ))}
      </div>
      {frame >= kAt - 1 && (
        <div style={{ position: "absolute", left: 0, right: 70, top: y + h + 40, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: FONT, color: "#fff", ...k }}>
          <div style={{ fontWeight: 800, fontSize: 40, letterSpacing: 6 }}>ÉCRAN</div>
          <div style={{ fontWeight: 900, fontSize: 190, lineHeight: 0.95, textShadow: "0 10px 30px rgba(8,20,110,0.45)" }}>4K+</div>
        </div>
      )}
      <div style={{ position: "absolute", left: 340, right: 70, top: 1170, display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
        <Chip frame={frame} at={cAt} text="Image ultra nette" icon="bright" />
        <Chip frame={frame} at={iAt} text="Dans le jeu" icon="spark" solid />
      </div>
    </SceneShell>
  );
};

/** drawn living room: grey passthrough -> full colour */
const Room: React.FC<{ w: number; h: number; color: number }> = ({ w, h, color }) => (
  <svg viewBox="0 0 400 300" width={w} height={h} style={{ filter: `grayscale(${1 - color}) brightness(${0.85 + 0.15 * color})` }}>
    <rect width={400} height={210} fill="#ffd8a8" />
    <rect y={210} width={400} height={90} fill="#c58b5a" />
    <rect x={40} y={40} width={110} height={100} rx={6} fill="#8fdcff" stroke="#fff" strokeWidth={6} />
    <path d="M95 40 V140 M40 90 H150" stroke="#fff" strokeWidth={5} />
    <rect x={190} y={150} width={170} height={60} rx={14} fill="#ff6b6b" />
    <rect x={180} y={130} width={30} height={90} rx={12} fill="#e05050" />
    <rect x={340} y={130} width={30} height={90} rx={12} fill="#e05050" />
    <rect x={210} y={120} width={130} height={46} rx={14} fill="#ff8a8a" />
    <path d="M60 210 V170 M60 170 C40 160 40 140 60 130 C80 140 80 160 60 170" stroke="#2BD27A" strokeWidth={8} fill="#2BD27A" />
    <rect x={44} y={200} width={32} height={30} rx={4} fill="#9b6b3c" />
    <path d="M300 40 H340 L330 70 H310 Z" fill="#FFE07A" />
    <path d="M320 70 V120" stroke="#555" strokeWidth={4} />
  </svg>
);

/** 12.5-17.75 s mixed reality: you see your home in colour and the game appears in front of you, in your room. */
export const QMixed: React.FC = () => {
  const frame = useSceneFrame("mixed");
  const tAt = qev("mx.title"), rAt = qev("mx.room"), cAt = qev("mx.color"), gAt = qev("mx.game"), fAt = qev("mx.front");
  const card = { x: 110, y: 330, w: 790, h: 592 };
  const enter = sp(frame, qscene("mixed").from + 2, { damping: 13, stiffness: 130 });
  const color = ramp(frame, cAt, cAt + 14);
  const t = frame / 30;
  const targets = [
    { x: 0.3, y: 0.32, d: 0 }, { x: 0.62, y: 0.22, d: 4 }, { x: 0.78, y: 0.45, d: 8 }, { x: 0.45, y: 0.55, d: 12 },
  ];
  return (
    <SceneShell id="mixed">
      <Heading frame={frame} at={tAt} title="Réalité mixte" />
      <div style={{ position: "absolute", left: card.x, top: card.y, width: card.w, height: card.h, borderRadius: 40, overflow: "hidden", border: "6px solid #fff", boxShadow: "0 30px 70px rgba(6,14,90,0.5)", transform: `translateY(${(1 - enter) * 900}px)` }}>
        <Room w={card.w - 12} h={card.h - 12} color={color} />
        {targets.map((g, i) => {
          if (frame < gAt + g.d - 1) return null;
          const p = pop(frame, gAt + g.d);
          return (
            <div key={i} style={{ position: "absolute", left: g.x * card.w - 50, top: g.y * card.h - 50 + Math.sin(t * 3 + i) * 10, width: 100, height: 100, transform: `scale(${p}) rotate(${t * 60 + i * 30}deg)` }}>
              <svg viewBox="0 0 100 100" width={100} height={100}>
                <circle cx={50} cy={50} r={44} fill="#7b5cff" stroke="#fff" strokeWidth={6} />
                <circle cx={50} cy={50} r={26} fill="#fff" />
                <circle cx={50} cy={50} r={12} fill="#FF3B5C" />
              </svg>
            </div>
          );
        })}
        <div style={{ position: "absolute", inset: 0, border: `10px solid rgba(108,243,255,${0.6 * ramp(frame, fAt, fAt + 6)})`, borderRadius: 34 }} />
      </div>
      <div style={{ position: "absolute", right: 90, top: card.y - 90, transform: `scale(${pop(frame, tAt + 3)}) rotate(-6deg)` }}>
        <Prod img={OFFICIAL.hero} w={300} />
      </div>
      <div style={{ position: "absolute", left: 340, right: 70, top: 1000, display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
        <Chip frame={frame} at={cAt} text="Ta maison en couleur" icon="bright" />
        <Chip frame={frame} at={gAt} text="Le jeu dans ton salon" icon="controller" solid />
      </div>
    </SceneShell>
  );
};

/** 17.75-23.75 s games, movies, sport, even work: all in one headset, no PC, no cables. */
export const QAll: React.FC = () => {
  const frame = useSceneFrame("all");
  const one = qev("all.one");
  const hw = 560, hh = hw * OFFICIAL.hero.aspect, hx = CX - hw / 2, hy = 640;
  const TILES: { at: number; icon: IconName; label: string; x: number; y: number }[] = [
    { at: qev("all.games"), icon: "controller", label: "Jeux", x: 125, y: 340 },
    { at: qev("all.movies"), icon: "play", label: "Films", x: 315, y: 340 },
    { at: qev("all.sport"), icon: "run", label: "Sport", x: 505, y: 340 },
    { at: qev("all.work"), icon: "briefcase", label: "Travail", x: 695, y: 340 },
  ];
  const pull = ramp(frame, one, one + 10);
  const hero = sp(frame, qscene("all").from, { damping: 12, stiffness: 120 });
  const t = frame / 30;
  return (
    <SceneShell id="all">
      <Burst x={CX} y={hy + hh / 2} r={900} rot={frame * 0.5} opacity={0.2 * ramp(frame, one, one + 6)} rays={20} />
      <div style={{ position: "absolute", left: hx, top: hy, transform: `scale(${lerp(0.6, 1, hero) * (1 + 0.06 * pop(frame, one) - 0.06)}) translateY(${Math.sin(t * Math.PI) * 8}px)` }}>
        <Prod img={OFFICIAL.hero} w={hw} sweep={interpolate(frame, [one, one + 16], [-0.3, 1.3], clamp)} />
      </div>
      <div style={{ position: "absolute", left: hx - 120, top: hy + hh - 60, transform: `scale(${hero}) rotate(-14deg)` }}><Prod img={OFFICIAL.ctrlL} w={200} /></div>
      <div style={{ position: "absolute", left: hx + hw - 70, top: hy + hh - 60, transform: `scale(${hero}) rotate(14deg)` }}><Prod img={OFFICIAL.ctrlR} w={200} /></div>
      {TILES.map((tl, i) => {
        if (frame < tl.at - 1) return null;
        const p = pop(frame, tl.at);
        const tx = tl.x, ty = tl.y + 30 * pull * Math.sin(Math.PI * Math.min(1, pull));
        return (
          <div key={i} style={{ position: "absolute", left: tx, top: ty, width: 180, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, transform: `scale(${p})` }}>
            <div style={{ width: 150, height: 150, borderRadius: 40, background: i % 2 ? "#fff" : "rgba(255,255,255,0.2)", border: i % 2 ? "none" : "4px solid rgba(255,255,255,0.85)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 14px 30px rgba(6,14,90,0.3)" }}>
              <LineIcon name={tl.icon} size={96} stroke={7} color={i % 2 ? COLORS.blue : "#fff"} progress={ramp(frame, tl.at, tl.at + 10)} />
            </div>
            <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 36, color: "#fff", textShadow: "0 4px 14px rgba(8,20,110,0.4)" }}>{tl.label}</div>
          </div>
        );
      })}
      {frame >= one - 1 && (
        <div style={{ position: "absolute", left: 0, right: 70, top: 232, display: "flex", justifyContent: "center" }}>
          <div style={{ ...slam(frame, one, 2), fontFamily: FONT, fontWeight: 900, fontSize: 54, color: COLORS.blue, background: "#fff", padding: "4px 30px 10px", borderRadius: 999, whiteSpace: "nowrap", boxShadow: "0 12px 30px rgba(6,14,90,0.35)" }}>TOUT-EN-UN</div>
        </div>
      )}
      <div style={{ position: "absolute", left: 340, right: 70, top: 1170, display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
        <Chip frame={frame} at={qev("all.pc")} text="Sans PC" icon="laptop" slash />
        <Chip frame={frame} at={qev("all.wire")} text="Sans fils" icon="cable" slash solid />
      </div>
    </SceneShell>
  );
};

/** 23.75-28.25 s storage 512 Go: plenty of room for lots of games. */
export const QStorage: React.FC = () => {
  const frame = useSceneFrame("storage");
  const tAt = qev("st.title"), gAt = qev("st.gb"), rAt = qev("st.room"), gmAt = qev("st.games");
  const gb = Math.round(512 * easeOut(ramp(frame, gAt, gAt + 16)));
  const n = 12;
  const fill = ramp(frame, rAt, gmAt + 6, (x) => x);
  const tile = 150, gap = 22, cols = 4, gw = cols * tile + (cols - 1) * gap, gx = CX - gw / 2, gy = 560;
  return (
    <SceneShell id="storage">
      <div style={{ position: "absolute", left: 0, right: 70, top: 232, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: FONT, color: "#fff", opacity: sp(frame, tAt) }}>
        <div style={{ fontWeight: 800, fontSize: 40, letterSpacing: 6 }}>STOCKAGE</div>
        {frame >= gAt - 1 && <div style={{ ...slam(frame, gAt, 2), fontWeight: 900, fontSize: 150, lineHeight: 1, textShadow: "0 10px 30px rgba(8,20,110,0.45)" }}>{gb}<span style={{ fontSize: "0.4em" }}> Go</span></div>}
      </div>
      <div style={{ position: "absolute", left: gx, top: gy - 50, width: gw, height: 22, borderRadius: 11, background: "rgba(255,255,255,0.25)", overflow: "hidden" }}>
        <div style={{ width: `${fill * 100}%`, height: "100%", background: "linear-gradient(90deg,#6CF3FF,#fff)" }} />
      </div>
      {Array.from({ length: n }).map((_, i) => {
        const at = rAt + Math.round(((gmAt + 6 - rAt) * i) / n);
        if (frame < at - 1) return null;
        const icons: IconName[] = ["controller", "spark", "run", "play", "mountain", "car"];
        return (
          <div key={i} style={{ position: "absolute", left: gx + (i % cols) * (tile + gap), top: gy + Math.floor(i / cols) * (tile + gap), width: tile, height: tile, borderRadius: 30, background: i % 3 === 0 ? "#fff" : "rgba(255,255,255,0.2)", border: i % 3 === 0 ? "none" : "3px solid rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pop(frame, at)})` }}>
            <LineIcon name={icons[i % icons.length]} size={86} stroke={7} color={i % 3 === 0 ? COLORS.blue : "#fff"} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 340, right: 70, top: 1170, display: "flex", justifyContent: "center" }}>
        <Chip frame={frame} at={gmAt} text="Plein de jeux" icon="controller" solid />
      </div>
    </SceneShell>
  );
};
