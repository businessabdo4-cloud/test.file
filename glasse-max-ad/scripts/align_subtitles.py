#!/usr/bin/env python3
"""Align the exact Darija script to the voice-over and write src/data/subtitles.json.

The subtitle TEXT always comes from the SCRIPT table below (verbatim script).
Only the TIMING is taken from the audio:

  * If openai-whisper and its model are available (--whisper), Whisper word
    timestamps (language "ar") are used as candidate cut points.
  * Otherwise (or in addition) short dips in the audio energy are used.

A small dynamic-programming aligner then places each phrase so that its length
matches its syllable count, preferring to cut on real pauses and never letting a
long pause fall inside a phrase.

After running, fine-tune by hand in src/data/subtitles.json (start/end in seconds).

Usage:  python3 scripts/align_subtitles.py [--whisper] [--audio assets/voiceover.mp3]
"""
import argparse
import json
import subprocess
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent

# Built-in copy of the first script (used when assets/vo/script.txt does not exist).
# (script line, phrase text shown on screen, highlighted words, approx. syllables)
SCRIPT = [
    (1, "واش باقي كتشرب", ["كتشرب"], 5),
    (1, "هاد الما", ["الما"], 3),
    (1, "وانت ماواثقش فيه؟", ["ماواثقش"], 7),
    (2, "ولا باقي كتخلص", ["كتخلص"], 6),
    (2, "على القراعي", ["القراعي"], 5),
    (2, "كل سيمانة؟", ["سيمانة؟"], 4),
    (3, "جاك الحل:", ["الحل:"], 3),
    (3, "GLASSE POWER!", ["GLASSE", "POWER!"], 4),
    (4, "6 ديال المراحل", ["6"], 7),
    (4, "ديال التصفية بالأوسموز،", ["بالأوسموز،"], 9),
    (5, "كيحيد الكلور،", ["الكلور،"], 5),
    (5, "الجير", ["الجير"], 2),
    (5, "والشوائب،", ["والشوائب،"], 4),
    (6, "وكيعطيك أكثر من", ["أكثر"], 6),
    (6, "300 لتر", ["300", "لتر"], 4),
    (6, "ديال الما الصافي", ["الصافي"], 5),
    (6, "فالنهار.", ["فالنهار."], 3),
    (7, "ما صافي", ["صافي"], 3),
    (7, "لأتاي", ["لأتاي"], 2),
    (7, "لقهوة", ["لقهوة"], 3),
    (7, "ولصحة ولادك،", ["ولادك،"], 6),
    (8, "وكاين في جوج ألوان", ["جوج"], 7),
    (8, "الأحمر و الزرق", ["الأحمر", "الزرق"], 6),
    (9, "دابا برومو", ["برومو"], 4),
    (9, "غير بـ 2049 درهم،", ["2049", "درهم،"], 10),
    (10, "التوصيل فابور", ["فابور"], 5),
    (10, "الخلاص عند الاستلام", ["الاستلام"], 7),
    (11, "العرض محدود،", ["محدود،"], 4),
    (11, "صيفط لينا دابا فالواتساب", ["فالواتساب"], 9),
]

SCRIPT_FILE = ROOT / "assets/vo/script.txt"
NUM_SYL = {"6": 2, "2": 2, "80": 3, "1799": 11}  # how numbers are spoken (Darija)
# Latin words spelled out letter by letter
WORD_SYL = {"GPD": 3, "LG": 2, "HK": 2, "MAX": 2, "GLASSE": 2, "Water": 2, "Maroc": 2}


def estimate_syllables(text):
    """Rough syllable count: Arabic ~ half the letters, Latin = vowel groups, numbers from NUM_SYL."""
    import re
    n = 0
    for w in text.split():
        w = w.strip("،,.!?؟:*")
        if not w:
            continue
        if w in WORD_SYL:
            n += WORD_SYL[w]
        elif w.isdigit():
            n += NUM_SYL.get(w, round(len(w) * 2.5))
        elif re.search(r"[\u0600-\u06FF]", w):
            letters = len(re.sub(r"[^\u0621-\u064A]", "", w))
            n += max(1, round(letters * 0.55))
        else:
            n += max(1, len(re.findall(r"[aeiouy]+", w.lower())))
    return n


def load_script():
    """assets/vo/script.txt: one sentence per line, '|' splits on-screen phrases, *word* = highlight."""
    if not SCRIPT_FILE.exists():
        return SCRIPT
    out = []
    lines = [l.strip() for l in SCRIPT_FILE.read_text(encoding="utf-8").splitlines() if l.strip() and not l.startswith("#")]
    for li, line in enumerate(lines, 1):
        for chunk in line.split("|"):
            chunk = " ".join(chunk.split())
            hl = [w.strip("*") for w in chunk.split() if w.startswith("*") and w.endswith("*")]
            text = chunk.replace("*", "")
            out.append((li, text, hl, estimate_syllables(text)))
    return out


SCRIPT_ACTIVE = SCRIPT

# Per-word accent colors (anything not listed uses the default accent).
HIGHLIGHT_COLORS = {"الروبيني؟": "#FF4B4B", "الروبيني": "#FF4B4B", "الشوائب": "#FF4B4B", "الكلور": "#FF4B4B", "والأملاح": "#FF4B4B",
                    "Water": "#2EC5FF", "GLASSE": "#2EC5FF", "MAX": "#2EC5FF", "ميساج": "#25D366", "علينا": "#25D366"}


def load_audio(path, sr=16000):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-f", "s16le", "-ac", "1", "-ar", str(sr), "-"],
        capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768, sr


def energy_dips(x, sr, thresh_db=-30.0, min_len=0.05):
    hop = sr // 100
    win = int(sr * 0.025)
    rms = np.sqrt(np.convolve(x ** 2, np.ones(win) / win, "same")[::hop])
    db = 20 * np.log10(rms + 1e-6)
    speech = np.where(db > -35)[0]
    s0, s1 = speech[0] * 0.01, speech[-1] * 0.01 + 0.01
    dips, start = [], None
    for i, low in enumerate(db < thresh_db):
        if low and start is None:
            start = i
        elif not low and start is not None:
            a, b = start * 0.01, i * 0.01
            if b - a >= min_len and a > s0 and b < s1:
                dips.append((a, b))
            start = None
    # softer cut points: energy valleys at least 6 dB below the surrounding peaks
    sm = np.convolve(db, np.ones(5) / 5, "same")
    for i in range(15, len(sm) - 15):
        t = i * 0.01
        if sm[i] == sm[i - 8:i + 9].min() and s0 < t < s1 \
                and min(sm[i - 15:i].max(), sm[i + 1:i + 16].max()) - sm[i] >= 6 \
                and not any(a - 0.05 <= t <= b + 0.05 for a, b in dips):
            dips.append((t - 0.01, t + 0.01))
    return s0, s1, sorted(dips)


def whisper_gaps(path):
    import whisper  # noqa: optional dependency
    model = whisper.load_model("medium")
    res = model.transcribe(str(path), language="ar", word_timestamps=True)
    words = [w for seg in res["segments"] for w in seg.get("words", [])]
    return [(a["end"], b["start"]) for a, b in zip(words, words[1:]) if b["start"] >= a["end"]]


def _dp(items, a0, a1, cuts, major, t_syl, pause_bonus, inside_penalty=4.0):
    """Place len(items) consecutive spans in [a0, a1], cutting only at `cuts`.

    items: list of syllable counts. Returns [(start, end), ...].
    Cost = squared deviation from the expected (syllable-based) length, a heavy
    penalty for any long pause left inside a span, and a bonus for cutting on
    longer pauses.
    """
    n, m = len(items), len(cuts)
    starts = [a0] + [b for a, b in cuts] + [None]
    ends = [None] + [a for a, b in cuts] + [a1]

    def cost(i, j, k):
        a, b = starts[j], ends[k]
        if a is None or b is None or b <= a:
            return np.inf
        inside = [(pa, pb) for pa, pb in major if pa >= a and pb <= b]
        dur = b - a - sum(pb - pa for pa, pb in inside)
        exp = items[i] * t_syl
        c = (dur - exp) ** 2 / exp + inside_penalty * sum(pb - pa for pa, pb in inside)
        if k <= m:
            c -= pause_bonus * min(cuts[k - 1][1] - cuts[k - 1][0], 0.4)
        return c

    dp = np.full((n + 1, m + 2), np.inf)
    back = np.zeros((n + 1, m + 2), int)
    dp[0][0] = 0
    for i in range(n):
        for j in range(m + 1):
            if dp[i][j] == np.inf:
                continue
            for k in ([m + 1] if i == n - 1 else range(j + 1, m + 1)):
                c = dp[i][j] + cost(i, j, k)
                if c < dp[i + 1][k]:
                    dp[i + 1][k], back[i + 1][k] = c, j
    out, k = [], m + 1
    for i in range(n, 0, -1):
        j = back[i][k]
        out.append((starts[j], ends[k]))
        k = j
    return out[::-1]


def align(s0, s1, dips):
    """Two passes: script lines onto long pauses, then phrases inside each line."""
    cuts = sorted(dips)
    major = [(a, b) for a, b in cuts if b - a >= 0.15]
    syl = [s[3] for s in SCRIPT_ACTIVE]
    t_syl = ((s1 - s0) - sum(b - a for a, b in major)) / sum(syl)

    lines = sorted(set(s[0] for s in SCRIPT_ACTIVE))
    line_syl = [sum(s[3] for s in SCRIPT_ACTIVE if s[0] == ln) for ln in lines]
    # script lines contain commas, so a pause inside a line is only mildly penalised
    spans_file = ROOT / "assets/vo/line_spans.json"
    if spans_file.exists():
        line_spans = [tuple(x) for x in json.loads(spans_file.read_text())["spans"]]
        assert len(line_spans) == len(lines), f"line_spans.json has {len(line_spans)} spans for {len(lines)} script lines"
    else:
      line_spans = _dp(line_syl, s0, s1, cuts if len(major) < len(line_syl) - 1 else major, major, t_syl, pause_bonus=1.0, inside_penalty=0.5)

    out = []
    for ln, (a, b) in zip(lines, line_spans):
        items = [s[3] for s in SCRIPT_ACTIVE if s[0] == ln]
        inner = [c for c in cuts if c[0] > a and c[1] < b]
        seg_major = [c for c in major if c[0] > a and c[1] < b]
        t_line = ((b - a) - sum(q - p for p, q in seg_major)) / sum(items)
        out += _dp(items, a, b, inner, seg_major, t_line, pause_bonus=0.6)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--audio", default=str(ROOT / "assets/voiceover.mp3"))
    ap.add_argument("--whisper", action="store_true", help="use Whisper word timestamps as cut points")
    ap.add_argument("--out", default=str(ROOT / "src/data/subtitles.json"))
    ap.add_argument("--edits", help="edits.json from clean_vo.py: align on the raw take, then map times onto the cleaned file")
    ap.add_argument("--final-audio", help="the audio the video actually plays (for duration); default = --audio")
    args = ap.parse_args()
    global SCRIPT_ACTIVE
    SCRIPT_ACTIVE = load_script()

    x, sr = load_audio(args.audio)
    s0, s1, dips = energy_dips(x, sr)
    source = "energy"
    if args.whisper:
        try:
            dips = sorted(set(dips) | set(g for g in whisper_gaps(args.audio) if s0 < g[0] < s1))
            source = "whisper+energy"
        except Exception as e:  # model not downloadable, etc.
            print(f"Whisper unavailable ({e}); using energy dips only")

    times = align(s0, s1, dips)
    if args.edits:
        cuts = json.loads(Path(args.edits).read_text())["cuts"]

        def remap(t):
            shift = 0.0
            for c in cuts:
                if t >= c["to"]:
                    shift += c["to"] - c["from"]
                elif t > c["from"]:
                    return c["from"] - shift
            return t - shift

        times = [(remap(a), remap(b)) for a, b in times]
        s0, s1 = remap(s0), remap(s1)
        x, sr = load_audio(args.final_audio or args.audio)
    phrases = []
    for idx, ((line, text, hl, _), (a, b)) in enumerate(zip(SCRIPT_ACTIVE, times)):
        phrases.append({
            "id": idx + 1,
            "line": line,
            "text": text,
            "start": round(a, 2),
            "end": round(b, 2),
            "highlight": [{"word": w, "color": HIGHLIGHT_COLORS[w]} if w in HIGHLIGHT_COLORS else w for w in hl],
        })
    data = {
        "_help": "Edit start/end (seconds) to fine-tune. 'text' is shown verbatim. "
                 "'highlight' words get the accent color (or their own 'color').",
        "timingSource": source,
        "audioDuration": round(len(x) / sr, 3),
        "speechStart": round(s0, 2),
        "speechEnd": round(s1, 2),
        "phrases": phrases,
    }
    Path(args.out).parent.mkdir(parents=True, exist_ok=True)
    Path(args.out).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    for p in phrases:
        print(f"{p['start']:6.2f} → {p['end']:6.2f}  L{p['line']:<2} {p['text']}")


if __name__ == "__main__":
    main()
