import React from "react";
import { interpolate } from "remotion";
import { COLORS, FONT } from "../brand";
import { pop, ramp, shake, slam } from "../anim";
import { useLayout } from "../layout";
import { ev } from "../timeline";
import { Burst, SceneShell, SweepText, useSceneFrame } from "../components/SceneShell";

/*
 * 0.0-3.5 s HOOK
 * visual hook: Citybot jumps in, face-screen flash, light burst + camera shake on every slam
 * written hook: NOUVEAU -> "iPhone 18 Pro" slam + light sweep -> "& Pro Max" -> "DISPO CHEZ CITY STORE" stamp
 * verbal hook: VO line 1 "Les iPhone 18 Pro et Pro Max sont chez City Store !"
 */
export const Hook: React.FC = () => {
  const frame = useSceneFrame("hook");
  const L = useLayout();
  const P = L.portrait;
  const y = P
    ? { tag: 236, title1: 300, title2: 432, proMax: 664, stamp: 748, burst: 520 }
    : { tag: 52, title1: 104, title2: 196, proMax: 356, stamp: 426, burst: 300 };
  const fs = P ? { tag: 40, t1: 150, t2: 214, pm: 66, st: 46 } : { tag: 30, t1: 104, t2: 150, pm: 48, st: 34 };

  const sk = [shake(frame, ev("hook.title"), 22), shake(frame, ev("hook.proMax"), 12), shake(frame, ev("hook.stamp"), 16), shake(frame, 12, 10)];
  const sx = sk.reduce((a, s) => a + s.x, 0);
  const sy = sk.reduce((a, s) => a + s.y, 0);

  const tag = pop(frame, 0);
  const t1 = slam(frame, ev("hook.title"), 2.6);
  const t2 = slam(frame, ev("hook.title") + 3, 2.4);
  const pm = slam(frame, ev("hook.proMax"), 2);
  const st = slam(frame, ev("hook.stamp"), 2.4);
  const sweep = interpolate(frame, [ev("hook.sweep"), ev("hook.sweep") + 14], [-0.3, 1.3], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const glow = interpolate(frame - ev("hook.title"), [0, 2, 16], [0, 1, 0.35], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const center: React.CSSProperties = { position: "absolute", left: 0, right: 0, display: "flex", justifyContent: "center" };
  const heavy: React.CSSProperties = { fontFamily: FONT, fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: -2, textShadow: "0 8px 30px rgba(8,20,110,0.35)" };

  return (
    <SceneShell id="hook" shakeX={sx} shakeY={sy}>
      <Burst x={L.w / 2 - (P ? 35 : 0)} y={y.burst} r={P ? 900 : 640} rot={frame * 0.6} opacity={0.18 + glow * 0.25} />
      <div style={{ position: "absolute", left: 0, right: 0, top: y.burst - 300, height: 600, background: "radial-gradient(ellipse at center, rgba(255,255,255,0.35), rgba(255,255,255,0) 60%)", opacity: glow }} />

      {/* NOUVEAU tag */}
      <div style={{ ...center, top: y.tag }}>
        <div
          style={{
            transform: `scale(${tag}) rotate(${(1 - tag) * -10}deg)`,
            background: "#fff",
            color: COLORS.blue,
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: fs.tag,
            letterSpacing: 6,
            padding: `${fs.tag * 0.25}px ${fs.tag * 0.7}px`,
            borderRadius: 999,
            boxShadow: "0 8px 24px rgba(8,20,110,0.3)",
          }}
        >
          NOUVEAU
        </div>
      </div>

      {/* iPhone / 18 Pro */}
      <div style={{ ...center, top: y.title1, ...t1 }}>
        <SweepText text="iPhone" sweep={sweep} style={{ ...heavy, fontSize: fs.t1 }} />
      </div>
      <div style={{ ...center, top: y.title2, ...t2 }}>
        <SweepText text="18 Pro" sweep={sweep - 0.15} style={{ ...heavy, fontSize: fs.t2, letterSpacing: -4 }} />
      </div>

      {/* & Pro Max */}
      <div style={{ ...center, top: y.proMax, ...pm }}>
        <div style={{ ...heavy, fontSize: fs.pm, letterSpacing: 1, fontWeight: 800 }}>
          &amp; <span style={{ fontWeight: 900 }}>Pro Max</span>
        </div>
      </div>

      {/* DISPO stamp */}
      <div style={{ ...center, top: y.stamp }}>
        <div style={{ ...st, transform: `${st.transform} rotate(-5deg)` }}>
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: fs.st,
              color: COLORS.blue,
              background: "#fff",
              padding: `${fs.st * 0.3}px ${fs.st * 0.6}px`,
              borderRadius: fs.st * 0.35,
              letterSpacing: 1,
              boxShadow: `0 0 0 ${fs.st * 0.12}px rgba(255,255,255,0.35), 0 12px 30px rgba(8,20,110,0.35)`,
            }}
          >
            DISPO CHEZ CITY STORE
          </div>
        </div>
      </div>

      {/* hook flash on the first slam */}
      <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: interpolate(frame - ev("hook.title"), [0, 1, 6], [0, 0.45, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />
      <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: (1 - ramp(frame, 0, 6)) * 0.6 }} />
    </SceneShell>
  );
};
