import numpy as np, wave, json, subprocess
SP=1.15; LEAD=0.10; GAP=0.07; PADS=0.04; PADE=0.06
w=wave.open('vo.wav'); sr=w.getframerate(); x=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16)
# top-level speech segments (original seconds) + sub-chunks with words (text, syllable weight)
SEG=[
 (0.32,2.62,[[(0.32,2.62),[("باغي",2),("تدير",2),("فيديوهات",4),("بحال",2),("ديال",2),("المحترفين؟",5)]]]),
 (2.92,7.95,[[(2.92,4.23),[("سالينا",3),("مع",1),("الواترمارك",4)]],
             [(4.30,5.56),[("والفونكسيونات",5),("المسدودة",4)]],
             [(5.70,6.52),[("مع",1),("CapCut",2),("Pro",1)]],
             [(6.61,7.83),[("من",1),("عند",1),("هوشي",2),("شوب",1)]]]),
 (8.23,9.11,[[(8.23,9.11),[("كولشي",2),("كيتحل",3),("ليك",1)]]]),
 (9.48,11.16,[[(9.48,10.30),[("الإيفيات،",4)]],[(10.42,11.16),[("الموديلات،",4)]]]),
 (11.35,12.84,[[(11.35,12.84),[("أدوات",3),("الذكاء",3),("الاصطناعي",4)]]]),
 (13.07,14.25,[[(13.07,14.25),[("sous-titres",3),("أوتوماتيك",4)]]]),
 (14.52,16.09,[[(14.52,16.09),[("تحيد",3),("الخلفية",4),("بكليكة",3),("وحدة",2)]]]),
 (16.42,18.28,[[(16.42,18.28),[("وتصدر",3),("الفيديوهات",4),("ديالك",2),("بـ 4K",3)]]]),
 (18.62,20.75,[[(18.62,20.75),[("وكلشي",3),("غير",1),("بـ 45",5),("درهم",2),("للشهر",2)]]]),
 (21.06,23.54,[[(21.06,22.62),[("كتوصل",3),("بالأكونت",4),("ديالك",2),("دغيا",2)]],[(22.70,23.54),[("من",1),("بعد",1),("الخلاص",3)]]]),
 (23.76,25.17,[[(23.76,25.17),[("خدام",2),("على",1),("كاع",1),("الأجهزة",4)]]]),
 (25.33,26.09,[[(25.33,26.09),[("وبلا",2),("التزام",3)]]]),
 (26.43,30.68,[[(26.43,28.45),[("صيفط",2),("لينا",2),("ميساج",2),("دابا",2),("على",1)]],
               [(28.52,28.99),[("@hochi_shop_",3)]],
               [(29.10,30.68),[("وبدا",2),("تصاوب",3),("فيديوهات",4),("واعرين",3)]]]),
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
    segmap.append(((cur)/SP+LEAD,(cur+b-a)/SP+LEAD))
    out.append(seg); out.append(gap); cur+=len(seg)/sr+GAP
y=np.concatenate(out)
lead=np.zeros(int(LEAD*SP*sr),dtype=np.int16)
wo=wave.open('build/vo_cut.wav','wb'); wo.setnchannels(1); wo.setsampwidth(2); wo.setframerate(sr); wo.writeframes(np.concatenate([lead,y]).tobytes()); wo.close()
json.dump({"words":words,"segs":segmap,"vo_end":cur/SP+LEAD},open('build/timing.json','w'),ensure_ascii=False,indent=0)
print("cut len",cur,"-> sped",cur/SP+LEAD)
for w_ in words: print(w_)
