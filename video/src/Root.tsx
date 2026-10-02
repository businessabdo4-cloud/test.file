import React from 'react';
import { Composition, Still } from 'remotion';
import { BrandStill, SheetCitybot, SheetHamza, StreetStill } from './design/Sheets';
import { HandsDebug } from './design/HandsDebug';

export const Root: React.FC = () => (
	<>
		<Still id="SheetHamza" component={SheetHamza} width={1920} height={1080} />
		<Still id="SheetCitybot" component={SheetCitybot} width={1920} height={1080} />
		<Still id="Street9x16" component={StreetStill} width={1080} height={1920} />
		<Still id="Street1x1" component={StreetStill} width={1080} height={1080} defaultProps={{ square: true }} />
		<Still id="HandsDebug" component={HandsDebug} width={1920} height={1400} />
		<Still id="BrandSwitch9x16" component={BrandStill} width={1080} height={1920} />
	</>
);
