import React from 'react';
import {AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Subtitles} from './components/Subtitles';
import {Watermark} from './components/Watermark';
import {SceneEnter, Wipe} from './components/Motion';
import {AUDIO, COLORS, PUNCH_IN} from './config';
import {fontsLoaded} from './fonts';
import {MUSIC, VOICEOVER} from './media';
import {Cta} from './scenes/Cta';
import {Family} from './scenes/Family';
import {Hook} from './scenes/Hook';
import {Offer} from './scenes/Offer';
import {Quality} from './scenes/Quality';
import {Removes} from './scenes/Removes';
import {Reveal} from './scenes/Reveal';
import {Savings} from './scenes/Savings';
import {Membrane, Pump} from './scenes/Specs';
import {Stages} from './scenes/Stages';
import {PHRASES, SceneId, TOTAL_FRAMES, at, phrase, scene, sec} from './timeline';

const SCENE_VIEW: Record<SceneId, {C: React.FC; enter: 'zoom' | 'swipeLeft' | 'swipeUp' | 'none'}> = {
  hook: {C: Hook, enter: 'none'},
  reveal: {C: Reveal, enter: 'none'}, // has its own splash wipe
  savings: {C: Savings, enter: 'swipeLeft'},
  family: {C: Family, enter: 'zoom'},
  stages: {C: Stages, enter: 'zoom'},
  removes: {C: Removes, enter: 'swipeLeft'},
  membrane: {C: Membrane, enter: 'zoom'},
  pump: {C: Pump, enter: 'swipeUp'},
  quality: {C: Quality, enter: 'zoom'},
  offer: {C: Offer, enter: 'zoom'},
  cta: {C: Cta, enter: 'zoom'},
};

// Sound effects (generated with ElevenLabs, assets/sfx/): [file, absolute frame, volume multiplier]. Edit/remove freely.
const sfxCues = (): [string, number, number][] => {
  const cut = (id: SceneId) => scene(id).from;
  const abs = (id: SceneId, p: number, o = 0) => scene(id).from + at(id, p, o);
  const stagesStep = Math.max(5, Math.floor((at('stages', 11) - 6) / 6));
  return [
    // hook
    ['impact', 0, 1.1],
    ['whoosh', abs('hook', 2) - 3, 0.8],
    ['glitch', abs('hook', 3), 0.9],
    ['pop', abs('hook', 3) + 4, 1],
    // reveal
    ['riser', cut('reveal') - 20, 0.7],
    ['splash', cut('reveal'), 1.1],
    ['sparkle', cut('reveal') + 6, 0.8],
    ['impact', Math.max(cut('reveal') + 16, abs('reveal', 5) - 8) + 6, 0.8],
    // savings
    ['whoosh', cut('savings') - 3, 0.9],
    ['click', cut('savings') + 4, 0.8],
    ['click', cut('savings') + 10, 0.8],
    ['click', cut('savings') + 16, 0.8],
    ['pop', Math.max(cut('savings') + 18, abs('savings', 7) + 6), 1.2],
    ['cash', Math.max(cut('savings') + 18, abs('savings', 7) + 6) + 4, 0.7],
    // family
    ['whoosh', cut('family') - 3, 0.9],
    ['splash', cut('family') + 2, 0.6],
    ['pop', cut('family') + 10, 0.9],
    ['pop', cut('family') + 16, 0.9],
    // stages
    ['whoosh', cut('stages') - 3, 0.9],
    ...[0, 1, 2, 3, 4, 5].map((i): [string, number, number] => ['click', cut('stages') + 4 + i * stagesStep, 1]),
    ['pop', abs('stages', 12), 1],
    ['sparkle', abs('stages', 12) + 12, 0.7],
    // removes
    ['whoosh', cut('removes') - 3, 0.9],
    ['pop', cut('removes') + 2, 0.8],
    ['pop', cut('removes') + 5, 0.8],
    ['pop', cut('removes') + 8, 0.8],
    ['whoosh', Math.max(cut('removes') + 12, abs('removes', 14) - 2), 0.7],
    ['sparkle', abs('removes', 14) + 4, 0.8],
    ['pop', abs('removes', 15), 0.9],
    // membrane
    ['whoosh', cut('membrane') - 3, 0.9],
    ['riser', abs('membrane', 17) - 24, 0.5],
    ['impact', abs('membrane', 17), 0.9],
    // pump
    ['whoosh', cut('pump') - 3, 0.9],
    ['pop', abs('pump', 19), 1],
    // quality
    ['riser', cut('quality') - 22, 0.6],
    ['splash', cut('quality'), 1.1],
    ['sparkle', abs('quality', 21), 1],
    // offer
    ['whoosh', cut('offer') - 3, 0.9],
    ['pop', cut('offer') + 1, 0.8],
    ['impact', Math.max(cut('offer') + 6, abs('offer', 23) - 1), 1.1],
    ['cash', Math.max(cut('offer') + 6, abs('offer', 23) - 1) + 2, 1],
    ['whoosh', abs('offer', 24), 0.9],
    ['pop', abs('offer', 25), 1],
    // cta
    ['whoosh', cut('cta') - 3, 0.9],
    ['message', cut('cta') + 6, 0.9],
    ['click', Math.max(cut('cta') + 16, abs('cta', 26, 0.7)), 1.2],
    ['message', Math.max(cut('cta') + 16, abs('cta', 26, 0.7)) + 2, 1],
    ['sparkle', abs('cta', 27), 0.8],
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

  const speechEnd = sec(PHRASES[PHRASES.length - 1].end);

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
      <Wipe at={scene('stages').from - 7} color={COLORS.white} />
      <Wipe at={scene('membrane').from - 7} color={COLORS.water} direction={-1} />
      <Wipe at={scene('offer').from - 7} color={COLORS.price} direction={-1} />
      <Wipe at={scene('cta').from - 7} color={COLORS.chat} />
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
          .map(([name, f, v], i) => (
            <Sequence key={i} from={f} durationInFrames={60} layout="none">
              <Audio src={staticFile(`sfx/${name}.wav`)} volume={AUDIO.sfxVolume * v} />
            </Sequence>
          ))}
    </AbsoluteFill>
  );
};
