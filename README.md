# City Store — "واش أوريجينال؟" (30 s animated sketch ad)

Remotion (React + TypeScript) ad in Moroccan Darija: Hamza's friend got a fake phone; Citybot pops out of the
phone and shows him that at City Store everything is original — including the iPhone 18 Pro and 18 Pro Max.

## Deliverables (`deliverables/`)
| File | Spec |
|---|---|
| `reel_9x16.mp4` | 1080×1920, 30 fps, H.264 yuv420p BT.709, 751 frames (25.03 s), AAC, −14.2 LUFS |
| `reel_1x1.mp4` | 1080×1080, same timing, re-laid-out for square |
| `thumbnail_9x16.png` | 1080×1920 cover |
| `reel.srt` | Darija subtitles from the script (with speaker names) |

Scene stills: `review/scenes/`. Character sheets and backdrop: `review/step5/`.

## Pipeline
```bash
python3 tools/process_vo.py      # split lines, word timings, −14 LUFS, robot FX → assets/vo/timings.json
python3 tools/lipsync.py         # Rhubarb (phonetic) → assets/vo/lipsync.json
python3 tools/extract_logo.py    # white logo parts for the end card
python3 tools/make_sfx.py        # synthesize SFX
python3 tools/sfx_cues.py        # place SFX + check none covers a word → assets/sfx/cues.json
python3 tools/prepare_products.py  # official product images → cut-outs + manifest (see below)
./tools/render_all.sh            # render everything + verify ≤ 900 frames / ≤ 30.0 s
```
All scene timing is read from `assets/vo/timings.json`; subtitle text comes from `assets/vo/script.json`.
`cd video && npx remotion studio` opens the project for editing.

## Still to do
1. **Official iPhone images** — put the 16 Apple images in `assets/products/raw/` named
   `<iphone-18-pro-max|iphone-18-pro>_<black|silver|glacier|burgundy>_<front|back>.png`, run
   `python3 tools/prepare_products.py`, then `./tools/render_all.sh`. The placeholders and the PREVIEW badge
   disappear automatically. List the exact image URLs in `SOURCES.md`.
2. **Music** — add a royalty-free track to `assets/music/` and set `"file"` in `assets/music/music.json`; it is
   ducked 10 dB under speech with 150 ms ramps automatically.
