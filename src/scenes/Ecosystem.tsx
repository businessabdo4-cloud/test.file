import React from "react";
import { Img, interpolate, staticFile } from "remotion";
import { FONT } from "../brand";
import { lerp, pop, ramp, slam, sp } from "../anim";
import { useLayout } from "../layout";
import { ev, evList, PRODUCTS, scene } from "../timeline";
import { IconName, LineIcon } from "../components/Icons";
import { SceneShell, useSceneFrame } from "../components/SceneShell";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
// Official images (if supplied) replace the icon via a morph; otherwise the animated line-icon stays.
const CATS: { label: string; icon: IconName; img: string }[] = [
  { label: "LAPTOPS", icon: "laptop", img: "laptop" },
  { label: "MONTRES", icon: "watch", img: "smartwatch" },
  { label: "CASQUES", icon: "headphones", img: "headphones" },
  { label: "CONSOLES", icon: "controller", img: "console" },
  { label: "CAMÉRAS", icon: "camera", img: "camera" },
];

/** 9.5-15.5 s ECOSYSTEM: one card per spoken category, cut on the beat, then a recap grid. */
export const Ecosystem: React.FC = () => {
  const frame = useSceneFrame("ecosystem");
  const L = useLayout();
  const P = L.portrait;
  const cards = evList("eco.cards");
  const recap = ev("eco.recap");
  const G = P
    ? { head: 236, headSize: 58, cx: 505, cy: 640, tile: 540, icon: 360, label: 112, labelY: 950, rTile: 250, rIcon: 150, rLabel: 32, rTop: 400 }
    : { head: 44, headSize: 44, cx: 540, cy: 380, tile: 400, icon: 270, label: 84, labelY: 610, rTile: 190, rIcon: 112, rLabel: 26, rTop: 150 };

  const k = frame >= recap ? -1 : cards.filter((f) => frame >= f).length - 1;
  const head = slam(frame, scene("ecosystem").from, 1.8);
  const recapOn = sp(frame, recap, { damping: 15, stiffness: 150 });

  let card: React.ReactNode = null;
  if (k >= 0) {
    const c = CATS[k];
    const s = cards[k];
    const enter = sp(frame, s, { damping: 11, stiffness: 230, mass: 0.6 });
    const draw = ramp(frame, s, s + 9);
    const img = PRODUCTS[c.img];
    const morph = img ? ramp(frame, s + 9, s + 15) : 0;
    const flash = interpolate(frame - s, [0, 1, 5], [0, 0.22, 0], clamp);
    card = (
      <>
        <div
          style={{
            position: "absolute",
            left: G.cx - G.tile / 2,
            top: G.cy - G.tile / 2,
            width: G.tile,
            height: G.tile,
            borderRadius: G.tile * 0.16,
            background: "rgba(255,255,255,0.14)",
            border: "3px solid rgba(255,255,255,0.5)",
            boxShadow: "0 30px 60px rgba(6,14,90,0.3), inset 0 0 80px rgba(255,255,255,0.12)",
            transform: `scale(${lerp(1.35, 1, enter)}) rotate(${lerp(-7, 0, enter) * (k % 2 ? -1 : 1)}deg)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ position: "absolute", opacity: 1 - morph, transform: `scale(${1 + morph * 0.3})` }}>
            <LineIcon name={c.icon} size={G.icon} progress={draw} stroke={4.5} glow />
          </div>
          {img && (
            <Img src={staticFile(img)} style={{ position: "absolute", width: "86%", height: "86%", objectFit: "contain", opacity: morph, transform: `scale(${lerp(0.8, 1, morph)})` }} />
          )}
          <div style={{ position: "absolute", top: G.tile * 0.05, right: G.tile * 0.07, fontFamily: FONT, fontWeight: 800, fontSize: G.tile * 0.06, color: "#fff", opacity: 0.8 }}>
            0{k + 1}/05
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, width: G.cx * 2, top: G.labelY, display: "flex", justifyContent: "center" }}>
          <div style={{ ...slam(frame, s + 1, 1.9), fontFamily: FONT, fontWeight: 900, fontSize: G.label, color: "#fff", letterSpacing: 2, textShadow: "0 8px 30px rgba(8,20,110,0.35)" }}>
            {c.label}
          </div>
        </div>
        <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: flash }} />
      </>
    );
  }

  const cols = 3;
  return (
    <SceneShell id="ecosystem">
      <div style={{ position: "absolute", left: 0, width: P ? 1010 : 1080, top: G.head, display: "flex", justifyContent: "center" }}>
        <div style={{ ...head, fontFamily: FONT, fontWeight: 900, fontSize: G.headSize, color: "#fff", textAlign: "center", lineHeight: 1.05, textShadow: "0 6px 24px rgba(8,20,110,0.35)" }}>
          {frame < recap ? (
            "ET AUSSI…"
          ) : (
            <span style={{ display: "inline-block", ...slam(frame, recap, 1.6) }}>
              TOUTE LA TECH
              <br />
              CHEZ CITY STORE
            </span>
          )}
        </div>
      </div>
      {card}
      {frame >= recap && (
        <div style={{ position: "absolute", left: G.cx - (cols * G.rTile + (cols - 1) * 26) / 2, top: G.rTop, width: cols * G.rTile + (cols - 1) * 26, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 26, opacity: recapOn }}>
          {CATS.map((c, i) => {
            const p = pop(frame, recap + i * 3);
            return (
              <div key={c.label} style={{ width: G.rTile, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, transform: `scale(${p}) translateY(${(1 - p) * 40}px)` }}>
                <div style={{ width: G.rTile, height: G.rTile, borderRadius: G.rTile * 0.2, background: "rgba(255,255,255,0.14)", border: "3px solid rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {PRODUCTS[c.img] ? (
                    <Img src={staticFile(PRODUCTS[c.img])} style={{ width: "84%", height: "84%", objectFit: "contain" }} />
                  ) : (
                    <LineIcon name={c.icon} size={G.rIcon} stroke={5} />
                  )}
                </div>
                <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: G.rLabel, color: "#fff", letterSpacing: 1 }}>{c.label}</div>
              </div>
            );
          })}
        </div>
      )}
    </SceneShell>
  );
};
