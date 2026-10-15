import React from "react";
import { Layout } from "../../layout";
import { ReelFrame } from "../../compositions/ReelFrame";
import { ChatCta } from "../../components/ChatCta";
import { ChecklistTrust } from "../../components/ChecklistTrust";
import { EndCard } from "../../scenes/EndCard";
import { oneplusDirection } from "./direction";
import { OTL } from "./timeline";
import { OHook, OIntro } from "./OHook";
import { OBattery, ODisplay, OEmerald, OHealth, OTitanium } from "./OScenes";

const OCta: React.FC = () => <ChatCta message="Salam ! Je veux commander la OnePlus Watch 3 Emerald." />;
const OEnd: React.FC = () => <EndCard tagline="الأصلي ديما!" />;

const SCENES = [
  ["hook", OHook],
  ["intro", OIntro],
  ["emerald", OEmerald],
  ["titanium", OTitanium],
  ["display", ODisplay],
  ["battery", OBattery],
  ["health", OHealth],
  ["trust", ChecklistTrust],
  ["cta", OCta],
  ["end", OEnd],
] as const;

/** OnePlus Watch 3 (Emerald Titanium) reel (30 s, Darija VO). Final frame held from 29.0 s. */
export const OneplusReel: React.FC<{ layout: Layout }> = ({ layout }) => (
  <ReelFrame layout={layout} tl={OTL} scenes={SCENES} direction={oneplusDirection} audio="oneplus/audio/mix.wav" />
);
