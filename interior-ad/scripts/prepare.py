"""Step 1: transcript + beats + caption groups + SRT.

Whisper-turbo (sherpa-onnx, language=fr) supplied the text; the French streaming Zipformer supplied
token timestamps (≈0.3 s emission lag). Word boundaries were then pinned to energy dips and verified by
re-transcribing cropped windows (see scripts/transcribe.py). The corrected words and their source-audio
timestamps live in WORDS below; everything downstream is derived from them.

Writes: transcript.json, src/data/timeline.json, out/captions.srt
"""
import json, os

NB = " "                 # non-breaking space (both fonts ship U+00A0; U+202F is missing)
FPS = 30
TRIM_START = 0.18             # leading silence removed from the voiceover (speech starts at 0.24 s)
SPEECH_END = 14.76            # source time of the last phoneme
TAIL_KEEP = 0.16              # keep a short breath after the last word in the cleaned voice
VIDEO_TAIL = 0.46             # extra hold after the voice (≤ 0.5 s)

# (word as displayed, start, end) in SOURCE audio seconds. Corrections vs raw Whisper:
#   "Designer" -> "Designers", "dévies" -> "devis", "site" -> "« SITE »", final "." -> "!"
WORDS = [
    ("Designers", 0.24, 0.81), ("d’intérieur", 0.82, 1.24), ("au", 1.24, 1.36), ("Maroc,", 1.36, 1.96),
    ("vous", 2.05, 2.16), ("voulez", 2.16, 2.54), ("attirer", 2.54, 2.87), ("plus", 2.87, 3.11),
    ("de", 3.11, 3.31), (f"clients{NB}?", 3.31, 3.59),
    ("Je", 3.96, 4.22), ("crée", 4.22, 4.52), ("votre", 4.52, 4.86), ("site", 4.88, 5.17), ("web", 5.17, 5.35),
    ("pour", 5.35, 5.55), ("mettre", 5.55, 5.89), ("vos", 5.89, 6.08), ("réalisations", 6.08, 6.65),
    ("en", 6.65, 6.78), ("valeur", 6.78, 7.43), ("et", 7.45, 7.60), ("faciliter", 7.60, 8.40),
    ("les", 8.40, 8.52), ("demandes", 8.52, 8.89), ("de", 8.89, 9.03), ("devis.", 9.03, 9.29),
    ("Vous", 9.67, 9.98), ("ne", 9.98, 10.10), ("payez", 10.10, 10.36), ("que", 10.36, 10.55),
    ("si", 10.55, 10.66), ("le", 10.66, 10.80), ("résultat", 10.80, 11.27), ("vous", 11.27, 11.50),
    ("plaît.", 11.50, 11.70),
    ("Envoyez-moi", 12.20, 12.90), (f"«{NB}SITE{NB}»", 12.90, 13.26), ("en", 13.28, 13.44),
    ("message", 13.46, 14.15), ("pour", 14.19, 14.35), (f"commencer{NB}!", 14.35, 14.76),
]
BEATS = [  # (index of first word, index of last word, script line)
    (0, 9, f"Designers d’intérieur au Maroc, vous voulez attirer plus de clients{NB}?"),
    (10, 26, "Je crée votre site web pour mettre vos réalisations en valeur et faciliter les demandes de devis."),
    (27, 35, "Vous ne payez que si le résultat vous plaît."),
    (36, 41, f"Envoyez-moi «{NB}SITE{NB}» en message pour commencer{NB}!"),
]
GROUPS = [(0, 2), (2, 4), (4, 7), (7, 10), (10, 13), (13, 15), (15, 18), (18, 21), (21, 23), (23, 27),
          (27, 30), (30, 32), (32, 34), (34, 36), (36, 37), (37, 38), (38, 40), (40, 42)]

def out_t(t):  # source -> output timeline
    return round(t - TRIM_START, 3)

voice_dur = round(SPEECH_END + TAIL_KEEP - TRIM_START, 3)
video_dur = voice_dur + VIDEO_TAIL
frames = int(round(video_dur * FPS))

words = [{"text": w, "start": out_t(s), "end": out_t(e)} for w, s, e in WORDS]
beats = [{"beat": i + 1, "start": words[a]["start"], "end": words[b]["end"], "text": txt}
         for i, (a, b, txt) in enumerate(BEATS)]
groups = []
for gi, (a, b) in enumerate(GROUPS):
    nxt = words[GROUPS[gi + 1][0]]["start"] if gi + 1 < len(GROUPS) else video_dur
    end = min(nxt, words[b - 1]["end"] + 0.35)
    groups.append({"words": list(range(a, b)), "start": words[a]["start"], "end": round(end, 3)})

def w_at(text, k=0):
    return [w for w in words if w["text"].startswith(text)][k]

# Sync points shared by visuals and sound design (output seconds)
ev = {
    "t1": [beats[0]["end"] + 0.01, beats[1]["start"]],          # transition windows = the pauses
    "t2": [beats[1]["end"] + 0.01, beats[2]["start"]],
    "t3": [beats[2]["end"] + 0.01, beats[3]["start"]],
    "notif": [w_at("attirer")["start"], w_at("plus")["start"], w_at("de", 0)["start"] + 0.08],
    "realisations": w_at("réalisations")["start"],
    "devisButton": w_at("demandes")["start"],
    "devisPulse": w_at("demandes")["start"] + 0.30,
    "devisForm": w_at("devis")["start"] - 0.10,
    "check": w_at("vous", 1)["start"],
    "typing": [round(w_at("«")["start"] + i * 0.085, 3) for i in range(4)],
    "send": round(w_at("«")["end"] + 0.03, 3),
    "commencer": w_at("pour", 1)["start"],
    # attention hits (visual slam/flash/shake + impact SFX share these)
    "impact": 0.24,                                   # "DESIGNERS" slams in
    "marocHit": round(w_at("Maroc")["start"] + 0.06, 3),
    "bigSite": round(w_at("«")["end"] + 0.03 + 0.75, 3),  # big « SITE » lands on the end card
}
ev["musicStart"] = ev["impact"]                        # song downbeat = hook impact

os.makedirs("src/data", exist_ok=True); os.makedirs("out", exist_ok=True)
json.dump({"fps": FPS, "durationInFrames": frames, "videoDuration": round(video_dur, 3), "voiceDuration": voice_dur,
           "trimStart": TRIM_START, "words": words, "beats": beats, "groups": groups, "events": ev},
          open("src/data/timeline.json", "w"), ensure_ascii=False, indent=1)
json.dump({"language": "fr", "source": "voiceover.wav", "timebase": "source audio seconds",
           "asr": "whisper-turbo (sherpa-onnx) text + zipformer-fr timestamps, pinned to energy dips",
           "corrections": ["Designer -> Designers", "dévies -> devis", "site -> « SITE »", ". -> !"],
           "text": " ".join(b[2] for b in BEATS),
           "words": [{"word": w, "start": s, "end": e} for w, s, e in WORDS]},
          open("transcript.json", "w"), ensure_ascii=False, indent=1)

def srt_t(x):
    ms = int(round(x * 1000)); return f"{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}"
with open("out/captions.srt", "w", encoding="utf-8") as f:
    for i, g in enumerate(groups, 1):
        f.write(f"{i}\n{srt_t(g['start'])} --> {srt_t(g['end'])}\n{' '.join(words[k]['text'] for k in g['words'])}\n\n")

print(f"voice {voice_dur:.2f}s  video {video_dur:.2f}s  ({frames} frames @ {FPS})")
print(f"{'beat':<5}{'start':>7}{'end':>7}  text")
for b in beats:
    print(f"{b['beat']:<5}{b['start']:>7.2f}{b['end']:>7.2f}  {b['text']}")
