# ROIA MEDIA — community-management ad for interior designers (Remotion)

9:16 / 1080×1920 / 30 fps French video ad (24.5 s) built on the supplied voiceover:
*« Arrêtez de poster vos projets sur les réseaux sociaux… si c’est pour que personne ne les voie. … Envoyez-nous « CM » en message pour en parler ! »*

Deliverables: `out/final.mp4`, `out/captions.srt`, `transcript.json` (corrected words, source-audio timestamps).

## Pipeline

```bash
npm install
python3 scripts/prepare.py       # words -> beats, caption groups, sync events (src/data/timeline.json), out/captions.srt
python3 scripts/audio.py         # clean voice (-14 LUFS), synthesized SFX + quiet background song (ducked) -> work/mix.wav
npm run render                   # Remotion -> work/video.mp4
sh scripts/finalize.sh           # mux AAC 192 kbps -> out/final.mp4 and print checks
```

`scripts/transcribe.py <models_dir> [t0:t1 …]` is the ASR step behind the word timings (Whisper large-v3-turbo text
+ French Zipformer token times via sherpa-onnx; crop windows re-transcribed to verify boundaries).

## Beats

| # | Line | Visual |
|---|---|---|
| 1 | Arrêtez de poster vos projets sur les réseaux sociaux… si c’est pour que personne ne les voie. | « ARRÊTEZ » slams inside the logo stripes over a fast feed of interiors; the feed freezes and greys on the beat (tape-stop, music cuts), « PERSONNE » hit, eye-slash « 0 vue » |
| 2 | Designers d’intérieur, vos futurs clients vous cherchent en ligne avant même de vous appeler. | A future client types « designer d’intérieur casablanca », results pop, the call button rings |
| 3 | Chez ROIA MEDIA, on gère vos réseaux sociaux de A à Z : stratégie, création de contenu, publication, et réponses à votre communauté. | Logo wipe, A→Z stripe track, four service tiles popping on each word |
| 4 | Vous créez de beaux intérieurs. Nous, on les fait voir. | A grey « 0 vue » post comes alive on « voir »: colour, open eye, hearts, notifications |
| 5 | Envoyez-nous « CM » en message pour en parler ! | CM typed and sent in a chat, logo end card with « CM » |

Transitions: arch wipe (1→2), horizontal slide (2→3, 3→4), zoom-through (4→5).
Brand: navy `#001638`, yellow `#E4C037`, white `#F4FBFD`, royal `#0B3AA8`; logo `public/brand/roia-media-logo.png`.
Fonts (SIL OFL): Playfair Display, Manrope.
