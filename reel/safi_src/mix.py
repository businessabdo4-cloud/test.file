import json,subprocess
d=json.load(open('timemap.json'))
def m(x):
  a=0
  for s,e in d['keep']:
    if x>=e:a+=e-s
    elif x>s:a+=x-s
  return a/d['speed']
PH={k:(m(a),m(b)) for k,a,b,h in d['phrases']}
S=lambda k:PH[k][0]; E=lambda k:PH[k][1]
END=float(open('end.txt').read()); VEND=m(34.5)
C=dict(B=m(2.43),C=m(4.27),D=m(5.63),E=m(6.34),F=m(10.27),G=m(15.12),H=m(17.22),I=m(23.31),J=m(28.43),K=m(30.89),L=m(32.21))
A='../assets/'
ev=[('impact',0.0,.9,1.0),('impact',m(1.55),.45,1.0)]+[('pop',.6+i*.35,.5,.45) for i in range(3)]
for k in 'BCEFIJKL': ev.append(('whoosh',max(0,C[k]-.35),.5,.85))
ev+=[('whoosh',max(0,S('pump')-.35),.45,.85)]
ev+=[('pop',C['B']+.15+i*.11,.35,.4) for i in range(0,12,3)]+[('cash',C['B']+.35,.4,1.2)]
ev+=[('drop',C['D']-.11,.9,.6),('pop',S('budget')+.45,.5,.45),('pop',S('budget')+1.15,.5,.45)]
pa=m(11.1); ev+=[('cash',pa+.35,.6,1.4),('pop',S('model')+.75,.5,.45),('pop',S('stages')+.2,.5,.45)]
ev+=[('drop',C['G']+.1,.6,.6),('pop',S('gmax')+.2,.5,.45)]
ev+=[('pour',C['H'],.5,1.0),('pop',S('shawa')+.45,.5,.45),('pop',S('chlore'),.5,.45),('pop',S('chlore')+.3,.5,.45),('drop',E('quality')-.45-.11,.6,.6),('drop',S('taste')-.11,.6,.6)]
ev+=[('cash',S('price')+.72,.8,1.5),('pop',C['K']+.6,.5,.45),('ding',C['L']+.4,.7,.5),('ding',S('rest'),.7,.5),('drop',VEND-.11,.8,.6)]
inputs=['-i','voice.wav','-i',A+'music.mp3'];fc=[]
for i,(f,t,v,L) in enumerate(ev):
  inputs+=['-i',A+f+'.mp3'];k=i+2;ms=int(max(0,t)*1000)
  fc.append(f"[{k}:a]atrim=0:{L},afade=t=out:st={L-0.08}:d=0.08,aresample=48000,aformat=channel_layouts=stereo,volume={v},adelay={ms}|{ms}[s{i}]")
fc.append("[0:a]aformat=channel_layouts=stereo,asplit=2[vo][vsc]")
fc.append(f"[1:a]aresample=48000,volume=0.42,atrim=0:{END},afade=t=in:d=0.3,afade=t=out:st={END-1.6}:d=1.6[mu]")
fc.append("[mu][vsc]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=350:makeup=1[mud]")
fc.append("".join(f"[s{i}]" for i in range(len(ev)))+f"amix=inputs={len(ev)}:normalize=0[sfx]")
fc.append(f"[vo][mud][sfx]amix=inputs=3:normalize=0,alimiter=limit=0.89,apad,atrim=0:{END}[out]")
subprocess.run(['ffmpeg','-y','-hide_banner','-loglevel','error']+inputs+['-filter_complex',';'.join(fc),'-map','[out]','-ar','48000','mix.wav'],check=True)
print(len(ev),'sfx; END',END)
