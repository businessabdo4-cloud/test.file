# DJI Osmo Pocket 4 / Osmo Pocket 3 Creator Combo reel: sources

**Length: 56 s.** The supplied VO is 60.1 s; even fully trimmed at the 1.1x limit it would be ~46 s, so the
user explicitly approved going over the usual 30 s limit and keeping the full VO ("just use this VO, even if
it surpasses the 30s rule"). `reels/osmo/reel.json` sets `maxSeconds: 60`, which `scripts/verify.sh` uses;
every other reel keeps the 30 s check.

## Product visuals
Images **supplied by City Store** on 2026-10-08 (source URLs: _add_), originals in `assets/osmo/products/src/`,
cut out by `reels/osmo/cutout.py`:

| Original | Output | Notes |
|---|---|---|
| `osmo_pocket4_front.png` (1000×1000, white) | `pocket4.png` | Osmo Pocket 4, front |
| `osmo_pocket3_creator_combo.png` (800×800, white) | `pocket3_combo.png` | Pocket 3 + DJI Mic 2 + battery handle + mini tripod |
| `osmo_pocket3_standard_box.png` (447×447, white) | `pocket3_box.png` | cut out, not used in the edit |
| `retailer_bundle_pocket3_NOT_USED.png` | (none) | **not used**: a retailer bundle (64 GB card, cleaning kit, case…) that is not the official Creator Combo content |

## Specs on screen (checked via reviews/retailers; dji.com not reachable from the build machine)
- **Pocket 4**: 1-inch CMOS, **4K up to 240 fps** (slow motion), **2x lossless zoom**, **37 MP stills in SuperPhoto
  mode** (9.4 MP otherwise, so the screen says "mode SuperPhoto"), **107 GB built-in storage**, battery **up to
  240 min** (DJI figure measured at 1080p/24 fps, so the screen says "en 1080p"), **full charge in 32 min**
  (80 % in 18 min): https://www.owc.com/blog/dji-osmo-pocket-4-4k-240fps-d-log-specs-review ·
  https://www.techradar.com/cameras/video-cameras/dji-osmo-pocket-4-review ·
  https://fstoppers.com/reviews/review-dji-osmo-pocket-4-small-size-pocketable-camera-huge-capabilities-901742 ·
  https://hwbusters.com/gadgets/dji-osmo-pocket-4-an-unnecessary-upgrade/ ·
  https://www.heliguy.com/blogs/knowledge-base/does-osmo-pocket-4-support-fast-charging/
- **Pocket 3 Creator Combo**: 1-inch CMOS, 4K up to 120 fps; combo includes **DJI Mic 2** transmitter,
  **wide-angle lens**, **battery handle**, **mini tripod**:
  https://kamerastore.com/en-ca/products/dji-osmo-pocket-3-creator-combo-t119844 ·
  https://karachicameracenter.webx.pk/dji-osmo-pocket-3-creator-combo
- 3-axis mechanical gimbal stabilisation on both.

## Voice-over / audio
- Single take supplied by City Store (`assets/osmo/vo/vo_full_take.wav`, **60.13 s**) + script. Kept at
  **natural speed (1.0x)**; only pauses tightened (≤ 0.14 s, sentence breaks 0.24 s) → 53.5 s, VO ends 53.6 s.
- Line 6 ("Stabilisation…") start was identified from the strong /s/ onset after the 46.2 s pause.
- The script had no "City Store… الأصلي ديما!" line; the end card shows the slogan as text only.
- Music: original A-major creator groove, 56 s (`make_music.py`, style `osmo`, `dur=56`), drop at 4.0 s;
  final hit at 55.0 s where the final-frame hold starts.
