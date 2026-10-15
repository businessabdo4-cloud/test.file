import React from "react";
import { Layout } from "../../layout";
import { ReelFrame } from "../../compositions/ReelFrame";
import { ChatCta } from "../../components/ChatCta";
import { ChecklistTrust } from "../../components/ChecklistTrust";
import { EndCard } from "../../scenes/EndCard";
import { raybanDirection } from "./direction";
import { RTL } from "./timeline";
import { RHook, RIntro } from "./RHook";
import { RAudio, RBattery, RCamera, RHeadliner, RWayfarer } from "./RProducts";

const RTrust: React.FC = () => <ChecklistTrust title="PRODUITS ORIGINAUX" items={["Boîte fermée", "Jamais ouverts", "Jamais activés"]} />;
const RCta: React.FC = () => <ChatCta message="Salam ! Je veux commander les Ray-Ban Meta Gen 2." />;
const REnd: React.FC = () => <EndCard tagline="الأصلي ديما!" />;

const SCENES = [
  ["hook", RHook],
  ["intro", RIntro],
  ["headliner", RHeadliner],
  ["wayfarer", RWayfarer],
  ["camera", RCamera],
  ["audio", RAudio],
  ["battery", RBattery],
  ["trust", RTrust],
  ["cta", RCta],
  ["end", REnd],
] as const;

/** Ray-Ban Meta Gen 2 reel (Headliner + Wayfarer, 30 s, Darija VO). Final frame held from 29.0 s. */
export const RaybanReel: React.FC<{ layout: Layout }> = ({ layout }) => (
  <ReelFrame layout={layout} tl={RTL} scenes={SCENES} direction={raybanDirection} audio="rayban/audio/mix.wav" />
);
