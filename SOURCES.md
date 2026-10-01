# Sources

## Product images (`assets/products/`)

**No product images have been downloaded yet.** This session's network policy blocks
every image source the brief allows. The connection was refused (`403` on CONNECT) for:

- `www.apple.com` (Newsroom + product pages), `images.apple.com`, `nr.apple.com`,
  `store.storeimages.cdn-apple.com`
- brand sites tried: `www.samsung.com`, `news.samsung.com`, `www.sony.com`

Per the brief, no substitute images (Google Images, fan renders, leaks) were used.
Until official images are added, the reel uses the animated brand line-icons for the
ecosystem categories and a labelled placeholder slot for the iPhones.

### To fill them in
Either allow these hosts in the environment's network settings, or download them yourself and drop them
into `assets/products/` with these names (transparent PNG preferred; backgrounds are removed
with `rembg` otherwise):

| File | Source to use |
|---|---|
| `iphone-18-pro_<colour>_front.png` / `_back.png` | Apple Newsroom: "Apple debuts iPhone 18 Pro and iPhone 18 Pro Max" (Download images) |
| `iphone-18-pro-max_<colour>_front.png` / `_back.png` | same release |
| `<colour>` = `black`, `silver`, `glacier`, `burgundy` | |
| `laptop.png`, `smartwatch.png`, `headphones.png`, `console.png`, `camera.png` | each brand's own newsroom/site |

Then add each URL to the table below.

| Image | URL |
|---|---|
| _(none yet)_ | |

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
- Mascot (Citybot), icons, SFX: original, created for this project.
- Music: none supplied. `assets/music/` is empty (placeholder slot).
