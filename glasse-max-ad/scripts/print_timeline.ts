import {SCENES, TOTAL_FRAMES} from '../src/timeline';
console.log('total', TOTAL_FRAMES, (TOTAL_FRAMES / 30).toFixed(2) + 's');
for (const s of SCENES) console.log(s.id.padEnd(9), s.from, '→', s.from + s.durationInFrames, `(${(s.durationInFrames / 30).toFixed(2)}s)`);
