"""Timeline for the Ray-Ban Meta Gen 2 reel -> public/rayban/data/timeline.json
(same schema as scripts/build_timeline.py; shared by the picture and the audio mix).
Scene cuts sit on the 120 BPM beat grid next to sentence breaks; hits land on the
half-beat nearest the word that triggers them."""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
PUB = ROOT / "public" / "rayban"
VO = json.loads((PUB / "data" / "vo.json").read_text())
LINES = json.loads((ROOT / "reels" / "rayban" / "vo_lines.json").read_text())
FPS, BPM = 30, 120
BEAT = 60 / BPM
TOTAL_FRAMES, HOLD_FROM = 900, 29.0
SCENES = [("hook", 0.0, 3.5), ("intro", 3.5, 6.0), ("headliner", 6.0, 10.5), ("wayfarer", 10.5, 15.0),
          ("camera", 15.0, 17.5), ("audio", 17.5, 20.5), ("battery", 20.5, 24.0), ("trust", 24.0, 27.0),
          ("cta", 27.0, 28.0), ("end", 28.0, 30.0)]


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
# HOOK - the Headliner slams in on "هادو", "ماشي غير نضاضر…" lands word by word, Citybot puts on its shades,
# then an x-ray scan tags what's inside the frame: camera / speakers / Meta AI on the VO words
ev["hook.slam"] = 0.0
ev["hook.text"] = q(word_t(0, "ماشي"))
ev["hook.glasses"] = q(word_t(0, "نضاضر"))
ev["hook.botLand"] = 0.4
ev["hook.scan"] = q(VO[1]["start"])
ev["hook.camera"] = q(word_t(1, "كاميرا"))
ev["hook.casque"] = q(word_t(1, "كاسك"))
ev["hook.ai"] = q(word_t(1, "AI"))
# INTRO - Ray-Ban Meta Gen 2, both frames fly in, DISPONIBLE
ev["intro.reveal"] = 3.5
ev["intro.name"] = q(word_t(1, "Ray-Ban"))
ev["intro.dispo"] = q(word_t(1, "disponibles"))
ev["intro.here"] = q(word_t(1, "عندنا"))
# HEADLINER
ev["hl.reveal"] = 6.0
ev["hl.colour"] = q(word_t(2, "Shiny"))
ev["hl.classic"] = q(word_t(2, "classique"))
ev["hl.elegant"] = q(word_t(2, "élégant"))
ev["hl.look"] = q(word_t(2, "كيبان"))
# WAYFARER
ev["wf.reveal"] = 10.5
ev["wf.colour"] = q(word_t(3, "Matte"))
ev["wf.icon"] = q(word_t(3, "iconique"))
ev["wf.matte"] = q(word_t(3, "finition"))
# CAMERA
ev["cam.cam"] = q(word_t(4, "كاميرا"))
ev["cam.mp"] = q(word_t(4, "12MP"))
ev["cam.video"] = q(word_t(4, "vidéo"))
ev["cam.k3"] = q(word_t(4, "3K"))
# AUDIO
ev["au.speakers"] = q(word_t(5, "Haut-parleurs"))
ev["au.music"] = q(word_t(5, "الموسيقى"))
ev["au.calls"] = q(word_t(5, "وتجاوب"))
# BATTERY
ev["bat.hours"] = q(word_t(6, "8"))
ev["bat.case"] = q(word_t(6, "boîte"))
ev["bat.more"] = q(word_t(6, "كتعطيك"))
# TRUST (shared checklist keys)
ev["trust.badge"] = 24.0
ev["trust.original"] = q(word_t(7, "originaux"))
ev["trust.thumb"] = ev["trust.original"]
ev["trust.checks"] = [q(word_t(7, "boîte")), q(VO[7]["start"] + VO[7]["words"][4]["start"]), q(VO[7]["start"] + VO[7]["words"][6]["start"])]
# CTA (short: the VO says "إلا بغيتي تكوموندي، صيفط لينا ميساج" and the end card carries the rest)
ev["cta.url"] = 27.25
ev["cta.message"] = q(word_t(8, "تكوموندي"))
ev["cta.socials"] = ev["cta.message"] + 0.1
ev["cta.wave"] = ev["cta.message"] + 0.25
# END CARD (compressed: starts at 28.0, final frame held from 29.0)
ev["end.city"] = 28.0
ev["end.typeStart"] = 28.15
ev["end.typeStep"] = 0.05
ev["end.icons"] = 28.5
ev["end.iconStep"] = 0.05
ev["end.tagline"] = 28.75
ev["end.wink"] = 28.85
ev["end.hold"] = HOLD_FROM

sfx = [("impact", 0.02, -6), ("blip_jump", ev["hook.botLand"], -14), ("stamp", ev["hook.text"], -12),
       ("whoosh", ev["hook.glasses"] - 0.2, -13), ("tap", ev["hook.glasses"] + 0.1, -10), ("blip_wink", ev["hook.glasses"] + 0.2, -13),
       ("riser_short", ev["hook.scan"] - 0.1, -16), ("shutter", ev["hook.camera"], -10), ("pop_big", ev["hook.casque"], -12),
       ("shine", ev["hook.ai"], -12), ("pop_big", ev["hook.ai"], -13)]
sfx += [("whoosh", end - 0.3, -9) for _, _, end in SCENES[:-2]]
sfx += [("impact", ev["intro.reveal"], -5), ("shine", ev["intro.name"], -14), ("stamp", ev["intro.dispo"], -11), ("pop", ev["intro.here"], -13)]
sfx += [("hit", ev["hl.reveal"], -9), ("shine", ev["hl.reveal"] + 0.3, -14), ("pop", ev["hl.colour"], -12), ("pop", ev["hl.classic"], -13),
        ("pop", ev["hl.elegant"], -13), ("pop_big", ev["hl.look"], -12)]
sfx += [("hit", ev["wf.reveal"], -9), ("pop", ev["wf.colour"], -12), ("stamp", ev["wf.icon"], -10), ("pop", ev["wf.matte"], -12)]
sfx += [("tap", ev["cam.cam"], -11), ("shutter", ev["cam.mp"], -8), ("pop_big", ev["cam.mp"] + 0.05, -14), ("blip_up", ev["cam.video"], -13),
        ("impact", ev["cam.k3"], -9)]
sfx += [("pop_big", ev["au.speakers"], -12), ("pop", ev["au.music"], -12), ("blip", ev["au.calls"], -12)]
sfx += [("pop_big", ev["bat.hours"], -10), ("blip_up", ev["bat.case"], -11), ("pop_big", ev["bat.more"], -11)]
sfx += [("hit", ev["trust.badge"], -8), ("blip_up", ev["trust.thumb"], -12)] + [("ding", t + 0.15, -12) for t in ev["trust.checks"]]
sfx += [("whoosh", 26.7, -10), ("pop_big", ev["cta.url"], -11), ("pop_big", ev["cta.message"], -11), ("pop", ev["cta.socials"] + 0.2, -13),
        ("blip", ev["cta.wave"], -13)]
sfx += [("whoosh", 27.7, -9), ("impact", ev["end.city"], -5)] + [("tick", ev["end.typeStart"] + i * ev["end.typeStep"], -12) for i in range(8)]
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
