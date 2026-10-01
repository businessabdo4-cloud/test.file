import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { GRADIENT, GRID } from "../brand";

/**
 * Logo background: blue->cyan horizontal gradient + thin white grid.
 * The grid drifts linearly and has a slow perspective zoom (the only linear motion in the reel).
 */
export const BrandBackground: React.FC<{ drift?: boolean; gridOpacity?: number }> = ({ drift = true, gridOpacity = GRID.opacity }) => {
  const frame = useCurrentFrame();
  const { width, durationInFrames } = useVideoConfig();
  const t = drift ? frame / Math.max(1, durationInFrames) : 0;
  const pitch = GRID.pitch * (width / 1080);
  const offset = drift ? (frame * 0.6) % pitch : 0;
  const zoom = 1 + t * 0.12;
  return (
    <AbsoluteFill style={{ background: GRADIENT, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `perspective(1600px) rotateX(${drift ? 6 : 0}deg) scale(${zoom})`,
          transformOrigin: "50% 60%",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: -pitch * 3,
            backgroundImage: `linear-gradient(to right, rgba(255,255,255,${gridOpacity}) ${GRID.lineWidth}px, transparent ${GRID.lineWidth}px),
              linear-gradient(to bottom, rgba(255,255,255,${gridOpacity}) ${GRID.lineWidth}px, transparent ${GRID.lineWidth}px)`,
            backgroundSize: `${pitch}px ${pitch}px`,
            transform: `translate(${-offset}px, ${-offset * 0.5}px)`,
          }}
        />
      </AbsoluteFill>
      {/* soft vignette for depth */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0) 55%, rgba(5,10,80,0.22) 100%)` }} />
    </AbsoluteFill>
  );
};
