import React from "react";
import { Layout } from "../../layout";
import { ReelFrame } from "../../compositions/ReelFrame";
import { ChatCta } from "../../components/ChatCta";
import { ChecklistTrust } from "../../components/ChecklistTrust";
import { EndCard } from "../../scenes/EndCard";
import { goproDirection } from "./direction";
import { GTL } from "./timeline";
import { GHook, GIntro, GMount, GRes, GSmooth, GWater } from "./GScenes";

const GTrust: React.FC = () => <ChecklistTrust title="PRODUITS ORIGINAUX" items={["Boîte fermée", "Jamais ouverts", "Jamais activés"]} />;
const GCta: React.FC = () => <ChatCta message="Salam ! Je veux commander la GoPro HERO13 Black." />;
const GEnd: React.FC = () => <EndCard tagline="الأصلي ديما!" />;

const SCENES = [
  ["hook", GHook],
  ["intro", GIntro],
  ["res", GRes],
  ["smooth", GSmooth],
  ["water", GWater],
  ["mount", GMount],
  ["trust", GTrust],
  ["cta", GCta],
  ["end", GEnd],
] as const;

/** GoPro HERO13 Black reel (30 s, Darija VO). Final frame held from 29.0 s. */
export const GoproReel: React.FC<{ layout: Layout }> = ({ layout }) => (
  <ReelFrame layout={layout} tl={GTL} scenes={SCENES} direction={goproDirection} audio="gopro/audio/mix.wav" />
);
