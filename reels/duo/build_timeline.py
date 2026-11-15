"""Episode 2 "الكورة قد النملة" (iPhone Duo) -> public/duo/audio/vo/*.wav + public/duo/data/timeline.json.

Same schema as the other reels (scenes / events / sfx / subtitles / vo), plus `speaker` on each vo line and
`speakers` on each subtitle chunk so Hamza and Citybot each lip-sync only their own lines (both on L8).
The recorded dialogue keeps its natural timing (split by reels/duo/split_vo.py); it starts at OFFSET.
Citybot's lines (L2, L4, L6, L7) get a light robot effect; Hamza's lines and L8 stay clean.
Clean versions of every line are kept in public/duo/audio/vo_clean/ for comparison."""
import json, pathlib, subprocess
import numpy as np, soundfile as sf

ROOT = pathlib.Path(__file__).resolve().parents[2]
PUB = ROOT / "public" / "duo"
TIM = json.loads((ROOT / "assets" / "duo" / "vo" / "timings.json").read_text())
LINES_DIR = ROOT / "assets" / "duo" / "vo" / "lines"
FPS, BPM = 30, 120
BEAT = 60 / BPM
OFFSET = 0.3
TOTAL_S, HOLD_FROM = 26.0, 25.0
ROBOT = {"L2", "L4", "L6", "L7"}
CHUNKS = {
    "L1": ["كنتفرج فالماتش فالتيليفون…", "والكورة قد النملة!"],
    "L2": ["ما تحتاجش تلفزة آ خويا!", "شوف هادا: iPhone Duo!"],
    "L3": ["آش هادا؟", "تيليفون ولا تابليت؟!"],
    "L4": ["بجوج! مطوي iPhone عادي،", "ومحلول أكبر écran فتاريخ iPhone."],
    "L5": ["وواش أوريجينال؟"],
    "L6": ["فـ City Store؟ ديما!", "boîte fermée، jamais ouvert،", "jamais activé."],
    "L7": ["صيفط لينا ميساج،", "ولا دخل لـ citystore.ma."],
    "L8": ["City Store… الأصلي ديما!"],
}


def f(t):
    return int(round(t * FPS))


def q(t, grid=BEAT / 2):
    return round(round(t / grid) * grid, 4)


def robotize(src, dst):
    """light robot: +0.5 semitone (formants kept), 55 Hz ring-mod at 18%, 9 ms comb at 12%"""
    tmp = dst.with_suffix(".tmp.wav")
    subprocess.run(["rubberband", "-q", "-p", "0.5", "-F", str(src), str(tmp)], check=True, capture_output=True)
    x, sr = sf.read(tmp)
    t = np.arange(len(x)) / sr
    d = int(0.009 * sr)
    y = 0.82 * x + 0.18 * x * np.sin(2 * np.pi * 55 * t) + 0.12 * np.concatenate([np.zeros(d), x[:-d]])
    y *= np.abs(x).max() / np.abs(y).max()
    sf.write(dst, y, sr, subtype="PCM_16")
    tmp.unlink()


(PUB / "audio" / "vo").mkdir(parents=True, exist_ok=True)
(PUB / "audio" / "vo_clean").mkdir(parents=True, exist_ok=True)
LINES = TIM["lines"]
vo = []
for L in LINES:
    src = LINES_DIR / f"{L['id']}.wav"
    (PUB / "audio" / "vo_clean" / f"{L['id']}.wav").write_bytes(src.read_bytes())
    dst = PUB / "audio" / "vo" / f"{L['id']}.wav"
    if L["id"] in ROBOT:
        robotize(src, dst)
    else:
        dst.write_bytes(src.read_bytes())
    start = L["start"] + OFFSET
    vo.append({"id": L["id"], "speaker": L["speaker"], "from": f(start), "start": round(start, 3), "duration": L["duration"], "mouthCues": L["mouthCues"]})


def line(i):
    return LINES[i - 1]


def word_t(i, needle, n=0):
    hits = [w["start"] + OFFSET for w in line(i)["words"] if needle.lower() in w["word"].lower()]
    return hits[n]


st = [round(l["start"] + OFFSET, 3) for l in LINES]
# scenes cut a hair before each line starts (snap to frames)
SC = ["room", "burst", "unfold", "sizes", "sus", "trust", "cta", "end"]
cuts = [0.0] + [round(s - 0.08, 2) for s in st[1:]] + [TOTAL_S]
SCENES = [(SC[i], cuts[i], cuts[i + 1]) for i in range(8)]

ev = {}
# 1 ROOM (L1, Hamza)
ev["room.match"] = q(word_t(1, "فالماتش"))
ev["room.phone"] = q(word_t(1, "فالتيليفون"))
ev["room.ball"] = q(word_t(1, "والكورة"))
ev["room.ant"] = q(word_t(1, "النملة"))
# 2 BURST (L2, Citybot pops out of the phone)
ev["burst.glow"] = st[1] - 0.25
ev["burst.pop"] = st[1]
ev["burst.tv"] = q(word_t(2, "تلفزة"))
ev["burst.look"] = q(word_t(2, "شوف"))
ev["burst.box"] = q(word_t(2, "هادا"))
ev["burst.duo"] = word_t(2, "iPhone")
# 3 UNFOLD (L3, Hamza amazed)
ev["unfold.open"] = st[2] + 0.05
ev["unfold.what"] = q(word_t(3, "آش"))
ev["unfold.phone"] = q(word_t(3, "تيليفون"))
ev["unfold.tablet"] = q(word_t(3, "تابليت"))
# 4 SIZES (L4)
ev["sz.both"] = q(word_t(4, "بجوج"))
ev["sz.folded"] = q(word_t(4, "مطوي"))
ev["sz.open"] = q(word_t(4, "ومحلول"))
ev["sz.big"] = q(word_t(4, "أكبر"))
ev["sz.hist"] = q(word_t(4, "فتاريخ"))
# 5 SUS (L5)
ev["sus.brow"] = st[4]
ev["sus.q"] = q(word_t(5, "أوريجينال"))
# 6 TRUST (L6)
ev["tr.store"] = q(word_t(6, "City"))
ev["tr.always"] = q(word_t(6, "ديما"))
ev["tr.checks"] = [q(word_t(6, "boîte")), q(word_t(6, "ouvert")) - 0.25, q(word_t(6, "activé")) - 0.25]
# 7 CTA (L7)
ev["cta.msg"] = q(word_t(7, "ميساج"))
ev["cta.url"] = q(word_t(7, "citystore"))
# 8 END (L8)
ev["end.city"] = st[7]
ev["end.typeStart"] = st[7] + 0.3
ev["end.typeStep"] = 0.06
ev["end.icons"] = st[7] + 0.95
ev["end.iconStep"] = 0.06
ev["end.tagline"] = q(word_t(8, "الأصلي"))
ev["end.five"] = q(word_t(8, "ديما"))
ev["end.wink"] = ev["end.five"] + 0.5
ev["end.hold"] = HOLD_FROM

sfx = [("pop", ev["room.match"], -16), ("blip", ev["room.ball"], -14), ("blip_jump", ev["room.ant"], -12)]
sfx += [("whoosh", s - 0.3, -10) for _, s, _ in SCENES[1:7]]
sfx += [("riser_short", ev["burst.glow"] - 0.2, -13), ("impact", ev["burst.pop"], -7), ("shine", ev["burst.pop"] + 0.15, -13),
        ("stamp", ev["burst.box"], -11), ("shine", ev["burst.duo"], -11), ("pop_big", ev["burst.duo"] + 0.1, -12)]
sfx += [("whoosh", ev["unfold.open"], -11), ("stamp", ev["unfold.open"] + 0.45, -12), ("pop", ev["unfold.what"] + 0.2, -13),
        ("pop", ev["unfold.phone"], -14), ("pop", ev["unfold.tablet"], -14)]
sfx += [("pop_big", ev["sz.both"], -11), ("pop", ev["sz.folded"], -12), ("whoosh", ev["sz.open"], -11), ("stamp", ev["sz.open"] + 0.4, -11),
        ("shine", ev["sz.big"], -12)]
sfx += [("blip_up", ev["sus.brow"], -12), ("pop_big", ev["sus.q"], -10)]
sfx += [("blip_wink", ev["tr.store"], -12), ("ding", ev["tr.always"], -11)] + [("stamp", t, -10) for t in ev["tr.checks"]] + [("ding", t + 0.15, -13) for t in ev["tr.checks"]]
sfx += [("pop_big", ev["cta.msg"], -11)] + [("tick", ev["cta.url"] + i * 0.06, -13) for i in range(12)]
sfx += [("impact", ev["end.city"], -5)] + [("tick", ev["end.typeStart"] + i * ev["end.typeStep"], -12) for i in range(8)]
sfx += [("pop", ev["end.icons"] + i * ev["end.iconStep"], -15) for i in range(6)]
sfx += [("shine", ev["end.tagline"], -13), ("hit", ev["end.five"], -8), ("blip_wink", ev["end.wink"], -11)]

subs = []
for li, L in enumerate(LINES):
    words = L["words"]
    i = 0
    chunks = []
    for text in CHUNKS[L["id"]]:
        n = len(text.split())
        chunks.append(words[i:i + n])
        i += n
    nxt = st[li + 1] if li + 1 < len(st) else HOLD_FROM
    for k, c in enumerate(chunks):
        if not c:
            continue
        s = c[0]["start"] + OFFSET
        e = (chunks[k + 1][0]["start"] + OFFSET) if k + 1 < len(chunks) and chunks[k + 1] else L["end"] + OFFSET + 0.3
        e = min(e, nxt - 0.02, HOLD_FROM)
        subs.append({"text": " ".join(w["word"] for w in c), "start": round(s, 3), "end": round(e, 3), "line": li, "speaker": L["speaker"],
                     "words": [{"word": w["word"], "start": round(w["start"] + OFFSET, 3)} for w in c]})

timeline = {
    "fps": FPS, "bpm": BPM, "beatFrames": BEAT * FPS, "totalFrames": f(TOTAL_S), "holdFrom": f(HOLD_FROM),
    "musicFirstDownbeat": 1.5,
    "scenes": [{"id": n, "from": f(a), "to": f(b)} for n, a, b in SCENES],
    "events": {k: ([f(x) for x in v] if isinstance(v, list) else (v if k.endswith("Step") else f(v))) for k, v in ev.items()},
    "eventsSec": ev,
    "sfx": [{"name": n, "t": round(t, 3), "gainDb": g} for n, t, g in sorted(sfx, key=lambda s: s[1])],
    "subtitles": [{**s, "from": f(s["start"]), "to": f(s["end"]), "words": [{**w, "frame": f(w["start"])} for w in s["words"]]} for s in subs],
    "vo": vo,
}
assert vo[-1]["start"] + vo[-1]["duration"] <= HOLD_FROM, "VO must end before the hold"
assert timeline["totalFrames"] <= 900
(PUB / "data" / "timeline.json").write_text(json.dumps(timeline, ensure_ascii=False, indent=1) + "\n")
for s in timeline["scenes"]:
    print(s)
for s in timeline["subtitles"]:
    print(f'{s["start"]:6.2f}-{s["end"]:6.2f} {s["speaker"]:8s} {s["text"]}')
