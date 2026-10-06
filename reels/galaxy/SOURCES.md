# Samsung Galaxy Watch8 Classic / Galaxy Watch Ultra2 reel: sources

## Product images (supplied by City Store on 2026-10-06; source URLs: _add_)
| Original (`assets/galaxy/products/src/`) | Cut-out | Notes |
|---|---|---|
| `samsung_galaxy_watch_ultra2_front.webp` | `ultra2_front.png` | flat white background removed |
| `samsung_galaxy_watch_ultra2_angle.png` | `ultra2_angle.png` | background also removed through the strap holes |
| `samsung_galaxy_watch8_classic_angle.png` | `classic_angle.png` | strap cropped by the photo, so top/bottom edges are feathered |
| `samsung_galaxy_watch8_classic_front.png` | `classic_front.png` | supplied already transparent; cropped only |

The rotating-bezel effect turns the bezel ring of the real `classic_front.png` (annulus r 160–218 px
around the dial centre, see `src/reels/galaxy/timeline.ts`).

## Specs on screen (checked via search results on samsung.com; the site itself is blocked from this session)
- Galaxy Watch8 Classic: signature **rotating bezel**, **46 mm**, **stainless-steel** body, first
  smartwatch with **Gemini** out of the box (Wear OS 6):
  https://www.samsung.com/us/watches/galaxy-watch8-classic/ ·
  https://news.samsung.com/global/samsung-galaxy-watch8-series-ultra-comfort-from-sleep-to-workout
- Galaxy Watch Ultra2: **titanium** case, display up to **5,000 nits**, **up to 60 h with AOD on**,
  first **fast charging** on a Galaxy Watch (**40 % in 30 min**), ocean dives down to **130 ft (~40 m)**:
  https://www.samsung.com/us/watches/galaxy-watch-ultra2/

## Voice-over / audio
- Single take supplied by City Store (`assets/galaxy/vo/vo_full_take.wav`, 30.89 s), processed by
  `scripts/process_vo_take.py` (pauses tightened, uniform 1.015x stretch with pitch kept, ends at 28.9 s).
- Music: original D-minor variation (`scripts/make_music.py`, REEL=galaxy); SFX: shared original library.
