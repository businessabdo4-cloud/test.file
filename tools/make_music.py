"""Compose the ad's original background music (royalty-free by construction) and bake the dialogue ducking.

Light, playful pop at 118.25 BPM with a subtle darbuka (doum/tek) groove. The tempo/phase were chosen so the
Citybot burst, the showroom cut, the CITY slam and the high-five land on beats; dialogue timing never moves.
  street (before the burst): muffled, sparse — "the real world" (vi–IV)
  burst → end card: full bright groove (I–V–vi–IV), mallet hook, crash on the unboxing cut
  one-beat stop before the CITY slam, groove under the end card, final chord hit on the high-five, ring-out

Outputs assets/music/citystore_bed_raw.wav (track at -14 LUFS) and assets/music/citystore_bed.wav (gain + -10 dB
ducking under every line with 150 ms ramps, sample-accurate) and updates assets/music/music.json."""
import json
from pathlib import Path
import numpy as np
import soundfile as sf
import pyloudnorm as pyln
from scipy import signal

ROOT = Path(__file__).resolve().parent.parent
T = json.load(open(ROOT / "assets/vo/timings.json"))
CUES = {c["name"]: c["t"] for c in json.load(open(ROOT / "assets/sfx/cues.json"))}
L = {l["id"]: l for l in T["lines"]}
SR = 48000
DUR = T["durationSec"]
N = int(DUR * SR)
BPM, PHASE = 118.25, 0.334
BEAT = 60 / BPM
rng = np.random.default_rng(11)

BURST = CUES["citybotPop"]
SLAM = CUES["citySlam"]
FIVE = CUES["highFive"]
UNBOX = L["L2"]["end"]
beat_at = lambda t: int(round((t - PHASE) / BEAT))
time_of = lambda b: PHASE + b * BEAT
B_BURST, B_SLAM, B_FIVE = beat_at(BURST), beat_at(SLAM), beat_at(FIVE)

mixL = np.zeros(N)
mixR = np.zeros(N)


def place(x, t, gain=1.0, pan=0.0):
    a = int(round(t * SR))
    if a >= N or a + len(x) <= 0:
        return
    s0 = max(0, -a)
    x = x[s0:]
    a = max(0, a)
    x = x[: N - a]
    mixL[a:a + len(x)] += x * gain * np.sqrt(0.5 * (1 - pan))
    mixR[a:a + len(x)] += x * gain * np.sqrt(0.5 * (1 + pan))


def tt(d):
    return np.arange(int(d * SR)) / SR


def bp(x, lo, hi, o=2):
    return signal.sosfilt(signal.butter(o, [lo, hi], "band", fs=SR, output="sos"), x)


def lp(x, f, o=2):
    return signal.sosfilt(signal.butter(o, f, "low", fs=SR, output="sos"), x)


def hp(x, f, o=2):
    return signal.sosfilt(signal.butter(o, f, "high", fs=SR, output="sos"), x)


hz = lambda midi: 440 * 2 ** ((midi - 69) / 12)

# ---------------------------------------------------------------- instruments
def kick():
    t = tt(0.32)
    f = 46 + 80 * np.exp(-t * 32)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8)
    return x + 0.12 * hp(rng.standard_normal(len(t)), 3000) * np.exp(-t * 200)


def clap():
    t = tt(0.22)
    n = rng.standard_normal(len(t))
    env = sum(np.exp(-np.maximum(0, t - d) * 60) * (t >= d) for d in (0, 0.009, 0.018)) / 3
    return bp(n, 900, 4200) * env + 0.25 * np.sin(2 * np.pi * 220 * t) * np.exp(-t * 40)


def hat(open_=False):
    t = tt(0.18 if open_ else 0.05)
    return hp(rng.standard_normal(len(t)), 7500) * np.exp(-t * (18 if open_ else 90))


def doum():
    t = tt(0.3)
    f = 82 + 30 * np.exp(-t * 25)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 11) + 0.08 * bp(rng.standard_normal(len(t)), 200, 900) * np.exp(-t * 40)


def tek():
    t = tt(0.07)
    return bp(rng.standard_normal(len(t)), 2500, 6500) * np.exp(-t * 70) + 0.35 * np.sin(2 * np.pi * 880 * t) * np.exp(-t * 90)


def bass(midi, d):
    t = tt(d)
    f = hz(midi)
    x = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t)
    env = np.minimum(1, t / 0.006) * (0.55 + 0.45 * np.exp(-t * 6)) * np.minimum(1, (d - t) / 0.03)
    return np.tanh(1.4 * x * env) * 0.8


def pluck(midis, d, cutoff=3800):
    t = tt(d)
    x = np.zeros(len(t))
    for m in midis:
        for det in (-0.07, 0.0, 0.07):
            x += signal.sawtooth(2 * np.pi * hz(m + det) * t + rng.uniform(0, 6))
    x = lp(x / (3 * len(midis)), cutoff) * np.exp(-t * 7) * np.minimum(1, t / 0.004)
    return x


def mallet(midi, d=0.45):
    t = tt(d)
    f = hz(midi)
    return (np.sin(2 * np.pi * f * t) + 0.22 * np.sin(2 * np.pi * 3.93 * f * t) * np.exp(-t * 18)) * np.exp(-t * 7) * np.minimum(1, t / 0.003)


def riser(d):
    t = tt(d)
    n = rng.standard_normal(len(t))
    out = np.zeros(len(t))
    blk = 1024
    for i in range(0, len(t), blk):
        c = 400 * 2 ** (5 * i / len(t))
        out[i:i + blk] = bp(n[max(0, i - 4096):i + blk], c * 0.7, min(c * 1.4, SR / 2 - 100))[-len(out[i:i + blk]):]
    return out * (t / d) ** 2


def crash():
    t = tt(1.4)
    return hp(rng.standard_normal(len(t)), 5000) * np.exp(-t * 3.5) * 0.6


# ---------------------------------------------------------------- harmony (C major)
C, G, Am, F = [60, 64, 67], [59, 62, 67], [57, 60, 64], [57, 60, 65]
ROOT_OF = {id(C): 36, id(G): 43, id(Am): 45, id(F): 41}
PROG = [C, G, Am, F]
INTRO = [Am, F]
HOOK = [76, 79, 81, 79, 76, 74, 72, None]  # E5 G5 A5 G5 E5 D5 C5 — pentatonic, playful

first = int(np.floor(-PHASE / BEAT))
last = int(np.ceil((DUR - PHASE) / BEAT))
for b in range(first, last):
    t0 = time_of(b)
    if t0 < -0.01 or t0 > DUR:
        continue
    rel = b - B_BURST
    bar, pos = rel // 4, rel % 4
    if b < B_BURST:
        # street intro: muffled vi–IV plucks on the off-beats + soft shaker; riser into the burst
        ch = INTRO[(b // 4) % 2]
        place(lp(pluck(ch, BEAT * 0.9, 1400), 1100), t0 + BEAT / 2, 0.55, 0.2)
        place(hat(), t0, 0.07, -0.3)
        place(hat(), t0 + BEAT / 2, 0.05, 0.3)
        if pos == 0:
            place(bass(ROOT_OF[id(ch)], BEAT * 1.8), t0, 0.35)
        continue
    if b > B_FIVE:
        continue  # after the final hit only the ring-out remains
    stop = b == B_SLAM - 1  # one-beat stop before the CITY slam
    ch = PROG[bar % 4]
    root = ROOT_OF[id(ch)]
    if b == B_FIVE:
        # final hit on the high-five, then let it ring through the hold
        place(kick(), t0, 0.9)
        place(crash(), t0, 0.5)
        place(pluck(C + [72], 1.9, 5200), t0, 0.75)
        place(bass(36, 1.6) * np.exp(-tt(1.6) * 2.4), t0, 0.7)  # decaying, not a drone
        place(mallet(84, 1.8), t0, 0.35)
        continue
    if stop:
        place(mallet(79, 0.4), t0, 0.25)
        continue
    # drums
    if pos in (0, 2):
        place(kick(), t0, 0.85)
    if pos == 3 and bar % 2 == 1:
        place(kick(), t0 + BEAT / 2, 0.55)
    if pos in (1, 3):
        place(clap(), t0, 0.5, 0.05)
    place(hat(), t0, 0.16, -0.35)
    place(hat(open_=(pos == 3)), t0 + BEAT / 2 + 0.012, 0.13, -0.35)
    # darbuka (maqsum-like: D T . T | D . T .), panned and light
    for slot, kind in ((0, "D"), (1, "T"), (3, "T"), (4, "D"), (6, "T")):
        if pos == slot // 2:
            place(doum() if kind == "D" else tek(), t0 + (slot % 2) * BEAT / 2, 0.32 if kind == "D" else 0.22, 0.45 if kind == "T" else -0.2)
    # bass: root on the beat, octave pop on the "and" of 2
    place(bass(root, BEAT * 0.9), t0, 0.62)
    if pos == 1:
        place(bass(root + 12, BEAT * 0.4), t0 + BEAT / 2, 0.38)
    # chord stabs on the off-beats
    place(pluck(ch, BEAT * 0.45), t0 + BEAT / 2, 0.42, 0.25 if pos % 2 else -0.25)
    # mallet hook in the 2nd half of every other bar
    if bar % 2 == 1:
        for k in range(2):
            note = HOOK[(pos * 2 + k) % len(HOOK)]
            if note:
                place(mallet(note), t0 + k * BEAT / 2, 0.3, 0.1)

place(riser(BEAT * 2), time_of(B_BURST) - BEAT * 2, 0.28)
place(crash(), time_of(beat_at(UNBOX)), 0.35, 0.2)
place(crash(), SLAM, 0.45, -0.2)

# ---------------------------------------------------------------- space + master
ir_t = tt(0.9)
ir = rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 6)
ir /= np.sqrt(np.sum(ir ** 2))
wetL = signal.fftconvolve(hp(mixL, 300), ir)[:N]
wetR = signal.fftconvolve(hp(mixR, 300), np.roll(ir, 211))[:N]
st = np.stack([mixL + 0.18 * wetL, mixR + 0.18 * wetR], axis=1)
st = hp(st.T, 30).T
fade = int(0.35 * SR)
st[-fade:] *= np.linspace(1, 0, fade)[:, None]
meter = pyln.Meter(SR)
st *= 10 ** ((-14 - meter.integrated_loudness(st)) / 20)
st = np.tanh(st / 0.89) * 0.89  # gentle ceiling
st *= 10 ** ((-14 - meter.integrated_loudness(st)) / 20)
out = ROOT / "assets/music"
sf.write(out / "citystore_bed_raw.wav", st.astype(np.float32), SR, subtype="PCM_24")

# ---------------------------------------------------------------- bake ducking (sample-accurate)
cfg = json.load(open(out / "music.json"))
base_db, duck_db, ramp = cfg.get("gainDb", -11), cfg.get("duckDb", -10), cfg.get("rampSec", 0.15)
tsec = np.arange(N) / SR
env = np.zeros(N)
for l in T["lines"]:
    e = np.clip(np.minimum((tsec - (l["start"] - ramp)) / ramp, ((l["end"] + ramp) - tsec) / ramp), 0, 1)
    env = np.maximum(env, e)
gain = 10 ** ((base_db + duck_db * env) / 20)
bed = st * gain[:, None]
sf.write(out / "citystore_bed.wav", bed.astype(np.float32), SR, subtype="PCM_24")
cfg.update({"file": "music/citystore_bed.wav", "baked": True, "bpm": BPM, "phase": PHASE,
            "_note": "Original track by tools/make_music.py; ducking baked in (gainDb, duckDb, rampSec)."})
json.dump(cfg, open(out / "music.json", "w"), indent=1)

speech = env > 0.99
print(f"{BPM} BPM, burst beat {B_BURST}, slam beat {B_SLAM}, high-five beat {B_FIVE}")
print(f"raw track {meter.integrated_loudness(st):.1f} LUFS; bed under speech ≈ {base_db + duck_db} dB, in gaps ≈ {base_db} dB")
