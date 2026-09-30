"""Step 1.4 + sound design: clean voice (master), synthesize SFX + ambient bed, duck, mix -> work/mix.wav"""
import json, subprocess, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, sosfiltfilt

TL = json.load(open('src/data/timeline.json'))
SR = 48000
DUR = TL['videoDuration']
N = int(round(DUR * SR))
ev = TL['events']
rng = np.random.default_rng(3)

def ff(*a): subprocess.run(['ffmpeg', '-v', 'error', '-y', *a], check=True)

def loudnorm(src, dst, I=-14.0, TP=-1.5, extra=''):
    """Two-pass EBU R128 normalisation (linear mode)."""
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', src, '-af', f'{extra}loudnorm=I={I}:TP={TP}:LRA=11:print_format=json',
                        '-f', 'null', '-'], capture_output=True, text=True).stderr
    m = json.loads(r[r.rindex('{'):r.rindex('}') + 1])
    ff('-i', src, '-af', f"{extra}loudnorm=I={I}:TP={TP}:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
       f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,"
       f"aresample={SR}", '-c:a', 'pcm_f32le', dst)

# ---------- 1. voice: trim silence, light cleanup, -14 LUFS ----------
t0, vd = TL['trimStart'], TL['voiceDuration']
ff('-i', 'voiceover.wav', '-af', f'atrim=start={t0}:duration={vd},asetpts=PTS-STARTPTS,'
   'afade=t=in:d=0.02,afade=t=out:st=%.3f:d=0.08,highpass=f=70:p=2,afftdn=nr=6:nf=-48:tn=1,aresample=%d' % (vd - 0.08, SR),
   '-c:a', 'pcm_f32le', 'work/voice_pre.wav')
loudnorm('work/voice_pre.wav', 'work/voice.wav')
v, _ = sf.read('work/voice.wav', dtype='float64')
voice = np.zeros(N); voice[:min(len(v), N)] = v[:N]

# ---------- 2. sound design ----------
def env(n, a, d):  # attack/decay envelope in seconds
    t = np.arange(n) / SR
    return np.minimum(t / max(a, 1e-4), 1) * np.exp(-np.maximum(t - a, 0) / d)

def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], 'bandpass', fs=SR, output='sos'), x)

def place(buf, x, t, gain_db):
    i = int(t * SR); j = min(N, i + len(x))
    if i < N: buf[i:j] += x[:j - i] * 10 ** (gain_db / 20)

def whoosh(d=0.5, rise=0.6):
    n = int(d * SR); t = np.arange(n) / n
    noise = rng.normal(0, 1, n)
    # sweep a band-pass upward by processing in chunks
    out = np.zeros(n); k = 16
    for c in range(k):
        a, b = c * n // k, (c + 1) * n // k
        f = 300 + 2600 * (c / k) ** 1.4
        out[a:b] = bp(noise, f * 0.6, f * 1.6)[a:b]
    shape = np.sin(np.pi * np.clip(t / rise, 0, 1) * 0.5) ** 2 * np.clip((1 - t) / (1 - rise), 0, 1) ** 1.5
    return out * shape / (np.abs(out).max() + 1e-9)

def click(freq=2400, d=0.035):
    n = int(d * SR); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * freq * t) * env(n, 0.0008, 0.006) + bp(rng.normal(0, 0.6, n), 1500, 6000) * env(n, 0.0005, 0.004)
    return x / np.abs(x).max()

def key_tap():
    n = int(0.06 * SR); t = np.arange(n) / SR
    thock = np.sin(2 * np.pi * 180 * t) * env(n, 0.001, 0.012)
    tick = bp(rng.normal(0, 1, n), 2000, 7000) * env(n, 0.0004, 0.005)
    x = 0.8 * thock + 0.6 * tick
    return x / np.abs(x).max()

def soft_pop(freq=880):
    n = int(0.12 * SR); t = np.arange(n) / SR
    f = freq * (1 + 0.25 * np.exp(-t * 60))
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.035)
    return x

def chime():
    n = int(1.2 * SR); t = np.arange(n) / SR
    x = sum(a * np.sin(2 * np.pi * f * t) * env(n, 0.004, dcy) for f, a, dcy in
            [(1318.5, 1.0, 0.45), (1975.5, 0.45, 0.3), (2637, 0.2, 0.2), (659.25, 0.35, 0.6)])
    return x / np.abs(x).max()

sfx = np.zeros(N)
for key in ('t1', 't2', 't3'):
    a, b = ev[key]
    w = whoosh(0.55, 0.62)
    place(sfx, w, (a + b) / 2 - 0.55 * 0.62, -24)          # peak of the whoosh lands mid-transition
place(sfx, whoosh(0.7, 0.5), TL['beats'][1]['start'] + 0.02, -31)   # phone rising
for i, t in enumerate(ev['notif']):
    place(sfx, soft_pop(990 + 110 * i), t, -30)
for i in range(4):
    place(sfx, soft_pop(1180), ev['realisations'] + 0.05 + i * 0.12, -36)
place(sfx, click(2200), ev['devisPulse'], -24)
place(sfx, soft_pop(740), ev['devisForm'], -28)
place(sfx, chime(), ev['check'] + 0.30, -31)
for t in ev['typing']:
    place(sfx, key_tap(), t, -22)
place(sfx, click(2600), ev['send'], -23)
place(sfx, whoosh(0.35, 0.4), ev['send'] + 0.03, -29)

# warm ambient bed: slow Dmaj9 -> Bm9 pad, low-passed, very quiet
t = np.arange(N) / SR
def pad(freqs, t0, t1):
    seg = np.zeros(N); m = (t >= t0) & (t < t1)
    for f in freqs:
        for det in (-0.12, 0.12):
            seg[m] += np.sin(2 * np.pi * f * (1 + det / 100) * t[m] + rng.uniform(0, 6))
    fade = np.clip((t - t0) / 1.2, 0, 1) * np.clip((t1 - t) / 1.2, 0, 1)
    return seg * fade
bed = pad([146.83, 220.0, 277.18, 329.63], -1, 7.9) + pad([123.47, 185.0, 246.94, 293.66], 6.7, DUR + 1.5)
bed = sosfiltfilt(butter(2, 900, 'lowpass', fs=SR, output='sos'), bed)
bed *= 1 + 0.15 * np.sin(2 * np.pi * 0.2 * t)
bed *= np.clip((DUR - t) / 0.6, 0, 1)                      # clean ending
bed /= np.abs(bed).max()
# sidechain duck under the voice (~-8 dB when speaking)
venv = sosfiltfilt(butter(1, 4, 'lowpass', fs=SR, output='sos'), np.abs(voice))
duck = 1 - 0.6 * np.clip(venv / (np.percentile(venv, 95) + 1e-9), 0, 1)
bed = bed * duck * 10 ** (-33 / 20)

mix = voice + sfx + bed
sf.write('work/mix_pre.wav', mix.astype(np.float32), SR, subtype='FLOAT')
loudnorm('work/mix_pre.wav', 'work/mix.wav', extra='alimiter=limit=0.84:attack=3:release=50:level=false:latency=true,')
m, _ = sf.read('work/mix.wav'); print('mix', len(m) / SR, 's  peak', 20 * np.log10(np.abs(m).max()), 'dBFS')
