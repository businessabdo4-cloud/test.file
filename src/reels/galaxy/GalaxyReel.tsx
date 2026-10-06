import React from "react";
import { Layout } from "../../layout";
import { ReelFrame } from "../../compositions/ReelFrame";
import { ChatCta } from "../../components/ChatCta";
import { EndCard } from "../../scenes/EndCard";
import { galaxyDirection } from "./direction";
import { GTL } from "./timeline";
import { GHook } from "./GHook";
import { GClassic } from "./GClassic";
import { GUltra } from "./GUltra";
import { GSpecs } from "./GSpecs";
import { GAdventure } from "./GAdventure";
import { GTrust } from "./GTrust";

const GCta: React.FC = () => <ChatCta message="Salam ! La Galaxy Watch8 Classic et l'Ultra2 sont dispo ?" />;
const GEnd: React.FC = () => <EndCard tagline="الأصلي ديما!" />;

const SCENES = [
  ["hook", GHook],
  ["classic", GClassic],
  ["ultra", GUltra],
  ["specs", GSpecs],
  ["adventure", GAdventure],
  ["trust", GTrust],
  ["cta", GCta],
  ["end", GEnd],
] as const;

/** Samsung Galaxy Watch8 Classic / Ultra2 reel (30 s, Darija VO). Final frame held from 29.0 s. */
export const GalaxyReel: React.FC<{ layout: Layout }> = ({ layout }) => (
  <ReelFrame layout={layout} tl={GTL} scenes={SCENES} direction={galaxyDirection} audio="galaxy/audio/mix.wav" />
);
