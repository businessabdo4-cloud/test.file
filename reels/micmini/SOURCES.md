# DJI Mic Mini 2 reel: sources

## Product visuals
Images **supplied by City Store** on 2026-10-09 (source URLs: _add_), originals in `assets/micmini/products/src/`,
processed by `reels/micmini/cutout.py`:

| Original | Output | Processing |
|---|---|---|
| `micmini2_case_hero.png` (447×447, white, **low resolution**) | `case_hero.png` | **enhanced**: 2x Lanczos upscale + unsharp mask + slight contrast, then cut out (no AI upscaler is available offline) |
| `micmini2_kit_flatlay.png` (1000×1000, white) | `kit.jpg` | cropped photo card, light sharpening |
| `micmini2_dark_studio.png` (1000×1000, dark studio) | `studio.jpg` | cropped photo card, light sharpening |
| `micmini2_marketing_collage.webp` (DJI marketing collage) | `osmo_direct.jpg` | only the left photo (transmitter clipped on a sweater + Osmo Pocket) is used, cropped **below** its English text label |

## Specs on screen
- Transmitter **≈ 11 g** (without clip/magnet), **48 kHz / 24-bit**, two-level **noise cancelling**, battery
  **up to 11.5 h** per transmitter (measured with noise cancelling off) and **up to 48 h** with the charging case:
  https://www.fonearena.com/blog/481254/dji-mic-mini-2-price-features.html ·
  https://www.notebookcheck.net/DJI-Mic-Mini-2-vs-Mic-Mini-All-the-differences-Mobile-Version-Vocal-Tone-Presets-faster-charging-colors.1280509.0.html ·
  https://www.techradar.com/cameras/camera-accessories/dji-mic-mini-2-review
- **OsmoAudio direct connection** (no receiver) to select DJI cameras incl. Osmo Pocket 3 and Osmo Action 5 Pro
  (documented for the Mic Mini family; the supplied DJI image itself advertises "OsmoAudio Direct Connection"):
  https://store.dji.com/product/dji-mic-mini-2-tx-1-rx
- Phone connection: via the USB-C receiver (and Bluetooth direct, third-party apps only).

## Voice-over / audio
- Single take supplied by City Store (`assets/micmini/vo/vo_full_take.wav`, **33.81 s**) + script. Pauses ≤ 0.10 s
  (sentence breaks 0.16 s) then a **1.021x stretch** (pitch kept) → VO ends at 28.9 s; standard 30 s reel.
- Hook: street/crowd noise SFX with no music; the music drops when the mic appears (1.5 s).
- The script had no "City Store… الأصلي ديما!" line; the end card shows the slogan as text only.
