import json,subprocess
d=json.load(open('timemap.json'))
def m(x):
  a=0
  for s,e in d['keep']:
    if x>=e:a+=e-s
    elif x>s:a+=x-s
  return a/d['speed']
END=float(open('end.txt').read()); VEND=m(45.29); S14=m(41.95)
A='../assets/'
# (file, time_edited, volume, trim_len)
ev=[('impact',0.0,.9,1.0),('impact',m(1.85),.45,1.0)]
ev+=[('pop',m(1.55+i*.6),.55,.45) for i in range(3)]
for c in [4.63,6.29,13.13,21.62,24.30,26.92,28.66,33.23,36.14,41.95]: ev.append(('whoosh',max(0,m(c)-.35),.5,.85))
ev+=[('impact',m(8.90),.45,1.0),('drop',m(12.13)-.11,.9,.6),('pour',m(15.01),.5,1.0),('pour',m(26.92)+.1,.5,1.0)]
ev+=[('pop',m(x),.5,.45) for x in [17.22,18.30,18.75,25.6,30.38,31.0,31.6,37.0]]
ev+=[('drop',m(19.55)-.11,.6,.6),('drop',m(20.35)-.11,.6,.6)]
ev+=[('cash',m(34.13)+.72,.8,1.5),('impact',m(38.58),.5,1.0),('ding',S14+.45,.7,.5),('ding',m(43.89),.7,.5),('drop',VEND-.11,.8,.6)]
inputs=['-i','voice.wav','-i',A+'music.mp3']
fc=[]
for i,(f,t,v,L) in enumerate(ev):
  inputs+=['-i',A+f+'.mp3']; k=i+2
  fc.append(f"[{k}:a]atrim=0:{L},afade=t=out:st={L-0.08}:d=0.08,aresample=48000,aformat=channel_layouts=stereo,volume={v},adelay={int(t*1000)}|{int(t*1000)}[s{i}]")
fc.append("[0:a]aformat=channel_layouts=stereo,asplit=2[vo][vsc]")
fc.append(f"[1:a]aresample=48000,volume=0.42,atrim=0:{END},afade=t=in:d=0.3,afade=t=out:st={END-1.6}:d=1.6[mu]")
fc.append("[mu][vsc]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=350:makeup=1[mud]")
fc.append("".join(f"[s{i}]" for i in range(len(ev)))+f"amix=inputs={len(ev)}:normalize=0[sfx]")
fc.append(f"[vo][mud][sfx]amix=inputs=3:normalize=0,alimiter=limit=0.89,apad,atrim=0:{END}[out]")
cmd=['ffmpeg','-y','-hide_banner','-loglevel','error']+inputs+['-filter_complex',';'.join(fc),'-map','[out]','-ar','48000','mix.wav']
subprocess.run(cmd,check=True)
print(len(ev),'sfx events; END',END)
