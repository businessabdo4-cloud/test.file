#!/usr/bin/env python3
"""Generate the small sound effects used in the ad (royalty-free: synthesized locally).

Writes assets/sfx/{whoosh,pop,impact,ding,riser}.wav
"""
from pathlib import Path

import numpy as np
import soundfile as sf

SR = 44100
OUT = Path(__file__).resolve().parent.parent / "assets/sfx"
rng = np.random.default_rng(7)


def env(n, attack, release):
    a = int(attack * SR)
    e = np.ones(n)
    e[:a] = np.linspace(0, 1, a) ** 2
    e[a:] = np.exp(-np.linspace(0, 1, n - a) * release)
    return e


def bandpass_noise(n, f_start, f_end):
    """Noise through a moving resonant filter (cheap state-variable filter)."""
    x = rng.standard_normal(n)
    y = np.zeros(n)
    low = band = 0.0
    q = 0.35
    for i in range(n):
        f = f_start * (f_end / f_start) ** (i / n)
        k = 2 * np.sin(np.pi * f / SR)
        low += k * band
        high = x[i] - low - q * band
        band += k * high
        y[i] = band
    return y / (np.abs(y).max() + 1e-9)


def save(name, y, gain=0.9):
    y = y / (np.abs(y).max() + 1e-9) * gain
    stereo = np.stack([y, y], 1)
    OUT.mkdir(parents=True, exist_ok=True)
    sf.write(OUT / f"{name}.wav", stereo.astype(np.float32), SR)


def main():
    n = int(0.5 * SR)
    t = np.linspace(0, 1, n)
    save("whoosh", bandpass_noise(n, 300, 3500) * np.sin(np.pi * t) ** 1.5, 0.8)

    n = int(0.14 * SR)
    tt = np.arange(n) / SR
    f = 900 * np.exp(-tt * 18) + 300
    save("pop", np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.003, 9), 0.8)

    n = int(0.9 * SR)
    tt = np.arange(n) / SR
    boom = np.sin(2 * np.pi * np.cumsum(60 + 90 * np.exp(-tt * 12)) / SR) * env(n, 0.002, 5)
    click = bandpass_noise(n, 2500, 800) * env(n, 0.001, 40)
    save("impact", boom + 0.5 * click, 0.95)

    n = int(0.8 * SR)
    tt = np.arange(n) / SR
    ding = sum(np.sin(2 * np.pi * fr * tt) * a for fr, a in [(1318.5, 1), (2637, 0.35), (1975.5, 0.25)])
    save("ding", ding * env(n, 0.004, 6), 0.6)

    n = int(0.05 * SR)
    tt = np.arange(n) / SR
    save("click", bandpass_noise(n, 3000, 1800) * np.exp(-tt * 160) + 0.4 * np.sin(2 * np.pi * 1800 * tt) * np.exp(-tt * 120), 0.5)

    n = int(0.7 * SR)
    t = np.linspace(0, 1, n)
    save("riser", bandpass_noise(n, 200, 6000) * t ** 2, 0.6)
    print("wrote", sorted(p.name for p in OUT.iterdir()))


if __name__ == "__main__":
    main()
