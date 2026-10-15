# AirPods 5 reel: sources

**Length: 40 s.** The supplied VO (v2, corrected take of 2026-10-10 15:09) is 40.7 s; fitting 30 s would have needed ~1.15x (over the 1.1x limit). The user
approved going over 30 s ("just use this VO, even if it surpasses the 30s rule"), so the VO is kept at natural speed
(pauses tightened only). `reels/airpods/reel.json` sets `maxSeconds: 60`.

## Product visuals
**v2 (2026-10-10):** City Store supplied higher-quality images, already transparent (RGBA), originals in
`assets/airpods/products/src/`; `reels/airpods/cutout.py` only crops them to their alpha (no upscaling/keying):

| Original | Output |
|---|---|
| `hq_airpods5_open_case.webp` (1000×1000) | `open_case.png` |
| `hq_airpods5_buds.webp` (2000×2000) | `buds.png` |
| `hq_airpods5_case_with_buds.png` (1500×1125) | `case.png` |
| `hq_stem_controls_diagram_NOT_USED.png` (198×292) | not used (tiny control diagram with touch-zone overlays) |

The first, low-resolution set (`airpods5_open_case.png`, `airpods5_box_contents.png`, which had been upscaled and
keyed) is kept in `src/` for reference but no longer used. Also **not used**: `rumor_graphic_NOT_USED.png`
(pre-launch rumour graphic) and `lesnumeriques_review_photo_NOT_USED.webp` (third-party photo with watermark).

The Apple logo is not shown anywhere in the reel; the charging pad is a generic drawing.

## Specs on screen (AirPods 5, announced by Apple on 2026-09-09)
- ANC removes **up to 50 % more noise than AirPods 4 with ANC** ("jusqu'à", "vs AirPods 4 (ANC)" on screen).
- **Live Translation** with Apple Intelligence: *select languages and regions only* → footnote "* Avec Apple
  Intelligence sur iPhone compatible, langues prises en charge uniquement." The hook shows German/Spanish → French
  (supported); Arabic/Darija is not on the supported lists found, so it is not shown.
- Conversation Awareness (lowers playback/switches toward hearing the person when you talk), hands-free Siri,
  Personalised Spatial Audio, **IP57** sweat/dust/water resistance, **wireless charging case** variant (Qi / Apple Watch
  charger): https://www.apple.com/newsroom/2026/09/apple-introduces-airpods-5-with-best-in-class-open-ear-active-noise-cancellation/ ·
  https://support.apple.com/en-us/148759 · https://www.macrumors.com/2026/09/09/airpods-5-announced-improved-anc/ ·
  https://9to5mac.com/2026/09/09/apple-unveils-airpods-5-with-upgraded-noise-cancellation-more/ ·
  https://www.igeeksblog.com/airpods-5-features/ · https://ee.co.uk/products/apple-airpods-5

## Voice-over / audio
- Single take v2 (`assets/airpods/vo/vo_full_take.wav`, **40.69 s**, replaces the first take kept as
  `vo_full_take_v1_replaced.wav`); same script assumed. Pauses ≤ 0.14 s, sentence breaks 0.24 s → VO 36.6 s,
  ends at 36.7 s; end card 36.75–40 s, final frame held from 39.0 s.
- Music: original E-major groove, 40 s (`make_music.py`, style `airpods`), drop when the AirPods land (2.5 s).
