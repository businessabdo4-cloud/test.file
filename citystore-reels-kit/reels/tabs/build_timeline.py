"""Timeline for the tablets comparison reel (4 tablets) -> public/shokz/data/timeline.json
(42 s: the user approved going over 30 s for this reel to keep the full VO at natural speed)
(same schema as scripts/build_timeline.py; shared by the picture and the audio mix).
Scene cuts sit on the 120 BPM beat grid next to sentence breaks; hits land on the
half-beat nearest the word that triggers them."""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
PUB = ROOT / "public" / "tabs"
VO = json.loads((PUB / "data" / "vo.json").read_text())
LINES = json.loads((ROOT / "reels" / "tabs" / "vo_lines.json").read_text())
FPS, BPM = 30, 120
BEAT = 60 / BPM
TOTAL_FRAMES, HOLD_FROM = 1260, 41.0
SCENES = [("hook", 0.0, 3.5), ("a9", 3.5, 11.0), ("a11", 11.0, 18.25), ("lenovo", 18.25, 25.25),
          ("xiaomi", 25.25, 32.25), ("trust", 32.25, 36.25), ("cta", 36.25, 38.75), ("end", 38.75, 42.0)]


def f(t):
    return int(round(t * FPS))


def q(t, grid=BEAT / 2):
    return round(round(t / grid) * grid, 4)


def word_t(li, needle):
    line = VO[li]
    for w in line["words"]:
        if needle.lower() in w["word"].lower():
            return line["start"] + w["start"]
    raise KeyError(f"{needle!r} not in {line['id']}")


ev = {}
def nth(li, k):
    return VO[li]["start"] + VO[li]["words"][k]["start"]

def word_n(li, needle, n):
    hits = [VO[li]["start"] + w["start"] for w in VO[li]["words"] if needle.lower() in w["word"].lower()]
    return hits[n]

# HOOK - browsing tablets (cards flip past), then "STOP" before you buy
ev["hook.slam"] = 0.0
ev["hook.botLand"] = 0.3
ev["hook.flip"] = q(word_t(0, "كتقلّب"))
ev["hook.tab"] = q(word_t(0, "تابليت"))
ev["hook.stop"] = q(word_t(0, "تشريش"))
ev["hook.video"] = q(word_t(0, "الفيديو"))
# PRODUCTS (shared beats: name / ram / storage)
for key, li, ram, sto in [("a9", 1, "4GB", "64GB"), ("a11", 2, "4GB", "64GB"), ("lenovo", 3, "6GB", "128GB"), ("xiaomi", 4, "8GB", "128GB")]:
    ev[f"{key}.name"] = q(VO[li]["start"] + 0.05)
    ev[f"{key}.ram"] = q(word_t(li, ram))
    ev[f"{key}.sto"] = q(word_t(li, sto))
ev["a9.g5"] = q(word_n(1, "5G", 1))
ev["a9.sim"] = q(word_t(1, "بالكارط"))
ev["a9.where"] = q(word_t(1, "فين"))
ev["a11.color"] = q(word_t(2, "Gray"))
ev["a11.light"] = q(word_t(2, "خفيفة"))
ev["a11.read"] = q(word_t(2, "للقراية"))
ev["a11.video"] = q(word_t(2, "والفيديوهات"))
ev["lenovo.pen"] = q(word_t(3, "Pen"))
ev["lenovo.write"] = q(word_t(3, "تكتب"))
ev["lenovo.draw"] = q(word_t(3, "وترسم"))
ev["xiaomi.color"] = q(word_t(4, "Blue"))
ev["xiaomi.power"] = q(word_t(4, "أقوى"))
ev["xiaomi.games"] = q(word_t(4, "للجيمز"))
ev["xiaomi.work"] = q(word_t(4, "والخدمة"))
# TRUST
ev["trust.badge"] = 32.25
ev["trust.original"] = q(word_t(5, "originaux"))
ev["trust.thumb"] = ev["trust.original"]
ev["trust.checks"] = [q(word_t(5, "boîte")), q(nth(5, 4)), q(nth(5, 6))]
# CTA
ev["cta.url"] = 36.5
ev["cta.message"] = q(word_t(6, "تكوموندي"))
ev["cta.socials"] = ev["cta.message"] + 0.1
ev["cta.wave"] = ev["cta.message"] + 0.25
# END CARD
ev["end.city"] = 38.75
ev["end.typeStart"] = 39.0
ev["end.typeStep"] = 0.0625
ev["end.icons"] = 39.6
ev["end.iconStep"] = 0.06
ev["end.tagline"] = 40.0
ev["end.wink"] = 40.25
ev["end.hold"] = HOLD_FROM

sfx = [("blip_jump", ev["hook.botLand"], -14), ("whoosh", ev["hook.flip"], -12), ("whoosh", ev["hook.flip"] + 0.25, -13),
       ("whoosh", ev["hook.flip"] + 0.5, -14), ("pop_big", ev["hook.tab"], -12), ("stamp", ev["hook.stop"], -9), ("hit", ev["hook.stop"] + 0.03, -11),
       ("pop", ev["hook.video"], -13)]
sfx += [("whoosh", end - 0.3, -9) for _, _, end in SCENES[:-3]]
for key in ["a9", "a11", "lenovo", "xiaomi"]:
    sfx += [("impact", ev[f"{key}.name"], -8), ("shine", ev[f"{key}.name"] + 0.25, -15), ("pop_big", ev[f"{key}.ram"], -12), ("pop_big", ev[f"{key}.sto"], -12)]
sfx += [("stamp", ev["a9.g5"], -10), ("pop", ev["a9.sim"], -12), ("blip_up", ev["a9.where"], -13)]
sfx += [("pop", ev["a11.color"], -13), ("blip_jump", ev["a11.light"], -13), ("pop", ev["a11.read"], -12), ("pop", ev["a11.video"], -12)]
sfx += [("pop_big", ev["lenovo.pen"], -11), ("riser_short", ev["lenovo.write"] - 0.1, -15), ("shine", ev["lenovo.draw"], -13)]
sfx += [("pop", ev["xiaomi.color"], -13), ("hit", ev["xiaomi.power"], -9), ("pop", ev["xiaomi.games"], -12), ("pop", ev["xiaomi.work"], -12)]
sfx += [("hit", ev["trust.badge"], -8), ("blip_up", ev["trust.thumb"], -12)] + [("ding", t + 0.15, -12) for t in ev["trust.checks"]]
sfx += [("whoosh", 35.95, -10), ("pop_big", ev["cta.url"], -11), ("pop_big", ev["cta.message"], -11), ("pop", ev["cta.socials"] + 0.2, -13),
        ("blip", ev["cta.wave"], -13)]
sfx += [("whoosh", 38.45, -9), ("impact", ev["end.city"], -5)] + [("tick", ev["end.typeStart"] + i * ev["end.typeStep"], -12) for i in range(8)]
sfx += [("pop", ev["end.icons"] + i * ev["end.iconStep"], -15) for i in range(6)]
sfx += [("shine", ev["end.tagline"], -14), ("blip_wink", ev["end.wink"], -11)]


def chunk_line(line, explicit):
    words, chunks, i = line["words"], [], 0
    for text in explicit:
        n, c = len(text.split()), []
        while i < len(words) and len(" ".join(x["word"] for x in c).split()) < n:
            c.append(words[i])
            i += 1
        chunks.append(c)
    out = [{"text": " ".join(x["word"] for x in c), "start": round(line["start"] + c[0]["start"], 3),
            "end": round(line["start"] + c[-1]["end"], 3),
            "words": [{"word": x["word"], "start": round(line["start"] + x["start"], 3)} for x in c]} for c in chunks if c]
    for k, c in enumerate(out):
        c["end"] = round(out[k + 1]["start"] if k + 1 < len(out) else c["end"] + 0.35, 3)
    return out


subs = []
for li, line in enumerate(VO):
    nxt = VO[li + 1]["start"] if li + 1 < len(VO) else HOLD_FROM
    for c in chunk_line(line, LINES[li]["chunks"]):
        c["end"] = min(c["end"], nxt - 0.02, HOLD_FROM)
        c["line"] = li
        subs.append(c)

timeline = {
    "fps": FPS, "bpm": BPM, "beatFrames": BEAT * FPS, "totalFrames": TOTAL_FRAMES, "holdFrom": f(HOLD_FROM),
    "musicFirstDownbeat": 1.5,
    "scenes": [{"id": n, "from": f(a), "to": f(b)} for n, a, b in SCENES],
    "events": {k: ([f(x) for x in v] if isinstance(v, list) else (v if k.endswith("Step") else f(v))) for k, v in ev.items()},
    "eventsSec": ev,
    "sfx": [{"name": n, "t": round(t, 3), "gainDb": g} for n, t, g in sorted(sfx, key=lambda s: s[1])],
    "subtitles": [{**s, "from": f(s["start"]), "to": f(s["end"]), "words": [{**w, "frame": f(w["start"])} for w in s["words"]]} for s in subs],
    "vo": [{"id": l["id"], "from": f(l["start"]), "start": l["start"], "duration": l["duration"], "mouthCues": l["mouthCues"]} for l in VO],
}
assert VO[-1]["start"] + VO[-1]["duration"] <= HOLD_FROM + 0.01, "VO must end before the final-frame hold"
(PUB / "data" / "timeline.json").write_text(json.dumps(timeline, ensure_ascii=False, indent=1) + "\n")
for s in timeline["subtitles"]:
    print(f'{s["start"]:6.2f}-{s["end"]:6.2f}  {s["text"]}')
print({k: v for k, v in ev.items() if not k.startswith(("end.", "hook."))})
