import React from "react";
import { Layout } from "../../layout";
import { ReelFrame } from "../../compositions/ReelFrame";
import { ChatCta } from "../../components/ChatCta";
import { ChecklistTrust } from "../../components/ChecklistTrust";
import { EndCard } from "../../scenes/EndCard";
import { tabsDirection } from "./direction";
import { TTL } from "./timeline";
import { TA11, TA9, THook, TLenovo, TXiaomi } from "./TScenes";

const TTrust: React.FC = () => <ChecklistTrust title="PRODUITS ORIGINAUX" items={["Boîte fermée", "Jamais ouverts", "Jamais activés"]} />;
const TCta: React.FC = () => <ChatCta message="Salam ! Je veux commander une tablette." />;
const TEnd: React.FC = () => <EndCard tagline="الأصلي ديما!" />;

const SCENES = [
  ["hook", THook],
  ["a9", TA9],
  ["a11", TA11],
  ["lenovo", TLenovo],
  ["xiaomi", TXiaomi],
  ["trust", TTrust],
  ["cta", TCta],
  ["end", TEnd],
] as const;

/** Tablets reel: Galaxy Tab A9+ 5G, Galaxy Tab A11, Lenovo Idea Tab Plus, Xiaomi Pad 8 (42 s, user-approved over 30 s; Darija VO). Final frame held from 41.0 s. */
export const TabsReel: React.FC<{ layout: Layout }> = ({ layout }) => (
  <ReelFrame layout={layout} tl={TTL} scenes={SCENES} direction={tabsDirection} audio="tabs/audio/mix.wav" />
);
