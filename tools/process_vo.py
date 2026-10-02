"""Voice-over pipeline: line split, word timing, clean-up, loudness, Citybot robot FX, timings.json.

Inputs  (assets/vo): voiceover.wav, script.json, ctc_tokens.json (from tools/ctc_tokens.py)
Outputs (assets/vo): lines/L1.wav..L7.wav (clean), lines/L*_robot.wav (Citybot FX),
                     voiceover_clean.wav, voiceover_robot.wav, timings.json
No re-voicing: only trimming, gain/limiting and the light robot effect on Citybot lines.
"""
import json, subprocess
from pathlib import Path
import numpy as np, soundfile as sf, librosa, pyloudnorm as pyln

VO = Path(__file__).resolve().parent.parent / "assets" / "vo"
SR = 48000
LEAD_IN = 0.40        # s of street ambience before Hamza's first word
END_TAIL = 1.90       # s after the last word: end-card reveal finishes + ~1s hold
FPS = 30
MAX_FRAMES = 900
PAD_PRE, PAD_POST = 0.05, 0.08   # breathing room kept around each line in the line files
TARGET_LUFS = -14.0
CEILING_DB = -1.0
ONSET_LEAD = 0.05     # CTC emits a char slightly after its acoustic onset
ROBOT_LINES = {"L2": 1.0, "L4": 1.0, "L5": 1.0, "L6": 1.0}


def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(SR),
                          "-af", "aresample=resampler=soxr", "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()


def db_frames(x, hop):
    n = len(x) // hop
    return np.array([20 * np.log10(np.sqrt(np.mean(x[i * hop:(i + 1) * hop] ** 2)) + 1e-9) for i in range(n)])


def line_bounds(x, splits, thr=-45.0):
    """Speech onset/offset inside each region between split points (10 ms resolution)."""
    db, edges, out = db_frames(x, SR // 100), [0.0] + splits + [len(x) / SR], []
    for a, b in zip(edges[:-1], edges[1:]):
        idx = np.where(db[int(a * 100):int(b * 100)] > thr)[0]
        out.append((round(a + idx[0] / 100, 3), round(a + (idx[-1] + 1) / 100, 3)))
    return out


def word_onsets(line, ctc, src_start, src_end):
    chars, times = ctc["tokens"], ctc["timestamps"]
    stream = "".join(chars)
    pos, starts = 0, []
    for anchor in line["anchors"]:
        if isinstance(anchor, (int, float)):
            starts.append(float(anchor)); continue
        i = stream.find(anchor, pos)
        if i < 0:
            raise ValueError(f'{line["id"]}: anchor {anchor!r} not found after char {pos} in {stream!r}')
        starts.append(times[i] - ONSET_LEAD); pos = i + len(anchor)
    starts[0] = src_start
    for k in range(1, len(starts)):
        starts[k] = max(starts[k], starts[k - 1] + 0.06)
    ends = [s - 0.02 for s in starts[1:]] + [src_end]
    return [{"text": w, "srcStart": round(s, 3), "srcEnd": round(e, 3)} for w, s, e in zip(line["words"], starts, ends)]


def delay(x, sec):
    n = int(sec * SR)
    return np.concatenate([np.zeros(n, np.float32), x[:len(x) - n]])


def robot(x, amount=1.0):
    """Light robot colour: +1 semitone, short metallic comb, low-mixed 60 Hz ring-mod. Speech stays intelligible."""
    p = librosa.effects.pitch_shift(x, sr=SR, n_steps=1.0 * amount, res_type="soxr_hq").astype(np.float32)
    comb = p + 0.30 * amount * delay(p, 0.0045)
    t = np.arange(len(x)) / SR
    ring = comb * np.sin(2 * np.pi * 60 * t).astype(np.float32)
    ring = librosa.effects.preemphasis(ring, coef=0.9)            # thin the buzz, keep it out of the low end
    mix = 0.18 * amount
    out = (1 - mix) * comb + mix * ring
    return out * (np.sqrt(np.mean(x ** 2)) / (np.sqrt(np.mean(out ** 2)) + 1e-9))   # loudness-match to dry


def unison(x):
    """L7 'both say it': dry voice + a quiet, slightly late robot double — light effect only."""
    return x + 10 ** (-10 / 20) * delay(robot(x, 1.0), 0.015)


def master_chain(x, path):
    """Gain to TARGET_LUFS with a 4x-oversampled limiter (true-peak safe at CEILING_DB); iterate gain to land on target."""
    meter, gain = pyln.Meter(SR), TARGET_LUFS - pyln.Meter(SR).integrated_loudness(x)
    tmp = path.with_suffix(".tmp.wav")
    for _ in range(4):
        sf.write(tmp, x, SR, subtype="FLOAT")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(tmp), "-af",
                        f"aresample={SR * 4}:resampler=soxr,volume={gain:.3f}dB,"
                        f"alimiter=limit={10 ** ((CEILING_DB - 0.3) / 20):.4f}:attack=3:release=60:level=false:latency=1,"
                        f"aresample={SR}:resampler=soxr",
                        "-ar", str(SR), "-c:a", "pcm_s24le", str(path)], check=True)
        y, _ = sf.read(path, dtype="float32")
        lufs = meter.integrated_loudness(y)
        if abs(lufs - TARGET_LUFS) < 0.1: break
        gain += TARGET_LUFS - lufs
    tmp.unlink()
    return y, gain, lufs


def true_peak(path):
    out = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(path), "-af", "ebur128=peak=true", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    return float(out.split("True peak:")[1].split("Peak:")[1].split("dBFS")[0])


def main():
    script = json.load(open(VO / "script.json"))
    ctc = json.load(open(VO / "ctc_tokens.json"))
    src = load(VO / "voiceover.wav")
    bounds = line_bounds(src, script["splits"])

    t0 = bounds[0][0]                       # first speech onset in the source
    to_comp = lambda s: round(s - t0 + LEAD_IN, 3)
    m_len = int((bounds[-1][1] - t0 + PAD_PRE + PAD_POST) * SR)
    m_off = t0 - PAD_PRE                    # master audio starts here (source time)
    clean_m = np.zeros(m_len, np.float32)
    robot_m = np.zeros(m_len, np.float32)

    lines = []
    for line, (s, e) in zip(script["lines"], bounds):
        a, b = int((s - PAD_PRE) * SR), int((e + PAD_POST) * SR)
        seg = src[a:b].copy()
        fi, fo = int(0.01 * SR), int(0.03 * SR)
        seg[:fi] *= np.linspace(0, 1, fi); seg[-fo:] *= np.linspace(1, 0, fo)
        if line["id"] in ROBOT_LINES: fx = robot(seg, ROBOT_LINES[line["id"]])
        elif line["speaker"] == "both": fx = unison(seg)
        else: fx = seg
        ma = int((s - PAD_PRE - m_off) * SR)
        clean_m[ma:ma + len(seg)] += seg
        robot_m[ma:ma + len(fx)] += fx[:len(seg)]
        words = word_onsets(line, ctc[line["id"]], s, e)
        for w in words:
            w["start"], w["end"] = to_comp(w.pop("srcStart")), to_comp(w.pop("srcEnd"))
        lines.append({"id": line["id"], "speaker": line["speaker"], "text": line["text"],
                      "srcStart": s, "srcEnd": e, "start": to_comp(s), "end": to_comp(e),
                      "fileStart": to_comp(s - PAD_PRE), "words": words,
                      "_slice": (ma, ma + len(seg))})

    (VO / "lines").mkdir(exist_ok=True)
    report = {}
    for name, m in (("clean", clean_m), ("robot", robot_m)):
        path = VO / f"voiceover_{name}.wav"
        y, gain, lufs = master_chain(m, path)
        report[name] = {"gainDb": round(gain, 2), "integratedLufs": round(lufs, 2), "truePeakDb": true_peak(path)}
        for ln in lines:
            if name == "robot" and ln["id"] not in ROBOT_LINES and ln["speaker"] != "both": continue
            a, b = ln["_slice"]
            suffix = "" if name == "clean" else "_robot"
            sf.write(VO / "lines" / f'{ln["id"]}{suffix}.wav', y[a:b], SR, subtype="PCM_24")

    total = round(lines[-1]["end"] + END_TAIL, 3)
    frames = int(np.ceil(total * FPS))
    if frames > MAX_FRAMES:
        longest = max(lines, key=lambda l: l["end"] - l["start"])
        raise SystemExit(f"Over budget: {frames} frames > {MAX_FRAMES} ({total - MAX_FRAMES / FPS:.2f}s over); longest line {longest['id']}")
    for ln in lines: ln.pop("_slice")
    out = {"fps": FPS, "leadIn": LEAD_IN, "endTail": END_TAIL, "durationSec": total, "durationInFrames": frames,
           "masterStart": to_comp(m_off), "loudness": report, "lines": lines}
    json.dump(out, open(VO / "timings.json", "w"), ensure_ascii=False, indent=1)
    print(json.dumps(report, indent=1))
    print(f"total {total}s = {frames} frames")


if __name__ == "__main__":
    main()
