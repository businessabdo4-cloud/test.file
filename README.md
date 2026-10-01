# GLASSE POWER 6ST — vertical ad (Remotion)

A 9:16 (1080×1920, 30 fps, H.264) ad for Instagram Reels / TikTok / Facebook / WhatsApp Status,
synced to the Darija voice-over in `assets/voiceover.mp3`.

```
npm install
npm run render            # -> out/glasse-power-ad.mp4
npm run studio            # live preview / scrubbing in the browser
```

## Pipeline (run in this order when assets change)

| Step | Command | What it does |
|---|---|---|
| 0a | `python3 scripts/clean_vo.py` | voice-over clean-up: trims dead air + long pauses (crossfaded), EQ, de-ess, compression, -16 LUFS → `assets/vo/voiceover-clean.wav` + `edits.json` |
| 0b | `python3 scripts/align_subtitles.py --audio assets/vo/voiceover-raw.wav --edits assets/vo/edits.json --final-audio assets/vo/voiceover-clean.wav` | subtitle timing for the exact words in `assets/vo/script.txt` (see `script.previous.txt` for the format) |
| 0c | `python3 scripts/pick_music.py` | analyses every track in `assets/music/` (BPM, energy, beat, brightness) and picks the best fit → `choice.json` |
| 1 | `python3 scripts/process_products.py inspect` | converts `assets/products/*` to PNG, reports sizes/backgrounds, writes `assets/products/roles.json` (say which photo is which) |
| 2 | `python3 scripts/process_products.py cutout` | BiRefNet background removal + halo clean-up + 2× Real-ESRGAN → `assets/products/cutout/` |
| 3 | `python3 scripts/process_products.py vertical` | 1080×1920 designed plates (clean + "GLASSE POWER" title) → `assets/products/vertical/` |
| 4 | `python3 scripts/make_generated.py` | close-ups / faucet cut-out / product-with-glass / red+blue split → `assets/generated/` |
| 5 | `python3 scripts/fetch_stock.py --apply` | Pixabay search + download + 9:16 crop + trim → `assets/stock/`, `credits.txt` |
| 5b | `python3 scripts/make_music.py` | original background track → `assets/music/glasse-groove-generated.wav` |
| 6 | `python3 scripts/build_media_manifest.py` | wires whatever exists into `src/data/media.json` |
| 7 | `python3 scripts/align_subtitles.py` | re-times subtitles from the audio (only if the voice-over changes) |
| 8 | `node scripts/render_stills.mjs 20 185 600 700 900` | review stills in `out/stills/` |
| 9 | `npm run render` | final MP4 |

Anything missing (no stock clip, no photo) falls back to the motion-graphics version of that scene.

## Most likely tweaks

**Price / old price / promo label** — `src/config.ts` → `OFFER` (`price: '2049'`, `oldPrice: '2400'`).
The subtitle wording itself is in `src/data/subtitles.json` (phrase 25).

**Phone number / address** — `src/config.ts` → `CONTACT`.

**Subtitle timing** — `src/data/subtitles.json`: each phrase has `start`/`end` in seconds.
Scenes are cut from these times too (`SCENE_STARTS` in `src/config.ts` says which phrase opens each
scene), so nudging a phrase also moves its scene. `text` is shown verbatim; `highlight` lists the
accent words (a plain string = yellow, or `{"word": "...", "color": "#..."}`).
Timing was aligned to the exact script from pauses in the audio (Whisper's model host was blocked
in this environment); run `python3 scripts/align_subtitles.py --whisper` if Whisper is available.

**Punch-ins & ducking** — `PUNCH_IN` in `src/config.ts` lists the subtitle phrases that get a quick
100→106% camera punch-in; `AUDIO.musicVolumeGap` is how far the music lifts between lines.

**Logo on screen** — the WATER MAROC logo stays top-left for the whole ad and hands over to the
big logo on the trust + end-card scenes. Size/position (or `handOffToBigLogo: false` to keep the
small one there too) in `src/config.ts` → `LOGO_WATERMARK`.

**Colors** — `src/config.ts` → `COLORS` (red/teal product colors, price yellow, WhatsApp green,
subtitle accent). Background gradients per scene: `src/components/Background.tsx` → `GRADIENTS`.
Stock-footage grades: `src/components/Media.tsx` → `GRADES`.

**Images** — put new photos in `assets/products/`, then steps 1–4 + 6. To hand-pick a file, edit
`src/data/media.json` directly (paths relative to `assets/`, `null` = fallback graphics).
Logo: drop the original at `assets/logo.png` and run step 6 (otherwise a vector re-drawing is used).

**Stock clips** — `python3 scripts/fetch_stock.py --scene benefitsTea --pick 2 --apply` swaps a
scene's clip for the 2nd-ranked candidate (see `assets/stock/candidates.json`). Search terms are in
`SCENES` at the top of `scripts/fetch_stock.py`. Set a clip to `null` in `media.json` to drop it.

**Audio mix** — `src/config.ts` → `AUDIO` (voice, music and SFX volumes).
The background music `assets/music/glasse-groove-generated.wav` is an original track composed in code
(`python3 scripts/make_music.py`, royalty-free): tense intro, drop on the GLASSE POWER reveal,
busier on the price, final chord on the end card. It follows the subtitle timing, so re-run it
after editing `subtitles.json`. To use your own tracks, put them in `assets/music/` and run step 0c + 6 (the picker chooses); it sits under the voice and swells on the end card.
Sound effects are synthesized locally (`scripts/make_sfx.py`, royalty-free) and cued in
`src/Ad.tsx` → `sfxCues` (set `AUDIO.sfx = false` to mute them all).
