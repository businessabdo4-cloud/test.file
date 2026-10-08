import React from "react";
import { Layout } from "../../layout";
import { ReelFrame } from "../../compositions/ReelFrame";
import { ChatCta } from "../../components/ChatCta";
import { ChecklistTrust } from "../../components/ChecklistTrust";
import { EndCard } from "../../scenes/EndCard";
import { switchDirection } from "./direction";
import { NTL } from "./timeline";
import { NHook, NIntro } from "./NHook";
import { NJoycon, NModes, NScreen, NSpecs } from "./NScenes";

const NTrust: React.FC = () => <ChecklistTrust title="PRODUITS ORIGINAUX" items={["Boîte fermée", "Jamais ouverts", "Jamais activés"]} />;
const NCta: React.FC = () => <ChatCta message="Salam ! Je veux commander la Switch OLED blanche." />;
const NEnd: React.FC = () => <EndCard tagline="الأصلي ديما!" />;

const SCENES = [
  ["hook", NHook],
  ["intro", NIntro],
  ["screen", NScreen],
  ["modes", NModes],
  ["specs", NSpecs],
  ["joycon", NJoycon],
  ["trust", NTrust],
  ["cta", NCta],
  ["end", NEnd],
] as const;

/** Nintendo Switch OLED reel (30 s, Darija VO). Final frame held from 29.0 s. */
export const SwitchReel: React.FC<{ layout: Layout }> = ({ layout }) => (
  <ReelFrame layout={layout} tl={NTL} scenes={SCENES} direction={switchDirection} audio="switch/audio/mix.wav" />
);
