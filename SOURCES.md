# Sources

Every asset used in the City Store "واش أوريجينال؟" ad, and where it came from.

## Product images
`www.apple.com` is blocked from this environment, so product images are supplied by City Store.
Both models now have a real image, so the PREVIEW badge is off (`PRODUCTS_READY` in `video/src/components/Props.tsx`).

| Product | File(s) | Source | Status |
|---|---|---|---|
| iPhone 18 Pro — Burgundy, back + front composite | `assets/products/source/iphone-18-pro_burgundy_pair_supplied.png` (700×700, sha256 `d695a164…ae2242`) → `iphone-18-pro_burgundy_pair.png`, `iphone-18-pro_burgundy_back.png` | Supplied by City Store in chat on 2026-10-02; **original URL to be confirmed** | in use (scene 3, scene 5) |
| iPhone 18 Pro Max — Burgundy | Same files as the 18 Pro | City Store confirmed (2026-10-02) the supplied image is to be used for both models — Apple uses one shared render for 18 Pro / 18 Pro Max. Shown 1.089× the 18 Pro's height (163.4 mm vs 150.0 mm, [Apple tech specs](https://www.apple.com/iphone-18-pro/specs/)), bottoms aligned | in use (scene 3, thumbnail) |
| iPhone 18 Pro Max colour line-up (Black, Silver, Glacier, Burgundy) | — | Supplied in chat but not received as a file | pending |
| Laptops, smartwatches, headphones, consoles | City Store's own line icons, keyed from `assets/logo.png` (`tools/extract_logo.py`) | City Store logo | in use |

Processing: background keyed out (flat #F5F5F7, edge colour un-mixed); the back-only view is the unobstructed
back phone cut with a rounded-rectangle mask fitted to its silhouette (41 px corner radius). No retouching.
Intended official source for anything still missing: Apple Newsroom launch release
https://www.apple.com/newsroom/2026/09/apple-debuts-iphone-18-pro-and-iphone-18-pro-max/ and https://www.apple.com/iphone-18-pro/.

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
