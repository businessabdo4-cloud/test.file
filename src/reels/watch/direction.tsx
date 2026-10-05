import React from "react";
import { interpolate } from "remotion";
import { clamp, Direction, Gesture, kf } from "../../components/CitybotActor";
import { Expression } from "../../citybot/Citybot";
import { wev, wevList, wscene, WTL } from "./timeline";

// Citybot's acting for the Apple Watch Ultra 4 reel.
const S = (sec: number) => Math.round(sec * WTL.fps);
const hero = wscene("hero"), feat = wscene("features"), health = wscene("health"), trust = wscene("trust");
const cta = wscene("cta"), end = wscene("end");

const gestures: Gesture[] = [
  // hook: arms up on the pop-in and on "City Store!"
  { from: 0, to: S(0.9), arm: "left", pose: { rot: 120, hand: "wave" }, osc: 8 },
  { from: 0, to: S(0.9), arm: "right", pose: { rot: 120, hand: "wave" }, osc: 8 },
  { from: wev("hook.hop") - 4, to: wev("hook.hop") + S(0.7), arm: "left", pose: { rot: 128, hand: "wave" }, osc: 10 },
  { from: wev("hook.hop") - 4, to: wev("hook.hop") + S(0.7), arm: "right", pose: { rot: 128, hand: "wave" }, osc: 10 },
  // hero: points at the watch
  { from: hero.from + 8, to: hero.to - 6, arm: "right", pose: { rot: 140, hand: "point" }, osc: 3 },
  // features: points at each feature as it lands
  { from: feat.from + 6, to: feat.to - 6, arm: "right", pose: { rot: 112, hand: "point" }, osc: 4 },
  // health: open arms
  { from: health.from + 3, to: health.to - 3, arm: "left", pose: { rot: 100, hand: "open" }, osc: 5 },
  { from: health.from + 3, to: health.to - 3, arm: "right", pose: { rot: 100, hand: "open" }, osc: 5 },
  // trust: thumbs up on "original"
  { from: wev("trust.thumb") - 3, to: trust.to - 4, arm: "right", pose: { rot: 72, hand: "thumb" } },
  // cta: point at the phone, then wave
  { from: cta.from + 4, to: wev("cta.wave") - 3, arm: "right", pose: { rot: 140, hand: "point" }, osc: 3 },
  { from: wev("cta.wave"), to: cta.to - 4, arm: "right", pose: { rot: 122, hand: "wave" }, osc: 20 },
  // end card: wave, then thumbs up + wink (held to the last frame)
  { from: end.from + 8, to: wev("end.wink") - 2, arm: "left", pose: { rot: 120, hand: "wave" }, osc: 18 },
  { from: wev("end.wink"), to: WTL.totalFrames + 60, arm: "right", pose: { rot: 72, hand: "thumb" } },
];

const expressionAt = (f: number): Expression => {
  if (f < hero.from) return "excited";
  if (f >= wev("end.wink")) return "wink";
  if (f >= end.from) return "happy";
  if (f >= wev("cta.wave") && f < cta.to) return "happy";
  if (f >= wev("trust.thumb") && f < trust.to) return "proud";
  if (f >= health.from && f < health.to) return "happy";
  return "neutral";
};

/** Visual hook: for a beat after landing, Citybot's face-screen becomes an Ultra-style watch face. */
const WatchFace: React.FC<{ p: number }> = ({ p }) => (
  <g opacity={p}>
    <rect x={112} y={72} width={176} height={211} rx={32} fill="#07090f" />
    <path d="M 200 92 A 88 88 0 0 1 270 128" fill="none" stroke="#FF7A1A" strokeWidth={7} strokeLinecap="round" />
    <text x={200} y={140} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={20} fill="#7FE6FF" letterSpacing={3}>
      ULTRA 4
    </text>
    <text x={200} y={205} textAnchor="middle" fontFamily="Montserrat" fontWeight={800} fontSize={60} fill="#fff">
      10:09
    </text>
    <circle cx={150} cy={246} r={14} fill="none" stroke="#2BD96B" strokeWidth={5} />
    <circle cx={200} cy={246} r={14} fill="none" stroke="#7FE6FF" strokeWidth={5} />
    <circle cx={250} cy={246} r={14} fill="none" stroke="#FF4D6D" strokeWidth={5} />
  </g>
);

const faceFrom = wev("hook.watchFace");
const faceTo = faceFrom + 18;

export const watchDirection: Direction = {
  gestures,
  expressionAt,
  cornerFrom: hero.from - 3,
  endFrom: end.from - 2,
  hops: [
    { at: wev("hook.hop"), dur: 13, height: 60 },
    { at: wev("trust.thumb"), dur: 10, height: 40 },
    { at: end.from + 4, dur: 12, height: 60 },
    ...wevList("trust.checks").map((at) => ({ at, dur: 8, height: 18 })),
  ],
  squashAt: (f) =>
    interpolate(f, [0, 7, 12, 15, 20], [1.22, 1.12, 0.84, 1.05, 1], clamp) *
    interpolate(f - wev("hook.hop"), [-4, -1, 3, 11, 14, 18], [1, 0.88, 1.12, 1.05, 0.9, 1], clamp),
  tiltAt: (f) =>
    f < hero.from
      ? Math.sin((f / WTL.fps) * Math.PI * 2 * 1.1) * 5
      : kf(f, [
          [hero.from, 0],
          [hero.from + 12, 8],
          [feat.from, 8],
          [feat.from + 8, 6],
          [health.from, 6],
          [health.from + 6, 0],
          [trust.from, 0],
          [trust.from + 8, 4],
          [end.from, 4],
          [end.from + 10, -6],
          [wev("end.wink") - 4, -6],
          [wev("end.wink") + 4, 7],
        ]),
  lookAt: (f) => {
    if (f >= hero.from && f < end.from) {
      const centre = f >= health.from && f < health.to;
      return { x: centre ? 0.3 : kf(f, [[hero.from, 0], [hero.from + 10, 0.75]]), y: centre ? -0.2 : kf(f, [[hero.from, 0], [hero.from + 10, -0.6]]) };
    }
    if (f >= end.from)
      return { x: kf(f, [[end.from, 0.5], [wev("end.wink") - 6, 0.5], [wev("end.wink"), 0]]), y: kf(f, [[end.from, -0.8], [wev("end.wink") - 6, -0.8], [wev("end.wink"), 0]]) };
    return { x: 0, y: 0 };
  },
  flashAt: (f) =>
    Math.max(
      interpolate(f, [11, 12, 20], [0, 1, 0], clamp),
      interpolate(f, [faceTo - 2, faceTo, faceTo + 6], [0, 0.8, 0], clamp),
      interpolate(f, [wev("hook.ultra"), wev("hook.ultra") + 1, wev("hook.ultra") + 7], [0, 0.6, 0], clamp),
    ),
  faceAt: (f) => {
    if (f < faceFrom || f > faceTo) return null;
    const p = interpolate(f, [faceFrom, faceFrom + 3, faceTo - 3, faceTo], [0, 1, 1, 0], clamp);
    return <WatchFace p={p} />;
  },
};
