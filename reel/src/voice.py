import json, subprocess
A="/root/.claude/uploads/2d3d5e93-022e-5bb6-b60c-36e4dabd6cd4/50ee99f2-Generated_Audio_October_02_2026_-_4_18PM.wav"
D=45.29
SPEED=1.15
# silences (start,end) from silencedetect -32dB/0.07s
sil=[(0.0,0.34),(3.31,3.44),(4.07,4.63),(6.14,6.29),(8.56,8.90),(11.62,12.13),(16.64,16.78),(18.16,18.30),(20.59,20.72),
(21.37,21.62),(24.07,24.30),(26.72,26.92),(28.43,28.66),(30.21,30.41),(30.87,31.04),(32.56,33.23),(35.95,36.14),
(38.05,38.58),(41.62,41.95),(45.11,45.29)]
KEEP_GAP=0.07   # breath left between phrases
LEAD=0.02
cuts=[]
for s,e in sil:
    if s==0.0: cuts.append((0.0, e-LEAD)); continue
    if e>=D-0.01: cuts.append((s+0.05, D)); continue
    if e-s>KEEP_GAP+0.02:
        cuts.append((s+KEEP_GAP/2, e-KEEP_GAP/2))
keep=[]; t=0.0
for s,e in cuts:
    if s>t: keep.append((t,s))
    t=e
if t<D: keep.append((t,D))
def m(x):
    acc=0.0
    for s,e in keep:
        if x>=e: acc+=e-s
        elif x>s: acc+=x-s
    return acc/SPEED
parts=";".join(f"[0:a]atrim={s:.3f}:{e:.3f},asetpts=PTS-STARTPTS,afade=t=in:d=0.008,afade=t=out:st={e-s-0.008:.3f}:d=0.008[a{i}]" for i,(s,e) in enumerate(keep))
fc=parts+";"+"".join(f"[a{i}]" for i in range(len(keep)))+f"concat=n={len(keep)}:v=0:a=1,aresample=48000,atempo={SPEED},highpass=f=70,acompressor=threshold=-20dB:ratio=3:attack=5:release=80,equalizer=f=3500:t=q:w=1:g=2,loudnorm=I=-16:TP=-1.5:LRA=7[out]"
subprocess.run(["ffmpeg","-y","-hide_banner","-loglevel","error","-i",A,"-filter_complex",fc,"-map","[out]","-ar","48000","voice.wav"],check=True)
dur=float(subprocess.check_output(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0","voice.wav"]))
print("new duration", dur, "mapped end", m(D))
json.dump({"keep":keep,"speed":SPEED,"dur":dur},open("timemap.json","w"))
