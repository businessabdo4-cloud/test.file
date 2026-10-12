import { interpolate } from "remotion";
import { clamp, Direction, Gesture, kf } from "../../components/CitybotActor";
import { Expression } from "../../citybot/Citybot";
import { gev, gscene, GTL } from "./timeline";

// Citybot's acting for the GoPro HERO13 Black reel: adventurous; shakes "no" at the phone, cheers for GoPro.
const intro = gscene("intro"), res = gscene("res"), sm = gscene("smooth"), wt = gscene("water"), mt = gscene("mount");
const trust = gscene("trust"), cta = gscene("cta"), end = gscene("end");
const no = gev("hook.no"), yes = gev("hook.gopro");

const gestures: Gesture[] = [
  { from: 4, to: gev("hook.phone") - 2, arm: "right", pose: { rot: 140, hand: "point" }, osc: 4 },
  { from: no, to: yes - 2, arm: "right", pose: { rot: 120, hand: "open" }, osc: 24 }, // "no no"
  { from: yes, to: intro.from + 4, arm: "left", pose: { rot: 160, hand: "fist" } },
  { from: yes, to: intro.from + 4, arm: "right", pose: { rot: 160, hand: "fist" } },
  ...[intro, res, wt, mt].map((s) => ({ from: s.from + 6, to: s.to - 4, arm: "right" as const, pose: { rot: 140, hand: "point" as const }, osc: 3 })),
  { from: gev("sm.run"), to: sm.to - 2, arm: "left", pose: { rot: 60, hand: "fist" }, osc: 28 },
  { from: gev("sm.run"), to: sm.to - 2, arm: "right", pose: { rot: 60, hand: "fist" }, osc: 28 },
  { from: gev("trust.thumb") - 3, to: trust.to - 4, arm: "right", pose: { rot: 72, hand: "thumb" } },
  { from: cta.from + 2, to: gev("cta.wave") - 2, arm: "right", pose: { rot: 140, hand: "point" }, osc: 3 },
  { from: gev("cta.wave"), to: cta.to - 2, arm: "right", pose: { rot: 122, hand: "wave" }, osc: 20 },
  { from: end.from + 4, to: gev("end.wink") - 2, arm: "left", pose: { rot: 120, hand: "wave" }, osc: 18 },
  { from: gev("end.wink"), to: GTL.totalFrames + 60, arm: "right", pose: { rot: 72, hand: "thumb" } },
];

const expressionAt = (f: number): Expression => {
  if (f < intro.from) return f >= yes ? "excited" : f >= no ? "neutral" : "happy";
  if (f >= gev("end.wink")) return "wink";
  if (f >= end.from) return "happy";
  if (f >= gev("cta.wave") && f < cta.to) return "happy";
  if (f >= gev("trust.thumb") && f < trust.to) return "proud";
  if (f >= gev("sm.run") && f < sm.to) return "excited";
  if (f >= gev("res.k") && f < res.to) return "happy";
  if (f >= gev("mt.on") && f < mt.to) return "happy";
  return "neutral";
};

export const goproDirection: Direction = {
  gestures,
  expressionAt,
  cornerFrom: intro.from - 3,
  endFrom: end.from - 2,
  hops: [
    { at: yes, dur: 12, height: 60 },
    { at: gev("res.k"), dur: 10, height: 34 },
    { at: gev("sm.jump"), dur: 12, height: 64 },
    { at: gev("wt.dive"), dur: 10, height: 30 },
    { at: gev("mt.on") + 3, dur: 8, height: 26 },
    { at: gev("trust.thumb"), dur: 10, height: 40 },
    { at: end.from + 3, dur: 12, height: 56 },
  ],
  squashAt: (f) => interpolate(f, [0, 7, 12, 15, 20], [1.22, 1.12, 0.84, 1.05, 1], clamp) * interpolate(f - gev("sm.fall"), [0, 3, 8, 12], [1, 0.8, 1.06, 1], clamp),
  tiltAt: (f) =>
    f < intro.from
      ? f >= no && f < yes ? Math.sin((f - no) * 0.8) * 10 : kf(f, [[0, 0], [yes, 0], [yes + 6, -8], [intro.from, 4]])
      : f >= gev("sm.run") && f < sm.to
        ? Math.sin(f * 0.7) * 5 + (f >= gev("sm.fall") ? kf(f, [[gev("sm.fall"), 0], [gev("sm.fall") + 4, 18], [gev("sm.fall") + 12, 4]]) : 0)
        : kf(f, [[intro.from, 4], [intro.from + 12, 8], [trust.from, 8], [trust.from + 8, 4], [end.from, 4], [end.from + 8, -6], [gev("end.wink") - 3, -6], [gev("end.wink") + 3, 7]]),
  lookAt: (f) => {
    if (f < intro.from) return { x: 0, y: -0.4 };
    if (f < end.from) return { x: kf(f, [[intro.from, 0], [intro.from + 10, 0.75]]), y: kf(f, [[intro.from, 0], [intro.from + 10, -0.6]]) };
    return { x: kf(f, [[end.from, 0.5], [gev("end.wink") - 4, 0.5], [gev("end.wink"), 0]]), y: kf(f, [[end.from, -0.8], [gev("end.wink") - 4, -0.8], [gev("end.wink"), 0]]) };
  },
  flashAt: (f) => Math.max(interpolate(f, [11, 12, 20], [0, 1, 0], clamp), interpolate(f, [gev("res.photo"), gev("res.photo") + 1, gev("res.photo") + 8], [0, 0.8, 0], clamp)),
};
