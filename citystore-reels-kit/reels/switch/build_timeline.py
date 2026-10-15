"""Timeline for the Nintendo Switch OLED reel -> public/switch/data/timeline.json
(same schema as scripts/build_timeline.py; shared by the picture and the audio mix).
Scene cuts sit on the 120 BPM beat grid next to sentence breaks; hits land on the
half-beat nearest the word that triggers them."""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
PUB = ROOT / "public" / "switch"
VO = json.loads((PUB / "data" / "vo.json").read_text())
LINES = json.loads((ROOT / "reels" / "switch" / "vo_lines.json").read_text())
FPS, BPM = 30, 120
BEAT = 60 / BPM
TOTAL_FRAMES, HOLD_FROM = 900, 29.0
SCENES = [("hook", 0.0, 2.0), ("intro", 2.0, 6.0), ("screen", 6.0, 10.5), ("modes", 10.5, 15.0),
          ("specs", 15.0, 19.0), ("joycon", 19.0, 22.0), ("trust", 22.0, 27.0), ("cta", 27.0, 28.0), ("end", 28.0, 30.0)]


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

# HOOK - the TV is taken ("OCCUPÉE"), then the Switch slams in on "هاهوا الحل!"
ev["hook.slam"] = 0.0
ev["hook.botLand"] = 0.3
ev["hook.tv"] = q(word_t(0, "التلفزة"))
ev["hook.play"] = q(word_t(0, "تلعب"))
ev["hook.solution"] = q(word_t(0, "هاهوا"))
# INTRO
ev["intro.name"] = q(word_t(1, "Nintendo"))
ev["intro.oled"] = q(word_t(1, "OLED"))
ev["intro.dispo"] = q(word_t(1, "disponible"))
ev["intro.black"] = q(word_t(1, "noir"))
ev["intro.white"] = q(word_t(1, "blanche"))
# SCREEN
ev["sc.size"] = q(word_t(2, "7"))
ev["sc.colours"] = q(word_t(2, "ألوان"))
ev["sc.contrast"] = q(word_t(2, "وكونطراست"))
ev["sc.inside"] = q(word_t(2, "كتحس"))
# MODES
ev["md.tv"] = q(word_t(3, "TV"))
ev["md.handheld"] = q(word_t(3, "portable"))
ev["md.table"] = q(nth(3, 6))  # "table" also matches inside "portable"
ev["md.switch"] = q(word_t(3, "فثانية"))
ev["md.resume"] = q(word_t(3, "وكتكمّل"))
# SPECS
ev["sp.storage"] = q(word_t(4, "64GB"))
ev["sp.stand"] = q(word_t(4, "support"))
ev["sp.audio"] = q(word_t(4, "وصوت"))
ev["sp.vs"] = q(word_t(4, "Switch"))
# JOY-CON
ev["jc.two"] = q(word_t(5, "Joy-Con"))
ev["jc.friend"] = q(word_t(5, "باش"))
# TRUST (shared checklist keys)
ev["trust.badge"] = 22.0
ev["trust.original"] = q(word_t(6, "originaux"))
ev["trust.thumb"] = ev["trust.original"]
ev["trust.checks"] = [q(word_t(6, "boîte")), q(nth(6, 4)), q(nth(6, 6))]
# CTA
ev["cta.url"] = 27.1
ev["cta.message"] = q(word_t(7, "تكوموندي"))
ev["cta.socials"] = ev["cta.message"] + 0.1
ev["cta.wave"] = ev["cta.message"] + 0.25
# END CARD
ev["end.city"] = 28.0
ev["end.typeStart"] = 28.15
ev["end.typeStep"] = 0.05
ev["end.icons"] = 28.5
ev["end.iconStep"] = 0.05
ev["end.tagline"] = 28.75
ev["end.wink"] = 28.85
ev["end.hold"] = HOLD_FROM

sfx = [("impact", 0.02, -6), ("blip_jump", ev["hook.botLand"], -14), ("stamp", ev["hook.tv"], -9), ("blip_wink", ev["hook.play"], -12),
       ("whoosh", ev["hook.solution"] - 0.2, -10), ("impact", ev["hook.solution"], -6)]
sfx += [("whoosh", end - 0.3, -9) for _, _, end in SCENES[:-3]]
sfx += [("hit", ev["intro.name"], -9), ("pop_big", ev["intro.oled"], -11), ("stamp", ev["intro.dispo"], -11), ("pop", ev["intro.black"], -12),
        ("pop", ev["intro.white"], -12)]
sfx += [("pop_big", ev["sc.size"], -11), ("shine", ev["sc.colours"], -12), ("hit_small", ev["sc.contrast"], -11), ("riser_short", ev["sc.inside"] - 0.1, -14)]
sfx += [("pop", ev["md.tv"], -11), ("pop", ev["md.handheld"], -11), ("pop", ev["md.table"], -11), ("whoosh", ev["md.switch"], -12),
        ("blip_up", ev["md.resume"], -12)]
sfx += [("pop_big", ev["sp.storage"], -11), ("tick", ev["sp.stand"], -9), ("tick", ev["sp.stand"] + 0.15, -10), ("pop_big", ev["sp.audio"], -11),
        ("shine", ev["sp.vs"], -14)]
sfx += [("pop_big", ev["jc.two"], -10), ("pop", ev["jc.two"] + 0.15, -11), ("blip_up", ev["jc.friend"], -12)]
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
