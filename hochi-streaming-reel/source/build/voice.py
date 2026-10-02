import numpy as np, wave, json, subprocess
# Cut the pauses out of vo.wav, speed it up 1.15x (pitch kept) and write word timings for the captions.
SP=1.15; LEAD=0.10; GAP=0.07; PADS=0.04; PADE=0.06
w=wave.open('vo.wav'); sr=w.getframerate(); x=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16)
# top-level speech segments (original seconds) + sub-chunks with words (text, syllable weight)
SEG=[
 (0.19,3.91,[[(0.19,1.75),[("شحال",2),("كتخلص",3),("في",1),("Netflix",3)]],
             [(1.85,2.93),[("و",1),("Spotify",3),("و",1),("شاهد",2)]],
             [(3.00,3.91),[("كل",1),("واحد",2),("بوحدو؟",3)]]]),
 (4.20,5.05,[[(4.20,5.05),[("عندنا",3),("ليك",1),("الحل",2)]]]),
 (5.50,7.39,[[(5.50,7.39),[("Le",1),("Pack",1),("Streaming",3),("من",1),("عند",1),("Hochi",2),("Shop",1)]]]),
 (7.64,9.68,[[(7.64,8.82),[("Spotify",3),("للموسيقى",4)]],[(8.90,9.68),[("بلا",2),("حدود",2)]]]),
 (9.99,12.17,[[(9.99,12.17),[("Netflix",3),("لأحسن",3),("الأفلام",3),("والمسلسلات",5)]]]),
 (12.45,14.37,[[(12.45,14.37),[("وشاهد",3),("لأحسن",3),("المحتوى",4),("العربي",3)]]]),
 (14.68,15.91,[[(14.68,15.91),[("التلاتة",3),("في",1),("بلاصة",3),("واحدة",3)]]]),
 (16.13,17.56,[[(16.13,17.56),[("وغير",2),("بـ 70",4),("درهم",2),("للشهر",2)]]]),
 (17.92,18.77,[[(17.92,18.77),[("توصيل",3),("سريع",2)]]]),
 (18.92,19.90,[[(18.92,19.90),[("آمن",2),("100%",4)]]]),
 (20.13,22.99,[[(20.13,21.45),[("خدام",2),("على",1),("كاع",1),("الأجهزة",4)]],
               [(21.54,22.41),[("وتقدر",3),("تحبس",2)]],
               [(22.49,22.99),[("فأي",2),("وقت",1)]]]),
 (23.37,24.51,[[(23.37,24.51),[("ما",1),("تبقاش",2),("تخلص",2),("بزاف",2)]]]),
 (24.79,28.01,[[(24.79,26.23),[("أرسل",2),("لنا",2),("ميساج",2)]],
               [(26.31,28.01),[("دابا",2),("على",1),("@hochi_shop_",4)]]]),
]
out=[]; words=[]; cur=0.0; segmap=[]
gap=np.zeros(int(GAP*sr),dtype=np.int16)
for (s,e,subs) in SEG:
    a=max(0,s-PADS); b=e+PADE
    seg=x[int(a*sr):int(b*sr)].copy()
    f=int(0.008*sr); seg[:f]=(seg[:f]*np.linspace(0,1,f)).astype(np.int16); seg[-f:]=(seg[-f:]*np.linspace(1,0,f)).astype(np.int16)
    off=cur-a
    for (ss,ee),ws in subs:
        tot=sum(wt for _,wt in ws); t=ss
        for txt,wt in ws:
            d=(ee-ss)*wt/tot
            words.append({"w":txt,"s":round((t+off)/SP+LEAD,3),"e":round((t+d+off)/SP+LEAD,3)}); t+=d
    segmap.append((round(cur/SP+LEAD,3),round((cur+b-a)/SP+LEAD,3)))
    out.append(seg); out.append(gap); cur+=len(seg)/sr+GAP
y=np.concatenate(out)
lead=np.zeros(int(LEAD*SP*sr),dtype=np.int16)
wo=wave.open('build/vo_cut.wav','wb'); wo.setnchannels(1); wo.setsampwidth(2); wo.setframerate(sr); wo.writeframes(np.concatenate([lead,y]).tobytes()); wo.close()
json.dump({"words":words,"segs":segmap,"vo_end":round(cur/SP+LEAD,3)},open('build/timing.json','w'),ensure_ascii=False,indent=0)
# speed-up with pitch kept, plus clean-up EQ and compression
subprocess.run(['ffmpeg','-y','-v','error','-i','build/vo_cut.wav','-af',
  f'rubberband=tempo={SP}:pitchq=quality:formant=preserved,highpass=f=80,equalizer=f=250:t=q:w=1.2:g=-3,'
  'equalizer=f=3200:t=q:w=1.5:g=3,equalizer=f=9000:t=h:w=0.7:g=2,acompressor=threshold=-20dB:ratio=3:attack=8:release=120:makeup=2',
  '-ar','48000','build/vo_fast.wav'],check=True)
print("cut len",round(cur,3),"-> sped",round(cur/SP+LEAD,3))
for i,(a,b) in enumerate(segmap): print(i,a,b)
