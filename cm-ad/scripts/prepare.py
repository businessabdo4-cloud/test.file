"""Step 1: transcript + beats + caption groups + sync events + SRT for the community-management ad.

Text: Whisper large-v3-turbo (sherpa-onnx, language=fr), corrected to the approved script.
Timing: French Zipformer token times (≈0.3 s emission lag) pinned to energy dips / pauses and verified by
re-transcribing cropped windows (scripts/transcribe.py <models> t0:t1 …).

Writes: transcript.json, src/data/timeline.json, out/captions.srt
"""
import json, os

NB = " "                 # non-breaking space (fonts ship U+00A0, not U+202F)
FPS = 30
TRIM_START = 0.20             # speech starts at 0.27 s
SPEECH_END = 24.11
TAIL_KEEP = 0.16
VIDEO_TAIL = 0.46

# (display word, start, end) in SOURCE seconds. Corrections vs raw Whisper:
#   "Eroya Media" -> "ROIA MEDIA", "voit" -> "voie", "Designer" -> "Designers", "réponse" -> "réponses",
#   "intérieurs ?" -> "intérieurs.", "CM" -> "« CM »", final "." -> "!"
WORDS = [
    ("Arrêtez", 0.27, 0.72), ("de", 0.72, 0.83), ("poster", 0.83, 1.18), ("vos", 1.18, 1.30), ("projets", 1.30, 1.62),
    ("sur", 1.62, 1.74), ("les", 1.74, 1.86), ("réseaux", 1.86, 2.20), ("sociaux…", 2.20, 2.49),
    ("si", 2.69, 2.84), ("c’est", 2.84, 3.01), ("pour", 3.01, 3.17), ("que", 3.17, 3.30), ("personne", 3.30, 3.62),
    ("ne", 3.62, 3.75), ("les", 3.75, 3.88), ("voie.", 3.88, 4.12),
    ("Designers", 4.92, 5.58), ("d’intérieur,", 5.58, 6.04), ("vos", 6.35, 6.55), ("futurs", 6.55, 6.87),
    ("clients", 6.87, 7.23), ("vous", 7.23, 7.40), ("cherchent", 7.40, 7.72), ("en", 7.72, 7.82), ("ligne", 7.82, 8.02),
    ("avant", 8.09, 8.38), ("même", 8.38, 8.58), ("de", 8.58, 8.70), ("vous", 8.70, 8.90), ("appeler.", 8.90, 9.20),
    ("Chez", 9.87, 10.05), ("ROIA", 10.05, 10.40), ("MEDIA,", 10.40, 10.85), ("on", 10.95, 11.10), ("gère", 11.10, 11.34),
    ("vos", 11.34, 11.50), ("réseaux", 11.50, 11.80), ("sociaux", 11.80, 12.05), ("de", 12.05, 12.30), ("A", 12.30, 12.58),
    ("à", 12.58, 12.78), (f"Z{NB}:", 12.78, 13.15),
    ("stratégie,", 13.46, 14.23), ("création", 14.28, 14.74), ("de", 14.74, 14.89), ("contenu,", 14.89, 15.15),
    ("publication,", 15.37, 16.10), ("et", 16.12, 16.30), ("réponses", 16.30, 16.66), ("à", 16.66, 16.78),
    ("votre", 16.78, 17.05), ("communauté.", 17.05, 17.47),
    ("Vous", 18.27, 18.42), ("créez", 18.42, 18.62), ("de", 18.62, 18.74), ("beaux", 18.74, 19.02), ("intérieurs.", 19.04, 19.58),
    ("Nous,", 19.93, 20.24), ("on", 20.28, 20.40), ("les", 20.40, 20.55), ("fait", 20.55, 20.74), ("voir.", 20.74, 21.11),
    ("Envoyez-nous", 21.67, 22.27), (f"«{NB}CM{NB}»", 22.30, 22.85), ("en", 22.85, 23.00), ("message", 23.00, 23.62),
    ("pour", 23.65, 23.82), ("en", 23.82, 23.90), (f"parler{NB}!", 23.90, 24.11),
]
BEATS = [  # (first word, last word, line)
    (0, 16, "Arrêtez de poster vos projets sur les réseaux sociaux… si c’est pour que personne ne les voie."),
    (17, 30, "Designers d’intérieur, vos futurs clients vous cherchent en ligne avant même de vous appeler."),
    (31, 52, f"Chez ROIA MEDIA, on gère vos réseaux sociaux de A à Z{NB}: stratégie, création de contenu, publication, et réponses à votre communauté."),
    (53, 62, "Vous créez de beaux intérieurs. Nous, on les fait voir."),
    (63, 69, f"Envoyez-nous «{NB}CM{NB}» en message pour en parler{NB}!"),
]
GROUPS = [(0, 2), (2, 5), (5, 9), (9, 13), (13, 17), (17, 19), (19, 22), (22, 26), (26, 28), (28, 31),
          (31, 34), (34, 37), (37, 39), (39, 43), (43, 44), (44, 47), (47, 48), (48, 50), (50, 53),
          (53, 55), (55, 58), (58, 60), (60, 63), (63, 64), (64, 65), (65, 67), (67, 70)]

def out_t(t): return round(t - TRIM_START, 3)

voice_dur = round(SPEECH_END + TAIL_KEEP - TRIM_START, 3)
video_dur = voice_dur + VIDEO_TAIL
frames = int(round(video_dur * FPS))

words = [{"text": w, "start": out_t(s), "end": out_t(e)} for w, s, e in WORDS]
beats = [{"beat": i + 1, "start": words[a]["start"], "end": words[b]["end"], "text": txt} for i, (a, b, txt) in enumerate(BEATS)]
groups = []
for gi, (a, b) in enumerate(GROUPS):
    nxt = words[GROUPS[gi + 1][0]]["start"] if gi + 1 < len(GROUPS) else video_dur
    groups.append({"words": list(range(a, b)), "start": words[a]["start"], "end": round(min(nxt, words[b - 1]["end"] + 0.35), 3)})

S = lambda i: words[i]["start"]
E = lambda i: words[i]["end"]
pause = lambda b: [round(beats[b]["end"] + 0.01, 3), beats[b + 1]["start"]]
ev = {
    "t1": pause(0), "t2": pause(1), "t3": pause(2), "t4": pause(3),   # transition windows = pauses between beats
    "impact": 0.22,                                   # « ARRÊTEZ » slams in
    "freeze": E(8),                                   # feed freezes on the beat after « sociaux… »
    "personne": round(S(13) + 0.03, 3),               # hit on « personne »
    "zeroView": S(16),                                # eye-slash + « 0 vue » on « voie »
    "searchType": [S(22), E(25)],                     # search query types while « vous cherchent en ligne »
    "results": round(E(25) + 0.02, 3),
    "call": S(29),                                    # call button pulses on « vous appeler »
    "logo": S(32),                                    # ROIA MEDIA logo reveal
    "aToZ": [S(40), S(42)],                           # A→Z track draws from « A » to « Z »
    "tiles": [S(43), S(44), S(47), S(49)],            # stratégie / création / publication / réponses
    "punch": S(62),                                   # « voir »: the post comes alive
    "typing": [round(S(64) + i * 0.13, 3) for i in range(2)],  # C, M
    "send": round(E(64) + 0.03, 3),
}
ev["bigCM"] = round(ev["send"] + 0.75, 3)
ev["musicStart"] = ev["impact"]

os.makedirs("src/data", exist_ok=True); os.makedirs("out", exist_ok=True)
json.dump({"fps": FPS, "durationInFrames": frames, "videoDuration": round(video_dur, 3), "voiceDuration": voice_dur,
           "trimStart": TRIM_START, "words": words, "beats": beats, "groups": groups, "events": ev},
          open("src/data/timeline.json", "w"), ensure_ascii=False, indent=1)
json.dump({"language": "fr", "source": "voiceover.wav", "timebase": "source audio seconds",
           "asr": "whisper-turbo (sherpa-onnx) text + zipformer-fr timestamps, pinned to energy dips, crop-verified",
           "corrections": ["Eroya Media -> ROIA MEDIA", "voit -> voie", "Designer -> Designers", "réponse -> réponses",
                           "intérieurs ? -> intérieurs.", "CM -> « CM »", ". -> !"],
           "text": " ".join(b[2] for b in BEATS),
           "words": [{"word": w, "start": s, "end": e} for w, s, e in WORDS]},
          open("transcript.json", "w"), ensure_ascii=False, indent=1)

def srt_t(x):
    ms = int(round(x * 1000)); return f"{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}"
with open("out/captions.srt", "w", encoding="utf-8") as f:
    for i, g in enumerate(groups, 1):
        f.write(f"{i}\n{srt_t(g['start'])} --> {srt_t(g['end'])}\n{' '.join(words[k]['text'] for k in g['words'])}\n\n")

print(f"voice {voice_dur:.2f}s  video {video_dur:.2f}s  ({frames} frames @ {FPS})")
for b in beats:
    print(f"{b['beat']:<3}{b['start']:>7.2f}{b['end']:>7.2f}  {b['text']}")
