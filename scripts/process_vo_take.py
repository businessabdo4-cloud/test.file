"""Take-mode VO pipeline (one continuous recording for the whole reel), e.g. REEL=watch.

1. trim the take's edges, shorten inner pauses to <= MAX_PAUSE (sentence breaks keep SENT_PAUSE)
2. if it still ends after `voEndBy`, time-stretch uniformly (pitch kept) up to 1.10x
   -> beyond that: report and exit 1 (never extend the video)
3. -14 LUFS, split into lines at the configured sentence boundaries, Rhubarb lip sync
   (phonetic recogniser, language independent), estimated word timings
Outputs the same files as process_vo.py: <pub>/audio/vo/line_XX.wav + <pub>/data/vo.json
"""
import json
import subprocess
import sys

import numpy as np
import pyloudnorm as pyln
import soundfile as sf

from reel import ASSETS, LINES, PUB, REEL, ROOT
from process_vo import RHUBARB, SR, frame_db, load_mono, word_timings, TMP

CFG = json.loads((ROOT / "reels" / REEL / "reel.json").read_text())
MAX_PAUSE = CFG.get("maxPause", 0.16)   # per-reel override for long takes
SENT_PAUSE = CFG.get("sentPause", 0.24)
MAX_SPEED = 1.10
TARGET_LUFS = -14.0
SILENCE_DB = -40.0


def main():
    TMP.mkdir(parents=True, exist_ok=True)
    lines = json.loads(LINES.read_text())
    raw = load_mono(ASSETS / CFG["take"])
    db, n = frame_db(raw, 0.01)
    voiced = db > SILENCE_DB
    first = int(np.argmax(voiced))
    last = len(voiced) - 1 - int(np.argmax(voiced[::-1]))
    bounds_f = [int(b * 100) for b in CFG["takeBoundaries"]]
    assert len(bounds_f) == len(lines) - 1, "takeBoundaries must have len(lines)-1 entries"

    # walk the take, copying voiced audio and shortened pauses; remember where each line starts
    pieces, line_starts, pos = [], [], 0
    next_b = 0
    i = first
    fade = np.linspace(0, 1, 48, dtype=np.float32)
    line_starts.append(0)
    while i <= last:
        j = i
        if voiced[i]:
            while j <= last and voiced[j]:
                j += 1
            seg = raw[i * n:j * n]
        else:
            while j <= last and not voiced[j]:
                j += 1
            is_sentence = next_b < len(bounds_f) and i - 30 <= bounds_f[next_b] <= j + 30
            keep = int((SENT_PAUSE if is_sentence else MAX_PAUSE) * 100)
            if j - i > keep:
                seg = np.concatenate([raw[i * n:(i + keep // 2) * n], raw[(j - (keep - keep // 2)) * n:j * n]])
            else:
                seg = raw[i * n:j * n]
            if is_sentence:  # line boundary = middle of this (shortened) pause
                line_starts.append(pos + len(seg) // 2)
                next_b += 1
        seg = seg.copy()
        if len(seg) > 200:
            seg[:48] *= fade
            seg[-48:] *= fade[::-1]
        pieces.append(seg)
        pos += len(seg)
        i = j
    if next_b != len(bounds_f):
        sys.exit(f"only matched {next_b}/{len(bounds_f)} sentence boundaries - check takeBoundaries")
    take = np.concatenate(pieces)
    dur = len(take) / SR
    budget = CFG["voEndBy"] - CFG["lead"]
    speed = max(1.0, dur / budget)
    if speed > MAX_SPEED:
        sys.exit(f"VO is {dur:.2f}s after trimming; needs {speed:.3f}x (> {MAX_SPEED}) to end by {CFG['voEndBy']}s. "
                 "Shorten the script (longest lines first).")
    if speed > 1.0:
        a, b = TMP / f"{REEL}_take_pre.wav", TMP / f"{REEL}_take_st.wav"
        sf.write(a, take, SR)
        subprocess.run(["rubberband", "-q", "-T", f"{speed:.5f}", "-F", str(a), str(b)], check=True)
        take, _ = sf.read(b, dtype="float32")
        line_starts = [int(s / speed) for s in line_starts]
    meter = pyln.Meter(SR)
    take = pyln.normalize.loudness(take, meter.integrated_loudness(take), TARGET_LUFS)
    take *= min(1.0, 0.98 / np.abs(take).max())
    line_starts.append(len(take))

    out_dir = PUB / "audio" / "vo"
    result = []
    for k, line in enumerate(lines):
        a, b = line_starts[k], line_starts[k + 1]
        x = take[a:b]
        f = out_dir / f"{line['id']}.wav"
        sf.write(f, x, SR, subtype="PCM_16")
        rj = TMP / f"{REEL}_{line['id']}_rhubarb.json"
        r = subprocess.run([str(RHUBARB), "-r", "phonetic", "-f", "json", "--extendedShapes", "GHX", "-o", str(rj), str(f)],
                           capture_output=True, text=True)
        if r.returncode:
            sys.exit(r.stderr)
        result.append({
            "id": line["id"],
            "subtitle": line["subtitle"],
            "source": "human-take",
            "start": round(CFG["lead"] + a / SR, 3),
            "duration": round(len(x) / SR, 3),
            "speed": round(speed, 4),
            "words": word_timings(x, line["subtitle"]),
            "mouthCues": json.loads(rj.read_text())["mouthCues"],
        })
        print(f"{line['id']}: {CFG['lead'] + a / SR:6.2f}s +{len(x)/SR:5.2f}s  {line['subtitle'][:50]}")
    (PUB / "data" / "vo.json").write_text(json.dumps(result, ensure_ascii=False, indent=1) + "\n")
    print(f"take: {len(raw)/SR:.2f}s raw -> {dur:.2f}s trimmed -> x{speed:.3f} -> ends at {CFG['lead'] + len(take)/SR:.2f}s")


if __name__ == "__main__":
    main()
