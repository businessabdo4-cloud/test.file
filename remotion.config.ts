import { Config } from "@remotion/cli/config";
import fs from "node:fs";

// Use the pre-installed headless shell in sandboxed environments (no Chrome download).
const shellCandidates = fs.existsSync("/opt/pw-browsers")
  ? fs.readdirSync("/opt/pw-browsers").filter((d) => d.startsWith("chromium_headless_shell-")).sort().reverse()
      .flatMap((d) => ["chrome-linux/headless_shell", "chrome-headless-shell-linux64/chrome-headless-shell"].map((p) => `/opt/pw-browsers/${d}/${p}`))
  : [];
const localShell = shellCandidates.find((p) => fs.existsSync(p));
if (localShell) {
  Config.setBrowserExecutable(localShell);
}

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
Config.setOverwriteOutput(true);
Config.setConcurrency(4);
