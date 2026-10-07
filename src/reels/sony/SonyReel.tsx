import React from "react";
import { Layout } from "../../layout";
import { ReelFrame } from "../../compositions/ReelFrame";
import { ChatCta } from "../../components/ChatCta";
import { ChecklistTrust } from "../../components/ChecklistTrust";
import { EndCard } from "../../scenes/EndCard";
import { sonyDirection } from "./direction";
import { STL } from "./timeline";
import { SHook } from "./SHook";
import { SAnc, SBattery, SXm5, SXm6 } from "./SProducts";

const SCta: React.FC = () => <ChatCta message="Salam ! Le WH-1000XM6 bleu nuit est dispo ?" />;
const SEnd: React.FC = () => <EndCard tagline="الأصلي ديما!" />;

const SCENES = [
  ["hook", SHook],
  ["xm6", SXm6],
  ["anc", SAnc],
  ["xm5", SXm5],
  ["battery", SBattery],
  ["trust", ChecklistTrust],
  ["cta", SCta],
  ["end", SEnd],
] as const;

/** Sony WH-1000XM6 / XM5 reel (30 s, Darija VO). Final frame held from 29.0 s. */
export const SonyReel: React.FC<{ layout: Layout }> = ({ layout }) => (
  <ReelFrame layout={layout} tl={STL} scenes={SCENES} direction={sonyDirection} audio="sony/audio/mix.wav" />
);
