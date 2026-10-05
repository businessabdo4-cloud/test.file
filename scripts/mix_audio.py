"""Final audio mix -> public/audio/mix.wav (48 kHz stereo, exactly 30.0 s).

- VO stem (public/audio/vo/*.wav placed at timeline start times) at -14 LUFS integrated
- Music: assets/music/<first file> if present, else the generated public/audio/music.wav.
  Sits at MUSIC_LUFS and is ducked DUCK_DB under the VO with RAMP_MS ramps.
- SFX: cues from public/data/timeline.json, files from assets/sfx/
- Peak limiter at -1 dBFS (sample peak, 4x oversampled check)
"""
import json
import pathlib
import subprocess

import numpy as np
import pyloudnorm as pyln
import soundfile as sf
from scipy.ndimage import maximum_filter1d
from scipy.signal import resample_poly

from reel import ASSETS, PUB, REEL

ROOT = pathlib.Path(__file__).resolve().parent.parent
TL = json.loads((PUB / "data" / "timeline.json").read_text())
SR = 48000
DUR = TL["totalFrames"] / TL["fps"]
N = int(round(SR * DUR))
VO_LUFS = -14.0
MUSIC_LUFS = -19.0
DUCK_DB = -10.0
RAMP_MS = 150
SFX_BUS_DB = -1.0
CEILING = 10 ** (-1.0 / 20)
meter = pyln.Meter(SR)


def load(path, stereo=True):
    tmp = ROOT / ".cache" / "mix" / REEL / (path.stem + "_48k.wav")
    tmp.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(path), "-ar", str(SR), "-ac", "2" if stereo else "1", str(tmp)],
                   check=True)
    x, _ = sf.read(tmp, dtype="float64")
    return x


def place(bus, x, t, gain=1.0):
    i = int(round(t * SR))
    if i >= N:
        return
    n = min(len(x), N - i)
    bus[i:i + n] += x[:n] * gain


# ---- VO
vo = np.zeros((N, 2))
for line in TL["vo"]:
    x = load(PUB / "audio" / "vo" / f"{line['id']}.wav")
    place(vo, x, line["start"])
vo_lufs_raw = meter.integrated_loudness(vo)
vo *= 10 ** ((VO_LUFS - vo_lufs_raw) / 20)

# ---- music
tracks = sorted(p for p in (ASSETS / "music").glob("*") if p.suffix.lower() in (".wav", ".mp3", ".m4a", ".aac", ".flac", ".ogg"))
music_src = tracks[0] if tracks else PUB / "audio" / "music.wav"
music = load(music_src)[:N]
if len(music) < N:
    music = np.pad(music, ((0, N - len(music)), (0, 0)))
music *= 10 ** ((MUSIC_LUFS - meter.integrated_loudness(music)) / 20)
if tracks:  # external track: fade out over the last second
    fo = int(SR * 1.0)
    music[-fo:] *= np.linspace(1, 0, fo)[:, None]

# duck envelope (in dB, linear ramps of RAMP_MS)
active = np.zeros(N, dtype=bool)
for line in TL["vo"]:
    a = max(0, int((line["start"] - 0.05) * SR))
    b = min(N, int((line["start"] + line["duration"] + 0.08) * SR))
    active[a:b] = True
target_db = np.where(active, DUCK_DB, 0.0)
step = abs(DUCK_DB) / (RAMP_MS / 1000 * SR)
env_db = np.empty(N)
cur = 0.0
for i in range(N):  # slew-limited follower = linear 150 ms ramps
    tgt = target_db[i]
    cur = max(cur - step, tgt) if tgt < cur else min(cur + step, tgt)
    env_db[i] = cur
music *= (10 ** (env_db / 20))[:, None]

# ---- SFX
sfx = np.zeros((N, 2))
cache = {}
for cue in TL["sfx"]:
    if cue["name"] not in cache:
        cache[cue["name"]] = load(ROOT / "assets" / "sfx" / f"{cue['name']}.wav")
    place(sfx, cache[cue["name"]], cue["t"], 10 ** ((cue["gainDb"] + SFX_BUS_DB) / 20))

mix = vo + music + sfx

# ---- limiter (lookahead peak, 4x oversampled detection)
over = np.abs(resample_poly(mix, 4, 1, axis=0)).max(axis=1).reshape(-1, 4).max(axis=1)[:N]
look = int(0.005 * SR)
peak = maximum_filter1d(over, size=2 * look + 1)
gain = np.minimum(1.0, CEILING / np.maximum(peak, 1e-9))
rel = np.exp(-1 / (0.08 * SR))
g = np.empty(N)
cur = 1.0
for i in range(N):
    cur = gain[i] if gain[i] < cur else cur * rel + gain[i] * (1 - rel)
    g[i] = cur
mix *= g[:, None]
mix = np.clip(mix, -CEILING, CEILING)

out = PUB / "audio" / "mix.wav"
sf.write(out, mix.astype(np.float32), SR, subtype="PCM_16")
for name, stem in (("vo", vo), ("music", music), ("sfx", sfx)):
    sf.write(ROOT / ".cache" / "mix" / REEL / f"stem_{name}.wav", stem.astype(np.float32), SR, subtype="PCM_16")
tp = 20 * np.log10(np.abs(resample_poly(mix, 4, 1, axis=0)).max())
print(f"music source: {music_src.relative_to(ROOT)}")
print(f"VO stem: {meter.integrated_loudness(vo * g[:, None]):.1f} LUFS (target {VO_LUFS})")
print(f"mix: {meter.integrated_loudness(mix):.1f} LUFS integrated, true peak ~{tp:.1f} dBTP, "
      f"max limiter GR {20*np.log10(g.min()):.1f} dB, {len(mix)/SR:.3f}s")
