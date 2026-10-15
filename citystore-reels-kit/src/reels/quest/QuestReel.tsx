import React from "react";
import { Layout } from "../../layout";
import { ReelFrame } from "../../compositions/ReelFrame";
import { ChatCta } from "../../components/ChatCta";
import { ChecklistTrust } from "../../components/ChecklistTrust";
import { EndCard } from "../../scenes/EndCard";
import { questDirection } from "./direction";
import { QTL } from "./timeline";
import { QAll, QHook, QIntro, QMixed, QScreen, QStorage } from "./QScenes";

const QTrust: React.FC = () => <ChecklistTrust title="PRODUITS ORIGINAUX" items={["Boîte fermée", "Jamais ouverts", "Jamais activés"]} />;
const QCta: React.FC = () => <ChatCta message="Salam ! Je veux commander le Meta Quest 3 512 Go." />;
const QEnd: React.FC = () => <EndCard tagline="الأصلي ديما!" />;

const SCENES = [
  ["hook", QHook],
  ["intro", QIntro],
  ["screen", QScreen],
  ["mixed", QMixed],
  ["all", QAll],
  ["storage", QStorage],
  ["trust", QTrust],
  ["cta", QCta],
  ["end", QEnd],
] as const;

/** Meta Quest 3 512GB reel (38.5 s, standing approval over 30 s; Darija VO; 9:16 only). Final frame held from 37.5 s. */
export const QuestReel: React.FC<{ layout: Layout }> = ({ layout }) => (
  <ReelFrame layout={layout} tl={QTL} scenes={SCENES} direction={questDirection} audio="quest/audio/mix.wav" />
);
