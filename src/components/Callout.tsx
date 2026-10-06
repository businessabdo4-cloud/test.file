import React from "react";
import { FONT } from "../brand";
import { ramp, sp } from "../anim";
import { IconName, LineIcon } from "./Icons";

/** Glass spec callout: icon draws on, value + label, slides in from `side` at frame `at`. */
export const Callout: React.FC<{
  frame: number;
  at: number;
  icon: IconName;
  value: string;
  label?: string;
  x: number;
  y: number;
  width: number;
  side?: -1 | 1;
  scale?: number;
  out?: number; // 0..1 exit progress
}> = ({ frame, at, icon, value, label, x, y, width, side = -1, scale = 1, out = 0 }) => {
  const p = sp(frame, at, { damping: 15, stiffness: 170 });
  if (frame < at - 1 || out >= 1) return null;
  const draw = ramp(frame, at + 2, at + 14);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        minWidth: width,
        width: "max-content",
        opacity: Math.min(1, p * 1.4) * (1 - out),
        transform: `translateX(${(1 - p + out) * 260 * side}px) scale(${scale})`,
        transformOrigin: side < 0 ? "left center" : "right center",
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "14px 22px 14px 16px",
        borderRadius: 28,
        background: "rgba(255,255,255,0.16)",
        border: "2px solid rgba(255,255,255,0.55)",
        backdropFilter: "blur(14px)",
        boxShadow: "0 12px 30px rgba(6,14,90,0.25)",
      }}
    >
      <div style={{ width: 66, height: 66, borderRadius: 20, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <LineIcon name={icon} size={50} progress={draw} stroke={6} />
      </div>
      <div style={{ fontFamily: FONT, color: "#fff", lineHeight: 1.05 }}>
        <div style={{ fontWeight: 900, fontSize: 38, whiteSpace: "nowrap" }}>{value}</div>
        {label ? <div style={{ fontWeight: 600, fontSize: 24, opacity: 0.9, whiteSpace: "nowrap" }}>{label}</div> : null}
      </div>
    </div>
  );
};
