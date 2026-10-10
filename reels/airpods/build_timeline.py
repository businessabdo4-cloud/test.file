"""Timeline for the AirPods 5 reel -> public/airpods/data/timeline.json
(40 s: the user approved going over 30 s for this reel to keep the full VO at natural speed)
(same schema as scripts/build_timeline.py; shared by the picture and the audio mix).
Scene cuts sit on the 120 BPM beat grid next to sentence breaks; hits land on the
half-beat nearest the word that triggers them."""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
PUB = ROOT / "public" / "airpods"
VO = json.loads((PUB / "data" / "vo.json").read_text())
LINES = json.loads((ROOT / "reels" / "airpods" / "vo_lines.json").read_text())
FPS, BPM = 30, 120
BEAT = 60 / BPM
TOTAL_FRAMES, HOLD_FROM = 1200, 39.0
SCENES = [("hook", 0.0, 4.5), ("intro", 4.5, 8.75), ("fit", 8.75, 13.5), ("anc", 13.5, 20.75),
          ("features", 20.75, 26.0), ("charging", 26.0, 29.75), ("trust", 29.75, 34.25), ("cta", 34.25, 36.75), ("end", 36.75, 40.0)]


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

# HOOK - two speech bubbles in foreign scripts (???), the AirPods land and the bubbles turn into translations
ev["hook.slam"] = 0.0
ev["hook.botLand"] = 0.3
ev["hook.bubble1"] = 0.15
ev["hook.bubble2"] = q(word_t(0, "بلغة"))
ev["hook.huh"] = q(word_t(0, "فاهمهاش"))
ev["hook.airpods"] = q(nth(1, 0))
ev["hook.translate"] = q(word_t(1, "كيترجمو"))
# INTRO
ev["intro.name"] = q(nth(2, 0))
ev["intro.case"] = q(word_t(2, "boîtier"))
ev["intro.dispo"] = q(word_t(2, "disponibles"))
# FIT
ev["fit.latest"] = q(word_t(3, "آخر"))
ev["fit.ear"] = q(word_t(3, "كيجيو"))
ev["fit.stable"] = q(word_t(3, "ثابتين"))
# ANC
ev["anc.nc"] = q(word_t(4, "réduction"))
ev["anc.pct"] = q(word_t(4, "50%"))
ev["anc.switch"] = q(word_t(4, "وكيتبدلو"))
ev["anc.transp"] = q(word_t(4, "transparence"))
ev["anc.talk"] = q(word_t(4, "كيهضر"))
# FEATURES
ev["ft.siri"] = q(word_t(5, "Siri"))
ev["ft.spatial"] = q(word_t(5, "spatial"))
ev["ft.ip"] = q(word_t(5, "ومقاومين"))
# CHARGING
ev["ch.case"] = q(word_t(6, "البواطة"))
ev["ch.wireless"] = q(word_t(6, "sans"))
ev["ch.put"] = q(word_t(6, "حطها"))
ev["ch.done"] = q(word_t(6, "وصافي"))
# TRUST
ev["trust.badge"] = 29.75
ev["trust.original"] = q(word_t(7, "originaux"))
ev["trust.thumb"] = ev["trust.original"]
ev["trust.checks"] = [q(word_t(7, "boîte")), q(nth(7, 4)), q(nth(7, 6))]
# CTA
ev["cta.url"] = 34.5
ev["cta.message"] = q(word_t(8, "تكوموندي"))
ev["cta.socials"] = ev["cta.message"] + 0.1
ev["cta.wave"] = ev["cta.message"] + 0.25
# END CARD
ev["end.city"] = 36.75
ev["end.typeStart"] = 37.0
ev["end.typeStep"] = 0.0625
ev["end.icons"] = 37.6
ev["end.iconStep"] = 0.06
ev["end.tagline"] = 38.0
ev["end.wink"] = 38.25
ev["end.hold"] = HOLD_FROM

sfx = [("pop_big", ev["hook.bubble1"], -11), ("blip_jump", ev["hook.botLand"], -14), ("pop_big", ev["hook.bubble2"], -11), ("blip_wink", ev["hook.huh"], -11),
       ("whoosh", ev["hook.airpods"] - 0.2, -10), ("impact", ev["hook.airpods"], -6), ("shine", ev["hook.translate"], -11), ("blip_up", ev["hook.translate"] + 0.1, -12)]
sfx += [("whoosh", end - 0.3, -9) for _, _, end in SCENES[:-3]]
sfx += [("hit", ev["intro.name"], -9), ("pop_big", ev["intro.case"], -11), ("stamp", ev["intro.dispo"], -11)]
sfx += [("pop_big", ev["fit.latest"], -11), ("pop", ev["fit.ear"], -12), ("stamp", ev["fit.stable"], -10)]
sfx += [("anc", ev["anc.nc"], -10), ("impact", ev["anc.pct"], -9), ("blip_up", ev["anc.switch"], -12), ("shine", ev["anc.transp"], -13), ("pop", ev["anc.talk"], -12)]
sfx += [("blip", ev["ft.siri"], -12), ("shine", ev["ft.spatial"], -13), ("pop_big", ev["ft.ip"], -11)]
sfx += [("pop_big", ev["ch.case"], -11), ("tap", ev["ch.put"], -9), ("blip_up", ev["ch.put"] + 0.15, -12), ("ding", ev["ch.done"], -12)]
sfx += [("hit", ev["trust.badge"], -8), ("blip_up", ev["trust.thumb"], -12)] + [("ding", t + 0.15, -12) for t in ev["trust.checks"]]
sfx += [("whoosh", 33.95, -10), ("pop_big", ev["cta.url"], -11), ("pop_big", ev["cta.message"], -11), ("pop", ev["cta.socials"] + 0.2, -13),
        ("blip", ev["cta.wave"], -13)]
sfx += [("whoosh", 36.45, -9), ("impact", ev["end.city"], -5)] + [("tick", ev["end.typeStart"] + i * ev["end.typeStep"], -12) for i in range(8)]
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
