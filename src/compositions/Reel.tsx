import React from "react";
import { Layout } from "../layout";
import { TL } from "../timeline";
import { iphoneDirection } from "../reels/iphone/direction";
import { ReelFrame } from "./ReelFrame";
import { Hook } from "../scenes/Hook";
import { Hero } from "../scenes/Hero";
import { Ecosystem } from "../scenes/Ecosystem";
import { Trust } from "../scenes/Trust";
import { Cta } from "../scenes/Cta";
import { EndCard } from "../scenes/EndCard";

const SCENES = [
  ["hook", Hook],
  ["hero", Hero],
  ["ecosystem", Ecosystem],
  ["trust", Trust],
  ["cta", Cta],
  ["end", EndCard],
] as const;

/** iPhone 18 Pro reel (30 s). Picture freezes on the final frame from 29.0 s; audio rings out. */
export const Reel: React.FC<{ layout: Layout }> = ({ layout }) => (
  <ReelFrame layout={layout} tl={TL} scenes={SCENES} direction={iphoneDirection} audio="audio/mix.wav" />
);
