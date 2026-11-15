import React from "react";

const LINE = "#2A1A22";
const OUT = { stroke: LINE, strokeWidth: 5, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/** 8-point zellige star tile (40x40) */
const ZelligeDefs: React.FC<{ id: string }> = ({ id }) => (
  <defs>
    <pattern id={id} width={60} height={60} patternUnits="userSpaceOnUse">
      <rect width={60} height={60} fill="#F7F1E6" />
      <g transform="translate(30 30)">
        <rect x={-16} y={-16} width={32} height={32} fill="#2F6FB0" />
        <rect x={-16} y={-16} width={32} height={32} fill="#2F6FB0" transform="rotate(45)" />
        <circle r={8} fill="#F2C14E" />
      </g>
      {[[0, 0], [60, 0], [0, 60], [60, 60]].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <rect x={-7} y={-7} width={14} height={14} fill="#2E8B6B" transform="rotate(45)" />
        </g>
      ))}
    </pattern>
  </defs>
);

/** Hamza's living room (warm, soft palette). Back layer only: the sofa's front is <SofaFront/>. 1080x1920. */
export const RoomBack: React.FC<{ lampGlow?: number }> = ({ lampGlow = 1 }) => (
  <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
    <ZelligeDefs id="zel" />
    <defs>
      <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#F6E2C4" />
        <stop offset="1" stopColor="#EBCDA4" />
      </linearGradient>
      <radialGradient id="lamp" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#FFE9A8" stopOpacity={0.85} />
        <stop offset="1" stopColor="#FFE9A8" stopOpacity={0} />
      </radialGradient>
    </defs>
    <rect width={1080} height={1920} fill="url(#wall)" />
    {/* framed picture */}
    <rect x={150} y={330} width={250} height={180} rx={10} fill="#9CC9C2" stroke="#8A5A3B" strokeWidth={14} />
    <path d="M 170 490 L 240 410 L 290 460 L 330 420 L 380 490 Z" fill="#E7B36A" />
    {/* zellige wainscot */}
    <rect x={0} y={900} width={1080} height={300} fill="url(#zel)" />
    <rect x={0} y={890} width={1080} height={16} fill="#C8643A" />
    {/* floor + rug */}
    <rect x={0} y={1200} width={1080} height={720} fill="#C99A6A" />
    {Array.from({ length: 9 }).map((_, i) => <path key={i} d={`M 0 ${1240 + i * 80} H 1080`} stroke="#B98A5C" strokeWidth={3} />)}
    <ellipse cx={520} cy={1560} rx={470} ry={150} fill="#B7413A" />
    <ellipse cx={520} cy={1560} rx={410} ry={115} fill="none" stroke="#F2C14E" strokeWidth={10} strokeDasharray="22 16" />
    {/* lamp */}
    <circle cx={930} cy={640} r={260} fill="url(#lamp)" opacity={lampGlow} />
    <rect x={924} y={700} width={12} height={560} fill="#6B4A35" />
    <ellipse cx={930} cy={1262} rx={60} ry={14} fill="#6B4A35" />
    <path d="M 850 700 L 1010 700 L 975 580 L 885 580 Z" fill="#F3D27A" {...OUT} />
    {/* sofa back + arms */}
    <rect x={40} y={860} width={760} height={300} rx={60} fill="#2D7F86" {...OUT} />
    <rect x={10} y={1000} width={110} height={260} rx={46} fill="#2A737A" {...OUT} />
    <rect x={720} y={1000} width={110} height={260} rx={46} fill="#2A737A" {...OUT} />
    <rect x={90} y={1080} width={660} height={120} rx={36} fill="#3796A0" {...OUT} />
    {/* cushion */}
    <rect x={560} y={960} width={150} height={130} rx={34} fill="#F2C14E" {...OUT} transform="rotate(10 635 1025)" />
  </svg>
);

/** front of the sofa seat + pouf, drawn over Hamza's legs when he is seated */
export const SofaFront: React.FC = () => (
  <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
    <rect x={70} y={1180} width={700} height={140} rx={40} fill="#2A737A" {...OUT} />
    <rect x={10} y={1110} width={110} height={220} rx={46} fill="#2A737A" {...OUT} />
    <rect x={720} y={1110} width={110} height={220} rx={46} fill="#2A737A" {...OUT} />
    <rect x={120} y={1320} width={24} height={40} fill="#5A3B28" />
    <rect x={696} y={1320} width={24} height={40} fill="#5A3B28" />
    {/* Moroccan leather pouf */}
    <g transform="translate(900 1330)">
      <ellipse cx={0} cy={70} rx={130} ry={40} fill="#A55A2A" {...OUT} />
      <rect x={-130} y={0} width={260} height={70} fill="#C8783A" />
      <ellipse cx={0} cy={0} rx={130} ry={40} fill="#D98C48" {...OUT} />
      <path d="M -130 0 L -130 70 M 130 0 L 130 70" {...OUT} />
      {[-80, -40, 0, 40, 80].map((x) => <path key={x} d={`M ${x} 18 L ${x + 14} 40 L ${x} 62 L ${x - 14} 40 Z`} fill="none" stroke="#F2C14E" strokeWidth={4} />)}
      <circle cx={0} cy={0} r={18} fill="none" stroke="#F2C14E" strokeWidth={4} />
    </g>
  </svg>
);

/** cartoon ant (side view), ~60x36 */
export const Ant: React.FC<{ w?: number; step?: number }> = ({ w = 60, step = 0 }) => {
  const legs = [-1, 0, 1].map((i) => i * 10);
  const s = Math.sin(step) * 6;
  return (
    <svg viewBox="0 0 60 36" width={w} height={(w * 36) / 60} style={{ overflow: "visible" }}>
      {legs.map((x, i) => (
        <g key={i}>
          <path d={`M ${30 + x} 20 L ${26 + x + (i % 2 ? s : -s)} 33`} stroke="#1a1a1a" strokeWidth={2.5} strokeLinecap="round" />
          <path d={`M ${30 + x} 20 L ${34 + x - (i % 2 ? s : -s)} 33`} stroke="#1a1a1a" strokeWidth={2.5} strokeLinecap="round" />
        </g>
      ))}
      <ellipse cx={14} cy={18} rx={12} ry={9} fill="#1a1a1a" />
      <ellipse cx={30} cy={19} rx={7} ry={6} fill="#1a1a1a" />
      <circle cx={45} cy={16} r={7} fill="#1a1a1a" />
      <circle cx={47} cy={14} r={2} fill="#fff" />
      <path d="M 49 10 Q 54 2 58 4 M 47 9 Q 50 1 54 0" stroke="#1a1a1a" strokeWidth={2} fill="none" strokeLinecap="round" />
    </svg>
  );
};

/**
 * Generic stylised football match (invented kits, no clubs/leagues/logos). viewBox 400x260.
 * `ball` = ball radius in viewBox units (tiny on the small phone, big + highlighted on the Duo).
 */
export const Match: React.FC<{ w: number; h: number; t: number; ball: number; glow?: number }> = ({ w, h, t, ball, glow = 0 }) => {
  const bx = 200 + Math.sin(t * 0.9) * 120;
  const by = 130 + Math.sin(t * 1.7) * 60;
  const players = [
    ...[[90, 70], [120, 150], [160, 210], [70, 190], [150, 100]].map(([x, y], i) => ({ x, y, c: "#E5484D", c2: "#fff", i })),
    ...[[300, 80], [270, 160], [240, 220], [330, 190], [250, 110]].map(([x, y], i) => ({ x, y, c: "#1F4FD8", c2: "#F6C343", i: i + 5 })),
  ];
  return (
    <svg viewBox="0 0 400 260" width={w} height={h} preserveAspectRatio="xMidYMid slice">
      {Array.from({ length: 8 }).map((_, i) => <rect key={i} x={i * 50} y={0} width={50} height={260} fill={i % 2 ? "#3EA85A" : "#47B865"} />)}
      <g fill="none" stroke="#fff" strokeWidth={3} opacity={0.9}>
        <rect x={10} y={10} width={380} height={240} />
        <path d="M 200 10 V 250" />
        <circle cx={200} cy={130} r={36} />
        <rect x={10} y={75} width={50} height={110} />
        <rect x={340} y={75} width={50} height={110} />
      </g>
      {players.map((p) => {
        const dx = Math.sin(t * 1.3 + p.i) * 14 + (bx - p.x) * 0.08;
        const dy = Math.cos(t * 1.1 + p.i * 2) * 10 + (by - p.y) * 0.08;
        return (
          <g key={p.i} transform={`translate(${p.x + dx} ${p.y + dy})`}>
            <circle r={9} fill={p.c} stroke="#1a1a1a" strokeWidth={2} />
            <path d="M -9 0 H 9" stroke={p.c2} strokeWidth={4} />
            <circle cy={-11} r={5} fill="#E8B48A" stroke="#1a1a1a" strokeWidth={1.5} />
          </g>
        );
      })}
      {glow > 0 && <circle cx={bx} cy={by} r={ball * 2.6} fill="#FFF7A8" opacity={0.55 * glow} />}
      <circle cx={bx} cy={by} r={ball} fill="#fff" stroke="#1a1a1a" strokeWidth={Math.max(0.6, ball * 0.25)} />
      {ball > 4 && <path d={`M ${bx - ball * 0.4} ${by - ball * 0.2} l ${ball * 0.4} ${-ball * 0.3} l ${ball * 0.4} ${ball * 0.3} l ${-ball * 0.15} ${ball * 0.45} h ${-ball * 0.5} Z`} fill="#1a1a1a" />}
    </svg>
  );
};

/** small generic phone (Hamza's old phone): screen slot */
export const SmallPhone: React.FC<{ w: number; children?: React.ReactNode; glow?: number }> = ({ w, children, glow = 0 }) => {
  const h = w * 1.95;
  return (
    <div style={{ position: "relative", width: w, height: h, borderRadius: w * 0.16, background: "#1d1f2b", border: `${Math.max(2, w * 0.035)}px solid #3a3d4d`, boxShadow: `0 0 ${80 * glow}px ${30 * glow}px rgba(140,230,255,${0.9 * glow})`, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: w * 0.06, borderRadius: w * 0.1, overflow: "hidden", background: "#000" }}>{children}</div>
    </div>
  );
};

/**
 * iPhone Duo stand-in device drawn as an SVG/CSS frame (Star White), book-style hinge.
 * open = 0 folded (outer 5.4" screen showing), 1 fully open (inner 7.6" screen). W = unfolded width.
 * `inner(w,h)` renders the inner screen content across both halves.
 */
export const Foldable: React.FC<{ W: number; open: number; inner: (w: number, h: number) => React.ReactNode; outer?: React.ReactNode }> = ({ W, open, inner, outer }) => {
  const H = W * 0.9;
  const half = W / 2;
  const frame = Math.max(6, W * 0.022);
  const bez = Math.max(6, W * 0.028);
  const r = W * 0.075;
  const angle = 180 * (1 - open); // left half rotates around the hinge onto the right half
  const shift = (-W / 4) * (1 - open); // keep the device centred while folded
  const sw = W - 2 * (frame + bez);
  const sh = H - 2 * (frame + bez);
  const metal = "linear-gradient(135deg, #F4F1EC 0%, #D9D3C9 45%, #F7F5F1 60%, #C9C2B6 100%)";
  const innerHalf = (side: "L" | "R") => (
    <div style={{ position: "absolute", inset: 0, background: metal, borderRadius: side === "L" ? `${r}px 0 0 ${r}px` : `0 ${r}px ${r}px 0`, padding: frame, boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.6)" }}>
      <div style={{ position: "absolute", top: frame, bottom: frame, left: side === "L" ? frame : 0, right: side === "R" ? frame : 0, background: "#0b0b0e", borderRadius: side === "L" ? `${r * 0.8}px 0 0 ${r * 0.8}px` : `0 ${r * 0.8}px ${r * 0.8}px 0` }}>
        <div style={{ position: "absolute", top: bez, bottom: bez, left: side === "L" ? bez : 0, right: side === "R" ? bez : 0, overflow: "hidden", borderRadius: side === "L" ? `${r * 0.55}px 0 0 ${r * 0.55}px` : `0 ${r * 0.55}px ${r * 0.55}px 0` }}>
          <div style={{ position: "absolute", top: 0, left: side === "L" ? 0 : -(half - frame - bez), width: sw, height: sh }}>{inner(sw, sh)}</div>
        </div>
      </div>
    </div>
  );
  return (
    <div style={{ position: "relative", width: W, height: H, perspective: W * 2.6, transform: `translateX(${shift}px)` }}>
      {/* right half (static) */}
      <div style={{ position: "absolute", left: half, top: 0, width: half, height: H, filter: "drop-shadow(0 24px 30px rgba(6,14,90,0.35))" }}>{innerHalf("R")}</div>
      {/* hinge shadow */}
      <div style={{ position: "absolute", left: half - 3, top: frame + bez, width: 6, height: H - 2 * (frame + bez), background: "linear-gradient(90deg, rgba(0,0,0,0.35), rgba(255,255,255,0.15), rgba(0,0,0,0.35))", opacity: open, zIndex: 2 }} />
      {/* left half (rotates) */}
      <div style={{ position: "absolute", left: 0, top: 0, width: half, height: H, transformOrigin: "100% 50%", transform: `rotateY(${angle}deg)`, transformStyle: "preserve-3d", zIndex: 3 }}>
        <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden" }}>{innerHalf("L")}</div>
        {/* back face = outer screen (visible when folded) */}
        <div style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: metal, borderRadius: r, padding: frame }}>
          <div style={{ position: "absolute", inset: frame, background: "#0b0b0e", borderRadius: r * 0.8, overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: bez, borderRadius: r * 0.55, overflow: "hidden", background: "linear-gradient(180deg, #A9CBE8 0%, #E9D6B8 60%, #C8B08A 100%)" }}>{outer}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
