// Bundled fonts (public/fonts, SIL OFL). Rendering waits until every face is loaded.
import {continueRender, delayRender, staticFile} from 'remotion';

const faces: [string, string, string, string][] = [
  ['Playfair Display', 'PlayfairDisplay-500normal.ttf', '500', 'normal'],
  ['Playfair Display', 'PlayfairDisplay-600normal.ttf', '600', 'normal'],
  ['Playfair Display', 'PlayfairDisplay-500italic.ttf', '500', 'italic'],
  ['Manrope', 'Manrope-500.ttf', '500', 'normal'],
  ['Manrope', 'Manrope-700.ttf', '700', 'normal'],
  ['Manrope', 'Manrope-800.ttf', '800', 'normal'],
];

let started = false;
export const loadFonts = () => {
  if (started || typeof document === 'undefined') return;
  started = true;
  const handle = delayRender('fonts');
  Promise.all(
    faces.map(([family, file, weight, style]) => {
      const f = new FontFace(family, `url(${staticFile(`fonts/${file}`)}) format('truetype')`, {weight, style});
      return f.load().then((loaded) => document.fonts.add(loaded));
    }),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
};
