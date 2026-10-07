# Sony WH-1000XM6 / WH-1000XM5 reel: sources

## Product visuals
Official WH-1000XM6 images **supplied by City Store** on 2026-10-07 (source URLs: _add_), originals in
`assets/sony/products/src/`, cut out by `reels/sony/cutout.py`:

| Original | Cut-out | Notes |
|---|---|---|
| `sony_wh1000xm6_black.png` (360 px) | `xm6_black.png` | low resolution: looks slightly soft when large |
| `sony_wh1000xm6_midnight_blue.png` (800 px) | `xm6_blue.png` | |

**WH-1000XM5 (Black):** shared in chat but not received as a file. Until it is, the XM5 scene uses the
flat-vector illustration (`src/components/HeadphoneArt.tsx`, no logos). Save it as
`assets/sony/products/src/sony_wh1000xm5_black.png`, then run `python3 reels/sony/cutout.py` and
`npm run sony:render` + `REEL=sony bash scripts/finalize.sh`.

## Specs on screen (checked via reviews/retailers + Sony's press release; sony.com itself is blocked)
- XM6: up to **30 h with noise cancelling on**, **3 min charge = 3 h** playback, **foldable** with a
  carrying case, colours **Black / Midnight Blue** / Platinum Silver:
  https://www.phonearena.com/reviews/sony-wh-1000xm6-review_id7560 ·
  https://www.bhphotovideo.com/c/product/1894980-REG/sony_wh1000xm6_b_wh_1000xm6_noise_canceling_wireless_over_ear.html
- XM6 noise cancelling: **HD Noise Cancelling Processor QN3**, **12 microphones**, Adaptive NC
  Optimizer, Sony's most advanced ANC: https://www.sony.eu/presscentre/sony-introduces-the-next-evolution-of-noise-cancelling-with-the-wh-1000xm6
- XM5 (Black) is mentioned by the VO only as a lower-priced alternative; no XM5-specific spec on screen.

## Voice-over / audio
- Single take supplied by City Store (`assets/sony/vo/vo_full_take.wav`, **34.61 s**). To fit 30 s it
  needed inner pauses cut to ≤ 0.09 s (sentence breaks 0.15 s) **and a 1.081x stretch** (pitch kept),
  inside the 1.1x limit; VO ends at 28.9 s.
- Subtitles: the French line uses Latin commas (the script had Arabic "،").
- Music: original E-minor variation, silent during the "noise" hook (`hook_mode: noise`), drop on the
  XM6 reveal at 3.5 s. City-noise SFX (horn / crowd / bus / ANC sweep) synthesised in `scripts/make_sfx.py`.
