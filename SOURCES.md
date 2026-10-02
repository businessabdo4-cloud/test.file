# Sources

Every asset used in the City Store "واش أوريجينال؟" ad, and where it came from.

## Product images — **pending**
Official images could not be downloaded yet: this environment's network policy blocks `www.apple.com`.
The renders show clearly labelled placeholders ("OFFICIAL IMAGE PENDING") and a red PREVIEW badge until
all 16 images are in place (`tools/prepare_products.py`).

| Product | Intended source (official only) | Status |
|---|---|---|
| iPhone 18 Pro / 18 Pro Max — Black, Silver, Glacier, Burgundy, front + back | Apple Newsroom launch release: https://www.apple.com/newsroom/2026/09/apple-debuts-iphone-18-pro-and-iphone-18-pro-max/ (regional copies seen: [IN](https://www.apple.com/in/newsroom/2026/09/apple-debuts-iphone-18-pro-and-iphone-18-pro-max/), [AE](https://www.apple.com/ae/newsroom/2026/09/apple-debuts-iphone-18-pro-and-iphone-18-pro-max/), [PH](https://www.apple.com/ph/newsroom/2026/09/apple-debuts-iphone-18-pro-and-iphone-18-pro-max/)), then https://www.apple.com/iphone-18-pro/ | not downloaded (egress blocked) |
| Laptops, smartwatches, headphones, consoles | City Store's own line icons, keyed from `assets/logo.png` (`tools/extract_logo.py`) | in use |

### On-screen product facts
- **Colour names** — Black, Silver, Glacier, Burgundy for both iPhone 18 Pro and 18 Pro Max. Confirmed from
  web search results restricted to apple.com (Oct 2, 2026): Apple's wording "four elegant finishes: black, silver,
  glacier, and an all-new burgundy"; results included [Tech Specs](https://www.apple.com/iphone-18-pro/specs/),
  [Apple Support tech specs](https://support.apple.com/en-us/148591) and an Apple Store page for "256gb-burgundy".
  The pages themselves could not be opened from this environment. Swatch hex values are approximations until
  they are sampled from the official images.
- No specs, prices, warranty or delivery claims appear on screen.

## Brand
- `assets/logo.png` — supplied by City Store. Colours sampled into `assets/brand.json`.
- Instagram / Facebook glyphs — simplified SVGs drawn in `video/src/components/Props.tsx`, used only to point to
  City Store's accounts (Instagram @citystore.ma, Facebook page id 61581215721905).

## Audio
- Voice-over — supplied by City Store (`assets/vo/voiceover.wav`). Only trimming, gain/limiting and a light robot
  effect on Citybot's lines were applied (`tools/process_vo.py`).
- SFX — synthesized for this project from scratch (`tools/make_sfx.py`); no third-party samples.
- Music — none yet (`assets/music/PLACEHOLDER.txt`).

## Fonts (SIL Open Font License)
- Cairo and Montserrat from Google Fonts — the same variable `woff2` files `@remotion/google-fonts` serves,
  stored in `assets/fonts/` so renders don't depend on fonts.gstatic.com.

## Tools and models (timing / lip-sync only — never used for on-screen text)
- Whisper large-v3, int8 ONNX export by k2-fsa/sherpa-onnx (GitHub release `asr-models`) — line identification.
- Meta Omnilingual ASR 1B CTC, sherpa-onnx export (GitHub release `asr-models`) — word timestamps.
- WeSpeaker ResNet34 (sherpa-onnx `speaker-recongition-models` release) — speaker-similarity check.
- Rhubarb Lip Sync 1.14.0 (GitHub release), phonetic recognizer — mouth shapes.
- rembg (`isnet-general-use`) — background removal for product images.
