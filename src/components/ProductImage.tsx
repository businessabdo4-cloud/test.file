import React from "react";
import { Img, staticFile } from "remotion";

/** Product cut-out with an optional light sweep (clipped to its alpha) and floor reflection. */
export const ProductImage: React.FC<{
  src: string;
  aspect: number; // height / width
  width: number;
  sweep?: number;
  reflection?: number;
  style?: React.CSSProperties;
  imgStyle?: React.CSSProperties;
}> = ({ src, aspect, width, sweep = -1, reflection = 0, style, imgStyle }) => {
  const h = width * aspect;
  return (
    <div style={{ position: "relative", width, height: h, ...style }}>
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", ...imgStyle }} />
      {sweep > -0.3 && sweep < 1.3 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            WebkitMaskImage: `url(${staticFile(src)})`,
            WebkitMaskSize: "100% 100%",
            mixBlendMode: "screen",
            background: `linear-gradient(105deg, rgba(255,255,255,0) ${sweep * 140 - 34}%, rgba(255,255,255,0.5) ${sweep * 140 - 17}%, rgba(255,255,255,0) ${sweep * 140}%)`,
          }}
        />
      )}
      {reflection > 0 && (
        <div style={{ position: "absolute", left: 0, top: h + 6, width, height: h, transform: "scaleY(-1)", opacity: reflection, WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 25%)" }}>
          <Img src={staticFile(src)} style={{ width: "100%", height: "100%" }} />
        </div>
      )}
    </div>
  );
};
