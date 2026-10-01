import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { sceneTransition } from "../anim";
import { scene, SceneId } from "../timeline";

/** Absolute frame inside a <Sequence> scene. */
export const useSceneFrame = (id: SceneId) => useCurrentFrame() + scene(id).from;

/** Wraps a scene with the zoom-through in/out transition (cuts land on the beat). */
export const SceneShell: React.FC<{ id: SceneId; children: React.ReactNode; shakeX?: number; shakeY?: number; noOut?: boolean }> = ({
  id,
  children,
  shakeX = 0,
  shakeY = 0,
  noOut,
}) => {
  const local = useCurrentFrame();
  const s = scene(id);
  const t = sceneTransition(local, noOut ? 1e6 : s.to - s.from);
  return (
    <AbsoluteFill style={{ ...t, transform: `${t.transform} translate(${shakeX}px, ${shakeY}px)` }}>{children}</AbsoluteFill>
  );
};

/** Text with an animated light sweep (gradient clipped to the glyphs). */
export const SweepText: React.FC<{ text: string; style: React.CSSProperties; sweep: number }> = ({ text, style, sweep }) => (
  <div style={{ position: "relative", ...style }}>
    <span>{text}</span>
    {sweep > -0.3 && sweep < 1.3 && (
      <span
        style={{
          position: "absolute",
          inset: 0,
          color: "transparent",
          backgroundImage: `linear-gradient(105deg, rgba(255,255,255,0) ${sweep * 140 - 30}%, rgba(140,235,255,1) ${sweep * 140 - 15}%, rgba(255,255,255,0) ${sweep * 140}%)`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          textShadow: "none",
        }}
      >
        {text}
      </span>
    )}
  </div>
);

/** Rotating light burst behind hero elements. */
export const Burst: React.FC<{ x: number; y: number; r: number; rot: number; opacity: number; rays?: number }> = ({ x, y, r, rot, opacity, rays = 18 }) => (
  <svg style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, opacity }} viewBox="-100 -100 200 200">
    <defs>
      <radialGradient id={`burst-${x}-${y}`}>
        <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </radialGradient>
    </defs>
    <g transform={`rotate(${rot})`}>
      {Array.from({ length: rays }).map((_, i) => (
        <path key={i} d="M0 0 L-6 -100 L6 -100 Z" fill={`url(#burst-${x}-${y})`} transform={`rotate(${(360 / rays) * i})`} />
      ))}
    </g>
  </svg>
);
