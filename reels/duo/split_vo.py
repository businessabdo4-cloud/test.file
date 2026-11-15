"""Episode 2 ("الكورة قد النملة", iPhone Duo): split the single recorded dialogue into its 8 lines.

Boundaries come from ffmpeg silencedetect (pauses >= 0.15 s at -33/-36 dB). The split was confirmed by
timbre (spectral centroid: Hamza's lines ~1240-1500 Hz, Citybot's ~1600-1930 Hz) and by speaking rate vs
syllable count. Whisper could not run in this session (its model host is blocked), so word timings are
syllable-proportional estimates over the voiced frames of each line (used for timing only; subtitle TEXT
always comes from the script).
Writes assets/duo/vo/lines/L1..L8.wav (untouched audio, 48 kHz), assets/duo/vo/timings.json and
public/duo/data/timings.json (lines, speakers, word timings, Rhubarb phonetic mouth cues)."""
import json, pathlib, subprocess, sys
import numpy as np, soundfile as sf

ROOT = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts"))
import process_vo as pv  # noqa: E402  (word_timings / syllables / Rhubarb path)

VO = ROOT / "assets" / "duo" / "vo"
LINES_DIR = VO / "lines"
LINES_DIR.mkdir(parents=True, exist_ok=True)
SR = 48000
SCRIPT = [
    ("L1", "hamza", "كنتفرج فالماتش فالتيليفون… والكورة قد النملة!"),
    ("L2", "citybot", "ما تحتاجش تلفزة آ خويا! شوف هادا: iPhone Duo!"),
    ("L3", "hamza", "آش هادا؟ تيليفون ولا تابليت؟!"),
    ("L4", "citybot", "بجوج! مطوي iPhone عادي، ومحلول أكبر écran فتاريخ iPhone."),
    ("L5", "hamza", "وواش أوريجينال؟"),
    ("L6", "citybot", "فـ City Store؟ ديما! boîte fermée، jamais ouvert، jamais activé."),
    ("L7", "citybot", "صيفط لينا ميساج، ولا دخل لـ citystore.ma."),
    ("L8", "both", "City Store… الأصلي ديما!"),
]
# speech start/end of each line in the original recording (s), from silencedetect
BOUNDS = [(0.21, 4.65), (4.89, 7.30), (7.46, 9.25), (9.41, 13.14), (13.42, 14.43), (14.66, 18.95), (19.19, 21.70), (21.91, 23.61)]
PAD = 0.06

wav48 = ROOT / ".cache" / "duo_vo_48k.wav"
wav48.parent.mkdir(exist_ok=True)
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(VO / "voiceover.wav"), "-ar", str(SR), "-ac", "1", str(wav48)], check=True)
x, _ = sf.read(wav48)
total = len(x) / SR
out = []
for (lid, spk, text), (a, b) in zip(SCRIPT, BOUNDS):
    s, e = max(0.0, a - PAD), min(total, b + PAD)
    seg = x[int(s * SR):int(e * SR)]
    f = LINES_DIR / f"{lid}.wav"
    sf.write(f, seg, SR, subtype="PCM_16")
    words = pv.word_timings(seg, text)
    rj = ROOT / ".cache" / f"duo_{lid}_rhubarb.json"
    subprocess.run([str(pv.RHUBARB), "-q", "-r", "phonetic", "-f", "json", "--extendedShapes", "GHX", "-o", str(rj), str(f)], check=True, capture_output=True)
    cues = json.loads(rj.read_text())["mouthCues"]
    out.append({"id": lid, "speaker": spk, "text": text, "start": round(s, 3), "end": round(e, 3), "duration": round(e - s, 3),
                "words": [{**w, "start": round(w["start"] + s, 3), "end": round(w["end"] + s, 3)} for w in words], "mouthCues": cues})
data = {"source": "assets/duo/vo/voiceover.wav", "sourceDuration": round(total, 3), "wordTimingMethod": "syllable-proportional estimate (Whisper unavailable in this session)", "lines": out}
(VO / "timings.json").write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n")
pub = ROOT / "public" / "duo" / "data"
pub.mkdir(parents=True, exist_ok=True)
(pub / "timings.json").write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n")
for l in out:
    print(f'{l["id"]} {l["speaker"]:8s} {l["start"]:6.2f}-{l["end"]:6.2f} ({l["duration"]:.2f}s)  {l["text"]}')
    print("     " + "  ".join(f'{w["word"]}@{w["start"]:.2f}' for w in l["words"]))
