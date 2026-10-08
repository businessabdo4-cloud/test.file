import { interpolate } from "remotion";
import { clamp, Direction, Gesture, kf } from "../../components/CitybotActor";
import { Expression } from "../../citybot/Citybot";
import { nev, nscene, NTL } from "./timeline";

// Citybot's acting for the Nintendo Switch OLED reel.
const intro = nscene("intro"), screen = nscene("screen"), modes = nscene("modes"), specs = nscene("specs"), jc = nscene("joycon");
const trust = nscene("trust"), cta = nscene("cta"), end = nscene("end");
const sol = nev("hook.solution");

const gestures: Gesture[] = [
  // hook: points at the TV (taken!), then "the solution": both arms up
  { from: 6, to: nev("hook.play") - 2, arm: "right", pose: { rot: 140, hand: "point" }, osc: 3 },
  { from: nev("hook.play"), to: sol - 2, arm: "left", pose: { rot: 40, hand: "open" }, osc: 6 },
  { from: sol, to: intro.from + 4, arm: "left", pose: { rot: 160, hand: "open" }, osc: 8 },
  { from: sol, to: intro.from + 4, arm: "right", pose: { rot: 160, hand: "open" }, osc: 8 },
  { from: intro.from + 6, to: screen.to - 4, arm: "right", pose: { rot: 140, hand: "point" }, osc: 3 },
  { from: modes.from + 4, to: modes.to - 4, arm: "right", pose: { rot: 130, hand: "point" }, osc: 3 },
  { from: specs.from + 4, to: specs.to - 4, arm: "right", pose: { rot: 140, hand: "point" }, osc: 3 },
  // joy-con: playing with a friend, little button-mashing wiggle
  { from: nev("jc.friend"), to: jc.to - 3, arm: "left", pose: { rot: 70, hand: "fist" }, osc: 18 },
  { from: nev("jc.friend"), to: jc.to - 3, arm: "right", pose: { rot: 70, hand: "fist" }, osc: 18 },
  { from: nev("trust.thumb") - 3, to: trust.to - 4, arm: "right", pose: { rot: 72, hand: "thumb" } },
  { from: cta.from + 2, to: nev("cta.wave") - 2, arm: "right", pose: { rot: 140, hand: "point" }, osc: 3 },
  { from: nev("cta.wave"), to: cta.to - 2, arm: "right", pose: { rot: 122, hand: "wave" }, osc: 20 },
  { from: end.from + 4, to: nev("end.wink") - 2, arm: "left", pose: { rot: 120, hand: "wave" }, osc: 18 },
  { from: nev("end.wink"), to: NTL.totalFrames + 60, arm: "right", pose: { rot: 72, hand: "thumb" } },
];

const expressionAt = (f: number): Expression => {
  if (f < intro.from) return f >= sol ? "excited" : "neutral";
  if (f >= nev("end.wink")) return "wink";
  if (f >= end.from) return "happy";
  if (f >= nev("cta.wave") && f < cta.to) return "happy";
  if (f >= nev("trust.thumb") && f < trust.to) return "proud";
  if (f >= nev("jc.friend") && f < jc.to) return "excited";
  if (f >= nev("sc.inside") && f < screen.to) return "excited";
  return "neutral";
};

export const switchDirection: Direction = {
  gestures,
  expressionAt,
  cornerFrom: intro.from - 3,
  endFrom: end.from - 2,
  hops: [
    { at: sol, dur: 12, height: 60 },
    { at: nev("md.switch"), dur: 10, height: 30 },
    { at: nev("jc.friend"), dur: 10, height: 36 },
    { at: nev("trust.thumb"), dur: 10, height: 40 },
    { at: end.from + 3, dur: 12, height: 56 },
  ],
  squashAt: (f) =>
    interpolate(f, [0, 7, 12, 15, 20], [1.22, 1.12, 0.84, 1.05, 1], clamp) * interpolate(f - sol, [0, 3, 8, 12], [1, 0.86, 1.05, 1], clamp),
  tiltAt: (f) =>
    f < intro.from
      ? kf(f, [[0, 0], [nev("hook.play"), -8], [sol, -8], [sol + 6, 8], [intro.from, 4]]) // sulky head tilt, then joy
      : kf(f, [
          [intro.from, 4],
          [intro.from + 12, 8],
          [modes.from, 8],
          [modes.from + 6, 0],
          [specs.from, 0],
          [specs.from + 8, 6],
          [trust.from, 6],
          [trust.from + 8, 4],
          [end.from, 4],
          [end.from + 8, -6],
          [nev("end.wink") - 3, -6],
          [nev("end.wink") + 3, 7],
        ]),
  lookAt: (f) => {
    if (f < intro.from) return f < sol ? { x: -0.2, y: -0.9 } : { x: 0.3, y: -0.7 };
    if (f >= intro.from && f < end.from) return { x: kf(f, [[intro.from, 0], [intro.from + 10, 0.75]]), y: kf(f, [[intro.from, 0], [intro.from + 10, -0.6]]) };
    return { x: kf(f, [[end.from, 0.5], [nev("end.wink") - 4, 0.5], [nev("end.wink"), 0]]), y: kf(f, [[end.from, -0.8], [nev("end.wink") - 4, -0.8], [nev("end.wink"), 0]]) };
  },
  flashAt: (f) => Math.max(interpolate(f, [11, 12, 20], [0, 1, 0], clamp), interpolate(f, [sol, sol + 1, sol + 8], [0, 0.7, 0], clamp)),
};
