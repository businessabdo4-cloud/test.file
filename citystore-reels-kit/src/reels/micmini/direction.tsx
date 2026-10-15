import { interpolate } from "remotion";
import { clamp, Direction, Gesture, kf } from "../../components/CitybotActor";
import { Expression } from "../../citybot/Citybot";
import { mev, mscene, MTL } from "./timeline";

// Citybot's acting for the DJI Mic Mini 2 reel: covers its ears in the noisy hook, then relief.
const intro = mscene("intro"), size = mscene("size"), audio = mscene("audio"), bat = mscene("battery");
const conn = mscene("connect"), trust = mscene("trust"), cta = mscene("cta"), end = mscene("end");
const mic = mev("intro.mic");

const gestures: Gesture[] = [
  { from: 4, to: mic - 2, arm: "left", pose: { rot: 150, hand: "open" }, osc: 7 },
  { from: 4, to: mic - 2, arm: "right", pose: { rot: 150, hand: "open" }, osc: 7 },
  { from: mic + 2, to: mev("intro.name") - 2, arm: "right", pose: { rot: 140, hand: "point" }, osc: 3 },
  { from: mev("intro.name"), to: intro.to - 4, arm: "right", pose: { rot: 72, hand: "thumb" } },
  { from: size.from + 4, to: size.to - 4, arm: "right", pose: { rot: 135, hand: "point" }, osc: 3 },
  { from: audio.from + 4, to: audio.to - 4, arm: "left", pose: { rot: 110, hand: "open" }, osc: 5 },
  { from: bat.from + 3, to: bat.to - 3, arm: "left", pose: { rot: 100, hand: "open" }, osc: 5 },
  { from: bat.from + 3, to: bat.to - 3, arm: "right", pose: { rot: 100, hand: "open" }, osc: 5 },
  { from: conn.from + 4, to: conn.to - 4, arm: "right", pose: { rot: 140, hand: "point" }, osc: 3 },
  { from: mev("trust.thumb") - 3, to: trust.to - 4, arm: "right", pose: { rot: 72, hand: "thumb" } },
  { from: cta.from + 2, to: mev("cta.wave") - 2, arm: "right", pose: { rot: 140, hand: "point" }, osc: 3 },
  { from: mev("cta.wave"), to: cta.to - 2, arm: "right", pose: { rot: 122, hand: "wave" }, osc: 20 },
  { from: end.from + 4, to: mev("end.wink") - 2, arm: "left", pose: { rot: 120, hand: "wave" }, osc: 18 },
  { from: mev("end.wink"), to: MTL.totalFrames + 60, arm: "right", pose: { rot: 72, hand: "thumb" } },
];

const expressionAt = (f: number): Expression => {
  if (f < mic) return "excited"; // wide eyes in the racket
  if (f < intro.to) return "happy";
  if (f >= mev("end.wink")) return "wink";
  if (f >= end.from) return "happy";
  if (f >= mev("cta.wave") && f < cta.to) return "happy";
  if (f >= mev("trust.thumb") && f < trust.to) return "proud";
  if (f >= mev("sz.hidden") && f < size.to) return "wink";
  if (f >= mev("au.nc") && f < audio.to) return "happy";
  return "neutral";
};

export const micminiDirection: Direction = {
  gestures,
  expressionAt,
  cornerFrom: intro.from - 3,
  endFrom: end.from - 2,
  hops: [
    { at: mic, dur: 12, height: 56 },
    { at: mev("bat.case"), dur: 10, height: 34 },
    { at: mev("cn.norx"), dur: 10, height: 30 },
    { at: mev("trust.thumb"), dur: 10, height: 40 },
    { at: end.from + 3, dur: 12, height: 56 },
  ],
  squashAt: (f) => interpolate(f, [0, 7, 12, 15, 20], [1.22, 1.12, 0.84, 1.05, 1], clamp) * interpolate(f - mic, [0, 3, 8, 12], [1, 0.86, 1.05, 1], clamp),
  tiltAt: (f) =>
    f < mic
      ? Math.sin(f * 2.3) * 6 + Math.sin(f * 0.9) * 3
      : kf(f, [[mic, -6], [mic + 8, 8], [intro.to, 6], [size.from + 10, 8], [bat.from, 8], [bat.from + 6, 0], [trust.from, 0], [trust.from + 8, 4], [end.from, 4], [end.from + 8, -6], [mev("end.wink") - 3, -6], [mev("end.wink") + 3, 7]]),
  lookAt: (f) => {
    if (f < mic) return { x: Math.sin(f * 0.7) * 0.8, y: -0.2 };
    if (f < end.from) return { x: kf(f, [[intro.from, 0], [intro.from + 10, 0.75]]), y: kf(f, [[intro.from, 0], [intro.from + 10, -0.6]]) };
    return { x: kf(f, [[end.from, 0.5], [mev("end.wink") - 4, 0.5], [mev("end.wink"), 0]]), y: kf(f, [[end.from, -0.8], [mev("end.wink") - 4, -0.8], [mev("end.wink"), 0]]) };
  },
  flashAt: (f) => Math.max(interpolate(f, [11, 12, 20], [0, 1, 0], clamp), interpolate(f, [mic, mic + 1, mic + 8], [0, 0.8, 0], clamp)),
};
