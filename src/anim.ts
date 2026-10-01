import { Easing, interpolate, random, spring } from "remotion";

export const FPS = 30;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0..1 spring that starts at `start`. */
export const sp = (frame: number, start: number, cfg: { damping?: number; stiffness?: number; mass?: number } = {}, durationInFrames?: number) =>
  spring({ frame: frame - start, fps: FPS, config: { damping: 14, stiffness: 160, mass: 0.7, ...cfg }, durationInFrames });

/** Eased 0..1 ramp between two frames. */
export const ramp = (frame: number, a: number, b: number, ease: (t: number) => number = Easing.out(Easing.cubic)) =>
  interpolate(frame, [a, b], [0, 1], { ...clamp, easing: ease });

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** "Slam": big + blurred -> settles with overshoot. Returns css transform/filter/opacity. */
export const slam = (frame: number, start: number, from = 2.2) => {
  const p = sp(frame, start, { damping: 11, stiffness: 220, mass: 0.6 });
  const scale = lerp(from, 1, p);
  const blur = interpolate(frame - start, [0, 5], [14, 0], clamp);
  const opacity = interpolate(frame - start, [0, 2], [0, 1], clamp);
  return { transform: `scale(${scale})`, filter: `blur(${blur}px)`, opacity };
};

/** Pop-in scale with overshoot. */
export const pop = (frame: number, start: number) => sp(frame, start, { damping: 9, stiffness: 240, mass: 0.5 });

/** Decaying camera shake triggered at `at`. */
export const shake = (frame: number, at: number, amp = 18, dur = 10) => {
  const t = frame - at;
  if (t < 0 || t > dur) return { x: 0, y: 0 };
  const k = 1 - t / dur;
  return { x: (random(`sx${at}-${t}`) - 0.5) * 2 * amp * k * k, y: (random(`sy${at}-${t}`) - 0.5) * 2 * amp * k * k };
};

/** Scene in/out "zoom-through" transition relative to scene-local frame. */
export const sceneTransition = (local: number, duration: number, inF = 7, outF = 6) => {
  const pin = ramp(local, 0, inF, Easing.out(Easing.cubic));
  const pout = ramp(local, duration - outF, duration, Easing.in(Easing.cubic));
  const scale = lerp(0.86, 1, pin) * lerp(1, 1.22, pout);
  const blur = (1 - pin) * 14 + pout * 16;
  const opacity = Math.min(pin * 1.4, 1 - pout * 0.9);
  return { transform: `scale(${scale})`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined, opacity };
};
