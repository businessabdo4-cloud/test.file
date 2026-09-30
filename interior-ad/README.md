# Interior-designer ad (Remotion)

9:16 / 1080×1920 / 30 fps French video ad: *« Designers d’intérieur au Maroc… Envoyez-moi « SITE » en message pour commencer ! »*

Deliverables: `out/final.mp4`, `out/captions.srt`, `transcript.json` (corrected words, source-audio timestamps).

## Pipeline

```bash
npm install                      # remotion 4, react 18
python3 scripts/prepare.py       # words -> beats, caption groups, sync events (src/data/timeline.json), out/captions.srt
python3 scripts/audio.py         # clean voice (-14 LUFS), synthesized SFX + ducked ambient bed -> work/mix.wav
npm run render                   # Remotion -> work/video.mp4 (uses the preinstalled headless Chromium)
sh scripts/finalize.sh           # mux AAC 192 kbps -> out/final.mp4 and print checks
```

`scripts/transcribe.py <models_dir>` is the ASR step that produced the word timings in `scripts/prepare.py`
(Whisper large-v3-turbo text + French Zipformer token times, via sherpa-onnx; faster-whisper/openai-whisper
weights could not be downloaded in the build environment).

## Source map

| File | Role |
|---|---|
| `src/theme.ts` | Design system: colours, fonts, easing, safe zone, arch path, transition windows |
| `src/Ad.tsx` | Composition: scenes + the 3 transitions (arch wipe, horizontal slide, zoom-through) + captions |
| `src/scenes/Hook.tsx` | Beat 1: kinetic serif type, arch highlight on « Maroc », inquiry notifications |
| `src/scenes/Offer.tsx` | Beat 2: phone mockup with a coded portfolio site, project cards, quote button + form |
| `src/scenes/Guarantee.tsx` | Beat 3: guarantee statement, self-drawing checkmark |
| `src/scenes/CallToAction.tsx` | Beat 4: chat composer typing SITE, send, final « SITE » (set `HANDLE` / `BRAND` there) |
| `src/components/` | Background (gradient drift + zellige), Captions, InteriorArt (SVG interiors) |

Fonts (SIL OFL, `public/fonts`): Playfair Display 500/600/500 italic, Manrope 500/700/800.
Drop real project photos in `assets/` and swap `<InteriorArt>` for `<Img>` in `Offer.tsx` to use them.
