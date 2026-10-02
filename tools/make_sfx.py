"""Synthesize the ad's cartoon SFX (original, no third-party samples) into assets/sfx/*.wav (48 kHz mono).
Levels are set in the Remotion mix; each file is peak-normalized to -3 dBFS here."""
from pathlib import Path
import numpy as np
import soundfile as sf
from scipy import signal

SR = 48000
OUT = Path(__file__).resolve().parent.parent / "assets" / "sfx"
OUT.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(7)
t_ = lambda d: np.arange(int(d * SR)) / SR


def env(n, a, d, curve=4.0):
    """attack seconds, then exponential decay over the rest"""
    na = max(1, int(a * SR))
    e = np.ones(n)
    e[:na] = np.linspace(0, 1, na)
    e[na:] = np.exp(-curve * np.linspace(0, 1, n - na)) if n > na else e[na:]
    return e * (1 if d is None else 1)


def glide(f0, f1, n, shape=1.0):
    f = f0 + (f1 - f0) * np.linspace(0, 1, n) ** shape
    return 2 * np.pi * np.cumsum(f) / SR


def bp(x, lo, hi, order=2):
    sos = signal.butter(order, [lo, hi], btype="band", fs=SR, output="sos")
    return signal.sosfilt(sos, x)


def lp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, btype="low", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, btype="high", fs=SR, output="sos"), x)


def save(name, x):
    x = x / (np.max(np.abs(x)) + 1e-9) * 10 ** (-3 / 20)
    fade = int(0.004 * SR)
    x[-fade:] *= np.linspace(1, 0, fade)
    sf.write(OUT / f"{name}.wav", x.astype(np.float32), SR, subtype="PCM_24")
    print(f"{name:10s} {len(x) / SR:.2f}s")


# pop — cartoon mouth pop for Citybot's entrance
n = int(0.16 * SR)
pop = np.sin(glide(1100, 240, n, 0.5)) * env(n, 0.002, None, 9)
pop += 0.3 * hp(rng.standard_normal(n), 2000) * env(n, 0.0005, None, 60)
save("pop", pop)

# whoosh — swept band-passed noise (box drop)
n = int(0.27 * SR)
noise = rng.standard_normal(n)
centers = 300 + 2600 * np.sin(np.linspace(0, np.pi, n)) ** 2
out = np.zeros(n)
blk = 512
for i in range(0, n, blk):
    c = centers[i]
    seg = bp(noise[max(0, i - 2048):i + blk], c * 0.6, min(c * 1.6, SR / 2 - 100))
    out[i:i + blk] = seg[-len(out[i:i + blk]):]
out *= np.sin(np.linspace(0, np.pi, n)) ** 1.5
save("whoosh", out)

# ding — bell for the checkmark
n = int(0.8 * SR)
t = t_(0.8)
f0 = 1318.5
ding = sum(a * np.sin(2 * np.pi * f0 * r * t) * np.exp(-t / d) for r, a, d in [(1, 1, 0.05), (2.0, 0.45, 0.04), (2.76, 0.3, 0.03), (5.4, 0.15, 0.02)])
ding *= np.minimum(1, t / 0.002)
save("ding", ding)


def beep(freqs, dur=0.045, gap=0.012):
    parts = []
    for f in freqs:
        n = int(dur * SR)
        x = signal.square(2 * np.pi * f * t_(dur), 0.5) * 0.5 + 0.5 * np.sin(2 * np.pi * f * t_(dur))
        x = lp(x, 5000) * np.minimum(1, np.linspace(0, dur, n) / 0.004) * np.exp(-np.linspace(0, 3, n))
        parts += [x, np.zeros(int(gap * SR))]
    return np.concatenate(parts)


save("blip1", beep([880, 1320]))
save("blip2", beep([1568, 1175, 1568], 0.035, 0.01))
save("blip3", beep([660, 990, 1320], 0.03, 0.008))

# ooh — small cartoon crowd "oooh" (formant-filtered detuned voices with a rise-fall contour)
dur = 0.62
n = int(dur * SR)
contour = 2 ** ((3 * np.sin(np.linspace(0, np.pi, n) * 0.9)) / 12)
crowd = np.zeros(n)
for v in range(14):
    f0 = rng.uniform(130, 270)
    vib = 1 + 0.012 * np.sin(2 * np.pi * rng.uniform(4.5, 6.5) * t_(dur) + rng.uniform(0, 6))
    ph = 2 * np.pi * np.cumsum(f0 * contour * vib) / SR
    saw = signal.sawtooth(ph)
    delay = int(rng.uniform(0, 0.08) * SR)
    crowd += np.roll(saw, delay) * rng.uniform(0.6, 1.0)
formants = bp(crowd, 250, 380) * 1.0 + bp(crowd, 760, 980) * 0.45 + bp(crowd, 2100, 2400) * 0.08
formants += 0.05 * bp(rng.standard_normal(n), 300, 900)
e = np.minimum(1, t_(dur) / 0.08) * np.exp(-np.maximum(0, t_(dur) - 0.18) * 9)
save("ooh", lp(formants * e, 3500))

# clap — high-five slap
n = int(0.22 * SR)
slap = bp(rng.standard_normal(n), 900, 5200, 3) * env(n, 0.0008, None, 30)
slap += 0.5 * np.sin(glide(180, 90, n)) * env(n, 0.001, None, 25)
save("clap", slap)

# slam — low impact for the CITY wordmark
n = int(0.32 * SR)
slam = np.sin(glide(95, 38, n, 0.6)) * env(n, 0.002, None, 7)
slam += 0.35 * lp(rng.standard_normal(n), 1800) * env(n, 0.001, None, 35)
save("slam", slam)

# sparkle — light burst shimmer (box opening)
n = int(0.7 * SR)
sp = np.zeros(n)
for k in range(26):
    st = int(rng.uniform(0, 0.4) * SR)
    f = rng.uniform(2400, 6400)
    ln = int(0.18 * SR)
    seg = np.sin(2 * np.pi * f * t_(0.18)) * np.exp(-np.linspace(0, 6, ln))
    sp[st:st + ln] += seg[: n - st] * rng.uniform(0.3, 1)
sp *= np.exp(-np.linspace(0, 2.2, n))
save("sparkle", sp)

# stamp — soft thud for the ✗ stamp on the fake phone
n = int(0.18 * SR)
stamp = np.sin(glide(150, 70, n)) * env(n, 0.001, None, 14) + 0.25 * lp(rng.standard_normal(n), 900) * env(n, 0.001, None, 30)
save("stamp", stamp)
