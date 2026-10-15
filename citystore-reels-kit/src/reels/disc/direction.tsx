import { interpolate } from "remotion";
import { clamp, Direction, Gesture, kf } from "../../components/CitybotActor";
import { Expression } from "../../citybot/Citybot";
import { dev, dscene, DTL } from "./timeline";

// Citybot's acting for the PS5 Disc Drive reel: disappointed when the disc bounces off, delighted by the fix.
const intro = dscene("intro"), inst = dscene("install"), used = dscene("used"), br = dscene("bluray");
const trust = dscene("trust"), cta = dscene("cta"), end = dscene("end");
const cd = dev("hook.cd"), fix = dev("hook.fix");

const gestures: Gesture[] = [
  { from: 4, to: cd - 2, arm: "right", pose: { rot: 140, hand: "point" }, osc: 3 },
  { from: cd + 3, to: fix - 1, arm: "left", pose: { rot: 40, hand: "open" } },
  { from: cd + 3, to: fix - 1, arm: "right", pose: { rot: 40, hand: "open" } },
  { from: fix, to: intro.from + 4, arm: "left", pose: { rot: 160, hand: "fist" } },
  { from: fix, to: intro.from + 4, arm: "right", pose: { rot: 160, hand: "fist" } },
  ...[intro, inst, used, br].map((s) => ({ from: s.from + 6, to: s.to - 4, arm: "right" as const, pose: { rot: 140, hand: "point" as const }, osc: 3 })),
  { from: dev("trust.thumb") - 3, to: trust.to - 4, arm: "right", pose: { rot: 72, hand: "thumb" } },
  { from: cta.from + 2, to: dev("cta.wave") - 2, arm: "right", pose: { rot: 140, hand: "point" }, osc: 3 },
  { from: dev("cta.wave"), to: cta.to - 2, arm: "right", pose: { rot: 122, hand: "wave" }, osc: 20 },
  { from: end.from + 4, to: dev("end.wink") - 2, arm: "left", pose: { rot: 120, hand: "wave" }, osc: 18 },
  { from: dev("end.wink"), to: DTL.totalFrames + 60, arm: "right", pose: { rot: 72, hand: "thumb" } },
];

const expressionAt = (f: number): Expression => {
  if (f < intro.from) return f >= fix ? "excited" : f >= cd + 3 ? "neutral" : "happy";
  if (f >= dev("end.wink")) return "wink";
  if (f >= end.from) return "happy";
  if (f >= dev("cta.wave") && f < cta.to) return "happy";
  if (f >= dev("trust.thumb") && f < trust.to) return "proud";
  if (f >= dev("in.sec") && f < inst.to) return "happy";
  if (f >= dev("us.cheap") && f < used.to) return "happy";
  if (f >= dev("br.k") && f < br.to) return "excited";
  return "neutral";
};

export const discDirection: Direction = {
  gestures,
  expressionAt,
  cornerFrom: intro.from - 3,
  endFrom: end.from - 2,
  hops: [
    { at: fix, dur: 12, height: 60 },
    { at: dev("in.snap") + 12, dur: 8, height: 26 },
    { at: dev("us.cheap"), dur: 10, height: 34 },
    { at: dev("br.k"), dur: 12, height: 50 },
    { at: dev("trust.thumb"), dur: 10, height: 40 },
    { at: end.from + 3, dur: 12, height: 56 },
  ],
  squashAt: (f) => interpolate(f, [0, 7, 12, 15, 20], [1.22, 1.12, 0.84, 1.05, 1], clamp) * interpolate(f - fix, [0, 3, 8, 12], [1, 0.86, 1.05, 1], clamp),
  tiltAt: (f) =>
    f < intro.from
      ? kf(f, [[0, 0], [cd + 2, 0], [cd + 5, -10], [fix, -10], [fix + 6, 8], [intro.from, 4]])
      : kf(f, [[intro.from, 4], [intro.from + 12, 8], [trust.from, 8], [trust.from + 8, 4], [end.from, 4], [end.from + 8, -6], [dev("end.wink") - 3, -6], [dev("end.wink") + 3, 7]]),
  lookAt: (f) => {
    if (f < intro.from) return { x: 0.2, y: -0.5 };
    if (f < end.from) return { x: kf(f, [[intro.from, 0], [intro.from + 10, 0.75]]), y: kf(f, [[intro.from, 0], [intro.from + 10, -0.6]]) };
    return { x: kf(f, [[end.from, 0.5], [dev("end.wink") - 4, 0.5], [dev("end.wink"), 0]]), y: kf(f, [[end.from, -0.8], [dev("end.wink") - 4, -0.8], [dev("end.wink"), 0]]) };
  },
  flashAt: (f) => Math.max(interpolate(f, [11, 12, 20], [0, 1, 0], clamp), interpolate(f, [fix, fix + 1, fix + 8], [0, 0.8, 0], clamp)),
};
