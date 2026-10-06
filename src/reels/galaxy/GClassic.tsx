import React from "react";
import { Img, interpolate, random, staticFile } from "remotion";
import { FONT } from "../../brand";
import { lerp, ramp, shake, sp } from "../../anim";
import { useLayout } from "../../layout";
import { Callout } from "../../components/Callout";
import { ProductImage } from "../../components/ProductImage";
import { SceneShell, useSceneFrame } from "../../components/SceneShell";
import { BEZEL, gev, gevList, IMG } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** The Watch8 Classic front image with its bezel ring rotating as a separate layer. */
const ClassicWithBezel: React.FC<{ width: number; angle: number; sweep: number }> = ({ width, angle, sweep }) => {
  const k = width / BEZEL.w;
  const cx = BEZEL.cx * k, cy = BEZEL.cy * k, r1 = BEZEL.r1 * k, r2 = BEZEL.r2 * k;
  const h = width * IMG.classicFront.aspect;
  return (
    <div style={{ position: "relative", width, height: h }}>
      <ProductImage src={IMG.classicFront.src} aspect={IMG.classicFront.aspect} width={width} sweep={sweep} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `rotate(${angle}deg)`,
          transformOrigin: `${cx}px ${cy}px`,
          WebkitMaskImage: `radial-gradient(circle at ${cx}px ${cy}px, transparent ${r1 - 1}px, #000 ${r1}px, #000 ${r2}px, transparent ${r2 + 1}px)`,
        }}
      >
        <Img src={staticFile(IMG.classicFront.src)} style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
};

/** 2.5-9.5 s Galaxy Watch8 Classic: rotating bezel, classic style, elegance (angled view), Gemini. */
export const GClassic: React.FC = () => {
  const frame = useSceneFrame("classic");
  const L = useLayout();
  const P = L.portrait;
  const G = P
    ? { head: 232, headSize: 50, watch: { cx: 700, top: 330, w: 400 }, calls: [430, 610, 790].map((y) => ({ x: 36, y })), side: -1 as const, callW: 300 }
    : { head: 40, headSize: 38, watch: { cx: 290, top: 110, w: 300 }, calls: [170, 340, 510].map((y) => ({ x: 560, y })), side: 1 as const, callW: 300 };
  const t = frame / 30;
  const enter = sp(frame, gev("classic.watch"), { damping: 13, stiffness: 95, mass: 0.9 });
  const clicks = gevList("classic.clicks");
  // each beat "clicks" the bezel 30 degrees with a springy overshoot
  const angle = clicks.reduce((a, c) => a + 30 * sp(frame, c, { damping: 9, stiffness: 260, mass: 0.5 }), 0);
  const toAngle = sp(frame, gev("classic.angle"), { damping: 15, stiffness: 120 });
  const sweepAt = [gev("classic.watch") + 8, gev("classic.style"), gev("classic.angle") + 6, gev("classic.gemini")].filter((s) => frame >= s).pop() ?? -100;
  const sweep = interpolate(frame, [sweepAt, sweepAt + 16], [-0.3, 1.3], clamp);
  const head = sp(frame, gev("classic.head"));
  const sk = shake(frame, gev("classic.watch") + 6, 10, 8);
  const floatY = Math.sin(t * Math.PI * 1.1) * 10;
  const w = G.watch.w;
  const front = (
    <div style={{ position: "absolute", left: G.watch.cx - w / 2, top: G.watch.top, opacity: 1 - toAngle, transform: `rotateY(${lerp(0, -70, toAngle)}deg) scale(${lerp(1, 0.85, toAngle)})` }}>
      <ClassicWithBezel width={w} angle={angle} sweep={sweep} />
    </div>
  );
  const aw = w * 1.08;
  const angled = toAngle > 0.01 && (
    <div style={{ position: "absolute", left: G.watch.cx - aw / 2, top: G.watch.top - 10, opacity: toAngle, transform: `rotateY(${lerp(60, 0, toAngle)}deg) rotateZ(${Math.sin(t * Math.PI * 0.7) * 2}deg)` }}>
      <ProductImage src={IMG.classicAngle.src} aspect={IMG.classicAngle.aspect} width={aw} sweep={sweep} />
    </div>
  );
  // Gemini sparkles
  const sparkles = Array.from({ length: 14 }).map((_, i) => {
    const s = gev("classic.gemini") + i * 1.4;
    const k = (frame - s) / 16;
    if (k < 0 || k > 1) return null;
    const a = random(`gs-a-${i}`) * Math.PI * 2;
    const r = w * (0.45 + random(`gs-r-${i}`) * 0.35);
    const size = (22 + random(`gs-z-${i}`) * 34) * Math.sin(Math.PI * k);
    const x = G.watch.cx + Math.cos(a) * r;
    const y = G.watch.top + w * 0.75 + Math.sin(a) * r;
    return (
      <svg key={i} viewBox="-10 -10 20 20" style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, transform: `rotate(${k * 90}deg)` }}>
        <path d="M0 -10 C1 -3 3 -1 10 0 C3 1 1 3 0 10 C-1 3 -3 1 -10 0 C-3 -1 -1 -3 0 -10 Z" fill={i % 3 ? "#fff" : "#9EC5FF"} />
      </svg>
    );
  });

  return (
    <SceneShell id="classic" shakeX={sk.x} shakeY={sk.y}>
      <div style={{ position: "absolute", left: 0, right: P ? 70 : 0, top: G.head, textAlign: P ? "center" : "left", paddingLeft: P ? 0 : 40, fontFamily: FONT, color: "#fff", opacity: head, transform: `translateY(${(1 - head) * -40}px)`, textShadow: "0 4px 18px rgba(8,20,110,0.35)" }}>
        <span style={{ fontWeight: 900, fontSize: G.headSize }}>Galaxy Watch8 Classic</span>
        <span style={{ fontWeight: 600, fontSize: G.headSize * 0.62, marginLeft: 14, opacity: 0.85 }}>46 mm</span>
      </div>
      <div style={{ position: "absolute", left: G.watch.cx - 520, top: G.watch.top + w * 0.8, width: 1040, height: 560, background: "radial-gradient(ellipse at center, rgba(255,255,255,0.3), rgba(255,255,255,0) 65%)", opacity: ramp(frame, gev("classic.watch"), gev("classic.watch") + 10) }} />
      <div style={{ position: "absolute", inset: 0, perspective: 1400, transform: `translateY(${(1 - enter) * 1000 + floatY}px)`, filter: "drop-shadow(0 34px 44px rgba(6,14,90,0.5))" }}>
        {front}
        {angled}
      </div>
      {sparkles}
      <Callout frame={frame} at={gev("classic.bezel")} icon="bezel" value="Lunette rotative" label="Le classique Galaxy" x={G.calls[0].x} y={G.calls[0].y} width={G.callW} side={G.side} />
      <Callout frame={frame} at={gev("classic.style")} icon="watch" value="Style classique" label="Boîtier en acier" x={G.calls[1].x} y={G.calls[1].y} width={G.callW} side={G.side} />
      <Callout frame={frame} at={gev("classic.gemini")} icon="spark" value="Gemini" label="L'IA de Google au poignet" x={G.calls[2].x} y={G.calls[2].y} width={G.callW} side={G.side} />
    </SceneShell>
  );
};
