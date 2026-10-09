"""Timeline for the iPhone 18 Pro / iPhone 17 Pro reel -> public/iphones/data/timeline.json
(38 s: the user approved going over 30 s for this reel to keep the full VO at natural speed)
(same schema as scripts/build_timeline.py; shared by the picture and the audio mix).
Scene cuts sit on the 120 BPM beat grid next to sentence breaks; hits land on the
half-beat nearest the word that triggers them."""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
PUB = ROOT / "public" / "iphones"
VO = json.loads((PUB / "data" / "vo.json").read_text())
LINES = json.loads((ROOT / "reels" / "iphones" / "vo_lines.json").read_text())
FPS, BPM = 30, 120
BEAT = 60 / BPM
TOTAL_FRAMES, HOLD_FROM = 1140, 37.0
SCENES = [("hook", 0.0, 4.5), ("intro", 4.5, 10.0), ("p18", 10.0, 17.0), ("p17", 17.0, 26.5),
          ("screen", 26.5, 29.0), ("trust", 29.0, 33.5), ("cta", 33.5, 35.0), ("end", 35.0, 38.0)]


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

# HOOK - "18 Pro or 17 Pro? hard to choose... but both with a SIM card!": VS face-off, then a SIM card slams in
ev["hook.slam"] = 0.0
ev["hook.botLand"] = 0.3
ev["hook.p18"] = 0.0
ev["hook.p17"] = q(word_t(0, "17"))
ev["hook.hard"] = q(word_t(0, "S3ib"))
ev["hook.sim"] = q(word_t(0, "carte"))
# INTRO
ev["intro.p18"] = 4.5
ev["intro.p17"] = q(nth(1, 4))
ev["intro.gb"] = q(word_t(1, "256GB"))
ev["intro.dispo"] = q(word_t(1, "disponibles"))
ev["intro.here"] = q(word_t(1, "3ndna"))
# iPHONE 18 PRO
ev["p18.colour"] = q(word_t(2, "Burgundy"))
ev["p18.latest"] = q(word_t(2, "akhir"))
ev["p18.chip"] = q(word_t(2, "A20"))
ev["p18.perf"] = q(word_t(2, "performance"))
ev["p18.camera"] = q(word_t(2, "camera"))
# iPHONE 17 PRO
ev["p17.silver"] = q(word_t(3, "Silver"))
ev["p17.orange"] = q(word_t(3, "Orange"))
ev["p17.chip"] = q(word_t(3, "A19"))
ev["p17.cams"] = q(word_t(3, "cameras"))
ev["p17.mp"] = q(word_t(3, "48MP"))
ev["p17.zoom"] = q(word_t(3, "zoom"))
ev["p17.x8"] = q(word_t(3, "8x"))
# SCREEN
ev["sc.size"] = q(word_t(4, "6.3"))
ev["sc.promo"] = q(word_t(4, "ProMotion"))
# TRUST
ev["trust.badge"] = 29.0
ev["trust.original"] = q(word_t(5, "originaux"))
ev["trust.thumb"] = ev["trust.original"]
ev["trust.checks"] = [q(word_t(5, "boîte")), q(nth(5, 4)), q(nth(5, 6))]
# CTA
ev["cta.url"] = 33.75
ev["cta.message"] = q(word_t(6, "tcommander"))
ev["cta.socials"] = ev["cta.message"] + 0.1
ev["cta.wave"] = ev["cta.message"] + 0.25
# END CARD (final frame held from 37.0)
ev["end.city"] = 35.0
ev["end.typeStart"] = 35.25
ev["end.typeStep"] = 0.0625
ev["end.icons"] = 35.85
ev["end.iconStep"] = 0.06
ev["end.tagline"] = 36.4
ev["end.wink"] = 36.7
ev["end.hold"] = HOLD_FROM

sfx = [("impact", 0.02, -6), ("blip_jump", ev["hook.botLand"], -14), ("hit", ev["hook.p17"], -9), ("blip_wink", ev["hook.hard"], -12),
       ("whoosh", ev["hook.sim"] - 0.2, -10), ("impact", ev["hook.sim"], -7), ("stamp", ev["hook.sim"] + 0.1, -12)]
sfx += [("whoosh", end - 0.3, -9) for _, _, end in SCENES[:-3]]
sfx += [("hit", ev["intro.p18"], -9), ("hit", ev["intro.p17"], -10), ("pop_big", ev["intro.gb"], -11), ("stamp", ev["intro.dispo"], -11),
        ("pop", ev["intro.here"], -13)]
sfx += [("impact", 10.0, -8), ("shine", 10.3, -14), ("pop", ev["p18.colour"], -12), ("pop_big", ev["p18.latest"], -11), ("pop_big", ev["p18.chip"], -11),
        ("riser_short", ev["p18.perf"] - 0.1, -15), ("shutter", ev["p18.camera"], -10)]
sfx += [("impact", 17.0, -8), ("pop", ev["p17.silver"], -12), ("pop", ev["p17.orange"], -12), ("pop_big", ev["p17.chip"], -11),
        ("shutter", ev["p17.cams"], -11), ("pop_big", ev["p17.mp"], -11), ("blip_up", ev["p17.zoom"], -12), ("impact", ev["p17.x8"], -9)]
sfx += [("pop_big", ev["sc.size"], -11), ("shine", ev["sc.promo"], -12)]
sfx += [("hit", ev["trust.badge"], -8), ("blip_up", ev["trust.thumb"], -12)] + [("ding", t + 0.15, -12) for t in ev["trust.checks"]]
sfx += [("whoosh", 33.2, -10), ("pop_big", ev["cta.url"], -11), ("pop_big", ev["cta.message"], -11), ("pop", ev["cta.socials"] + 0.2, -13),
        ("blip", ev["cta.wave"], -13)]
sfx += [("whoosh", 34.7, -9), ("impact", ev["end.city"], -5)] + [("tick", ev["end.typeStart"] + i * ev["end.typeStep"], -12) for i in range(8)]
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
