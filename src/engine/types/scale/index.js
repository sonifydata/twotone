import midiOut from '../../../soundq/src/sources/midiOut';
import samplerSource from '../../../soundq/src/sources/sampler';
import gainEnvelope from '../../../soundq/src/patches/gainEnvelope';
import repeater from '../../../soundq/src/sources/repeater';
import { getKeyNoteFrequency } from '../../../soundq/src/util/scales';
import {
	instruments as samplerInstruments,
	loadSamples
} from './samplerInstruments';
import synthInstruments from './synthInstruments';
import num from '../../../util/num';
import {
	DEFAULT_SCALE_RANGE,
	DEFAULT_START_OCTAVE,
	DEFAULT_KEY,
	DEFAULT_MODE,
	DEFAULT_INSTRUMENT,
	DEFAULT_ARPEGGIO_MODE
} from '../../../constants';

// import * as midi from '../../midiSetup';
//
// import { store } from '../../../store';


const instruments = {
	...samplerInstruments,
	...synthInstruments
};

const oscillatorSourceDef = repeater(midiOut, gainEnvelope, {
	attack: 0.03,
	decay: 0.05,
	release: 0.1
});
const oscillatorPromise = Promise.resolve();

const arpeggioSteps = [1, 3, 5, 8].map(step => step - 1);
const arpeggioGenerators = {
	'': baseNote => baseNote,
	ascending: (baseNote, sequenceIndex) =>
		baseNote + arpeggioSteps[sequenceIndex % arpeggioSteps.length],
	descending: (baseNote, sequenceIndex, patternLength) =>
		baseNote + arpeggioSteps[(patternLength - 1 - sequenceIndex) % arpeggioSteps.length]//,
	// random: (baseNote, sequenceIndex, patternLength) =>
	// 	sequenceIndex ?
	// 		baseNote + Math.floor(Math.random() * patternLength) % patternLength :
	// 		baseNote
};

export default function scaleTrack(soundQ, destination) {
	let data = null;
	let shot = null;
	let playRanges = [];
	let contextStartTime = 0;
	let fieldIndex = -1;
	let rowDuration = 1;

	let interval = 0.4;
	let duration = 0.4;
	let tempoFactor = 1;
	let beatOffset = 0;
	let midiChannel = 1;

	let instrumentId = '';
	let instrument = null;
	let loadController = null;
	let samplerPromise = null;
	let sourceDef = null;

	let scaleRange = DEFAULT_SCALE_RANGE;
	let startOctave = DEFAULT_START_OCTAVE;
	let key = DEFAULT_KEY;
	let mode = DEFAULT_MODE;
	let getArpeggioNote = arpeggioGenerators[DEFAULT_ARPEGGIO_MODE];

	function getRowIndex(time) {
		const roundedNoteTime = Math.round(time / interval) * interval;

		return Math.floor(roundedNoteTime / rowDuration) % data.rows.length;
	}

	function getSequenceIndex(time) {
		const roundedNoteTime = Math.round(time / interval) * interval;
		return Math.round(roundedNoteTime * tempoFactor / rowDuration) % tempoFactor;
	}

	const optionsCallback = ({startTime}) => {
		const time = startTime - contextStartTime;
		const rowIndex = getRowIndex(time);
		const value = data.normalized[rowIndex][fieldIndex];

		// rest if value is NaN?
		if (isNaN(value) || typeof value !== 'number') {
			return null;
		}

		const note = Math.round(value * (scaleRange - 1));

		const sequenceIndex = getSequenceIndex(time);
		const arpeggioNote = getArpeggioNote(note, sequenceIndex, tempoFactor);
		const frequency = getKeyNoteFrequency(arpeggioNote, key, mode, startOctave);
		if (sourceDef === oscillatorSourceDef) {
			return {
				frequency,
				midiChannel
			};
		}

		// sampler wants a midi note
		const midiNote = Math.round(69 + 12 * Math.log2(frequency / 440));

		return {
			note: midiNote,
			channel: midiChannel
		};
	};

	const me = {
		load(track) {

			const config = track.config && track.config.scale || {};
			const id = samplerInstruments[config.instrument || ''] ?
				config.instrument :
				'';
			midiChannel = track.midiChannel;
			if (instrumentId !== id) {
				unloadSampler();
				instrumentId = id;
			}
			instrument = instruments[id] || instruments[DEFAULT_INSTRUMENT];

			if (!id || !instrument || !instrument.samples) {
				sourceDef = oscillatorSourceDef;
				return oscillatorPromise;
			}

			if (!samplerPromise) {
				samplerPromise = new Promise(resolve => {
					loadController = window.AbortController ? new AbortController() : null;
					loadSamples(instrument.samples, loadController && loadController.signal || null).then(sampleBuffers => {
						if (id === instrumentId) {
							const maxAmplitude = instrument.maxAmplitude || 1;
							const sustain = 0.7 / maxAmplitude;

							const {release, gain} = instrument;
							sourceDef = repeater(samplerSource(sampleBuffers), gainEnvelope, () => {
								return {
									attack: 0,
									decay: 0,
									sustain,
									release,
									gain
								};
							});

							resolve();
						}
					});
				});
			}

			return samplerPromise;
		},
		loaded() {
			return !!sourceDef;
		},

		update(track, ranges/*, trackIndex*/) {
			playRanges = ranges;
			fieldIndex = track.intensityField;
			data = this.data;
			rowDuration = this.rowDuration;
			//console.log( data );
			const config = track.config && track.config.scale || {};
			scaleRange = num(config.scaleRange, DEFAULT_SCALE_RANGE);
			startOctave = num(config.startOctave, DEFAULT_START_OCTAVE);
			tempoFactor = num(config.tempoFactor, 1);
			beatOffset = num(config.beatOffset, 0);
			getArpeggioNote = arpeggioGenerators[config.arpeggioMode] || arpeggioGenerators[DEFAULT_ARPEGGIO_MODE];
			midiChannel = this.midiChannel;

			interval = rowDuration / tempoFactor;
			duration = interval + (instrument ? instrument.release : 0.1) + 0.01;
			// todo: correct duration for offset, depending on play mode

			// adjust octave to fit range
			const { minOctave, maxOctave } = instrument;

			const scaleRangeOctaves = Math.max(1, Math.floor(scaleRange / 7));
			if (startOctave >= 0 && startOctave + scaleRangeOctaves > maxOctave) {
				startOctave = Math.max(minOctave, maxOctave - scaleRangeOctaves);
			}

			const configStartOctave = Math.max(minOctave, Math.min(maxOctave, startOctave));
			const effectiveMinOctave = startOctave >= 0 ?
				configStartOctave :
				minOctave;
			const octaveRange = 1 + maxOctave - effectiveMinOctave;
			const octaves = Math.min(octaveRange, scaleRangeOctaves);
			scaleRange = octaves * 7 + 1; // inclusive

			if (startOctave >= 0) {
				startOctave = configStartOctave;
			} else {
				const centerOctave = Math.floor(minOctave + octaveRange / 2);
				startOctave = centerOctave - Math.floor(octaves / 2);
			}

			key = config.key === undefined ? DEFAULT_KEY : config.key;
			mode = config.mode === undefined ? DEFAULT_MODE : config.mode;

			if (shot) {
				shot.set({
					interval,
					duration
				});
			}
		},
		start: function (cst) {
			contextStartTime = cst;

			if (!(fieldIndex >= 0 && data && data.fields && fieldIndex < data.fields.length)) {
				// nothing to play
				return;
			}
			// shot seems to be the main sound event?
			if (!shot) {

				shot = soundQ.shot(sourceDef, destination).set({
					interval,
					duration
				});


			}

			const currentTime = soundQ.currentTime;
			const minRangeTime = Math.max(0, currentTime - contextStartTime);
			playRanges.forEach(([begin, end]) => {

				begin = Math.max(begin + beatOffset / tempoFactor, minRangeTime);

				if (end <= begin) {
					return;
				}

				shot.start(contextStartTime + begin, optionsCallback);
				shot.stop(contextStartTime + end);
			});
		},
		stop() {
			// clear all shots
			if (shot) {
				shot.stop();
			}
		},
		destroy: unloadSampler
	};

	function unloadSampler() {
		if (shot) {
			shot.destroy();
			shot = null;
		}

		if (loadController) {
			loadController.abort();
			loadController = null;
		}
		instrumentId = '';
		instrument = null;
		samplerPromise = null;
		sourceDef = null;
	}

	return me;
}