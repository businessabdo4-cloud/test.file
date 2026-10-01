#!/usr/bin/env python3
"""Voice-over clean-up: tighten pacing and polish the sound.

  1. Trim dead air at the start/end.
  2. Shorten long pauses (and the breaths inside them) so the delivery feels tight
     but still natural: a pause is never cut shorter than MIN_KEEP; short gaps are untouched.
     Every cut uses a 12 ms equal-power crossfade (no clicks).
  3. Polish: high-pass rumble, tame boxiness, add presence/air, de-ess, gentle compression,
     48 kHz, loudness-normalised to -16 LUFS (the final mix is mastered to -14 LUFS).

Input : the first audio/video file in assets/vo/ that is not *-clean.* (or --in)
Output: assets/vo/voiceover-clean.wav  +  assets/vo/edits.json (every cut, for review)

Usage:  python3 scripts/clean_vo.py [--in FILE] [--max-pause 0.28] [--min-keep 0.16]
"""
import argparse
import json
import subprocess
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
VO = ROOT / "assets/vo"
SR = 48000


def find_input():
    for f in sorted(VO.iterdir()):
        if f.suffix.lower() in {".wav", ".mp3", ".m4a", ".aac", ".flac", ".mp4", ".mov"} and "-clean" not in f.stem:
            return f
    raise SystemExit("no voice-over file in assets/vo/")


def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-vn", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()


def pauses(x, thresh_db=-38, min_len=0.09):
    hop = SR // 100
    win = int(SR * 0.02)
    rms = np.sqrt(np.convolve(x ** 2, np.ones(win) / win, "same")[::hop])
    db = 20 * np.log10(rms + 1e-7)
    low = db < thresh_db
    out, s = [], None
    for i, v in enumerate(np.append(low, False)):
        if v and s is None:
            s = i
        elif not v and s is not None:
            if (i - s) * 0.01 >= min_len:
                out.append((s * 0.01, i * 0.01))
            s = None
    return out, db


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="inp")
    ap.add_argument("--max-pause", type=float, default=0.28, help="pauses longer than this get shortened")
    ap.add_argument("--min-keep", type=float, default=0.22, help="never leave a pause shorter than this")
    ap.add_argument("--lead", type=float, default=0.06, help="silence kept before the first word")
    args = ap.parse_args()

    src = Path(args.inp) if args.inp else find_input()
    x = load(src)
    dur = len(x) / SR
    ps, _ = pauses(x)

    # segments of audio to keep
    first_speech = ps[0][1] if ps and ps[0][0] <= 0.01 else 0.0
    last_speech = ps[-1][0] if ps and ps[-1][1] >= dur - 0.02 else dur
    keep, cuts = [], []
    cur = max(0.0, first_speech - args.lead)
    if cur > 0:
        cuts.append({"from": 0.0, "to": round(cur, 3), "why": "leading silence"})
    for a, b in ps:
        if a <= first_speech or b >= last_speech:
            continue
        length = b - a
        if length > args.max_pause:
            # keep a pause proportional to the original (longer pause = slightly longer kept)
            kept = min(args.max_pause, max(args.min_keep, args.min_keep + 0.12 * (length - args.max_pause)))
            half = kept / 2
            keep.append((cur, a + half))
            cuts.append({"from": round(a + half, 3), "to": round(b - half, 3), "why": f"pause {length:.2f}s -> {kept:.2f}s"})
            cur = b - half
    end = min(dur, last_speech + 0.12)
    keep.append((cur, end))
    if end < dur:
        cuts.append({"from": round(end, 3), "to": round(dur, 3), "why": "trailing silence"})

    # splice with equal-power crossfades
    xf = int(0.012 * SR)
    out = np.zeros(0, np.float32)
    for a, b in keep:
        seg = x[int(a * SR):int(b * SR)].astype(np.float32)
        if len(out) >= xf and len(seg) >= xf:
            t = np.linspace(0, np.pi / 2, xf)
            mixed = out[-xf:] * np.cos(t) + seg[:xf] * np.sin(t)
            out = np.concatenate([out[:-xf], mixed, seg[xf:]])
        else:
            out = np.concatenate([out, seg])
    fade = int(0.01 * SR)
    out[:fade] *= np.linspace(0, 1, fade)
    out[-fade * 3:] *= np.linspace(1, 0, fade * 3)

    tmp = VO / "_tmp_cut.wav"
    sf.write(tmp, out, SR, subtype="FLOAT")
    clean = VO / "voiceover-clean.wav"
    chain = ",".join([
        "highpass=f=80:poles=2",
        "equalizer=f=280:t=q:w=1.2:g=-2.5",  # less boxy
        "equalizer=f=3200:t=q:w=1.0:g=2.5",  # presence / intelligibility
        "equalizer=f=9000:t=h:w=1:g=1.5",  # air
        "deesser=i=0.35:m=0.5:f=0.5",
        "acompressor=threshold=-20dB:ratio=3:attack=8:release=90:makeup=2",
        "alimiter=limit=0.89:level=false",
        "loudnorm=I=-16:TP=-1.5:LRA=7",
    ])
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(tmp), "-af", chain, "-ar", str(SR), "-c:a", "pcm_s16le", str(clean)], check=True)
    tmp.unlink()

    new_dur = len(sf.read(clean)[0]) / SR
    report = {"source": src.name, "originalSeconds": round(dur, 3), "cleanSeconds": round(new_dur, 3),
              "removedSeconds": round(dur - new_dur, 3), "maxPause": args.max_pause, "cuts": cuts}
    (VO / "edits.json").write_text(json.dumps(report, indent=2))
    print(f"{src.name}: {dur:.2f}s -> {new_dur:.2f}s  ({len(cuts)} cuts, {dur - new_dur:.2f}s removed)")
    for c in cuts:
        print(f"  cut {c['from']:6.2f}-{c['to']:6.2f}  {c['why']}")


if __name__ == "__main__":
    main()
