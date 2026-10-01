"""Builds public/data/timeline.json, the single source of timing for visuals AND the audio mix.

Everything is placed on the music beat grid (BPM below, must match the music track):
scene cuts land on beats, text hits / gestures land on the nearest half-beat to the word
that triggers them (word timings come from public/data/vo.json).
"""
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
VO = json.loads((ROOT / "public" / "data" / "vo.json").read_text())
FPS = 30
BPM = 120
BEAT = 60 / BPM
TOTAL_FRAMES = 900  # hard 30.0 s cap
HOLD_FROM = 29.0  # final frame is held from here

SCENES = [  # seconds, all on beats
    ("hook", 0.0, 3.5),
    ("hero", 3.5, 9.5),
    ("ecosystem", 9.5, 15.5),
    ("trust", 15.5, 20.0),
    ("cta", 20.0, 26.0),
    ("end", 26.0, 30.0),
]


def f(t):
    return int(round(t * FPS))


def q(t, grid=BEAT / 2):
    return round(round(t / grid) * grid, 4)


def word_t(line_idx, needle):
    line = VO[line_idx]
    for w in line["words"]:
        if needle.lower() in w["word"].lower():
            return line["start"] + w["start"]
    raise KeyError(f"{needle!r} not in {line['id']}")


# ---------------------------------------------------------------- events (seconds)
ev = {}
# HOOK - visual hook (bot jump + face flash + burst), written hook (titles), verbal hook (VO line 1)
ev["hook.botPop"] = 0.0
ev["hook.botLand"] = 0.4
ev["hook.title"] = max(0.25, q(word_t(0, "iPhone")))
ev["hook.sweep"] = ev["hook.title"] + 0.5
ev["hook.proMax"] = q(word_t(0, "Max") - 0.1)
ev["hook.stamp"] = q(word_t(0, "chez"))
ev["hook.hop"] = q(word_t(0, "City"))
# HERO
ev["hero.phones"] = 3.5
ev["hero.drop"] = 4.0
ev["hero.swatches"] = q(word_t(1, "design"))
ev["hero.camera"] = q(word_t(1, "photo"))
ev["hero.chip"] = q(word_t(1, "performances"))
ev["hero.display"] = 6.0  # held long enough to read before the lineup lands
ev["hero.colourCycle"] = [4.5, 5.5, 6.5]  # Pro Max pair colour changes (one per bar)
ev["hero.lineup"] = 7.0  # iPhone 18 Pro four-colour lineup
ev["hero.spot"] = [7.5, 8.0, 8.5, 9.0]  # spotlight Black, Silver, Glacier, Burgundy
# ECOSYSTEM - one card per spoken category, on the beat
cards, prev = [], 9.5
for needle in ["laptops", "montres", "casques", "consoles", "caméras"]:
    t = max(q(word_t(2, needle), BEAT), prev + BEAT)
    cards.append(t)
    prev = t
ev["eco.cards"] = cards
ev["eco.recap"] = max(prev + 2 * BEAT, 13.5)
# TRUST
ev["trust.badge"] = q(word_t(3, "100"), BEAT)
ev["trust.check"] = ev["trust.badge"] + 0.25
ev["trust.original"] = q(word_t(3, "original"))
ev["trust.thumb"] = ev["trust.original"]
ev["trust.sparkle"] = ev["trust.original"] + 0.5
# CTA
ev["cta.phone"] = 20.0
ev["cta.url"] = q(word_t(4, "citystore.ma"))
ev["cta.wave"] = q(word_t(4, "écrivez"))
ev["cta.instagram"] = q(word_t(4, "Instagram"))
ev["cta.facebook"] = q(word_t(4, "Facebook"))
ev["cta.tap"] = 24.5
# END CARD
ev["end.city"] = 26.0
ev["end.typeStart"] = 26.5
ev["end.typeStep"] = 0.125
ev["end.icons"] = 27.5
ev["end.iconStep"] = 0.125
ev["end.wink"] = 28.5
ev["end.hold"] = HOLD_FROM

# ---------------------------------------------------------------- sfx cues
sfx = [("impact", 0.0, -3), ("riser_short", ev["hook.title"] - 0.25, -14), ("hit", ev["hook.title"], -6),
       ("blip_jump", ev["hook.botLand"], -12), ("shine", ev["hook.sweep"], -14), ("hit_small", ev["hook.proMax"], -10),
       ("stamp", ev["hook.stamp"], -8), ("blip_jump", ev["hook.hop"], -12)]
for name, _, end in SCENES[:-1]:
    sfx.append(("whoosh", end - 0.3, -9))
sfx += [("impact", ev["hero.drop"], -8), ("pop", ev["hero.swatches"], -14), ("shutter", ev["hero.camera"], -10),
        ("pop", ev["hero.chip"], -12), ("pop", ev["hero.display"], -12), ("blip", ev["hero.camera"] - 0.25, -14),
        ("hit_small", ev["hero.lineup"], -9), ("shine", ev["hero.lineup"] + 0.1, -14)]
sfx += [("pop", t, -13) for t in ev["hero.spot"]]
sfx += [("pop_big", t, -10) for t in ev["eco.cards"]] + [("shine", ev["eco.recap"], -14)]
sfx += [("hit", ev["trust.badge"], -6), ("ding", ev["trust.check"] + 0.25, -10), ("blip_up", ev["trust.thumb"], -11),
        ("shine", ev["trust.sparkle"], -13)]
sfx += [("pop", ev["cta.url"], -12), ("pop_big", ev["cta.instagram"], -11), ("pop_big", ev["cta.facebook"], -11),
        ("blip", ev["cta.wave"], -12), ("tap", ev["cta.tap"], -8)]
sfx += [("impact", ev["end.city"], -5)]
sfx += [("tick", ev["end.typeStart"] + i * ev["end.typeStep"], -12) for i in range(8)]
sfx += [("pop", ev["end.icons"] + i * ev["end.iconStep"], -15) for i in range(6)]
sfx += [("blip_wink", ev["end.wink"], -11)]

# ---------------------------------------------------------------- subtitle chunks
MAX_CHARS = 34


LINES = json.loads((ROOT / "scripts" / "vo_lines.json").read_text())


def chunk_line(line, explicit=None):
    """Explicit chunk breaks from vo_lines.json when given, else greedy by MAX_CHARS."""
    words = line["words"]
    chunks, cur = [], []
    if explicit:
        i = 0
        for text in explicit:
            n = len(text.split())
            # words.json merges stray punctuation into the previous word, so match by text
            c = []
            while i < len(words) and len(" ".join(x["word"] for x in c).split()) < n:
                c.append(words[i])
                i += 1
            chunks.append(c)
    else:
        for w in words:
            text = " ".join(x["word"] for x in cur + [w])
            if cur and len(text) > MAX_CHARS:
                chunks.append(cur)
                cur = []
            cur.append(w)
        if cur:
            chunks.append(cur)
    out = []
    for c in chunks:
        out.append({
            "text": " ".join(x["word"] for x in c),
            "start": round(line["start"] + c[0]["start"], 3),
            "end": round(line["start"] + c[-1]["end"], 3),
            "words": [{"word": x["word"], "start": round(line["start"] + x["start"], 3)} for x in c],
        })
    # keep each chunk on screen until the next one (or the end of the line + 0.4 s)
    for i, c in enumerate(out):
        c["end"] = round(out[i + 1]["start"] if i + 1 < len(out) else c["end"] + 0.4, 3)
    return out


subs = []
for li, line in enumerate(VO):
    slot_end = SCENES[li][2]
    for c in chunk_line(line, LINES[li].get("chunks")):
        c["end"] = min(c["end"], slot_end - 0.05)
        c["line"] = li
        subs.append(c)

timeline = {
    "fps": FPS,
    "bpm": BPM,
    "beatFrames": BEAT * FPS,
    "totalFrames": TOTAL_FRAMES,
    "holdFrom": f(HOLD_FROM),
    "scenes": [{"id": n, "from": f(a), "to": f(b)} for n, a, b in SCENES],
    "events": {k: ([f(x) for x in v] if isinstance(v, list) else (v if k.endswith("Step") else f(v))) for k, v in ev.items()},
    "eventsSec": ev,
    "sfx": [{"name": n, "t": round(t, 3), "gainDb": g} for n, t, g in sorted(sfx, key=lambda s: s[1])],
    "subtitles": [{**s, "from": f(s["start"]), "to": f(s["end"]),
                   "words": [{**w, "frame": f(w["start"])} for w in s["words"]]} for s in subs],
    "vo": [{"id": l["id"], "from": f(l["start"]), "start": l["start"], "duration": l["duration"],
            "mouthCues": l["mouthCues"]} for l in VO],
}
assert all(s["to"] <= TOTAL_FRAMES for s in timeline["scenes"])
assert all(l["start"] + l["duration"] <= SCENES[i][2] for i, l in enumerate(VO)), "VO overruns its scene"
(ROOT / "public" / "data" / "timeline.json").write_text(json.dumps(timeline, ensure_ascii=False, indent=1) + "\n")
for s in timeline["subtitles"]:
    print(f'{s["start"]:6.2f}-{s["end"]:6.2f}  {s["text"]}')
print({k: v for k, v in ev.items() if not k.startswith("end.")})
