import React from "react";
import { interpolate } from "remotion";
import { COLORS, FONT } from "../brand";
import { IPHONE } from "../config";
import { lerp, pop, ramp, shake, sp } from "../anim";
import { useLayout } from "../layout";
import { ev, evList } from "../timeline";
import { LineIcon } from "../components/Icons";
import { PhoneArt } from "../components/PhoneArt";
import { SceneShell, useSceneFrame } from "../components/SceneShell";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const colourByName = (n: string) => IPHONE.colours.find((c) => c.name === n)!;

/** 3.5-9.5 s HERO PRODUCT: iPhone 18 Pro + Pro Max floating, swatches, spec callouts. */
export const Hero: React.FC = () => {
  const frame = useSceneFrame("hero");
  const L = useLayout();
  const P = L.portrait;
  const cycle = evList("hero.colourCycle");
  const idx = cycle.filter((f) => frame >= f).length; // 0 before the first change
  const cur = colourByName(IPHONE.colourOrder[idx]);
  const prev = colourByName(IPHONE.colourOrder[Math.max(0, idx - 1)]);
  const changeAt = idx > 0 ? cycle[idx - 1] : -100;
  const xfade = idx > 0 ? ramp(frame, changeAt, changeAt + 6) : 1;
  const sweepStart = Math.max(ev("hero.drop"), changeAt);
  const sweep = interpolate(frame, [sweepStart, sweepStart + 16], [-0.3, 1.3], clamp);

  const G = P
    ? { head: 236, headSize: 46, pro: { cx: 330, top: 420, w: 250 }, max: { cx: 640, top: 345, w: 300 }, sw: { y: 1012, cx: 540, size: 58 }, refl: 1 }
    : { head: 44, headSize: 34, pro: { cx: 225, top: 160, w: 170 }, max: { cx: 430, top: 112, w: 205 }, sw: { y: 700, cx: 330, size: 44 }, refl: 0.7 };
  const callPos = P
    ? [
        { x: 60, y: 450, side: -1 },
        { x: 600, y: 640, side: 1 },
        { x: 60, y: 830, side: -1 },
      ]
    : [
        { x: 640, y: 150, side: 1 },
        { x: 640, y: 320, side: 1 },
        { x: 640, y: 490, side: 1 },
      ];
  const callW = P ? 350 : 380;
  const callStarts = [ev("hero.camera"), ev("hero.chip"), ev("hero.display")];

  const dropShake = shake(frame, ev("hero.drop"), 10, 8);
  const t = frame / 30;

  const phone = (which: "pro" | "max") => {
    const g = which === "pro" ? G.pro : G.max;
    const delay = which === "pro" ? 4 : 0;
    const enter = sp(frame, ev("hero.phones") + delay, { damping: 13, stiffness: 90, mass: 0.9 });
    const floatY = Math.sin(t * Math.PI * 1.1 + (which === "pro" ? 1.2 : 0)) * 12;
    const rotY = lerp(which === "pro" ? -70 : 70, which === "pro" ? 16 : -16, enter) + Math.sin(t * Math.PI * 0.6 + (which === "pro" ? 0 : 2)) * 8;
    const ty = (1 - enter) * 900 + floatY;
    const model = which === "pro" ? "pro" : "pro-max";
    const view = which === "pro" ? "front" : "back";
    const art = (c: typeof cur, op: number, key: string) => (
      <div key={key} style={{ position: "absolute", inset: 0, opacity: op }}>
        <PhoneArt id={`${which}-${key}`} model={model} colour={c} view={view} width={g.w} sweep={sweep} />
      </div>
    );
    const h = g.w * 2.06;
    return (
      <div
        style={{
          position: "absolute",
          left: g.cx - g.w / 2,
          top: g.top,
          width: g.w,
          height: h,
          transform: `translateY(${ty}px) rotateY(${rotY}deg) rotateZ(${which === "pro" ? -4 : 5}deg)`,
          transformStyle: "preserve-3d",
          filter: "drop-shadow(0 30px 40px rgba(6,14,90,0.45))",
        }}
      >
        {idx > 0 && xfade < 1 && art(prev, 1, "prev")}
        {art(cur, xfade, "cur")}
        {/* reflection */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: h + 14,
            width: g.w,
            height: h,
            transform: "scaleY(-1)",
            opacity: 0.22 * G.refl,
            WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 30%)",
            maskImage: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 30%)",
          }}
        >
          <PhoneArt id={`${which}-refl`} model={model} colour={cur} view={view} width={g.w} />
        </div>
      </div>
    );
  };

  const head = sp(frame, ev("hero.phones") + 2);
  return (
    <SceneShell id="hero" shakeX={dropShake.x} shakeY={dropShake.y}>
      {/* heading */}
      <div
        style={{
          position: "absolute",
          left: P ? 0 : 40,
          right: P ? 0 : undefined,
          top: G.head,
          textAlign: "center",
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: G.headSize,
          color: "#fff",
          opacity: head,
          transform: `translateY(${(1 - head) * -40}px)`,
          letterSpacing: 0.5,
          textShadow: "0 4px 18px rgba(8,20,110,0.35)",
        }}
      >
        iPhone 18 Pro <span style={{ opacity: 0.6, fontWeight: 600 }}>·</span> iPhone 18 Pro Max
      </div>

      {/* glow floor */}
      <div style={{ position: "absolute", left: G.max.cx - 520, top: G.max.top + G.max.w * 1.4, width: 900, height: 500, background: "radial-gradient(ellipse at center, rgba(255,255,255,0.28), rgba(255,255,255,0) 65%)", opacity: ramp(frame, ev("hero.drop") - 4, ev("hero.drop") + 6) }} />

      <div style={{ position: "absolute", inset: 0, perspective: 1400 }}>
        {phone("pro")}
        {phone("max")}
      </div>

      {/* colour swatches */}
      <div style={{ position: "absolute", left: G.sw.cx - 300, width: 600, top: G.sw.y, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", gap: G.sw.size * 0.45 }}>
          {IPHONE.colours.map((c, i) => {
            const p = pop(frame, ev("hero.swatches") + i * 3);
            const active = c.name === cur.name;
            const a = active ? sp(frame, idx > 0 ? changeAt : ev("hero.swatches"), { damping: 12, stiffness: 220 }) : 0;
            return (
              <div
                key={c.name}
                style={{
                  width: G.sw.size,
                  height: G.sw.size,
                  borderRadius: "50%",
                  background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.55), rgba(255,255,255,0) 45%), ${c.hex}`,
                  transform: `scale(${p * (1 + 0.22 * a)})`,
                  boxShadow: `0 0 0 ${3 + a * 4}px rgba(255,255,255,${0.45 + a * 0.55}), 0 8px 18px rgba(6,14,90,0.35)`,
                }}
              />
            );
          })}
        </div>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: G.sw.size * 0.5,
            color: "#fff",
            letterSpacing: 3,
            opacity: ramp(frame, ev("hero.swatches") + 6, ev("hero.swatches") + 14) * (idx > 0 ? 0.4 + 0.6 * xfade : 1),
            textShadow: "0 3px 12px rgba(8,20,110,0.4)",
          }}
        >
          {cur.name.toUpperCase()}
          {cur.name === "Burgundy" ? <span style={{ fontWeight: 600, fontSize: G.sw.size * 0.34, marginLeft: 12, opacity: 0.85, letterSpacing: 1 }}>NOUVEAU</span> : null}
        </div>
      </div>

      {/* spec callouts */}
      {IPHONE.callouts.map((c, i) => {
        const s = callStarts[i];
        const p = sp(frame, s, { damping: 15, stiffness: 170 });
        const pos = callPos[i];
        const draw = ramp(frame, s + 2, s + 14);
        return (
          <div
            key={c.value}
            style={{
              position: "absolute",
              left: pos.x,
              top: pos.y,
              width: callW,
              opacity: Math.min(1, p * 1.4),
              transform: `translateX(${(1 - p) * 220 * pos.side}px)`,
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "14px 22px 14px 16px",
              borderRadius: 28,
              background: "rgba(255,255,255,0.16)",
              border: "2px solid rgba(255,255,255,0.55)",
              backdropFilter: "blur(14px)",
              boxShadow: "0 12px 30px rgba(6,14,90,0.25)",
            }}
          >
            <div style={{ width: 66, height: 66, borderRadius: 20, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <LineIcon name={c.icon} size={50} progress={draw} stroke={6} />
            </div>
            <div style={{ fontFamily: FONT, color: "#fff", lineHeight: 1.05 }}>
              <div style={{ fontWeight: 900, fontSize: 38, whiteSpace: "nowrap" }}>{c.value}</div>
              <div style={{ fontWeight: 600, fontSize: 24, opacity: 0.9, whiteSpace: "nowrap" }}>{c.label}</div>
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: COLORS.white, opacity: interpolate(frame - ev("hero.drop"), [0, 1, 5], [0, 0.25, 0], clamp) }} />
    </SceneShell>
  );
};
