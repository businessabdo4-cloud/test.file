"""Original SFX library, synthesised (royalty-free) -> assets/sfx/*.wav (48 kHz mono)."""
import pathlib
import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt, stft, istft

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "sfx"
OUT.mkdir(parents=True, exist_ok=True)
SR = 48000
rng = np.random.default_rng(11)


def t_arr(d):
    return np.arange(int(SR * d)) / SR


def filt(x, kind, fc, order=2):
    return sosfilt(butter(order, fc, kind, fs=SR, output="sos"), x)


def tone(freqs, d, harmonics=(1,), decay=8.0):
    """freqs: callable t->Hz or float"""
    t = t_arr(d)
    f = freqs(t) if callable(freqs) else np.full_like(t, freqs)
    ph = 2 * np.pi * np.cumsum(f) / SR
    v = sum(np.sin(ph * h) / h for h in harmonics)
    return v * np.exp(-t * decay)


def swept_noise(d, f_lo, f_hi, shape):
    """Noise through a band that moves along a frequency curve (via STFT masking)."""
    x = rng.standard_normal(int(SR * d))
    fr, tt, Z = stft(x, SR, nperseg=1024)
    prog = tt / tt[-1]
    centre = f_lo * (f_hi / f_lo) ** shape(prog)
    mask = np.exp(-((np.log(fr[:, None] + 1) - np.log(centre[None, :])) ** 2) / (2 * 0.35 ** 2))
    _, y = istft(Z * mask, SR, nperseg=1024)
    return y[: len(x)]


def fade(x, a=0.003, r=0.02):
    n = len(x)
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    e[:na] = np.linspace(0, 1, na)
    e[-nr:] = np.linspace(1, 0, nr)
    return x * e


def norm(x, peak=0.9):
    return x / (np.abs(x).max() + 1e-9) * peak


S = {}
# transitions -------------------------------------------------------------
t = t_arr(0.6)
S["whoosh"] = swept_noise(0.6, 250, 5000, lambda p: np.sin(np.pi * p * 0.9) ** 1.2) * np.sin(np.pi * t / 0.6) ** 2
t = t_arr(1.2)
sub = tone(lambda t: 30 + 75 * np.exp(-t * 10), 1.2, decay=2.8)
S["impact"] = np.tanh(2.2 * (sub + filt(rng.standard_normal(len(t)), "low", 700) * np.exp(-t * 9) * 0.7))
t = t_arr(0.5)
S["hit"] = np.tanh(2 * (tone(lambda t: 45 + 120 * np.exp(-t * 25), 0.5, decay=6)
                        + filt(rng.standard_normal(len(t)), "band", [800, 6000]) * np.exp(-t * 25) * 0.6))
S["hit_small"] = S["hit"][: int(0.3 * SR)] * np.exp(-t_arr(0.3) * 4)
t = t_arr(0.5)
S["riser_short"] = swept_noise(0.5, 600, 9000, lambda p: p ** 1.5) * (t / 0.5) ** 2
t = t_arr(0.35)
S["stamp"] = np.tanh(2.5 * (tone(lambda t: 90 * np.exp(-t * 6), 0.35, decay=12)
                            + filt(rng.standard_normal(len(t)), "low", 2500) * np.exp(-t * 30)))
# shine / sparkle: random high pings
t = t_arr(0.8)
sp = np.zeros(len(t))
for k in range(14):
    st = rng.uniform(0, 0.5)
    i = int(st * SR)
    ping = tone(rng.uniform(3500, 8000), 0.25, harmonics=(1, 2.01), decay=22)
    sp[i:i + len(ping)] += ping[: len(sp) - i] * rng.uniform(0.3, 1)
S["shine"] = sp + swept_noise(0.8, 3000, 12000, lambda p: p) * np.sin(np.pi * t / 0.8) * 0.4

# UI / product ------------------------------------------------------------
S["pop"] = tone(lambda t: 260 + 700 * np.exp(-t * 60), 0.12, harmonics=(1, 2), decay=35)
S["pop_big"] = tone(lambda t: 180 + 900 * np.exp(-t * 45), 0.2, harmonics=(1, 2, 3), decay=22) + \
    filt(rng.standard_normal(int(0.2 * SR)), "high", 3000) * np.exp(-t_arr(0.2) * 60) * 0.3
S["tick"] = filt(rng.standard_normal(int(0.03 * SR)), "band", [2000, 7000]) * np.exp(-t_arr(0.03) * 200)
S["tap"] = tone(1200, 0.06, harmonics=(1, 2), decay=60)
sh = np.zeros(int(0.25 * SR))
for st in (0.0, 0.07):
    i = int(st * SR)
    c = filt(rng.standard_normal(int(0.06 * SR)), "band", [1500, 9000]) * np.exp(-t_arr(0.06) * 90)
    sh[i:i + len(c)] += c
S["shutter"] = sh
# bell for the checkmark
t = t_arr(1.0)
S["ding"] = sum(np.sin(2 * np.pi * 1318 * r * t) * np.exp(-t * (3 + 4 * k)) / (k + 1)
                for k, r in enumerate([1, 2.0, 2.76, 5.4]))


# robot blips (Citybot gestures) ------------------------------------------
def chirp_seq(freqs, step=0.055, wave_h=(1, 3, 5)):
    out = np.zeros(int(SR * (step * len(freqs) + 0.08)))
    for k, (f0, f1) in enumerate(freqs):
        seg = tone(lambda t, f0=f0, f1=f1: f0 + (f1 - f0) * t / step, step + 0.03, harmonics=wave_h, decay=18)
        i = int(k * step * SR)
        out[i:i + len(seg)] += seg
    # light bit-crush for a digital flavour
    return np.round(out * 24) / 24


S["blip"] = chirp_seq([(700, 1300), (1300, 1000)])
S["blip_up"] = chirp_seq([(660, 700), (880, 940), (1320, 1500)], step=0.07)
S["blip_jump"] = chirp_seq([(400, 1600)], step=0.12)
S["blip_wink"] = chirp_seq([(1500, 1100), (1100, 1700)], step=0.06)

# city noise for the Sony hook (appended last so the RNG sequence of the sounds above is unchanged)
t = t_arr(0.42)
honk = sum(np.sign(np.sin(2 * np.pi * f * t)) * 0.5 + np.sin(2 * np.pi * f * t) for f in (415.0, 523.0))
S["horn"] = filt(np.tanh(honk * 0.8), "low", 3200) * np.clip(t / 0.01, 0, 1) * np.clip((0.42 - t) / 0.04, 0, 1)
t = t_arr(1.75)
crowd = np.zeros(len(t))
for k in range(7):  # overlapping "voices": formant-band noise with syllabic modulation
    lo = rng.uniform(350, 900)
    v = filt(rng.standard_normal(len(t)), "band", [lo, lo * rng.uniform(2.2, 3.5)])
    syll = np.clip(np.sin(2 * np.pi * rng.uniform(3.5, 7.5) * t + rng.uniform(0, 6.28)), 0, 1) ** 1.5
    crowd += v * syll * rng.uniform(0.5, 1.0)
S["crowd"] = crowd * np.clip(t / 0.15, 0, 1) * np.clip((1.75 - t) / 0.08, 0, 1)
t = t_arr(1.1)
engine = sum(np.sin(2 * np.pi * 46 * h * t + h) / h for h in range(1, 9)) * (1 + 0.3 * np.sin(2 * np.pi * 9 * t))
hiss = filt(rng.standard_normal(len(t)), "high", 3000) * np.clip((t - 0.75) / 0.05, 0, 1) * np.exp(-np.clip(t - 0.8, 0, None) * 6)
S["bus"] = (filt(engine, "low", 400) * 0.8 + hiss * 0.5) * np.clip(t / 0.08, 0, 1) * np.clip((1.1 - t) / 0.05, 0, 1)
t = t_arr(0.9)
sweep = swept_noise(0.9, 6000, 150, lambda p: p ** 0.6) * np.exp(-t * 3.5)
S["anc"] = sweep + tone(lambda t: 120 * np.exp(-t * 6) + 40, 0.9, decay=5) * 0.6

for name, x in S.items():
    x = np.asarray(x, dtype=np.float64)
    sf.write(OUT / f"{name}.wav", norm(fade(x)).astype(np.float32), SR, subtype="PCM_16")
print("sfx:", ", ".join(sorted(S)))
