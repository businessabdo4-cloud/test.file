"""Timeline for the Sony WH-1000XM6 / XM5 reel -> public/sony/data/timeline.json
(same schema as scripts/build_timeline.py; shared by the picture and the audio mix).
Scene cuts sit on the 120 BPM beat grid next to sentence breaks; hits land on the
half-beat nearest the word that triggers them."""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
PUB = ROOT / "public" / "sony"
VO = json.loads((PUB / "data" / "vo.json").read_text())
LINES = json.loads((ROOT / "reels" / "sony" / "vo_lines.json").read_text())
FPS, BPM = 30, 120
BEAT = 60 / BPM
TOTAL_FRAMES, HOLD_FROM = 900, 29.0
SCENES = [("hook", 0.0, 3.5), ("xm6", 3.5, 7.5), ("anc", 7.5, 11.5), ("xm5", 11.5, 17.0),
          ("battery", 17.0, 21.5), ("trust", 21.5, 25.0), ("cta", 25.0, 27.5), ("end", 27.5, 30.0)]


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
# HOOK - "noise" words pop + shake with city-noise SFX, headphones drop on Citybot on "وانت؟",
# everything cuts to silence on "ما سامع والو!" (the ANC moment), music drops on the product reveal
ev["hook.horn"] = 0.0
ev["hook.neighbours"] = q(word_t(0, "جيران"))
ev["hook.bus"] = q(word_t(0, "طوبيس"))
ev["hook.you"] = q(word_t(1, "وانت"))
ev["hook.silence"] = q(word_t(1, "ما"))
ev["hook.title"] = ev["hook.silence"]
ev["hook.botLand"] = 0.4
ev["hook.hop"] = ev["hook.silence"]
# XM6
ev["xm6.reveal"] = 3.5
ev["xm6.black"] = q(word_t(2, "بالكحل"))
ev["xm6.blue"] = q(word_t(2, "وبالأزرق"))
# ANC
ev["anc.nc"] = 7.75
ev["anc.sound"] = q(word_t(3, "صوت"))
ev["anc.fold"] = q(word_t(3, "وكيتطواو"))
# XM5
ev["xm5.value"] = q(word_t(4, "كوالتي"))
ev["xm5.reveal"] = q(word_t(4, "WH-1000XM5"))
ev["xm5.black"] = q(word_t(4, "بالكحل"))
# BATTERY
ev["bat.hours"] = q(word_t(5, "30"))
ev["bat.charge"] = q(word_t(5, "دقايق"))
ev["bat.music"] = q(word_t(5, "سوايع"))
# TRUST (same keys as the watch reel's checklist)
ev["trust.badge"] = 21.5
ev["trust.original"] = q(word_t(6, "original"))
ev["trust.thumb"] = ev["trust.original"]
ev["trust.checks"] = [q(word_t(6, "boîte")), q(VO[6]["start"] + VO[6]["words"][4]["start"]), q(VO[6]["start"] + VO[6]["words"][6]["start"])]
# CTA
ev["cta.message"] = q(word_t(7, "ميساج"))
ev["cta.socials"] = ev["cta.message"] + 0.25
ev["cta.url"] = q(word_t(7, "citystore.ma"))
ev["cta.wave"] = ev["cta.socials"]
# END CARD (shared EndCard keys)
ev["end.city"] = 27.5
ev["end.typeStart"] = 27.75
ev["end.typeStep"] = 0.0625
ev["end.icons"] = 28.25
ev["end.iconStep"] = 0.06
ev["end.tagline"] = q(word_t(8, "ديما"))
ev["end.wink"] = 28.75
ev["end.hold"] = HOLD_FROM

sfx = [("horn", ev["hook.horn"] + 0.05, -15), ("horn", ev["hook.horn"] + 0.5, -17), ("crowd", ev["hook.neighbours"], -17),
       ("bus", ev["hook.bus"], -15), ("horn", ev["hook.bus"] + 0.4, -18), ("blip_jump", ev["hook.botLand"], -14),
       ("whoosh", ev["hook.you"] - 0.15, -12), ("stamp", ev["hook.you"] + 0.1, -12), ("anc", ev["hook.silence"] - 0.05, -9)]
sfx += [("whoosh", end - 0.3, -9) for _, _, end in SCENES[1:-1]]
sfx += [("impact", ev["xm6.reveal"], -5), ("shine", ev["xm6.reveal"] + 0.3, -13), ("pop", ev["xm6.black"], -12), ("pop", ev["xm6.blue"], -12),
        ("shine", ev["xm6.blue"] + 0.1, -15)]
sfx += [("anc", ev["anc.nc"], -14), ("pop_big", ev["anc.nc"] + 0.05, -12), ("pop", ev["anc.sound"], -12), ("tick", ev["anc.fold"], -9),
        ("tick", ev["anc.fold"] + 0.18, -10), ("pop", ev["anc.fold"] + 0.3, -13)]
sfx += [("pop", ev["xm5.value"], -13), ("impact", ev["xm5.reveal"], -8), ("pop", ev["xm5.black"], -12)]
sfx += [("pop_big", ev["bat.hours"], -10), ("blip_up", ev["bat.charge"], -11), ("pop_big", ev["bat.music"], -11)]
sfx += [("hit", ev["trust.badge"], -8), ("blip_up", ev["trust.thumb"], -12)] + [("ding", t + 0.15, -12) for t in ev["trust.checks"]]
sfx += [("pop_big", ev["cta.message"], -11), ("pop", ev["cta.socials"], -13), ("pop", ev["cta.socials"] + 0.25, -13),
        ("pop_big", ev["cta.url"], -10), ("blip", ev["cta.wave"] + 0.1, -13)]
sfx += [("impact", ev["end.city"], -5)] + [("tick", ev["end.typeStart"] + i * ev["end.typeStep"], -12) for i in range(8)]
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
