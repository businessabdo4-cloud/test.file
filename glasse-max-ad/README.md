# GLASSE MAX — Water Maroc vertical ad (Remotion)

A 9:16 (1080×1920, 30 fps, H.264) ad for Instagram Reels / TikTok / Facebook / WhatsApp Status,
cut to a Darija voice-over (1799 DH, free delivery). Two city versions share every scene:

| Version | Voice-over | Subtitles | Output |
|---|---|---|---|
| Safi (default) | `assets/vo/voiceover-raw.wav` | `src/data/subtitles-safi.json` | `out/glasse-max-ad.mp4` (32.9 s) |
| Youssoufia | `assets/vo/youssoufia/voiceover-raw.wav` | `src/data/subtitles-youssoufia.json` | `out/glasse-max-ad-youssoufia.mp4` (34.0 s) |

```
npm install
npm run render:safi        # -> out/glasse-max-ad.mp4
npm run render:youssoufia  # -> out/glasse-max-ad-youssoufia.mp4
npm run render             # both
npm run studio             # live preview (set the "city" input prop to switch)
```

The city name on screen (hook pin badge, delivery badge, end-card recap) and which voice-over /
subtitle file is used come from `src/variant.ts`; the render picks one with `--props '{"city":"youssoufia"}'`.

### Adding another city

1. Put the take in `assets/vo/<city>/voiceover-raw.wav` and its exact words in `assets/vo/<city>/script.txt`
   (same 27 on-screen phrases, same line format as `assets/vo/script.txt`).
2. `python3 scripts/clean_vo.py --in assets/vo/<city>/voiceover-raw.wav --out-dir assets/vo/<city>`
3. Write `assets/vo/<city>/line_spans.json` (start/end of each script line, read off the pauses), then
   `python3 scripts/align_subtitles.py --audio assets/vo/<city>/voiceover-raw.wav --edits assets/vo/<city>/edits.json --final-audio assets/vo/<city>/voiceover-clean.wav --script assets/vo/<city>/script.txt --spans assets/vo/<city>/line_spans.json --out src/data/subtitles-<city>.json`
4. Add the city to `VARIANTS` in `src/variant.ts` and a `render:<city>` script in `package.json`.

## Edit structure (Safi timings; Youssoufia is ~1 s longer)

| Time | Scene | Voice-over | Visual |
|---|---|---|---|
| 0.0 | **hook** | كتسكن فآسفي؟ ومازال كتشرب ماء ديال الروبيني؟ | impact + shake, pin drops on "آسفي", murky tap water, glitch + red ✕ |
| 2.6 | **reveal** | Water Maroc جابت ليك GLASSE MAX | water-splash wipe, WATER MAROC logo, product slam + letter-by-letter title |
| 4.8 | **savings** | باش توفر على راسك مصاريف القراعي | water jugs pile up, money flies away → big ✕, coins rain, "وفّر فلوسك" |
| 7.4 | **family** | وتحمي عائلتك من ماء الروبيني | water bubble shields the family, murky drops bounce off |
| 9.5 | **stages** | 6 ديال المراحل ديال التصفية… الشوائب | 6 cartridges fill murky → clear, count-up, dirty drop → clean drop |
| 13.4 | **removes** | الكلور والأملاح… الجودة والطعم | chlorine / salts / impurities chips knocked out, glass clears, ✓ quality ✓ taste |
| 15.8 | **membrane** | ممبران 80 GPD من LG | spinning membrane, 0→80 GPD count-up, "LG" stamp |
| 19.3 | **pump** | بومبا HK 2 باش مايضيعش ليك الماء | pump with spinning impeller, "مايضيعش ليك الماء" badge |
| 22.4 | **quality** | ماء ذو جودة عالية | kitchen photos (if supplied) → clean-water splash shot, ★★★★★ seal |
| 25.3 | **offer** | غير بـ 1799 درهم، التوصيل فابور فآسفي | price slam + cash SFX + confetti, delivery truck, Safi pin |
| 28.5 | **cta** | صيفط لينا دابا ميساج وخلي الباقي علينا | logo, products, tapped "صيفط لينا ميساج" button, price/delivery recap |

Throughout: word-highlighted Darija subtitles, WATER MAROC logo top-left, punch-in zooms on key words,
swipe/zoom transitions with colour wipes, ducked background music.

## Assets

| What | Where | Source |
|---|---|---|
| Voice-over | `assets/vo/voiceover-raw.wav` → `voiceover-clean.wav` | supplied; cleaned with `scripts/clean_vo.py` (EQ, de-ess, compression, -16 LUFS) |
| Script + timing | `assets/vo/[<city>/]script.txt`, `line_spans.json` → `src/data/subtitles-<city>.json` | `scripts/align_subtitles.py` |
| Logo | `assets/logo.png` (+ `logo-drops.png`) | supplied logo, background removed |
| Music | `assets/music/elevenlabs-bed.wav` | ElevenLabs Music (instrumental, -14 LUFS), ducked under the voice |
| SFX | `assets/sfx/*.wav` | ElevenLabs Sound Effects (impact, whoosh, splash, riser, sparkle, pop, click, glitch, cash, message) |
| Clean-water shot | `assets/generated/splash_glass.png` | ElevenLabs image generation (Seedream) |
| Product photos | `assets/products/` | **supplied photos go here** (see below) |

## Adding / changing the product photos

1. Drop the photos in `assets/products/` (any of webp/png/jpg).
2. `python3 scripts/process_products.py inspect` → writes `assets/products/roles.json`; set each file's role:
   `trio` (3 colours side by side on white), `teal_front` / `black_front` / `white_front` (single unit on white),
   `teal_kitchen` … (kitchen photo), `teal_undersink` … (under-sink photo), or `skip`.
3. `python3 scripts/process_products.py cutout` → background removal (BiRefNet) + 2× Real-ESRGAN → `assets/products/cutout/`.
4. `python3 scripts/build_media_manifest.py` → `src/data/media.json`.
5. `npm run render`.

Anything missing falls back to a labelled placeholder (product) or motion graphics.

## Most likely tweaks

- **Price / delivery text / specs** — `src/config.ts` → `OFFER`, `SPECS`.
- **Subtitle wording or timing** — `src/data/subtitles-<city>.json` (`start`/`end` in seconds, `highlight` words).
  Scenes are cut from these times (`SCENE_STARTS` in `src/config.ts`), so nudging a phrase moves its scene.
  The voice-over was aligned from its pauses (Whisper's model host is blocked here); per-line spans are in
  `assets/vo/line_spans.json` (Safi) and `assets/vo/youssoufia/line_spans.json`.
- **Audio mix** — `src/config.ts` → `AUDIO` (voice, music bed under speech / between lines / end card, SFX).
  SFX cues (file, frame, volume) are listed in `src/Ad.tsx` → `sfxCues`.
- **Punch-ins** — `PUNCH_IN` in `src/config.ts`.
- **Colours** — `src/config.ts` → `COLORS`; background gradients in `src/components/Background.tsx`.
