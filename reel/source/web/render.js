const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs=require('fs');
(async()=>{
 let [mode,a,b,outdir]=process.argv.slice(2); if(mode==='stills') outdir=b; // mode: stills "t1,t2" | frames start end outdir
 const browser=await chromium.launch({args:['--allow-file-access-from-files','--font-render-hinting=none']});
 const page=await browser.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
 page.on('console',m=>console.log('PAGE',m.text())); page.on('pageerror',e=>console.log('ERR',e.message));
 console.log('goto');await page.goto('file://'+__dirname+'/index.html');
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.complete?1:new Promise(r=>i.onload=r)))});
 console.log('loaded');await page.waitForTimeout(300);
 fs.mkdirSync(outdir||'stills',{recursive:true});
 if(mode==='stills'){
  for(const t of a.split(',').map(Number)){await page.evaluate(t=>renderAt(t),t);await page.screenshot({path:`${outdir}/s_${t.toFixed(2)}.jpg`,quality:80,type:'jpeg'});}
 } else {
  const fps=30,s=+a,e=+b;
  for(let f=0;f<s;f+=3) await page.evaluate(t=>renderAt(t),f/fps); // warm seek
  for(let f=s;f<e;f++){await page.evaluate(t=>renderAt(t),f/fps);await page.screenshot({path:`${outdir}/f_${String(f).padStart(5,'0')}.jpg`,quality:93,type:'jpeg'});}
 }
 await browser.close();
})().catch(e=>console.log('FATAL',e));
