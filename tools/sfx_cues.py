"""Place SFX on the timeline from vo/timings.json and verify none covers a word.
Writes assets/sfx/cues.json (read by Remotion for both audio and the matching visual beats).
Rule: wherever an SFX is audible while the dialogue is speaking (50 ms windows with dialogue above
-45 dBFS RMS), it must sit >= 15 dB below the dialogue in that window."""
import json
from pathlib import Path
import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
VO, SFX = ROOT / "assets" / "vo", ROOT / "assets" / "sfx"
T = json.load(open(VO / "timings.json"))
L = {l["id"]: l for l in T["lines"]}
word_end = lambda lid, i: L[lid]["words"][i]["end"]

cues = [
    # name, file, time (s), gain (linear), why
    ("citybotPop", "pop", L["L1"]["end"] + 0.06, 0.55, "Citybot bursts out of the phone (gap L1→L2)"),
    ("boxWhoosh", "whoosh", L["L2"]["end"] + 0.02, 0.5, "box drops in (gap L2→L3)"),
    ("checkDing", "ding", word_end("L2", 8) - 0.08, 0.2, "checkmark on Citybot's face, end of 'أوريجينال'"),
    ("crowdOoh", "ooh", L["L3"]["end"] + 0.01, 0.2, "reaction to the iPhone 18 Pro Max (gap L3→L4)"),
    ("hostBlip", "blip1", L["L4"]["end"] + 0.01, 0.28, "Citybot switches to game-show host (gap L4→L5)"),
    ("ctaBlip", "blip2", L["L5"]["end"] + 0.01, 0.28, "Citybot CTA gesture (gap L5→L6)"),
    ("citySlam", "slam", L["L6"]["end"] + 0.03, 0.55, "CITY slams in (gap L6→L7)"),
    ("highFive", "clap", L["L7"]["end"] + 0.06, 0.6, "high-five after the last word"),
]

sr = 48000
fps = T["fps"]
dia, _ = sf.read(VO / "dialogue_comp.wav", dtype="float32")
win = int(0.05 * sr)


def worst_margin(x, t):
    """Lowest (dialogue − SFX) dB margin over windows where the dialogue is speaking; None if never overlapping."""
    a = int(round(t * sr))
    worst = None
    for i in range(0, len(x) - win, win):
        e_sfx = np.sqrt(np.mean(x[i:i + win] ** 2)) + 1e-9
        e_dia = np.sqrt(np.mean(dia[a + i:a + i + win] ** 2)) + 1e-9
        if 20 * np.log10(e_dia) < -45 or e_sfx < 10 ** (-60 / 20):
            continue
        m = 20 * np.log10(e_dia / e_sfx)
        if worst is None or m < worst[0]:
            worst = (m, (a + i) / sr)
    return worst


ok_all = True
out = []
for name, file, t_want, gain, why in cues:
    x, fsr = sf.read(SFX / f"{file}.wav", dtype="float32")
    assert fsr == sr
    x = x * gain
    # Remotion places audio on whole frames: take the nearest frame that keeps the rule
    f0 = round(t_want * fps)
    for f in sorted(range(f0 - 3, f0 + 4), key=lambda f: abs(f - t_want * fps)):
        worst = worst_margin(x, f / fps)
        if worst is None or worst[0] >= 15:
            break
    t = f / fps
    ok = worst is None or worst[0] >= 15
    ok_all &= ok
    status = "clear of words" if worst is None else f"under speech by {worst[0]:.1f} dB at {worst[1]:.2f}s"
    print(f"{'OK ' if ok else 'BAD'} {name:11s} {t:6.3f}s (frame {f:3d})  {status:34s} {why}")
    out.append({"name": name, "file": f"sfx/{file}.wav", "t": round(t, 4), "frame": f, "gain": gain, "why": why})
json.dump(out, open(SFX / "cues.json", "w"), ensure_ascii=False, indent=1)
if not ok_all:
    raise SystemExit("An SFX would cover a word — move it or lower it.")
