import numpy as np, wave, sys
from scipy.signal import butter, sosfilt, fftconvolve
W=sys.argv[1]; SR=48000; DUR=25.4
rng=np.random.default_rng(7)
def lp(x,f,o=4): return sosfilt(butter(o,f,'low',fs=SR,output='sos'),x)
def hp(x,f,o=4): return sosfilt(butter(o,f,'high',fs=SR,output='sos'),x)
def bp(x,a,b,o=2): return sosfilt(butter(o,[a,b],'band',fs=SR,output='sos'),x)
def env(n,a,d,curve=4):
    t=np.arange(n)/SR; e=np.minimum(t/max(a,1e-4),1)*np.exp(-np.maximum(t-a,0)*curve/d); return e
def T(d): return np.arange(int(d*SR))/SR
def add(buf,x,t,g=1.0,pan=0.0):
    i=int(t*SR)
    if i<0: x=x[-i:]; i=0
    n=min(len(x),buf.shape[1]-i)
    if n<=0: return
    l=np.cos((pan+1)*np.pi/4); r=np.sin((pan+1)*np.pi/4)
    buf[0,i:i+n]+=x[:n]*g*l*1.414; buf[1,i:i+n]+=x[:n]*g*r*1.414
def reverb(x,dec=1.2,mix=0.25):
    n=int(dec*SR); ir=rng.standard_normal(n)*np.exp(-np.arange(n)/SR*6/dec); ir=lp(ir,6000); ir/=np.sqrt(np.sum(ir**2))
    return x*(1-mix)+fftconvolve(x,ir)[:len(x)]*mix
def save(name,buf):
    buf=buf/np.max(np.abs(buf))*0.89
    o=wave.open(W+'/audio/'+name,'w'); o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR)
    o.writeframes((buf.T*32767).astype(np.int16).tobytes()); o.close()

# ---------------- drum / instrument voices
def kick():
    t=T(0.5); f=45+110*np.exp(-t*28); ph=2*np.pi*np.cumsum(f)/SR
    return np.tanh(2.2*np.sin(ph)*env(len(t),0.001,0.32,5))*0.9 + hp(rng.standard_normal(len(t)),3000)*env(len(t),0.0005,0.01,8)*0.3
def clap():
    t=T(0.35); n=rng.standard_normal(len(t)); e=np.zeros(len(t))
    for k,o in enumerate([0,0.011,0.022]): e+=np.where(t>=o,np.exp(-(t-o)*(60 if k<2 else 14)),0)
    return reverb(bp(n,900,3500)*e,0.6,0.3)*0.8
def hat(d=0.05,g=1):
    t=T(d+0.02); return hp(rng.standard_normal(len(t)),7500)*env(len(t),0.0005,d,5)*0.35*g
def b808(f0,d,glide=None):
    t=T(d); f=np.full(len(t),f0)
    if glide: f=f0*(glide/f0)**np.clip((t-d*0.5)/0.08,0,1)
    ph=2*np.pi*np.cumsum(f)/SR; e=env(len(t),0.003,d*1.1,2.5); e*=np.clip((d-t)/0.03,0,1)
    return np.tanh(1.8*np.sin(ph)*e)*0.85
def bell(f,d=0.9):
    t=T(d); m=np.sin(2*np.pi*f*3.5*t)*2.2*np.exp(-t*7)
    return np.sin(2*np.pi*f*t+m)*env(len(t),0.002,d,5)*0.3
def pad(fs,d):
    t=T(d); x=sum(sum(np.sin(2*np.pi*f*(1+dt)*t+rng.uniform(0,6)) /h for h in range(1,7) for _ in [0]) for f in fs for dt in (-0.004,0.004))
    x=lp(x,1400); return x*np.minimum(1,np.minimum(t/0.4,(d-t)/0.4).clip(0))*0.05

BPM=140; beat=60/BPM; bar=4*beat; DROP=4.35; g0=DROP-3*bar
A1,F1,D1,E1=55.0,43.65,36.71,41.2
chords=[(A1,[220,261.6,329.6]),(F1,[174.6,220,261.6]),(D1,[146.8,174.6,220,293.7]),(E1,[164.8,207.7,246.9])]
mel=[[0,4,7,12,7,4,12,7],[0,3,7,12,10,7,3,7],[0,5,7,12,7,5,10,7],[0,4,7,11,7,4,11,12]]
END=23.95
def section(t):
    if t<1.18: return 'hook'
    if t<3.57: return 'muffle'
    if t<DROP-0.02: return 'build'
    if t<END: return 'drop'
    return 'out'
full=np.zeros((2,int(DUR*SR))); muff=np.zeros_like(full)
K,C=kick(),clap()
nb=int((DUR-g0)/bar)+1
for b in range(nb):
    t0=g0+b*bar; root,cf=chords[b%4]
    for s in range(32):  # 32nd grid? use 16ths
        pass
    for i in range(16):
        t=t0+i*beat/4; sec=section(t)
        if t<-0.3 or t>DUR: continue
        tgt= muff if sec=='muffle' else full
        if sec in('build',): continue
        if sec=='out' and t>END+0.01: continue
        # kick
        if i in (0,7,10) or (b%2==1 and i==14):
            if sec!='hook' or i==0: add(tgt,K,t,0.9)
        if i==8 and sec!='hook': add(tgt,C,t,0.7,0.05)
        # hats: 8ths, rolls at end of bar
        if i%2==0: add(tgt,hat(0.045,1.0 if i%4==0 else 0.7),t,0.9,0.3)
        if b%2==1 and i>=12:
            for r in range(3): add(tgt,hat(0.025,0.6),t+r*beat/12,0.8,0.3)
        # 808
        if i in (0,7,10):
            dd={0:beat*1.75,7:beat*0.75,10:beat*1.5}[i]
            gl= root*2 if (i==10 and b%2==1) else None
            add(tgt,b808(root if i!=7 else root*1.5 if root<50 else root,dd,gl),t,0.75)
        # melody (8ths)
        if i%2==0:
            st=mel[b%4][i//2]; f=chords[b%4][1][0]*2**(st/12)
            add(tgt,bell(f),t,0.55 if sec!='hook' else 0.7,-0.3+0.6*((i//2)%2))
    sec=section(t0+0.01)
    tgt= muff if sec=='muffle' else full
    if t0>-bar and sec!='build': add(tgt,pad(cf,bar),t0,1.0)
# muffled section: lowpass
muff[0]=lp(muff[0],380); muff[1]=lp(muff[1],380)
mus=full+muff*1.3
# build: riser + snare roll
t=T(DROP-3.57); n=len(t)
ris=hp(rng.standard_normal(n),300)*np.linspace(0,1,n)**2*0.25
fr=200*(8**(t/t[-1])); ris+=np.sin(2*np.pi*np.cumsum(fr)/SR)*np.linspace(0,1,n)**2*0.12
add(mus,ris,3.57,1.0)
k=0
while 3.57+k*beat/4<DROP-0.05:
    tt=3.57+k*beat/4; add(mus,C*0.6,tt,0.3+0.6*(tt-3.57)/(DROP-3.57)); k+=1
# final hit + tail
tail=bell(220,3)+bell(329.6,3)*0.7+bell(440,3)*0.5; add(mus,reverb(tail,2.5,0.5),END,0.8)
add(mus,K,END,1.0); add(mus,b808(A1,1.6),END,0.8); add(mus,pad([220,261.6,329.6],1.5),END,2.0)
fade=np.clip((DUR-np.arange(mus.shape[1])/SR)/0.6,0,1); mus*=fade
save('music.wav',mus)

# ---------------- SFX
def whoosh(d=0.45,up=True):
    t=T(d); n=rng.standard_normal(len(t)); fc=np.linspace(300,4000,len(t)) if up else np.linspace(4000,300,len(t))
    out=np.zeros(len(t)); blk=480
    for i in range(0,len(t),blk):
        out[i:i+blk]=bp(n[max(0,i-2000):i+blk],fc[i]*0.6,min(fc[i]*1.6,20000))[-len(n[i:i+blk]):]
    e=np.sin(np.pi*t/d)**2; return out*e*0.9
def impact():
    t=T(1.6); f=30+90*np.exp(-t*8); x=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*2.5)
    x+=lp(rng.standard_normal(len(t)),2500)*np.exp(-t*12)*0.6
    return reverb(np.tanh(1.8*x),1.8,0.35)
def pop(f=900):
    t=T(0.12); fr=f*(1+1.5*np.exp(-t*60)); return np.sin(2*np.pi*np.cumsum(fr)/SR)*env(len(t),0.001,0.08,5)*0.7
def click():
    t=T(0.03); return hp(rng.standard_normal(len(t)),2000)*np.exp(-t*300)*0.9 + np.sin(2*np.pi*2500*t)*np.exp(-t*200)*0.4
def ding():
    t=T(1.2); x=sum(np.sin(2*np.pi*f*t)*np.exp(-t*d)*a for f,d,a in [(1318.5,4,0.5),(2637,6,0.2),(1975.5,5,0.25)])
    t2=T(1.2); y=sum(np.sin(2*np.pi*f*t2)*np.exp(-t2*d)*a for f,d,a in [(1760,4,0.5),(3520,6,0.2)])
    o=np.zeros(len(t)+int(0.11*SR)); o[:len(t)]+=x; o[int(0.11*SR):]+=y; return reverb(o,1,0.25)
def kaching():
    t=T(1.4); x=np.zeros(len(t))
    for f,a in [(2093,0.4),(2637,0.35),(3136,0.3),(4186,0.25),(5274,0.15)]: x+=np.sin(2*np.pi*f*t)*np.exp(-t*3.5)*a
    x=np.concatenate([np.zeros(int(0.09*SR)),x])
    c=np.zeros(len(x)); cl=click(); c[:len(cl)]+=cl; c[int(0.05*SR):int(0.05*SR)+len(cl)]+=cl*0.8
    for k in range(14):  # coins
        o=int(rng.uniform(0.1,0.7)*SR); tt=T(0.08); f=rng.uniform(4000,8000)
        seg=np.sin(2*np.pi*f*tt)*np.exp(-tt*60)*rng.uniform(0.1,0.3); c[o:o+len(seg)]+=seg[:len(c)-o]
    return reverb(x+c,1,0.2)
def buzz():
    t=T(0.42); sq=np.sign(np.sin(2*np.pi*110*t))+0.5*np.sign(np.sin(2*np.pi*116*t))
    g=((t%0.21)<0.16).astype(float); return lp(sq,2500)*g*0.35
def glitch(d=0.35):
    t=T(d); x=np.zeros(len(t)); i=0
    while i<len(t):
        L=int(rng.uniform(0.01,0.05)*SR); kind=rng.integers(3)
        tt=np.arange(min(L,len(t)-i))/SR
        if kind==0: seg=np.round(rng.standard_normal(len(tt))*3)/3*0.3
        elif kind==1: seg=np.sign(np.sin(2*np.pi*rng.uniform(200,2000)*tt))*0.25
        else: seg=np.zeros(len(tt))
        x[i:i+len(tt)]=seg; i+=L
    return hp(x,200)
def tick():
    t=T(0.06); return bp(rng.standard_normal(len(t)),2500,6000)*np.exp(-t*120)*0.9
def zap():
    t=T(0.5); f=2000*np.exp(-t*8)+80; x=np.sign(np.sin(2*np.pi*np.cumsum(f)/SR))*np.exp(-t*6)*0.3
    return lp(x+hp(rng.standard_normal(len(t)),3000)*np.exp(-t*15)*0.3,8000)
def stamp():
    t=T(0.6); x=np.sin(2*np.pi*np.cumsum(60+60*np.exp(-t*30))/SR)*np.exp(-t*9)+lp(rng.standard_normal(len(t)),1800)*np.exp(-t*25)*0.8
    return reverb(np.tanh(2*x),0.6,0.2)
def shimmer():
    t=T(1.8); x=np.zeros(len(t))
    for k in range(30):
        o=int(rng.uniform(0,1.0)*SR); tt=T(0.4); f=rng.uniform(3000,9000)
        seg=np.sin(2*np.pi*f*tt)*np.exp(-tt*12)*0.12; x[o:o+len(seg)]+=seg[:len(x)-o]
    return reverb(x,1.5,0.5)
def typing(d=0.7):
    x=np.zeros(int(d*SR)); t=0
    while t<d-0.05:
        c=click()*rng.uniform(0.3,0.6); i=int(t*SR); x[i:i+len(c)]+=c[:len(x)-i]; t+=rng.uniform(0.05,0.1)
    return lp(x,7000)
sfx=np.zeros((2,int(DUR*SR))); O=0.1
ev=[ (impact(),0.0,0.9,0),(kaching(),0.02,0.55,0.2),(whoosh(0.4),0.0,0.35,0),
     (whoosh(0.35,False),1.08,0.5,-0.3),(glitch(0.35),1.16,0.5,0),(buzz(),1.25,0.35,0),
     (glitch(0.2),2.0,0.35,0.2),(stamp(),2.47,0.95,0),
     (whoosh(0.45),3.47,0.6,0.3),(impact(),4.33,1.0,0),(shimmer(),4.35,0.6,0),
     (pop(700),4.95,0.5,0),
     (whoosh(0.35),5.6,0.5,0.4),(whoosh(0.3),5.78,0.4,0.2),(whoosh(0.3),5.95,0.4,0),
     (pop(1100),6.85,0.45,0),(whoosh(0.4,False),7.42,0.5,-0.2),(click(),8.12,0.9,0),(ding(),8.15,0.45,0),
     (whoosh(0.45),9.08,0.55,0),(tick(),9.25,0.6,0),(pop(800),10.72,0.45,0),
     (whoosh(0.35),11.43,0.5,-0.3),(pop(1200),12.42,0.45,0),
     (whoosh(0.45),12.9,0.55,0.3),(zap(),13.0,0.5,0),(ding(),14.0,0.5,0),
     (whoosh(0.45),14.71,0.55,-0.3),(pop(900),16.22,0.5,0),(pop(1000),16.88,0.5,0),(pop(1200),17.3,0.45,0),
     (whoosh(0.45),17.58,0.55,0.3),(pop(800),18.49,0.6,0),(pop(1000),19.22,0.6,0),(pop(1200),19.93,0.6,0),(kaching(),20.25,0.3,0),
     (whoosh(0.4,False),20.7,0.5,0)]+[(tick(),20.8+k*0.2,0.55,(-1)**k*0.2) for k in range(4)]+[
     (whoosh(0.4),21.55,0.55,0.3),(typing(0.6),21.75,0.5,0),(pop(1300),22.35,0.6,0),(click(),22.55,0.9,0),
     (whoosh(0.4),22.75,0.5,0),(kaching(),22.83,0.6,0),(impact(),23.95,0.8,0),(shimmer(),23.97,0.5,0)]
for x,t,g,p in ev: add(sfx,x,t,g,p)
save('sfx.wav',sfx*0.7)
print('ok')
