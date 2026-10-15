"""Split a single full VO take (assets/vo/vo_full_take.wav) into line_01..line_06.wav
at its longest pauses. Pauses shorter than MIN_GAP (e.g. the "City Store… la tech" breath)
stay inside a line."""
import json, pathlib, subprocess, sys
import numpy as np, soundfile as sf

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "vo" / "vo_full_take.wav"
N_LINES = len(json.loads((ROOT / "scripts" / "vo_lines.json").read_text()))
MIN_GAP = 0.35

x, sr = sf.read(SRC, dtype="float32")
if x.ndim > 1:
    x = x.mean(axis=1)
win = int(sr * 0.01)
f = x[: len(x) // win * win].reshape(-1, win)
db = 20 * np.log10(np.sqrt((f ** 2).mean(axis=1)) + 1e-9)
voiced = db > -38
# silent runs between voiced regions
gaps, i = [], 0
first = int(np.argmax(voiced)); last = len(voiced) - 1 - int(np.argmax(voiced[::-1]))
i = first
while i <= last:
    if not voiced[i]:
        j = i
        while j <= last and not voiced[j]:
            j += 1
        gaps.append((i, j))
        i = j
    else:
        i += 1
gaps = [g for g in gaps if (g[1] - g[0]) * 0.01 >= MIN_GAP]
gaps = sorted(sorted(gaps, key=lambda g: g[1] - g[0], reverse=True)[: N_LINES - 1])
if len(gaps) != N_LINES - 1:
    sys.exit(f"found {len(gaps)+1} phrases, expected {N_LINES}: record or split manually")
bounds = [first] + [ (a + b) // 2 for a, b in gaps ] + [last + 1]
for k in range(N_LINES):
    a, b = bounds[k] * win, bounds[k + 1] * win
    out = ROOT / "assets" / "vo" / f"line_{k+1:02d}.wav"
    sf.write(out, x[a:b], sr)
    print(out.name, f"{a/sr:6.2f}-{b/sr:6.2f}s")
