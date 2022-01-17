// hard limit on max number of rows allowed in spreadsheet.
export const UPLOAD_ROW_LIMIT = 2000;
export const MAX_DATA_FILE_SIZE = 20 * 1024 * 1024; // 20MB
export const MAX_AUDIO_FILE_SIZE = 40 * 1024 * 1024; // 40MB
export const MAX_ROW_DURATION = 60;
export const MAX_STRING_VALUES = 50;
export const SPEECH_AUDIO_CACHE_LIMIT = 120000000; // 12MB

export const DEFAULT_TRACK_TYPE = 'scale';
// export const MIN_TEMPO = 30;
// export const MAX_TEMPO = 240;

export const DEFAULT_SCALE_RANGE = 15; // two whole octaves (inclusive)
export const DEFAULT_START_OCTAVE = -1;
export const DEFAULT_KEY = 'C';
export const DEFAULT_MODE = 'major';
export const DEFAULT_ARPEGGIO_MODE = 'ascending';
export const DEFAULT_INSTRUMENT = 'Piano';
export const DEFAULT_CLIP_PLAY_MODE = 'loop';

export const genders = ['Neutral', 'Female', 'Male'];