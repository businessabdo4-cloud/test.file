import numpy as np, json
peaks=np.load('peaks.npy')
gaps=[(0.32,0.37),(1.35,1.39),(2.40,2.47),(2.70,2.76),(3.30,3.35),(3.84,3.91),(4.24,4.29),(4.75,4.85),(5.43,5.50),(5.51,5.63),(8.47,8.52),(8.60,8.66),(9.43,9.48),(10.16,10.27),(10.89,10.95),(12.32,12.36),(14.90,15.12),(16.41,16.49),(17.19,17.26),(17.35,17.40),(17.67,17.73),(18.63,18.72),(18.84,18.89),(19.17,19.27),(19.41,19.51),(20.23,20.46),(20.52,20.57),(20.86,20.94),(21.52,21.57),(21.72,21.79),(22.52,22.62),(23.21,23.31),(24.10,24.15),(24.72,24.79),(25.18,25.24),(25.63,25.75),(26.48,26.53),(26.73,26.78),(28.31,28.43),(28.50,28.55),(28.70,28.76),(29.09,29.16),(30.75,30.89),(31.67,31.72),(32.10,32.21),(32.41,32.46),(33.03,33.09),(33.37,33.45),(34.00,34.06)]
# groups: (start, end, [(syll, key, html)])
G=[(0.15,5.51,[(5,'safi','ساكن <span class="hl">فآسفي</span>'),(9,'tap','ومازال كتشرب <span class="hl">ماء الروبيني؟</span>'),(10,'bottles','ولا كل سيمانة كتخسر <span class="hl">فالقراعي</span>'),(7,'stairs','وكتعيا <span class="hl">بالطلوع والهبوط؟</span>')]),
   (5.63,10.18,[(4,'wm','<span class="lat hc">Water Maroc</span>'),(11,'types','عندها جميع الأنواع ديال فلاتر الماء'),(11,'budget','اللي كتناسب <span class="hc">كل دار</span> و<span class="hc">كل ميزانية</span>')]),
   (10.27,14.90,[(11,'from900','والأثمنة كتبدا من <span class="hl">900 درهم</span>'),(9,'model','وكتختالف على حساب الموديل'),(9,'stages','والمراحل ديال التصفية')]),
   (15.12,16.42,[(9,'among','ومن بين الموديلات ديالنا')]),
   (16.49,20.23,[(5,'gmax','كاين <span class="lat hc">GLASSE MAX</span>'),(12,'six','فيه <span class="hl">6</span> ديال المراحل ديال التصفية'),(7,'shawa','كينقص <span class="hl">الشوائب</span>')]),
   (20.46,23.21,[(5,'chlore','<span class="hl">الكلور</span> و<span class="hl">الأملاح</span>'),(8,'quality','اللي كيأثرو على <span class="hc">الجودة</span>'),(5,'taste','و<span class="hc">الطعم</span> ديال الماء')]),
   (23.31,25.63,[(12,'membrane','وفيه ممبران <span class="lat hc">80 GPD</span> من <span class="lat hc">LG</span>')]),
   (25.75,28.31,[(8,'pump','وزايد بومبا <span class="lat hc">HK 2</span>'),(8,'nowaste','باش <span class="hl">مايضيعش</span> ليك الماء')]),
   (28.43,30.75,[(5,'stay','وكيبقى غير بـ'),(10,'price','<span class="lat hl">1799</span> درهم')]),
   (30.89,32.10,[(8,'deliv','التوصيل <span class="hl">فابور</span> فآسفي')]),
   (32.21,33.37,[(8,'send','صيفط لينا ميساج دابا')]),
   (33.45,34.50,[(7,'rest','وخلي الباقي <span class="hc">علينا!</span>')])]
out=[]
for a,b,ph in G:
    pk=[p for p in peaks if a-0.05<=p<=b]
    tot=sum(s for s,_,_ in ph); cum=0; t0=a
    for i,(s,k,h) in enumerate(ph):
        cum+=s
        if i==len(ph)-1: t1=b
        else:
            idx=cum/tot*len(pk)
            j=int(round(idx)); j=min(max(j,1),len(pk)-1)
            t1=(pk[j-1]+pk[j])/2
            # snap to a gap within .3s
            c=[(abs((g0+g1)/2-t1),g0) for g0,g1 in gaps if a<g0<b and abs((g0+g1)/2-t1)<.3]
            if c: t1=min(c)[1]+0.03
        out.append([k,round(t0,2),round(t1,2),h]); t0=t1
for o in out: print(o[0],o[1],o[2])
json.dump(out,open('phrases.json','w'),ensure_ascii=False)
