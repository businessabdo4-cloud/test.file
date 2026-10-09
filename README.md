# City Store: promo reels (Remotion)

30-second vertical promo reel for **City Store (citystore.ma)** with the Citybot mascot.

## Deliverables (`out/`)
| File | What |
|---|---|
| `reel_9x16.mp4` | 1080×1920, 30 fps, H.264 + AAC, exactly 900 frames / 30.0 s (Reels / TikTok) |
| `reel_1x1.mp4` | 1080×1080 re-layout, same timing |
| `cover_1080x1920.png` | cover / thumbnail (Citybot + iPhone 18 Pro) |
| `reel_fr.srt` | French subtitles (same chunks as the burned-in ones) |

## Pipeline
```
npm install && npm run setup     # rhubarb, fonts, brand colours, logo layers
npm run vo:split                 # only if the VO comes as one take (assets/vo/vo_full_take.wav)
npm run build                    # products -> VO fit + lip sync -> timeline -> music -> SFX -> mix
                                 # -> SRT -> renders -> finalize -> ffprobe verification
npm run studio                   # interactive preview
```
- **Timing**: `scripts/build_timeline.py` writes `public/data/timeline.json`, which both the
  picture and the audio mix use. Scenes cut on the 120 BPM grid; text hits and gestures land on
  the half-beat nearest to the spoken word.
- **VO**: `assets/vo/line_0X.wav` (human) > `assets/vo_tts/` (ElevenLabs) > `assets/vo_scratch/`.
  Silences trimmed, max 1.1× speed-up, never extends the 30 s.
- **Lip sync**: Rhubarb (`-r phonetic`) → 9 mouth shapes in `src/citybot/Mouths.tsx`.
- **Products**: drop official images into `assets/products/` (names in `SOURCES.md`), then rebuild.
  Without them the phones are a stylised illustration and the categories are animated line-icons.
- **Placeholders**: warranty / delivery / price in `src/config.ts` (off by default).

## Reels
| Reel | Compositions | Outputs | Build |
|---|---|---|---|
| iPhone 18 Pro (FR) | `Reel9x16`, `Reel1x1`, `Cover` | `out/` | `npm run build` |
| Apple Watch Ultra 4 (Darija) | `WatchReel9x16`, `WatchReel1x1`, `WatchCover` | `out/watch/` | `npm run watch:build` |
| Galaxy Watch8 Classic + Ultra2 (Darija) | `GalaxyReel9x16`, `GalaxyReel1x1`, `GalaxyCover` | `out/galaxy/` | `npm run galaxy:build` |
| Sony WH-1000XM6 + XM5 (Darija) | `SonyReel9x16`, `SonyReel1x1`, `SonyCover` | `out/sony/` | `npm run sony:build` |
| Ray-Ban Meta Headliner + Wayfarer Gen 2 (Darija) | `RaybanReel9x16`, `RaybanReel1x1`, `RaybanCover` | `out/rayban/` | `npm run rayban:build` |
| OnePlus Watch 3 Emerald Titanium (Darija) | `OneplusReel9x16`, `OneplusReel1x1`, `OneplusCover` | `out/oneplus/` | `npm run oneplus:build` |
| DJI Osmo Pocket 4 + Pocket 3 Creator Combo (Darija, **56 s**, user-approved over 30 s) | `OsmoReel9x16`, `OsmoReel1x1`, `OsmoCover` | `out/osmo/` | `npm run osmo:build` |
| Nintendo Switch OLED noir & blanc (Darija) | `SwitchReel9x16`, `SwitchReel1x1`, `SwitchCover` | `out/switch/` | `npm run switch:build` |
| iPhone 18 Pro + iPhone 17 Pro (Darija in Latin script, **38 s**, user-approved over 30 s) | `IphonesReel9x16`, `IphonesReel1x1`, `IphonesCover` | `out/iphones/` | `npm run iphones:build` |

Shared parts: Citybot (`src/citybot`), its actor engine (`src/components/CitybotActor.tsx`, with
per-reel acting in `src/reels/<reel>/direction`), bidi-aware subtitles (French, Darija or mixed),
scene shell, logo end card, and the audio pipeline. Select a reel for the scripts with `REEL=<id>`.
A reel recorded as one continuous take uses `scripts/process_vo_take.py` with the sentence
boundaries listed in `reels/<reel>/reel.json`.
