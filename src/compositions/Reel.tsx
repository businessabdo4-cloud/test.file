import React from "react";
import { AbsoluteFill, Audio, Freeze, Sequence, staticFile } from "remotion";
import { BrandBackground } from "../components/BrandBackground";
import { CitybotActor } from "../components/CitybotActor";
import { Subtitles } from "../components/Subtitles";
import { Layout, LayoutProvider } from "../layout";
import { scene, TL } from "../timeline";
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

/** Full 30 s reel. Picture freezes on the final frame from 29.0 s; audio keeps ringing out. */
export const Reel: React.FC<{ layout: Layout }> = ({ layout }) => (
  <LayoutProvider layout={layout}>
    <AbsoluteFill style={{ background: "#2E3EFE" }}>
      <Freeze frame={TL.holdFrom} active={(f) => f >= TL.holdFrom}>
        <AbsoluteFill>
          <BrandBackground />
          {SCENES.map(([id, Comp]) => {
            const s = scene(id);
            return (
              <Sequence key={id} from={s.from} durationInFrames={s.to - s.from} name={id}>
                <Comp />
              </Sequence>
            );
          })}
          <CitybotActor />
          <Subtitles />
        </AbsoluteFill>
      </Freeze>
      <Audio src={staticFile("audio/mix.wav")} />
    </AbsoluteFill>
  </LayoutProvider>
);
