"""Timeline for the GoPro HERO13 Black reel -> public/shokz/data/timeline.json
(30 s; full VO fits at natural speed after pause trimming)
(same schema as scripts/build_timeline.py; shared by the picture and the audio mix).
Scene cuts sit on the 120 BPM beat grid next to sentence breaks; hits land on the
half-beat nearest the word that triggers them."""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
PUB = ROOT / "public" / "gopro"
VO = json.loads((PUB / "data" / "vo.json").read_text())
LINES = json.loads((ROOT / "reels" / "gopro" / "vo_lines.json").read_text())
FPS, BPM = 30, 120
BEAT = 60 / BPM
TOTAL_FRAMES, HOLD_FROM = 900, 29.0
SCENES = [("hook", 0.0, 5.0), ("intro", 5.0, 8.0), ("res", 8.0, 11.75), ("smooth", 11.75, 15.5), ("water", 15.5, 20.0),
          ("mount", 20.0, 22.75), ("trust", 22.75, 26.5), ("cta", 26.5, 28.25), ("end", 28.25, 30.0)]


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

# HOOK - underwater / on the motorbike / in the mountains: the phone can't, GoPro can
ev["hook.slam"] = 0.0
ev["hook.botLand"] = 0.3
ev["hook.water"] = q(word_t(0, "الما"))
ev["hook.moto"] = q(word_t(0, "الموطور"))
ev["hook.mount"] = q(word_t(0, "فالجبل"))
ev["hook.phone"] = q(word_t(0, "التيليفون"))
ev["hook.no"] = q(word_t(0, "يقدرش"))
ev["hook.gopro"] = q(word_t(0, "GoPro"))
# INTRO
ev["intro.name"] = q(word_t(1, "GoPro"))
ev["intro.dispo"] = q(word_t(1, "disponible"))
# RESOLUTION
ev["res.video"] = q(word_t(2, "فيديو"))
ev["res.k"] = q(word_t(2, "5.3K"))
ev["res.photo"] = q(word_t(2, "وتصاور"))
ev["res.mp"] = q(word_t(2, "27"))
# HYPERSMOOTH
ev["sm.title"] = q(word_t(3, "HyperSmooth"))
ev["sm.steady"] = q(word_t(3, "ثابت"))
ev["sm.run"] = q(word_t(3, "تجري"))
ev["sm.jump"] = q(word_t(3, "تنقز"))
ev["sm.fall"] = q(word_t(3, "تطيح"))
# WATERPROOF + GPS
ev["wt.dive"] = q(word_t(4, "étanche"))
ev["wt.m"] = q(word_t(4, "10"))
ev["wt.nobox"] = q(word_t(4, "boîtier"))
ev["wt.gps"] = q(word_t(4, "GPS"))
ev["wt.speed"] = q(word_t(4, "السرعة"))
ev["wt.route"] = q(word_t(4, "والطريق"))
# MAGNETIC MOUNT
ev["mt.title"] = q(word_t(5, "Support"))
ev["mt.on"] = q(word_t(5, "كتركبها"))
ev["mt.off"] = q(word_t(5, "وتحيدها"))
ev["mt.sec"] = q(word_t(5, "فثانية"))
# TRUST
ev["trust.badge"] = 22.75
ev["trust.original"] = q(word_t(6, "originaux"))
ev["trust.thumb"] = ev["trust.original"]
ev["trust.checks"] = [q(word_t(6, "boîte")), q(nth(6, 4)), q(nth(6, 6))]
# CTA
ev["cta.url"] = 26.6
ev["cta.message"] = q(word_t(7, "تكوموندي"))
ev["cta.socials"] = ev["cta.message"] + 0.1
ev["cta.wave"] = ev["cta.message"] + 0.25
# END CARD
ev["end.city"] = 28.25
ev["end.typeStart"] = 28.4
ev["end.typeStep"] = 0.05
ev["end.icons"] = 28.6
ev["end.iconStep"] = 0.05
ev["end.tagline"] = 28.8
ev["end.wink"] = 28.9
ev["end.hold"] = HOLD_FROM

sfx = [("blip_jump", ev["hook.botLand"], -14), ("pop_big", ev["hook.water"], -12), ("pop_big", ev["hook.moto"], -12), ("pop_big", ev["hook.mount"], -12),
       ("pop", ev["hook.phone"], -12), ("hit", ev["hook.no"], -10), ("impact", ev["hook.gopro"], -7), ("shine", ev["hook.gopro"] + 0.2, -14)]
sfx += [("whoosh", end - 0.3, -9) for _, _, end in SCENES[:-3]]
sfx += [("impact", ev["intro.name"], -6), ("shine", ev["intro.name"] + 0.2, -14), ("stamp", ev["intro.dispo"], -11)]
sfx += [("pop", ev["res.video"], -12), ("pop_big", ev["res.k"], -9), ("blip_up", ev["res.photo"], -13), ("pop_big", ev["res.mp"], -10)]
sfx += [("riser_short", ev["sm.title"] - 0.1, -14), ("stamp", ev["sm.steady"], -10), ("pop", ev["sm.run"], -12), ("blip_jump", ev["sm.jump"], -12), ("hit", ev["sm.fall"], -11)]
sfx += [("pop_big", ev["wt.dive"], -11), ("pop_big", ev["wt.m"], -10), ("pop", ev["wt.nobox"], -12), ("blip_up", ev["wt.gps"], -12), ("pop", ev["wt.speed"], -12), ("shine", ev["wt.route"], -13)]
sfx += [("pop_big", ev["mt.title"], -11), ("stamp", ev["mt.on"] + 0.1, -9), ("blip", ev["mt.off"], -12), ("ding", ev["mt.sec"], -12)]
sfx += [("hit", ev["trust.badge"], -8), ("blip_up", ev["trust.thumb"], -12)] + [("ding", t + 0.15, -12) for t in ev["trust.checks"]]
sfx += [("whoosh", 26.2, -10), ("pop_big", ev["cta.url"], -11), ("pop_big", ev["cta.message"], -11), ("pop", ev["cta.socials"] + 0.2, -13),
        ("blip", ev["cta.wave"], -13)]
sfx += [("whoosh", 27.95, -9), ("impact", ev["end.city"], -5)] + [("tick", ev["end.typeStart"] + i * ev["end.typeStep"], -12) for i in range(8)]
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
