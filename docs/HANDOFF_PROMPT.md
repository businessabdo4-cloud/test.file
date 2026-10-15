You are taking over a video-production project: short vertical promo reels for **City Store** (citystore.ma), a Moroccan electronics shop. Every reel so far was built by another Claude session in a single Remotion (React + TypeScript) project, which you will copy from a public GitHub repository. You must keep the exact same mascot, style and pipeline. Do not redesign anything. Reuse what exists.

## 1. Get the project (do this first)
The complete project (code, mascot, brand assets, fonts, logo, scripts and all previous reels as templates; finished videos and voice-over audio left out) is in the folder `citystore-reels-kit/` of the public repo `https://github.com/businessabdo4-cloud/test.file`, on branch `claude/youthful-faraday-k64h5z`. No login is needed. Download only that folder (~12 MB, the full repo is much bigger) with:
```bash
git clone --depth 1 --filter=blob:none --sparse -b claude/youthful-faraday-k64h5z https://github.com/businessabdo4-cloud/test.file kit-src
cd kit-src && git sparse-checkout set citystore-reels-kit && cd ..
```
- Copy everything inside `kit-src/citystore-reels-kit/` into the root of the repository attached to this session (my `citystore-reels-kit` repo). Commit it as the starting point, push, and delete `kit-src`. Work and push in that repo from then on.
- Install the tools:
  - **Node 18+:** `npm install`
  - **Python 3:** `pip install numpy scipy pillow soundfile pyloudnorm`
  - **System packages:** `ffmpeg` and `rubberband-cli` (pitch-kept speed-up)
  - **Rhubarb Lip Sync** (Citybot's mouth): `bash scripts/setup_rhubarb.sh`
  - **Remotion's Chromium:** if it can't download it, point `scripts/preview_stills.mjs` / `remotion render` at an existing Chromium with `--browser-executable`
- Quick test that the install works: `node scripts/preview_stills.mjs TabsCover 0.4 0 out/preview` should render a cover PNG.
- Read `README.md`: it has one table row per finished reel, with its compositions and its `npm run <id>:build` command.
- Study one recent reel end to end before writing anything. Good references:
  - `disc` (PS5 Disc Drive, 30 s)
  - `quest` (Meta Quest 3, 38.5 s, longer than 30 s)
  - `gopro` (GoPro HERO13 + accessory pack)

  For a reel `<id>`, these are its files:

  | Path | Contents |
  |---|---|
  | `reels/<id>/vo_lines.json` | subtitle lines and chunks |
  | `reels/<id>/reel.json` | voice-over timing config |
  | `reels/<id>/build_timeline.py` | scenes, events, sound effects |
  | `reels/<id>/cutout.py` | image preparation |
  | `reels/<id>/SOURCES.md` | where images and specs came from |
  | `src/reels/<id>/timeline.ts` | |
  | `src/reels/<id>/direction.tsx` | Citybot's acting |
  | `src/reels/<id>/*Scenes.tsx` | the product scenes |
  | `src/reels/<id>/*Reel.tsx` | the reel itself |
  | `src/reels/<id>/*Cover.tsx` | the cover |
  | `src/Root.tsx` | composition registration |
  | `package.json` | the `<id>:cutout`, `<id>:audio`, `<id>:render` and `<id>:build` scripts |

- Shared pieces you must reuse (never fork or restyle them):
  - **Mascot:** `src/citybot/Citybot.tsx` + `src/components/CitybotActor.tsx`. Citybot is the original phone-headed robot: lip-synced from Rhubarb mouth cues, blinks, gestures, hovers. It presents from the lower-left corner after the hook. Its acting goes in a per-reel `Direction` object (gestures, expressionAt, hops, squash, tilt, lookAt, flash).
  - **Frame, background, subtitles:** `src/compositions/ReelFrame.tsx`, `BrandBackground`, `Subtitles` (word-by-word, burned in, RTL/LTR aware).
  - **Ending scenes:** `ChecklistTrust` (trust scene), `ChatCta` (message CTA), `src/scenes/EndCard.tsx` (logo end card with the tagline "الأصلي ديما!").
  - **Building blocks:** `ProductImage` (light sweep), `SceneShell`/`useSceneFrame`/`Burst`, `LineIcon` (`src/components/Icons.tsx`; add new white line icons there if needed).
  - **Brand:** `src/brand.ts` (blue→cyan gradient, 15% white grid, Montserrat + Cairo for Arabic, white line icons).
  - **Pipeline scripts in `scripts/`:**

    | Script | Job |
    |---|---|
    | `process_vo_take.py` | trims pauses, optional ≤1.1x pitch-kept speed-up, word timings + lip sync. Add new brand/number pronunciations to the `SPOKEN` map in `process_vo.py` |
    | `make_music.py` | add one `STYLES` entry per reel; `dur` key for reels over 30 s |
    | `make_sfx.py` | sound effects |
    | `mix_audio.py` | voice at -14 LUFS, music ducked 10 dB with 150 ms ramps, SFX |
    | `make_srt.mjs` | subtitle file |
    | `finalize.sh` | final encode |
    | `verify.sh` | checks the output |
    | `preview_stills.mjs` + `contact_sheet.py` | preview frames |

## 2. What I send you for each reel
A Darija voice-over (.wav), the script (Darija with French words), the product images, and usually the phrase "the same as always". Images I paste mid-message sometimes don't arrive as files. If an image is missing on disk, ask me to resend it. The old reels' product images and audio are not in the zip, so you can read their code as a template but can't re-render them, and that's fine.

## 3. Rules (the same as always)
**Deliverables**
- Send me **only** the 9:16 video (1080x1920, 30 fps, H.264, yuv420p, AAC 48 kHz) and the cover PNG (1080x1920).
- Don't make a 1:1 version: register only `<Id>Reel9x16` and `<Id>Cover` in Root.
- An SRT is still generated and committed, but you don't need to send it.

**Length**
- Aim for 30 s. To fit, trim pauses first, then speed up ≤1.1x with pitch kept.
- If the voice-over still doesn't fit, I have approved going over 30 s at natural speed. Set `"maxSeconds": 60` in `reel.json`, give `make_music.py` a `dur`, and don't cap the composition at `MAX_FRAMES`.
- Always hold the final frame for the last second.
- Verify the length with `verify.sh` / ffprobe.

**Audio**
- Voice-over at -14 LUFS, true peak ≤ -1 dBTP.
- Music ducked under the voice.
- Sound effects land on the beat: cuts on the 120 BPM grid, hits on the half-beat nearest the trigger word.

**Images**
- Official product images only (the ones I send).
- If an image is low-res, enhance it before use: Lanczos 2–3x + unsharp + slight contrast.
- Clean the cutouts: crop to alpha, fix halos and partial alpha.
- Never keep English marketing text: crop or blur it.
- Make sure every image matches the exact model, colour and storage being sold. If it doesn't (for example the box says 128 GB but we sell 512 GB, or the image shows a different generation), don't use it, or ask me.
- Write `SOURCES.md` listing what was used, what wasn't, and why.

**Brand and design**
- Never use the Apple logo outside official product photos, and never imitate a brand's ads.
- Burned-in subtitles stay inside the safe zone.
- Everything must stay clear of:
  - Citybot in the lower-left corner,
  - the right-hand action column (keep content left of x≈950),
  - the bottom ~20%.

**Specs**
- Only show specs that are in my script.
- Where the claim needs it, add a small honest footnote. Earlier examples: "jusqu'à", compatibility notes, "connexion internet requise".

**Scene structure**
1. Hook with a drawn visual gag, Citybot centred.
2. Product intro with name + DISPONIBLE pill.
3. One scene per script line/feature, with animated numbers, chips and drawn illustrations.
4. Trust scene: "PRODUITS ORIGINAUX", Boîte fermée / Jamais ouverts / Jamais activés.
5. ChatCta with a French "Salam ! Je veux commander …" message.
6. End card.

**Cover**
- The product, a Darija hook pill on top, the product name, Citybot giving a thumbs up in the lower-left, and a "متوفر عند CITY STORE" ribbon.

## 4. How to work
1. Copy the newest similar reel as a template.
2. Process the voice-over. Detect pauses with `ffmpeg silencedetect` to set `takeBoundaries`, one per script line, then check the word timings.
3. Build the timeline, then the music, then the mix.
4. Write the scenes and typecheck with `npx tsc --noEmit`.
5. Render preview stills of key frames with `node scripts/preview_stills.mjs <Comp> 0.4 f1,f2,…`, look at the contact sheet, and fix overlaps or empty frames before the full render.
6. Run `npm run <id>:render`, then `REEL=<id> bash scripts/finalize.sh` and `REEL=<id> bash scripts/verify.sh`.
7. Check the loudness with ffmpeg ebur128.
8. If the 9:16 file is over 30 MB, also make a `reel_9x16_upload.mp4` with `-crf 21`, same specs, and send that copy.
9. Add a README row, commit and push.
10. Send me the video + cover with a short summary covering:
    - what each scene shows,
    - which images you used, skipped or enhanced, and why,
    - any spec you are unsure of (ask me to confirm rather than guessing).

The first reel I'll give you is a three e-reader comparison: Kobo Libra Colour, Kindle Colorsoft 16 GB Black, and Kindle Paperwhite (12th gen) 16 GB Black. The voice-over, script and images follow. Use the `tabs` reel (four-tablet comparison) as your template for a multi-product reel.
