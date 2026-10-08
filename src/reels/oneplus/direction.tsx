import { interpolate } from "remotion";
import { clamp, Direction, Gesture, kf } from "../../components/CitybotActor";
import { Expression } from "../../citybot/Citybot";
import { oev, oscene, OTL } from "./timeline";

// Citybot's acting for the OnePlus Watch 3 reel.
const S = (sec: number) => Math.round(sec * OTL.fps);
const intro = oscene("intro"), em = oscene("emerald"), ti = oscene("titanium"), dp = oscene("display");
const bat = oscene("battery"), hl = oscene("health"), trust = oscene("trust"), cta = oscene("cta"), end = oscene("end");
const noCharge = oev("hook.noCharge");

const gestures: Gesture[] = [
  // hook: points at the watch, then a big thumbs up on "بلا شارج"
  { from: S(0.25), to: noCharge - 4, arm: "right", pose: { rot: 145, hand: "point" }, osc: 3 },
  { from: noCharge - 2, to: intro.from + 4, arm: "right", pose: { rot: 72, hand: "thumb" } },
  { from: intro.from + 6, to: em.from - 2, arm: "right", pose: { rot: 140, hand: "point" }, osc: 3 },
  // emerald: "wow" open arms
  { from: em.from + 4, to: em.to - 3, arm: "left", pose: { rot: 125, hand: "open" }, osc: 4 },
  { from: em.from + 4, to: em.to - 3, arm: "right", pose: { rot: 125, hand: "open" }, osc: 4 },
  { from: ti.from + 4, to: ti.to - 4, arm: "right", pose: { rot: 140, hand: "point" }, osc: 3 },
  // display: shades its eyes from the sun
  { from: oev("dp.bright"), to: dp.to - 3, arm: "right", pose: { rot: 168, hand: "open" } },
  { from: dp.from + 4, to: oev("dp.bright") - 2, arm: "right", pose: { rot: 140, hand: "point" }, osc: 3 },
  // battery: open arms
  { from: bat.from + 3, to: bat.to - 3, arm: "left", pose: { rot: 100, hand: "open" }, osc: 5 },
  { from: bat.from + 3, to: bat.to - 3, arm: "right", pose: { rot: 100, hand: "open" }, osc: 5 },
  // health: jogging arms on "sport", point at Wear OS
  { from: oev("hl.sport"), to: oev("hl.wear") - 2, arm: "left", pose: { rot: 60, hand: "fist" }, osc: 28 },
  { from: oev("hl.sport"), to: oev("hl.wear") - 2, arm: "right", pose: { rot: 60, hand: "fist" }, osc: 28 },
  { from: oev("hl.wear"), to: hl.to - 4, arm: "right", pose: { rot: 140, hand: "point" }, osc: 3 },
  { from: oev("trust.thumb") - 3, to: trust.to - 4, arm: "right", pose: { rot: 72, hand: "thumb" } },
  { from: cta.from + 2, to: oev("cta.wave") - 2, arm: "right", pose: { rot: 140, hand: "point" }, osc: 3 },
  { from: oev("cta.wave"), to: cta.to - 2, arm: "right", pose: { rot: 122, hand: "wave" }, osc: 20 },
  { from: end.from + 4, to: oev("end.wink") - 2, arm: "left", pose: { rot: 120, hand: "wave" }, osc: 18 },
  { from: oev("end.wink"), to: OTL.totalFrames + 60, arm: "right", pose: { rot: 72, hand: "thumb" } },
];

const expressionAt = (f: number): Expression => {
  if (f < intro.from) return f >= noCharge ? "proud" : "excited";
  if (f >= oev("end.wink")) return "wink";
  if (f >= end.from) return "happy";
  if (f >= oev("cta.wave") && f < cta.to) return "happy";
  if (f >= oev("trust.thumb") && f < trust.to) return "proud";
  if (f >= em.from && f < em.to) return "excited";
  if (f >= oev("dp.bright") && f < dp.to) return "wink"; // squinting in the sun
  if (f >= oev("hl.sleep") && f < oev("hl.sport")) return "happy";
  return "neutral";
};

export const oneplusDirection: Direction = {
  gestures,
  expressionAt,
  cornerFrom: intro.from - 3,
  endFrom: end.from - 2,
  hops: [
    { at: noCharge, dur: 12, height: 56 },
    { at: em.from + 2, dur: 10, height: 34 },
    { at: oev("bat.eco"), dur: 10, height: 40 },
    { at: oev("trust.thumb"), dur: 10, height: 40 },
    { at: end.from + 3, dur: 12, height: 56 },
  ],
  squashAt: (f) =>
    interpolate(f, [0, 7, 12, 15, 20], [1.22, 1.12, 0.84, 1.05, 1], clamp) *
    interpolate(f - noCharge, [0, 3, 8, 12], [1, 0.86, 1.05, 1], clamp),
  tiltAt: (f) =>
    f < intro.from
      ? kf(f, [[0, 0], [noCharge - 4, -6], [noCharge + 4, 8], [intro.from, 4]])
      : kf(f, [
          [intro.from, 4],
          [intro.from + 12, 8],
          [bat.from, 8],
          [bat.from + 6, 0],
          ...Array.from({ length: 4 }, (_, k) => [oev("hl.sport") + k * 5, k % 2 ? -6 : 6] as [number, number]),
          [oev("hl.wear"), 4],
          [trust.from, 0],
          [trust.from + 8, 4],
          [end.from, 4],
          [end.from + 8, -6],
          [oev("end.wink") - 3, -6],
          [oev("end.wink") + 3, 7],
        ]),
  lookAt: (f) => {
    if (f < intro.from) return { x: 0.6, y: -0.8 }; // looking up at the watch
    if (f >= intro.from && f < end.from) {
      const centre = f >= bat.from && f < bat.to;
      return { x: centre ? 0.3 : kf(f, [[intro.from, 0], [intro.from + 10, 0.75]]), y: centre ? -0.3 : kf(f, [[intro.from, 0], [intro.from + 10, -0.6]]) };
    }
    if (f >= end.from)
      return { x: kf(f, [[end.from, 0.5], [oev("end.wink") - 4, 0.5], [oev("end.wink"), 0]]), y: kf(f, [[end.from, -0.8], [oev("end.wink") - 4, -0.8], [oev("end.wink"), 0]]) };
    return { x: 0, y: 0 };
  },
  // face flash at the start and when the sun hits
  flashAt: (f) => Math.max(interpolate(f, [11, 12, 20], [0, 1, 0], clamp), interpolate(f, [oev("dp.sun"), oev("dp.sun") + 1, oev("dp.sun") + 10], [0, 0.6, 0], clamp)),
};
