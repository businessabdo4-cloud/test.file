# City Store: promo reel (Remotion)

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
