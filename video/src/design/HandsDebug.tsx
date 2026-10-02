import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Hamza } from '../characters/Hamza';
import { Citybot } from '../characters/Citybot';

/** Close-up QA of hand gestures (not part of the ad). */
export const HandsDebug: React.FC = () => (
	<AbsoluteFill style={{ background: '#fff' }}>
		<Hamza x={260} y={1900} scale={2.2} expr="shocked" handL={{ x: -118, y: -70 }} handR={{ x: 118, y: -70 }} handKindL="open" handKindR="open" />
		<Hamza x={1000} y={1900} scale={2.2} expr="happy" handR={{ x: 136, y: 10 }} handKindR="thumb" />
		<Citybot x={1500} y={1500} scale={2.6} expr="wink" hover={28} handR={{ x: 140, y: -78 }} handKindR="point" />
	</AbsoluteFill>
);
