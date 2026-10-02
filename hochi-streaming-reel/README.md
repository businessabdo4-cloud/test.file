# Hochi Shop: Le Pack Streaming reel

**Final video:** `hochi_pack_streaming_reel.mp4`: 1080×1920, 30 fps, 24.6 s, H.264 + AAC, −14 LUFS (ready for TikTok and Instagram Reels).
**Preview (lighter file):** `hochi_pack_streaming_preview.mp4` · **Cover:** `cover.jpg`

## Edit summary
- **Voiceover:** 13 pauses cut, sped up 1.15× with the pitch kept, plus EQ, compression and loudness normalisation (28.3 s → 23.2 s).
- **Music:** Hochi's Moroccan-trap track (`music1.mp3`, ElevenLabs Music), started so its beat drop lands on "عندنا ليك الحل" and ducked under the voice.
- **SFX:** about 70 cues (whooshes, impacts, pops, notifications, ka-ching, riser, glitch, clicks), each tied to a word so it lands on the animation.
- **Hook (0–3.4 s):** "شحال؟" behind the creator, a "3 فـ 1 • غير بـ 70 درهم 🔥" banner, then the three app icons pop in with each name while a "كل شهر" bill counter spins and turns to "??? DH" on "كل واحد بوحدو؟".
- **Story beats:**
  1. Beat drop and a green check: "عندنا الحل"
  2. "LE PACK STREAMING" title slam, the three apps and the Hochi logo reveal
  3. Spotify: music player with live equaliser, "∞ UNLIMITED"
  4. Netflix: scrolling poster wall, "أفلام" and "مسلسلات" tags
  5. Shahid: Arabic content cards (Ramadan series, Arabic films, comedy, shows)
  6. "3 ➜ 1": the three apps merge into one pack
  7. 70 DH price slam with a money rain
  8. Instant-delivery notifications, then "آمن 100%" shield
  9. All devices, "تحبس فأي وقت ✓ بلا التزام" stamp
  10. "3 اشتراكات" crossed out, "وفّر فلوسك 💰"
  11. DM call to action with @hochi_shop_ and "PACK STREAMING • 70 DH / MONTH"
- **Captions:** word-by-word karaoke Darija captions that follow the recording (for example "والمسلسلات" and "أرسل لنا ميساج").
- **App icons:** drawn in CSS/SVG as simple stand-ins, not the official logo files.

## Re-rendering
```
cd source && python3 -m http.server 8766 &
python3 build/voice.py        # vo.wav -> build/vo_cut.wav, build/vo_fast.wav, build/timing.json
node render.js video          # frames -> build/video.mp4
python3 build/mix.py          # VO + music + SFX -> build/final.mp4
```
`node render.js stills 1.2 5.9` saves single frames for checking. Scene text and layout are in `reel.html`, one block per scene, and every animation is keyed to a word in `build/timing.json`. To use a new voiceover, update the pause and word table in `build/voice.py`.
