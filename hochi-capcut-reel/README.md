# Hochi Shop: CapCut Pro reel

**Final video:** `hochi_capcut_pro_reel.mp4`: 1080×1920, 30 fps, 27 s, H.264 + AAC, −14 LUFS (ready for TikTok and Instagram Reels).
**Cover:** `cover.jpg`

## Edit summary
- **Voiceover:** pauses removed, sped up 1.15× with pitch kept the same, plus EQ, compression and loudness normalisation.
- **Music:** Moroccan-trap instrumental (ElevenLabs Music). The beat drop lands on "CapCut Pro", and the music ducks under the voice.
- **SFX:** whooshes, impacts, glass shatter, ka-ching, clicks, notifications, pops, riser and glitch (ElevenLabs SFX).
- **Hook (0–2 s):** "PRO" placed behind the creator (text-behind-subject), a "CapCut PRO غير بـ 45 درهم 🔥" banner and feature chips.
- **Story beats:**
  1. Watermarked free version
  2. The screen shatters on the drop
  3. CapCut PRO title slam, then the Hochi logo reveal
  4. Features unlock
  5. Effects / templates / AI / auto-captions demos
  6. One-click background removal
  7. Pixelated-to-4K export
  8. 45 DH price slam with a money rain
  9. Instant-delivery notifications
  10. All devices, "بلا التزام" stamp
  11. DM call to action with @hochi_shop_
- **Captions:** word-by-word karaoke Darija captions throughout.

## Re-rendering
```
cd source && python3 -m http.server 8765 &
python3 build/align.py        # vo.wav -> build/vo_cut.wav + build/timing.json
ffmpeg -i build/vo_cut.wav -af "rubberband=tempo=1.15:pitchq=quality:formant=preserved,highpass=f=80,equalizer=f=250:t=q:w=1.2:g=-3,equalizer=f=3200:t=q:w=1.5:g=3,equalizer=f=9000:t=h:w=0.7:g=2,acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=2" -ar 48000 build/vo_fast.wav
node render.js video          # frames -> build/video.mp4  (needs build/timing.json)
python3 build/mix.py          # VO + music + SFX -> build/final.mp4
```
The original voiceover is `source/vo.wav` (mono, 24 kHz, 31 s). `build/align.py` reads it, cuts the pauses using the segment times in that script, and writes `build/vo_cut.wav` and `build/timing.json`.
Text, colours and timings are all in `reel.html`, one block per scene.
