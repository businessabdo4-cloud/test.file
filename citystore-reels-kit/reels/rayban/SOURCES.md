# Ray-Ban Meta Headliner Gen 2 / Wayfarer Gen 2 reel: sources

## Product visuals
Official product images **supplied by City Store** on 2026-10-07 (source URLs: _add_), originals in
`assets/rayban/products/src/`, cut out by `reels/rayban/cutout.py`:

| Original | Cut-out | Notes |
|---|---|---|
| `headliner_gen2_front.png` (700×376, grey background) | `headliner_front.png` | Headliner Gen 2, Shiny Black, front view; floor reflection keyed out by brightness (small lens prints kept); low resolution, so it is only used at ≤ 1.7x |
| `headliner_gen2_angle.webp` (2000×2000, transparent) | `headliner_angle.png` | alpha kept as supplied, cropped |
| `wayfarer_gen2_front.png` (700×376, grey background) | `wayfarer_front.png` | Wayfarer Gen 2, Matte Black, front view; same clean-up as above |
| `wayfarer_gen2_angle.webp` (1936×1046, transparent) | `wayfarer_angle.png` | alpha kept; the soft white under-glow was keyed out |

Citybot's sunglasses are a generic drawn frame (no Ray-Ban or Meta logo).

## Specs on screen (checked via reviews; meta.com / ray-ban.com not reachable from the build machine)
- **12 MP** ultra-wide camera, **3K video** (3K Ultra HD at 30 fps; 3K must be enabled in settings),
  **up to 8 h** typical use, **charging case + up to 48 h**, **2 open-ear speakers**, **5-mic array**:
  https://www.androidcentral.com/wearables/ray-ban-meta-gen-2 ·
  https://www.neowin.net/news/metas-new-ray-ban-meta-glasses-gen-2-double-the-battery-life-add-3k-video/ ·
  https://www.techradar.com/computing/virtual-reality-augmented-reality/ray-ban-meta-gen-2-ai-glasses-have-more-flair-battery-life-and-video-power-and-i-think-they-look-good-on-me
- Model names and colours (Headliner Gen 2 **Shiny Black**, Wayfarer Gen 2 **Matte Black**):
  https://www.meta.com/ai-glasses/ray-ban-meta-headliner-gen-2/ ·
  https://www.meta.com/in/ai-glasses/ray-ban-meta-wayfarer-shiny-black-green-gen-2/
- **Meta AI**: the assistant on the glasses is only available in some countries/languages, and no source
  confirms Morocco, so the reel adds the footnote "* Fonctions Meta AI selon le pays et la langue."
  (https://www.neowin.net/news/meta-ai-comes-to-ray-ban-meta-glasses-in-seven-new-countries/)

## Voice-over / audio
- Single take supplied by City Store (`assets/rayban/vo/vo_full_take.wav`, **35.13 s**), script supplied
  separately (ElevenLabs transcription was not possible: no credits). To fit 30 s it needed inner pauses
  cut to ≤ 0.09 s (sentence breaks 0.15 s) **and a 1.093x stretch** (pitch kept), inside the 1.1x limit;
  VO ends at 28.9 s. Line boundaries were placed at the take's sentence pauses (`reel.json`).
- The script had no "City Store… الأصلي ديما!" line; the end card shows the slogan as text only.
- Music: original G-major groove (`make_music.py`, style `rayban`), drop on the reveal at 3.5 s.
  SFX are the synthesised library in `scripts/make_sfx.py` (shutter on the camera beats).
