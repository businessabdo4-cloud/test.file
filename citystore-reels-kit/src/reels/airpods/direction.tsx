import { interpolate } from "remotion";
import { clamp, Direction, Gesture, kf } from "../../components/CitybotActor";
import { Expression } from "../../citybot/Citybot";
import { aev, ascene, ATL } from "./timeline";

// Citybot's acting for the AirPods 5 reel: confused by a foreign language, then understands everything.
const intro = ascene("intro"), fit = ascene("fit"), anc = ascene("anc"), ft = ascene("features"), ch = ascene("charging");
const trust = ascene("trust"), cta = ascene("cta"), end = ascene("end");
const huh = aev("hook.huh"), land = aev("hook.airpods"), tr = aev("hook.translate");

const gestures: Gesture[] = [
  // hook: scratches its head (confused), then thumbs up when the translation appears
  { from: aev("hook.bubble2"), to: land - 2, arm: "right", pose: { rot: 165, hand: "open" }, osc: 10 },
  { from: huh, to: land - 2, arm: "left", pose: { rot: 70, hand: "open" }, osc: 6 },
  { from: tr, to: intro.from + 6, arm: "right", pose: { rot: 72, hand: "thumb" } },
  { from: intro.from + 8, to: fit.to - 4, arm: "right", pose: { rot: 140, hand: "point" }, osc: 3 },
  { from: anc.from + 4, to: aev("anc.talk") - 2, arm: "right", pose: { rot: 135, hand: "point" }, osc: 3 },
  { from: aev("anc.talk"), to: anc.to - 3, arm: "left", pose: { rot: 120, hand: "wave" }, osc: 16 },
  { from: ft.from + 4, to: ft.to - 4, arm: "right", pose: { rot: 140, hand: "point" }, osc: 3 },
  { from: ch.from + 4, to: aev("ch.done") - 2, arm: "right", pose: { rot: 130, hand: "point" }, osc: 3 },
  { from: aev("ch.done"), to: ch.to - 2, arm: "right", pose: { rot: 72, hand: "thumb" } },
  { from: aev("trust.thumb") - 3, to: trust.to - 4, arm: "right", pose: { rot: 72, hand: "thumb" } },
  { from: cta.from + 2, to: aev("cta.wave") - 2, arm: "right", pose: { rot: 140, hand: "point" }, osc: 3 },
  { from: aev("cta.wave"), to: cta.to - 2, arm: "right", pose: { rot: 122, hand: "wave" }, osc: 20 },
  { from: end.from + 4, to: aev("end.wink") - 2, arm: "left", pose: { rot: 120, hand: "wave" }, osc: 18 },
  { from: aev("end.wink"), to: ATL.totalFrames + 60, arm: "right", pose: { rot: 72, hand: "thumb" } },
];

const expressionAt = (f: number): Expression => {
  if (f < intro.from) return f >= tr ? "excited" : "neutral";
  if (f >= aev("end.wink")) return "wink";
  if (f >= end.from) return "happy";
  if (f >= aev("cta.wave") && f < cta.to) return "happy";
  if (f >= aev("trust.thumb") && f < trust.to) return "proud";
  if (f >= aev("anc.nc") && f < aev("anc.switch")) return "happy";
  if (f >= aev("ch.done") && f < ch.to) return "proud";
  return "neutral";
};

export const airpodsDirection: Direction = {
  gestures,
  expressionAt,
  cornerFrom: intro.from - 3,
  endFrom: end.from - 2,
  hops: [
    { at: tr, dur: 12, height: 56 },
    { at: aev("anc.pct"), dur: 10, height: 32 },
    { at: aev("ch.done"), dur: 10, height: 32 },
    { at: aev("trust.thumb"), dur: 10, height: 40 },
    { at: end.from + 3, dur: 12, height: 56 },
  ],
  squashAt: (f) => interpolate(f, [0, 7, 12, 15, 20], [1.22, 1.12, 0.84, 1.05, 1], clamp) * interpolate(f - tr, [0, 3, 8, 12], [1, 0.86, 1.05, 1], clamp),
  tiltAt: (f) =>
    f < intro.from
      ? f < tr
        ? kf(f, [[0, 0], [aev("hook.bubble2"), -10], [huh, 10], [land, 10]]) // puzzled head tilt
        : kf(f, [[tr, 10], [tr + 8, -4], [intro.from, 4]])
      : kf(f, [[intro.from, 4], [intro.from + 12, 8], [anc.from, 8], [anc.from + 6, 0], [ft.from, 0], [ft.from + 8, 6], [trust.from, 6], [trust.from + 8, 4], [end.from, 4], [end.from + 8, -6], [aev("end.wink") - 3, -6], [aev("end.wink") + 3, 7]]),
  lookAt: (f) => {
    if (f < intro.from) return f < land ? { x: Math.sin(f * 0.15) * 0.8, y: -0.6 } : { x: 0.2, y: -0.8 };
    if (f < end.from) return { x: kf(f, [[intro.from, 0], [intro.from + 10, 0.75]]), y: kf(f, [[intro.from, 0], [intro.from + 10, -0.6]]) };
    return { x: kf(f, [[end.from, 0.5], [aev("end.wink") - 4, 0.5], [aev("end.wink"), 0]]), y: kf(f, [[end.from, -0.8], [aev("end.wink") - 4, -0.8], [aev("end.wink"), 0]]) };
  },
  flashAt: (f) => Math.max(interpolate(f, [11, 12, 20], [0, 1, 0], clamp), interpolate(f, [land, land + 1, land + 8], [0, 0.7, 0], clamp)),
};
