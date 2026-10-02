import {getInputProps} from 'remotion';
import safiSubtitles from './data/subtitles-safi.json';
import youssoufiaSubtitles from './data/subtitles-youssoufia.json';

/**
 * City versions of the ad. Pick one at render time with --props '{"city":"youssoufia"}'
 * (default: safi). Each has its own voice-over + subtitle timing; the city name on screen
 * (hook pin, delivery badge, end card) comes from here too.
 */
export const VARIANTS = {
  safi: {
    subtitles: safiSubtitles,
    voiceover: 'vo/voiceover-clean.wav',
    cityAr: 'آسفي',
    cityLatin: 'SAFI',
    cityIn: 'فآسفي', // "in <city>", as spoken in the delivery line
  },
  youssoufia: {
    subtitles: youssoufiaSubtitles,
    voiceover: 'vo/youssoufia/voiceover-clean.wav',
    cityAr: 'اليوسفية',
    cityLatin: 'YOUSSOUFIA',
    cityIn: 'فاليوسفية',
  },
} as const;

export type City = keyof typeof VARIANTS;

const requested = (getInputProps() as {city?: string}).city;
export const CITY: City = requested && requested in VARIANTS ? (requested as City) : 'safi';
export const VARIANT = VARIANTS[CITY];
