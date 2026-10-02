import subprocess, json
# Voice + ducked music + SFX. Every cue is derived from build/timing.json so it stays on the picture.
A='assets/'
T=json.load(open('build/timing.json'))
ws=[w['s'] for w in T['words']]
SG=[s[0]-0.04 for s in T['segs']]       # scene cuts, same as reel.html
END=T['vo_end']+0.15                    # final logo hit
DUR=round((T['vo_end']+1.4)*30)/30      # same as render.js
DROP=SG[1]; MUSIC_DROP=6.60             # beat drop inside music1.mp3
cues=[(0.00,'impact',0.55),(0.02,'glitch',0.3),(0.10,'whoosh1',0.4),
 (ws[3]-.05,'pop',0.35),(ws[3],'notif',0.35),(ws[5]-.05,'pop',0.35),(ws[7]-.05,'pop',0.35),(ws[8],'glitch',0.5),
 (DROP-1.25,'riser',0.45),(DROP,'impact',0.85),(DROP,'whoosh2',0.5),(ws[13]-.05,'pop',0.35),
 (SG[2],'whoosh1',0.45),(ws[15]-.05,'impact',0.5),(ws[16]-.05,'whoosh2',0.45),
 (ws[17]-.1,'pop',0.2),(ws[17]-.02,'pop',0.2),(ws[17]+.06,'pop',0.2),(ws[19]-.08,'whoosh1',0.4),(ws[19]-.08,'impact',0.4),
 (SG[3],'whoosh2',0.45),(ws[23]-.05,'impact',0.45),(ws[23]-.05,'pop',0.3),
 (SG[4],'whoosh1',0.45),(ws[25]-.06,'impact',0.6),(ws[27]-.05,'pop',0.3),(ws[28]-.05,'pop',0.3),
 (SG[5],'whoosh2',0.45),(ws[29]-.08,'impact',0.45),(ws[30],'pop',0.22),(ws[30]+.16,'pop',0.22),(ws[30]+.32,'pop',0.22),(ws[30]+.48,'pop',0.22),
 (SG[6],'whoosh1',0.45),(ws[35]-.1,'riser',0.3),(ws[36]-.05,'impact',0.6),(ws[36]-.05,'kaching',0.4),
 (SG[7],'whoosh2',0.4),(ws[37]-.05,'pop',0.35),(ws[38],'kaching',0.9),(ws[38],'impact',0.45),(ws[39]-.04,'pop',0.35),(ws[40]-.04,'whoosh2',0.35),
 (SG[8],'whoosh1',0.45),(ws[41]-.1,'notif',0.55),(ws[41]+.15,'notif',0.6),(ws[42]-.03,'pop',0.35),
 (ws[43]-.08,'whoosh2',0.4),(ws[43]-.08,'impact',0.5),(ws[44]-.08,'pop',0.35),
 (SG[10],'whoosh1',0.45),(ws[45]-.04,'pop',0.3),(ws[46]-.04,'pop',0.3),(ws[47]-.04,'pop',0.3),(ws[48]-.04,'pop',0.3),(ws[48]+.15,'click',0.4),
 (ws[50]-.06,'impact',0.4),(ws[50]-.06,'pop',0.35),
 (SG[11],'whoosh2',0.45),(ws[54]-.05,'glitch',0.4),(ws[56]-.08,'kaching',0.7),
 (SG[12],'whoosh1',0.5),(ws[59]-.4,'whoosh2',0.25),(ws[59],'click',0.8),(ws[59],'pop',0.3),
 (ws[62]-.15,'click',0.25),(ws[62]-.02,'click',0.25),(ws[62]+.11,'click',0.25),(ws[62]+.24,'click',0.25),
 (END,'impact',0.7),(END,'whoosh2',0.3),
]
inp=['-i','build/vo_fast.wav','-ss',f'{MUSIC_DROP-DROP:.3f}','-i',A+'music1.mp3']
files=sorted(set(c[1] for c in cues)); idx={}
for k,f in enumerate(files): idx[f]=2+k; inp+=['-i',A+f+'.mp3']
uses={f:[c for c in cues if c[1]==f] for f in files}
fc=[]
# loudnorm upsamples to 192 kHz: bring the VO back to 48 kHz and pad it so the sidechain and amix run the full length
fc.append(f'[0:a]aresample=48000,aformat=channel_layouts=stereo,loudnorm=I=-14:TP=-1.5:LRA=7,aresample=48000,apad=whole_dur={DUR},asplit=3[vo][vosc][vosc2]')
fc.append(f'[1:a]aresample=48000,aformat=channel_layouts=stereo,volume=0.42,afade=t=out:st={DUR-0.7:.3f}:d=0.7[mus0]')
fc.append('[mus0][vosc]sidechaincompress=threshold=0.04:ratio=5:attack=15:release=250:makeup=1[mus]')
labels=[]
for f in files:
    n=len(uses[f]); fc.append(f'[{idx[f]}:a]aresample=48000,aformat=channel_layouts=stereo,asplit={n}'+''.join(f'[{f}{i}]' for i in range(n)))
    for i,(t,_,v) in enumerate(uses[f]):
        ms=max(0,int(t*1000)); lab=f's_{f}{i}'; fc.append(f'[{f}{i}]volume={v},adelay={ms}|{ms}[{lab}]'); labels.append(lab)
fc.append(''.join(f'[{l}]' for l in labels)+f'amix=inputs={len(labels)}:normalize=0,volume=0.6[sfx0]')
fc.append('[sfx0][vosc2]sidechaincompress=threshold=0.03:ratio=6:attack=5:release=200:makeup=1[sfx]')
fc.append(f'[vo][mus][sfx]amix=inputs=3:normalize=0,volume=0.965,alimiter=limit=0.79:level=false,atrim=0:{DUR}[out]')
cmd=['ffmpeg','-y','-v','error']+inp+['-filter_complex',';'.join(fc),'-map','[out]','-ar','48000','-c:a','pcm_s16le','build/mix.wav']
subprocess.run(cmd,check=True)
subprocess.run(['ffmpeg','-y','-v','error','-i','build/video.mp4','-i','build/mix.wav','-map','0:v','-map','1:a','-c:v','copy',
  '-af','apad','-c:a','aac','-b:a','256k','-t',f'{DUR}','-movflags','+faststart','build/final.mp4'],check=True)
print('DUR',DUR,'cues',len(cues))
