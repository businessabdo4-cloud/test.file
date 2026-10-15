import React from "react";
import { Layout } from "../../layout";
import { ReelFrame } from "../../compositions/ReelFrame";
import { ChatCta } from "../../components/ChatCta";
import { ChecklistTrust } from "../../components/ChecklistTrust";
import { EndCard } from "../../scenes/EndCard";
import { airpodsDirection } from "./direction";
import { ATL } from "./timeline";
import { AAnc, ACharging, AFeatures, AFit, AHook, AIntro } from "./AScenes";

const ATrust: React.FC = () => <ChecklistTrust title="PRODUITS ORIGINAUX" items={["Boîte fermée", "Jamais ouverts", "Jamais activés"]} />;
const ACta: React.FC = () => <ChatCta message="Salam ! Je veux commander les AirPods 5 (boîtier sans fil)." />;
const AEnd: React.FC = () => <EndCard tagline="الأصلي ديما!" />;

const SCENES = [
  ["hook", AHook],
  ["intro", AIntro],
  ["fit", AFit],
  ["anc", AAnc],
  ["features", AFeatures],
  ["charging", ACharging],
  ["trust", ATrust],
  ["cta", ACta],
  ["end", AEnd],
] as const;

/** AirPods 5 reel (40 s, user-approved over 30 s; Darija VO). Final frame held from 39.0 s. */
export const AirpodsReel: React.FC<{ layout: Layout }> = ({ layout }) => (
  <ReelFrame layout={layout} tl={ATL} scenes={SCENES} direction={airpodsDirection} audio="airpods/audio/mix.wav" />
);
