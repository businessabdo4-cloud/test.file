import wave, numpy as np, json, sys
W=sys.argv[1]
w=wave.open(W+'/audio/vo.wav'); sr=w.getframerate(); x=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float32)/32768
hop=int(sr*0.005); n=len(x)//hop
rms=np.array([np.sqrt(np.mean(x[i*hop:(i+1)*hop]**2))+1e-9 for i in range(n)])
db=20*np.log10(rms); peak=db.max(); print('peak dB',peak)
sil=db<(peak-38)
# runs of silence
runs=[];i=0
while i<n:
    if sil[i]:
        j=i
        while j<n and sil[j]: j+=1
        runs.append((i*hop,j*hop)); i=j
    else: i+=1
KEEP=int(sr*0.045)  # keep 45ms each side of a cut
MIN=int(sr*0.11)
out=[];cur=0;segs=[];mapping=[] # mapping: (orig_start, new_start)
pos=0
cuts=[]
for a,b in runs:
    if b-a<MIN: continue
    if a==0: cuts.append((0,max(0,b-int(sr*0.02)))); continue
    if b>=len(x)-hop: cuts.append((a+int(sr*0.08),len(x))); continue
    cuts.append((a+KEEP,b-KEEP))
fade=int(sr*0.006); ramp=np.linspace(0,1,fade)
pieces=[];prev=0;mp=[]
for a,b in cuts:
    if a>prev:
        p=x[prev:a].copy()
        if len(p)>2*fade: p[:fade]*=ramp; p[-fade:]*=ramp[::-1]
        mp.append((prev/sr,a/sr,sum(len(q) for q in pieces)/sr)); pieces.append(p)
    prev=b
if prev<len(x):
    p=x[prev:].copy(); mp.append((prev/sr,len(x)/sr,sum(len(q) for q in pieces)/sr)); pieces.append(p)
y=np.concatenate(pieces)
print('orig',len(x)/sr,'trimmed',len(y)/sr,'cuts',len(cuts))
o=wave.open(W+'/audio/vo_trim.wav','w'); o.setnchannels(1); o.setsampwidth(2); o.setframerate(sr)
o.writeframes((np.clip(y,-1,1)*32767).astype(np.int16).tobytes()); o.close()
json.dump(mp,open(W+'/audio/map.json','w'),indent=0)
# word-ish gaps in trimmed audio for alignment (short dips)
