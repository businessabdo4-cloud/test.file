import { interpolate } from "remotion";
import { clamp, Direction, Gesture, kf } from "../../components/CitybotActor";
import { Expression } from "../../citybot/Citybot";
import { tev, tscene, TTL } from "./timeline";

// Citybot's acting for the tablets reel: swiping through tablets, "STOP!" palms, then presenting each tablet.
const a9 = tscene("a9"), a11 = tscene("a11"), len = tscene("lenovo"), xi = tscene("xiaomi");
const trust = tscene("trust"), cta = tscene("cta"), end = tscene("end");
const stop = tev("hook.stop");

const gestures: Gesture[] = [
  { from: 4, to: stop - 2, arm: "right", pose: { rot: 110, hand: "point" }, osc: 14 }, // swiping
  { from: stop, to: a9.from + 2, arm: "left", pose: { rot: 150, hand: "open" }, osc: 3 },
  { from: stop, to: a9.from + 2, arm: "right", pose: { rot: 150, hand: "open" }, osc: 3 },
  ...[a9, a11, len, xi].map((s) => ({ from: s.from + 6, to: s.to - 4, arm: "right" as const, pose: { rot: 140, hand: "point" as const }, osc: 3 })),
  { from: tev("lenovo.write"), to: len.to - 2, arm: "left", pose: { rot: 70, hand: "fist" }, osc: 10 },
  { from: tev("xiaomi.power"), to: tev("xiaomi.games") - 2, arm: "left", pose: { rot: 160, hand: "fist" } },
  { from: tev("trust.thumb") - 3, to: trust.to - 4, arm: "right", pose: { rot: 72, hand: "thumb" } },
  { from: cta.from + 2, to: tev("cta.wave") - 2, arm: "right", pose: { rot: 140, hand: "point" }, osc: 3 },
  { from: tev("cta.wave"), to: cta.to - 2, arm: "right", pose: { rot: 122, hand: "wave" }, osc: 20 },
  { from: end.from + 4, to: tev("end.wink") - 2, arm: "left", pose: { rot: 120, hand: "wave" }, osc: 18 },
  { from: tev("end.wink"), to: TTL.totalFrames + 60, arm: "right", pose: { rot: 72, hand: "thumb" } },
];

const expressionAt = (f: number): Expression => {
  if (f < a9.from) return f >= stop ? "excited" : "neutral";
  if (f >= tev("end.wink")) return "wink";
  if (f >= end.from) return "happy";
  if (f >= tev("cta.wave") && f < cta.to) return "happy";
  if (f >= tev("trust.thumb") && f < trust.to) return "proud";
  if (f >= tev("xiaomi.power") && f < xi.to) return "excited";
  if (f >= tev("lenovo.draw") && f < len.to) return "happy";
  if (f >= tev("a11.light") && f < a11.to) return "happy";
  if (f >= tev("a9.g5") && f < a9.to) return "happy";
  return "neutral";
};

export const tabsDirection: Direction = {
  gestures,
  expressionAt,
  cornerFrom: a9.from - 3,
  endFrom: end.from - 2,
  hops: [
    { at: stop, dur: 10, height: 50 },
    { at: tev("a9.g5"), dur: 10, height: 34 },
    { at: tev("a11.light"), dur: 12, height: 44 },
    { at: tev("xiaomi.power"), dur: 12, height: 56 },
    { at: tev("trust.thumb"), dur: 10, height: 40 },
    { at: end.from + 3, dur: 12, height: 56 },
  ],
  squashAt: (f) => interpolate(f, [0, 7, 12, 15, 20], [1.22, 1.12, 0.84, 1.05, 1], clamp) * interpolate(f - stop, [0, 3, 8, 12], [1, 0.86, 1.05, 1], clamp),
  tiltAt: (f) =>
    f < a9.from
      ? f < stop ? Math.sin(f * 0.25) * 5 : kf(f, [[stop, -8], [stop + 8, 4], [a9.from, 4]])
      : kf(f, [[a9.from, 4], [a9.from + 12, 8], [trust.from, 8], [trust.from + 8, 4], [end.from, 4], [end.from + 8, -6], [tev("end.wink") - 3, -6], [tev("end.wink") + 3, 7]]),
  lookAt: (f) => {
    if (f < a9.from) return f < stop ? { x: Math.sin(f * 0.3) * 0.6, y: -0.3 } : { x: 0, y: 0 };
    if (f < end.from) return { x: kf(f, [[a9.from, 0], [a9.from + 10, 0.75]]), y: kf(f, [[a9.from, 0], [a9.from + 10, -0.6]]) };
    return { x: kf(f, [[end.from, 0.5], [tev("end.wink") - 4, 0.5], [tev("end.wink"), 0]]), y: kf(f, [[end.from, -0.8], [tev("end.wink") - 4, -0.8], [tev("end.wink"), 0]]) };
  },
  flashAt: (f) => Math.max(interpolate(f, [11, 12, 20], [0, 1, 0], clamp), interpolate(f, [stop, stop + 1, stop + 8], [0, 0.8, 0], clamp)),
};
