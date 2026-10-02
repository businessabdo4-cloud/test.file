import { Config } from '@remotion/cli/config';

// Assets (vo/, logo.png, products/, music/) live in ../assets and are served via staticFile().
Config.setPublicDir('../assets');
// Use the Chromium already installed in this environment instead of downloading one.
Config.setBrowserExecutable('/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell');
// PNG intermediates → true yuv420p (limited range) H.264 instead of yuvj420p.
Config.setVideoImageFormat('png');
Config.setColorSpace('bt709');
Config.setConcurrency(4);
