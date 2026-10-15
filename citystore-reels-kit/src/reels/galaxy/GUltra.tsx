import React from "react";
import { interpolate } from "remotion";
import { FONT } from "../../brand";
import { lerp, ramp, shake, slam, sp } from "../../anim";
import { useLayout } from "../../layout";
import { Callout } from "../../components/Callout";
import { ProductImage } from "../../components/ProductImage";
import { Burst, SceneShell, useSceneFrame } from "../../components/SceneShell";
import { gev, IMG } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 9.5-13.0 s "وللي بغا المغامرة" kinetic title -> Galaxy Watch Ultra2 slams in -> titanium. */
export const GUltra: React.FC = () => {
  const frame = useSceneFrame("ultra");
  const L = useLayout();
  const P = L.portrait;
  const G = P
    ? { kin: 420, kinSize: 150, head: 232, headSize: 52, watch: { cx: 650, top: 330, w: 380 }, call: { x: 36, y: 520 }, callW: 300, side: -1 as const }
    : { kin: 220, kinSize: 120, head: 40, headSize: 40, watch: { cx: 300, top: 140, w: 260 }, call: { x: 560, y: 300 }, callW: 300, side: 1 as const };
  const wAt = gev("ultra.watch");
  const k1 = slam(frame, gev("ultra.adventure"), 1.8);
  const k2 = slam(frame, gev("ultra.adventure") + 8, 2.4);
  const kOut = ramp(frame, wAt - 6, wAt + 2);
  const enter = sp(frame, wAt, { damping: 11, stiffness: 120, mass: 0.8 });
  const sk = shake(frame, wAt, 20, 10);
  const sweep = interpolate(frame, [gev("ultra.titanium"), gev("ultra.titanium") + 16], [-0.3, 1.3], clamp);
  const head = sp(frame, wAt + 2);
  const t = frame / 30;
  const w = G.watch.w;
  return (
    <SceneShell id="ultra" shakeX={sk.x} shakeY={sk.y}>
      <Burst x={P ? 505 : 540} y={P ? 560 : 330} r={P ? 950 : 640} rot={frame * 0.7} opacity={0.12 + 0.18 * (1 - kOut)} />
      {kOut < 1 && (
        <div style={{ position: "absolute", left: 0, right: P ? 70 : 0, top: G.kin, display: "flex", flexDirection: "column", alignItems: "center", opacity: 1 - kOut, transform: `scale(${lerp(1, 0.6, kOut)})` }}>
          <div dir="rtl" style={{ ...k1, fontFamily: FONT, fontWeight: 800, fontSize: G.kinSize * 0.42, color: "#fff" }}>وللي بغا</div>
          <div dir="rtl" style={{ ...k2, fontFamily: FONT, fontWeight: 900, fontSize: G.kinSize, color: "#fff", lineHeight: 1.3, textShadow: "0 10px 34px rgba(8,20,110,0.4)" }}>المغامرة</div>
          <div style={{ ...k2, fontFamily: FONT, fontWeight: 800, fontSize: G.kinSize * 0.28, color: "#fff", letterSpacing: 6, opacity: 0.85 }}>POUR L'AVENTURE</div>
        </div>
      )}
      {frame >= wAt - 1 && (
        <>
          <div style={{ position: "absolute", left: 0, right: P ? 70 : 0, top: G.head, textAlign: P ? "center" : "left", paddingLeft: P ? 0 : 40, fontFamily: FONT, fontWeight: 900, fontSize: G.headSize, color: "#fff", opacity: head, transform: `translateY(${(1 - head) * -40}px)`, textShadow: "0 4px 18px rgba(8,20,110,0.35)" }}>
            Galaxy Watch Ultra2
          </div>
          <div style={{ position: "absolute", left: G.watch.cx - 520, top: G.watch.top + w * 0.9, width: 1040, height: 560, background: "radial-gradient(ellipse at center, rgba(255,140,40,0.25), rgba(255,255,255,0) 65%)", opacity: enter }} />
          <div style={{ position: "absolute", left: G.watch.cx - w / 2, top: G.watch.top, transform: `translateY(${(1 - enter) * 1100 + Math.sin(t * Math.PI * 1.1) * 10}px) scale(${lerp(1.3, 1, enter)}) rotate(${lerp(-12, 0, enter)}deg)`, filter: "drop-shadow(0 34px 44px rgba(6,14,90,0.5))" }}>
            <ProductImage src={IMG.ultraFront.src} aspect={IMG.ultraFront.aspect} width={w} sweep={sweep} />
          </div>
          <Callout frame={frame} at={gev("ultra.titanium")} icon="seal" value="Titane" label="Boîtier en titane" x={G.call.x} y={G.call.y} width={G.callW} side={G.side} />
        </>
      )}
    </SceneShell>
  );
};
