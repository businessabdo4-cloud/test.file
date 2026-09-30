import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

// Local copies of Google Fonts (assets/fonts) so renders never depend on the network.
const faces: {family: string; file: string; weight: string; style?: string}[] = [
  {family: 'Cairo', file: 'Cairo-600.ttf', weight: '600'},
  {family: 'Cairo', file: 'Cairo-700.ttf', weight: '700'},
  {family: 'Cairo', file: 'Cairo-800.ttf', weight: '800'},
  {family: 'Cairo', file: 'Cairo-900.ttf', weight: '900'},
  {family: 'Montserrat', file: 'Montserrat-800.ttf', weight: '800'},
  {family: 'Montserrat', file: 'Montserrat-900.ttf', weight: '900'},
  {family: 'Open Sans', file: 'OpenSans-700i.ttf', weight: '700', style: 'italic'},
];

export const fontsLoaded = Promise.all(
  faces.map((f) =>
    loadFont({
      family: f.family,
      url: staticFile(`fonts/${f.file}`),
      weight: f.weight,
      style: f.style ?? 'normal',
    }),
  ),
);
