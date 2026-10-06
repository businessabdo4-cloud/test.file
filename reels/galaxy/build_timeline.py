"""Timeline for the Samsung Galaxy Watch8 Classic / Ultra2 reel -> public/galaxy/data/timeline.json
(same schema as scripts/build_timeline.py; shared by the picture and the audio mix).
Scene cuts sit on the 120 BPM beat grid next to sentence breaks; hits land on the
half-beat nearest the word that triggers them."""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
PUB = ROOT / "public" / "galaxy"
VO = json.loads((PUB / "data" / "vo.json").read_text())
LINES = json.loads((ROOT / "reels" / "galaxy" / "vo_lines.json").read_text())
FPS, BPM = 30, 120
BEAT = 60 / BPM
TOTAL_FRAMES, HOLD_FROM = 900, 29.0
SCENES = [("hook", 0.0, 2.5), ("classic", 2.5, 9.5), ("ultra", 9.5, 13.0), ("specs", 13.0, 18.0),
          ("adventure", 18.0, 21.5), ("trust", 21.5, 24.5), ("cta", 24.5, 27.0), ("end", 27.0, 30.0)]


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
# HOOK - visual: Citybot jump + its face becomes a round Galaxy dial; written: tag, "Galaxy Watch" slam, models, stamp; verbal: line 1
ev["hook.botLand"] = 0.4
ev["hook.watchFace"] = 0.4
ev["hook.title"] = q(word_t(0, "Samsung"))
ev["hook.models"] = q(word_t(0, "watches"))
ev["hook.sweep"] = ev["hook.models"] + 0.25
ev["hook.stamp"] = q(word_t(0, "وصل"))
ev["hook.hop"] = q(word_t(0, "City"))
ev["hook.ultra"] = ev["hook.title"]
# CLASSIC
ev["classic.watch"] = 2.5
ev["classic.head"] = q(word_t(1, "Galaxy"))
ev["classic.bezel"] = q(word_t(1, "بالبيزيل"), BEAT)
ev["classic.clicks"] = [ev["classic.bezel"] + 0.5 * k for k in range(4)]
ev["classic.style"] = q(word_t(1, "ستايل"))
ev["classic.angle"] = q(word_t(1, "وأناقة"))
ev["classic.gemini"] = q(word_t(1, "Gemini"))
# ULTRA
ev["ultra.adventure"] = 9.5
ev["ultra.watch"] = q(word_t(2, "Galaxy"), BEAT)
ev["ultra.titanium"] = q(word_t(2, "تيتانيوم"))
# SPECS
ev["specs.screen"] = q(word_t(2, "شاشة"))
ev["specs.nits"] = q(word_t(2, "5000"))
ev["specs.battery"] = q(word_t(2, "60"))
ev["specs.charge"] = q(word_t(2, "وشارج"))
# ADVENTURE
ev["adv.dive"] = q(word_t(3, "كتغطس"))
ev["adv.run"] = q(word_t(3, "كتجري"))
ev["adv.everywhere"] = q(word_t(3, "وكتبقى"))
# TRUST
ev["trust.badge"] = q(word_t(4, "أوريجينال"))
ev["trust.original"] = q(word_t(4, "مية"))
ev["trust.thumb"] = ev["trust.original"]
ev["trust.store"] = q(word_t(4, "كاتسناك"))
# CTA
ev["cta.message"] = q(word_t(5, "ميساج"))
ev["cta.socials"] = ev["cta.message"] + 0.25
ev["cta.url"] = q(word_t(5, "citystore.ma"))
ev["cta.wave"] = ev["cta.socials"]
# END CARD (shared EndCard keys)
ev["end.city"] = 27.0
ev["end.typeStart"] = 27.25
ev["end.typeStep"] = 0.0625
ev["end.icons"] = 27.75
ev["end.iconStep"] = 0.083
ev["end.tagline"] = q(word_t(6, "الأصلي"))
ev["end.wink"] = 28.5
ev["end.hold"] = HOLD_FROM

sfx = [("impact", 0.0, -3), ("blip_jump", ev["hook.botLand"], -12), ("riser_short", ev["hook.title"] - 0.3, -14),
       ("hit", ev["hook.title"], -6), ("hit_small", ev["hook.models"], -8), ("shine", ev["hook.sweep"], -14),
       ("stamp", ev["hook.stamp"], -8), ("blip_jump", ev["hook.hop"] + 0.1, -13)]
sfx += [("whoosh", end - 0.3, -9) for _, _, end in SCENES[:-1]]
sfx += [("impact", ev["classic.watch"], -8), ("pop", ev["classic.head"], -13), ("pop", ev["classic.bezel"], -12)]
sfx += [("tick", t, -9) for t in ev["classic.clicks"]] + [("tick", t + 0.12, -13) for t in ev["classic.clicks"]]
sfx += [("pop", ev["classic.style"], -12), ("whoosh", ev["classic.angle"] - 0.15, -16), ("shine", ev["classic.angle"], -14),
        ("shine", ev["classic.gemini"], -12), ("blip", ev["classic.gemini"] + 0.2, -14)]
sfx += [("hit_small", ev["ultra.adventure"], -8), ("impact", ev["ultra.watch"], -6), ("pop", ev["ultra.titanium"], -12)]
sfx += [("pop", ev["specs.screen"], -13), ("riser_short", ev["specs.nits"] - 0.4, -14), ("hit", ev["specs.nits"], -8),
        ("pop_big", ev["specs.battery"], -10), ("blip_up", ev["specs.charge"], -11)]
sfx += [("pop_big", ev[k], -10) for k in ("adv.dive", "adv.run", "adv.everywhere")]
sfx += [("hit", ev["trust.badge"], -7), ("ding", ev["trust.original"] + 0.1, -11), ("blip_up", ev["trust.thumb"], -12),
        ("stamp", ev["trust.store"], -9)]
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
    "musicFirstDownbeat": 0.5,
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
