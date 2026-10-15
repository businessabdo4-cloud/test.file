import React from "react";
import { Img, staticFile } from "remotion";
import { COLORS } from "../brand";
import { PRODUCTS } from "../timeline";

/*
 * iPhone artwork.
 * Uses the OFFICIAL Apple press image when it exists in public/products
 * (e.g. iphone-18-pro-max_burgundy_back.png, see SOURCES.md).
 * Otherwise falls back to a clearly stylised, flat brand illustration of a generic
 * smartphone (no Apple logo, no photoreal render) so the reel never shows fan renders.
 */
export interface PhoneArtProps {
  model: "pro" | "pro-max";
  colour: { name: string; hex: string };
  view: "front" | "back";
  width: number;
  sweep?: number; // 0..1 position of a light sweep across the device, undefined = none
  screen?: React.ReactNode; // custom screen content (front view)
  id: string;
}

const shade = (hex: string, amt: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v + amt * 255)));
  return `rgb(${c(n >> 16)}, ${c((n >> 8) & 255)}, ${c(n & 255)})`;
};

export const officialImage = (model: string, colour: string, view: string) =>
  PRODUCTS[`iphone-18-${model}_${colour.toLowerCase()}_${view}`];

export const PhoneArt: React.FC<PhoneArtProps> = ({ model, colour, view, width, sweep, screen, id }) => {
  const h = width * 2.06;
  const official = officialImage(model, colour.name, view);
  const sweepLayer =
    sweep !== undefined && sweep > -0.2 && sweep < 1.2 ? (
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: width * 0.16,
          overflow: "hidden",
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-20%",
            bottom: "-20%",
            width: "35%",
            left: `${-40 + sweep * 140}%`,
            transform: "skewX(-18deg)",
            background: "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%)",
          }}
        />
      </div>
    ) : null;

  if (official) {
    return (
      <div style={{ position: "relative", width, height: h }}>
        <Img src={staticFile(official)} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        {sweepLayer}
      </div>
    );
  }

  const g = (n: string) => `${id}-${n}`;
  const body = colour.hex;
  const isDark = parseInt(body.slice(1, 3), 16) < 110;
  return (
    <div style={{ position: "relative", width, height: h }}>
      <svg viewBox="0 0 300 618" width={width} height={h} style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id={g("metal")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={shade(body, 0.12)} />
            <stop offset="0.45" stopColor={body} />
            <stop offset="1" stopColor={shade(body, -0.14)} />
          </linearGradient>
          <linearGradient id={g("edge")} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={shade(body, 0.25)} />
            <stop offset="0.5" stopColor={shade(body, -0.1)} />
            <stop offset="1" stopColor={shade(body, 0.2)} />
          </linearGradient>
          <linearGradient id={g("screen")} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={COLORS.blue} />
            <stop offset="0.6" stopColor={COLORS.mid} />
            <stop offset="1" stopColor={COLORS.cyan} />
          </linearGradient>
          <radialGradient id={g("lens")} cx="0.38" cy="0.35" r="0.7">
            <stop offset="0" stopColor="#4a5a8a" />
            <stop offset="0.35" stopColor="#141a2c" />
            <stop offset="1" stopColor="#05070d" />
          </radialGradient>
          <clipPath id={g("clip")}>
            <rect x={12} y={12} width={276} height={594} rx={44} />
          </clipPath>
        </defs>
        {/* frame / band */}
        <rect x={0} y={0} width={300} height={618} rx={54} fill={`url(#${g("edge")})`} />
        {view === "back" ? (
          <g>
            <rect x={7} y={7} width={286} height={604} rx={48} fill={`url(#${g("metal")})`} />
            <path d="M 7 140 Q 150 60 293 160 L 293 7 L 7 7 Z" fill="#fff" opacity={isDark ? 0.05 : 0.12} />
            {/* camera plateau (generic triple-camera layout) */}
            <rect x={24} y={24} width={156} height={160} rx={42} fill={shade(body, isDark ? 0.06 : -0.06)} stroke={shade(body, -0.2)} strokeWidth={2} />
            {[
              [64, 66],
              [64, 142],
              [136, 104],
            ].map(([cx, cy], i) => (
              <g key={i}>
                <circle cx={cx} cy={cy} r={31} fill={shade(body, -0.25)} />
                <circle cx={cx} cy={cy} r={25} fill={`url(#${g("lens")})`} />
                <circle cx={cx - 7} cy={cy - 8} r={5} fill="#fff" opacity={0.35} />
              </g>
            ))}
            <circle cx={140} cy={52} r={9} fill="#f3eddc" opacity={0.9} />
            <circle cx={140} cy={160} r={5} fill={shade(body, -0.35)} />
          </g>
        ) : (
          <g>
            <rect x={6} y={6} width={288} height={606} rx={50} fill="#07090f" />
            <g clipPath={`url(#${g("clip")})`}>
              {screen ? (
                <foreignObject x={12} y={12} width={276} height={594}>
                  <div style={{ width: 276, height: 594 }}>{screen}</div>
                </foreignObject>
              ) : (
                <>
                  <rect x={12} y={12} width={276} height={594} fill={`url(#${g("screen")})`} />
                  {Array.from({ length: 12 }).map((_, i) => (
                    <line key={i} x1={12 + i * 24} y1={12} x2={12 + i * 24} y2={606} stroke="#fff" strokeOpacity={0.12} />
                  ))}
                  {Array.from({ length: 25 }).map((_, i) => (
                    <line key={`h${i}`} x1={12} y1={12 + i * 24} x2={288} y2={12 + i * 24} stroke="#fff" strokeOpacity={0.12} />
                  ))}
                  <circle cx={150} cy={300} r={120} fill="#fff" opacity={0.08} />
                  <text x={150} y={345} textAnchor="middle" fontFamily="Montserrat" fontWeight={900} fontSize={140} fill="#fff">
                    18
                  </text>
                </>
              )}
            </g>
            <circle cx={150} cy={40} r={9} fill="#000" />
          </g>
        )}
      </svg>
      {sweepLayer}
    </div>
  );
};
