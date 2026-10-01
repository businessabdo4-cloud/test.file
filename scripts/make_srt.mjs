// Writes out/reel_fr.srt from the subtitle chunks in public/data/timeline.json
// (the same chunks that are burned into the video).
import fs from "node:fs";
const tl = JSON.parse(fs.readFileSync("public/data/timeline.json", "utf8"));
const ts = (s) => {
  const ms = Math.round(s * 1000);
  const p = (n, w = 2) => String(n).padStart(w, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`;
};
const srt = tl.subtitles.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n${c.text}\n`).join("\n");
fs.mkdirSync("out", { recursive: true });
fs.writeFileSync("out/reel_fr.srt", srt);
console.log(`out/reel_fr.srt: ${tl.subtitles.length} cues`);
