import React from 'react';
import { AbsoluteFill } from 'remotion';
import { BRAND_GRADIENT, C } from '../brand';

/** City Store world: the logo's blue→cyan gradient with its thin white grid. */
export const BrandWorld: React.FC<{ width: number; height: number; cell?: number; gridShift?: number }> = ({ width, height, cell = 83, gridShift = 0 }) => {
	const cols = Math.ceil(width / cell) + 2;
	const rows = Math.ceil(height / cell) + 2;
	const off = gridShift % cell;
	return (
		<AbsoluteFill style={{ background: BRAND_GRADIENT }}>
			<svg width={width} height={height} style={{ position: 'absolute', inset: 0 }}>
				<g stroke="#FFFFFF" strokeWidth={2} opacity={C.gridOpacity}>
					{Array.from({ length: cols }).map((_, i) => (
						<line key={`v${i}`} x1={i * cell - off} x2={i * cell - off} y1={0} y2={height} />
					))}
					{Array.from({ length: rows }).map((_, i) => (
						<line key={`h${i}`} x1={0} x2={width} y1={i * cell - off} y2={i * cell - off} />
					))}
				</g>
			</svg>
		</AbsoluteFill>
	);
};
