"""Timeline for the Meta Quest 3 (512GB) reel -> public/shokz/data/timeline.json
(38.5 s: standing user approval to go over 30 s to keep the full VO at natural speed)
(same schema as scripts/build_timeline.py; shared by the picture and the audio mix).
Scene cuts sit on the 120 BPM beat grid next to sentence breaks; hits land on the
half-beat nearest the word that triggers them."""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
PUB = ROOT / "public" / "quest"
VO = json.loads((PUB / "data" / "vo.json").read_text())
LINES = json.loads((ROOT / "reels" / "quest" / "vo_lines.json").read_text())
FPS, BPM = 30, 120
BEAT = 60 / BPM
TOTAL_FRAMES, HOLD_FROM = 1155, 37.5
SCENES = [("hook", 0.0, 3.25), ("intro", 3.25, 7.75), ("screen", 7.75, 12.5), ("mixed", 12.5, 17.75), ("all", 17.75, 23.75),
          ("storage", 23.75, 28.25), ("trust", 28.25, 32.5), ("cta", 32.5, 35.25), ("end", 35.25, 38.5)]


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

# HOOK - a game on a TV bursts out around you ("get INTO the game, not just watch it on TV")
ev["hook.slam"] = 0.0
ev["hook.botLand"] = 0.3
ev["hook.enter"] = q(word_t(0, "تدخل"))
ev["hook.game"] = q(word_t(0, "اللعبة"))
ev["hook.tv"] = q(word_t(0, "فالتلفزة"))
# INTRO
ev["intro.name"] = q(word_t(1, "Meta"))
ev["intro.gb"] = q(word_t(1, "512"))
ev["intro.dispo"] = q(word_t(1, "disponible"))
# 4K+ SCREEN
ev["sc.k"] = q(word_t(2, "4K+"))
ev["sc.clear"] = q(word_t(2, "واضحة"))
ev["sc.feel"] = q(word_t(2, "وكتحس"))
ev["sc.inside"] = q(word_t(2, "داخل"))
# MIXED REALITY
ev["mx.title"] = q(word_t(3, "réalité"))
ev["mx.room"] = q(word_t(3, "الدار"))
ev["mx.color"] = q(word_t(3, "بالألوان"))
ev["mx.game"] = q(word_t(3, "واللعبة"))
ev["mx.front"] = q(word_t(3, "قدامك"))
# ALL-IN-ONE
ev["all.games"] = q(word_t(4, "جيمز"))
ev["all.movies"] = q(word_t(4, "أفلام"))
ev["all.sport"] = q(word_t(4, "رياضة"))
ev["all.work"] = q(word_t(4, "الخدمة"))
ev["all.one"] = q(word_t(4, "كلشي"))
ev["all.pc"] = q(word_t(4, "PC"))
ev["all.wire"] = q(word_t(4, "fils"))
# STORAGE
ev["st.title"] = q(word_t(5, "stockage"))
ev["st.gb"] = q(word_t(5, "512"))
ev["st.room"] = q(word_t(5, "بلاصة"))
ev["st.games"] = q(word_t(5, "الجيمز"))
# TRUST
ev["trust.badge"] = 28.25
ev["trust.original"] = q(word_t(6, "originaux"))
ev["trust.thumb"] = ev["trust.original"]
ev["trust.checks"] = [q(word_t(6, "boîte")), q(nth(6, 4)), q(nth(6, 6))]
# CTA
ev["cta.url"] = 32.6
ev["cta.message"] = q(word_t(7, "تكوموندي"))
ev["cta.socials"] = ev["cta.message"] + 0.1
ev["cta.wave"] = ev["cta.message"] + 0.25
# END CARD
ev["end.city"] = 35.25
ev["end.typeStart"] = 35.5
ev["end.typeStep"] = 0.0625
ev["end.icons"] = 36.1
ev["end.iconStep"] = 0.06
ev["end.tagline"] = 36.5
ev["end.wink"] = 36.75
ev["end.hold"] = HOLD_FROM

sfx = [("blip_jump", ev["hook.botLand"], -14), ("riser_short", ev["hook.enter"], -13), ("impact", ev["hook.game"], -8), ("whoosh", ev["hook.game"] + 0.1, -10),
       ("hit", ev["hook.tv"], -11)]
sfx += [("whoosh", end - 0.3, -9) for _, _, end in SCENES[:-3]]
sfx += [("impact", ev["intro.name"], -6), ("shine", ev["intro.name"] + 0.2, -14), ("stamp", ev["intro.gb"], -10), ("stamp", ev["intro.dispo"], -11)]
sfx += [("pop_big", ev["sc.k"], -9), ("shine", ev["sc.clear"], -13), ("pop", ev["sc.feel"], -12), ("riser_short", ev["sc.inside"] - 0.1, -15)]
sfx += [("pop_big", ev["mx.title"], -11), ("pop", ev["mx.room"], -12), ("shine", ev["mx.color"], -12), ("pop_big", ev["mx.game"], -11), ("blip_up", ev["mx.front"], -13)]
sfx += [("pop", ev["all.games"], -12), ("pop", ev["all.movies"], -12), ("pop", ev["all.sport"], -12), ("pop", ev["all.work"], -12), ("stamp", ev["all.one"], -10),
        ("hit", ev["all.pc"], -11), ("hit", ev["all.wire"], -11)]
sfx += [("pop_big", ev["st.title"], -11), ("pop_big", ev["st.gb"], -9), ("blip_up", ev["st.room"], -13), ("ding", ev["st.games"], -12)]
sfx += [("hit", ev["trust.badge"], -8), ("blip_up", ev["trust.thumb"], -12)] + [("ding", t + 0.15, -12) for t in ev["trust.checks"]]
sfx += [("whoosh", 32.2, -10), ("pop_big", ev["cta.url"], -11), ("pop_big", ev["cta.message"], -11), ("pop", ev["cta.socials"] + 0.2, -13),
        ("blip", ev["cta.wave"], -13)]
sfx += [("whoosh", 34.95, -9), ("impact", ev["end.city"], -5)] + [("tick", ev["end.typeStart"] + i * ev["end.typeStep"], -12) for i in range(8)]
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
