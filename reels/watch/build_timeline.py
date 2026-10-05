"""Timeline for the Apple Watch Ultra 4 reel -> public/watch/data/timeline.json
(same schema as scripts/build_timeline.py; shared by the picture and the audio mix).
Scene cuts sit on the 120 BPM beat grid next to sentence breaks; hits land on the
half-beat nearest the word that triggers them."""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
PUB = ROOT / "public" / "watch"
VO = json.loads((PUB / "data" / "vo.json").read_text())
LINES = json.loads((ROOT / "reels" / "watch" / "vo_lines.json").read_text())
FPS, BPM = 30, 120
BEAT = 60 / BPM
TOTAL_FRAMES, HOLD_FROM = 900, 29.0
SCENES = [("hook", 0.0, 3.0), ("hero", 3.0, 8.0), ("features", 8.0, 17.0), ("health", 17.0, 19.5),
          ("trust", 19.5, 24.0), ("cta", 24.0, 26.5), ("end", 26.5, 30.0)]


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
# HOOK - visual: Citybot jump + face turns into a watch face; written: "الجديد" tag, stamp, title slam; verbal: line 1
ev["hook.botLand"] = 0.4
ev["hook.watchFace"] = 0.4
ev["hook.hop"] = q(word_t(0, "City"))
ev["hook.stamp"] = q(word_t(0, "City"))
ev["hook.title"] = q(word_t(1, "Apple"))
ev["hook.ultra"] = q(word_t(1, "Ultra"))
ev["hook.sweep"] = ev["hook.ultra"] + 0.25
# HERO
ev["hero.watch"] = 3.0
ev["hero.size"] = 3.25
ev["hero.titanium"] = q(word_t(1, "تيتانيوم"))
ev["hero.band"] = q(word_t(1, "البراسلي"))
ev["hero.sparkle"] = q(word_t(1, "كيحمّق"))
# FEATURES
ev["feat.sapphire"] = 8.25
ev["feat.battery"] = q(word_t(2, "وباطري"))
ev["feat.gps"] = q(word_t(3, "GPS"), BEAT)
ev["feat.nosignal"] = q(word_t(3, "فبلاصة"))
ev["feat.sos"] = q(word_t(3, "SOS"))
# HEALTH
ev["health.heart"] = q(word_t(4, "قلبك"))
ev["health.health"] = q(word_t(4, "وصحتك"))
ev["health.day"] = q(word_t(4, "نهار"))
ev["health.night"] = q(word_t(4, "وليل"))
# TRUST
ev["trust.badge"] = 19.75
ev["trust.original"] = q(word_t(5, "original"), BEAT)
ev["trust.thumb"] = ev["trust.original"]
ev["trust.checks"] = [q(word_t(5, "boîte")), q(VO[5]["start"] + VO[5]["words"][4]["start"]), q(VO[5]["start"] + VO[5]["words"][6]["start"])]
# CTA
ev["cta.phone"] = 24.0
ev["cta.message"] = q(word_t(6, "ميساج"))
ev["cta.socials"] = ev["cta.message"] + 0.25
ev["cta.url"] = q(word_t(6, "citystore.ma"))
ev["cta.wave"] = 25.0
# END CARD (same keys as the iPhone reel -> shared EndCard)
ev["end.city"] = 26.5
ev["end.typeStart"] = 27.0
ev["end.typeStep"] = 0.0625
ev["end.icons"] = 27.5
ev["end.iconStep"] = 0.083
ev["end.tagline"] = q(word_t(7, "الأصلي"))
ev["end.wink"] = 28.5
ev["end.hold"] = HOLD_FROM

sfx = [("impact", 0.0, -3), ("blip_jump", ev["hook.botLand"], -12), ("stamp", ev["hook.stamp"], -8),
       ("blip_jump", ev["hook.hop"] + 0.1, -13), ("riser_short", ev["hook.title"] - 0.3, -14), ("hit", ev["hook.title"], -6),
       ("hit_small", ev["hook.ultra"], -7), ("shine", ev["hook.sweep"], -14)]
sfx += [("whoosh", end - 0.3, -9) for _, _, end in SCENES[:-1]]
sfx += [("impact", ev["hero.watch"], -8), ("pop", ev["hero.size"], -12), ("pop", ev["hero.titanium"], -12),
        ("pop", ev["hero.band"], -12), ("shine", ev["hero.sparkle"], -12), ("blip", ev["hero.watch"] + 0.3, -14)]
sfx += [("pop_big", ev[k], -11) for k in ("feat.sapphire", "feat.battery", "feat.gps")]
sfx += [("tick", ev["feat.nosignal"] + i * 0.12, -14) for i in range(3)] + [("pop_big", ev["feat.sos"], -10), ("blip_up", ev["feat.sos"] + 0.25, -14)]
sfx += [("hit_small", ev["health.heart"], -9), ("hit_small", ev["health.heart"] + 0.5, -14), ("pop", ev["health.health"], -12),
        ("pop", ev["health.day"], -13), ("pop", ev["health.night"], -13)]
sfx += [("hit", ev["trust.badge"], -7), ("blip_up", ev["trust.thumb"], -11)] + [("ding", t + 0.15, -12) for t in ev["trust.checks"]]
sfx += [("pop_big", ev["cta.message"], -11), ("pop", ev["cta.socials"], -13), ("pop", ev["cta.socials"] + 0.25, -13),
        ("pop_big", ev["cta.url"], -10), ("blip", ev["cta.wave"], -12)]
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
    "musicFirstDownbeat": 1.0,
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
