"""Timeline for the DJI Osmo Pocket 4 / Pocket 3 Creator Combo reel -> public/osmo/data/timeline.json
(56 s: the user approved going over 30 s for this reel to keep the full VO)
(same schema as scripts/build_timeline.py; shared by the picture and the audio mix).
Scene cuts sit on the 120 BPM beat grid next to sentence breaks; hits land on the
half-beat nearest the word that triggers them."""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
PUB = ROOT / "public" / "osmo"
VO = json.loads((PUB / "data" / "vo.json").read_text())
LINES = json.loads((ROOT / "reels" / "osmo" / "vo_lines.json").read_text())
FPS, BPM = 30, 120
BEAT = 60 / BPM
TOTAL_FRAMES, HOLD_FROM = 1680, 55.0
SCENES = [("hook", 0.0, 4.0), ("intro", 4.0, 10.0), ("p4", 10.0, 15.5), ("p4more", 15.5, 23.0),
          ("battery", 23.0, 28.0), ("p3", 28.0, 34.0), ("combo", 34.0, 41.5), ("stab", 41.5, 47.5),
          ("trust", 47.5, 51.5), ("cta", 51.5, 53.0), ("end", 53.0, 56.0)]


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
def nth(li, k):  # absolute time of the k-th word of line li
    return VO[li]["start"] + VO[li]["words"][k]["start"]

# HOOK - "still filming with your phone?": shaky phone footage, then the Osmo slams in on "هاد الفيديو ليك!"
ev["hook.slam"] = 0.0
ev["hook.botLand"] = 0.3
ev["hook.creator"] = q(word_t(0, "content"))
ev["hook.phone"] = q(word_t(0, "بالتيليفون"))
ev["hook.you"] = q(word_t(0, "الفيديو"))
# INTRO - both products
ev["intro.p4"] = q(word_t(1, "Osmo"))
ev["intro.p3"] = q(nth(1, 5))
ev["intro.dispo"] = q(word_t(1, "disponibles"))
ev["intro.here"] = q(word_t(1, "عندنا"))
# POCKET 4
ev["p4.name"] = q(word_t(2, "DJI"))
ev["p4.sensor"] = q(word_t(2, "capteur"))
ev["p4.k4"] = q(word_t(2, "4K"))
ev["p4.fps"] = q(word_t(2, "240fps"))
ev["p4.zoom"] = q(word_t(2, "zoom"))
ev["p4.photo"] = q(word_t(2, "37MP"))
ev["p4.storage"] = q(word_t(2, "stockage"))
ev["p4.gb"] = q(word_t(2, "107GB"))
ev["p4.card"] = q(word_t(2, "carte"))
# BATTERY (Pocket 4)
ev["bat.min"] = q(word_t(3, "240"))
ev["bat.charge"] = q(word_t(3, "وكتشارجي"))
ev["bat.32"] = q(word_t(3, "32"))
ev["bat.rapid"] = q(word_t(3, "charge"))
# POCKET 3 CREATOR COMBO
ev["p3.name"] = 28.0
ev["p3.sensor"] = q(word_t(4, "capteur"))
ev["p3.k4"] = q(word_t(4, "4K"))
ev["p3.fps"] = q(word_t(4, "120fps"))
ev["cb.mic"] = q(word_t(4, "micro"))
ev["cb.wide"] = q(word_t(4, "objectif"))
ev["cb.handle"] = q(word_t(4, "poignée"))
ev["cb.tripod"] = q(word_t(4, "mini"))
ev["cb.all"] = q(word_t(4, "كلشي"))
# STABILISATION
ev["st.name"] = q(word_t(5, "Stabilisation"))
ev["st.axes"] = q(word_t(5, "axes"))
ev["st.walk"] = q(word_t(5, "كتمشي"))
ev["st.run"] = q(word_t(5, "كتجري"))
ev["st.ride"] = q(word_t(5, "راكب"))
ev["st.steady"] = q(word_t(5, "ثابت"))
# TRUST (shared checklist keys)
ev["trust.badge"] = 47.5
ev["trust.original"] = q(word_t(6, "originaux"))
ev["trust.thumb"] = ev["trust.original"]
ev["trust.checks"] = [q(word_t(6, "boîte")), q(nth(6, 4)), q(nth(6, 6))]
# CTA
ev["cta.url"] = 51.75
ev["cta.message"] = q(word_t(7, "تكوموندي"))
ev["cta.socials"] = ev["cta.message"] + 0.1
ev["cta.wave"] = ev["cta.message"] + 0.25
# END CARD (final frame held from 55.0)
ev["end.city"] = 53.0
ev["end.typeStart"] = 53.25
ev["end.typeStep"] = 0.0625
ev["end.icons"] = 53.85
ev["end.iconStep"] = 0.06
ev["end.tagline"] = 54.4
ev["end.wink"] = 54.7
ev["end.hold"] = HOLD_FROM

sfx = [("impact", 0.02, -6), ("blip_jump", ev["hook.botLand"], -14), ("pop", ev["hook.creator"], -12), ("shutter", ev["hook.phone"], -12),
       ("whoosh", ev["hook.you"] - 0.2, -11), ("impact", ev["hook.you"], -7), ("stamp", ev["hook.you"] + 0.1, -12)]
sfx += [("whoosh", end - 0.3, -9) for _, _, end in SCENES[1:-2]]
sfx += [("hit", ev["intro.p4"], -9), ("hit", ev["intro.p3"], -9), ("stamp", ev["intro.dispo"], -11), ("pop", ev["intro.here"], -13)]
sfx += [("impact", ev["p4.name"], -7), ("shine", ev["p4.name"] + 0.3, -14), ("pop_big", ev["p4.sensor"], -11), ("pop", ev["p4.k4"], -11),
        ("impact", ev["p4.fps"], -9)]
sfx += [("blip_up", ev["p4.zoom"], -12), ("shutter", ev["p4.photo"], -9), ("pop_big", ev["p4.storage"], -12), ("pop_big", ev["p4.gb"], -10),
        ("hit_small", ev["p4.card"], -10)]
sfx += [("pop_big", ev["bat.min"], -10), ("blip_up", ev["bat.charge"], -12), ("pop_big", ev["bat.32"], -11), ("shine", ev["bat.rapid"], -13)]
sfx += [("impact", ev["p3.name"], -7), ("shine", ev["p3.name"] + 0.3, -14), ("pop_big", ev["p3.sensor"], -11), ("pop", ev["p3.k4"], -11),
        ("pop_big", ev["p3.fps"], -11)]
sfx += [("pop", ev[k], -11) for k in ("cb.mic", "cb.wide", "cb.handle", "cb.tripod")] + [("ding", ev["cb.all"], -12)]
sfx += [("hit", ev["st.name"], -9), ("blip", ev["st.walk"], -13), ("blip", ev["st.run"], -13), ("blip", ev["st.ride"], -13),
        ("stamp", ev["st.steady"], -10)]
sfx += [("hit", ev["trust.badge"], -8), ("blip_up", ev["trust.thumb"], -12)] + [("ding", t + 0.15, -12) for t in ev["trust.checks"]]
sfx += [("whoosh", 51.2, -10), ("pop_big", ev["cta.url"], -11), ("pop_big", ev["cta.message"], -11), ("pop", ev["cta.socials"] + 0.2, -13),
        ("blip", ev["cta.wave"], -13)]
sfx += [("whoosh", 52.7, -9), ("impact", ev["end.city"], -5)] + [("tick", ev["end.typeStart"] + i * ev["end.typeStep"], -12) for i in range(8)]
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
