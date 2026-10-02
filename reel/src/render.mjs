import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import fs from 'fs';
const tm = JSON.parse(fs.readFileSync('timemap.json'));
const FPS = 30, W = 4;
const only = process.argv[2] ? process.argv[2].split(',').map(Number) : null; // preview times
fs.mkdirSync('frames', { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--allow-file-access-from-files','--font-render-hinting=none'] });
const pages = [];
let END = 0;
for (let i = 0; i < W; i++) {
  const p = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + process.cwd() + '/index.html');
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(400);
  END = await p.evaluate(([k, s]) => window.__setup(k, s), [tm.keep, tm.speed]);
  pages.push(p);
}
const N = Math.ceil(END * FPS);
const jobs = only ? only.map(t => ({ t, path: `prev_${t}.jpg` })) : [...Array(N).keys()].map(f => ({ t: f / FPS, path: `frames/${String(f).padStart(5, '0')}.jpg` }));
console.log('END', END, 'frames', jobs.length);
let next = 0;
await Promise.all(pages.map(async p => {
  while (next < jobs.length) {
    const j = jobs[next++];
    await p.evaluate(t => window.render(t), j.t);
    await p.screenshot({ path: j.path, type: 'jpeg', quality: 93 });
  }
}));
fs.writeFileSync('end.txt', String(END));
await browser.close();
