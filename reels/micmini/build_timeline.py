"""Timeline for the DJI Mic Mini 2 reel -> public/micmini/data/timeline.json
(same schema as scripts/build_timeline.py; shared by the picture and the audio mix).
Scene cuts sit on the 120 BPM beat grid next to sentence breaks; hits land on the
half-beat nearest the word that triggers them."""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
PUB = ROOT / "public" / "micmini"
VO = json.loads((PUB / "data" / "vo.json").read_text())
LINES = json.loads((ROOT / "reels" / "micmini" / "vo_lines.json").read_text())
FPS, BPM = 30, 120
BEAT = 60 / BPM
TOTAL_FRAMES, HOLD_FROM = 900, 29.0
SCENES = [("hook", 0.0, 1.5), ("intro", 1.5, 6.5), ("size", 6.5, 10.5), ("audio", 10.5, 14.75),
          ("battery", 14.75, 19.25), ("connect", 19.25, 23.5), ("trust", 23.5, 27.0), ("cta", 27.0, 28.0), ("end", 28.0, 30.0)]


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

# HOOK - a distorted, noisy waveform + "الصوت خايب؟"
ev["hook.slam"] = 0.0
ev["hook.botLand"] = 0.3
ev["hook.bad"] = q(word_t(0, "خايب"))
# INTRO - the mic next to a finger-size ruler, then the name
ev["intro.mic"] = 1.5
ev["intro.finger"] = q(word_t(1, "الصبع"))
ev["intro.change"] = q(word_t(1, "يبدّل"))
ev["intro.name"] = q(word_t(1, "DJI"))
ev["intro.dispo"] = q(word_t(1, "disponible"))
# SIZE
ev["sz.small"] = q(word_t(2, "صغير"))
ev["sz.grams"] = q(word_t(2, "11"))
ev["sz.clip"] = q(word_t(2, "كتلصقو"))
ev["sz.hidden"] = q(word_t(2, "كيبانش"))
# AUDIO
ev["au.bit"] = q(word_t(3, "24-bit"))
ev["au.nc"] = q(word_t(3, "noise"))
ev["au.street"] = q(word_t(3, "الزنقة"))
ev["au.wind"] = q(word_t(3, "والريح"))
# BATTERY
ev["bat.tx"] = q(word_t(4, "11.5"))
ev["bat.case"] = q(word_t(4, "48"))
ev["bat.box"] = q(word_t(4, "boîte"))
# CONNECT
ev["cn.phone"] = q(word_t(5, "كيتكونيكطا"))
ev["cn.direct"] = q(word_t(5, "direct"))
ev["cn.pocket"] = q(word_t(5, "Pocket"))
ev["cn.action"] = q(word_t(5, "Action"))
ev["cn.norx"] = q(word_t(5, "بلا"))
# TRUST
ev["trust.badge"] = 23.5
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

sfx = [("crowd", 0.0, -16), ("bus", 0.1, -17), ("blip_jump", ev["hook.botLand"], -14), ("stamp", ev["hook.bad"], -9)]
sfx += [("whoosh", end - 0.3, -9) for _, _, end in SCENES[:-3]]
sfx += [("anc", ev["intro.mic"] - 0.05, -11), ("impact", ev["intro.mic"], -6), ("pop_big", ev["intro.finger"], -11), ("riser_short", ev["intro.change"] - 0.1, -14),
        ("hit", ev["intro.name"], -9), ("shine", ev["intro.name"] + 0.2, -14), ("stamp", ev["intro.dispo"], -11)]
sfx += [("pop", ev["sz.small"], -12), ("pop_big", ev["sz.grams"], -10), ("tap", ev["sz.clip"], -10), ("blip_wink", ev["sz.hidden"], -12)]
sfx += [("pop_big", ev["au.bit"], -11), ("anc", ev["au.nc"], -11), ("pop", ev["au.street"], -12), ("pop", ev["au.wind"], -12)]
sfx += [("pop_big", ev["bat.tx"], -10), ("impact", ev["bat.case"], -9), ("blip_up", ev["bat.box"], -12)]
sfx += [("blip", ev["cn.phone"], -12), ("pop_big", ev["cn.direct"], -11), ("pop", ev["cn.pocket"], -11), ("pop", ev["cn.action"], -11), ("stamp", ev["cn.norx"], -10)]
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
