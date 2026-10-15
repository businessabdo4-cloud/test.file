import { interpolate } from "remotion";
import { clamp, Direction, Gesture, kf } from "../../components/CitybotActor";
import { Expression } from "../../citybot/Citybot";
import { qev, qscene, QTL } from "./timeline";

// Citybot's acting for the Meta Quest 3 reel: amazed by the game bursting out of the TV, then a gamer.
const intro = qscene("intro"), sc = qscene("screen"), mx = qscene("mixed"), all = qscene("all"), st = qscene("storage");
const trust = qscene("trust"), cta = qscene("cta"), end = qscene("end");
const game = qev("hook.game");

const gestures: Gesture[] = [
  { from: 4, to: game - 2, arm: "right", pose: { rot: 140, hand: "point" }, osc: 3 },
  { from: game, to: intro.from + 4, arm: "left", pose: { rot: 150, hand: "open" }, osc: 6 },
  { from: game, to: intro.from + 4, arm: "right", pose: { rot: 150, hand: "open" }, osc: 6 },
  ...[intro, sc, mx, st].map((s) => ({ from: s.from + 6, to: s.to - 4, arm: "right" as const, pose: { rot: 140, hand: "point" as const }, osc: 3 })),
  { from: all.from + 4, to: all.to - 4, arm: "left", pose: { rot: 70, hand: "fist" }, osc: 12 },
  { from: all.from + 4, to: all.to - 4, arm: "right", pose: { rot: 70, hand: "fist" }, osc: 12 },
  { from: qev("trust.thumb") - 3, to: trust.to - 4, arm: "right", pose: { rot: 72, hand: "thumb" } },
  { from: cta.from + 2, to: qev("cta.wave") - 2, arm: "right", pose: { rot: 140, hand: "point" }, osc: 3 },
  { from: qev("cta.wave"), to: cta.to - 2, arm: "right", pose: { rot: 122, hand: "wave" }, osc: 20 },
  { from: end.from + 4, to: qev("end.wink") - 2, arm: "left", pose: { rot: 120, hand: "wave" }, osc: 18 },
  { from: qev("end.wink"), to: QTL.totalFrames + 60, arm: "right", pose: { rot: 72, hand: "thumb" } },
];

const expressionAt = (f: number): Expression => {
  if (f < intro.from) return f >= game ? "excited" : "neutral";
  if (f >= qev("end.wink")) return "wink";
  if (f >= end.from) return "happy";
  if (f >= qev("cta.wave") && f < cta.to) return "happy";
  if (f >= qev("trust.thumb") && f < trust.to) return "proud";
  if (f >= qev("mx.game") && f < mx.to) return "excited";
  if (f >= qev("sc.feel") && f < sc.to) return "happy";
  if (f >= all.from && f < all.to) return "excited";
  if (f >= qev("st.gb") && f < st.to) return "happy";
  return "neutral";
};

export const questDirection: Direction = {
  gestures,
  expressionAt,
  cornerFrom: intro.from - 3,
  endFrom: end.from - 2,
  hops: [
    { at: game, dur: 12, height: 56 },
    { at: qev("intro.gb"), dur: 10, height: 34 },
    { at: qev("mx.game"), dur: 12, height: 50 },
    { at: qev("all.one"), dur: 10, height: 40 },
    { at: qev("st.gb"), dur: 10, height: 34 },
    { at: qev("trust.thumb"), dur: 10, height: 40 },
    { at: end.from + 3, dur: 12, height: 56 },
  ],
  squashAt: (f) => interpolate(f, [0, 7, 12, 15, 20], [1.22, 1.12, 0.84, 1.05, 1], clamp) * interpolate(f - game, [0, 3, 8, 12], [1, 0.86, 1.05, 1], clamp),
  tiltAt: (f) =>
    f < intro.from
      ? kf(f, [[0, 0], [game, 0], [game + 6, -10], [game + 14, 6], [intro.from, 4]])
      : f >= all.from && f < all.to
        ? Math.sin(f * 0.4) * 6
        : kf(f, [[intro.from, 4], [intro.from + 12, 8], [trust.from, 8], [trust.from + 8, 4], [end.from, 4], [end.from + 8, -6], [qev("end.wink") - 3, -6], [qev("end.wink") + 3, 7]]),
  lookAt: (f) => {
    if (f < intro.from) return { x: 0, y: -0.6 };
    if (f < end.from) return { x: kf(f, [[intro.from, 0], [intro.from + 10, 0.75]]), y: kf(f, [[intro.from, 0], [intro.from + 10, -0.6]]) };
    return { x: kf(f, [[end.from, 0.5], [qev("end.wink") - 4, 0.5], [qev("end.wink"), 0]]), y: kf(f, [[end.from, -0.8], [qev("end.wink") - 4, -0.8], [qev("end.wink"), 0]]) };
  },
  flashAt: (f) => Math.max(interpolate(f, [11, 12, 20], [0, 1, 0], clamp), interpolate(f, [game, game + 1, game + 8], [0, 0.8, 0], clamp)),
};
