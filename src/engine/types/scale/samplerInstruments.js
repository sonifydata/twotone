/* global DEBUG */
import { getNoteMidi } from '../../../soundq/src/util/scales';
import decodeAudioBuffer from '../../../util/media/decodeAudioBuffer';

const instruments = {
	piano: {
		name: 'Piano',
		minOctave: 0,
		maxOctave: 7, // plus C8
		release: 0.1,
		maxAmplitude: 0.4453566074371338,
		gain: 0.5,
		samples: {
			A0: require('../../../audio/samplers/piano/A0.mp3'),
			A1: require('../../../audio/samplers/piano/A1.mp3'),
			A2: require('../../../audio/samplers/piano/A2.mp3'),
			A3: require('../../../audio/samplers/piano/A3.mp3'),
			A4: require('../../../audio/samplers/piano/A4.mp3'),
			A5: require('../../../audio/samplers/piano/A5.mp3'),
			A6: require('../../../audio/samplers/piano/A6.mp3'),
			A7: require('../../../audio/samplers/piano/A7.mp3'),
			C1: require('../../../audio/samplers/piano/C1.mp3'),
			C2: require('../../../audio/samplers/piano/C2.mp3'),
			C3: require('../../../audio/samplers/piano/C3.mp3'),
			C4: require('../../../audio/samplers/piano/C4.mp3'),
			C5: require('../../../audio/samplers/piano/C5.mp3'),
			C6: require('../../../audio/samplers/piano/C6.mp3'),
			C7: require('../../../audio/samplers/piano/C7.mp3'),
			C8: require('../../../audio/samplers/piano/C8.mp3'),
			Ds1: require('../../../audio/samplers/piano/Ds1.mp3'),
			Ds2: require('../../../audio/samplers/piano/Ds2.mp3'),
			Ds3: require('../../../audio/samplers/piano/Ds3.mp3'),
			Ds4: require('../../../audio/samplers/piano/Ds4.mp3'),
			Ds5: require('../../../audio/samplers/piano/Ds5.mp3'),
			Ds6: require('../../../audio/samplers/piano/Ds6.mp3'),
			Ds7: require('../../../audio/samplers/piano/Ds7.mp3'),
			Fs1: require('../../../audio/samplers/piano/Fs1.mp3'),
			Fs2: require('../../../audio/samplers/piano/Fs2.mp3'),
			Fs3: require('../../../audio/samplers/piano/Fs3.mp3'),
			Fs4: require('../../../audio/samplers/piano/Fs4.mp3'),
			Fs5: require('../../../audio/samplers/piano/Fs5.mp3'),
			Fs6: require('../../../audio/samplers/piano/Fs6.mp3'),
			Fs7: require('../../../audio/samplers/piano/Fs7.mp3')
		}
	},
	organ: {
		name: 'Church Organ',
		minOctave: 2,
		maxOctave: 6,
		release: 0.5,
		maxAmplitude: 0.787261962890625,
		gain: 0.7,
		samples: {
			// todo: batch convert to mp3
			As2: require('../../../audio/samplers/organ/organ-tutti-As2.mp3'),
			As3: require('../../../audio/samplers/organ/organ-tutti-As3.mp3'),
			As4: require('../../../audio/samplers/organ/organ-tutti-As4.mp3'),
			As5: require('../../../audio/samplers/organ/organ-tutti-As5.mp3'),
			A2: require('../../../audio/samplers/organ/organ-tutti-A2.mp3'),
			A3: require('../../../audio/samplers/organ/organ-tutti-A3.mp3'),
			A4: require('../../../audio/samplers/organ/organ-tutti-A4.mp3'),
			A5: require('../../../audio/samplers/organ/organ-tutti-A5.mp3'),
			B2: require('../../../audio/samplers/organ/organ-tutti-B2.mp3'),
			B3: require('../../../audio/samplers/organ/organ-tutti-B3.mp3'),
			B4: require('../../../audio/samplers/organ/organ-tutti-B4.mp3'),
			B5: require('../../../audio/samplers/organ/organ-tutti-B5.mp3'),
			Cs2: require('../../../audio/samplers/organ/organ-tutti-Cs2.mp3'),
			Cs3: require('../../../audio/samplers/organ/organ-tutti-Cs3.mp3'),
			Cs4: require('../../../audio/samplers/organ/organ-tutti-Cs4.mp3'),
			Cs5: require('../../../audio/samplers/organ/organ-tutti-Cs5.mp3'),
			Cs6: require('../../../audio/samplers/organ/organ-tutti-Cs6.mp3'),
			C2: require('../../../audio/samplers/organ/organ-tutti-C2.mp3'),
			C3: require('../../../audio/samplers/organ/organ-tutti-C3.mp3'),
			C4: require('../../../audio/samplers/organ/organ-tutti-C4.mp3'),
			C5: require('../../../audio/samplers/organ/organ-tutti-C5.mp3'),
			C6: require('../../../audio/samplers/organ/organ-tutti-C6.mp3'),
			Ds2: require('../../../audio/samplers/organ/organ-tutti-Ds2.mp3'),
			Ds3: require('../../../audio/samplers/organ/organ-tutti-Ds3.mp3'),
			Ds4: require('../../../audio/samplers/organ/organ-tutti-Ds4.mp3'),
			Ds5: require('../../../audio/samplers/organ/organ-tutti-Ds5.mp3'),
			Ds6: require('../../../audio/samplers/organ/organ-tutti-Ds6.mp3'),
			D2: require('../../../audio/samplers/organ/organ-tutti-D2.mp3'),
			D3: require('../../../audio/samplers/organ/organ-tutti-D3.mp3'),
			D4: require('../../../audio/samplers/organ/organ-tutti-D4.mp3'),
			D5: require('../../../audio/samplers/organ/organ-tutti-D5.mp3'),
			D6: require('../../../audio/samplers/organ/organ-tutti-D6.mp3'),
			E2: require('../../../audio/samplers/organ/organ-tutti-E2.mp3'),
			E3: require('../../../audio/samplers/organ/organ-tutti-E3.mp3'),
			E4: require('../../../audio/samplers/organ/organ-tutti-E4.mp3'),
			E5: require('../../../audio/samplers/organ/organ-tutti-E5.mp3'),
			E6: require('../../../audio/samplers/organ/organ-tutti-E6.mp3'),
			Fs2: require('../../../audio/samplers/organ/organ-tutti-Fs2.mp3'),
			Fs3: require('../../../audio/samplers/organ/organ-tutti-Fs3.mp3'),
			Fs4: require('../../../audio/samplers/organ/organ-tutti-Fs4.mp3'),
			Fs5: require('../../../audio/samplers/organ/organ-tutti-Fs5.mp3'),
			Fs6: require('../../../audio/samplers/organ/organ-tutti-Fs6.mp3'),
			F2: require('../../../audio/samplers/organ/organ-tutti-F2.mp3'),
			F3: require('../../../audio/samplers/organ/organ-tutti-F3.mp3'),
			F4: require('../../../audio/samplers/organ/organ-tutti-F4.mp3'),
			F5: require('../../../audio/samplers/organ/organ-tutti-F5.mp3'),
			F6: require('../../../audio/samplers/organ/organ-tutti-F6.mp3'),
			Gs2: require('../../../audio/samplers/organ/organ-tutti-Gs2.mp3'),
			Gs3: require('../../../audio/samplers/organ/organ-tutti-Gs3.mp3'),
			Gs4: require('../../../audio/samplers/organ/organ-tutti-Gs4.mp3'),
			Gs5: require('../../../audio/samplers/organ/organ-tutti-Gs5.mp3'),
			G2: require('../../../audio/samplers/organ/organ-tutti-G2.mp3'),
			G3: require('../../../audio/samplers/organ/organ-tutti-G3.mp3'),
			G4: require('../../../audio/samplers/organ/organ-tutti-G4.mp3'),
			G5: require('../../../audio/samplers/organ/organ-tutti-G5.mp3'),
			G6: require('../../../audio/samplers/organ/organ-tutti-G6.mp3')
		}
	},
	mandolin: {
		name: 'Mandolin',
		minOctave: 3,
		maxOctave: 6,
		release: 0.2,
		maxAmplitude: 0.99212646484375,
		samples: {
			G4: require('../../../audio/samplers/mandolin/mandolin-G4.mp3'),
			G3: require('../../../audio/samplers/mandolin/mandolin-G3.mp3'),
			Fs6: require('../../../audio/samplers/mandolin/mandolin-Fs6.mp3'),
			Fs5: require('../../../audio/samplers/mandolin/mandolin-Fs5.mp3'),
			E4: require('../../../audio/samplers/mandolin/mandolin-E4.mp3'),
			Ds6: require('../../../audio/samplers/mandolin/mandolin-Ds6.mp3'),
			Ds5: require('../../../audio/samplers/mandolin/mandolin-Ds5.mp3'),
			C6: require('../../../audio/samplers/mandolin/mandolin-C6.mp3'),
			C5: require('../../../audio/samplers/mandolin/mandolin-C5.mp3'),
			Cs4: require('../../../audio/samplers/mandolin/mandolin-Cs4.mp3'),
			A6: require('../../../audio/samplers/mandolin/mandolin-A6.mp3'),
			A5: require('../../../audio/samplers/mandolin/mandolin-A5.mp3'),
			As4: require('../../../audio/samplers/mandolin/mandolin-As4.mp3'),
			As3: require('../../../audio/samplers/mandolin/mandolin-As3.mp3')
		}
	},
	violin: {
		name: 'violin',
		minOctave: 3,
		maxOctave: 6,
		release: 0.2,
		maxAmplitude: 0.8,
		samples: {
			A3: require('../../../audio/samplers/violin/violin-A3.mp3'),
			A4: require('../../../audio/samplers/violin/violin-A4.mp3'),
			A5: require('../../../audio/samplers/violin/violin-A5.mp3'),
			A6: require('../../../audio/samplers/violin/violin-A6.mp3'),
			C4: require('../../../audio/samplers/violin/violin-C4.mp3'),
			C5: require('../../../audio/samplers/violin/violin-C5.mp3'),
			C6: require('../../../audio/samplers/violin/violin-C6.mp3'),
			C7: require('../../../audio/samplers/violin/violin-C7.mp3'),
			E4: require('../../../audio/samplers/violin/violin-E4.mp3'),
			E5: require('../../../audio/samplers/violin/violin-E5.mp3'),
			E6: require('../../../audio/samplers/violin/violin-E6.mp3'),
			G3: require('../../../audio/samplers/violin/violin-G3.mp3'),
			G4: require('../../../audio/samplers/violin/violin-G4.mp3'),
			G5: require('../../../audio/samplers/violin/violin-G5.mp3'),
			G6: require('../../../audio/samplers/violin/violin-G6.mp3')
		}
	},
	marimba: {
		name: 'Marimba',
		minOctave: 2,
		maxOctave: 5, // plus C6
		release: 0.2,
		maxAmplitude: 0.99212646484375,
		gain: 2,
		samples: {
			B2: require('../../../audio/samplers/marimba/marimba-B2.mp3'),
			B4: require('../../../audio/samplers/marimba/marimba-B4.mp3'),
			C2: require('../../../audio/samplers/marimba/marimba-C2.mp3'),
			C4: require('../../../audio/samplers/marimba/marimba-C4.mp3'),
			C6: require('../../../audio/samplers/marimba/marimba-C6.mp3'),
			F1: require('../../../audio/samplers/marimba/marimba-F1.mp3'),
			F3: require('../../../audio/samplers/marimba/marimba-F3.mp3'),
			F5: require('../../../audio/samplers/marimba/marimba-F5.mp3'),
			G2: require('../../../audio/samplers/marimba/marimba-G2.mp3'),
			G4: require('../../../audio/samplers/marimba/marimba-G4.mp3')
		}
	},
	glockenspiel: {
		name: 'Glockenspiel',
		minOctave: 4,
		maxOctave: 6, // plus C7
		release: 0.2,
		maxAmplitude: 0.9,
		gain: 5,
		samples: {
			C5: require('../../../audio/samplers/glock/glockenspiel-C5.mp3'),
			C6: require('../../../audio/samplers/glock/glockenspiel-C6.mp3'),
			C7: require('../../../audio/samplers/glock/glockenspiel-C7.mp3'),
			G4: require('../../../audio/samplers/glock/glockenspiel-G4.mp3'),
			G5: require('../../../audio/samplers/glock/glockenspiel-G5.mp3'),
			G6: require('../../../audio/samplers/glock/glockenspiel-G6.mp3')
		}
	},
	bass: {
		name: 'Double Bass',
		minOctave: 0,
		maxOctave: 3,
		release: 0.2,
		maxAmplitude: 0.7149266004562378,
		samples: {
			A0: require('../../../audio/samplers/bass/double-bass-pizz-a0.mp3'),
			A1: require('../../../audio/samplers/bass/double-bass-pizz-a1.mp3'),
			A2: require('../../../audio/samplers/bass/double-bass-pizz-a2.mp3'),
			As0: require('../../../audio/samplers/bass/double-bass-pizz-as0.mp3'),
			As1: require('../../../audio/samplers/bass/double-bass-pizz-as1.mp3'),
			As2: require('../../../audio/samplers/bass/double-bass-pizz-as2.mp3'),
			B0: require('../../../audio/samplers/bass/double-bass-pizz-b0.mp3'),
			B1: require('../../../audio/samplers/bass/double-bass-pizz-b1.mp3'),
			B2: require('../../../audio/samplers/bass/double-bass-pizz-b2.mp3'),
			C1: require('../../../audio/samplers/bass/double-bass-pizz-c1.mp3'),
			C2: require('../../../audio/samplers/bass/double-bass-pizz-c2.mp3'),
			C3: require('../../../audio/samplers/bass/double-bass-pizz-c3.mp3'),
			Cs1: require('../../../audio/samplers/bass/double-bass-pizz-cs1.mp3'),
			Cs2: require('../../../audio/samplers/bass/double-bass-pizz-cs2.mp3'),
			Cs3: require('../../../audio/samplers/bass/double-bass-pizz-cs3.mp3'),
			D1: require('../../../audio/samplers/bass/double-bass-pizz-d1.mp3'),
			D2: require('../../../audio/samplers/bass/double-bass-pizz-d2.mp3'),
			D3: require('../../../audio/samplers/bass/double-bass-pizz-d3.mp3'),
			Ds1: require('../../../audio/samplers/bass/double-bass-pizz-ds1.mp3'),
			Ds2: require('../../../audio/samplers/bass/double-bass-pizz-ds2.mp3'),
			Ds3: require('../../../audio/samplers/bass/double-bass-pizz-ds3.mp3'),
			E0: require('../../../audio/samplers/bass/double-bass-pizz-e0.mp3'),
			E1: require('../../../audio/samplers/bass/double-bass-pizz-e1.mp3'),
			E2: require('../../../audio/samplers/bass/double-bass-pizz-e2.mp3'),
			E3: require('../../../audio/samplers/bass/double-bass-pizz-e3.mp3'),
			F0: require('../../../audio/samplers/bass/double-bass-pizz-f0.mp3'),
			F1: require('../../../audio/samplers/bass/double-bass-pizz-f1.mp3'),
			F2: require('../../../audio/samplers/bass/double-bass-pizz-f2.mp3'),
			F3: require('../../../audio/samplers/bass/double-bass-pizz-f3.mp3'),
			Fs0: require('../../../audio/samplers/bass/double-bass-pizz-fs0.mp3'),
			Fs1: require('../../../audio/samplers/bass/double-bass-pizz-fs1.mp3'),
			Fs2: require('../../../audio/samplers/bass/double-bass-pizz-fs2.mp3'),
			Fs3: require('../../../audio/samplers/bass/double-bass-pizz-fs3.mp3'),
			G0: require('../../../audio/samplers/bass/double-bass-pizz-g0.mp3'),
			G1: require('../../../audio/samplers/bass/double-bass-pizz-g1.mp3'),
			G2: require('../../../audio/samplers/bass/double-bass-pizz-g2.mp3'),
			G3: require('../../../audio/samplers/bass/double-bass-pizz-g3.mp3'),
			Gs0: require('../../../audio/samplers/bass/double-bass-pizz-gs0.mp3'),
			Gs1: require('../../../audio/samplers/bass/double-bass-pizz-gs1.mp3'),
			Gs2: require('../../../audio/samplers/bass/double-bass-pizz-gs2.mp3')
		}
	},
	harp: {
		name: 'Harp',
		minOctave: 1,
		maxOctave: 7, // plus C8
		release: 0.2,
		maxAmplitude: 0.16949979960918427,
		samples: {
			A2: require('../../../audio/samplers/harp/harp-A2-mf.mp3'),
			A4: require('../../../audio/samplers/harp/harp-A4-mf.mp3'),
			A6: require('../../../audio/samplers/harp/harp-A6-mf.mp3'),
			B1: require('../../../audio/samplers/harp/harp-B1-mf.mp3'),
			B3: require('../../../audio/samplers/harp/harp-B3-mf.mp3'),
			B5: require('../../../audio/samplers/harp/harp-B5-mf.mp3'),
			B6: require('../../../audio/samplers/harp/harp-B6-mf.mp3'),
			C3: require('../../../audio/samplers/harp/harp-C3-mf.mp3'),
			C5: require('../../../audio/samplers/harp/harp-C5-mf.mp3'),
			D2: require('../../../audio/samplers/harp/harp-D2-mf.mp3'),
			D4: require('../../../audio/samplers/harp/harp-D4-mf.mp3'),
			D6: require('../../../audio/samplers/harp/harp-D6-mf.mp3'),
			D7: require('../../../audio/samplers/harp/harp-D7-f.mp3'),
			E1: require('../../../audio/samplers/harp/harp-E1-f.mp3'),
			E3: require('../../../audio/samplers/harp/harp-E3-mf.mp3'),
			E5: require('../../../audio/samplers/harp/harp-E5-mf.mp3'),
			F2: require('../../../audio/samplers/harp/harp-F2-mf.mp3'),
			F4: require('../../../audio/samplers/harp/harp-F4-mf.mp3'),
			F6: require('../../../audio/samplers/harp/harp-F6-mf.mp3'),
			F7: require('../../../audio/samplers/harp/harp-F7-f.mp3'),
			G3: require('../../../audio/samplers/harp/harp-G3-mf.mp3'),
			G5: require('../../../audio/samplers/harp/harp-G5-mf.mp3')
		}
	},
	trumpet: {
		name: 'Trumpet',
		minOctave: 2,
		maxOctave: 4, // plus C8
		release: 0.1,
		maxAmplitude: 0.3986937999725342,
		samples: {
			A2: require('../../../audio/samplers/trumpet/trumpet-A2-v1.mp3'),
			A4: require('../../../audio/samplers/trumpet/trumpet-A4-v1.mp3'),
			As3: require('../../../audio/samplers/trumpet/trumpet-As3-v1.mp3'),
			C3: require('../../../audio/samplers/trumpet/trumpet-C3-v1.mp3'),
			C5: require('../../../audio/samplers/trumpet/trumpet-C5-v1.mp3'),
			D4: require('../../../audio/samplers/trumpet/trumpet-D4-v1.mp3'),
			Ds3: require('../../../audio/samplers/trumpet/trumpet-Ds3-v1.mp3'),
			F2: require('../../../audio/samplers/trumpet/trumpet-F2-v1.mp3'),
			F4: require('../../../audio/samplers/trumpet/trumpet-F4-v1.mp3'),
			G3: require('../../../audio/samplers/trumpet/trumpet-G3-v1.mp3')
		}
	},
	electricGuitar: {
		name: 'Electric Guitar',
		minOctave: 2,
		maxOctave: 4,
		release: 0.1,
		gain: 0.4,
		samples: {
			Gs5: require('../../../audio/samplers/electric-guitar/electric-guitar-Gs5.mp3'),
			Gs4: require('../../../audio/samplers/electric-guitar/electric-guitar-Gs4.mp3'),
			Gs3: require('../../../audio/samplers/electric-guitar/electric-guitar-Gs3.mp3'),
			Gs2: require('../../../audio/samplers/electric-guitar/electric-guitar-Gs2.mp3'),
			G5: require('../../../audio/samplers/electric-guitar/electric-guitar-G5.mp3'),
			G4: require('../../../audio/samplers/electric-guitar/electric-guitar-G4.mp3'),
			G3: require('../../../audio/samplers/electric-guitar/electric-guitar-G3.mp3'),
			G2: require('../../../audio/samplers/electric-guitar/electric-guitar-G2.mp3'),
			Fs5: require('../../../audio/samplers/electric-guitar/electric-guitar-Fs5.mp3'),
			Fs4: require('../../../audio/samplers/electric-guitar/electric-guitar-Fs4.mp3'),
			Fs3: require('../../../audio/samplers/electric-guitar/electric-guitar-Fs3.mp3'),
			Fs2: require('../../../audio/samplers/electric-guitar/electric-guitar-Fs2.mp3'),
			F5: require('../../../audio/samplers/electric-guitar/electric-guitar-F5.mp3'),
			F4: require('../../../audio/samplers/electric-guitar/electric-guitar-F4.mp3'),
			F3: require('../../../audio/samplers/electric-guitar/electric-guitar-F3.mp3'),
			F2: require('../../../audio/samplers/electric-guitar/electric-guitar-F2.mp3'),
			E5: require('../../../audio/samplers/electric-guitar/electric-guitar-E5.mp3'),
			E4: require('../../../audio/samplers/electric-guitar/electric-guitar-E4.mp3'),
			E3: require('../../../audio/samplers/electric-guitar/electric-guitar-E3.mp3'),
			E2: require('../../../audio/samplers/electric-guitar/electric-guitar-E2.mp3'),
			Ds5: require('../../../audio/samplers/electric-guitar/electric-guitar-Ds5.mp3'),
			Ds4: require('../../../audio/samplers/electric-guitar/electric-guitar-Ds4.mp3'),
			Ds3: require('../../../audio/samplers/electric-guitar/electric-guitar-Ds3.mp3'),
			D5: require('../../../audio/samplers/electric-guitar/electric-guitar-D5.mp3'),
			D4: require('../../../audio/samplers/electric-guitar/electric-guitar-D4.mp3'),
			D3: require('../../../audio/samplers/electric-guitar/electric-guitar-D3.mp3'),
			Cs5: require('../../../audio/samplers/electric-guitar/electric-guitar-Cs5.mp3'),
			Cs4: require('../../../audio/samplers/electric-guitar/electric-guitar-Cs4.mp3'),
			Cs3: require('../../../audio/samplers/electric-guitar/electric-guitar-Cs3.mp3'),
			C5: require('../../../audio/samplers/electric-guitar/electric-guitar-C5.mp3'),
			C4: require('../../../audio/samplers/electric-guitar/electric-guitar-C4.mp3'),
			C3: require('../../../audio/samplers/electric-guitar/electric-guitar-C3.mp3'),
			B5: require('../../../audio/samplers/electric-guitar/electric-guitar-B5.mp3'),
			B4: require('../../../audio/samplers/electric-guitar/electric-guitar-B4.mp3'),
			B3: require('../../../audio/samplers/electric-guitar/electric-guitar-B3.mp3'),
			B2: require('../../../audio/samplers/electric-guitar/electric-guitar-B2.mp3'),
			As5: require('../../../audio/samplers/electric-guitar/electric-guitar-As5.mp3'),
			As4: require('../../../audio/samplers/electric-guitar/electric-guitar-As4.mp3'),
			As3: require('../../../audio/samplers/electric-guitar/electric-guitar-As3.mp3'),
			As2: require('../../../audio/samplers/electric-guitar/electric-guitar-As2.mp3'),
			A5: require('../../../audio/samplers/electric-guitar/electric-guitar-A5.mp3'),
			A4: require('../../../audio/samplers/electric-guitar/electric-guitar-A4.mp3'),
			A3: require('../../../audio/samplers/electric-guitar/electric-guitar-A3.mp3'),
			A2: require('../../../audio/samplers/electric-guitar/electric-guitar-A2.mp3')
		}
	},
	midiOut: {
		name: 'Midi Out',
		minOctave: 0,
		maxOctave: 7, // plus C8
		release: 0.1,
		maxAmplitude: 0.8,
		gain: 0.5,
	}
};

export {instruments};

const sampleRequests = new Map();

const AbortController = window.AbortController || function () {
	return {
		signal: null,
		abort: () => {}
	};
};

function fetchAudioBuffer(url, fetchOptions) {
	return fetch(url, fetchOptions)
		.then(response => response.arrayBuffer())
		.then(decodeAudioBuffer)
		.catch(error => {
			throw new Error(`Error decoding sampler (${url}): ${error.message}`);
		});
}

function getAudioBuffer(url, receiverSignal) {
	let req = sampleRequests.get(url);
	if (!req) {
		const controller = new AbortController();
		const signal = controller.signal;
		const promise = fetchAudioBuffer(url, { signal }).then(buffer => {
			req.resolved = true;
			return buffer;
		});

		req = {
			controller,
			promise,
			resolved: false,
			receivers: new Set()
		};
		sampleRequests.set(url, req);
	}

	if (receiverSignal) {
		req.receivers.add(receiverSignal);
		receiverSignal.addEventListener('abort', () => {
			req.receivers.delete(receiverSignal);
			if (!req.receivers.size) {
				if (!req.resolved) {
					req.controller.abort();
				}
				sampleRequests.delete(url);
			}
		});
	}
	return req.promise;
}

export function loadSamples(sampleUrls, signal) {
	const samples = {};
	const promises = Object.keys(sampleUrls).map(async key => {
		const buffer = await getAudioBuffer(sampleUrls[key], signal);
		const match = /([a-z]+)([0-9]+)/i.exec(key);
		if (match) {
			const noteName = match[1].replace('s', '#');
			const octave = parseInt(match[2], 10);
			const note = getNoteMidi(noteName, octave);
			samples[note] = buffer;
		} else if (DEBUG) {
			console.log('no sampler match', key, sampleUrls[key]);
		}
	});
	return Promise.all(promises).then(() => {
		// let maxAmplitude = 0;
		// Object.keys(samples).forEach(note => {
		// 	const buffer = samples[note];
		// 	for (let c = 0; c < buffer.numberOfChannels; c++) {
		// 		const channel = buffer.getChannelData(c);
		// 		for (let i = 0; i < channel.length; i++) {
		// 			const amp = Math.abs(channel[i]);
		// 			maxAmplitude = Math.max(amp, maxAmplitude);
		// 		}
		// 	}
		// });

		// console.log({
		// 	maxAmplitude
		// });

		return samples;
	}).catch(err => {
		if (err.name === 'AbortError') {
			console.log('Request aborted');
		} else {
			throw err;
		}
	});
}

/*
Fetch all instrument samples, but do not save or decode them.
This is to cache prime them for offline support, but only when the
web app is installed.
*/
const standalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches ||
	window.navigator.standalone; // safari

async function fetchAllSamples() {
	const sampleSets = Object.keys(instruments).map(key => instruments[key].samples);
	for (let i = 0; i < sampleSets.length; i++) {
		const samples = sampleSets[i];
		const urls = Object.keys(samples).map(key => samples[key]);
		for (let j = 0; j < urls.length; j++) {
			await fetch(urls[j]);
			console.log('fetched', urls[j]);
		}
	}
}

window.addEventListener('appinstalled', fetchAllSamples);

if (standalone) {
	if (document.readyState === 'complete') {
		fetchAllSamples();
	} else {
		window.addEventListener('load', fetchAllSamples);
	}
}