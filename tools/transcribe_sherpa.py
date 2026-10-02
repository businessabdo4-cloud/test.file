"""Transcribe VO chunks with Whisper large-v3 (sherpa-onnx, local). Timing/identification ONLY.
Usage: transcribe_sherpa.py <wav> <out.json> <start:end,start:end,...>"""
import json, sys, subprocess, numpy as np, sherpa_onnx
M = "/home/user/models/sherpa-onnx-whisper-large-v3"
rec = sherpa_onnx.OfflineRecognizer.from_whisper(
    encoder=f"{M}/large-v3-encoder.int8.onnx", decoder=f"{M}/large-v3-decoder.int8.onnx",
    tokens=f"{M}/large-v3-tokens.txt", language="ar", task="transcribe", num_threads=4)
src, out, spans = sys.argv[1], sys.argv[2], sys.argv[3]
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True).stdout
a = np.frombuffer(raw, np.float32); sr = 16000
res = []
for sp in spans.split(","):
    s, e = map(float, sp.split(":"))
    st = rec.create_stream(); st.accept_waveform(sr, a[int(s*sr):int(e*sr)]); rec.decode_stream(st)
    r = st.result
    res.append({"start": s, "end": e, "text": r.text.strip(), "tokens": list(r.tokens), "timestamps": list(getattr(r, "timestamps", []))})
    print(f"[{s:6.2f} → {e:6.2f}] {r.text.strip()}", flush=True)
json.dump(res, open(out, "w"), ensure_ascii=False, indent=1)
