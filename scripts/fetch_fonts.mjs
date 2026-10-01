// Downloads Montserrat (latin + latin-ext) using @remotion/google-fonts' manifest,
// so renders don't depend on fonts.gstatic.com being reachable from the headless browser.
import { getInfo } from "@remotion/google-fonts/Montserrat";
import fs from "node:fs";
import path from "node:path";

const info = getInfo();
const outDir = path.resolve("public/fonts");
fs.mkdirSync(outDir, { recursive: true });
const manifest = [];
for (const subset of ["latin", "latin-ext"]) {
  const url = info.fonts.normal["900"][subset]; // variable font: one file covers 100-900
  const file = `montserrat-${subset}.woff2`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  fs.writeFileSync(path.join(outDir, file), Buffer.from(await res.arrayBuffer()));
  manifest.push({ subset, file, unicodeRange: info.unicodeRanges[subset], source: url });
  console.log("saved", file);
}
fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
