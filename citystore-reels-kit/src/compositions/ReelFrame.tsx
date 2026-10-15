import React from "react";
import { AbsoluteFill, Audio, Freeze, Sequence, staticFile } from "remotion";
import { BrandBackground } from "../components/BrandBackground";
import { CitybotActor, Direction } from "../components/CitybotActor";
import { Subtitles } from "../components/Subtitles";
import { Layout, LayoutProvider } from "../layout";
import { sceneIn, Timeline, TimelineProvider } from "../timeline";

/** Shared reel shell: background, scenes on the timeline, Citybot, subtitles, final-frame hold, audio mix. */
export const ReelFrame: React.FC<{
  layout: Layout;
  tl: Timeline;
  scenes: readonly (readonly [string, React.FC])[];
  direction: Direction;
  audio: string;
}> = ({ layout, tl, scenes, direction, audio }) => (
  <LayoutProvider layout={layout}>
    <TimelineProvider tl={tl}>
      <AbsoluteFill style={{ background: "#2E3EFE" }}>
        <Freeze frame={tl.holdFrom} active={(f) => f >= tl.holdFrom}>
          <AbsoluteFill>
            <BrandBackground />
            {scenes.map(([id, Comp]) => {
              const s = sceneIn(tl, id);
              return (
                <Sequence key={id} from={s.from} durationInFrames={s.to - s.from} name={id}>
                  <Comp />
                </Sequence>
              );
            })}
            <CitybotActor direction={direction} />
            <Subtitles />
          </AbsoluteFill>
        </Freeze>
        <Audio src={staticFile(audio)} />
      </AbsoluteFill>
    </TimelineProvider>
  </LayoutProvider>
);
