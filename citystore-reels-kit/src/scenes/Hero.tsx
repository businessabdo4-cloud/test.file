import React from "react";
import { Img, interpolate, staticFile } from "remotion";
import { COLORS, FONT } from "../brand";
import { IPHONE } from "../config";
import { lerp, pop, ramp, shake, sp } from "../anim";
import { useLayout } from "../layout";
import { ev, evList, PRODUCTS } from "../timeline";
import { LineIcon } from "../components/Icons";
import { PhoneArt } from "../components/PhoneArt";
import { SceneShell, useSceneFrame } from "../components/SceneShell";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
type Colour = (typeof IPHONE.colours)[number];

// Official Apple images (assets/products -> scripts/cutout_products.py -> public/products)
const pairImg = (c: Colour) => PRODUCTS[`iphone-18-pro-max_${c.name.toLowerCase()}_pair`];
const LINEUP = PRODUCTS["iphone-18-pro_lineup"];
const LINEUP_ASPECT = 631 / 737;
// Column of each phone in the lineup image (fractions of its width), order = IPHONE.colours
const LINEUP_COLS = [
  { c: 0.12, w: 0.14 },
  { c: 0.355, w: 0.12 },
  { c: 0.585, w: 0.12 },
  { c: 0.85, w: 0.16 },
];
const PAIR_ASPECT = 500 / 408;

/** Light sweep clipped to an image's own alpha. */
const MaskedSweep: React.FC<{ src: string; sweep: number }> = ({ src, sweep }) =>
  sweep > -0.3 && sweep < 1.3 ? (
    <div
      style={{
        position: "absolute",
        inset: 0,
        WebkitMaskImage: `url(${staticFile(src)})`,
        WebkitMaskSize: "100% 100%",
        mixBlendMode: "screen",
        background: `linear-gradient(105deg, rgba(255,255,255,0) ${sweep * 140 - 34}%, rgba(255,255,255,0.55) ${sweep * 140 - 17}%, rgba(255,255,255,0) ${sweep * 140}%)`,
      }}
    />
  ) : null;

/** 3.5-9.5 s HERO: iPhone 18 Pro Max pair (colour cycle + spec callouts), then the iPhone 18 Pro lineup. */
export const Hero: React.FC = () => {
  const frame = useSceneFrame("hero");
  const L = useLayout();
  const P = L.portrait;
  const lineupAt = LINEUP ? ev("hero.lineup") : Infinity;
  const phaseB = frame >= lineupAt;

  // ---- phase A: Pro Max pair, cycling through the colours we have official images for
  const order = ["Burgundy", "Black", "Silver", "Glacier"]
    .map((n) => IPHONE.colours.find((c) => c.name === n)!)
    .filter((c) => pairImg(c));
  const cycle = evList("hero.colourCycle");
  const changes = cycle.filter((f) => frame >= f).length;
  const idx = order.length ? Math.min(changes, order.length - 1) : 0;
  const cur = order[idx];
  const prev = order[Math.max(0, idx - 1)];
  const changeAt = idx > 0 ? cycle[idx - 1] : -100;
  const xfade = idx > 0 ? ramp(frame, changeAt, changeAt + 6) : 1;

  // ---- phase B: spotlight per colour on the lineup
  const spots = evList("hero.spot");
  const spotIdx = spots.filter((f) => frame >= f).length - 1;

  const activeColour: Colour = phaseB ? IPHONE.colours[Math.max(0, spotIdx)] : (cur ?? IPHONE.colours[3]);
  const activeSince = phaseB ? (spotIdx >= 0 ? spots[spotIdx] : lineupAt) : idx > 0 ? changeAt : ev("hero.swatches");

  const G = P
    ? {
        head: 236,
        headSize: 50,
        pair: { cx: 650, top: 350, w: 490 },
        lineup: { cx: 505, top: 305, w: 800 },
        sw: { y: 1012, cx: 505, size: 56 },
        calls: [
          { x: 40, y: 420, side: -1 },
          { x: 40, y: 610, side: -1 },
          { x: 40, y: 800, side: -1 },
        ],
        callW: 360,
      }
    : {
        head: 40,
        headSize: 38,
        pair: { cx: 400, top: 112, w: 330 },
        lineup: { cx: 540, top: 104, w: 610 },
        sw: { y: 640, cx: 540, size: 44 },
        calls: [
          { x: 640, y: 150, side: 1 },
          { x: 640, y: 320, side: 1 },
          { x: 640, y: 490, side: 1 },
        ],
        callW: 380,
      };

  const t = frame / 30;
  const dropShake = shake(frame, ev("hero.drop"), 10, 8);
  const lineupShake = shake(frame, lineupAt, 8, 7);
  const exitA = ramp(frame, lineupAt - 6, lineupAt + 2);

  // pair motion
  const enter = sp(frame, ev("hero.phones"), { damping: 13, stiffness: 90, mass: 0.9 });
  const floatY = Math.sin(t * Math.PI * 1.1) * 12;
  const rotY = lerp(35, -8, enter) + Math.sin(t * Math.PI * 0.6) * 6;
  const sweepStart = Math.max(ev("hero.drop"), changeAt);
  const sweepA = interpolate(frame, [sweepStart, sweepStart + 16], [-0.3, 1.3], clamp);
  const bump = idx > 0 ? interpolate(frame - changeAt, [0, 3, 9], [1, 1.035, 1], clamp) : 1;
  const pw = G.pair.w;
  const ph = pw * PAIR_ASPECT;

  const pairLayer = (c: Colour | undefined, op: number, key: string) => (
    <div key={key} style={{ position: "absolute", inset: 0, opacity: op }}>
      {c && pairImg(c) ? (
        <>
          <Img src={staticFile(pairImg(c))} style={{ width: "100%", height: "100%" }} />
          <MaskedSweep src={pairImg(c)} sweep={sweepA} />
        </>
      ) : (
        <div style={{ display: "flex", gap: pw * 0.04, justifyContent: "center" }}>
          <PhoneArt id={`fb-${key}`} model="pro-max" colour={IPHONE.colours[3]} view="back" width={pw * 0.48} sweep={sweepA} />
          <PhoneArt id={`fb2-${key}`} model="pro-max" colour={IPHONE.colours[3]} view="front" width={pw * 0.42} />
        </div>
      )}
    </div>
  );

  // lineup motion
  const lin = sp(frame, lineupAt, { damping: 14, stiffness: 120, mass: 0.8 });
  const lw = G.lineup.w;
  const lh = lw * LINEUP_ASPECT;
  const dim = phaseB && spotIdx >= 0 ? ramp(frame, spots[0] - 3, spots[0] + 3) : 0;
  const col = (i: number) => LINEUP_COLS[Math.max(0, Math.min(3, i))];
  const spotMove = spotIdx > 0 ? sp(frame, spots[spotIdx], { damping: 16, stiffness: 200 }) : 1;
  const from = col(spotIdx - 1), to = col(spotIdx);
  const cc = lerp(from.c, to.c, spotMove) * 100;
  const cw = lerp(from.w, to.w, spotMove) * 100;
  const sweepB = spotIdx >= 0 ? interpolate(frame, [spots[spotIdx], spots[spotIdx] + 12], [-0.3, 1.3], clamp) : interpolate(frame, [lineupAt, lineupAt + 16], [-0.3, 1.3], clamp);

  const headA = sp(frame, ev("hero.phones") + 2);
  const heading = (text: string, sub: string, op: number, ty: number) => (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: G.head,
        textAlign: "center",
        fontFamily: FONT,
        color: "#fff",
        opacity: op,
        transform: `translateY(${ty}px)`,
        textShadow: "0 4px 18px rgba(8,20,110,0.35)",
      }}
    >
      <span style={{ fontWeight: 900, fontSize: G.headSize }}>{text}</span>
      <span style={{ fontWeight: 600, fontSize: G.headSize * 0.62, marginLeft: 14, opacity: 0.85 }}>{sub}</span>
    </div>
  );

  return (
    <SceneShell id="hero" shakeX={dropShake.x + lineupShake.x} shakeY={dropShake.y + lineupShake.y}>
      {!phaseB && heading("iPhone 18 Pro Max", '6,9"', headA * (1 - exitA), (1 - headA) * -40)}
      {LINEUP && frame >= lineupAt - 2 && heading("iPhone 18 Pro", '6,3"', lin, (1 - lin) * -40)}

      {/* glow floor */}
      <div style={{ position: "absolute", left: (phaseB ? G.lineup.cx : G.pair.cx) - 520, top: (phaseB ? G.lineup.top : G.pair.top) + (phaseB ? lh : ph) * 0.55, width: 1040, height: 520, background: "radial-gradient(ellipse at center, rgba(255,255,255,0.3), rgba(255,255,255,0) 65%)", opacity: ramp(frame, ev("hero.drop") - 4, ev("hero.drop") + 6) }} />

      {/* PHASE A: Pro Max pair */}
      {exitA < 1 && (
        <div style={{ position: "absolute", inset: 0, perspective: 1400 }}>
          <div
            style={{
              position: "absolute",
              left: G.pair.cx - pw / 2,
              top: G.pair.top,
              width: pw,
              height: ph,
              transform: `translateY(${(1 - enter) * 900 + floatY}px) translateX(${-exitA * 500}px) rotateY(${rotY}deg) scale(${bump * lerp(1, 0.8, exitA)})`,
              opacity: 1 - exitA,
              filter: "drop-shadow(0 30px 40px rgba(6,14,90,0.45))",
            }}
          >
            {idx > 0 && xfade < 1 && pairLayer(prev, 1, "prev")}
            {pairLayer(cur, xfade, "cur")}
            {/* reflection */}
            {cur && pairImg(cur) && (
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: ph + 10,
                  width: pw,
                  height: ph,
                  transform: "scaleY(-1)",
                  opacity: 0.2,
                  WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 28%)",
                }}
              >
                <Img src={staticFile(pairImg(cur))} style={{ width: "100%", height: "100%" }} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* PHASE B: iPhone 18 Pro lineup with a sliding spotlight */}
      {LINEUP && frame >= lineupAt - 1 && (
        <div
          style={{
            position: "absolute",
            left: G.lineup.cx - lw / 2,
            top: G.lineup.top,
            width: lw,
            height: lh,
            transform: `translateY(${(1 - lin) * 500}px) scale(${lerp(0.82, 1, lin)})`,
            opacity: Math.min(1, lin * 1.5),
            filter: "drop-shadow(0 30px 40px rgba(6,14,90,0.45))",
          }}
        >
          <Img src={staticFile(LINEUP)} style={{ position: "absolute", width: "100%", height: "100%", filter: `brightness(${1 - 0.5 * dim}) saturate(${1 - 0.3 * dim})` }} />
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: dim,
              WebkitMaskImage: `linear-gradient(90deg, transparent ${cc - cw - 3}%, black ${cc - cw + 3}%, black ${cc + cw - 3}%, transparent ${cc + cw + 3}%)`,
            }}
          >
            <Img src={staticFile(LINEUP)} style={{ width: "100%", height: "100%", filter: "brightness(1.08)" }} />
            {spotIdx >= 0 && <MaskedSweep src={LINEUP} sweep={sweepB} />}
          </div>
          {spotIdx < 0 && <MaskedSweep src={LINEUP} sweep={sweepB} />}
        </div>
      )}

      {/* colour swatches (follow the colour on screen) */}
      <div style={{ position: "absolute", left: G.sw.cx - 300, width: 600, top: G.sw.y, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", gap: G.sw.size * 0.45 }}>
          {IPHONE.colours.map((c, i) => {
            const p = pop(frame, ev("hero.swatches") + i * 3);
            const active = c.name === activeColour.name && !(phaseB && spotIdx < 0);
            const a = active ? sp(frame, activeSince, { damping: 12, stiffness: 220 }) : 0;
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
            opacity: ramp(frame, ev("hero.swatches") + 6, ev("hero.swatches") + 14) * ramp(frame, activeSince, activeSince + 5, (x) => 0.35 + 0.65 * x),
            textShadow: "0 3px 12px rgba(8,20,110,0.4)",
          }}
        >
          {phaseB && spotIdx < 0 ? "4 COLORIS" : activeColour.name.toUpperCase()}
          {!(phaseB && spotIdx < 0) && activeColour.name === "Burgundy" ? (
            <span style={{ fontWeight: 600, fontSize: G.sw.size * 0.34, marginLeft: 12, opacity: 0.85, letterSpacing: 1 }}>NOUVEAU</span>
          ) : null}
        </div>
      </div>

      {/* spec callouts (phase A) */}
      {IPHONE.callouts.map((c, i) => {
        const s = [ev("hero.camera"), ev("hero.chip"), ev("hero.display")][i];
        const p = sp(frame, s, { damping: 15, stiffness: 170 });
        const pos = G.calls[i];
        const draw = ramp(frame, s + 2, s + 14);
        const out = ramp(frame, lineupAt - 8 + i * 2, lineupAt + i * 2);
        if (out >= 1) return null;
        return (
          <div
            key={c.value}
            style={{
              position: "absolute",
              left: pos.x,
              top: pos.y,
              width: G.callW,
              opacity: Math.min(1, p * 1.4) * (1 - out),
              transform: `translateX(${((1 - p) + out) * 260 * pos.side}px)`,
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
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: COLORS.white, opacity: Math.max(interpolate(frame - ev("hero.drop"), [0, 1, 5], [0, 0.25, 0], clamp), interpolate(frame - lineupAt, [0, 1, 6], [0, 0.3, 0], clamp)) }} />
    </SceneShell>
  );
};
