import React from "react";
import { interpolate } from "remotion";
import { COLORS, FONT } from "../../brand";
import { lerp, pop, ramp, shake, slam, sp } from "../../anim";
import { useLayout } from "../../layout";
import { LineIcon } from "../../components/Icons";
import { ProductImage } from "../../components/ProductImage";
import { Burst, SceneShell, useSceneFrame } from "../../components/SceneShell";
import { iev, OFFICIAL } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Generic nano-SIM card glyph. */
export const SimCard: React.FC<{ w: number }> = ({ w }) => (
  <svg viewBox="0 0 60 80" width={w} height={w * 1.33}>
    <path d="M4 4 H42 L56 18 V76 H4 Z" fill="#fff" stroke={COLORS.navy} strokeWidth={3} strokeLinejoin="round" />
    <rect x={14} y={28} width={32} height={34} rx={5} fill="#E9C46A" stroke="#B8902F" strokeWidth={2} />
    <path d="M14 39 H24 M14 51 H24 M36 39 H46 M36 51 H46 M30 28 V62" stroke="#B8902F" strokeWidth={2} />
  </svg>
);

/*
 * 0.0-4.5 s HOOK ("18 Pro or 17 Pro? hard to choose... but both with a SIM card!")
 * visual: VS face-off between the official 18 Pro (Burgundy) and 17 Pro (Orange); Citybot looks back and forth;
 *         a SIM card slams in between with a check on each phone
 * written: "18 Pro wla 17 Pro?" -> "S3ib tkhtar…" -> "Bjouj b la carte SIM!"   verbal: VO line 1
 */
export const IHook: React.FC = () => {
  const frame = useSceneFrame("hook");
  const L = useLayout();
  const P = L.portrait;
  const G = P
    ? { title: 236, tsize: 76, a: { x: 50, y: 360, w: 330 }, b: { x: 640, y: 360, w: 330 }, vs: { x: 510, y: 540, r: 70 }, sim: { x: 510, y: 600, w: 190 } }
    : { title: 40, tsize: 56, a: { x: 70, y: 130, w: 240 }, b: { x: 770, y: 130, w: 240 }, vs: { x: 540, y: 280, r: 56 }, sim: { x: 540, y: 320, w: 140 } };
  const p17At = iev("hook.p17"), hard = iev("hook.hard"), sim = iev("hook.sim");
  const a = sp(frame, 0, { damping: 12, stiffness: 140, mass: 0.8 });
  const b = sp(frame, p17At, { damping: 12, stiffness: 140, mass: 0.8 });
  const vs = pop(frame, p17At + 4);
  const simP = sp(frame, sim, { damping: 10, stiffness: 180, mass: 0.7 });
  const sk = shake(frame, sim, 16, 11);
  const sk2 = shake(frame, p17At, 10, 7);
  const t1 = slam(frame, 2, 2);
  const t2 = slam(frame, hard, 2);
  const t3 = slam(frame, sim, 2.4);
  const tilt = frame >= hard && frame < sim ? Math.sin((frame - hard) * 0.25) : 0; // the "balance" between the two
  const t = frame / 30;
  const phone = (img: { src: string; aspect: number }, g: { x: number; y: number; w: number }, p: number, from: -1 | 1, lean: number, checkAt: number) => (
    <div style={{ position: "absolute", left: g.x, top: g.y, transform: `translateX(${(1 - p) * 700 * from}px) translateY(${lean * 24 + Math.sin(t * Math.PI * 1.1 + from) * 6}px) rotate(${lerp(14 * from, 3 * -from, p)}deg) scale(${1 + 0.06 * Math.max(0, -lean)})`, filter: "drop-shadow(0 30px 40px rgba(6,14,90,0.5))" }}>
      <ProductImage src={img.src} aspect={img.aspect} width={g.w} sweep={interpolate(frame, [checkAt - 4, checkAt + 12], [-0.3, 1.3], clamp)} />
      {frame >= checkAt && (
        <div style={{ position: "absolute", right: -16, top: -16, width: 70, height: 70, borderRadius: "50%", background: "#2BD27A", border: "5px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pop(frame, checkAt)})`, boxShadow: "0 8px 20px rgba(6,14,90,0.35)" }}>
          <LineIcon name="check" size={40} stroke={9} />
        </div>
      )}
    </div>
  );
  return (
    <SceneShell id="hook" shakeX={sk.x + sk2.x} shakeY={sk.y + sk2.y}>
      <Burst x={G.vs.x} y={G.vs.y} r={P ? 900 : 640} rot={frame * 0.6} opacity={0.2 * a} rays={20} />
      <div style={{ position: "absolute", left: 0, right: P ? 70 : 0, top: G.title, display: "flex", justifyContent: "center" }}>
        {frame < hard ? (
          <div style={{ ...t1, fontFamily: FONT, fontWeight: 900, fontSize: G.tsize, color: "#fff", whiteSpace: "nowrap", textShadow: "0 10px 34px rgba(8,20,110,0.45)" }}>18 Pro wla 17 Pro?</div>
        ) : frame < sim ? (
          <div style={{ ...t2, fontFamily: FONT, fontWeight: 900, fontSize: G.tsize, color: "#fff", whiteSpace: "nowrap", textShadow: "0 10px 34px rgba(8,20,110,0.45)" }}>S3ib tkhtar…</div>
        ) : (
          <div style={{ ...t3, fontFamily: FONT, fontWeight: 900, fontSize: G.tsize * 0.9, color: COLORS.blue, background: "#fff", padding: "4px 30px 10px", borderRadius: 22, whiteSpace: "nowrap", boxShadow: "0 14px 34px rgba(6,14,90,0.35)" }}>Bjouj b la carte SIM!</div>
        )}
      </div>
      {phone(OFFICIAL.p18Burgundy, G.a, a, -1, tilt, sim + 3)}
      {frame >= p17At - 1 && phone(OFFICIAL.p17Orange, G.b, b, 1, -tilt, sim + 6)}
      {/* VS badge, replaced by the SIM card */}
      {frame >= p17At + 3 && frame < sim + 2 && (
        <div style={{ position: "absolute", left: G.vs.x - G.vs.r, top: G.vs.y - G.vs.r, width: G.vs.r * 2, height: G.vs.r * 2, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 900, fontSize: G.vs.r * 0.8, color: COLORS.blue, transform: `scale(${vs * (1 - ramp(frame, sim, sim + 2))}) rotate(${tilt * 10}deg)`, boxShadow: "0 12px 30px rgba(6,14,90,0.4)" }}>
          VS
        </div>
      )}
      {frame >= sim && (
        <div style={{ position: "absolute", left: G.sim.x - G.sim.w / 2, top: G.sim.y - G.sim.w * 0.66, transform: `scale(${lerp(2.4, 1, simP)}) rotate(${lerp(-30, -8, simP)}deg)`, opacity: Math.min(1, simP * 2), filter: "drop-shadow(0 16px 26px rgba(6,14,90,0.5))" }}>
          <SimCard w={G.sim.w} />
        </div>
      )}
      <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: Math.max(interpolate(frame, [0, 1, 7], [0.7, 0.7, 0], clamp), interpolate(frame - sim, [0, 1, 7], [0, 0.7, 0], clamp)) }} />
    </SceneShell>
  );
};

/** 4.5-10.0 s INTRO: iPhone 18 Pro & iPhone 17 Pro, 256 GB, DISPONIBLES. */
export const IIntro: React.FC = () => {
  const frame = useSceneFrame("intro");
  const L = useLayout();
  const P = L.portrait;
  const G = P
    ? { a: { x: 50, y: 300, w: 450 }, b: { x: 540, y: 330, w: 450 }, lab: 900, labSize: 40, gb: { y: 990 }, pill: { x: 340, y: 1120, size: 38 } }
    : { a: { x: 40, y: 90, w: 300 }, b: { x: 330, y: 110, w: 300 }, lab: 0, labSize: 34, gb: { y: 330 }, pill: { x: 680, y: 470, size: 30 } };
  const aAt = iev("intro.p18"), bAt = iev("intro.p17"), gbAt = iev("intro.gb"), dAt = iev("intro.dispo");
  const a = sp(frame, aAt, { damping: 12, stiffness: 120, mass: 0.8 });
  const b = sp(frame, bAt, { damping: 12, stiffness: 120, mass: 0.8 });
  const sk = shake(frame, aAt, 12, 8);
  const gb = slam(frame, gbAt, 2.2);
  const dispo = slam(frame, dAt, 1.8);
  const t = frame / 30;
  const label = (text: string, at: number) => (
    <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: G.labSize, color: "#fff", whiteSpace: "nowrap", opacity: ramp(frame, at + 4, at + 10), textShadow: "0 4px 16px rgba(8,20,110,0.4)" }}>{text}</div>
  );
  return (
    <SceneShell id="intro" shakeX={sk.x} shakeY={sk.y}>
      <div style={{ position: "absolute", left: G.a.x, top: G.a.y, transform: `translateX(${(1 - a) * -900}px) rotate(${lerp(-16, -3, a)}deg) translateY(${Math.sin(t * Math.PI * 1.1) * 8}px)`, filter: "drop-shadow(0 30px 40px rgba(6,14,90,0.45))" }}>
        <ProductImage src={OFFICIAL.p18Burgundy.src} aspect={OFFICIAL.p18Burgundy.aspect} width={G.a.w} sweep={interpolate(frame, [aAt + 6, aAt + 22], [-0.3, 1.3], clamp)} />
      </div>
      {frame >= bAt - 1 && (
        <div style={{ position: "absolute", left: G.b.x, top: G.b.y, transform: `translateX(${(1 - b) * 900}px) rotate(${lerp(16, 3, b)}deg) translateY(${Math.sin(t * Math.PI * 1.1 + 1) * 8}px)`, filter: "drop-shadow(0 30px 40px rgba(6,14,90,0.45))" }}>
          <ProductImage src={OFFICIAL.p17Orange.src} aspect={OFFICIAL.p17Orange.aspect} width={G.b.w} sweep={interpolate(frame, [bAt + 6, bAt + 22], [-0.3, 1.3], clamp)} />
        </div>
      )}
      {P ? (
        <>
          <div style={{ position: "absolute", left: G.a.x, width: G.a.w, top: G.lab, display: "flex", justifyContent: "center" }}>{label("iPhone 18 Pro", aAt)}</div>
          <div style={{ position: "absolute", left: G.b.x, width: G.b.w, top: G.lab, display: "flex", justifyContent: "center" }}>{frame >= bAt && label("iPhone 17 Pro", bAt)}</div>
        </>
      ) : (
        <div style={{ position: "absolute", left: 680, top: 110, display: "flex", flexDirection: "column", gap: 14 }}>
          {label("iPhone 18 Pro", aAt)}
          {frame >= bAt && label("iPhone 17 Pro", bAt)}
        </div>
      )}
      {frame >= gbAt - 1 && (
        <div style={{ position: "absolute", left: P ? 340 : 680, right: P ? 70 : 40, top: G.gb.y, display: "flex", justifyContent: P ? "center" : "flex-start" }}>
          <div style={{ ...gb, fontFamily: FONT, fontWeight: 900, fontSize: P ? 64 : 52, color: "#fff", border: "5px solid #fff", borderRadius: 20, padding: "0 24px 6px", whiteSpace: "nowrap" }}>256 GB</div>
        </div>
      )}
      {frame >= dAt - 1 && (
        <div style={{ position: "absolute", left: G.pill.x, right: P ? 70 : 40, top: G.pill.y, display: "flex", justifyContent: P ? "center" : "flex-start" }}>
          <div style={{ ...dispo, display: "flex", alignItems: "center", gap: 12, fontFamily: FONT, fontWeight: 900, fontSize: G.pill.size, color: COLORS.blue, background: "#fff", padding: "8px 26px", borderRadius: 999, letterSpacing: 3, boxShadow: "0 10px 26px rgba(6,14,90,0.3)" }}>
            <LineIcon name="store" size={G.pill.size * 1.3} stroke={7} color={COLORS.blue} />
            DISPONIBLES
          </div>
        </div>
      )}
    </SceneShell>
  );
};
