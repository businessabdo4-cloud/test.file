import React from "react";
import { Layout } from "../../layout";
import { ReelFrame } from "../../compositions/ReelFrame";
import { ChatCta } from "../../components/ChatCta";
import { ChecklistTrust } from "../../components/ChecklistTrust";
import { EndCard } from "../../scenes/EndCard";
import { micminiDirection } from "./direction";
import { MTL } from "./timeline";
import { MAudio, MBattery, MConnect, MHook, MIntro, MSize } from "./MScenes";

const MTrust: React.FC = () => <ChecklistTrust title="PRODUITS ORIGINAUX" items={["Boîte fermée", "Jamais ouverts", "Jamais activés"]} />;
const MCta: React.FC = () => <ChatCta message="Salam ! Je veux commander le DJI Mic Mini 2." />;
const MEnd: React.FC = () => <EndCard tagline="الأصلي ديما!" />;

const SCENES = [
  ["hook", MHook],
  ["intro", MIntro],
  ["size", MSize],
  ["audio", MAudio],
  ["battery", MBattery],
  ["connect", MConnect],
  ["trust", MTrust],
  ["cta", MCta],
  ["end", MEnd],
] as const;

/** DJI Mic Mini 2 reel (30 s, Darija VO). Final frame held from 29.0 s. */
export const MicminiReel: React.FC<{ layout: Layout }> = ({ layout }) => (
  <ReelFrame layout={layout} tl={MTL} scenes={SCENES} direction={micminiDirection} audio="micmini/audio/mix.wav" />
);
