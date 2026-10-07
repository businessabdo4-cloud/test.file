import { interpolate } from "remotion";
import { sp } from "../../anim";
import { clamp, Direction, Gesture, kf } from "../../components/CitybotActor";
import { Expression } from "../../citybot/Citybot";
import { LENS, rev, rscene, RTL } from "./timeline";

// Citybot's acting for the Ray-Ban reel: puts on its own smart shades in the hook and keeps them on;
// the camera light flashes whenever a photo is "taken".
const S = (sec: number) => Math.round(sec * RTL.fps);
const intro = rscene("intro"), hl = rscene("headliner"), wf = rscene("wayfarer"), cam = rscene("camera");
const au = rscene("audio"), bat = rscene("battery"), trust = rscene("trust"), cta = rscene("cta"), end = rscene("end");
const glassesAt = rev("hook.glasses");

const gestures: Gesture[] = [
  // hook: points up at the big glasses, then both hands slide its own shades on
  { from: S(0.25), to: glassesAt - 6, arm: "right", pose: { rot: 150, hand: "point" }, osc: 3 },
  { from: glassesAt - 4, to: glassesAt + 10, arm: "left", pose: { rot: 165, hand: "open" } },
  { from: glassesAt - 4, to: glassesAt + 10, arm: "right", pose: { rot: 165, hand: "open" } },
  { from: glassesAt + 12, to: rev("hook.ai") - 2, arm: "right", pose: { rot: 72, hand: "thumb" } },
  { from: rev("hook.ai"), to: intro.from - 2, arm: "left", pose: { rot: 130, hand: "point" }, osc: 3 },
  // products: point up at them
  { from: intro.from + 6, to: hl.to - 6, arm: "right", pose: { rot: 140, hand: "point" }, osc: 3 },
  { from: wf.from + 6, to: wf.to - 6, arm: "right", pose: { rot: 135, hand: "point" }, osc: 3 },
  // camera: "click" with a thumb
  { from: cam.from + 4, to: cam.to - 4, arm: "right", pose: { rot: 72, hand: "thumb" } },
  // music: little groove
  { from: rev("au.music"), to: au.to - 4, arm: "left", pose: { rot: 120, hand: "open" }, osc: 14 },
  { from: rev("au.music"), to: au.to - 4, arm: "right", pose: { rot: 120, hand: "open" }, osc: 14 },
  // battery: open arms
  { from: bat.from + 3, to: bat.to - 3, arm: "left", pose: { rot: 100, hand: "open" }, osc: 5 },
  { from: bat.from + 3, to: bat.to - 3, arm: "right", pose: { rot: 100, hand: "open" }, osc: 5 },
  { from: rev("trust.thumb") - 3, to: trust.to - 4, arm: "right", pose: { rot: 72, hand: "thumb" } },
  { from: cta.from + 2, to: rev("cta.wave") - 2, arm: "right", pose: { rot: 140, hand: "point" }, osc: 3 },
  { from: rev("cta.wave"), to: cta.to - 2, arm: "right", pose: { rot: 122, hand: "wave" }, osc: 20 },
  { from: end.from + 4, to: rev("end.wink") - 2, arm: "left", pose: { rot: 120, hand: "wave" }, osc: 18 },
  { from: rev("end.wink"), to: RTL.totalFrames + 60, arm: "right", pose: { rot: 72, hand: "thumb" } },
];

const expressionAt = (f: number): Expression => {
  if (f < glassesAt) return "excited";
  if (f < intro.from) return f >= rev("hook.ai") ? "proud" : "happy";
  if (f >= rev("end.wink")) return "wink";
  if (f >= end.from) return "happy";
  if (f >= rev("cta.wave") && f < cta.to) return "happy";
  if (f >= rev("trust.thumb") && f < trust.to) return "proud";
  if (f >= au.from && f < au.to) return "happy";
  if (f >= cam.from && f < cam.to) return "excited";
  return "neutral";
};

// camera-light flashes on the photo / video beats
const LED = [rev("hook.camera"), rev("cam.mp"), rev("cam.k3")];

export const raybanDirection: Direction = {
  gestures,
  expressionAt,
  cornerFrom: intro.from - 3,
  endFrom: end.from - 2,
  hops: [
    { at: glassesAt + 6, dur: 12, height: 50 },
    { at: rev("hook.ai"), dur: 10, height: 30 },
    { at: rev("cam.k3"), dur: 10, height: 36 },
    { at: rev("trust.thumb"), dur: 10, height: 40 },
    { at: end.from + 3, dur: 12, height: 56 },
  ],
  squashAt: (f) =>
    interpolate(f, [0, 7, 12, 15, 20], [1.22, 1.12, 0.84, 1.05, 1], clamp) *
    interpolate(f - glassesAt, [0, 3, 8, 12], [1, 0.88, 1.05, 1], clamp),
  tiltAt: (f) =>
    f < intro.from
      ? kf(f, [[0, 0], [glassesAt - 4, -6], [glassesAt + 4, 8], [glassesAt + 14, 4], [intro.from, 4]])
      : kf(f, [
          [intro.from, 4],
          [intro.from + 12, 8],
          [au.from, 8],
          [au.from + 6, 0],
          ...Array.from({ length: 6 }, (_, k) => [rev("au.music") + k * 7.5, k % 2 ? -7 : 7] as [number, number]),
          [bat.from, 0],
          [trust.from, 0],
          [trust.from + 8, 4],
          [end.from, 4],
          [end.from + 8, -6],
          [rev("end.wink") - 3, -6],
          [rev("end.wink") + 3, 7],
        ]),
  lookAt: (f) => {
    if (f < glassesAt) return { x: 0.2, y: -0.9 }; // looking up at the big glasses
    if (f >= intro.from && f < end.from) {
      const centre = f >= bat.from && f < bat.to;
      return { x: centre ? 0.3 : kf(f, [[intro.from, 0], [intro.from + 10, 0.75]]), y: centre ? -0.3 : kf(f, [[intro.from, 0], [intro.from + 10, -0.6]]) };
    }
    if (f >= end.from)
      return { x: kf(f, [[end.from, 0.5], [rev("end.wink") - 4, 0.5], [rev("end.wink"), 0]]), y: kf(f, [[end.from, -0.8], [rev("end.wink") - 4, -0.8], [rev("end.wink"), 0]]) };
    return { x: 0, y: 0 };
  },
  flashAt: (f) => interpolate(f, [11, 12, 20], [0, 1, 0], clamp),
  glassesAt: (f) => {
    if (f < glassesAt - 8) return null;
    const led = Math.max(0, ...LED.map((t) => interpolate(f, [t, t + 1, t + 9], [0, 1, 0], clamp)));
    return { p: sp(f, glassesAt - 6, { damping: 13, stiffness: 170, mass: 0.7 }), lens: f >= wf.from ? LENS.graphite : LENS.green, led };
  },
};
