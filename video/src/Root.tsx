import React from 'react';
import { Composition, Still } from 'remotion';
import { Reel } from './Reel';
import { Thumbnail } from './Thumbnail';
import { PriceSheet } from './pricelist/PriceSheet';
import { DURATION_FRAMES, FPS } from './data';
import { BrandStill, SheetCitybot, SheetHamza, StreetStill } from './design/Sheets';
import { HandsDebug } from './design/HandsDebug';

export const Root: React.FC = () => (
	<>
		<Composition id="Reel9x16" component={Reel} width={1080} height={1920} fps={FPS} durationInFrames={DURATION_FRAMES} />
		<Composition id="Reel1x1" component={Reel} width={1080} height={1080} fps={FPS} durationInFrames={DURATION_FRAMES} />
		<Still id="PriceAccessoires4x5" component={PriceSheet} width={1080} height={1350} defaultProps={{ sheet: 0 }} />
		<Still id="PriceAccessoires1x1" component={PriceSheet} width={1080} height={1080} defaultProps={{ sheet: 0, square: true }} />
		<Still id="PriceMontres4x5" component={PriceSheet} width={1080} height={1350} defaultProps={{ sheet: 1 }} />
		<Still id="PriceMontres1x1" component={PriceSheet} width={1080} height={1080} defaultProps={{ sheet: 1, square: true }} />
		<Still id="Thumbnail" component={Thumbnail} width={1080} height={1920} />
		<Still id="SheetHamza" component={SheetHamza} width={1920} height={1080} />
		<Still id="SheetCitybot" component={SheetCitybot} width={1920} height={1080} />
		<Still id="Street9x16" component={StreetStill} width={1080} height={1920} />
		<Still id="Street1x1" component={StreetStill} width={1080} height={1080} defaultProps={{ square: true }} />
		<Still id="HandsDebug" component={HandsDebug} width={1920} height={1400} />
		<Still id="BrandSwitch9x16" component={BrandStill} width={1080} height={1920} />
	</>
);
