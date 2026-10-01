import React from "react";
import { Easing, interpolate, random, useCurrentFrame } from "remotion";
import { lerp, sp } from "../anim";
import { ArmPose, Citybot, Expression } from "../citybot/Citybot";
import { MouthShape, Viseme } from "../citybot/Mouths";
import { BotPlace, useLayout } from "../layout";
import { ev, scene, TL } from "../timeline";

/*
 * Drives the persistent Citybot across the whole reel from the shared timeline:
 * placement (big in the hook/end card, presenter in the lower-left corner in between),
 * Rhubarb lip sync, random blinks, idle hover bob, gestures and expressions.
 */
const S = (sec: number) => Math.round(sec * TL.fps);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Eased keyframe interpolation: keys = [[frame, value], ...]. */
const kf = (frame: number, keys: [number, number][]) =>
  interpolate(
    frame,
    keys.map((k) => k[0]),
    keys.map((k) => k[1]),
    { ...clamp, easing: Easing.inOut(Easing.cubic) },
  );

// ---- blinks every 2-5 s (deterministic)
const BLINKS: number[] = [];
for (let f = 40, i = 0; f < TL.totalFrames; i++) {
  BLINKS.push(f);
  f += Math.round(60 + random(`blink-${i}`) * 90);
}
const blinkAt = (frame: number) => {
  for (const b of BLINKS) {
    const d = frame - b;
    if (d >= 0 && d < 6) return [0.5, 1, 1, 0.6, 0.25, 0][d];
  }
  return 0;
};

// ---- lip sync
const visemeAt = (frame: number): Viseme | null => {
  for (const line of TL.vo) {
    const t = (frame - line.from) / TL.fps;
    if (t < 0 || t > line.duration) continue;
    const cue = line.mouthCues.find((c) => t >= c.start && t < c.end);
    return (cue?.value as Viseme) ?? "X";
  }
  return null;
};

// ---- gestures: [from, to, arm, pose, oscillation amplitude]
type Gesture = { from: number; to: number; arm: "left" | "right"; pose: ArmPose; osc?: number };
const G: Gesture[] = [
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

const armPose = (frame: number, arm: "left" | "right"): ArmPose => {
  const idle = 16 + Math.sin((frame / TL.fps) * Math.PI * 1.25 + (arm === "left" ? 0 : 1.3)) * 4;
  let rot = idle;
  let hand: ArmPose["hand"] = "open";
  for (const g of G) {
    if (g.arm !== arm || frame < g.from - 1 || frame > g.to + 14) continue;
    const w = sp(frame, g.from, { damping: 13, stiffness: 190 }) * (1 - sp(frame, g.to, { damping: 16, stiffness: 160 }));
    const osc = g.osc ? Math.sin(((frame - g.from) / TL.fps) * Math.PI * 2 * 2.2) * g.osc : 0;
    rot = lerp(rot, g.pose.rot + osc, w);
    if (w > 0.5) hand = g.pose.hand;
  }
  return { rot, hand };
};

const expressionAt = (frame: number): Expression => {
  if (frame < scene("hero").from) return "excited";
  if (frame >= ev("end.wink")) return "wink";
  if (frame >= scene("end").from) return "happy";
  if (frame >= ev("cta.wave") && frame < scene("cta").to) return "happy";
  if (frame >= ev("trust.thumb") && frame < scene("trust").to) return "proud";
  return "neutral";
};

const idleMouth: Record<Expression, MouthShape> = { excited: "grin", happy: "smile", proud: "smile", wink: "smile", neutral: "X" };

const placeAt = (frame: number, L: ReturnType<typeof useLayout>): BotPlace => {
  const toCorner = sp(frame, scene("hero").from - 3, { damping: 16, stiffness: 120, mass: 0.9 });
  const toEnd = sp(frame, scene("end").from - 2, { damping: 16, stiffness: 120, mass: 0.9 });
  const a = L.bot.hook, b = L.bot.corner, c = L.bot.end;
  const ab = { cx: lerp(a.cx, b.cx, toCorner), bottom: lerp(a.bottom, b.bottom, toCorner), width: lerp(a.width, b.width, toCorner) };
  return { cx: lerp(ab.cx, c.cx, toEnd), bottom: lerp(ab.bottom, c.bottom, toEnd), width: lerp(ab.width, c.width, toEnd) };
};

export const CitybotActor: React.FC = () => {
  const frame = useCurrentFrame();
  const L = useLayout();
  const place = placeAt(frame, L);
  const height = place.width * 1.4;
  const unit = 400 / place.width; // screen px -> bot viewBox units

  // pop-in jump from below the frame
  const enter = sp(frame, 0, { damping: 10, stiffness: 150, mass: 0.8 });
  const enterY = (1 - enter) * (L.h - place.bottom + height + 60);
  // excited hop on "City Store", small hop on the thumbs up
  const hopArc = (at: number, dur: number, hgt: number) => {
    const t = (frame - at) / dur;
    return t > 0 && t < 1 ? Math.sin(Math.PI * t) * hgt : 0;
  };
  const hop = hopArc(ev("hook.hop"), 13, 110) + hopArc(ev("trust.thumb"), 10, 40) + hopArc(scene("end").from + 4, 12, 60);
  const bob = Math.sin((frame / TL.fps) * Math.PI * 2 * 0.6) * 9;
  const squash =
    interpolate(frame, [0, 7, 12, 15, 20], [1.22, 1.12, 0.84, 1.05, 1], clamp) *
    interpolate(frame - ev("hook.hop"), [-4, -1, 3, 11, 14, 18], [1, 0.88, 1.12, 1.05, 0.9, 1], clamp);

  const expression = expressionAt(frame);
  const viseme = visemeAt(frame);
  const mouth: MouthShape = viseme ?? idleMouth[expression];

  const corner = frame >= scene("hero").from && frame < scene("end").from;
  const tilt =
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
        ]) + (frame >= scene("ecosystem").from && frame < scene("trust").from ? Math.sin((frame / 15) * Math.PI) * 3 : 0);
  const lookX = corner ? kf(frame, [[scene("hero").from, 0], [scene("hero").from + 10, 0.75]]) : frame >= scene("end").from ? kf(frame, [[scene("end").from, 0.5], [ev("end.wink") - 6, 0.5], [ev("end.wink"), 0]]) : 0;
  const lookY = corner ? kf(frame, [[scene("hero").from, 0], [scene("hero").from + 10, -0.6]]) : frame >= scene("end").from ? kf(frame, [[scene("end").from, -0.8], [ev("end.wink") - 6, -0.8], [ev("end.wink"), 0]]) : 0;

  const flash = Math.max(
    interpolate(frame, [11, 12, 20], [0, 1, 0], clamp),
    interpolate(frame, [ev("hook.title"), ev("hook.title") + 1, ev("hook.title") + 7], [0, 0.6, 0], clamp),
  );
  const thrust = 0.55 + Math.sin(frame * 1.7) * 0.08 + (hop > 0 ? 0.35 : 0) + (1 - enter) * 0.4;

  return (
    <div
      style={{
        position: "absolute",
        left: place.cx - place.width / 2,
        top: place.bottom - height,
        width: place.width,
        height,
        transform: `translateY(${enterY}px)`,
      }}
    >
      <Citybot
        id="actor"
        width={place.width}
        mouth={mouth}
        expression={expression}
        blink={blinkAt(frame)}
        lookX={lookX}
        lookY={lookY}
        tilt={tilt}
        leftArm={armPose(frame, "left")}
        rightArm={armPose(frame, "right")}
        hover={(bob + hop) * unit}
        squash={squash}
        flash={flash}
        thrust={Math.min(1, thrust)}
      />
    </div>
  );
};
