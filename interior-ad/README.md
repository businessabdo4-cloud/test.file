# ROIA MEDIA — interior-designer ad (Remotion)

9:16 / 1080×1920 / 30 fps French video ad: *« Designers d’intérieur au Maroc… Envoyez-moi « SITE » en message pour commencer ! »*

Deliverables: `out/final.mp4`, `out/captions.srt`, `transcript.json` (corrected words, source-audio timestamps).

## Pipeline

```bash
npm install                      # remotion 4, react 18
python3 scripts/prepare.py       # words -> beats, caption groups, sync/hit events (src/data/timeline.json), out/captions.srt
python3 scripts/audio.py         # clean voice (-14 LUFS), synthesized SFX + quiet background song (ducked) -> work/mix.wav
npm run render                   # Remotion -> work/video.mp4 (uses the preinstalled headless Chromium)
sh scripts/finalize.sh           # mux AAC 192 kbps -> out/final.mp4 and print checks
```

`scripts/transcribe.py <models_dir>` is the ASR step that produced the word timings in `scripts/prepare.py`
(Whisper large-v3-turbo text + French Zipformer token times, via sherpa-onnx; faster-whisper/openai-whisper
weights could not be downloaded in the build environment).

## Brand

Palette sampled from the ROIA MEDIA logo: navy `#001638` (backgrounds), yellow `#E4C037` (accent, stripes),
white `#F4FBFD` (type), royal blue `#0B3AA8` (guarantee screen; lifted from the logo asterisk `#023199`).
The logo (`public/brand/roia-media-logo.png`, keyed from the supplied artwork) appears as a watermark in
beats 2–3 and as the end-card sign-off; its four-stripe racetrack is redrawn as a vector motif (`Stripes`)
for the hook. The phone mockup keeps a warm neutral palette because it shows the *client's* site.

## Sound

Hits share times with the visuals via `timeline.events`:
- hook: whoosh into a sub-boom impact as « DESIGNERS » slams in (0.24 s, with flash + shake), sparkle hit on « Maroc »
- « Envoyez-moi « SITE » »: pop-up swoosh, key taps on each letter, click + “message sent” bloop, impact when the big « SITE » lands
- background song: 100 BPM lo-fi house groove in A minor (Am9–Fmaj7–Cmaj7–G6), -27 LUFS and ducked ≈6 dB under the voice,
  drums drop out under the zoom-through and return for the CTA

## Source map

| File | Role |
|---|---|
| `src/theme.ts` | Design system: brand + site palettes, fonts, easing, safe zone, arch path, transition windows |
| `src/Ad.tsx` | Composition: scenes, the 3 transitions (arch wipe, horizontal slide, zoom-through), logo watermark, captions |
| `src/scenes/Hook.tsx` | Beat 1: stripes race-in, « DESIGNERS » slam, arch + asterisk on « Maroc », inquiry notifications |
| `src/scenes/Offer.tsx` | Beat 2: phone mockup with a coded portfolio site, project cards, quote button + form |
| `src/scenes/Guarantee.tsx` | Beat 3: guarantee statement, self-drawing checkmark |
| `src/scenes/CallToAction.tsx` | Beat 4: chat composer typing SITE, send, logo end card with « SITE » (set `HANDLE` there) |
| `src/components/` | Background, Brand (Logo, Stripes, Asterisk), Captions, InteriorArt (SVG interiors), Zellige |

Fonts (SIL OFL, `public/fonts`): Playfair Display 500/600/500 italic, Manrope 500/700/800.
Drop real project photos in `assets/` and swap `<InteriorArt>` for `<Img>` in `Offer.tsx` to use them.
