import {VARIANT} from './variant';
import {SCENE_STARTS, VIDEO} from './config';

export type Highlight = string | {word: string; color: string};
export type Phrase = {
  id: number;
  line: number;
  text: string;
  start: number;
  end: number;
  highlight: Highlight[];
};

export const PHRASES: Phrase[] = VARIANT.subtitles.phrases as Phrase[];
export const FPS = VIDEO.fps;

export const sec = (s: number) => Math.round(s * FPS);

export const phrase = (id: number): Phrase => {
  const p = PHRASES.find((x) => x.id === id);
  if (!p) throw new Error(`No subtitle phrase with id ${id}`);
  return p;
};

export const SPEECH_END = VARIANT.subtitles.speechEnd;
export const TOTAL_FRAMES = Math.ceil(
  Math.max(SPEECH_END + VIDEO.endHoldSeconds, VARIANT.subtitles.audioDuration + 0.5) * FPS,
);

export type SceneId = keyof typeof SCENE_STARTS;
export const SCENE_ORDER: SceneId[] = [
  'hook',
  'reveal',
  'savings',
  'family',
  'stages',
  'removes',
  'membrane',
  'pump',
  'quality',
  'offer',
  'cta',
];

const LEAD = 0.12; // cut a little before the words land

// Scene boundaries follow the subtitle timing, so editing subtitles-<city>.json re-times the video.
export const SCENES = SCENE_ORDER.map((id, i) => {
  const first = phrase(SCENE_STARTS[id]);
  const prevPhrase = PHRASES.find((p) => p.id === SCENE_STARTS[id] - 1);
  const startS = i === 0 ? 0 : Math.max(prevPhrase ? prevPhrase.end : 0, first.start - LEAD);
  return {id, from: sec(startS), startS};
}).map((s, i, all) => {
  const to = i < all.length - 1 ? all[i + 1].from : TOTAL_FRAMES;
  return {...s, durationInFrames: to - s.from};
});

export const scene = (id: SceneId) => SCENES.find((s) => s.id === id)!;

/** Frame (relative to a scene's start) at which phrase `id` begins. */
export const at = (sceneId: SceneId, phraseId: number, offsetS = 0) =>
  sec(phrase(phraseId).start + offsetS) - scene(sceneId).from;

/** Frame relative to a scene start for an absolute time in seconds. */
export const atTime = (sceneId: SceneId, t: number) => sec(t) - scene(sceneId).from;
