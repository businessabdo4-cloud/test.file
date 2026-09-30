"""Step 1.4 + sound design: clean voice (master), synthesized SFX + a quiet background song, duck, mix -> work/mix.wav"""
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

def bp(x, lo, hi, order=2): return sosfilt(butter(order, [lo, hi], 'bandpass', fs=SR, output='sos'), x)
def lp(x, f, order=2): return sosfilt(butter(order, f, 'lowpass', fs=SR, output='sos'), x)
def hp(x, f, order=2): return sosfilt(butter(order, f, 'highpass', fs=SR, output='sos'), x)
def norm(x): return x / (np.abs(x).max() + 1e-12)

def place(buf, x, t, gain_db):
    i = int(round(t * SR)); j = min(N, i + len(x))
    if i < 0: x, i = x[-i:], 0
    if i < N: buf[i:j] += x[:j - i] * 10 ** (gain_db / 20)

def whoosh(d=0.5, rise=0.6, f0=300, f1=2900):
    n = int(d * SR); t = np.arange(n) / n
    noise = rng.normal(0, 1, n); out = np.zeros(n); k = 20
    for c in range(k):  # band-pass swept upward
        a, b = c * n // k, (c + 1) * n // k
        f = f0 + (f1 - f0) * (c / k) ** 1.4
        out[a:b] = bp(noise, f * 0.6, min(f * 1.6, 20000))[a:b]
    shape = np.sin(np.pi * np.clip(t / rise, 0, 1) * 0.5) ** 2 * np.clip((1 - t) / (1 - rise), 0, 1) ** 1.5
    return norm(out * shape)

def impact(d=1.1, weight=1.0):
    """Cinematic hit: pitched sub drop + body thump + short noise crack."""
    n = int(d * SR); t = np.arange(n) / SR
    f = 38 + 90 * np.exp(-t * 18)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.38 * weight)
    body = np.sin(2 * np.pi * 170 * t) * env(n, 0.001, 0.06)
    crack = lp(hp(rng.normal(0, 1, n), 900), 7000) * env(n, 0.0005, 0.035)
    return norm(1.0 * sub + 0.45 * body + 0.35 * crack)

def sparkle(d=0.9):
    n = int(d * SR); t = np.arange(n) / SR
    x = np.zeros(n)
    for k, f in enumerate([2637, 3136, 3520, 4186, 5274]):
        on = int(k * 0.035 * SR)
        x[on:] += np.sin(2 * np.pi * f * t[:n - on]) * env(n - on, 0.003, 0.22) * (1 - 0.12 * k)
    return norm(x * (1 + 0.3 * np.sin(2 * np.pi * 14 * t)))

def click(freq=2400, d=0.035):
    n = int(d * SR); t = np.arange(n) / SR
    return norm(np.sin(2 * np.pi * freq * t) * env(n, 0.0008, 0.006) + bp(rng.normal(0, 0.6, n), 1500, 6000) * env(n, 0.0005, 0.004))

def key_tap():
    n = int(0.06 * SR); t = np.arange(n) / SR
    thock = np.sin(2 * np.pi * 180 * t) * env(n, 0.001, 0.012)
    tick = bp(rng.normal(0, 1, n), 2000, 7000) * env(n, 0.0004, 0.005)
    return norm(0.8 * thock + 0.6 * tick)

def soft_pop(freq=880):
    n = int(0.12 * SR); t = np.arange(n) / SR
    f = freq * (1 + 0.25 * np.exp(-t * 60))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.035)

def sent_bloop():
    """'Message sent': two quick rising tones."""
    out = np.zeros(int(0.32 * SR))
    for k, (fa, fb) in enumerate([(620, 930), (930, 1400)]):
        n = int(0.14 * SR); t = np.arange(n) / SR
        f = fa + (fb - fa) * np.clip(t / 0.05, 0, 1)
        tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.003, 0.05)
        i = int(k * 0.09 * SR); out[i:i + n] += tone
    return norm(out)

def chime():
    n = int(1.2 * SR); t = np.arange(n) / SR
    return norm(sum(a * np.sin(2 * np.pi * f * t) * env(n, 0.004, dcy) for f, a, dcy in
                    [(1318.5, 1.0, 0.45), (1975.5, 0.45, 0.3), (2637, 0.2, 0.2), (659.25, 0.35, 0.6)]))

sfx = np.zeros(N)
# -- hook: whoosh racing into a hard impact on "DESIGNERS", then a sparkle hit on "Maroc"
place(sfx, whoosh(0.26, 0.92, 500, 5200), ev['impact'] - 0.24, -15)
place(sfx, impact(1.2, 1.0), ev['impact'], -9)
place(sfx, impact(0.6, 0.45), ev['marocHit'], -19)
place(sfx, sparkle(), ev['marocHit'], -21)
# -- transitions + UI
for key in ('t1', 't2', 't3'):
    a, b = ev[key]
    place(sfx, whoosh(0.55, 0.62), (a + b) / 2 - 0.55 * 0.62, -23)
place(sfx, whoosh(0.7, 0.5), TL['beats'][1]['start'] + 0.02, -30)   # phone rising
for i, t in enumerate(ev['notif']):
    place(sfx, soft_pop(990 + 110 * i), t, -27)
for i in range(4):
    place(sfx, soft_pop(1180), ev['realisations'] + 0.05 + i * 0.13, -33)
place(sfx, click(2200), ev['devisPulse'], -23)
place(sfx, soft_pop(740), ev['devisForm'], -26)
place(sfx, chime(), ev['check'] + 0.30, -28)
# -- "Envoyez-moi « SITE »": chat pops up, SITE is typed, sent, then lands big on the end card
place(sfx, whoosh(0.42, 0.55, 400, 3600), TL['beats'][3]['start'] - 0.2, -19)
place(sfx, soft_pop(660), TL['beats'][3]['start'] + 0.12, -22)
for t in ev['typing']:
    place(sfx, key_tap(), t, -16)
place(sfx, click(2600), ev['send'], -19)
place(sfx, sent_bloop(), ev['send'] + 0.02, -17)
place(sfx, whoosh(0.35, 0.4, 600, 4200), ev['send'] + 0.03, -24)
place(sfx, whoosh(0.3, 0.9, 500, 4800), ev['bigSite'] - 0.28, -22)
place(sfx, impact(0.9, 0.7), ev['bigSite'], -14)
place(sfx, sparkle(), ev['bigSite'] + 0.02, -24)

# ---------- 3. background song: quiet 100 BPM lo-fi house groove in A minor ----------
BPM = 100; BEAT = 60 / BPM; BAR = 4 * BEAT
S0 = ev['musicStart']
song = np.zeros(N)
drums = np.zeros(N)
t_all = np.arange(N) / SR
CHORDS = [  # (bass root Hz, voicing Hz) Am9 | Fmaj7 | Cmaj7 | G6
    (110.00, [220.00, 261.63, 329.63, 392.00, 493.88]),
    (87.31, [220.00, 261.63, 329.63, 349.23, 440.00]),
    (130.81, [246.94, 261.63, 329.63, 392.00, 493.88]),
    (98.00, [246.94, 293.66, 329.63, 392.00, 493.88]),
]

def kick():
    n = int(0.35 * SR); t = np.arange(n) / SR
    f = 48 + 110 * np.exp(-t * 35)
    return norm(np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.14))

def clap():
    n = int(0.25 * SR)
    x = bp(rng.normal(0, 1, n), 900, 4200) * env(n, 0.002, 0.07)
    x[: int(0.02 * SR)] *= 1.6
    return norm(x + 0.3 * np.sin(2 * np.pi * 190 * np.arange(n) / SR) * env(n, 0.001, 0.05))

def hat(open_=False):
    n = int((0.18 if open_ else 0.05) * SR)
    return norm(hp(rng.normal(0, 1, n), 7500) * env(n, 0.0005, 0.07 if open_ else 0.015))

def keys(freqs, d):
    """Soft electric-piano chord: a few decaying harmonics with gentle tremolo."""
    n = int(d * SR); t = np.arange(n) / SR
    x = np.zeros(n)
    for f in freqs:
        for h, a in ((1, 1.0), (2, 0.35), (3, 0.12)):
            x += a * np.sin(2 * np.pi * f * h * t + rng.uniform(0, 6)) * env(n, 0.008, 0.9 / h)
    return norm(x * (1 + 0.12 * np.sin(2 * np.pi * 5 * t)))

def bass_note(f, d):
    n = int(d * SR); t = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t)
    return norm(np.tanh(1.4 * x) * env(n, 0.006, 0.45))

def pluck(f):
    n = int(0.3 * SR); t = np.arange(n) / SR
    return norm((np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)) * env(n, 0.002, 0.09))

K, C, HC, HO = kick(), clap(), hat(), hat(True)
drop_out = (ev['t3'][0], TL['beats'][3]['start'] + 0.22)       # breakdown under the zoom-through, back for the CTA
bar_i = 0
t_bar = S0
while t_bar < DUR:
    root, voicing = CHORDS[bar_i % 4]
    last = t_bar + BAR > DUR + 0.2                                 # final bar: one ringing chord, no groove
    place(song, keys(voicing, 2.6 if not last else 1.6), t_bar, -6)
    place(song, bass_note(root, 1.0 if not last else 1.2), t_bar, -4)
    if not last:
        place(song, keys(voicing, 1.2), t_bar + 1.5 * BEAT, -12)  # syncopated stab on 2&
        place(song, bass_note(root, 0.5), t_bar + 1.5 * BEAT, -8)
        place(song, bass_note(root * (1.5 if bar_i % 2 else 2), 0.5), t_bar + 3 * BEAT, -9)
        if bar_i % 2 == 1:                                         # sparse high arpeggio every other bar
            for k, f in enumerate(voicing[1:] + [voicing[1] * 2]):
                place(song, pluck(f * 2), t_bar + (k * 2 + 1) * BEAT / 2, -20)
        for b in range(4):
            tb = t_bar + b * BEAT
            if drop_out[0] <= tb < drop_out[1]:
                continue
            if b in (0, 2): place(drums, K, tb, -3)
            if b == 3: place(drums, K, tb + BEAT / 2, -9)
            if b in (1, 3): place(drums, C, tb, -11)
            place(drums, HC, tb, -20)
            place(drums, HO if b == 3 else HC, tb + BEAT / 2 + 0.035, -17 if b == 3 else -15)  # swung offbeat
    else:
        place(drums, K, t_bar, -3)
    bar_i += 1
    t_bar += BAR

music = lp(song, 5200) + drums
music *= np.clip((DUR - t_all) / 0.5, 0, 1)                      # clean ending
sf.write('work/music_pre.wav', music.astype(np.float32), SR, subtype='FLOAT')
loudnorm('work/music_pre.wav', 'work/music.wav', I=-27.0, TP=-8.0)   # "shallow": ~13 LU under the voice
mus, _ = sf.read('work/music.wav', dtype='float64')
music = np.zeros(N); music[:min(len(mus), N)] = mus[:N]
# sidechain duck under the voice (≈ -6 dB while speaking)
venv = sosfiltfilt(butter(1, 4, 'lowpass', fs=SR, output='sos'), np.abs(voice))
duck = 1 - 0.5 * np.clip(venv / (np.percentile(venv, 95) + 1e-9), 0, 1)
music *= duck

mix = voice + sfx + music
sf.write('work/mix_pre.wav', mix.astype(np.float32), SR, subtype='FLOAT')
loudnorm('work/mix_pre.wav', 'work/mix.wav', extra='alimiter=limit=0.84:attack=3:release=50:level=false:latency=true,')
m, _ = sf.read('work/mix.wav'); print('mix', len(m) / SR, 's  peak', 20 * np.log10(np.abs(m).max()), 'dBFS')
