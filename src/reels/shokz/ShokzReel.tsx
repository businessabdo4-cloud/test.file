import React from "react";
import { Layout } from "../../layout";
import { ReelFrame } from "../../compositions/ReelFrame";
import { ChatCta } from "../../components/ChatCta";
import { ChecklistTrust } from "../../components/ChecklistTrust";
import { EndCard } from "../../scenes/EndCard";
import { shokzDirection } from "./direction";
import { ZTL } from "./timeline";
import { ZBattery, ZBone, ZHook, ZIntro, ZLight, ZSport } from "./ZScenes";

const ZTrust: React.FC = () => <ChecklistTrust title="PRODUITS ORIGINAUX" items={["Boîte fermée", "Jamais ouverts", "Jamais activés"]} />;
const ZCta: React.FC = () => <ChatCta message="Salam ! Je veux commander le Shokz OpenRun Pro." />;
const ZEnd: React.FC = () => <EndCard tagline="الأصلي ديما!" />;

const SCENES = [
  ["hook", ZHook],
  ["intro", ZIntro],
  ["bone", ZBone],
  ["light", ZLight],
  ["battery", ZBattery],
  ["sport", ZSport],
  ["trust", ZTrust],
  ["cta", ZCta],
  ["end", ZEnd],
] as const;

/** Shokz OpenRun Pro reel (40 s, user-approved over 30 s; Darija VO). Final frame held from 39.0 s. */
export const ShokzReel: React.FC<{ layout: Layout }> = ({ layout }) => (
  <ReelFrame layout={layout} tl={ZTL} scenes={SCENES} direction={shokzDirection} audio="shokz/audio/mix.wav" />
);
