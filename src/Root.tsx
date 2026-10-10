import React from "react";
import { Composition, Still } from "remotion";
import { CitybotSheet } from "./compositions/CitybotSheet";
import { Cover } from "./compositions/Cover";
import { Reel } from "./compositions/Reel";
import { FPS, MAX_FRAMES } from "./config";
import { LAYOUT_1x1, LAYOUT_9x16 } from "./layout";
import { TL } from "./timeline";
import { WatchReel } from "./reels/watch/WatchReel";
import { WatchCover } from "./reels/watch/WatchCover";
import { WTL } from "./reels/watch/timeline";
import { GalaxyReel } from "./reels/galaxy/GalaxyReel";
import { GalaxyCover } from "./reels/galaxy/GalaxyCover";
import { GTL } from "./reels/galaxy/timeline";
import { SonyReel } from "./reels/sony/SonyReel";
import { SonyCover } from "./reels/sony/SonyCover";
import { STL } from "./reels/sony/timeline";
import { RaybanReel } from "./reels/rayban/RaybanReel";
import { RaybanCover } from "./reels/rayban/RaybanCover";
import { RTL } from "./reels/rayban/timeline";
import { OneplusReel } from "./reels/oneplus/OneplusReel";
import { OneplusCover } from "./reels/oneplus/OneplusCover";
import { OTL } from "./reels/oneplus/timeline";
import { OsmoReel } from "./reels/osmo/OsmoReel";
import { OsmoCover } from "./reels/osmo/OsmoCover";
import { XTL } from "./reels/osmo/timeline";
import { SwitchReel } from "./reels/switch/SwitchReel";
import { SwitchCover } from "./reels/switch/SwitchCover";
import { NTL } from "./reels/switch/timeline";
import { IphonesReel } from "./reels/iphones/IphonesReel";
import { IphonesCover } from "./reels/iphones/IphonesCover";
import { ITL } from "./reels/iphones/timeline";
import { MicminiReel } from "./reels/micmini/MicminiReel";
import { MicminiCover } from "./reels/micmini/MicminiCover";
import { MTL } from "./reels/micmini/timeline";
import { AirpodsReel } from "./reels/airpods/AirpodsReel";
import { AirpodsCover } from "./reels/airpods/AirpodsCover";
import { ATL } from "./reels/airpods/timeline";
import { ShokzReel } from "./reels/shokz/ShokzReel";
import { ShokzCover } from "./reels/shokz/ShokzCover";
import { ZTL } from "./reels/shokz/timeline";

// Hard length limit: never more than 900 frames (30.0 s).
const DURATION = Math.min(TL.totalFrames, MAX_FRAMES);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Reel9x16" component={Reel} durationInFrames={DURATION} fps={FPS} width={1080} height={1920} defaultProps={{ layout: LAYOUT_9x16 }} />
    <Composition id="Reel1x1" component={Reel} durationInFrames={DURATION} fps={FPS} width={1080} height={1080} defaultProps={{ layout: LAYOUT_1x1 }} />
    <Still id="Cover" component={Cover} width={1080} height={1920} />
    <Composition id="WatchReel9x16" component={WatchReel} durationInFrames={Math.min(WTL.totalFrames, MAX_FRAMES)} fps={FPS} width={1080} height={1920} defaultProps={{ layout: LAYOUT_9x16 }} />
    <Composition id="WatchReel1x1" component={WatchReel} durationInFrames={Math.min(WTL.totalFrames, MAX_FRAMES)} fps={FPS} width={1080} height={1080} defaultProps={{ layout: LAYOUT_1x1 }} />
    <Still id="WatchCover" component={WatchCover} width={1080} height={1920} />
    <Composition id="GalaxyReel9x16" component={GalaxyReel} durationInFrames={Math.min(GTL.totalFrames, MAX_FRAMES)} fps={FPS} width={1080} height={1920} defaultProps={{ layout: LAYOUT_9x16 }} />
    <Composition id="GalaxyReel1x1" component={GalaxyReel} durationInFrames={Math.min(GTL.totalFrames, MAX_FRAMES)} fps={FPS} width={1080} height={1080} defaultProps={{ layout: LAYOUT_1x1 }} />
    <Still id="GalaxyCover" component={GalaxyCover} width={1080} height={1920} />
    <Composition id="SonyReel9x16" component={SonyReel} durationInFrames={Math.min(STL.totalFrames, MAX_FRAMES)} fps={FPS} width={1080} height={1920} defaultProps={{ layout: LAYOUT_9x16 }} />
    <Composition id="SonyReel1x1" component={SonyReel} durationInFrames={Math.min(STL.totalFrames, MAX_FRAMES)} fps={FPS} width={1080} height={1080} defaultProps={{ layout: LAYOUT_1x1 }} />
    <Still id="SonyCover" component={SonyCover} width={1080} height={1920} />
    <Composition id="RaybanReel9x16" component={RaybanReel} durationInFrames={Math.min(RTL.totalFrames, MAX_FRAMES)} fps={FPS} width={1080} height={1920} defaultProps={{ layout: LAYOUT_9x16 }} />
    <Composition id="RaybanReel1x1" component={RaybanReel} durationInFrames={Math.min(RTL.totalFrames, MAX_FRAMES)} fps={FPS} width={1080} height={1080} defaultProps={{ layout: LAYOUT_1x1 }} />
    <Still id="RaybanCover" component={RaybanCover} width={1080} height={1920} />
    <Composition id="OneplusReel9x16" component={OneplusReel} durationInFrames={Math.min(OTL.totalFrames, MAX_FRAMES)} fps={FPS} width={1080} height={1920} defaultProps={{ layout: LAYOUT_9x16 }} />
    <Composition id="OneplusReel1x1" component={OneplusReel} durationInFrames={Math.min(OTL.totalFrames, MAX_FRAMES)} fps={FPS} width={1080} height={1080} defaultProps={{ layout: LAYOUT_1x1 }} />
    <Still id="OneplusCover" component={OneplusCover} width={1080} height={1920} />
    {/* DJI Osmo: the user approved going over 30 s for this reel (full 60 s VO kept), so no MAX_FRAMES cap */}
    <Composition id="OsmoReel9x16" component={OsmoReel} durationInFrames={XTL.totalFrames} fps={FPS} width={1080} height={1920} defaultProps={{ layout: LAYOUT_9x16 }} />
    <Composition id="OsmoReel1x1" component={OsmoReel} durationInFrames={XTL.totalFrames} fps={FPS} width={1080} height={1080} defaultProps={{ layout: LAYOUT_1x1 }} />
    <Still id="OsmoCover" component={OsmoCover} width={1080} height={1920} />
    <Composition id="SwitchReel9x16" component={SwitchReel} durationInFrames={Math.min(NTL.totalFrames, MAX_FRAMES)} fps={FPS} width={1080} height={1920} defaultProps={{ layout: LAYOUT_9x16 }} />
    <Composition id="SwitchReel1x1" component={SwitchReel} durationInFrames={Math.min(NTL.totalFrames, MAX_FRAMES)} fps={FPS} width={1080} height={1080} defaultProps={{ layout: LAYOUT_1x1 }} />
    <Still id="SwitchCover" component={SwitchCover} width={1080} height={1920} />
    {/* iPhone 18 Pro / 17 Pro: the user approved going over 30 s for this reel (full VO at natural speed), so no MAX_FRAMES cap */}
    <Composition id="IphonesReel9x16" component={IphonesReel} durationInFrames={ITL.totalFrames} fps={FPS} width={1080} height={1920} defaultProps={{ layout: LAYOUT_9x16 }} />
    <Composition id="IphonesReel1x1" component={IphonesReel} durationInFrames={ITL.totalFrames} fps={FPS} width={1080} height={1080} defaultProps={{ layout: LAYOUT_1x1 }} />
    <Still id="IphonesCover" component={IphonesCover} width={1080} height={1920} />
    <Composition id="MicminiReel9x16" component={MicminiReel} durationInFrames={Math.min(MTL.totalFrames, MAX_FRAMES)} fps={FPS} width={1080} height={1920} defaultProps={{ layout: LAYOUT_9x16 }} />
    <Composition id="MicminiReel1x1" component={MicminiReel} durationInFrames={Math.min(MTL.totalFrames, MAX_FRAMES)} fps={FPS} width={1080} height={1080} defaultProps={{ layout: LAYOUT_1x1 }} />
    <Still id="MicminiCover" component={MicminiCover} width={1080} height={1920} />
    {/* AirPods 5: the user approved going over 30 s for this reel (full VO at natural speed), so no MAX_FRAMES cap */}
    <Composition id="AirpodsReel9x16" component={AirpodsReel} durationInFrames={ATL.totalFrames} fps={FPS} width={1080} height={1920} defaultProps={{ layout: LAYOUT_9x16 }} />
    <Composition id="AirpodsReel1x1" component={AirpodsReel} durationInFrames={ATL.totalFrames} fps={FPS} width={1080} height={1080} defaultProps={{ layout: LAYOUT_1x1 }} />
    <Still id="AirpodsCover" component={AirpodsCover} width={1080} height={1920} />
    {/* Shokz OpenRun Pro: the user approved going over 30 s for this reel (full VO at natural speed), so no MAX_FRAMES cap */}
    <Composition id="ShokzReel9x16" component={ShokzReel} durationInFrames={ZTL.totalFrames} fps={FPS} width={1080} height={1920} defaultProps={{ layout: LAYOUT_9x16 }} />
    <Composition id="ShokzReel1x1" component={ShokzReel} durationInFrames={ZTL.totalFrames} fps={FPS} width={1080} height={1080} defaultProps={{ layout: LAYOUT_1x1 }} />
    <Still id="ShokzCover" component={ShokzCover} width={1080} height={1920} />
    <Still id="CitybotSheet" component={CitybotSheet} width={1920} height={1080} />
  </>
);
