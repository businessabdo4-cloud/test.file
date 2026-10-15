import React from "react";
import { interpolate } from "remotion";
import { COLORS, FONT } from "../../brand";
import { lerp, pop, ramp, shake, slam, sp } from "../../anim";
import { useLayout } from "../../layout";
import { Burst, SceneShell, SweepText, useSceneFrame } from "../../components/SceneShell";
import { wev } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/*
 * 0.0-3.0 s HOOK
 * visual: Citybot jumps in, its face-screen turns into a watch face, light burst + shake on each slam
 * written: "الجديد" tag -> "وصل لـ CITY STORE!" stamp -> "Apple Watch" / "Ultra 4" slam + light sweep
 * verbal: "الجديد وصل لـ City Store! Apple Watch Ultra 4"
 */
export const WHook: React.FC = () => {
  const frame = useSceneFrame("hook");
  const L = useLayout();
  const P = L.portrait;
  const y = P ? { tag: 230, t1: 318, t2: 436, stamp: 676, burst: 520 } : { tag: 48, t1: 116, t2: 196, stamp: 384, burst: 300 };
  const fs = P ? { tag: 46, t1: 116, t2: 236, st: 50 } : { tag: 34, t1: 84, t2: 164, st: 38 };
  const sk = [shake(frame, wev("hook.title"), 16), shake(frame, wev("hook.ultra"), 24), shake(frame, wev("hook.stamp"), 14), shake(frame, 12, 10)];
  const sx = sk.reduce((a, s) => a + s.x, 0);
  const sy = sk.reduce((a, s) => a + s.y, 0);
  const tag = pop(frame, 0);
  const t1 = slam(frame, wev("hook.title"), 2.4);
  const t2 = slam(frame, wev("hook.ultra"), 2.6);
  const st = slam(frame, wev("hook.stamp"), 2.2);
  const sweep = interpolate(frame, [wev("hook.sweep"), wev("hook.sweep") + 14], [-0.3, 1.3], clamp);
  const glow = interpolate(frame - wev("hook.ultra"), [0, 2, 16], [0, 1, 0.35], clamp);
  const center: React.CSSProperties = { position: "absolute", left: 0, right: P ? 70 : 0, display: "flex", justifyContent: "center" };
  const heavy: React.CSSProperties = { fontFamily: FONT, fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: -2, textShadow: "0 8px 30px rgba(8,20,110,0.35)" };

  return (
    <SceneShell id="hook" shakeX={sx} shakeY={sy}>
      <Burst x={L.w / 2 - (P ? 35 : 0)} y={y.burst} r={P ? 900 : 640} rot={frame * 0.6} opacity={0.18 + glow * 0.25} />
      <div style={{ position: "absolute", left: 0, right: 0, top: y.burst - 300, height: 600, background: "radial-gradient(ellipse at center, rgba(255,255,255,0.35), rgba(255,255,255,0) 60%)", opacity: glow }} />
      <div style={{ ...center, top: y.tag }}>
        <div dir="rtl" style={{ transform: `scale(${tag}) rotate(${(1 - tag) * -10}deg)`, background: "#fff", color: COLORS.blue, fontFamily: FONT, fontWeight: 900, fontSize: fs.tag, padding: `0 ${fs.tag * 0.75}px ${fs.tag * 0.12}px`, borderRadius: 999, boxShadow: "0 8px 24px rgba(8,20,110,0.3)" }}>
          الجديد وصل!
        </div>
      </div>
      <div style={{ ...center, top: y.t1, ...t1 }}>
        <SweepText text="Apple Watch" sweep={sweep} style={{ ...heavy, fontSize: fs.t1 }} />
      </div>
      <div style={{ ...center, top: y.t2, ...t2 }}>
        <SweepText text="Ultra 4" sweep={sweep - 0.15} style={{ ...heavy, fontSize: fs.t2, letterSpacing: -5 }} />
      </div>
      {/* the stamp lands in the (still empty) title zone on "City Store!", then glides down when the title slams in */}
      <div style={{ ...center, top: lerp(y.t1 + 40, y.stamp, sp(frame, wev("hook.title"), { damping: 15, stiffness: 140 })) }}>
        <div style={{ ...st, transform: `${st.transform} rotate(-5deg)` }}>
          <div dir="rtl" style={{ fontFamily: FONT, fontWeight: 900, fontSize: fs.st, color: COLORS.blue, background: "#fff", padding: `${fs.st * 0.08}px ${fs.st * 0.6}px ${fs.st * 0.2}px`, borderRadius: fs.st * 0.35, boxShadow: `0 0 0 ${fs.st * 0.12}px rgba(255,255,255,0.35), 0 12px 30px rgba(8,20,110,0.35)` }}>
            وصل لـ CITY STORE!
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: interpolate(frame - wev("hook.ultra"), [0, 1, 6], [0, 0.45, 0], clamp) }} />
      <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: (1 - ramp(frame, 0, 6)) * 0.6 }} />
    </SceneShell>
  );
};
