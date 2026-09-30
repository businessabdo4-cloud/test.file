"""ASR used to build scripts/prepare.py WORDS (run once; needs sherpa-onnx + models, see README).

  python3 scripts/transcribe.py <models_dir>            full-clip Whisper text + Zipformer token times
  python3 scripts/transcribe.py <models_dir> 0.8:1.5 …   re-transcribe cropped windows to verify boundaries
Hugging Face / OpenAI weight hosts are blocked in this environment, so faster-whisper/openai-whisper
could not be used; the same Whisper (large-v3-turbo) runs here via sherpa-onnx's ONNX export.
"""
import sys, subprocess, numpy as np, soundfile as sf, sherpa_onnx
M = sys.argv[1].rstrip('/') + '/'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'voiceover.wav', '-ar', '16000', 'work/vo16k.wav'], check=True)
a, sr = sf.read('work/vo16k.wav', dtype='float32')
w = M + 'sherpa-onnx-whisper-turbo/turbo-'
whisper = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=w + 'encoder.int8.onnx', decoder=w + 'decoder.int8.onnx',
                                                     tokens=w + 'tokens.txt', language='fr', num_threads=4)
def run(x):
    s = whisper.create_stream(); s.accept_waveform(sr, x); whisper.decode_stream(s); return s.result.text
if len(sys.argv) > 2:
    pad = np.zeros(int(0.3 * sr), np.float32)
    for win in sys.argv[2:]:
        t0, t1 = map(float, win.split(':'))
        print(f'{t0:.2f}-{t1:.2f} | {run(np.concatenate([pad, a[int(t0 * sr):int(t1 * sr)], pad]))}')
    sys.exit()
print('WHISPER:', run(a))
z = M + 'sherpa-onnx-streaming-zipformer-fr-2023-04-14/'; e = '-epoch-29-avg-9-with-averaged-model.onnx'
zf = sherpa_onnx.OnlineRecognizer.from_transducer(tokens=z + 'tokens.txt', encoder=z + 'encoder' + e,
                                                  decoder=z + 'decoder' + e, joiner=z + 'joiner' + e,
                                                  num_threads=4, decoding_method='modified_beam_search')
st = zf.create_stream(); st.accept_waveform(sr, a); st.accept_waveform(sr, np.zeros(sr, np.float32)); st.input_finished()
while zf.is_ready(st): zf.decode_stream(st)
r = zf.get_result_all(st)
print('ZIPFORMER tokens (s, ≈0.3 s emission lag):', list(zip(r.tokens, [round(t, 2) for t in r.timestamps])))
