import React from "react";
import { interpolate } from "remotion";
import { clamp, Direction, Gesture, kf } from "../../components/CitybotActor";
import { Expression } from "../../citybot/Citybot";
import { gev, gscene, GTL } from "./timeline";

// Citybot's acting for the Samsung Galaxy Watch reel.
const S = (sec: number) => Math.round(sec * GTL.fps);
const classic = gscene("classic"), ultra = gscene("ultra"), specs = gscene("specs"), adv = gscene("adventure");
const trust = gscene("trust"), cta = gscene("cta"), end = gscene("end");

const gestures: Gesture[] = [
  { from: 0, to: S(0.9), arm: "left", pose: { rot: 120, hand: "wave" }, osc: 8 },
  { from: 0, to: S(0.9), arm: "right", pose: { rot: 120, hand: "wave" }, osc: 8 },
  { from: gev("hook.hop") - 4, to: gev("hook.hop") + S(0.6), arm: "left", pose: { rot: 125, hand: "wave" }, osc: 10 },
  { from: gev("hook.hop") - 4, to: gev("hook.hop") + S(0.6), arm: "right", pose: { rot: 125, hand: "wave" }, osc: 10 },
  // Classic: points at the watch
  { from: classic.from + 8, to: classic.to - 6, arm: "right", pose: { rot: 140, hand: "point" }, osc: 3 },
  // "for those who want adventure": both arms up, then point at the Ultra2
  { from: ultra.from, to: gev("ultra.watch") - 4, arm: "left", pose: { rot: 125, hand: "fist" }, osc: 6 },
  { from: ultra.from, to: gev("ultra.watch") - 4, arm: "right", pose: { rot: 125, hand: "fist" }, osc: 6 },
  { from: gev("ultra.watch") + 2, to: specs.to - 6, arm: "right", pose: { rot: 128, hand: "point" }, osc: 4 },
  // adventure: open arms
  { from: adv.from + 3, to: adv.to - 3, arm: "left", pose: { rot: 100, hand: "open" }, osc: 5 },
  { from: adv.from + 3, to: adv.to - 3, arm: "right", pose: { rot: 100, hand: "open" }, osc: 5 },
  // trust: thumbs up
  { from: gev("trust.thumb") - 3, to: trust.to - 4, arm: "right", pose: { rot: 72, hand: "thumb" } },
  // cta: point then wave
  { from: cta.from + 4, to: gev("cta.wave") - 3, arm: "right", pose: { rot: 140, hand: "point" }, osc: 3 },
  { from: gev("cta.wave"), to: cta.to - 4, arm: "right", pose: { rot: 122, hand: "wave" }, osc: 20 },
  // end card: wave, then thumbs up + wink (held)
  { from: end.from + 6, to: gev("end.wink") - 2, arm: "left", pose: { rot: 120, hand: "wave" }, osc: 18 },
  { from: gev("end.wink"), to: GTL.totalFrames + 60, arm: "right", pose: { rot: 72, hand: "thumb" } },
];

const expressionAt = (f: number): Expression => {
  if (f < classic.from) return "excited";
  if (f >= gev("end.wink")) return "wink";
  if (f >= end.from) return "happy";
  if (f >= gev("cta.wave") && f < cta.to) return "happy";
  if (f >= gev("trust.thumb") && f < trust.to) return "proud";
  if (f >= adv.from && f < adv.to) return "happy";
  if (f >= ultra.from && f < gev("ultra.watch")) return "excited";
  return "neutral";
};

/** Visual hook: Citybot's face-screen turns into a round Galaxy-style dial for a beat. */
const RoundDial: React.FC<{ p: number; f: number }> = ({ p, f }) => (
  <g opacity={p}>
    <rect x={108} y={68} width={184} height={219} fill="#07090f" />
    <circle cx={200} cy={178} r={84} fill="#0d1018" stroke="#3a4152" strokeWidth={6} />
    {Array.from({ length: 12 }).map((_, i) => (
      <line key={i} x1={200} y1={100} x2={200} y2={i % 3 ? 110 : 118} stroke="#fff" strokeWidth={i % 3 ? 3 : 5} transform={`rotate(${i * 30} 200 178)`} />
    ))}
    <line x1={200} y1={178} x2={200} y2={128} stroke="#fff" strokeWidth={7} strokeLinecap="round" transform="rotate(-60 200 178)" />
    <line x1={200} y1={178} x2={200} y2={112} stroke="#fff" strokeWidth={5} strokeLinecap="round" transform="rotate(60 200 178)" />
    <line x1={200} y1={190} x2={200} y2={104} stroke="#FF7A1A" strokeWidth={3} strokeLinecap="round" transform={`rotate(${f * 12} 200 178)`} />
    <circle cx={200} cy={178} r={6} fill="#FF7A1A" />
  </g>
);

const faceFrom = gev("hook.watchFace");
const faceTo = faceFrom + 16;

export const galaxyDirection: Direction = {
  gestures,
  expressionAt,
  cornerFrom: classic.from - 3,
  endFrom: end.from - 2,
  hops: [
    { at: gev("hook.hop"), dur: 12, height: 50 },
    { at: ultra.from, dur: 12, height: 70 },
    { at: gev("trust.thumb"), dur: 10, height: 40 },
    { at: end.from + 4, dur: 12, height: 60 },
    ...["adv.dive", "adv.run", "adv.everywhere"].map((k) => ({ at: gev(k), dur: 8, height: 22 })),
  ],
  squashAt: (f) =>
    interpolate(f, [0, 7, 12, 15, 20], [1.22, 1.12, 0.84, 1.05, 1], clamp) *
    interpolate(f - gev("hook.hop"), [-4, -1, 3, 10, 13, 17], [1, 0.9, 1.1, 1.04, 0.92, 1], clamp),
  tiltAt: (f) =>
    f < classic.from
      ? Math.sin((f / GTL.fps) * Math.PI * 2 * 1.1) * 5
      : kf(f, [
          [classic.from, 0],
          [classic.from + 12, 8],
          [ultra.from, 8],
          [ultra.from + 6, -4],
          [gev("ultra.watch"), -4],
          [gev("ultra.watch") + 8, 8],
          [adv.from, 8],
          [adv.from + 6, 0],
          [trust.from, 0],
          [trust.from + 8, 4],
          [end.from, 4],
          [end.from + 10, -6],
          [gev("end.wink") - 4, -6],
          [gev("end.wink") + 4, 7],
        ]),
  lookAt: (f) => {
    if (f >= classic.from && f < end.from) {
      const centre = (f >= adv.from && f < adv.to) || (f >= ultra.from && f < gev("ultra.watch"));
      return { x: centre ? 0.3 : kf(f, [[classic.from, 0], [classic.from + 10, 0.75]]), y: centre ? -0.3 : kf(f, [[classic.from, 0], [classic.from + 10, -0.6]]) };
    }
    if (f >= end.from)
      return { x: kf(f, [[end.from, 0.5], [gev("end.wink") - 6, 0.5], [gev("end.wink"), 0]]), y: kf(f, [[end.from, -0.8], [gev("end.wink") - 6, -0.8], [gev("end.wink"), 0]]) };
    return { x: 0, y: 0 };
  },
  flashAt: (f) =>
    Math.max(
      interpolate(f, [11, 12, 20], [0, 1, 0], clamp),
      interpolate(f, [faceTo - 2, faceTo, faceTo + 6], [0, 0.8, 0], clamp),
      interpolate(f, [gev("hook.title"), gev("hook.title") + 1, gev("hook.title") + 7], [0, 0.6, 0], clamp),
    ),
  faceAt: (f) => {
    if (f < faceFrom || f > faceTo) return null;
    const p = interpolate(f, [faceFrom, faceFrom + 3, faceTo - 3, faceTo], [0, 1, 1, 0], clamp);
    return <RoundDial p={p} f={f} />;
  },
};
