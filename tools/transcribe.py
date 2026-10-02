"""Whisper transcription of the VO — used ONLY for timing, never for subtitle text."""
import json, sys
from faster_whisper import WhisperModel

src = sys.argv[1]; out = sys.argv[2]; model_name = sys.argv[3] if len(sys.argv) > 3 else "large-v3"
model = WhisperModel(model_name, device="cpu", compute_type="int8", cpu_threads=4)
segments, info = model.transcribe(src, language="ar", word_timestamps=True, vad_filter=False, beam_size=5)
res = []
for s in segments:
    seg = {"start": round(s.start, 3), "end": round(s.end, 3), "text": s.text.strip(),
           "words": [{"w": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3), "p": round(w.probability, 2)} for w in s.words]}
    res.append(seg)
    print(f"[{s.start:6.2f} → {s.end:6.2f}] {s.text.strip()}", flush=True)
json.dump({"language": info.language, "duration": info.duration, "segments": res}, open(out, "w"), ensure_ascii=False, indent=1)
