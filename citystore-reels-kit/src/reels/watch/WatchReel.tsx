import React from "react";
import { Layout } from "../../layout";
import { ReelFrame } from "../../compositions/ReelFrame";
import { EndCard } from "../../scenes/EndCard";
import { watchDirection } from "./direction";
import { WTL } from "./timeline";
import { WHook } from "./WHook";
import { WHero } from "./WHero";
import { WFeatures } from "./WFeatures";
import { WHealth } from "./WHealth";
import { WTrust } from "./WTrust";
import { WCta } from "./WCta";

const WEnd: React.FC = () => <EndCard tagline="الأصلي ديما!" />;

const SCENES = [
  ["hook", WHook],
  ["hero", WHero],
  ["features", WFeatures],
  ["health", WHealth],
  ["trust", WTrust],
  ["cta", WCta],
  ["end", WEnd],
] as const;

/** Apple Watch Ultra 4 reel (30 s, Darija VO). Final frame held from 29.0 s. */
export const WatchReel: React.FC<{ layout: Layout }> = ({ layout }) => (
  <ReelFrame layout={layout} tl={WTL} scenes={SCENES} direction={watchDirection} audio="watch/audio/mix.wav" />
);
