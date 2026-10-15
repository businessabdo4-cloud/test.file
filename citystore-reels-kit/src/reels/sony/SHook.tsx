import React from "react";
import { interpolate, random } from "remotion";
import { COLORS, FONT } from "../../brand";
import { pop, ramp, shake, slam } from "../../anim";
import { useLayout } from "../../layout";
import { IconName, LineIcon } from "../../components/Icons";
import { SceneShell, useSceneFrame } from "../../components/SceneShell";
import { sev } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/*
 * 0.0-3.5 s HOOK (noise -> silence)
 * visual: noise words + icons pop in shaking with sound-wave rings; headphones drop onto Citybot on "وانت؟";
 *         on "ما سامع والو!" a white flash wipes the noise away and an ANC line flattens
 * written: "كلاكسونات!" / "جيران كيغوتو!" / "طوبيس عامر!" -> "وانت؟" -> "ما سامع والو!"
 * verbal: VO lines 1-2 (with horn / crowd / bus SFX under them that cut to silence)
 */
export const SHook: React.FC = () => {
  const frame = useSceneFrame("hook");
  const L = useLayout();
  const P = L.portrait;
  const silence = sev("hook.silence");
  const you = sev("hook.you");
  const noiseOn = frame < silence;
  const wipe = ramp(frame, silence, silence + 6);
  const NOISE: { at: number; text: string; icon: IconName; x: number; y: number; rot: number }[] = P
    ? [
        { at: sev("hook.horn"), text: "كلاكسونات!", icon: "car", x: 70, y: 250, rot: -8 },
        { at: sev("hook.neighbours"), text: "جيران كيغوتو!", icon: "shout", x: 420, y: 420, rot: 6 },
        { at: sev("hook.bus"), text: "طوبيس عامر!", icon: "bus", x: 90, y: 600, rot: -5 },
      ]
    : [
        { at: sev("hook.horn"), text: "كلاكسونات!", icon: "car", x: 40, y: 60, rot: -8 },
        { at: sev("hook.neighbours"), text: "جيران كيغوتو!", icon: "shout", x: 560, y: 150, rot: 6 },
        { at: sev("hook.bus"), text: "طوبيس عامر!", icon: "bus", x: 60, y: 300, rot: -5 },
      ];
  const fs = P ? 54 : 40;
  // global jitter while it's noisy (grows with each noise source)
  const level = NOISE.filter((n) => frame >= n.at).length;
  const jx = noiseOn ? (random(`jx-${frame}`) - 0.5) * level * 7 : 0;
  const jy = noiseOn ? (random(`jy-${frame}`) - 0.5) * level * 7 : 0;
  const sk = shake(frame, silence, 16, 8);
  const youP = slam(frame, you, 2.2);
  const quiet = slam(frame, silence + 1, 2.4);
  const center: React.CSSProperties = { position: "absolute", left: 0, right: P ? 70 : 0, display: "flex", justifyContent: "center" };

  return (
    <SceneShell id="hook" shakeX={jx + sk.x} shakeY={jy + sk.y}>
      {/* red-ish noise tint that drains away on the silence */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 40%, rgba(255,60,90,0.28), rgba(255,60,90,0) 70%)", opacity: noiseOn ? 0.35 + 0.2 * level : 0 }} />
      {NOISE.map((n, i) => {
        if (frame < n.at) return null;
        const p = pop(frame, n.at);
        const wob = Math.sin(frame * 1.7 + i) * 4;
        const out = (1 - wipe) * (frame >= you ? 0.45 : 1); // step back when "وانت؟" lands
        // sound-wave rings pulsing out of each noise source
        const rings = [0, 1, 2].map((k) => {
          const t = ((frame - n.at) / 14 + k / 3) % 1;
          return <div key={k} style={{ position: "absolute", left: 60 - 40 * t * 2, top: 50 - 40 * t * 2, width: 80 + 160 * t, height: 80 + 160 * t, borderRadius: "50%", border: "4px solid rgba(255,255,255,0.7)", opacity: (1 - t) * 0.6 }} />;
        });
        return (
          <div key={i} style={{ position: "absolute", left: n.x, top: n.y, opacity: out, transform: `scale(${p * (0.6 + 0.4 * out) * (frame >= you ? 0.8 : 1)}) rotate(${n.rot + wob}deg)`, filter: wipe > 0 ? `blur(${wipe * 10}px)` : undefined }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 18 }}>
              <div style={{ position: "relative", width: 140, height: 140, borderRadius: 36, background: "rgba(255,255,255,0.2)", border: "3px solid rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {rings}
                <LineIcon name={n.icon} size={96} stroke={6} />
              </div>
              <div dir="rtl" style={{ fontFamily: FONT, fontWeight: 900, fontSize: fs, color: "#fff", background: "#FF3B5C", padding: `0 ${fs * 0.45}px ${fs * 0.12}px`, borderRadius: fs * 0.3, boxShadow: "0 10px 26px rgba(80,0,20,0.35)", whiteSpace: "nowrap" }}>
                {n.text}
              </div>
            </div>
          </div>
        );
      })}
      {/* "وانت؟" */}
      {frame >= you && (
        <div style={{ ...center, top: P ? 240 : 40, opacity: 1 - ramp(frame, silence, silence + 3) }}>
          <div dir="rtl" style={{ ...youP, fontFamily: FONT, fontWeight: 900, fontSize: P ? 120 : 84, color: "#fff", textShadow: "0 10px 34px rgba(8,20,110,0.45)" }}>وانت؟</div>
        </div>
      )}
      {/* "ما سامع والو!" + ANC flat line */}
      {frame >= silence && (
        <>
          <div style={{ ...center, top: P ? 300 : 60 }}>
            <div dir="rtl" style={{ ...quiet, fontFamily: FONT, fontWeight: 900, fontSize: P ? 128 : 92, color: "#fff", lineHeight: 1.25, textShadow: "0 10px 34px rgba(8,20,110,0.45)" }}>ما سامع والو!</div>
          </div>
          <svg viewBox="0 0 1000 120" style={{ position: "absolute", left: P ? 40 : 90, width: P ? 930 : 900, top: P ? 520 : 230, height: 120 }}>
            {(() => {
              const k = interpolate(frame, [silence, silence + 18], [1, 0], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
              const d = Array.from({ length: 101 }, (_, i) => {
                const x = i * 10;
                const y = 60 + Math.sin(i * 0.9 + frame * 0.6) * 46 * k * Math.sin((i / 100) * Math.PI);
                return `${i ? "L" : "M"}${x} ${y.toFixed(1)}`;
              }).join(" ");
              return <path d={d} fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />;
            })()}
          </svg>
          <div style={{ ...center, top: P ? 650 : 360 }}>
            <div style={{ opacity: ramp(frame, silence + 8, silence + 14), fontFamily: FONT, fontWeight: 800, fontSize: P ? 34 : 26, color: COLORS.blue, background: "#fff", padding: "6px 22px", borderRadius: 999, letterSpacing: 4 }}>
              SILENCE.
            </div>
          </div>
        </>
      )}
      <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: interpolate(frame - silence, [0, 1, 7], [0, 0.85, 0], clamp) }} />
      <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: (1 - ramp(frame, 0, 6)) * 0.5 }} />
    </SceneShell>
  );
};
