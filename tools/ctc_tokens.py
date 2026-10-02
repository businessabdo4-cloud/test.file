"""Run Meta Omnilingual ASR (CTC, sherpa-onnx) on each VO line → token-level timestamps (timing only)."""
import json, sys, numpy as np, soundfile as sf, sherpa_onnx
M = "/home/user/models/sherpa-onnx-omnilingual-asr-1600-languages-1B-ctc-int8-2025-11-12"
rec = sherpa_onnx.OfflineRecognizer.from_omnilingual_asr_ctc(model=f"{M}/model.int8.onnx", tokens=f"{M}/tokens.txt", num_threads=4)
wav, timings, out = sys.argv[1], sys.argv[2], sys.argv[3]
a, sr = sf.read(wav, dtype="float32")
if sr != 16000:
    import subprocess
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", wav, "-ac", "1", "-ar", "16000", "-f", "f32le", "-"], capture_output=True).stdout
    a, sr = np.frombuffer(raw, np.float32), 16000
PAD = 0.25
res = {}
for ln in json.load(open(timings))["lines"]:
    s, e = ln["start"] - 0.12, ln["end"] + 0.12
    seg = np.concatenate([np.zeros(int(PAD*sr), np.float32), a[int(s*sr):int(e*sr)], np.zeros(int(PAD*sr), np.float32)])
    st = rec.create_stream(); st.accept_waveform(sr, seg); rec.decode_stream(st); r = st.result
    ts = [round(s + t - PAD, 3) for t in r.timestamps]
    res[ln["id"]] = {"text": r.text, "tokens": list(r.tokens), "timestamps": ts}
    print(ln["id"], r.text, "|", " ".join(f"{tok}@{t:.2f}" for tok, t in zip(r.tokens, ts)), flush=True)
json.dump(res, open(out, "w"), ensure_ascii=False, indent=1)
