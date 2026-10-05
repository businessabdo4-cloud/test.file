# Apple Watch Ultra 4 reel: sources

## Product image
- `assets/watch/products/src/apple_watch_ultra4_black_burgundy_trail_loop.webp`: official Apple image
  supplied by City Store on 2026-10-05 (source URL: _add_). Cut out by `reels/watch/cutout.py`
  (flat-background matte, background inside the strap loop removed, the edges where the photo
  crops the strap feathered).

## Specs on screen (checked against apple.com via search results; apple.com is blocked from this session)
- 49 mm, Grade 5 titanium case in natural and **black**, **flat sapphire crystal**, up to **50 h**
  battery (84 h in Low Power Mode): Apple Newsroom, *Apple unveils Apple Watch Ultra 4* (Sept 2026),
  https://www.apple.com/newsroom/2026/09/apple-unveils-apple-watch-ultra-4/
- **Burgundy Trail Loop**, precision **dual-frequency GPS**: https://www.apple.com/apple-watch-ultra-4/
  and https://www.apple.com/apple-watch-ultra-4/specs/
- **Emergency SOS via satellite**: exists on Ultra 3 and later, but only in Andorra, Australia,
  Austria, Belgium, Canada, France, Germany, Iceland, Ireland, Italy, Japan, Luxembourg, Mexico,
  Netherlands, New Zealand, Norway, Portugal, Spain, Switzerland, UK and US. **Morocco is not
  listed**: https://support.apple.com/en-us/108374. The VO line is kept as recorded; the on-screen
  callout carries a footnote saying it isn't available in Morocco.

## Voice-over
- Single take supplied by City Store (`assets/watch/vo/vo_full_take.wav`, 30.73 s), processed by
  `scripts/process_vo_take.py` (pauses tightened, uniform 1.022x stretch with pitch kept, ends at 28.9 s).
- Subtitle French corrected from the script's spelling: "boite fermer / jamais activer" →
  "boîte fermée / jamais activé". Darija kept as written.

## Music / SFX / fonts
- Music: original F-minor variation of the reel bed, synthesised by `scripts/make_music.py` (REEL=watch).
- SFX: shared original library (`scripts/make_sfx.py`).
- Arabic glyphs: Cairo (SIL OFL) via the `@remotion/google-fonts` manifest (`scripts/fetch_fonts.mjs`).
