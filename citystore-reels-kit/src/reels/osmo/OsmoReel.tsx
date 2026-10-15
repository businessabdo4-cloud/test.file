import React from "react";
import { Layout } from "../../layout";
import { ReelFrame } from "../../compositions/ReelFrame";
import { ChatCta } from "../../components/ChatCta";
import { ChecklistTrust } from "../../components/ChecklistTrust";
import { EndCard } from "../../scenes/EndCard";
import { osmoDirection } from "./direction";
import { XTL } from "./timeline";
import { XHook, XIntro } from "./XHook";
import { XBattery, XCombo, XP3, XP4, XP4More, XStab } from "./XScenes";

const XTrust: React.FC = () => <ChecklistTrust title="PRODUITS ORIGINAUX" items={["Boîte fermée", "Jamais ouverts", "Jamais activés"]} />;
const XCta: React.FC = () => <ChatCta message="Salam ! Je veux commander l'Osmo Pocket 4." />;
const XEnd: React.FC = () => <EndCard tagline="الأصلي ديما!" />;

const SCENES = [
  ["hook", XHook],
  ["intro", XIntro],
  ["p4", XP4],
  ["p4more", XP4More],
  ["battery", XBattery],
  ["p3", XP3],
  ["combo", XCombo],
  ["stab", XStab],
  ["trust", XTrust],
  ["cta", XCta],
  ["end", XEnd],
] as const;

/** DJI Osmo Pocket 4 + Pocket 3 Creator Combo reel (56 s, user-approved over 30 s; Darija VO). Hold from 55.0 s. */
export const OsmoReel: React.FC<{ layout: Layout }> = ({ layout }) => (
  <ReelFrame layout={layout} tl={XTL} scenes={SCENES} direction={osmoDirection} audio="osmo/audio/mix.wav" />
);
