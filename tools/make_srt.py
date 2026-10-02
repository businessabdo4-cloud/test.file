"""Write the .srt from the approved script text (assets/vo/timings.json words) — never from ASR.
Cue timing mirrors the burned-in subtitles. Latin runs ("City Store", "iPhone 18 Pro Max", "18 Pro") get
LEFT-TO-RIGHT MARKs so players keep them in order inside the RTL line."""
import json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
T = json.load(open(ROOT / "assets" / "vo" / "timings.json"))
NAMES = {"hamza": "حمزة", "citybot": "سيتي بوت", "both": "حمزة + سيتي بوت"}
LRM, RLM = "‎", "‏"
LATIN = re.compile(r"[A-Za-z0-9@.…]+")


def fmt(s):
    ms = int(round(s * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


def protect(text):
    # mark each Latin/number run so the spaces between them resolve left-to-right
    return LATIN.sub(lambda m: m.group(0) + LRM if re.search(r"[A-Za-z0-9]", m.group(0)) else m.group(0), text)


lines = T["lines"]
out = []
for i, l in enumerate(lines):
    nxt = lines[i + 1] if i + 1 < len(lines) else None
    start = l["start"] - 0.12
    end = min(l["end"] + 0.35, nxt["start"] - 0.12) if nxt else l["end"] + 0.6
    text = " ".join(w["text"] for w in l["words"])
    assert text.replace(" ", "") == l["text"].replace(" ", ""), (text, l["text"])
    out.append(f"{i + 1}\n{fmt(start)} --> {fmt(end)}\n{RLM}{NAMES[l['speaker']]}: {protect(text)}\n")
dest = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "deliverables" / "reel.srt"
dest.parent.mkdir(parents=True, exist_ok=True)
dest.write_text("\n".join(out), encoding="utf-8")
print(dest.read_text(encoding="utf-8").replace(LRM, "").replace(RLM, ""))
