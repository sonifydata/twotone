/*
Inspired by https://codepen.io/jakealbaugh/pen/NrdEYL/
*/
const A4  = 440;
export const noteToScaleIndex = {
	cbb: -2, cb: -1, c: 0, 'c#': 1, cx: 2, dbb: 0, db: 1, d: 2, 'd#': 3, dx: 4, ebb: 2, eb: 3, e: 4, 'e#': 5, ex: 6, fbb: 3, fb: 4, f: 5, 'f#': 6, fx: 7, gbb: 5, gb: 6, g: 7, 'g#': 8, gx: 9, abb: 7, ab: 8, a: 9, 'a#': 10, ax: 11, bbb: 9, bb: 10, b: 11, 'b#': 12, bx: 13
};

export const keys = [
	'C',
	'C#',
	'D',
	'D#',
	'E',
	'F',
	'F#',
	'G',
	'G#',
	'A',
	'A#',
	'B'
];
const modeScales = {
	minor: 'aeo',
	major: 'ion',
	ionian: 'ion',
	dorian: 'dor',
	phrygian: 'phr',
	lydian: 'lyd',
	mixolydian: 'mix',
	aeolian: 'aeo',
	locrian: 'loc',
	melodic: 'mel',
	harmonic: 'har'
};
export const modes = [
	'major',
	'minor',
	'melodic',
	'harmonic',
	'ionian',
	'dorian',
	'phrygian',
	'lydian',
	'mixolydian',
	'aeolian',
	'locrian'
];
const flatSharp = {
	Cb: 'B',
	Db: 'C#',
	Eb: 'D#',
	Fb: 'E',
	Gb: 'F#',
	Ab: 'G#',
	Bb: 'A#'
};
// const triads = {
// 	maj: [0, 4, 7],
// 	min: [0, 3, 7],
// 	dim: [0, 3, 6],
// 	aug: [0, 4, 8]
// };
export const scales = {
	ion: {
		name: 'Ionian',
		steps: [0, 2, 4, 5, 7, 9, 11],
		dominance: [3, 0, 1, 0, 2, 0, 1],
		triads: [
			'maj',
			'min',
			'min',
			'maj',
			'maj',
			'min',
			'dim'
		]
	},
	dor: {
		name: 'Dorian',
		steps: [0, 2, 3, 5, 7, 9, 10],
		dominance: [3, 0, 1, 0, 2, 2, 1],
		triads: [
			'min',
			'min',
			'maj',
			'maj',
			'min',
			'dim',
			'maj'
		]
	},
	phr: {
		name: 'Phrygian',
		steps: [0, 1, 3, 5, 7, 8, 10],
		dominance: [3, 2, 1, 0, 2, 0, 1],
		triads: [
			'min',
			'maj',
			'maj',
			'min',
			'dim',
			'maj',
			'min'
		]
	},
	lyd: {
		name: 'Lydian',
		steps: [0, 2, 4, 6, 7, 9, 11],
		dominance: [3, 0, 1, 2, 2, 0, 1],
		triads: [
			'maj',
			'maj',
			'min',
			'dim',
			'maj',
			'min',
			'min'
		]
	},
	mix: {
		name: 'Mixolydian',
		steps: [0, 2, 4, 5, 7, 9, 10],
		dominance: [3, 0, 1, 0, 2, 0, 2],
		triads: [
			'maj',
			'min',
			'dim',
			'maj',
			'min',
			'min',
			'maj'
		]
	},
	aeo: {
		name: 'Aeolian',
		steps: [0, 2, 3, 5, 7, 8, 10],
		dominance: [3, 0, 1, 0, 2, 0, 1],
		triads: [
			'min',
			'dim',
			'maj',
			'min',
			'min',
			'maj',
			'maj'
		]
	},
	loc: {
		name: 'Locrian',
		steps: [0, 1, 3, 5, 6, 8, 10],
		dominance: [3, 0, 1, 0, 3, 0, 0],
		triads: [
			'dim',
			'maj',
			'min',
			'min',
			'maj',
			'maj',
			'min'
		]
	},
	mel: {
		name: 'Melodic Minor',
		steps: [0, 2, 3, 5, 7, 9, 11],
		dominance: [3, 0, 1, 0, 3, 0, 0],
		triads: [
			'min',
			'min',
			'aug',
			'maj',
			'maj',
			'dim',
			'dim'
		]
	},
	har: {
		name: 'Harmonic Minor',
		steps: [0, 2, 3, 5, 7, 8, 11],
		dominance: [3, 0, 1, 0, 3, 0, 0],
		triads: [
			'min',
			'dim',
			'aug',
			'min',
			'maj',
			'maj',
			'dim'
		]
	}
};

export function getNoteMidi(note, octave = 4) {
	note = note.toLowerCase();

	const index = noteToScaleIndex[note];
	return index + (octave + 1) * 12;
}

export function getNoteFrequency(note, octave = 4) {
	const noteNumber = getNoteMidi(note, octave); // MIDI

	return A4  * Math.pow(2, (noteNumber - 69) / 12);
}

export function getNote(index, key = 'C', mode = 'major', octave = 4) {
	key = key.toUpperCase();
	key = flatSharp[key] || key;

	const scaleName = modeScales[mode];
	const scale = scales[scaleName];
	const steps = scale.steps;

	const step = steps[index];
	const offset = keys.indexOf(key);
	const noteIndex = (offset + step) % keys.length;

	// relative octave. 0 = same as root, 1 = next ocave up
	const relativeOctave = offset + step > keys.length - 1 ? 1 : 0;
	const note = keys[noteIndex];

	// todo: maybe we want this as a pair
	// rather than a string
	return note + (octave + relativeOctave);
}

export function getKeyNoteFrequency(index, key = 'C', mode = 'major', octave = 4) {
	key = key.toUpperCase();
	key = flatSharp[key] || key;

	const scaleName = modeScales[mode];
	const scale = scales[scaleName];
	const steps = scale.steps;

	const stepIndex = index % steps.length;
	const step = steps[stepIndex];
	const additionalOctave = Math.floor(index / steps.length);
	const offset = keys.indexOf(key);
	const noteIndex = (offset + step) % keys.length;

	// relative octave. 0 = same as root, 1 = next ocave up
	const relativeOctave = offset + step > keys.length - 1 ? 1 : 0;
	const note = keys[noteIndex];

	return getNoteFrequency(note, octave + relativeOctave + additionalOctave);
}
