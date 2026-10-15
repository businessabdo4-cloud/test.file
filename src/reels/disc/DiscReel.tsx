import React from "react";
import { Layout } from "../../layout";
import { ReelFrame } from "../../compositions/ReelFrame";
import { ChatCta } from "../../components/ChatCta";
import { ChecklistTrust } from "../../components/ChecklistTrust";
import { EndCard } from "../../scenes/EndCard";
import { discDirection } from "./direction";
import { DTL } from "./timeline";
import { DBluray, DHook, DInstall, DIntro, DUsed } from "./DScenes";

const DTrust: React.FC = () => <ChecklistTrust title="PRODUITS ORIGINAUX" items={["Boîte fermée", "Jamais ouverts", "Jamais activés"]} />;
const DCta: React.FC = () => <ChatCta message="Salam ! Je veux commander le lecteur PS5 (Disc Drive)." />;
const DEnd: React.FC = () => <EndCard tagline="الأصلي ديما!" />;

const SCENES = [
  ["hook", DHook],
  ["intro", DIntro],
  ["install", DInstall],
  ["used", DUsed],
  ["bluray", DBluray],
  ["trust", DTrust],
  ["cta", DCta],
  ["end", DEnd],
] as const;

/** PlayStation Disc Drive reel (30 s, Darija VO, 9:16 only). Final frame held from 29.0 s. */
export const DiscReel: React.FC<{ layout: Layout }> = ({ layout }) => (
  <ReelFrame layout={layout} tl={DTL} scenes={SCENES} direction={discDirection} audio="disc/audio/mix.wav" />
);
