import React from 'react';
import {AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Subtitles} from './components/Subtitles';
import {Watermark} from './components/Watermark';
import {SceneEnter, Wipe} from './components/Motion';
import {AUDIO, COLORS, PUNCH_IN} from './config';
import {fontsLoaded} from './fonts';
import {MUSIC, VOICEOVER} from './media';
import {Benefits} from './scenes/Benefits';
import {Colors} from './scenes/Colors';
import {Cta} from './scenes/Cta';
import {Features} from './scenes/Features';
import {Hook} from './scenes/Hook';
import {Offer} from './scenes/Offer';
import {Problem} from './scenes/Problem';
import {Reveal} from './scenes/Reveal';
import {Trust} from './scenes/Trust';
import {PHRASES, SceneId, TOTAL_FRAMES, at, phrase, scene, sec} from './timeline';

const SCENE_VIEW: Record<SceneId, {C: React.FC; enter: 'zoom' | 'swipeLeft' | 'swipeUp' | 'none'}> = {
  hook: {C: Hook, enter: 'zoom'},
  problem: {C: Problem, enter: 'swipeLeft'},
  reveal: {C: Reveal, enter: 'none'}, // has its own splash wipe
  features: {C: Features, enter: 'zoom'},
  benefits: {C: Benefits, enter: 'swipeLeft'},
  colors: {C: Colors, enter: 'swipeUp'},
  offer: {C: Offer, enter: 'zoom'},
  trust: {C: Trust, enter: 'swipeLeft'},
  cta: {C: Cta, enter: 'zoom'},
};

// Sound effects: [file, absolute frame]. Edit/remove freely.
const sfxCues = (): [string, number][] => {
  const cut = (id: SceneId) => scene(id).from;
  const abs = (id: SceneId, p: number, o = 0) => scene(id).from + at(id, p, o);
  return [
    ['impact', 0],
    ['whoosh', cut('problem') - 4],
    ['riser', cut('reveal') - 18],
    ['whoosh', cut('reveal')],
    ['pop', cut('reveal') + 14],
    ['whoosh', cut('features') - 3],
    ['pop', abs('features', 9)],
    ['pop', abs('features', 11)],
    ['pop', abs('features', 12)],
    ['pop', abs('features', 13)],
    ['pop', abs('features', 14)],
    ['whoosh', cut('benefits') - 3],
    ['pop', abs('benefits', 19)],
    ['pop', abs('benefits', 20)],
    ['pop', abs('benefits', 21)],
    ['whoosh', cut('colors') - 3],
    ['pop', abs('colors', 23)],
    ['pop', abs('colors', 23, 0.45)],
    ['whoosh', cut('offer') - 3],
    ['whoosh', abs('offer', 24, 0.35)],
    ['impact', Math.max(abs('offer', 24, 0.35) + 6, abs('offer', 25, 0.3))],
    ['whoosh', cut('trust') - 3],
    ['ding', abs('trust', 26) + 8],
    ['ding', abs('trust', 27) + 8],
    ['ding', abs('trust', 27, 0.6) + 8],
    ['pop', abs('trust', 28)],
    ['whoosh', cut('cta') - 3],
    ['pop', cut('cta') + 4],
  ];
};

/** Quick 100% → ~106% "camera" punch-ins on key words (keeps energy up); decays back smoothly. */
const PunchZoom: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const hits = PUNCH_IN.phrases.filter((id) => PHRASES.some((p) => p.id === id)).map((id) => sec(phrase(id).start + 0.05));
  let z = 0;
  for (const h of hits) {
    const t = (frame - h) / fps;
    if (t >= 0 && t < 0.9) z = Math.max(z, Math.min(1, t / 0.08) * Math.exp(-t / 0.35));
  }
  return <AbsoluteFill style={{transform: `scale(${1 + PUNCH_IN.amount * z})`}}>{children}</AbsoluteFill>;
};

// Music ducking: lower under speech, lifts in the gaps, swells on the end card.
const speechMask = (() => {
  const m = new Float32Array(TOTAL_FRAMES).fill(0);
  for (const p of PHRASES) for (let f = sec(p.start - 0.05); f < sec(p.end + 0.08); f++) if (f >= 0 && f < TOTAL_FRAMES) m[f] = 1;
  const smooth = new Float32Array(TOTAL_FRAMES);
  for (let f = 0; f < TOTAL_FRAMES; f++) {
    let s = 0;
    for (let k = -4; k <= 4; k++) s += m[Math.min(TOTAL_FRAMES - 1, Math.max(0, f + k))];
    smooth[f] = s / 9;
  }
  return smooth;
})();

export const Ad: React.FC = () => {
  const [handle] = React.useState(() => delayRender('fonts'));
  React.useEffect(() => {
    fontsLoaded.then(() => continueRender(handle)).catch((e) => {
      console.error(e);
      continueRender(handle);
    });
  }, [handle]);

  const speechEnd = sec(phrase(29).end);

  return (
    <AbsoluteFill style={{background: COLORS.navy}}>
      <PunchZoom>
      {(Object.keys(SCENE_VIEW) as SceneId[]).map((id) => {
        const s = scene(id);
        const {C, enter} = SCENE_VIEW[id];
        return (
          <Sequence key={id} name={id} from={s.from} durationInFrames={s.durationInFrames}>
            <SceneEnter kind={enter}>
              <C />
            </SceneEnter>
          </Sequence>
        );
      })}

      {/* extra swipe wipes over some cuts */}
      <Wipe at={scene('features').from - 7} color={COLORS.white} />
      <Wipe at={scene('offer').from - 7} color={COLORS.price} direction={-1} />
      <Wipe at={scene('cta').from - 7} color={COLORS.whatsapp} />
      </PunchZoom>

      <Watermark />

      <Subtitles />

      {/* ── audio ── */}
      <Audio src={staticFile(VOICEOVER)} volume={AUDIO.voiceVolume} />
      {MUSIC && (
        <Audio
          src={staticFile(MUSIC)}
          loop
          volume={(f) => {
            const ducked = AUDIO.musicVolumeGap + (AUDIO.musicVolume - AUDIO.musicVolumeGap) * speechMask[Math.min(f, TOTAL_FRAMES - 1)];
            const end = interpolate(f, [speechEnd, speechEnd + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            const fade = interpolate(f, [0, 6, TOTAL_FRAMES - 20, TOTAL_FRAMES], [0, 1, 1, 0], {extrapolateRight: 'clamp'});
            return (ducked * (1 - end) + AUDIO.musicVolumeEnd * end) * fade;
          }}
        />
      )}
      {AUDIO.sfx &&
        sfxCues()
          .filter(([, f]) => f >= 0 && f < TOTAL_FRAMES)
          .map(([name, f], i) => (
            <Sequence key={i} from={f} durationInFrames={30} layout="none">
              <Audio src={staticFile(`sfx/${name}.wav`)} volume={AUDIO.sfxVolume} />
            </Sequence>
          ))}
    </AbsoluteFill>
  );
};
