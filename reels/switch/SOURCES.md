# Nintendo Switch OLED reel: sources

## Product visuals
Images **supplied by City Store** on 2026-10-08 (source URLs: _add_), originals in `assets/switch/products/src/`,
cut out by `reels/switch/cutout.py`:

| Original | Output | Notes |
|---|---|---|
| `switch_oled_neon_dock.png` (447×447, white) | `neon_dock.png` | black console + dock, Neon Blue/Neon Red Joy-Con; low resolution, used ≤ 520 px wide; floor shadow removed |
| `switch_oled_white_dock.webp` (2000×1305, white) | `white_dock.png` | white model in its dock; floor shadow removed |
| `switch_oled_white_handheld.png` (1240×698, white) | `white_handheld.png` | white model, handheld; tight key so the white Joy-Con edges survive |
| `switch_oled_neon_tabletop.png` (600×315, transparent border + white box) | `neon_tabletop.png` | flattened onto white, then keyed |

"Noir" in the VO is shown on screen as **"Noir · Joy-Con néon"**: Nintendo's black-console OLED set ships with
Neon Blue / Neon Red Joy-Con (as in the supplied images).

## Specs on screen
7-inch OLED screen, 64 GB internal storage, wide adjustable stand, enhanced audio vs the standard Switch, TV /
tabletop / handheld modes, two Joy-Con included; colours White and Neon Red/Neon Blue:
https://bulbapedia.bulbagarden.net/wiki/Nintendo_Switch_(OLED_model) ·
https://nintendoeverything.com/switch-oled-list-of-specs/ ·
https://mp1st.com/news/nintendo-switch-oled-tech-specs-revealed ·
https://videogameschronicle.com/news/nintendo-switch-pro-is-officially-announced-as-oled-model

## Voice-over / audio
- Single take supplied by City Store (`assets/switch/vo/vo_full_take.wav`, **35.45 s**) + script. Pauses tightened
  (≤ 0.09 s, sentence breaks 0.12 s), breaths below -34 dB trimmed, then a **1.065x stretch** (pitch kept) → VO
  ends at 28.9 s; 30 s reel, final frame held 29–30 s.
- Subtitles keep the VO's wording ("ف noir et blanche").
- The script had no "City Store… الأصلي ديما!" line; the end card shows the slogan as text only.
- Music: original C-major bounce (`make_music.py`, style `switch`), drop on the reveal at 2.0 s.
