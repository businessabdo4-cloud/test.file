import json, subprocess
A="/root/.claude/uploads/2d3d5e93-022e-5bb6-b60c-36e4dabd6cd4/c3577e82-Generated_Audio_October_13_2026_-_5_50PM.wav"
D=34.571; SPEED=1.10
sil=[(0.0,0.15),(4.75,4.85),(5.51,5.63),(10.18,10.27),(14.90,15.12),(16.42,16.49),(18.64,18.71),(19.17,19.27),(19.42,19.51),(20.24,20.46),(22.54,22.62),(23.21,23.31),(25.64,25.75),(28.32,28.43),(30.81,30.89),(32.10,32.20),(33.38,33.45),(34.50,34.571)]
KEEP_GAP=0.06; LEAD=0.02
cuts=[]
for s,e in sil:
    if s==0.0: cuts.append((0.0,e-LEAD)); continue
    if e>=D-0.01: cuts.append((s+0.05,D)); continue
    if e-s>KEEP_GAP+0.02: cuts.append((s+KEEP_GAP/2,e-KEEP_GAP/2))
keep=[];t=0.0
for s,e in cuts:
    if s>t: keep.append((t,s))
    t=e
if t<D: keep.append((t,D))
parts=";".join(f"[0:a]atrim={s:.3f}:{e:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.006,afade=t=out:st={e-s-0.006:.3f}:d=0.006[a{i}]" for i,(s,e) in enumerate(keep))
fc=parts+";"+"".join(f"[a{i}]" for i in range(len(keep)))+f"concat=n={len(keep)}:v=0:a=1,aresample=48000,atempo={SPEED},highpass=f=70,acompressor=threshold=-20dB:ratio=3:attack=5:release=80,equalizer=f=3500:t=q:w=1:g=2,loudnorm=I=-16:TP=-1.5:LRA=7[out]"
subprocess.run(["ffmpeg","-y","-hide_banner","-loglevel","error","-i",A,"-filter_complex",fc,"-map","[out]","-ar","48000","voice.wav"],check=True)
dur=float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0","voice.wav"]))
print("new duration",dur)
json.dump({"keep":keep,"speed":SPEED,"dur":dur,"phrases":json.load(open('phrases.json'))},open("timemap.json","w"),ensure_ascii=False)
