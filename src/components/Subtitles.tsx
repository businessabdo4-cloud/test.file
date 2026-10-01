import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { FONT } from "../brand";
import { sp } from "../anim";
import { SubsPlace, useLayout } from "../layout";
import { scene, TL } from "../timeline";

/** Burned-in French subtitles, revealed word by word on the VO timing. */
export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const L = useLayout();
  const chunk = TL.subtitles.find((c) => frame >= c.from && frame < c.to);
  if (!chunk) return null;

  const place: SubsPlace =
    frame < scene("hero").from ? L.subs.hook : frame >= scene("end").from ? L.subs.end : L.subs.corner;
  const fadeOut = interpolate(frame, [chunk.to - 4, chunk.to], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const activeIdx = chunk.words.reduce((acc, w, i) => (frame >= w.frame ? i : acc), -1);

  return (
    <div
      style={{
        position: "absolute",
        left: place.x,
        width: place.w,
        bottom: L.h - place.bottom,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: place.align === "center" ? "center" : "flex-start",
        columnGap: place.size * 0.28,
        rowGap: place.size * 0.08,
        opacity: fadeOut,
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: place.size,
        lineHeight: 1.12,
        color: "#fff",
        textShadow: "0 3px 10px rgba(6, 14, 90, 0.55), 0 1px 2px rgba(6, 14, 90, 0.4)",
      }}
    >
      {chunk.words.map((w, i) => {
        // reveal slightly before the word is spoken so it reads in sync
        const p = sp(frame, w.frame - 2, { damping: 16, stiffness: 260, mass: 0.5 });
        const active = i === activeIdx;
        const u = active ? sp(frame, w.frame, { damping: 20, stiffness: 300, mass: 0.4 }) : 0;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: Math.min(1, p * 1.5),
              transform: `translateY(${(1 - p) * place.size * 0.35}px) scale(${0.9 + 0.1 * p})`,
              position: "relative",
            }}
          >
            {w.word}
            <span
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: -place.size * 0.06,
                height: place.size * 0.09,
                borderRadius: 99,
                background: "rgba(255,255,255,0.9)",
                transform: `scaleX(${u})`,
                transformOrigin: "left",
                opacity: 0.9 * u,
                boxShadow: "0 0 10px rgba(255,255,255,0.6)",
              }}
            />
          </span>
        );
      })}
    </div>
  );
};
