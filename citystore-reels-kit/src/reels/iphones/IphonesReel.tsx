import React from "react";
import { Layout } from "../../layout";
import { ReelFrame } from "../../compositions/ReelFrame";
import { ChatCta } from "../../components/ChatCta";
import { ChecklistTrust } from "../../components/ChecklistTrust";
import { EndCard } from "../../scenes/EndCard";
import { iphonesDirection } from "./direction";
import { ITL } from "./timeline";
import { IHook, IIntro } from "./IHook";
import { IP17, IP18, IScreen } from "./IScenes";

const ITrust: React.FC = () => <ChecklistTrust title="PRODUITS ORIGINAUX" items={["Boîte fermée", "Jamais ouverts", "Jamais activés"]} />;
const ICta: React.FC = () => <ChatCta message="Salam ! Je veux commander l'iPhone 18 Pro Burgundy 256GB." />;
const IEnd: React.FC = () => <EndCard tagline="الأصلي ديما!" />;

const SCENES = [
  ["hook", IHook],
  ["intro", IIntro],
  ["p18", IP18],
  ["p17", IP17],
  ["screen", IScreen],
  ["trust", ITrust],
  ["cta", ICta],
  ["end", IEnd],
] as const;

/** iPhone 18 Pro + iPhone 17 Pro reel (38 s, user-approved over 30 s; Darija VO in Latin script). Hold from 37.0 s. */
export const IphonesReel: React.FC<{ layout: Layout }> = ({ layout }) => (
  <ReelFrame layout={layout} tl={ITL} scenes={SCENES} direction={iphonesDirection} audio="iphones/audio/mix.wav" />
);
