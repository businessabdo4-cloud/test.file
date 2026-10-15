import { interpolate } from "remotion";
import { clamp, Direction, Gesture, kf } from "../../components/CitybotActor";
import { Expression } from "../../citybot/Citybot";
import { xev, xscene, XTL } from "./timeline";

// Citybot's acting for the DJI Osmo reel.
const intro = xscene("intro"), p4 = xscene("p4"), p4m = xscene("p4more"), bat = xscene("battery"), p3 = xscene("p3");
const combo = xscene("combo"), stab = xscene("stab"), trust = xscene("trust"), cta = xscene("cta"), end = xscene("end");
const you = xev("hook.you");

const gestures: Gesture[] = [
  // hook: holds up an imaginary phone, shaking; thumbs up when the Osmo lands
  { from: 8, to: you - 3, arm: "right", pose: { rot: 150, hand: "fist" }, osc: 10 },
  { from: you, to: intro.from + 6, arm: "right", pose: { rot: 72, hand: "thumb" } },
  { from: intro.from + 8, to: intro.to - 4, arm: "right", pose: { rot: 140, hand: "point" }, osc: 3 },
  { from: p4.from + 4, to: p4m.to - 4, arm: "right", pose: { rot: 135, hand: "point" }, osc: 3 },
  { from: bat.from + 3, to: bat.to - 3, arm: "left", pose: { rot: 100, hand: "open" }, osc: 5 },
  { from: bat.from + 3, to: bat.to - 3, arm: "right", pose: { rot: 100, hand: "open" }, osc: 5 },
  { from: p3.from + 4, to: combo.to - 4, arm: "right", pose: { rot: 140, hand: "point" }, osc: 3 },
  { from: xev("cb.all"), to: combo.to - 3, arm: "left", pose: { rot: 72, hand: "thumb" } },
  // stabilisation: jogging arms on walk / run / ride, thumbs up on "ثابت"
  { from: xev("st.walk"), to: xev("st.steady") - 2, arm: "left", pose: { rot: 60, hand: "fist" }, osc: 28 },
  { from: xev("st.walk"), to: xev("st.steady") - 2, arm: "right", pose: { rot: 60, hand: "fist" }, osc: 28 },
  { from: xev("st.steady"), to: stab.to - 2, arm: "right", pose: { rot: 72, hand: "thumb" } },
  { from: xev("trust.thumb") - 3, to: trust.to - 4, arm: "right", pose: { rot: 72, hand: "thumb" } },
  { from: cta.from + 2, to: xev("cta.wave") - 2, arm: "right", pose: { rot: 140, hand: "point" }, osc: 3 },
  { from: xev("cta.wave"), to: cta.to - 2, arm: "right", pose: { rot: 122, hand: "wave" }, osc: 20 },
  { from: end.from + 4, to: xev("end.wink") - 2, arm: "left", pose: { rot: 120, hand: "wave" }, osc: 18 },
  { from: xev("end.wink"), to: XTL.totalFrames + 60, arm: "right", pose: { rot: 72, hand: "thumb" } },
];

const expressionAt = (f: number): Expression => {
  if (f < intro.from) return f >= you ? "excited" : "neutral";
  if (f >= xev("end.wink")) return "wink";
  if (f >= end.from) return "happy";
  if (f >= xev("cta.wave") && f < cta.to) return "happy";
  if (f >= xev("trust.thumb") && f < trust.to) return "proud";
  if (f >= xev("st.steady") && f < stab.to) return "proud";
  if (f >= xev("st.walk") && f < xev("st.steady")) return "excited";
  if (f >= xev("cb.all") && f < combo.to) return "happy";
  return "neutral";
};

export const osmoDirection: Direction = {
  gestures,
  expressionAt,
  cornerFrom: intro.from - 3,
  endFrom: end.from - 2,
  hops: [
    { at: you, dur: 12, height: 56 },
    { at: xev("p4.fps"), dur: 10, height: 30 },
    { at: xev("cb.all"), dur: 10, height: 36 },
    ...[xev("st.walk"), xev("st.run"), xev("st.ride")].map((at) => ({ at, dur: 8, height: 22 })),
    { at: xev("trust.thumb"), dur: 10, height: 40 },
    { at: end.from + 3, dur: 12, height: 56 },
  ],
  squashAt: (f) =>
    interpolate(f, [0, 7, 12, 15, 20], [1.22, 1.12, 0.84, 1.05, 1], clamp) * interpolate(f - you, [0, 3, 8, 12], [1, 0.86, 1.05, 1], clamp),
  tiltAt: (f) =>
    f < intro.from
      ? f < you
        ? Math.sin(f * 1.9) * 4 // wobbling with the shaky phone
        : kf(f, [[you, -6], [you + 8, 8], [intro.from, 4]])
      : kf(f, [
          [intro.from, 4],
          [intro.from + 12, 8],
          [bat.from, 8],
          [bat.from + 6, 0],
          [p3.from, 0],
          [p3.from + 10, 8],
          [stab.from, 8],
          [stab.from + 6, 0],
          [trust.from, 0],
          [trust.from + 8, 4],
          [end.from, 4],
          [end.from + 8, -6],
          [xev("end.wink") - 3, -6],
          [xev("end.wink") + 3, 7],
        ]),
  lookAt: (f) => {
    if (f < intro.from) return f < you ? { x: -0.7, y: -0.5 } : { x: 0.7, y: -0.6 }; // phone on the left, Osmo on the right
    if (f >= intro.from && f < end.from) {
      const centre = f >= bat.from && f < bat.to;
      return { x: centre ? 0.3 : kf(f, [[intro.from, 0], [intro.from + 10, 0.75]]), y: centre ? -0.3 : kf(f, [[intro.from, 0], [intro.from + 10, -0.6]]) };
    }
    if (f >= end.from)
      return { x: kf(f, [[end.from, 0.5], [xev("end.wink") - 4, 0.5], [xev("end.wink"), 0]]), y: kf(f, [[end.from, -0.8], [xev("end.wink") - 4, -0.8], [xev("end.wink"), 0]]) };
    return { x: 0, y: 0 };
  },
  flashAt: (f) => Math.max(interpolate(f, [11, 12, 20], [0, 1, 0], clamp), interpolate(f, [xev("p4.photo"), xev("p4.photo") + 1, xev("p4.photo") + 8], [0, 0.7, 0], clamp)),
};
