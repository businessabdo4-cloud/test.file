# AirPods 5 reel: sources

**Length: 39 s.** The supplied VO is 40.9 s; fitting 30 s would have needed ~1.15x (over the 1.1x limit). The user
approved going over 30 s ("just use this VO, even if it surpasses the 30s rule"), so the VO is kept at natural speed
(pauses tightened only). `reels/airpods/reel.json` sets `maxSeconds: 60`.

## Product visuals
Images supplied by City Store on 2026-10-10 (source URLs: _add_), originals in `assets/airpods/products/src/`,
processed by `reels/airpods/cutout.py` (all **enhanced**: Lanczos upscale + unsharp mask, then cut out with a very
tight key because the product is white on white):

| Original | Output | Notes |
|---|---|---|
| `airpods5_open_case.png` (752×636) | `open_case.png` | product shot, enhanced 2x |
| `airpods5_box_contents.png` (700×700, "Contenu du coffret" slide) | `buds.png`, `case.png` | the earbuds and the case cropped out **without** the slide text, enhanced 2.5x |
| `rumor_graphic_NOT_USED.png` | (none) | **not used**: pre-launch rumour graphic ("launching next month"), not an official image |
| `lesnumeriques_review_photo_NOT_USED.webp` | (none) | **not used**: third-party review photo with the Les Numériques watermark |

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
- Single take (`assets/airpods/vo/vo_full_take.wav`, **40.89 s**) + script; pauses ≤ 0.14 s, sentence breaks 0.24 s
  → VO 36.0 s, ends at 36.1 s; end card 36.25–39 s, final frame held from 38.0 s.
- Music: original E-major groove, 39 s (`make_music.py`, style `airpods`), drop when the AirPods land (2.5 s).
