# OnePlus Watch 3 (Emerald Titanium) reel: sources

## Product visuals
Official product images **supplied by City Store** on 2026-10-08 (source URLs: _add_), originals in
`assets/oneplus/products/src/`, cut out by `reels/oneplus/cutout.py`:

| Original | Output | Notes |
|---|---|---|
| `oneplus_watch3_emerald_front.png` (800×800, white) | `front.png` | strap ends feathered top/bottom |
| `oneplus_watch3_emerald_angle.webp` (1200×1200, white) | `angle.png` | strap holes removed (`hole_min_area`) |
| `oneplus_watch3_emerald_side.png` (453×221, white) | `side.png` | low resolution, so only used small; strap tips feathered |
| `oneplus_watch3_emerald_lifestyle.webp` (1851×984, dark green studio) | `lifestyle.jpg` | kept as a photo card (not cut out) |

## Specs on screen (checked via launch coverage/reviews; oneplus.com not reachable from the build machine)
- **Sapphire** cover glass, LTPO AMOLED up to **2,200 nits**; battery **up to 5 days** in normal (smart-mode)
  use and **up to 16 days** in power-saver mode; **dual-band (L1+L5) GPS**; **Wear OS 5**; heart-rate,
  sleep and sport tracking; titanium bezel; colours **Emerald Titanium** / Obsidian Titanium:
  https://m.gsmarena.com/oneplus_watch_3_debuts_with_polished_looks_and_updated_battery_endurance-news-66599.php ·
  https://www.phonearena.com/reviews/oneplus-watch-3-review_id7015 ·
  https://www.droid-life.com/?p=307020
- The hook calendar stops at day 5 (LUN–VEN) to match the rated 5 days of normal use.

## Voice-over / audio
- Single take supplied by City Store (`assets/oneplus/vo/vo_full_take.wav`, **35.65 s**) + script.
  Fitting it into 30 s needed more than the earlier reels: pauses shortened to ≤ 0.08 s (sentence breaks
  0.10 s), breaths/room tone below **-34 dB** treated as pause (`silenceDb`), then a **1.095x stretch**
  (pitch kept), inside the 1.1x limit; VO ends at 29.0 s, where the final-frame hold starts.
  If it sounds too tight, shorten line 6 (GPS / Wear OS) or line 5 (battery).
- Subtitles: the trust line uses the singular ("jamais ouvert, jamais activé"; one product, same sound).
- The script had no "City Store… الأصلي ديما!" line; the end card shows the slogan as text only.
- Music: original B-minor pulse (`make_music.py`, style `oneplus`), drop on the reveal at 2.0 s.
