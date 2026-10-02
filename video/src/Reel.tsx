import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from 'remotion';
import cuesJson from '../../assets/sfx/cues.json';
import { DURATION_FRAMES, FPS, LINES, MUSIC, SCENES, SceneKey, toFrame } from './data';
import { Subtitles } from './components/Subtitles';
import { PRODUCTS_READY, PreviewBadge } from './components/Props';
import { pick, useFmt } from './scenes/common';
import { Scene1Street } from './scenes/Scene1Street';
import { Scene2Burst } from './scenes/Scene2Burst';
import { Scene3Unboxing } from './scenes/Scene3Unboxing';
import { Scene4Showroom } from './scenes/Scene4Showroom';
import { Scene5CTA } from './scenes/Scene5CTA';
import { Scene6EndCard } from './scenes/Scene6EndCard';

const SCENE_COMPONENTS: Record<SceneKey, React.FC<{ from: number }>> = {
	s1: Scene1Street,
	s2: Scene2Burst,
	s3: Scene3Unboxing,
	s4: Scene4Showroom,
	s5: Scene5CTA,
	s6: Scene6EndCard,
};

type CueRow = { name: string; file: string; frame: number; gain: number };
const CUES = cuesJson as CueRow[];

/** Music bed (once a track is supplied): ducked by MUSIC.duckDb under speech with MUSIC.rampSec ramps. */
const musicVolume = (t: number) => {
	const r = MUSIC.rampSec;
	let env = 0;
	for (const l of LINES) {
		const e = t < l.start - r || t > l.end + r ? 0 : t < l.start ? (t - (l.start - r)) / r : t > l.end ? 1 - (t - l.end) / r : 1;
		env = Math.max(env, e);
	}
	const fadeOut = Math.min(1, Math.max(0, (DURATION_FRAMES / FPS - t) / 0.6));
	return 10 ** ((MUSIC.gainDb + MUSIC.duckDb * env) / 20) * fadeOut;
};

export const Reel: React.FC = () => {
	const frame = useCurrentFrame();
	const t = frame / FPS;
	const { sq } = useFmt();
	const keys = Object.keys(SCENES) as SceneKey[];
	const endCard = t >= SCENES.s6.start;
	const sub = pick(
		sq,
		endCard ? { top: 1030, left: 70, width: 860, fontSize: 54 } : { top: 250, left: 70, width: 860, fontSize: 60 },
		{ top: 26, left: 90, width: 900, fontSize: 44 },
	);
	return (
		<AbsoluteFill style={{ background: '#101640' }}>
			{keys.map((k, i) => {
				const from = toFrame(SCENES[k].start);
				const to = i === keys.length - 1 ? DURATION_FRAMES : toFrame(SCENES[k].end);
				const C = SCENE_COMPONENTS[k];
				return (
					<Sequence key={k} name={k} from={from} durationInFrames={to - from}>
						<C from={from} />
					</Sequence>
				);
			})}
			<Subtitles t={t} {...sub} only={endCard ? 'L7' : undefined} />
			<PreviewBadge show={!PRODUCTS_READY} top={sq ? 1030 : 1870} />
			<Audio src={staticFile('vo/dialogue_comp.wav')} />
			{CUES.map((c) => (
				<Sequence key={c.name} from={c.frame} name={`sfx:${c.name}`}>
					<Audio src={staticFile(c.file)} volume={c.gain} />
				</Sequence>
			))}
			{MUSIC.file ? <Audio src={staticFile(MUSIC.file)} loop volume={(f) => musicVolume(f / FPS)} /> : null}
		</AbsoluteFill>
	);
};
