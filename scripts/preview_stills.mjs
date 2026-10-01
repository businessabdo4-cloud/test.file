// Renders preview stills of chosen frames (bundles once). Usage:
//   node scripts/preview_stills.mjs Reel9x16 0.5 20,60,95 [outDir]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";

const [id = "Reel9x16", scale = "0.5", frames = "60", outDir = "out/preview"] = process.argv.slice(2);
const browserExecutable = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
fs.mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id, browserExecutable });
for (const f of frames.split(",").map(Number)) {
  const output = path.join(outDir, `${id}_${String(f).padStart(3, "0")}.png`);
  await renderStill({ serveUrl, composition, frame: f, output, scale: Number(scale), browserExecutable, overwrite: true });
  console.log(output);
}
