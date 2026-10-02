const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const fs=require('fs');const {spawn}=require('child_process');
const timing=JSON.parse(fs.readFileSync('build/timing.json','utf8'));
const DUR=27.0,FPS=30;
const mode=process.argv[2]||'stills';
(async()=>{
  const b=await chromium.launch({args:['--disable-web-security','--allow-file-access-from-files']});
  const pg=await b.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
  pg.on('console',m=>console.log('PAGE:',m.text()));pg.on('pageerror',e=>console.log('ERR:',e.message));
  await pg.addInitScript(`window.TIMING=${JSON.stringify(timing)};window.DUR=${DUR};`);
  await pg.goto('http://127.0.0.1:8765/reel.html');await pg.evaluate(()=>window.ready);await pg.waitForTimeout(500);
  if(mode==='stills'){
    const ts=process.argv.slice(3).map(Number);
    for(const t of ts){
      // run preceding frames briefly for stateful bits
      await pg.evaluate(t=>render(t),t);
      await pg.screenshot({path:`build/still_${t.toFixed(2)}.jpg`,type:'jpeg',quality:85});
    }
  } else {
    const N=Math.round(DUR*FPS);
    const ff=spawn('ffmpeg',['-y','-v','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-','-c:v','libx264','-preset','medium','-crf','17','-pix_fmt','yuv420p','build/video.mp4'],{stdio:['pipe','inherit','inherit']});
    const t0=Date.now();
    for(let f=0;f<N;f++){
      await pg.evaluate(t=>render(t),f/FPS);
      const buf=await pg.screenshot({type:'jpeg',quality:94});
      if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));
      if(f%60==0)console.log('frame',f,'/',N,((Date.now()-t0)/1000).toFixed(1)+'s');
    }
    ff.stdin.end();await new Promise(r=>ff.on('close',r));
  }
  await b.close();
})();
