"""Original upbeat electronic bed for the reel, synthesised from scratch (royalty-free).

120 BPM, 4/4, exactly 30 s, locked to the same beat grid as public/data/timeline.json.
Structure (bars of 2 s):
  0-1   hook: impact on beat 1, driving drums + bass, filtered chords, snare roll + riser into the drop
  2-12  full groove (drop lands at 4.0 s): kick, clap, hats, pumping supersaw chords, pluck arp
  13    pre-end build
  14    final hit at 29.0 s (end-card hold), ringing out to 30.0 s
Output: public/audio/music.wav (48 kHz stereo), normalised to -14 LUFS (the mixer sets the final level).
"""
import pathlib
import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from scipy.signal import butter, sosfilt, sawtooth

ROOT = pathlib.Path(__file__).resolve().parent.parent
SR = 48000
BPM = 120
BEAT = 60 / BPM
DUR = 30.0
N = int(SR * DUR)
rng = np.random.default_rng(7)

L = np.zeros(N, dtype=np.float64)
R = np.zeros(N, dtype=np.float64)


def t_arr(d):
    return np.arange(int(SR * d)) / SR


def place(sig, t0, gain=1.0, pan=0.0):
    i = int(round(t0 * SR))
    if i >= N:
        return
    if sig.ndim == 1:
        sl, sr_ = sig * (1 - max(0, pan)), sig * (1 + min(0, pan))
    else:
        sl, sr_ = sig[0], sig[1]
    n = min(len(sl), N - i)
    L[i:i + n] += sl[:n] * gain
    R[i:i + n] += sr_[:n] * gain


def lp(x, fc, order=2):
    return sosfilt(butter(order, fc, "low", fs=SR, output="sos"), x)


def hp(x, fc, order=2):
    return sosfilt(butter(order, fc, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


# ------------------------------------------------------------------ drum voices
def kick():
    t = t_arr(0.45)
    f = 48 + 110 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    body = np.sin(ph) * np.exp(-t * 7.5)
    click = hp(rng.standard_normal(len(t)), 2000) * np.exp(-t * 300) * 0.25
    return np.tanh((body + click) * 1.6) * 0.9


def clap():
    t = t_arr(0.3)
    env = np.zeros_like(t)
    for k, d in enumerate([0, 0.011, 0.022]):
        env += (t >= d) * np.exp(-(t - d).clip(0) * (220 if k < 2 else 22))
    return bp(rng.standard_normal(len(t)), 900, 3200) * env * 0.55


def hat(open_=False):
    t = t_arr(0.25 if open_ else 0.06)
    return hp(rng.standard_normal(len(t)), 7500, 4) * np.exp(-t * (14 if open_ else 70)) * 0.22


def snare():
    t = t_arr(0.18)
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30) * 0.4
    return (bp(rng.standard_normal(len(t)), 1200, 6000) * np.exp(-t * 18) * 0.5 + tone)


def crash():
    t = t_arr(2.2)
    return hp(rng.standard_normal(len(t)), 5000, 2) * np.exp(-t * 2.2) * 0.22


def impact():
    t = t_arr(1.6)
    f = 32 + 70 * np.exp(-t * 9)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.4)
    noise = lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 6) * 0.6
    return np.tanh((sub + noise) * 1.8) * 0.9


def riser(d):
    t = t_arr(d)
    x = rng.standard_normal(len(t))
    out = np.zeros_like(x)
    seg = int(SR * 0.05)
    for i in range(0, len(x), seg):
        prog = i / len(x)
        lo = 400 + 5000 * prog ** 2
        out[i:i + seg] = bp(x[i:i + seg + 1000], lo, min(lo * 2.2, 20000))[: len(x[i:i + seg])]
    sweep = sawtooth(2 * np.pi * np.cumsum(220 + 660 * (t / d) ** 2) / SR) * 0.08
    return (out * 0.35 + sweep) * (t / d) ** 1.6


# ------------------------------------------------------------------ tonal voices
def supersaw(notes, d, cutoff, detune=0.18):
    t = t_arr(d)
    left, right = np.zeros_like(t), np.zeros_like(t)
    for n in notes:
        for k, dt in enumerate(np.linspace(-detune, detune, 5)):
            f = midi(n + dt)
            v = sawtooth(2 * np.pi * f * t + rng.uniform(0, 6.28))
            (left if k % 2 == 0 else right)[:] += v
            if k == 2:
                left += v * 0.5
                right += v * 0.5
    att = np.clip(t / 0.01, 0, 1)
    rel = np.clip((d - t) / 0.05, 0, 1)
    env = att * rel
    return np.stack([lp(left, cutoff, 2) * env, lp(right, cutoff, 2) * env]) / (len(notes) * 4)


def bass_note(n, d):
    t = t_arr(d)
    f = midi(n)
    v = sawtooth(2 * np.pi * f * t) * 0.6 + np.sin(2 * np.pi * f / 2 * t) * 0.7
    env = np.clip(t / 0.005, 0, 1) * np.exp(-t * 3) * np.clip((d - t) / 0.02, 0, 1)
    return lp(v, 520, 2) * env


def pluck(n, d=0.22):
    t = t_arr(d)
    f = midi(n)
    v = (sawtooth(2 * np.pi * f * t, 0.5) + 0.4 * np.sin(2 * np.pi * 2 * f * t)) * np.exp(-t * 16)
    return lp(v, 4200) * 0.22


# Am - F - C - G (one chord per bar)
CHORDS = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
ROOTS = [45, 41, 36, 43]
BARS = int(DUR / (4 * BEAT))

K, C, HC, HO, S = kick(), clap(), hat(), hat(True), snare()
pad_bus_l, pad_bus_r = np.zeros(N), np.zeros(N)
sidechain = np.ones(N)

for bar in range(BARS):
    t0 = bar * 4 * BEAT
    chord, root = CHORDS[bar % 4], ROOTS[bar % 4]
    hook = bar < 2
    final = bar == BARS - 1
    build = bar == BARS - 2
    if final:
        continue
    for b in range(4):
        tb = t0 + b * BEAT
        place(K, tb, 1.0)
        # sidechain duck shape after every kick
        i = int(tb * SR)
        n = min(int(0.32 * SR), N - i)
        sidechain[i:i + n] = np.minimum(sidechain[i:i + n], 0.25 + 0.75 * (np.arange(n) / n) ** 0.6)
        if b in (1, 3):
            place(C, tb, 0.9)
        place(HO if not hook else HC, tb + BEAT / 2, 0.8, pan=0.2)
        for s in (0.25, 0.75):
            place(HC, tb + s * BEAT, 0.5, pan=-0.25)
        # bass: offbeat 8ths, octave jumps
        place(bass_note(root, BEAT * 0.45), tb + BEAT / 2, 0.75)
        if not hook:
            place(bass_note(root + 12, BEAT * 0.2), tb + 0.75 * BEAT, 0.35)
    # chords (filtered during the hook, open after the drop)
    cutoff = 900 + 900 * bar if hook else (5200 if not build else 3500)
    pad = supersaw([n + 12 for n in chord], 4 * BEAT, cutoff)
    i = int(t0 * SR)
    pad_bus_l[i:i + pad.shape[1]] += pad[0][: N - i]
    pad_bus_r[i:i + pad.shape[1]] += pad[1][: N - i]
    # arp after the drop
    if not hook:
        seq = [0, 1, 2, 1, 2, 0, 2, 1]
        for k in range(16):
            note = chord[seq[k % 8]] + 24 if k % 4 != 3 else chord[0] + 36
            place(pluck(note), t0 + k * BEAT / 4, 0.55 if not build else 0.4, pan=0.35 if k % 2 else -0.35)
    if build:
        for k in range(8):
            place(S, t0 + 2 * BEAT + k * BEAT / 4, 0.25 + 0.06 * k)

# hook: impact on 1, snare roll + riser into the drop at 4.0 s
place(impact(), 0.0, 0.9)
place(crash(), 0.0, 0.8)
for k in range(8):
    place(S, 3.0 + k * BEAT / 8, 0.2 + 0.07 * k)
place(riser(2.0), 2.0, 0.9)
place(crash(), 4.0, 1.0)
place(impact(), 4.0, 0.6)
# small lift into the CTA and end card
place(riser(1.0), 25.0, 0.6)
place(crash(), 26.0, 0.8)
place(riser(1.0), 28.0, 0.7)

# final hit at 29.0 s, rings to the end
tf = 29.0
place(impact(), tf, 1.0)
place(crash(), tf, 1.0)
place(K, tf, 1.0)
fin = supersaw([n + 12 for n in [57, 60, 64, 69]], 1.0, 4500)
fade = np.linspace(1, 0, fin.shape[1]) ** 1.5
place(fin * fade, tf, 1.3)
place(bass_note(33, 1.0), tf, 1.0)

L += pad_bus_l * sidechain * 0.9
R += pad_bus_r * sidechain * 0.9

# simple stereo delay on the whole bed for space
d = int(SR * BEAT * 0.75)
L[d:] += 0.12 * R[:-d]
R[d:] += 0.12 * L[:-d]

mix = np.stack([L, R], axis=1)
mix = hp(mix.T, 28).T
mix = np.tanh(mix * 1.2) / np.tanh(1.2)
# 30 ms fade-out at the very end so the last sample is silent
fo = int(SR * 0.03)
mix[-fo:] *= np.linspace(1, 0, fo)[:, None]
meter = pyln.Meter(SR)
mix = pyln.normalize.loudness(mix, meter.integrated_loudness(mix), -14.0)
mix /= max(1.0, np.abs(mix).max() / 0.95)
out = ROOT / "public" / "audio" / "music.wav"
out.parent.mkdir(parents=True, exist_ok=True)
sf.write(out, mix.astype(np.float32), SR, subtype="PCM_24")
print("music:", out, f"{len(mix)/SR:.2f}s", f"{meter.integrated_loudness(mix):.1f} LUFS")
