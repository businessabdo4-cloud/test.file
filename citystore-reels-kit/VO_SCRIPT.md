# City Store reel: voice-over script (FR)

Record **one file per line**, named exactly as below, and drop them into `assets/vo/`.
The pipeline (`npm run vo`) picks them up automatically, trims silences, fits each
line into its slot (max 1.1× speed-up, pitch preserved), normalises loudness and
re-runs the lip sync.

**Format:** WAV (or MP3), mono or stereo, 44.1/48 kHz. Leave about 0.3 s of silence at the
start and end. It gets trimmed.

**Tone:** native French, neutral accent, energetic, friendly and a little playful (it's a
cute robot speaking), but still clear and credible. Smile while recording.

| File | Time slot | Max spoken length | Text |
|---|---|---|---|
| `line_01.wav` | 0.0–3.0 s | **≤ 2.7 s** (tight!) | Les iPhone 18 Pro et Pro Max sont chez City Store ! |
| `line_02.wav` | 3.0–9.0 s | ≤ 5.7 s | Nouveau design, photo bluffante, performances hors normes. |
| `line_03.wav` | 9.0–15.0 s | ≤ 5.7 s | Et aussi : laptops, montres, casques, consoles et caméras. |
| `line_04.wav` | 15.0–20.0 s | ≤ 4.7 s | Tout est 100 % original ! |
| `line_05.wav` | 20.0–26.0 s | ≤ 5.7 s | Commandez sur citystore.ma ou écrivez-nous sur Instagram et Facebook. |
| `line_06.wav` | 26.0–30.0 s | ≤ 3.8 s | City Store… la tech originale. |

"Max spoken length" is from the first word to the last word. The pipeline can absorb about 10% over
(by shortening pauses, then a ≤ 1.1× speed-up). Beyond that it stops and names the line
to shorten. The video is never extended past 30 s.

## Pronunciation notes
- **citystore.ma** → say "City Store **point** M A".
- **iPhone** → "aïe-faune"; **18** → "dix-huit".
- **100 %** → "cent pour cent".
- **line_01**: say it with punch, it's the hook. The robot jumps on "chez City Store".
- **line_03**: keep a clear little beat between "laptops / montres / casques / consoles /
  caméras". Each word triggers a cut.
- **line_06**: a short breath after "City Store…", then a warm, confident "la tech originale".
