import subprocess
A='assets/'
cues=[  # (time, file, volume)
 (0.00,'impact',0.55),(0.02,'glitch',0.35),(0.15,'whoosh1',0.4),(0.80,'pop',0.25),(0.98,'pop',0.25),(1.16,'pop',0.25),
 (2.20,'whoosh2',0.5),(2.85,'glitch',0.55),(3.48,'pop',0.22),(3.60,'pop',0.22),(3.72,'pop',0.22),(3.84,'pop',0.22),
 (3.37,'riser',0.45),(4.878,'shatter',0.85),(4.878,'impact',0.75),
 (5.45,'whoosh1',0.45),(5.92,'pop',0.35),(6.72,'whoosh2',0.45),(7.06,'click',0.5),(7.24,'click',0.5),(7.42,'click',0.5),(7.57,'click',0.5),
 (7.64,'whoosh1',0.45),(7.95,'glitch',0.3),(8.46,'whoosh2',0.45),(8.55,'pop',0.2),(8.67,'pop',0.2),(8.79,'pop',0.2),
 (9.24,'glitch',0.35),(9.75,'pop',0.25),(9.95,'pop',0.25),(10.15,'pop',0.25),
 (10.66,'whoosh1',0.45),(10.95,'pop',0.3),(11.2,'pop',0.3),(11.45,'pop',0.3),
 (11.84,'whoosh2',0.45),(12.74,'click',0.8),(12.80,'whoosh1',0.35),(13.08,'pop',0.35),
 (13.38,'whoosh2',0.45),(14.0,'click',0.3),(14.35,'click',0.3),(14.62,'click',0.3),(14.67,'impact',0.5),
 (14.29,'riser',0.35),(15.13,'whoosh1',0.4),(15.79,'kaching',0.9),(15.79,'impact',0.45),(16.48,'pop',0.35),(16.77,'whoosh2',0.35),
 (17.13,'whoosh1',0.45),(17.45,'notif',0.55),(17.62,'notif',0.6),(18.33,'pop',0.35),
 (19.43,'whoosh2',0.45),(19.83,'pop',0.3),(19.99,'pop',0.3),(20.14,'pop',0.3),(21.16,'impact',0.35),(21.16,'pop',0.35),
 (21.62,'whoosh1',0.5),(22.49,'notif',0.5),(23.62,'click',0.7),(23.4,'pop',0.3),(24.05,'pop',0.25),(25.45,'impact',0.7),(25.45,'whoosh2',0.3),
]
inp=['-i','build/vo_fast.wav','-ss','1.732','-i',A+'music1.mp3']
files=sorted(set(c[1] for c in cues)); idx={}
for k,f in enumerate(files): idx[f]=2+k; inp+=['-i',A+f+'.mp3']
# count uses per file for asplit
uses={f:[c for c in cues if c[1]==f] for f in files}
fc=[]
fc.append('[0:a]aresample=48000,aformat=channel_layouts=stereo,loudnorm=I=-14:TP=-1.5:LRA=7,aresample=48000,apad=whole_dur=27,asplit=2[vo][vosc]')
fc.append('[1:a]aresample=48000,aformat=channel_layouts=stereo,volume=0.42,afade=t=out:st=26.2:d=0.8[mus0]')
fc.append('[mus0][vosc]sidechaincompress=threshold=0.04:ratio=5:attack=15:release=250:makeup=1[mus]')
labels=[]
for f in files:
    n=len(uses[f]); fc.append(f'[{idx[f]}:a]aresample=48000,aformat=channel_layouts=stereo,asplit={n}'+''.join(f'[{f}{i}]' for i in range(n)))
    for i,(t,_,v) in enumerate(uses[f]):
        ms=int(t*1000); lab=f's_{f}{i}'; fc.append(f'[{f}{i}]volume={v},adelay={ms}|{ms}[{lab}]'); labels.append(lab)
fc.append(''.join(f'[{l}]' for l in labels)+f'amix=inputs={len(labels)}:normalize=0,volume=0.8[sfx]')
fc.append('[vo][mus][sfx]amix=inputs=3:normalize=0,volume=0.85,alimiter=limit=0.79:level=false,atrim=0:27[out]')
cmd=['ffmpeg','-y','-v','error']+inp+['-filter_complex',';'.join(fc),'-map','[out]','-ar','48000','-c:a','pcm_s16le','build/mix.wav']
subprocess.run(cmd,check=True)
subprocess.run(['ffmpeg','-y','-v','error','-i','build/video.mp4','-i','build/mix.wav','-map','0:v','-map','1:a','-c:v','copy','-af','apad','-c:a','aac','-b:a','256k','-t','27','-movflags','+faststart','build/final.mp4'],check=True)
