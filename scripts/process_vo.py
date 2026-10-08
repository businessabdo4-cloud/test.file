"""VO pipeline: pick source clips, fit them into their scene slots, normalise,
run Rhubarb lip sync and estimate word timings.

Source priority per line (first that exists wins):
  1. assets/vo/line_XX.wav        human recording
  2. assets/vo_tts/line_XX.wav    ElevenLabs output (scripts/tts_elevenlabs.py)
  3. assets/vo_scratch/line_XX.wav offline scratch TTS (pico2wave) - placeholder only

Fitting rules (never extend the video):
  a. trim leading/trailing silence, shorten inner pauses to <= MAX_PAUSE
  b. if still longer than the slot, time-stretch up to 1.1x (pitch preserved)
  c. if still too long -> report the line that must be shortened and exit 1

Outputs:
  public/audio/vo/line_XX.wav     fitted, loudness-normalised clips
  public/data/vo.json             per line: start, duration, source, speed, words, mouth cues
"""
import json
import pathlib
import shutil
import subprocess
import sys

import numpy as np
import pyloudnorm as pyln
import soundfile as sf

ROOT = pathlib.Path(__file__).resolve().parent.parent
LINES = json.loads((ROOT / "scripts" / "vo_lines.json").read_text())
RHUBARB = ROOT / "tools" / "rhubarb" / "rhubarb"
OUT_AUDIO = ROOT / "public" / "audio" / "vo"
OUT_DATA = ROOT / "public" / "data"
TMP = ROOT / ".cache" / "vo"

SR = 48000
LEAD_IN = 0.12      # s of breathing room after the slot starts
TAIL_GAP = 0.10     # s that must remain before the next slot
MAX_PAUSE = 0.18    # s, inner pauses are shortened to this
MAX_SPEED = 1.10
TARGET_LUFS = -14.0
SILENCE_DB = -40.0


def run(cmd):
    return subprocess.run(cmd, check=True, capture_output=True, text=True)


def load_mono(path):
    tmp = TMP / (path.stem + "_48k.wav")
    run(["ffmpeg", "-y", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(SR), str(tmp)])
    data, _ = sf.read(tmp, dtype="float32")
    return data


def frame_db(x, win=0.02):
    n = int(SR * win)
    pad = (-len(x)) % n
    f = np.pad(x, (0, pad)).reshape(-1, n)
    rms = np.sqrt((f ** 2).mean(axis=1) + 1e-12)
    return 20 * np.log10(rms), n


def tighten(x, compress_pauses=True):
    """Trim edges and (optionally) compress inner pauses longer than MAX_PAUSE."""
    db, n = frame_db(x)
    voiced = db > SILENCE_DB
    if not voiced.any():
        raise SystemExit("silent clip")
    first, last = np.argmax(voiced), len(voiced) - 1 - np.argmax(voiced[::-1])
    keep = []
    max_frames = int(MAX_PAUSE / 0.02)
    i = first
    while i <= last:
        if voiced[i]:
            keep.append(i)
            i += 1
            continue
        j = i
        while j <= last and not voiced[j]:
            j += 1
        gap = j - i
        if compress_pauses and gap > max_frames:
            # keep half of the allowed pause on each side of the cut
            keep.extend(range(i, i + max_frames // 2))
            keep.extend(range(j - (max_frames - max_frames // 2), j))
        else:
            keep.extend(range(i, j))
        i = j
    # small fades at each splice to avoid clicks
    out = []
    fade = np.linspace(0, 1, 64, dtype=np.float32)
    runs = np.split(np.array(keep), np.where(np.diff(keep) != 1)[0] + 1)
    for r in runs:
        seg = x[r[0] * n:(r[-1] + 1) * n].copy()
        if len(seg) > 256:
            seg[:64] *= fade
            seg[-64:] *= fade[::-1]
        out.append(seg)
    # 40 ms pre/post roll
    roll = np.zeros(int(0.04 * SR), dtype=np.float32)
    return np.concatenate([roll, *out, roll])


def stretch(x, speed, name):
    src, dst = TMP / f"{name}_pre.wav", TMP / f"{name}_st.wav"
    sf.write(src, x, SR)
    run(["rubberband", "-q", "-T", f"{speed:.4f}", "-F", str(src), str(dst)])
    y, _ = sf.read(dst, dtype="float32")
    return y


SPOKEN = {"18": "dix-huit", "100": "cent pour cent", "%": "", "citystore.ma": "city store point em a",
          "iphone": "aille faune", "city": "si ti", "store": "store", "laptops": "lap tops",
          "49": "ta sa ud wa ar ba in", "4": "four", "gps": "ji pi es", "sos": "es o es", "apple": "a pel",
          "5000": "khams ta la af", "60": "sit tin", "ultra2": "ul tra tu", "watch8": "watch eight",
          "galaxy": "ga la xy", "gemini": "dje mi ni", "samsung": "sam sung", "watches": "wat ches",
          "wh-1000xm6": "dou ble you ech ten tho u sand ex em six", "wh-1000xm5": "dou ble you ech ten tho u sand ex em five",
          "sony": "so ny", "30": "tla tin", "3": "tlat",
          "ray-ban": "ray ban", "meta": "me ta", "ai": "ei ai", "gen": "djen", "2": "tu", "headliner": "hed lai ner",
          "wayfarer": "wey fe rer", "12mp": "douze me ga pik sel", "3k": "tri ka", "8": "tma nya", "open-ear": "o pen ir",
          "haut-parleurs": "o par leur", "oneplus": "wan plus", "emerald": "e me rald", "titanium": "ti ta nium",
          "5": "khem sa", "16": "set tash", "wear": "wer", "os": "o es"}
ARABIC = "\\u0621-\\u063F\\u0641-\\u064A\\u0671-\\u06D3"  # Arabic letters (no punctuation, no tatweel)


def syllables(word):
    """Rough French syllable count of the spoken form (vowel groups), min 1."""
    import re
    arabic = re.findall(f"[{ARABIC}]", word)
    if arabic:  # unvocalised Arabic script: ~1 syllable per 2 letters (ignoring the article/prefix letters)
        return max(1, round(len(arabic) / 2.1))
    spoken = " ".join(SPOKEN.get(t, t) for t in re.split(r"\s+", word.lower().strip(".,!?:…،")))
    spoken = re.sub(r"e\b", "", spoken)  # mute final e
    return max(1, len(re.findall(r"[aeiouyéèêàâîïôûù]+", spoken)))


def word_timings(x, text):
    """Distribute words across voiced regions proportional to character count.
    No forced aligner is available offline, so this is an estimate that is
    good enough for word-by-word kinetic reveals."""
    words = []
    for tok in text.split():
        if words and not any(ch.isalnum() for ch in tok):
            words[-1] += " " + tok   # attach stray punctuation (":", "!") to the previous word
        else:
            words.append(tok)
    db, n = frame_db(x)
    voiced = db > SILENCE_DB
    t_voiced = np.flatnonzero(voiced) * n / SR
    if len(t_voiced) == 0:
        return []
    weights = np.array([syllables(w) for w in words], dtype=float)
    cum = np.concatenate([[0], np.cumsum(weights)]) / weights.sum()
    idx = (cum * (len(t_voiced) - 1)).astype(int)
    return [
        {"word": w, "start": round(float(t_voiced[idx[k]]), 3), "end": round(float(t_voiced[idx[k + 1]]), 3)}
        for k, w in enumerate(words)
    ]


def main():
    TMP.mkdir(parents=True, exist_ok=True)
    OUT_AUDIO.mkdir(parents=True, exist_ok=True)
    OUT_DATA.mkdir(parents=True, exist_ok=True)
    meter = pyln.Meter(SR)
    result, problems = [], []

    for i, line in enumerate(LINES):
        lid = line["id"]
        for kind, folder in (("human", "vo"), ("elevenlabs", "vo_tts"), ("scratch", "vo_scratch")):
            src = next((ROOT / "assets" / folder / f"{lid}{ext}" for ext in (".wav", ".mp3")
                        if (ROOT / "assets" / folder / f"{lid}{ext}").exists()), None)
            if src:
                break
        if not src:
            raise SystemExit(f"{lid}: no source clip")

        raw = load_mono(src)
        raw_dur = len(raw) / SR
        slot_start, slot_end = line["slot"]
        lead = line.get("lead", LEAD_IN)
        budget = (slot_end - slot_start) - lead - (TAIL_GAP if i < len(LINES) - 1 else 0.05)
        x = tighten(raw, compress_pauses=False)       # a. edges only
        if len(x) / SR > budget:
            x = tighten(raw, compress_pauses=True)    # a. + inner pauses
        speed = 1.0
        if len(x) / SR > budget:
            speed = len(x) / SR / budget
            if speed > MAX_SPEED:
                problems.append(
                    f"{lid}: {len(x)/SR:.2f}s after trimming, needs {speed:.2f}x to fit {budget:.2f}s "
                    f"(max {MAX_SPEED}x) -> shorten: \"{line['subtitle']}\"")
                speed = MAX_SPEED
            x = stretch(x, speed, lid)

        loud = meter.integrated_loudness(x)
        x = pyln.normalize.loudness(x, loud, TARGET_LUFS)
        peak = np.abs(x).max()
        if peak > 0.98:  # true-peak-ish safety
            x *= 0.98 / peak
        out = OUT_AUDIO / f"{lid}.wav"
        sf.write(out, x, SR, subtype="PCM_16")
        dur = len(x) / SR

        # Rhubarb (phonetic recogniser - language independent)
        rjson = TMP / f"{lid}_rhubarb.json"
        rh = subprocess.run([str(RHUBARB), "-r", "phonetic", "-f", "json", "--extendedShapes", "GHX",
                             "-o", str(rjson), str(out)], capture_output=True, text=True)
        if rh.returncode != 0:
            print(rh.stderr, file=sys.stderr)
            raise SystemExit(f"rhubarb failed on {lid}")
        cues = json.loads(rjson.read_text())["mouthCues"]

        result.append({
            "id": lid,
            "subtitle": line["subtitle"],
            "source": kind,
            "sourceFile": str(src.relative_to(ROOT)),
            "start": round(slot_start + lead, 3),
            "duration": round(dur, 3),
            "slot": line["slot"],
            "speed": round(speed, 3),
            "rawDuration": round(raw_dur, 3),
            "words": word_timings(x, line["subtitle"]),
            "mouthCues": cues,
        })
        print(f"{lid}: {kind:10s} raw {raw_dur:5.2f}s -> {dur:5.2f}s (x{speed:.3f}) "
              f"budget {budget:.2f}s, {len(cues)} mouth cues")

    (OUT_DATA / "vo.json").write_text(json.dumps(result, ensure_ascii=False, indent=1) + "\n")
    if problems:
        print("\nLINES TOO LONG - shorten these:\n  " + "\n  ".join(problems), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
