import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { FONT } from "../brand";
import { sp } from "../anim";
import { SubsPlace, useLayout } from "../layout";
import { useTL } from "../timeline";

const ARABIC = /[؀-ۿݐ-ݿ]/;
const STRONG_LTR = /[A-Za-zÀ-ÿ0-9]/;
type Dir = "rtl" | "ltr";

/**
 * Group words into bidi runs so Latin phrases inside Darija keep their left-to-right order.
 * In an RTL chunk, punctuation trailing a Latin word that ends a run ("Store!", "citystore.ma.")
 * is split off and placed in reading order (to the left), as the bidi algorithm would.
 */
const runsOf = (words: { word: string; frame: number }[], base: Dir) => {
  type Item = { word: string; frame: number; idx: number };
  const runs: { dir: Dir; items: Item[]; trail?: Item }[] = [];
  const dirOf = (t: string): Dir | null => (ARABIC.test(t) ? "rtl" : STRONG_LTR.test(t) ? "ltr" : null);
  words.forEach((w, idx) => {
    let items: { item: Item; dir: Dir | null }[] = [{ item: { ...w, idx }, dir: dirOf(w.word) }];
    const nextDir = idx + 1 < words.length ? dirOf(words[idx + 1].word) : null;
    const m = w.word.match(/^(.*?[A-Za-z0-9À-ÿ])([!.?,…:;،]+)$/);
    if (base === "rtl" && m && items[0].dir === "ltr" && nextDir !== "ltr") {
      items = [
        { item: { ...w, word: m[1], idx }, dir: "ltr" },
        { item: { ...w, word: m[2], idx }, dir: "rtl" },
      ];
    }
    items.forEach(({ item, dir }, k) => {
      const last = runs[runs.length - 1];
      if (k === 1) last.trail = item; // split punctuation: glued to the LTR run's visual left edge
      else if (last && !last.trail && (dir === null || dir === last.dir)) last.items.push(item);
      else runs.push({ dir: dir ?? base, items: [item] });
    });
  });
  return runs;
};

/** Burned-in subtitles, revealed word by word on the VO timing (French, Darija or mixed). */
export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const L = useLayout();
  const TL = useTL();
  const chunk = TL.subtitles.find((c) => frame >= c.from && frame < c.to);
  if (!chunk) return null;

  const second = TL.scenes[1].from;
  const last = TL.scenes[TL.scenes.length - 1].from;
  const place: SubsPlace = frame < second ? L.subs.hook : frame >= last ? L.subs.end : L.subs.corner;
  const fadeOut = interpolate(frame, [chunk.to - 4, chunk.to], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const activeIdx = chunk.words.reduce((acc, w, i) => (frame >= w.frame ? i : acc), -1);
  const base: Dir = chunk.words.some((w) => ARABIC.test(w.word)) ? "rtl" : "ltr";
  const size = base === "rtl" ? place.size * 1.08 : place.size; // Arabic glyphs read smaller at equal size
  const gap = size * 0.28;

  const word = (w: { word: string; frame: number; idx: number }, dir: Dir, key: string) => {
    // reveal slightly before the word is spoken so it reads in sync
    const p = sp(frame, w.frame - 2, { damping: 16, stiffness: 260, mass: 0.5 });
    const u = w.idx === activeIdx ? sp(frame, w.frame, { damping: 20, stiffness: 300, mass: 0.4 }) : 0;
    return (
      <span
        key={key}
        style={{
          display: "inline-block",
          opacity: Math.min(1, p * 1.5),
          transform: `translateY(${(1 - p) * size * 0.35}px) scale(${0.9 + 0.1 * p})`,
          position: "relative",
        }}
      >
        {w.word}
        <span
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: -size * 0.06,
            height: size * 0.09,
            borderRadius: 99,
            background: "rgba(255,255,255,0.9)",
            transform: `scaleX(${u})`,
            transformOrigin: dir === "rtl" ? "right" : "left",
            opacity: 0.9 * u,
            boxShadow: "0 0 10px rgba(255,255,255,0.6)",
          }}
        />
      </span>
    );
  };

  return (
    <div
      style={{
        position: "absolute",
        left: place.x,
        width: place.w,
        bottom: L.h - place.bottom,
        direction: base,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: place.align === "center" ? "center" : "flex-start",
        columnGap: gap,
        rowGap: size * 0.08,
        opacity: fadeOut,
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: size,
        lineHeight: base === "rtl" ? 1.35 : 1.12,
        color: "#fff",
        textShadow: "0 3px 10px rgba(6, 14, 90, 0.55), 0 1px 2px rgba(6, 14, 90, 0.4)",
      }}
    >
      {runsOf(chunk.words, base).map((run, r) =>
        run.dir === base ? (
          <React.Fragment key={r}>{run.items.map((w, k) => word(w, run.dir, `${r}-${k}`))}</React.Fragment>
        ) : (
          <span key={r} style={{ direction: run.dir, display: "inline-flex", flexWrap: "wrap", columnGap: gap }}>
            {run.items.map((w, k) => {
              const el = word(w, run.dir, `${r}-${k}`);
              // trailing punctuation sits flush against the first word on its left
              return k === 0 && run.trail ? (
                <span key={`${r}-${k}`} style={{ display: "inline-flex" }}>
                  {word(run.trail, "rtl", `${r}-t`)}
                  {el}
                </span>
              ) : (
                el
              );
            })}
          </span>
        ),
      )}
    </div>
  );
};
