import React from "react";
import { Img, staticFile } from "remotion";

/*
 * Over-ear headphones artwork for the Sony reel.
 * Uses an official product image when one is supplied (public/<reel>/products, see SOURCES);
 * otherwise a clean flat-vector illustration (no logos, not a photo) so the reel stays honest.
 * fold: 0 = worn shape, 1 = ear cups swivelled in (foldable design).
 */
export const HeadphoneArt: React.FC<{
  width: number;
  colour: string;
  variant?: "xm6" | "xm5";
  fold?: number;
  sweep?: number;
  id: string;
  official?: string | null;
}> = ({ width, colour, variant = "xm6", fold = 0, sweep = -1, id, official }) => {
  const h = width * 1.1;
  if (official) {
    return <Img src={staticFile(official)} style={{ width, height: h, objectFit: "contain" }} />;
  }
  const g = (n: string) => `${id}-${n}`;
  const band = variant === "xm6" ? 30 : 22;
  const cupRx = variant === "xm6" ? 64 : 58;
  const cupRy = variant === "xm6" ? 86 : 92;
  const swivel = fold * 62;
  return (
    <svg viewBox="0 0 400 440" width={width} height={h} style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id={g("cup")} cx="0.35" cy="0.3" r="0.85">
          <stop offset="0" stopColor="#fff" stopOpacity={0.28} />
          <stop offset="0.45" stopColor="#fff" stopOpacity={0.04} />
          <stop offset="1" stopColor="#000" stopOpacity={0.35} />
        </radialGradient>
        <linearGradient id={g("band")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity={0.25} />
          <stop offset="1" stopColor="#000" stopOpacity={0.25} />
        </linearGradient>
        <linearGradient id={g("sweep")} x1="0" y1="0" x2="1" y2="0.3">
          <stop offset={Math.max(0, sweep - 0.15)} stopColor="#fff" stopOpacity={0} />
          <stop offset={Math.min(1, Math.max(0, sweep))} stopColor="#fff" stopOpacity={0.45} />
          <stop offset={Math.min(1, sweep + 0.15)} stopColor="#fff" stopOpacity={0} />
        </linearGradient>
      </defs>
      {/* headband */}
      <path d="M 96 236 C 84 34, 316 34, 304 236" fill="none" stroke={colour} strokeWidth={band} strokeLinecap="round" />
      <path d="M 96 236 C 84 34, 316 34, 304 236" fill="none" stroke={`url(#${g("band")})`} strokeWidth={band} strokeLinecap="round" />
      <path d="M 120 150 C 130 66, 270 66, 280 150" fill="none" stroke="#fff" strokeOpacity={0.16} strokeWidth={4} strokeLinecap="round" />
      {/* inner cushion of the band */}
      <path d="M 128 120 C 150 76, 250 76, 272 120" fill="none" stroke="#000" strokeOpacity={0.35} strokeWidth={band * 0.5} strokeLinecap="round" />
      {[0, 1].map((side) => {
        const cx = side ? 304 : 96;
        const dir = side ? -1 : 1;
        return (
          <g key={side} transform={`rotate(${-dir * swivel} ${cx} 236) translate(${dir * fold * 30} ${-fold * 40})`}>
            {/* slider / yoke */}
            <rect x={cx - 9} y={222} width={18} height={56} rx={9} fill={colour} stroke="#000" strokeOpacity={0.25} strokeWidth={2} />
            {/* ear cup */}
            <ellipse cx={cx} cy={320} rx={cupRx} ry={cupRy} fill={colour} />
            <ellipse cx={cx} cy={320} rx={cupRx} ry={cupRy} fill={`url(#${g("cup")})`} />
            {/* cushion seen on the inner side */}
            <ellipse cx={cx + dir * cupRx * 0.62} cy={320} rx={cupRx * 0.36} ry={cupRy * 0.88} fill="#000" opacity={0.42} />
            <ellipse cx={cx - dir * cupRx * 0.25} cy={292} rx={cupRx * 0.32} ry={cupRy * 0.36} fill="#fff" opacity={0.08} />
            {/* mic slits */}
            <rect x={cx - dir * cupRx * 0.35 - 7} y={386} width={14} height={4} rx={2} fill="#000" opacity={0.35} />
          </g>
        );
      })}
      {sweep > -0.3 && sweep < 1.3 && (
        <g style={{ mixBlendMode: "screen" }}>
          <path d="M 96 236 C 84 34, 316 34, 304 236" fill="none" stroke={`url(#${g("sweep")})`} strokeWidth={band} strokeLinecap="round" />
          <ellipse cx={96} cy={320} rx={cupRx} ry={cupRy} fill={`url(#${g("sweep")})`} />
          <ellipse cx={304} cy={320} rx={cupRx} ry={cupRy} fill={`url(#${g("sweep")})`} />
        </g>
      )}
    </svg>
  );
};

export const SONY_COLOURS = { black: "#1B1C20", blue: "#1F2B4A" };
