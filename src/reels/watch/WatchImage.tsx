import React from "react";
import { Img, staticFile } from "remotion";
import { WATCH_ASPECT, WATCH_IMG } from "./timeline";

/** Official Apple Watch Ultra 4 cut-out with an optional light sweep (clipped to its alpha) and floor reflection. */
export const WatchImage: React.FC<{ width: number; sweep?: number; reflection?: number; style?: React.CSSProperties }> = ({
  width,
  sweep = -1,
  reflection = 0,
  style,
}) => {
  const h = width * WATCH_ASPECT;
  return (
    <div style={{ position: "relative", width, height: h, ...style }}>
      <Img src={staticFile(WATCH_IMG)} style={{ width: "100%", height: "100%" }} />
      {sweep > -0.3 && sweep < 1.3 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            WebkitMaskImage: `url(${staticFile(WATCH_IMG)})`,
            WebkitMaskSize: "100% 100%",
            mixBlendMode: "screen",
            background: `linear-gradient(105deg, rgba(255,255,255,0) ${sweep * 140 - 34}%, rgba(255,255,255,0.5) ${sweep * 140 - 17}%, rgba(255,255,255,0) ${sweep * 140}%)`,
          }}
        />
      )}
      {reflection > 0 && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: h + 6,
            width,
            height: h,
            transform: "scaleY(-1)",
            opacity: reflection,
            WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 25%)",
          }}
        >
          <Img src={staticFile(WATCH_IMG)} style={{ width: "100%", height: "100%" }} />
        </div>
      )}
    </div>
  );
};
