/* global SPEECH_API_KEY */
import decodeAudioBuffer from '../util/media/decodeAudioBuffer';
import getVoices from './speech-voices';
import * as idbKeyval from 'idb-keyval';

import { SPEECH_AUDIO_CACHE_LIMIT } from '../constants';

const DEFAULT_VOICE = 'en-US-Wavenet-C';

const API_URL = `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${SPEECH_API_KEY}`;
const FORMATS = [
	['audio/ogg;codecs=opus', 'OGG_OPUS'],
	['audio/mpeg;codecs=mp3', 'MP3'],
	['audio/wav', 'LINEAR16']
];
const [/*audioMimeType*/, audioEncoding] = (() => {
	const el = document.createElement('audio');
	return FORMATS.find(f => !f[0] || !!el.canPlayType(f[0]));
})();

const audioConfig = {
	audioEncoding
};
const headers = {
	'Content-Type': 'application/json; charset=utf-8'
};

const pendingPromises = new Map();
const speechIndex = new Map();
const speechIndexDB = new idbKeyval.Store('speech-cache-index-db', 'speech-index');
const speechCacheDB = new idbKeyval.Store('speech-cache-db', 'speech-cache');

let speechIndexLoadPromise = null;
function loadSpeechCacheIndex() {
	if (!speechIndexLoadPromise) {
		speechIndexLoadPromise = idbKeyval.keys(speechIndexDB)
			.then(keys => Promise.all(keys.map(key =>
				idbKeyval.get(key, speechIndexDB).then(entry => speechIndex.set(key, entry))
			)));
	}
	return speechIndexLoadPromise;
}

function fetchTextAudio(text, voiceId) {
	const body = {
		input: {
			text
		},
		audioConfig
	};
	return getVoices().then(({voices}) => {
		const voice = voices.get(voiceId);
		if (voice) {
			body.voice = {
				name: voiceId,
				languageCode: voice.languageCodes[0]
			};
		}
		return fetch(API_URL, {
			body: JSON.stringify(body),
			headers,
			method: 'POST'
		});
	})
		.then(response => response.json())
		.then(({audioContent, error}) => {
			if (error) {
				// todo: deal with this error
				throw new Error(error.message);
			}

			// todo: optimize or move to worker
			const raw = atob(audioContent);
			const rawLength = raw.length;
			const array = new Uint8Array(new ArrayBuffer(rawLength));
			for (let i = 0; i < rawLength; i++) {
				array[i] = raw.charCodeAt(i);
			}
			return array.buffer;
		});
}

function frecency({uses, lastUseTime}) {
	const decayRate = 3.6e+6; // 1 hour
	const decay = Math.round(Math.abs(Date.now() - lastUseTime) / decayRate);
	return uses * 100 / (decay || 1);
}

async function loadSpeech(text, voiceId) {
	await loadSpeechCacheIndex();

	const promises = [];
	const id = JSON.stringify([voiceId, text]);
	let entry = speechIndex.get(id);
	let encodedBuffer = null;
	if (entry) {
		encodedBuffer = await idbKeyval.get(id, speechCacheDB);
	} else {
		encodedBuffer = await fetchTextAudio(text, voiceId);
		entry = {
			id,
			lastUseTime: 0,
			uses: 0,
			size: encodedBuffer.byteLength
		};
		await idbKeyval.set(id, encodedBuffer, speechCacheDB);

		// clean out old entries
		// sort, most valuable at the end
		const cacheEntries = Array.from(speechIndex.values()).sort((a, b) => frecency(a) - frecency(b));
		let totalSize = entry.size;
		for (let i = cacheEntries.length - 1; i >= 0; i--) {
			const e = cacheEntries[i];
			const nextSize = totalSize + e.size;
			if (nextSize <= SPEECH_AUDIO_CACHE_LIMIT) {
				totalSize = nextSize;
			} else {
				// clear this out
				speechIndex.delete(e.id);
				promises.push(idbKeyval.del(e.id, speechCacheDB));
				promises.push(idbKeyval.del(e.id, speechIndexDB));
			}
		}
	}
	entry.lastUseTime = Date.now();
	entry.uses++;

	speechIndex.set(id, entry);
	promises.push(idbKeyval.set(id, entry, speechIndexDB));
	await Promise.all(promises);
	return encodedBuffer;
}

export default function getSpeechBuffer(text, voiceId) {
	if (!voiceId) {
		voiceId = DEFAULT_VOICE;
	}

	const id = JSON.stringify([voiceId, text]);

	let promise = pendingPromises.get(id);
	if (!promise) {
		promise = loadSpeech(text, voiceId)
			.then(decodeAudioBuffer)
			.then(decodedBuffer => {
				pendingPromises.delete(id);
				return decodedBuffer;
			});
		pendingPromises.set(id, promise);
	}

	return promise;
}
