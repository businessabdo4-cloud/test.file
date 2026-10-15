"""Timeline for the PlayStation Disc Drive reel -> public/shokz/data/timeline.json
(30 s; full VO fits at natural speed after pause trimming)
(same schema as scripts/build_timeline.py; shared by the picture and the audio mix).
Scene cuts sit on the 120 BPM beat grid next to sentence breaks; hits land on the
half-beat nearest the word that triggers them."""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
PUB = ROOT / "public" / "disc"
VO = json.loads((PUB / "data" / "vo.json").read_text())
LINES = json.loads((ROOT / "reels" / "disc" / "vo_lines.json").read_text())
FPS, BPM = 30, 120
BEAT = 60 / BPM
TOTAL_FRAMES, HOLD_FROM = 900, 29.0
SCENES = [("hook", 0.0, 4.5), ("intro", 4.5, 7.5), ("install", 7.5, 12.75), ("used", 12.75, 16.75), ("bluray", 16.75, 20.75),
          ("trust", 20.75, 25.0), ("cta", 25.0, 27.75), ("end", 27.75, 30.0)]


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

# HOOK - a digital console (no disc slot): the game disc bounces off; "here's the fix!" the drive snaps in
ev["hook.slam"] = 0.0
ev["hook.botLand"] = 0.3
ev["hook.console"] = q(word_t(0, "PS5"))
ev["hook.pro"] = q(word_t(0, "Pro"))
ev["hook.cd"] = q(word_t(0, "CD"))
ev["hook.fix"] = q(word_t(0, "هاهوا"))
# INTRO
ev["intro.name"] = q(word_t(1, "PlayStation"))
ev["intro.dispo"] = q(word_t(1, "disponible"))
# INSTALL + PS5/PS4 discs
ev["in.snap"] = q(word_t(2, "كتركبو"))
ev["in.sec"] = q(word_t(2, "فثانية"))
ev["in.read"] = q(word_t(2, "تقرا"))
ev["in.ps5"] = q(word_t(2, "PS5"))
ev["in.ps4"] = q(word_t(2, "PS4"))
# USED GAMES
ev["us.used"] = q(word_t(3, "مستعملين"))
ev["us.cheap"] = q(word_t(3, "أرخص"))
ev["us.swap"] = q(word_t(3, "وتبدّلهم"))
ev["us.friends"] = q(word_t(3, "صحابك"))
# BLU-RAY 4K
ev["br.bd"] = q(word_t(4, "Blu-ray"))
ev["br.k"] = q(word_t(4, "4K"))
ev["br.movies"] = q(word_t(4, "فالأفلام"))
ev["br.best"] = q(word_t(4, "جودة"))
# TRUST
ev["trust.badge"] = 20.75
ev["trust.original"] = q(word_t(5, "originaux"))
ev["trust.thumb"] = ev["trust.original"]
ev["trust.checks"] = [q(word_t(5, "boîte")), q(nth(5, 4)), q(nth(5, 6))]
# CTA
ev["cta.url"] = 25.1
ev["cta.message"] = q(word_t(6, "تكوموندي"))
ev["cta.socials"] = ev["cta.message"] + 0.1
ev["cta.wave"] = ev["cta.message"] + 0.25
# END CARD
ev["end.city"] = 27.75
ev["end.typeStart"] = 27.9
ev["end.typeStep"] = 0.05
ev["end.icons"] = 28.25
ev["end.iconStep"] = 0.05
ev["end.tagline"] = 28.5
ev["end.wink"] = 28.7
ev["end.hold"] = HOLD_FROM

sfx = [("blip_jump", ev["hook.botLand"], -14), ("pop_big", ev["hook.console"], -11), ("pop", ev["hook.pro"], -12), ("whoosh", ev["hook.cd"] - 0.15, -11),
       ("hit", ev["hook.cd"] + 0.25, -9), ("impact", ev["hook.fix"], -7), ("shine", ev["hook.fix"] + 0.2, -13)]
sfx += [("whoosh", end - 0.3, -9) for _, _, end in SCENES[:-3]]
sfx += [("impact", ev["intro.name"], -6), ("shine", ev["intro.name"] + 0.2, -14), ("stamp", ev["intro.dispo"], -11)]
sfx += [("whoosh", ev["in.snap"], -12), ("stamp", ev["in.snap"] + 0.4, -9), ("ding", ev["in.sec"], -12), ("pop", ev["in.read"], -12), ("pop_big", ev["in.ps5"], -10), ("pop_big", ev["in.ps4"], -10)]
sfx += [("pop", ev["us.used"], -12), ("blip_up", ev["us.cheap"], -12), ("whoosh", ev["us.swap"], -12), ("pop", ev["us.friends"], -12)]
sfx += [("pop_big", ev["br.bd"], -10), ("impact", ev["br.k"], -8), ("pop", ev["br.movies"], -12), ("shine", ev["br.best"], -12)]
sfx += [("hit", ev["trust.badge"], -8), ("blip_up", ev["trust.thumb"], -12)] + [("ding", t + 0.15, -12) for t in ev["trust.checks"]]
sfx += [("whoosh", 24.7, -10), ("pop_big", ev["cta.url"], -11), ("pop_big", ev["cta.message"], -11), ("pop", ev["cta.socials"] + 0.2, -13),
        ("blip", ev["cta.wave"], -13)]
sfx += [("whoosh", 27.45, -9), ("impact", ev["end.city"], -5)] + [("tick", ev["end.typeStart"] + i * ev["end.typeStep"], -12) for i in range(8)]
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
