import { interpolate } from "remotion";
import { clamp, Direction, Gesture, kf } from "../../components/CitybotActor";
import { Expression } from "../../citybot/Citybot";
import { ev, scene, TL } from "../../timeline";

// Citybot's acting for the iPhone 18 Pro reel.
const S = (sec: number) => Math.round(sec * TL.fps);

const gestures: Gesture[] = [
  // hook: arms up on the pop-in, again on the excited hop
  { from: 0, to: S(0.9), arm: "left", pose: { rot: 120, hand: "wave" }, osc: 8 },
  { from: 0, to: S(0.9), arm: "right", pose: { rot: 120, hand: "wave" }, osc: 8 },
  { from: ev("hook.hop") - 4, to: ev("hook.hop") + S(0.75), arm: "left", pose: { rot: 128, hand: "wave" }, osc: 10 },
  { from: ev("hook.hop") - 4, to: ev("hook.hop") + S(0.75), arm: "right", pose: { rot: 128, hand: "wave" }, osc: 10 },
  // hero: points at the iPhones
  { from: scene("hero").from + 8, to: S(7.8), arm: "right", pose: { rot: 142, hand: "point" }, osc: 3 },
  // ecosystem: presenting palm, then "ta-da" on the recap
  { from: S(9.8), to: ev("eco.recap") - 6, arm: "right", pose: { rot: 70, hand: "open" }, osc: 6 },
  { from: ev("eco.recap"), to: scene("ecosystem").to - 6, arm: "left", pose: { rot: 105, hand: "open" } },
  { from: ev("eco.recap"), to: scene("ecosystem").to - 6, arm: "right", pose: { rot: 105, hand: "open" } },
  // trust: thumbs up on "original"
  { from: ev("trust.thumb") - 3, to: scene("trust").to - 4, arm: "right", pose: { rot: 72, hand: "thumb" } },
  // cta: point at the phone, then wave
  { from: scene("cta").from + 6, to: ev("cta.wave") - 4, arm: "right", pose: { rot: 140, hand: "point" }, osc: 3 },
  { from: ev("cta.wave"), to: scene("cta").to - 6, arm: "right", pose: { rot: 122, hand: "wave" }, osc: 20 },
  // end card: wave, then thumbs up + wink (held to the last frame)
  { from: scene("end").from + 10, to: ev("end.wink") - 2, arm: "left", pose: { rot: 120, hand: "wave" }, osc: 18 },
  { from: ev("end.wink"), to: TL.totalFrames + 60, arm: "right", pose: { rot: 72, hand: "thumb" } },
];

const expressionAt = (frame: number): Expression => {
  if (frame < scene("hero").from) return "excited";
  if (frame >= ev("end.wink")) return "wink";
  if (frame >= scene("end").from) return "happy";
  if (frame >= ev("cta.wave") && frame < scene("cta").to) return "happy";
  if (frame >= ev("trust.thumb") && frame < scene("trust").to) return "proud";
  return "neutral";
};

export const iphoneDirection: Direction = {
  gestures,
  expressionAt,
  cornerFrom: scene("hero").from - 3,
  endFrom: scene("end").from - 2,
  hops: [
    { at: ev("hook.hop"), dur: 13, height: 110 },
    { at: ev("trust.thumb"), dur: 10, height: 40 },
    { at: scene("end").from + 4, dur: 12, height: 60 },
  ],
  squashAt: (frame) =>
    interpolate(frame, [0, 7, 12, 15, 20], [1.22, 1.12, 0.84, 1.05, 1], clamp) *
    interpolate(frame - ev("hook.hop"), [-4, -1, 3, 11, 14, 18], [1, 0.88, 1.12, 1.05, 0.9, 1], clamp),
  tiltAt: (frame) =>
    frame < scene("hero").from
      ? Math.sin((frame / TL.fps) * Math.PI * 2 * 1.1) * 5
      : kf(frame, [
          [scene("hero").from, 0],
          [scene("hero").from + 12, 8],
          [scene("ecosystem").from, 8],
          [scene("ecosystem").from + 8, 5],
          [scene("trust").from, 5],
          [scene("trust").from + 8, 3],
          [scene("end").from, 3],
          [scene("end").from + 10, -6],
          [ev("end.wink") - 4, -6],
          [ev("end.wink") + 4, 7],
        ]) + (frame >= scene("ecosystem").from && frame < scene("trust").from ? Math.sin((frame / 15) * Math.PI) * 3 : 0),
  lookAt: (frame) => {
    const corner = frame >= scene("hero").from && frame < scene("end").from;
    if (corner) return { x: kf(frame, [[scene("hero").from, 0], [scene("hero").from + 10, 0.75]]), y: kf(frame, [[scene("hero").from, 0], [scene("hero").from + 10, -0.6]]) };
    if (frame >= scene("end").from)
      return {
        x: kf(frame, [[scene("end").from, 0.5], [ev("end.wink") - 6, 0.5], [ev("end.wink"), 0]]),
        y: kf(frame, [[scene("end").from, -0.8], [ev("end.wink") - 6, -0.8], [ev("end.wink"), 0]]),
      };
    return { x: 0, y: 0 };
  },
  flashAt: (frame) =>
    Math.max(
      interpolate(frame, [11, 12, 20], [0, 1, 0], clamp),
      interpolate(frame, [ev("hook.title"), ev("hook.title") + 1, ev("hook.title") + 7], [0, 0.6, 0], clamp),
    ),
};
