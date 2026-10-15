import { interpolate } from "remotion";
import { sp } from "../../anim";
import { clamp, Direction, Gesture, kf } from "../../components/CitybotActor";
import { SONY_COLOURS } from "../../components/HeadphoneArt";
import { Expression } from "../../citybot/Citybot";
import { sev, sscene, STL } from "./timeline";

// Citybot's acting for the Sony reel: covers its "ears" in the noise, headphones drop on, bliss.
const S = (sec: number) => Math.round(sec * STL.fps);
const xm6 = sscene("xm6"), anc = sscene("anc"), xm5 = sscene("xm5"), bat = sscene("battery");
const trust = sscene("trust"), cta = sscene("cta"), end = sscene("end");
const you = sev("hook.you"), silence = sev("hook.silence");

const gestures: Gesture[] = [
  // the noise: hands up by the head, shaking
  { from: S(0.3), to: you - 2, arm: "left", pose: { rot: 150, hand: "open" }, osc: 7 },
  { from: S(0.3), to: you - 2, arm: "right", pose: { rot: 150, hand: "open" }, osc: 7 },
  // silence: relaxed thumbs up
  { from: silence + 2, to: xm6.from - 2, arm: "right", pose: { rot: 72, hand: "thumb" } },
  // products: point
  { from: xm6.from + 8, to: anc.to - 6, arm: "right", pose: { rot: 140, hand: "point" }, osc: 3 },
  { from: xm5.from + 6, to: xm5.to - 6, arm: "right", pose: { rot: 130, hand: "point" }, osc: 3 },
  // battery: open arms
  { from: bat.from + 3, to: bat.to - 3, arm: "left", pose: { rot: 100, hand: "open" }, osc: 5 },
  { from: bat.from + 3, to: bat.to - 3, arm: "right", pose: { rot: 100, hand: "open" }, osc: 5 },
  { from: sev("trust.thumb") - 3, to: trust.to - 4, arm: "right", pose: { rot: 72, hand: "thumb" } },
  { from: cta.from + 4, to: sev("cta.wave") - 3, arm: "right", pose: { rot: 140, hand: "point" }, osc: 3 },
  { from: sev("cta.wave"), to: cta.to - 4, arm: "right", pose: { rot: 122, hand: "wave" }, osc: 20 },
  { from: end.from + 6, to: sev("end.wink") - 2, arm: "left", pose: { rot: 120, hand: "wave" }, osc: 18 },
  { from: sev("end.wink"), to: STL.totalFrames + 60, arm: "right", pose: { rot: 72, hand: "thumb" } },
];

const expressionAt = (f: number): Expression => {
  if (f < you) return "excited"; // wide eyes in the racket
  if (f < xm6.from) return f >= silence ? "happy" : "neutral";
  if (f >= sev("end.wink")) return "wink";
  if (f >= end.from) return "happy";
  if (f >= sev("cta.wave") && f < cta.to) return "happy";
  if (f >= sev("trust.thumb") && f < trust.to) return "proud";
  if (f >= anc.from && f < anc.to) return "happy";
  return "neutral";
};

export const sonyDirection: Direction = {
  gestures,
  expressionAt,
  cornerFrom: xm6.from - 3,
  endFrom: end.from - 2,
  hops: [
    { at: silence, dur: 12, height: 60 },
    { at: sev("trust.thumb"), dur: 10, height: 40 },
    { at: end.from + 4, dur: 12, height: 60 },
    ...[0, 1, 2].map((k) => ({ at: [sev("hook.horn") + 6, sev("hook.neighbours"), sev("hook.bus")][k], dur: 6, height: 14 })),
  ],
  squashAt: (f) =>
    interpolate(f, [0, 7, 12, 15, 20], [1.22, 1.12, 0.84, 1.05, 1], clamp) *
    interpolate(f - you, [0, 3, 8, 12], [1, 0.86, 1.05, 1], clamp),
  // jittery head in the noise, calm afterwards
  tiltAt: (f) =>
    f < you
      ? Math.sin(f * 2.3) * 6 + Math.sin(f * 0.9) * 3
      : f < xm6.from
        ? interpolate(f, [you, silence, silence + 10], [0, -8, 4], clamp)
        : kf(f, [
            [xm6.from, 4],
            [xm6.from + 12, 8],
            [bat.from, 8],
            [bat.from + 6, 0],
            [trust.from, 0],
            [trust.from + 8, 4],
            [end.from, 4],
            [end.from + 10, -6],
            [sev("end.wink") - 4, -6],
            [sev("end.wink") + 4, 7],
          ]),
  lookAt: (f) => {
    if (f < you) return { x: Math.sin(f * 0.7) * 0.8, y: -0.2 }; // glancing around at the noise
    if (f >= xm6.from && f < end.from) {
      const centre = f >= bat.from && f < bat.to;
      return { x: centre ? 0.3 : kf(f, [[xm6.from, 0], [xm6.from + 10, 0.75]]), y: centre ? -0.3 : kf(f, [[xm6.from, 0], [xm6.from + 10, -0.6]]) };
    }
    if (f >= end.from)
      return { x: kf(f, [[end.from, 0.5], [sev("end.wink") - 6, 0.5], [sev("end.wink"), 0]]), y: kf(f, [[end.from, -0.8], [sev("end.wink") - 6, -0.8], [sev("end.wink"), 0]]) };
    return { x: 0, y: 0 };
  },
  flashAt: (f) => Math.max(interpolate(f, [11, 12, 20], [0, 1, 0], clamp), interpolate(f, [silence, silence + 1, silence + 8], [0, 0.9, 0], clamp)),
  headphonesAt: (f) => {
    if (f < you - 1) return null;
    const blue = f >= sev("xm6.blue") && f < xm5.from;
    return { color: blue ? SONY_COLOURS.blue : SONY_COLOURS.black, p: sp(f, you, { damping: 12, stiffness: 170, mass: 0.7 }) };
  },
};
