import React from "react";
import { AbsoluteFill, Audio, Freeze, Img, interpolate, random, Sequence, staticFile, useCurrentFrame } from "remotion";
import { COLORS, FONT } from "../../brand";
import { lerp, pop, ramp, shake, slam, sp } from "../../anim";
import { LayoutProvider } from "../../layout";
import { TimelineProvider } from "../../timeline";
import { BrandBackground } from "../../components/BrandBackground";
import { Subtitles } from "../../components/Subtitles";
import { LineIcon } from "../../components/Icons";
import { Burst } from "../../components/SceneShell";
import { EndCard } from "../../scenes/EndCard";
import { ArmPose, Citybot, Expression } from "../../citybot/Citybot";
import { MouthShape } from "../../citybot/Mouths";
import { Hamza, HamzaArm, HamzaExpression } from "./Hamza";
import { Ant, Foldable, Match, RoomBack, SmallPhone, SofaFront } from "./Props";
import { DUO, eev, esc, eevList, ETL, LAYOUT_DUO, visemeFor } from "./timeline";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const CX = 505; // visual centre (right action column excluded)
const PHONE_PT = { x: 405, y: 905 }; // Hamza's phone in the living room (where Citybot bursts out)

// ---------------------------------------------------------------- staging
type HStage = { cx: number; bottom: number; w: number; seated?: boolean; expr: HamzaExpression; L: HamzaArm; R: HamzaArm; tilt: number; lean: number; look: [number, number]; hold?: "phone" | "duo" | null };
type BStage = { cx: number; bottom: number; w: number; expr: Expression; L: ArmPose; R: ArmPose; tilt: number; look: [number, number] } | null;

const A = (rot: number, bend: number, hand: HamzaArm["hand"] = "open"): HamzaArm => ({ rot, bend, hand });
const HOLD_PHONE = A(-12, 118, "hold");
const DOWN = A(8, 12);

const hamzaTarget = (scene: string, f: number): HStage => {
  switch (scene) {
    case "room":
      return { cx: 380, bottom: 1450, w: 470, seated: true, expr: "squint", L: DOWN, R: HOLD_PHONE, tilt: 6 + Math.sin(f * 0.08) * 1.5, lean: 10, look: [0.4, 0.5], hold: "phone" };
    case "burst":
      return { cx: 230, bottom: 1370, w: 330, expr: f >= eev("burst.pop") + 4 ? "amazed" : "squint", L: A(30, 40), R: HOLD_PHONE, tilt: -4, lean: 0, look: [0.8, -0.2], hold: "phone" };
    case "unfold":
      return { cx: 230, bottom: 1370, w: 270, expr: "amazed", L: A(40, 80), R: A(40, 80), tilt: -3, lean: 0, look: [0.7, -0.8] };
    case "sizes":
      return { cx: 210, bottom: 1370, w: 240, expr: f >= eev("sz.open") + 6 ? "delighted" : "amazed", L: DOWN, R: A(20, 110, "fist"), tilt: 0, lean: 0, look: [0.6, -0.8] };
    case "sus":
      return { cx: 420, bottom: 1385, w: 560, expr: "suspicious", L: DOWN, R: A(-10, 128, "fist"), tilt: 8, lean: 14, look: [0.6, 0], hold: null };
    case "trust":
      return { cx: 200, bottom: 1370, w: 270, expr: f >= eevList("tr.checks")[0] ? "delighted" : "suspicious", L: DOWN, R: f >= eevList("tr.checks")[2] ? A(150, 20, "fist") : DOWN, tilt: 0, lean: 0, look: [0.7, -0.3] };
    case "cta":
      return { cx: 330, bottom: 1370, w: 380, expr: "delighted", L: DOWN, R: A(-8, 120, "hold"), tilt: 3, lean: 0, look: [0.4, 0.3], hold: "duo" };
    default: // end
      return { cx: 380, bottom: 1395, w: 205, expr: "delighted", L: DOWN, R: f >= eev("end.five") - 8 ? A(160, 0, "five") : A(60, 60), tilt: -4, lean: 0, look: [0.8, -0.2] };
  }
};

const botTarget = (scene: string, f: number): BStage => {
  const point = { rot: 140, hand: "point" as const };
  switch (scene) {
    case "room":
      return null;
    case "burst":
      return { cx: 770, bottom: 1340, w: 300, expr: "excited", L: { rot: 30, hand: "open" }, R: f >= eev("burst.box") ? point : { rot: 120, hand: "wave" }, tilt: 6, look: [-0.6, -0.4] };
    case "unfold":
      return { cx: 790, bottom: 1340, w: 250, expr: "happy", L: { rot: 150, hand: "open" }, R: { rot: 150, hand: "open" }, tilt: -4, look: [-0.5, -0.9] };
    case "sizes":
      return { cx: 800, bottom: 1340, w: 250, expr: "excited", L: { rot: 20, hand: "open" }, R: point, tilt: 6, look: [-0.6, -0.9] };
    case "sus":
      return { cx: 900, bottom: 1340, w: 210, expr: "neutral", L: { rot: 20, hand: "open" }, R: { rot: 20, hand: "open" }, tilt: 0, look: [-0.8, 0] };
    case "trust":
      return { cx: 640, bottom: 1340, w: 360, expr: f >= eev("tr.always") ? "proud" : "happy", L: { rot: 20, hand: "open" }, R: f >= eevList("tr.checks")[0] ? { rot: 72, hand: "thumb" } : point, tilt: 4, look: [-0.3, -0.6] };
    case "cta":
      return { cx: 790, bottom: 1340, w: 260, expr: "happy", L: { rot: 20, hand: "open" }, R: f >= eev("cta.msg") ? point : { rot: 30, hand: "open" }, tilt: 4, look: [-0.5, -0.8] };
    default:
      return { cx: 640, bottom: 1395, w: 190, expr: f >= eev("end.wink") ? "wink" : "happy", L: f >= eev("end.five") - 8 ? { rot: 150, hand: "open" } : { rot: 40, hand: "wave" }, R: { rot: 30, hand: "open" }, tilt: -4, look: [-0.6, -0.3] };
  }
};

const SCENES = ["room", "burst", "unfold", "sizes", "sus", "trust", "cta", "end"];
const sceneAt = (f: number) => SCENES.reduce((cur, id) => (f >= esc(id).from ? id : cur), "room");
const prevScene = (id: string) => SCENES[Math.max(0, SCENES.indexOf(id) - 1)];

const blinkAt = (seed: string, f: number) => {
  for (let b = 25, i = 0; b < ETL.totalFrames; i++) {
    const k = f - b;
    if (k >= 0 && k < 6) return [0.5, 1, 1, 0.6, 0.25, 0][k];
    b += Math.round(60 + random(`${seed}-${i}`) * 90);
  }
  return 0;
};

const mixArm = (a: HamzaArm, b: HamzaArm, t: number): HamzaArm => ({ rot: lerp(a.rot, b.rot, t), bend: lerp(a.bend, b.bend, t), hand: t > 0.5 ? b.hand : a.hand });

// ---------------------------------------------------------------- characters
const HamzaActor: React.FC<{ seatedLayer: boolean }> = ({ seatedLayer }) => {
  const f = useCurrentFrame();
  const scene = sceneAt(f);
  const cur = hamzaTarget(scene, f);
  if (!!cur.seated !== seatedLayer) return null;
  // standing Hamza only appears once the brand wipe has covered the room
  if (!seatedLayer && f < eev("burst.pop") + 3) return null;
  const s0 = esc(scene).from;
  const prev = hamzaTarget(prevScene(scene), s0 - 1);
  const t = prev.seated !== cur.seated ? 1 : sp(f, s0, { damping: 15, stiffness: 140 });
  const st = { cx: lerp(prev.cx, cur.cx, t), bottom: lerp(prev.bottom, cur.bottom, t), w: lerp(prev.w, cur.w, t) };
  const h = st.w * 1.9;
  const vis = visemeFor("hamza", f);
  const breathe = Math.sin((f / 30) * Math.PI * 2 * 0.35);
  const phone = (
    <div style={{ transform: "translate(-50%, -60%) rotate(-8deg)", width: 46 }}>
      <SmallPhone w={46} glow={scene === "burst" ? ramp(f, eev("burst.glow"), eev("burst.pop")) : 0}>
        <Match w={34} h={66} t={f / 30} ball={1} />
      </SmallPhone>
    </div>
  );
  const duo = (
    <div style={{ transform: "translate(-15%, -25%) rotate(-8deg)" }}>
      <Foldable W={230} open={1} inner={(w, hh) => <Match w={w} h={hh} t={f / 30} ball={7} />} />
    </div>
  );
  const holdNode = cur.hold === "phone" ? phone : cur.hold === "duo" ? duo : null;
  const hop = scene === "end" && f >= eev("end.five") - 4 ? Math.sin(Math.min(1, (f - eev("end.five") + 4) / 12) * Math.PI) * 30 : 0;
  const susPush = scene === "sus" ? sp(f, eev("sus.brow"), { damping: 12, stiffness: 120 }) * 30 : 0;
  return (
    <div style={{ position: "absolute", left: st.cx - st.w / 2 - susPush * 0.3, top: st.bottom - h - hop, width: st.w, height: h }}>
      <Hamza
        width={st.w}
        mouth={vis}
        expression={cur.expr}
        blink={blinkAt("hamza", f)}
        lookX={cur.look[0]}
        lookY={cur.look[1]}
        tilt={cur.tilt}
        lean={cur.lean + susPush}
        leftArm={mixArm(prev.L, cur.L, t)}
        rightArm={mixArm(prev.R, cur.R, t)}
        holdRight={holdNode}
        breathe={breathe}
      />
    </div>
  );
};

const idleMouth: Record<Expression, MouthShape> = { excited: "grin", happy: "smile", proud: "smile", wink: "smile", neutral: "X" };

const BotActor: React.FC = () => {
  const f = useCurrentFrame();
  const scene = sceneAt(f);
  const cur = botTarget(scene, f);
  if (!cur) return null;
  const popAt = eev("burst.pop");
  const s0 = esc(scene).from;
  const prev = botTarget(prevScene(scene), s0 - 1) ?? cur;
  const t = sp(f, s0, { damping: 15, stiffness: 140 });
  let st = { cx: lerp(prev.cx, cur.cx, t), bottom: lerp(prev.bottom, cur.bottom, t), w: lerp(prev.w, cur.w, t) };
  // burst out of Hamza's phone
  const out = sp(f, popAt, { damping: 11, stiffness: 120, mass: 0.8 });
  if (scene === "burst") st = { cx: lerp(PHONE_PT.x, cur.cx, out), bottom: lerp(PHONE_PT.y + 40, cur.bottom, out), w: lerp(30, cur.w, out) };
  const h = st.w * 1.4;
  const unit = 400 / st.w;
  const vis = visemeFor("citybot", f);
  const winkNow = (f >= eev("tr.store") && f < eev("tr.store") + 14) || cur.expr === "wink";
  const expr: Expression = winkNow ? "wink" : cur.expr;
  const mouth: MouthShape = vis ?? idleMouth[expr];
  const bob = Math.sin((f / 30) * Math.PI * 2 * 0.6) * 9;
  const hop = (scene === "end" && f >= eev("end.five") - 4 ? Math.sin(Math.min(1, (f - eev("end.five") + 4) / 12) * Math.PI) * 40 : 0) + (scene === "trust" && f >= eev("tr.always") ? Math.max(0, Math.sin(Math.min(1, (f - eev("tr.always")) / 10) * Math.PI)) * 30 : 0);
  // face-screen reactions: an ant as it bursts out (callback to "النملة"), a checkmark on "ديما"
  const showAnt = f >= popAt && f < popAt + 26;
  const showCheck = f >= eev("tr.always") && f < eev("tr.always") + 22;
  const face = showAnt ? (
    <g transform="translate(200 178)">
      <g transform="translate(-60 -36) scale(2)">
        <path d="M 0 0" />
      </g>
      <foreignObject x={-70} y={-45} width={140} height={90}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 140, height: 90 }}>
          <Ant w={120} step={f * 0.6} />
        </div>
      </foreignObject>
    </g>
  ) : showCheck ? (
    <path d={`M 150 180 L 188 218 L 252 140`} fill="none" stroke="#fff" strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={200} strokeDashoffset={200 * (1 - ramp(f, eev("tr.always"), eev("tr.always") + 8))} />
  ) : null;
  return (
    <div style={{ position: "absolute", left: st.cx - st.w / 2, top: st.bottom - h, width: st.w, height: h, opacity: scene === "burst" ? Math.min(1, out * 4) : 1 }}>
      <Citybot
        id="duo-bot"
        width={st.w}
        mouth={mouth}
        expression={expr}
        blink={blinkAt("bot", f)}
        lookX={cur.look[0]}
        lookY={cur.look[1]}
        tilt={cur.tilt + (scene === "burst" ? (1 - out) * 30 : 0)}
        leftArm={cur.L}
        rightArm={cur.R}
        hover={(bob + hop) * unit}
        flash={interpolate(f, [popAt, popAt + 1, popAt + 10], [0, 1, 0], clamp)}
        thrust={0.6 + (scene === "burst" ? (1 - out) * 0.4 : 0)}
        face={face}
      />
    </div>
  );
};

// ---------------------------------------------------------------- scene props
const RoomPiP: React.FC = () => {
  const f = useCurrentFrame();
  const matchAt = eev("room.match"), antAt = eev("room.ant"), ballAt = eev("room.ball");
  const inP = sp(f, matchAt - 6, { damping: 13, stiffness: 140 });
  const w = 330, h = w * 1.95, x = 610, y = 250;
  const glow = ramp(f, eev("burst.glow"), eev("burst.pop"));
  const antX = interpolate(f, [antAt - 4, antAt + 40], [-80, w], clamp);
  const ringOn = f >= ballAt && f < antAt + 30;
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: inP }}>
        <path d={`M ${PHONE_PT.x + 14} ${PHONE_PT.y - 30} L ${x} ${y + h * 0.85} M ${PHONE_PT.x + 24} ${PHONE_PT.y - 10} L ${x + w * 0.6} ${y + h}`} stroke="#fff" strokeWidth={5} strokeDasharray="4 14" strokeLinecap="round" opacity={0.85} />
      </svg>
      <div style={{ position: "absolute", left: x, top: y, transform: `scale(${inP}) rotate(4deg)`, transformOrigin: "20% 100%" }}>
        <SmallPhone w={w} glow={glow}>
          <Match w={w * 0.88} h={h * 0.9} t={f / 30} ball={1.1} />
          {ringOn && (() => {
            const t = f / 30;
            const bx = (200 + Math.sin(t * 0.9) * 120) / 400, by = (130 + Math.sin(t * 1.7) * 60) / 260;
            return <div style={{ position: "absolute", left: `${bx * 100}%`, top: `${by * 100}%`, width: 46, height: 46, marginLeft: -23, marginTop: -23, borderRadius: "50%", border: "4px dashed #FF3B5C", transform: `scale(${pop(f, ballAt)})` }} />;
          })()}
          {f >= antAt - 4 && (
            <div style={{ position: "absolute", left: antX, bottom: 40 }}>
              <Ant w={70} step={f * 0.7} />
            </div>
          )}
        </SmallPhone>
      </div>
      {f >= antAt && (
        <div style={{ position: "absolute", left: 540, top: 170, ...slam(f, antAt, 2) }}>
          <div dir="rtl" style={{ fontFamily: FONT, fontWeight: 900, fontSize: 52, color: "#fff", background: "#E0484F", padding: "2px 26px 10px", borderRadius: 999, transform: "rotate(-5deg)", boxShadow: "0 12px 26px rgba(80,0,20,0.35)", whiteSpace: "nowrap" }}>
            قد النملة! 🐜
          </div>
        </div>
      )}
    </>
  );
};

/** box drop -> official hero image rises -> drawn device unfolds (book-style) -> folded 5.4" / open 7.6" */
const DuoProduct: React.FC = () => {
  const f = useCurrentFrame();
  const boxAt = eev("burst.box"), duoAt = eev("burst.duo"), openAt = eev("unfold.open");
  const foldAt = eev("sz.folded"), reopenAt = eev("sz.open");
  const scene = sceneAt(f);
  const W = 580, devX = CX - W / 2, devY = 300;
  // phase 1: box + hero image
  if (f < openAt + 4) {
    const drop = sp(f, boxAt, { damping: 11, stiffness: 160 });
    const rise = sp(f, duoAt - 2, { damping: 12, stiffness: 110 });
    const fade = interpolate(f, [openAt - 2, openAt + 4], [1, 0], clamp);
    const iw = 560;
    return (
      <div style={{ opacity: fade }}>
        {f >= duoAt - 2 && <Burst x={CX + 40} y={520} r={700} rot={f * 1.2} opacity={0.3 * rise} rays={22} />}
        {f >= boxAt - 1 && (
          <div style={{ position: "absolute", left: CX + 40 - 170, top: lerp(-400, 560, drop), width: 340, height: 230 }}>
            <div style={{ position: "absolute", left: 0, top: 40, width: 340, height: 190, borderRadius: 18, background: "linear-gradient(180deg,#ffffff,#E8ECF5)", border: "5px solid #2A1A22", boxShadow: "0 20px 40px rgba(6,14,90,0.35)" }} />
            <div style={{ position: "absolute", left: -10, top: 6, width: 360, height: 54, borderRadius: 14, background: "#fff", border: "5px solid #2A1A22", transform: `translate(${-rise * 260}px, ${-rise * 320}px) rotate(${-rise * 50}deg)`, opacity: 1 - rise }} />
          </div>
        )}
        {f >= duoAt - 2 && (
          <div style={{ position: "absolute", left: CX + 40 - iw / 2, top: 600 - rise * 360, transform: `scale(${lerp(0.4, 1, rise)})`, filter: "drop-shadow(0 30px 40px rgba(6,14,90,0.5))" }}>
            <Img src={staticFile(DUO.src)} style={{ width: iw, height: iw * DUO.aspect }} />
          </div>
        )}
      </div>
    );
  }
  // phase 2: drawn device
  let open = sp(f, openAt, { damping: 16, stiffness: 70 });
  if (scene !== "unfold") {
    const close = sp(f, foldAt, { damping: 16, stiffness: 120 });
    const reopen = sp(f, reopenAt, { damping: 16, stiffness: 80 });
    open = Math.min(1, Math.max(0, 1 - close + reopen));
  }
  const inP = interpolate(f, [openAt, openAt + 5], [0, 1], clamp);
  const big = scene === "sizes" && f >= reopenAt;
  const callout = (at: number, text: string, sub: string, x: number) =>
    f >= at - 1 ? (
      <div style={{ position: "absolute", left: x, top: devY + W * 0.9 + 24, transform: `translateX(-50%) scale(${pop(f, at)})`, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: FONT, color: "#fff", textShadow: "0 6px 20px rgba(8,20,110,0.45)" }}>
        <div style={{ fontWeight: 900, fontSize: 92, lineHeight: 1 }}>{text}</div>
        <div style={{ fontWeight: 800, fontSize: 28 }}>{sub}</div>
      </div>
    ) : null;
  return (
    <>
      <div style={{ position: "absolute", left: devX, top: devY, opacity: inP, transform: `scale(${lerp(0.85, 1, inP)})` }}>
        <Foldable
          W={W}
          open={open}
          inner={(w, h) => <Match w={w} h={h} t={f / 30} ball={big ? 8 : 5} glow={big ? ramp(f, reopenAt + 6, reopenAt + 14) : 0} />}
          outer={<div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.35)" }}><div style={{ fontWeight: 700, fontSize: 70 }}>9:41</div></div>}
        />
      </div>
      {scene === "sizes" && callout(foldAt, "5.4″", "fermé", CX - 115)}
      {scene === "sizes" && callout(reopenAt + 4, "7.6″", "ouvert", CX + 115)}
      {scene === "sizes" && f >= eev("sz.both") - 1 && (
        <div style={{ position: "absolute", left: 0, right: 70, top: 222, display: "flex", justifyContent: "center", ...slam(f, eev("sz.both"), 1.8) }}>
          <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 40, color: COLORS.blue, background: "#fff", padding: "6px 26px 10px", borderRadius: 999, whiteSpace: "nowrap", boxShadow: "0 12px 26px rgba(6,14,90,0.3)" }}>Téléphone + Tablette</div>
        </div>
      )}
      {scene === "sizes" && f >= eev("sz.big") - 1 && (
        <div style={{ position: "absolute", left: CX - 120, top: devY + W * 0.9 + 170, transform: `scale(${pop(f, eev("sz.big"))})`, display: "flex", alignItems: "center", gap: 12, fontFamily: FONT, fontWeight: 800, fontSize: 28, color: COLORS.blue, background: "#fff", padding: "6px 18px", borderRadius: 999, boxShadow: "0 10px 24px rgba(6,14,90,0.3)" }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#F7F5F1,#D3CCC0)", border: "3px solid #2A1A22" }} />
          Star White
        </div>
      )}
      {scene === "unfold" && (
        <>
          {[0, 1, 2].map((i) => {
            const at = [eev("unfold.what"), eev("unfold.phone"), eev("unfold.tablet")][i];
            if (f < at) return null;
            return (
              <div key={i} style={{ position: "absolute", left: 50 + i * 80, top: 640 - i * 40, fontFamily: FONT, fontWeight: 900, fontSize: 110 + i * 10, color: "#fff", transform: `scale(${pop(f, at)}) rotate(${(i - 1) * 14}deg)`, textShadow: "0 8px 24px rgba(8,20,110,0.45)" }}>
                ؟
              </div>
            );
          })}
        </>
      )}
    </>
  );
};

const SusBubble: React.FC = () => {
  const f = useCurrentFrame();
  const qAt = eev("sus.q");
  const p = pop(f, eev("sus.brow") + 6);
  const sk = shake(f, qAt, 12, 8);
  return (
    <div style={{ position: "absolute", left: 650, top: 300, transform: `translate(${sk.x}px, ${sk.y}px) scale(${p})` }}>
      <div style={{ width: 250, height: 250, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 20px 40px rgba(6,14,90,0.35)", fontFamily: FONT, fontWeight: 900, fontSize: 190, color: COLORS.blue, lineHeight: 1 }}>؟</div>
      <div style={{ position: "absolute", left: 30, top: 220, width: 60, height: 60, borderRadius: "50%", background: "#fff" }} />
      <div style={{ position: "absolute", left: 0, top: 280, width: 30, height: 30, borderRadius: "50%", background: "#fff" }} />
    </div>
  );
};

const TrustBadges: React.FC = () => {
  const f = useCurrentFrame();
  const items = ["Boîte fermée", "Jamais ouvert", "Jamais activé"];
  const checks = eevList("tr.checks");
  return (
    <div style={{ position: "absolute", left: 0, right: 70, top: 300, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
      {f >= eev("tr.store") - 1 && (
        <div style={{ ...slam(f, eev("tr.store"), 1.8), fontFamily: FONT, fontWeight: 900, fontSize: 56, color: "#fff", textShadow: "0 8px 24px rgba(8,20,110,0.4)", marginBottom: 10 }}>100% ORIGINAL</div>
      )}
      {items.map((t, i) => {
        if (f < checks[i] - 1) return null;
        const s = slam(f, checks[i], 2.2);
        return (
          <div key={t} style={{ ...s, display: "flex", alignItems: "center", gap: 18, fontFamily: FONT, fontWeight: 900, fontSize: 48, color: COLORS.blue, background: "#fff", padding: "12px 34px 14px 18px", borderRadius: 999, boxShadow: "0 14px 30px rgba(6,14,90,0.35)", transform: `${s.transform} rotate(${(i - 1) * 2}deg)` }}>
            <div style={{ width: 62, height: 62, borderRadius: "50%", background: "#2BD27A", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <LineIcon name="check" size={44} stroke={11} progress={ramp(f, checks[i] + 2, checks[i] + 10)} />
            </div>
            {t}
          </div>
        );
      })}
    </div>
  );
};

const CtaProps: React.FC = () => {
  const f = useCurrentFrame();
  const mAt = eev("cta.msg"), uAt = eev("cta.url");
  const url = "citystore.ma";
  const n = Math.max(0, Math.min(url.length, Math.floor((f - uAt) / 2)));
  return (
    <div style={{ position: "absolute", left: 0, right: 70, top: 280, display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
      {f >= mAt - 1 && (
        <div style={{ transform: `scale(${pop(f, mAt)})`, width: 210, height: 180, borderRadius: 50, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 18px 36px rgba(6,14,90,0.35)", position: "relative" }}>
          <LineIcon name="chat" size={130} stroke={7} color={COLORS.blue} progress={ramp(f, mAt, mAt + 12)} />
          <div style={{ position: "absolute", right: -14, top: -14, width: 54, height: 54, borderRadius: "50%", background: "#FF3B5C", color: "#fff", fontFamily: FONT, fontWeight: 900, fontSize: 32, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pop(f, mAt + 8)})` }}>1</div>
        </div>
      )}
      {f >= uAt - 2 && (
        <div style={{ display: "flex", alignItems: "center", fontFamily: "Montserrat", fontWeight: 900, fontSize: 76, color: COLORS.blue, background: "#fff", padding: "10px 36px 14px", borderRadius: 26, boxShadow: "0 18px 36px rgba(6,14,90,0.35)", transform: `scale(${sp(f, uAt - 2)})`, minWidth: 120 }}>
          {url.slice(0, n)}
          <span style={{ width: 6, height: 70, background: COLORS.blue, marginLeft: 4, opacity: Math.floor(f / 6) % 2 ? 1 : 0.2 }} />
        </div>
      )}
    </div>
  );
};

const HighFive: React.FC = () => {
  const f = useCurrentFrame();
  const at = eev("end.five");
  if (f < at) return null;
  return (
    <div style={{ position: "absolute", left: 512, top: 1120, transform: `translate(-50%,-50%) scale(${pop(f, at)})`, opacity: interpolate(f, [at + 14, at + 24], [1, 0], clamp) }}>
      <LineIcon name="spark" size={150} stroke={8} />
    </div>
  );
};

// ---------------------------------------------------------------- reel
/** wipe: the brand gradient + grid takes over from Hamza's phone when Citybot bursts out */
const BrandWipe: React.FC = () => {
  const f = useCurrentFrame();
  const at = eev("burst.pop");
  if (f < at - 1) return null;
  const r = interpolate(f, [at, at + 12], [0, 2300], { ...clamp, easing: (x) => x * x * (3 - 2 * x) });
  return (
    <div style={{ position: "absolute", inset: 0, clipPath: `circle(${r}px at ${PHONE_PT.x}px ${PHONE_PT.y}px)` }}>
      <BrandBackground />
    </div>
  );
};

const RoomLayer: React.FC = () => {
  const f = useCurrentFrame();
  if (f >= eev("burst.pop") + 14) return null;
  const glow = ramp(f, eev("burst.glow"), eev("burst.pop"));
  return (
    <AbsoluteFill>
      <RoomBack />
      <HamzaActor seatedLayer />
      <SofaFront />
      {glow > 0 && <div style={{ position: "absolute", left: PHONE_PT.x - 300, top: PHONE_PT.y - 300, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(140,230,255,0.9), rgba(140,230,255,0) 65%)", opacity: glow }} />}
    </AbsoluteFill>
  );
};

const Flash: React.FC = () => {
  const f = useCurrentFrame();
  const at = eev("burst.pop");
  const o = Math.max(interpolate(f, [0, 1, 6], [0.4, 0.4, 0], clamp), interpolate(f, [at, at + 1, at + 8], [0, 0.85, 0], clamp));
  return o > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: o }} /> : null;
};

export const DuoReel: React.FC = () => {
  return (
    <LayoutProvider layout={LAYOUT_DUO}>
      <TimelineProvider tl={ETL}>
        <AbsoluteFill style={{ background: "#2E3EFE" }}>
          <Freeze frame={ETL.holdFrom} active={(f) => f >= ETL.holdFrom}>
            <AbsoluteFill>
              <RoomLayer />
              <BrandWipe />
              <Show from={0} to={eev("burst.pop") + 14}><RoomPiP /></Show>
              <Show from={eev("burst.box") - 2} to={esc("sizes").to}><DuoProduct /></Show>
              <Show from={esc("sus").from} to={esc("sus").to}><SusBubble /></Show>
              <Show from={esc("trust").from} to={esc("trust").to}><TrustBadges /></Show>
              <Show from={esc("cta").from} to={esc("cta").to}><CtaProps /></Show>
              <Sequence from={esc("end").from} durationInFrames={esc("end").to - esc("end").from} name="end">
                <EndCard tagline="الأصلي ديما!" />
              </Sequence>
              <HamzaActor seatedLayer={false} />
              <BotActor />
              <HighFive />
              <Flash />
              <Subtitles />
            </AbsoluteFill>
          </Freeze>
          <Audio src={staticFile("duo/audio/mix.wav")} />
        </AbsoluteFill>
      </TimelineProvider>
    </LayoutProvider>
  );
};

/** renders children (which read absolute frames) only inside [from, to) */
const Show: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const f = useCurrentFrame();
  return f >= from && f < to ? <>{children}</> : null;
};
