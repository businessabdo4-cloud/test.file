import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { FPS } from '../data';

/** Absolute composition time (seconds) inside a <Sequence from={from}>. */
export const useT = (from: number) => (useCurrentFrame() + from) / FPS;

export const useFmt = () => {
	const { width, height } = useVideoConfig();
	return { W: width, H: height, sq: height < 1500 };
};

/** Pick a layout value for 9:16 or 1:1. */
export const pick = <T,>(sq: boolean, tall: T, square: T): T => (sq ? square : tall);

export const Camera: React.FC<{ zoom?: number; ox?: number; oy?: number; shake?: { x: number; y: number }; children: React.ReactNode }> = ({ zoom = 1, ox = 540, oy = 960, shake = { x: 0, y: 0 }, children }) => (
	<AbsoluteFill style={{ transform: `translate(${shake.x}px, ${shake.y}px) scale(${zoom})`, transformOrigin: `${ox}px ${oy}px` }}>{children}</AbsoluteFill>
);

/** Screen position of a point in a character's local coordinates (character drawn with x, y, scale, groundY). */
export const toScreen = (p: { x: number; y: number }, x: number, y: number, scale: number, groundY: number) => ({ x: x + p.x * scale, y: y + (p.y - groundY) * scale });
