# iPhone 18 Pro (Burgundy) / iPhone 17 Pro (Silver, Orange) reel: sources

**Length: 38 s.** The supplied VO is 38.7 s; fitting 30 s would have needed 1.14-1.18x (over the 1.1x limit). The
user approved going over 30 s for this reel ("just use this VO, even if it surpasses the 30s rule"), so the VO is
kept at natural speed (1.0x, pauses tightened only). `reels/iphones/reel.json` sets `maxSeconds: 60`.

## Product visuals
Images **supplied by City Store** on 2026-10-09 (source URLs: _add_), originals in `assets/iphones/products/src/`,
cut out by `reels/iphones/cutout.py` (background read from each corner):

| Original | Output |
|---|---|
| `iphone18pro_burgundy_pair.png` (700×700, #F5F5F7) | `p18_burgundy.png` |
| `iphone18pro_burgundy_front.png` (700×700, #F5F5F7) | `p18_front.png` |
| `iphone17pro_orange_pair.webp` (700×700, white) | `p17_orange.png` |
| `iphone17pro_silver_pair.png` (447×447, white) | `p17_silver.png` (low resolution, used ≤ 360 px wide) |

The Apple logo appears only as part of the official product photos; no Apple logo or Apple ad styling is used
elsewhere in the reel.

## Specs on screen
- **iPhone 18 Pro**: A20 Pro chip, 6.3-inch ProMotion (up to 120 Hz), three 48 MP cameras, Burgundy finish, 256 GB
  option: https://www.apple.com/iphone-18-pro/ · https://www.techrepublic.com/article/news-iphone-18-pro-cheat-sheet-2026/ ·
  https://www.notebookcheck.net/Apple-iPhone-18-Pro-Reviews-and-Specs.1399363.0.html ·
  https://www.bestbuy.com/product/apple-iphone-18-pro-256gb-burgundy-verizon/JCQ6HRFQRC
- **Physical SIM**: iPhone 18 Pro is eSIM-only in 12 countries (US, Canada, Japan, Gulf states, Mexico…); models
  sold elsewhere keep a nano-SIM tray, so the "bjouj b la carte SIM" claim depends on the units City Store
  sources being non-eSIM-only regional models: https://www.macrumors.com/2026/09/09/iphone-18-pro-esim-only-countries/
- **iPhone 17 Pro**: A19 Pro chip, three 48 MP Fusion cameras, **8x optical-quality zoom** (12 MP crop of the
  telephoto; shown as "qualité optique (jusqu'à)"), 6.3-inch, Silver / Cosmic Orange, 256 GB base:
  https://www.apple.com/za/iphone-17-pro/specs/ ·
  https://www.tomsguide.com/phones/iphones/iphone-17-pro-and-iphone-17-pro-max-revealed-heres-what-the-rumors-got-right
- "Le dernier iPhone sorti" / "la plus puissante chez Apple" restate the VO's own claims (A20 Pro is Apple's
  newest Pro chip at publication).

## Voice-over / audio
- Single take supplied by City Store (`assets/iphones/vo/vo_full_take.wav`, **38.69 s**), Darija written in Latin
  script (subtitles keep it as written). Pauses ≤ 0.14 s, sentence breaks 0.24 s → 35.6 s, ends at 35.6 s.
- The script had no "City Store… الأصلي ديما!" line; the end card shows the slogan as text only.
- Music: original F#-minor pulse, 38 s (`make_music.py`, style `iphones`), drop at 4.5 s; final hit at 37.0 s.
