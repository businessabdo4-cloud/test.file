import React, { useMemo } from "react";
import { Easing, interpolate, random, useCurrentFrame } from "remotion";
import { lerp, sp } from "../anim";
import { ArmPose, Citybot, Expression } from "../citybot/Citybot";
import { MouthShape, Viseme } from "../citybot/Mouths";
import { BotPlace, Layout, useLayout } from "../layout";
import { Timeline, useTL } from "../timeline";

/*
 * Drives the persistent Citybot across a reel: placement (big in the hook / end card,
 * presenter in the lower-left corner in between), Rhubarb lip sync from the reel's timeline,
 * random blinks, idle hover bob, plus the reel-specific "direction" (gestures, expressions,
 * head tilt, gaze, hops, screen flashes). Directions live in src/reels/<reel>/direction.ts.
 */
export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Eased keyframe interpolation: keys = [[frame, value], ...]. */
export const kf = (frame: number, keys: [number, number][]) =>
  interpolate(
    frame,
    keys.map((k) => k[0]),
    keys.map((k) => k[1]),
    { ...clamp, easing: Easing.inOut(Easing.cubic) },
  );

export type Gesture = { from: number; to: number; arm: "left" | "right"; pose: ArmPose; osc?: number };

export interface Direction {
  gestures: Gesture[];
  expressionAt: (f: number) => Expression;
  /** frame the bot starts shrinking into the corner / growing into the end-card pose */
  cornerFrom: number;
  endFrom: number;
  hops: { at: number; dur: number; height: number }[];
  squashAt: (f: number) => number;
  tiltAt: (f: number) => number;
  lookAt: (f: number) => { x: number; y: number };
  flashAt: (f: number) => number;
  /** optional text shown on the face screen instead of the face (e.g. a watch face) */
  faceAt?: (f: number) => React.ReactNode | null;
}

const idleMouth: Record<Expression, MouthShape> = { excited: "grin", happy: "smile", proud: "smile", wink: "smile", neutral: "X" };

const blinkSchedule = (tl: Timeline) => {
  const out: number[] = [];
  for (let f = 40, i = 0; f < tl.totalFrames; i++) {
    out.push(f);
    f += Math.round(60 + random(`blink-${i}`) * 90); // every 2-5 s
  }
  return out;
};

const visemeAt = (tl: Timeline, frame: number): Viseme | null => {
  for (const line of tl.vo) {
    const t = (frame - line.from) / tl.fps;
    if (t < 0 || t > line.duration) continue;
    const cue = line.mouthCues.find((c) => t >= c.start && t < c.end);
    return (cue?.value as Viseme) ?? "X";
  }
  return null;
};

const armPose = (d: Direction, fps: number, frame: number, arm: "left" | "right"): ArmPose => {
  const idle = 16 + Math.sin((frame / fps) * Math.PI * 1.25 + (arm === "left" ? 0 : 1.3)) * 4;
  let rot = idle;
  let hand: ArmPose["hand"] = "open";
  for (const g of d.gestures) {
    if (g.arm !== arm || frame < g.from - 1 || frame > g.to + 14) continue;
    const w = sp(frame, g.from, { damping: 13, stiffness: 190 }) * (1 - sp(frame, g.to, { damping: 16, stiffness: 160 }));
    const osc = g.osc ? Math.sin(((frame - g.from) / fps) * Math.PI * 2 * 2.2) * g.osc : 0;
    rot = lerp(rot, g.pose.rot + osc, w);
    if (w > 0.5) hand = g.pose.hand;
  }
  return { rot, hand };
};

const placeAt = (d: Direction, frame: number, L: Layout): BotPlace => {
  const toCorner = sp(frame, d.cornerFrom, { damping: 16, stiffness: 120, mass: 0.9 });
  const toEnd = sp(frame, d.endFrom, { damping: 16, stiffness: 120, mass: 0.9 });
  const a = L.bot.hook, b = L.bot.corner, c = L.bot.end;
  const ab = { cx: lerp(a.cx, b.cx, toCorner), bottom: lerp(a.bottom, b.bottom, toCorner), width: lerp(a.width, b.width, toCorner) };
  return { cx: lerp(ab.cx, c.cx, toEnd), bottom: lerp(ab.bottom, c.bottom, toEnd), width: lerp(ab.width, c.width, toEnd) };
};

export const CitybotActor: React.FC<{ direction: Direction }> = ({ direction: d }) => {
  const frame = useCurrentFrame();
  const L = useLayout();
  const tl = useTL();
  const blinks = useMemo(() => blinkSchedule(tl), [tl]);
  const blink = (() => {
    for (const b of blinks) {
      const k = frame - b;
      if (k >= 0 && k < 6) return [0.5, 1, 1, 0.6, 0.25, 0][k];
    }
    return 0;
  })();
  const place = placeAt(d, frame, L);
  const height = place.width * 1.4;
  const unit = 400 / place.width; // screen px -> bot viewBox units

  // pop-in jump from below the frame
  const enter = sp(frame, 0, { damping: 10, stiffness: 150, mass: 0.8 });
  const enterY = (1 - enter) * (L.h - place.bottom + height + 60);
  const hop = d.hops.reduce((acc, h) => {
    const t = (frame - h.at) / h.dur;
    return acc + (t > 0 && t < 1 ? Math.sin(Math.PI * t) * h.height : 0);
  }, 0);
  const bob = Math.sin((frame / tl.fps) * Math.PI * 2 * 0.6) * 9;

  const expression = d.expressionAt(frame);
  const viseme = visemeAt(tl, frame);
  const mouth: MouthShape = viseme ?? idleMouth[expression];
  const look = d.lookAt(frame);
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
        blink={blink}
        lookX={look.x}
        lookY={look.y}
        tilt={d.tiltAt(frame)}
        leftArm={armPose(d, tl.fps, frame, "left")}
        rightArm={armPose(d, tl.fps, frame, "right")}
        hover={(bob + hop) * unit}
        squash={d.squashAt(frame)}
        flash={d.flashAt(frame)}
        thrust={Math.min(1, thrust)}
        face={d.faceAt?.(frame) ?? null}
      />
    </div>
  );
};
