import { Config } from '@remotion/cli/config';

// Assets (vo/, logo.png, products/, music/) live in ../assets and are served via staticFile().
Config.setPublicDir('../assets');
// Use the Chromium already installed in this environment instead of downloading one.
Config.setBrowserExecutable('/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setConcurrency(4);
