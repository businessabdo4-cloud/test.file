# Sources

## Product images (`assets/products/`)

Official Apple product images **supplied by City Store** on 2026-10-01 (apple.com is blocked from
this session, so they couldn't be downloaded here). Originals are kept untouched in
`assets/products/src/`. Backgrounds were removed by `scripts/cutout_products.py`, a border
flood-fill matte on the flat studio backgrounds; rembg's model download is blocked here.

| File | Shows | Source URL |
|---|---|---|
| `src/apple_iphone18pro_lineup.png` → `iphone-18-pro_lineup.png` | iPhone 18 Pro, back, Black / Silver / Glacier / Burgundy | _supplied by City Store, add URL_ |
| `src/apple_iphone18promax_burgundy_pair.png` → `iphone-18-pro-max_burgundy_pair.png` | iPhone 18 Pro Max, Burgundy, back + front | _supplied by City Store, add URL_ |

Silver, Glacier and Black Pro Max pairs were shared in chat but not received as files. Save them as
`assets/products/src/apple_iphone18promax_<silver|glacier|black>_pair.png` and run
`python3 scripts/cutout_products.py && npm run build`; the hero then cycles through every colour.

Product categories (laptops, watches, headphones, consoles, cameras) still use the animated
brand line-icons. Drop `laptop.png`, `smartwatch.png`, `headphones.png`, `console.png` and `camera.png`
(official brand images) into `assets/products/` to morph the icons into photos.

## Specs verified on screen
Checked against apple.com via search-engine results. `www.apple.com` itself is blocked from this
session, so please re-check on the live page before publishing:

- Colours: Black, Silver, Glacier, Burgundy (new): Apple Newsroom, *Apple debuts iPhone 18 Pro and
  iPhone 18 Pro Max* (Sept 2026): https://www.apple.com/newsroom/2026/09/apple-debuts-iphone-18-pro-and-iphone-18-pro-max/
- Chip: A20 Pro (same release)
- Displays: 6.3" (Pro) / 6.9" (Pro Max), Super Retina XDR with ProMotion up to 120 Hz:
  https://www.apple.com/iphone-18-pro/ and https://www.apple.com/au/iphone-18-pro/specs/
- Camera: 48MP Fusion Main camera with variable aperture: https://www.apple.com/iphone-18-pro/

The swatch hex values in `src/config.ts` are visual approximations, not official Apple values.

## Other assets
- Logo: `assets/logo.png`, supplied by City Store (from the chat attachment).
- Font: Montserrat (SIL OFL), fetched from Google Fonts via the `@remotion/google-fonts`
  manifest: `scripts/fetch_fonts.mjs` → `public/fonts/`.
- Lip sync: Rhubarb Lip Sync 1.13.0 (MIT). github.com is blocked here, so the official Linux
  build was taken from the npm mirror package `rhubarb-lip-sync@0.0.1-alfa-3`
  (binary sha256 `03e82c9c76c4e691a058f38a9cf7e75331e2f3c31a9c1fab90c00944b3ef7dc2`).
  Install it with `scripts/setup_rhubarb.sh`.
- Voice-over: supplied by City Store (single take `assets/vo/vo_full_take.wav`, split into
  `line_01..06.wav` by `scripts/split_vo.py`).
- Mascot (Citybot), icons: original, created for this project.
- Music: original track synthesised in code by `scripts/make_music.py` (120 BPM, royalty-free).
  To use a licensed track instead, drop it in `assets/music/`, set `MUSIC.bpm` in `src/config.ts`
  and `BPM` in `scripts/build_timeline.py`, then run `npm run audio`.
- SFX: original, synthesised by `scripts/make_sfx.py`.
