#!/usr/bin/env python3
"""Analyse every track in assets/music/ and pick the best one for a fast, upbeat ad.

For each file: tempo (BPM, from onset autocorrelation), energy (RMS loudness), beat strength
(how punchy the rhythm is), brightness (spectral centroid) and how dynamic it is.
Score = closeness of tempo to 110–130 BPM + energy + beat strength + brightness.

Writes assets/music/analysis.json and assets/music/choice.json ({"file": "music/<name>"}),
which build_media_manifest.py uses. Override by editing choice.json.
"""
import json
import subprocess
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
MUSIC = ROOT / "assets/music"
SR = 22050


def load(path, seconds=60):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-t", str(seconds), "-i", str(path), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32)


def analyse(x):
    hop, n = 512, 2048
    frames = np.lib.stride_tricks.sliding_window_view(x, n)[::hop] * np.hanning(n)
    mag = np.abs(np.fft.rfft(frames, axis=1))
    freqs = np.fft.rfftfreq(n, 1 / SR)
    flux = np.maximum(np.diff(np.log1p(mag), axis=0), 0).sum(1)
    flux = (flux - flux.mean()) / (flux.std() + 1e-9)
    fps = SR / hop
    ac = np.correlate(flux, flux, "full")[len(flux) - 1:]
    ac = ac / (ac[0] + 1e-9)
    # harmonic comb: a true beat period also lines up at 2x, 4x (bars) — dotted echoes don't
    cands = np.arange(70, 181, 0.5)
    def comb(bpm):
        lag = 60 * fps / bpm
        return sum(w * np.interp(k * lag, np.arange(len(ac)), ac) for k, w in ((1, 1.0), (2, 0.8), (4, 0.6), (8, 0.4)))
    strengths = np.array([comb(b) for b in cands])
    bpm = float(cands[np.argmax(strengths)])
    lag = int(round(60 * fps / bpm))
    rms = np.sqrt((x ** 2).mean())
    blocks = np.sqrt((x[: len(x) // SR * SR].reshape(-1, SR) ** 2).mean(1)) + 1e-9
    return {
        "bpm": round(float(bpm), 1),
        "energyDb": round(float(20 * np.log10(rms + 1e-9)), 1),
        "beatStrength": round(float(ac[lag]), 3),
        "brightnessHz": round(float((mag.mean(0) * freqs).sum() / mag.mean(0).sum()), 0),
        "dynamicsDb": round(float(20 * np.log10(blocks.max() / np.median(blocks))), 1),
        "seconds": round(len(x) / SR, 1),
    }


def score(a):
    tempo = max(0.0, 1 - abs(a["bpm"] - 120) / 30)
    energy = np.clip((a["energyDb"] + 30) / 18, 0, 1)
    beat = np.clip(a["beatStrength"] / 0.5, 0, 1)
    bright = np.clip((a["brightnessHz"] - 1000) / 2500, 0, 1)
    return round(float(2 * tempo + 1.2 * energy + 1.5 * beat + 0.8 * bright), 3)


def main():
    files = [f for f in sorted(MUSIC.iterdir()) if f.suffix.lower() in {".mp3", ".wav", ".m4a", ".aac", ".flac", ".ogg"}]
    if not files:
        raise SystemExit("no music in assets/music/")
    results = []
    for f in files:
        a = analyse(load(f))
        a["file"] = f"music/{f.name}"
        a["score"] = score(a)
        results.append(a)
        print(f"{f.name:<40} {a['bpm']:>6} BPM  energy {a['energyDb']:>6} dB  beat {a['beatStrength']:.2f}  "
              f"bright {a['brightnessHz']:>5.0f} Hz  dyn {a['dynamicsDb']} dB  -> score {a['score']}")
    best = max(results, key=lambda r: r["score"])
    (MUSIC / "analysis.json").write_text(json.dumps(results, indent=2))
    (MUSIC / "choice.json").write_text(json.dumps({"file": best["file"], "why": "highest score (tempo near 120 BPM, energy, beat, brightness)"}, indent=2))
    print("chosen:", best["file"])


if __name__ == "__main__":
    main()
