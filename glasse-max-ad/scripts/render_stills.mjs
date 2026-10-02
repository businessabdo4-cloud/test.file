// Render review stills (bundles once). Usage: [CITY=youssoufia] node scripts/render_stills.mjs 30 95 160 ...  (frames)
//   or: node scripts/render_stills.mjs  (default: a few frames from every scene)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';

const browserExecutable =
  process.env.REMOTION_BROWSER_EXECUTABLE ?? '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('assets')});
const inputProps = {city: process.env.CITY ?? 'safi'};
const composition = await selectComposition({serveUrl, id: 'GlasseMaxAd', browserExecutable, inputProps});
const frames = process.argv.slice(2).map(Number);
const list = frames.length ? frames : JSON.parse(process.env.FRAMES ?? '[]');
for (const frame of list) {
  const output = path.resolve(`out/stills/frame-${String(frame).padStart(4, '0')}.png`);
  await renderStill({serveUrl, composition, frame, output, browserExecutable, inputProps});
  console.log('rendered', output);
}
