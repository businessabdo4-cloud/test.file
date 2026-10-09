import { interpolate } from "remotion";
import { clamp, Direction, Gesture, kf } from "../../components/CitybotActor";
import { Expression } from "../../citybot/Citybot";
import { iev, iscene, ITL } from "./timeline";

// Citybot's acting for the iPhone 18 Pro / 17 Pro reel: can't choose between the two, then "both have a SIM slot!".
const intro = iscene("intro"), p18 = iscene("p18"), p17 = iscene("p17"), screen = iscene("screen");
const trust = iscene("trust"), cta = iscene("cta"), end = iscene("end");
const hard = iev("hook.hard"), sim = iev("hook.sim");

const gestures: Gesture[] = [
  // hook: points left (18 Pro) then right (17 Pro), shrugs ("S3ib tkhtar…"), thumbs up on the SIM card
  { from: 6, to: iev("hook.p17") - 2, arm: "left", pose: { rot: 125, hand: "point" }, osc: 3 },
  { from: iev("hook.p17"), to: hard - 2, arm: "right", pose: { rot: 125, hand: "point" }, osc: 3 },
  { from: hard, to: sim - 3, arm: "left", pose: { rot: 70, hand: "open" }, osc: 6 },
  { from: hard, to: sim - 3, arm: "right", pose: { rot: 70, hand: "open" }, osc: 6 },
  { from: sim, to: intro.from + 6, arm: "right", pose: { rot: 72, hand: "thumb" } },
  { from: intro.from + 8, to: intro.to - 4, arm: "right", pose: { rot: 140, hand: "point" }, osc: 3 },
  { from: p18.from + 4, to: p17.to - 4, arm: "right", pose: { rot: 135, hand: "point" }, osc: 3 },
  { from: screen.from + 4, to: screen.to - 3, arm: "right", pose: { rot: 140, hand: "point" }, osc: 3 },
  { from: iev("trust.thumb") - 3, to: trust.to - 4, arm: "right", pose: { rot: 72, hand: "thumb" } },
  { from: cta.from + 2, to: iev("cta.wave") - 2, arm: "right", pose: { rot: 140, hand: "point" }, osc: 3 },
  { from: iev("cta.wave"), to: cta.to - 2, arm: "right", pose: { rot: 122, hand: "wave" }, osc: 20 },
  { from: end.from + 4, to: iev("end.wink") - 2, arm: "left", pose: { rot: 120, hand: "wave" }, osc: 18 },
  { from: iev("end.wink"), to: ITL.totalFrames + 60, arm: "right", pose: { rot: 72, hand: "thumb" } },
];

const expressionAt = (f: number): Expression => {
  if (f < intro.from) return f >= sim ? "excited" : "neutral";
  if (f >= iev("end.wink")) return "wink";
  if (f >= end.from) return "happy";
  if (f >= iev("cta.wave") && f < cta.to) return "happy";
  if (f >= iev("trust.thumb") && f < trust.to) return "proud";
  if (f >= iev("p18.latest") && f < iev("p18.chip")) return "excited";
  if (f >= iev("p17.x8") && f < p17.to) return "excited";
  return "neutral";
};

export const iphonesDirection: Direction = {
  gestures,
  expressionAt,
  cornerFrom: intro.from - 3,
  endFrom: end.from - 2,
  hops: [
    { at: sim, dur: 12, height: 60 },
    { at: iev("p18.latest"), dur: 10, height: 32 },
    { at: iev("p17.x8"), dur: 10, height: 32 },
    { at: iev("trust.thumb"), dur: 10, height: 40 },
    { at: end.from + 3, dur: 12, height: 56 },
  ],
  squashAt: (f) =>
    interpolate(f, [0, 7, 12, 15, 20], [1.22, 1.12, 0.84, 1.05, 1], clamp) * interpolate(f - sim, [0, 3, 8, 12], [1, 0.86, 1.05, 1], clamp),
  tiltAt: (f) =>
    f < intro.from
      ? f >= hard && f < sim
        ? Math.sin((f - hard) * 0.25) * 10 // torn between the two
        : kf(f, [[0, -6], [iev("hook.p17"), 6], [hard, 0], [sim, 0], [sim + 6, 8], [intro.from, 4]])
      : kf(f, [
          [intro.from, 4],
          [intro.from + 12, 8],
          [screen.from, 8],
          [screen.from + 6, 0],
          [trust.from, 0],
          [trust.from + 8, 4],
          [end.from, 4],
          [end.from + 8, -6],
          [iev("end.wink") - 3, -6],
          [iev("end.wink") + 3, 7],
        ]),
  lookAt: (f) => {
    if (f < intro.from) {
      if (f < iev("hook.p17")) return { x: -0.8, y: -0.6 };
      if (f < hard) return { x: 0.8, y: -0.6 };
      if (f < sim) return { x: Math.sin((f - hard) * 0.25) * 0.9, y: -0.5 }; // looking back and forth
      return { x: 0, y: -0.7 };
    }
    if (f < end.from) return { x: kf(f, [[intro.from, 0], [intro.from + 10, 0.75]]), y: kf(f, [[intro.from, 0], [intro.from + 10, -0.6]]) };
    return { x: kf(f, [[end.from, 0.5], [iev("end.wink") - 4, 0.5], [iev("end.wink"), 0]]), y: kf(f, [[end.from, -0.8], [iev("end.wink") - 4, -0.8], [iev("end.wink"), 0]]) };
  },
  flashAt: (f) => Math.max(interpolate(f, [11, 12, 20], [0, 1, 0], clamp), interpolate(f, [sim, sim + 1, sim + 8], [0, 0.7, 0], clamp)),
};
