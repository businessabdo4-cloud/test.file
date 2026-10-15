import React from "react";
import { interpolate } from "remotion";
import { COLORS, FONT } from "../../brand";
import { pop, ramp, shake, slam } from "../../anim";
import { useLayout } from "../../layout";
import { Burst, SceneShell, SweepText, useSceneFrame } from "../../components/SceneShell";
import { gev } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/*
 * 0.0-2.5 s HOOK
 * visual: Citybot jumps in, its face becomes a round Galaxy dial; burst + shake on slams
 * written: "الجديد في Samsung" tag -> "Galaxy Watch" slam + sweep -> "8 Classic · Ultra2" -> stamp
 * verbal: "الجديد في Samsung watches وصل لـ City Store"
 */
export const GHook: React.FC = () => {
  const frame = useSceneFrame("hook");
  const L = useLayout();
  const P = L.portrait;
  const y = P ? { tag: 230, t1: 318, t2: 450, stamp: 612, burst: 500 } : { tag: 48, t1: 112, t2: 206, stamp: 330, burst: 280 };
  const fs = P ? { tag: 44, t1: 124, t2: 76, st: 48 } : { tag: 32, t1: 88, t2: 54, st: 36 };
  const sk = [shake(frame, gev("hook.title"), 22), shake(frame, gev("hook.models"), 12), shake(frame, gev("hook.stamp"), 14), shake(frame, 12, 10)];
  const sx = sk.reduce((a, s) => a + s.x, 0);
  const sy = sk.reduce((a, s) => a + s.y, 0);
  const tag = pop(frame, 0);
  const t1 = slam(frame, gev("hook.title"), 2.5);
  const t2 = slam(frame, gev("hook.models"), 2.0);
  const st = slam(frame, gev("hook.stamp"), 2.2);
  const sweep = interpolate(frame, [gev("hook.sweep"), gev("hook.sweep") + 14], [-0.3, 1.3], clamp);
  const glow = interpolate(frame - gev("hook.title"), [0, 2, 16], [0, 1, 0.35], clamp);
  const center: React.CSSProperties = { position: "absolute", left: 0, right: P ? 70 : 0, display: "flex", justifyContent: "center" };
  const heavy: React.CSSProperties = { fontFamily: FONT, fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: -2, textShadow: "0 8px 30px rgba(8,20,110,0.35)" };
  const pill: React.CSSProperties = { background: "#fff", color: COLORS.blue, fontFamily: FONT, fontWeight: 900, borderRadius: 999, boxShadow: "0 8px 24px rgba(8,20,110,0.3)" };

  return (
    <SceneShell id="hook" shakeX={sx} shakeY={sy}>
      <Burst x={L.w / 2 - (P ? 35 : 0)} y={y.burst} r={P ? 900 : 640} rot={frame * 0.6} opacity={0.18 + glow * 0.25} />
      <div style={{ position: "absolute", left: 0, right: 0, top: y.burst - 300, height: 600, background: "radial-gradient(ellipse at center, rgba(255,255,255,0.35), rgba(255,255,255,0) 60%)", opacity: glow }} />
      <div style={{ ...center, top: y.tag }}>
        <div dir="rtl" style={{ ...pill, transform: `scale(${tag}) rotate(${(1 - tag) * -10}deg)`, fontSize: fs.tag, padding: `0 ${fs.tag * 0.7}px ${fs.tag * 0.12}px` }}>
          الجديد في SAMSUNG
        </div>
      </div>
      <div style={{ ...center, top: y.t1, ...t1 }}>
        <SweepText text="Galaxy Watch" sweep={sweep} style={{ ...heavy, fontSize: fs.t1 }} />
      </div>
      <div style={{ ...center, top: y.t2, ...t2 }}>
        <div style={{ ...heavy, fontSize: fs.t2, letterSpacing: 0, display: "flex", gap: fs.t2 * 0.35, alignItems: "center" }}>
          <span>8 Classic</span>
          <span style={{ width: fs.t2 * 0.16, height: fs.t2 * 0.16, borderRadius: "50%", background: "#fff", opacity: 0.8 }} />
          <span>Ultra2</span>
        </div>
      </div>
      <div style={{ ...center, top: y.stamp }}>
        <div style={{ ...st, transform: `${st.transform} rotate(-5deg)` }}>
          <div dir="rtl" style={{ ...pill, borderRadius: fs.st * 0.35, fontSize: fs.st, padding: `${fs.st * 0.08}px ${fs.st * 0.6}px ${fs.st * 0.2}px`, boxShadow: `0 0 0 ${fs.st * 0.12}px rgba(255,255,255,0.35), 0 12px 30px rgba(8,20,110,0.35)` }}>
            وصل لـ CITY STORE!
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: interpolate(frame - gev("hook.title"), [0, 1, 6], [0, 0.45, 0], clamp) }} />
      <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: (1 - ramp(frame, 0, 6)) * 0.6 }} />
    </SceneShell>
  );
};
