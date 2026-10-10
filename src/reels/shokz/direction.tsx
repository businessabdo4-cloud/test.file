import { interpolate } from "remotion";
import { clamp, Direction, Gesture, kf } from "../../components/CitybotActor";
import { Expression } from "../../citybot/Citybot";
import { zev, zscene, ZTL } from "./timeline";

// Citybot's acting for the Shokz OpenRun Pro reel: jogging in the hook, startled by the car, then happy and sporty.
const intro = zscene("intro"), bone = zscene("bone"), light = zscene("light"), bat = zscene("battery"), sport = zscene("sport");
const trust = zscene("trust"), cta = zscene("cta"), end = zscene("end");
const danger = zev("hook.danger");

const gestures: Gesture[] = [
  { from: 4, to: danger - 2, arm: "left", pose: { rot: 60, hand: "fist" }, osc: 28 },
  { from: 4, to: danger - 2, arm: "right", pose: { rot: 60, hand: "fist" }, osc: 28 },
  { from: danger, to: intro.from + 4, arm: "left", pose: { rot: 150, hand: "open" }, osc: 6 },
  { from: danger, to: intro.from + 4, arm: "right", pose: { rot: 150, hand: "open" }, osc: 6 },
  { from: intro.from + 6, to: bone.to - 4, arm: "right", pose: { rot: 140, hand: "point" }, osc: 3 },
  { from: zev("lt.run"), to: light.to - 2, arm: "left", pose: { rot: 60, hand: "fist" }, osc: 28 },
  { from: zev("lt.run"), to: light.to - 2, arm: "right", pose: { rot: 60, hand: "fist" }, osc: 28 },
  { from: bat.from + 3, to: bat.to - 3, arm: "left", pose: { rot: 100, hand: "open" }, osc: 5 },
  { from: bat.from + 3, to: bat.to - 3, arm: "right", pose: { rot: 100, hand: "open" }, osc: 5 },
  { from: sport.from + 4, to: sport.to - 4, arm: "right", pose: { rot: 72, hand: "thumb" } },
  { from: zev("trust.thumb") - 3, to: trust.to - 4, arm: "right", pose: { rot: 72, hand: "thumb" } },
  { from: cta.from + 2, to: zev("cta.wave") - 2, arm: "right", pose: { rot: 140, hand: "point" }, osc: 3 },
  { from: zev("cta.wave"), to: cta.to - 2, arm: "right", pose: { rot: 122, hand: "wave" }, osc: 20 },
  { from: end.from + 4, to: zev("end.wink") - 2, arm: "left", pose: { rot: 120, hand: "wave" }, osc: 18 },
  { from: zev("end.wink"), to: ZTL.totalFrames + 60, arm: "right", pose: { rot: 72, hand: "thumb" } },
];

const expressionAt = (f: number): Expression => {
  if (f < intro.from) return f >= danger ? "excited" : "neutral";
  if (f >= zev("end.wink")) return "wink";
  if (f >= end.from) return "happy";
  if (f >= zev("cta.wave") && f < cta.to) return "happy";
  if (f >= zev("trust.thumb") && f < trust.to) return "proud";
  if (f >= zev("bn.hear") && f < bone.to) return "happy";
  if (f >= zev("lt.run") && f < light.to) return "excited";
  return "neutral";
};

export const shokzDirection: Direction = {
  gestures,
  expressionAt,
  cornerFrom: intro.from - 3,
  endFrom: end.from - 2,
  hops: [
    ...[0.2, 0.7, 1.2, 1.7].map((s) => ({ at: Math.round(s * 30), dur: 7, height: 14 })), // jogging bounce
    { at: danger, dur: 10, height: 50 },
    { at: zev("lt.jump"), dur: 12, height: 60 },
    { at: zev("trust.thumb"), dur: 10, height: 40 },
    { at: end.from + 3, dur: 12, height: 56 },
  ],
  squashAt: (f) => interpolate(f, [0, 7, 12, 15, 20], [1.22, 1.12, 0.84, 1.05, 1], clamp) * interpolate(f - danger, [0, 3, 8, 12], [1, 0.86, 1.05, 1], clamp),
  tiltAt: (f) =>
    f < intro.from
      ? f < danger ? Math.sin(f * 0.6) * 4 : kf(f, [[danger, -10], [danger + 8, 6], [intro.from, 4]])
      : kf(f, [[intro.from, 4], [intro.from + 12, 8], [light.from, 8], [light.from + 6, 0], [sport.from, 0], [sport.from + 8, 6], [trust.from, 6], [trust.from + 8, 4], [end.from, 4], [end.from + 8, -6], [zev("end.wink") - 3, -6], [zev("end.wink") + 3, 7]]),
  lookAt: (f) => {
    if (f < intro.from) return f < zev("hook.car") ? { x: 0.3, y: 0 } : { x: -0.9, y: -0.1 }; // looks back at the car
    if (f < end.from) return { x: kf(f, [[intro.from, 0], [intro.from + 10, 0.75]]), y: kf(f, [[intro.from, 0], [intro.from + 10, -0.6]]) };
    return { x: kf(f, [[end.from, 0.5], [zev("end.wink") - 4, 0.5], [zev("end.wink"), 0]]), y: kf(f, [[end.from, -0.8], [zev("end.wink") - 4, -0.8], [zev("end.wink"), 0]]) };
  },
  flashAt: (f) => Math.max(interpolate(f, [11, 12, 20], [0, 1, 0], clamp), interpolate(f, [danger, danger + 1, danger + 8], [0, 0.8, 0], clamp)),
};
