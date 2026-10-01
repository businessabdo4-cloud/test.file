#!/usr/bin/env python3
"""Compose the background music bed for the ad (original, synthesized locally = royalty-free).

The arrangement follows the video's scene timing (read from src/data/subtitles.json):
  * hook + problem : dark, tense drone with a heartbeat kick and a filter slowly opening
  * reveal          : the groove drops exactly on the GLASSE POWER reveal
  * features..trust : bright, upbeat D-major groove (I–V–vi–IV), extra hats on the price
  * CTA             : keeps going under the last line, then a final chord rings out

Writes assets/music/glasse-groove-generated.wav (the video mixes it under the voice; volume in src/config.ts → AUDIO).
Swap in any other track by replacing assets/music.* and running build_media_manifest.py.
"""
import json
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import fftconvolve, lfilter

ROOT = Path(__file__).resolve().parent.parent
SR = 44100
BPM = 118
BEAT = 60 / BPM
rng = np.random.default_rng(11)

subs = json.loads((ROOT / "src/data/subtitles.json").read_text())
PH = {p["id"]: p for p in subs["phrases"]}
LEAD = 0.12
T_REVEAL = max(PH[6]["end"], PH[7]["start"] - LEAD)  # same rule as src/timeline.ts
T_OFFER = max(PH[23]["end"], PH[24]["start"] - LEAD)
T_TRUST = max(PH[25]["end"], PH[26]["start"] - LEAD)
T_SPEECH_END = subs["speechEnd"]
DUR = np.ceil(max(T_SPEECH_END + 1.8, subs["audioDuration"] + 0.5) * 30) / 30
N = int(DUR * SR) + SR
L = np.zeros(N)
R = np.zeros(N)


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def lowpass(x, fc):
    a = np.exp(-2 * np.pi * fc / SR)
    return lfilter([1 - a], [1, -a], x)


def highpass(x, fc):
    return x - lowpass(x, fc)


def add(sig, t, gain=1.0, pan=0.0):
    i = int(t * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    L[i:i + len(sig)] += sig * gain * np.sqrt(0.5 * (1 - pan))
    R[i:i + len(sig)] += sig * gain * np.sqrt(0.5 * (1 + pan))


def env(n, a=0.005, d=0.2, s=0.0, r=0.05, hold=None):
    t = np.arange(n) / SR
    e = np.minimum(t / max(a, 1e-4), 1.0)
    e *= s + (1 - s) * np.exp(-np.maximum(t - a, 0) / d)
    if hold is not None:
        e *= np.clip((hold + r - t) / r, 0, 1)
    return e


# ─── instruments ─────────────────────────────────────────────────────────────
def kick(strength=1.0):
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t * 28)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7)
    click = highpass(rng.standard_normal(n), 2000) * np.exp(-t * 300) * 0.3
    return np.tanh((body + click) * 1.6 * strength)


def clap():
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    noise = highpass(lowpass(rng.standard_normal(n), 3500), 900)
    e = sum(np.exp(-np.maximum(t - d, 0) * 60) * (t >= d) for d in (0, 0.011, 0.022)) + 0.6 * np.exp(-t * 18)
    return noise * e * 0.5


def hat(open_=False):
    n = int((0.25 if open_ else 0.06) * SR)
    t = np.arange(n) / SR
    return highpass(rng.standard_normal(n), 7000) * np.exp(-t * (12 if open_ else 70)) * 0.35


def saw(freq, n, detune=0.0, harmonics=12):
    t = np.arange(n) / SR
    x = np.zeros(n)
    for k in range(1, harmonics + 1):
        if freq * k > SR / 2.2:
            break
        x += np.sin(2 * np.pi * freq * (1 + detune) * k * t + k) / k
    return x


def bass(note, dur):
    n = int(dur * SR)
    f = midi(note)
    x = saw(f, n, harmonics=8) * 0.6 + np.sin(2 * np.pi * f * np.arange(n) / SR)
    return np.tanh(lowpass(x, 700) * 1.4) * env(n, 0.004, 0.35, 0.55, 0.04, hold=dur - 0.04) * 0.55


def pad(notes, dur, bright=2500):
    n = int(dur * SR)
    xl = sum(saw(midi(m), n, -0.004, 8) for m in notes)
    xr = sum(saw(midi(m), n, 0.004, 8) for m in notes)
    e = env(n, 0.25, 10, 1, 0.3, hold=dur - 0.3)
    return lowpass(xl, bright) * e * 0.08, lowpass(xr, bright) * e * 0.08


def pluck(note):
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    f = midi(note)
    x = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.12 * np.sin(6 * np.pi * f * t)
    return x * np.exp(-t * 14) * 0.18


# ─── arrangement ─────────────────────────────────────────────────────────────
# Intro (tension): D minor drone, heartbeat kick, ticking hats, filter opening.
n_intro = int(T_REVEAL * SR)
t = np.arange(n_intro) / SR
drone = sum(saw(midi(m), n_intro, d, 10) for m, d in ((38, 0), (45, 0.003), (53, -0.003), (57, 0.002)))
cut = 300 + 1200 * (t / T_REVEAL) ** 2
drone_f = np.zeros(n_intro)
for i in range(0, n_intro, 2048):  # time-varying filter, block-wise
    drone_f[i:i + 2048] = lowpass(drone[max(0, i - 4096):i + 2048], cut[i])[-len(drone[i:i + 2048]):]
drone_f *= np.minimum(t / 0.6, 1) * 0.07
add(drone_f, 0, 1.0, -0.2)
add(drone_f, 0.013, 1.0, 0.2)
b = 0.0
while b < T_REVEAL - 0.3:
    add(kick(0.7), b, 0.55)
    add(kick(0.5), b + 0.28, 0.35)  # heart-beat double
    b += BEAT * 2
b = BEAT
while b < T_REVEAL - 0.1:
    add(hat(), b, 0.5, 0.3)
    b += BEAT

# Main groove from the reveal: D – A – Bm – G, one chord per bar.
PROG = [
    ((62, 66, 69, 74), 38),  # D
    ((61, 64, 69, 73), 33),  # A
    ((62, 66, 71, 74), 35),  # Bm
    ((62, 67, 71, 74), 31),  # G
]
ARP = [0, 2, 1, 3, 2, 1, 3, 2]
bar = 4 * BEAT
t0 = T_REVEAL
end_groove = T_SPEECH_END + 0.15
bi = 0
while t0 < end_groove:
    chord, root = PROG[bi % 4]
    bar_len = min(bar, end_groove - t0)
    pl, pr = pad(chord, bar_len + 0.3, 2800)
    add(pl, t0, 1, -0.5)
    add(pr, t0, 1, 0.5)
    for beat in range(4):
        tb = t0 + beat * BEAT
        if tb >= end_groove:
            break
        add(kick(), tb, 0.8)
        if beat in (1, 3):
            add(clap(), tb, 0.7, 0.05)
        add(bass(root + 12, BEAT * 0.45), tb + BEAT * 0.5, 1.0)  # off-beat bass
        add(bass(root, BEAT * 0.4), tb, 0.6)
        n16 = 4 if t0 >= T_OFFER and tb < T_TRUST else 2  # busier hats on the price
        for s in range(n16):
            add(hat(open_=(n16 == 2 and s == 1)), tb + s * BEAT / n16, 0.45 if s else 0.3, 0.35)
        for s in range(2):
            note = chord[ARP[(beat * 2 + s) % 8] % len(chord)] + 12
            ta = tb + s * BEAT / 2
            add(pluck(note), ta, 1, -0.4 + 0.8 * s)
            add(pluck(note), ta + BEAT * 0.75, 0.35, 0.6 - 1.2 * s)  # dotted echo
    t0 += bar
    bi += 1

# Impact on the drop + a final ringing D chord for the end card.
add(kick(1.2), T_REVEAL, 0.9)
fl, fr = pad((50, 57, 62, 66, 69, 74), DUR - end_groove + 0.2, 3500)
add(fl, end_groove, 1.4, -0.4)
add(fr, end_groove, 1.4, 0.4)
add(bass(38, 1.2), end_groove, 1.0)

# Sidechain-ish pump: dip everything slightly on each groove beat.
t = np.arange(N) / SR
pump = np.ones(N)
tb = T_REVEAL
while tb < end_groove:
    m = (t >= tb) & (t < tb + BEAT)
    pump[m] = 1 - 0.35 * np.exp(-(t[m] - tb) / 0.09)
    tb += BEAT
L *= pump
R *= pump

# Small room reverb + master.
ir_n = int(1.3 * SR)
ir = rng.standard_normal(ir_n) * np.exp(-np.arange(ir_n) / SR * 4.5)
ir = lowpass(ir, 5000) / np.sqrt((ir ** 2).sum())
L = L + 0.18 * fftconvolve(L, ir)[:N]
R = R + 0.18 * fftconvolve(R, np.roll(ir, 331))[:N]
mix = np.stack([L, R], 1)[: int(DUR * SR)]
fade = int(1.2 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 2
mix = np.tanh(mix / (np.abs(mix).max() + 1e-9) * 1.4) * 0.89
OUT = ROOT / "assets/music/glasse-groove-generated.wav"
OUT.parent.mkdir(parents=True, exist_ok=True)
sf.write(OUT, mix, SR, subtype="PCM_16")
print(f"wrote {OUT.relative_to(ROOT)} ({DUR:.2f}s)  drop at {T_REVEAL:.2f}s, groove ends {end_groove:.2f}s")
