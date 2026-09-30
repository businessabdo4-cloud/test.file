import {Config} from '@remotion/cli/config';

// Everything in ./assets is served to the video (staticFile('voiceover.mp3') etc.).
Config.setPublicDir('assets');
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setCrf(18);
Config.setPixelFormat('yuv420p');
Config.setOverwriteOutput(true);
Config.setConcurrency(3);
// Remotion's own browser download host is blocked here; use the pre-installed headless shell.
if (process.env.REMOTION_BROWSER !== 'default') {
  Config.setBrowserExecutable(
    process.env.REMOTION_BROWSER_EXECUTABLE ??
      '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',
  );
}
