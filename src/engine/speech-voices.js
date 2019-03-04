/* global SPEECH_API_KEY */
import * as idbKeyval from 'idb-keyval';
import { genders } from '../constants';
import capitalize from '../util/capitalize';
import reportError from '../util/reportError';

const VOICES_URL = `https://texttospeech.googleapis.com/v1beta1/voices?key=${SPEECH_API_KEY || ''}`;

const voicesByLanguage = new Map();
const voicesCacheDB = new idbKeyval.Store('voices-cache-db', 'voices-cache');

let loadVoicesPromise = null;

function fetchVoices() {
	return fetch(VOICES_URL, {
		headers: {
			'Content-Type': 'application/json; charset=utf-8'
		},
		method: 'GET'
	})
		.then(response => response.json())
		.then(response => {
			if (response.error) {
				throw new Error(response.error.message);
			}

			const voices = new Map();
			response.voices.forEach(voice => {
				voice.isWaveNet = voice.name.indexOf('Wavenet') >= 0;
				voice.gender = capitalize(voice.ssmlGender);
				voices.set(voice.name, voice);
			});

			// store voices in indexedDB
			return idbKeyval.keys(voicesCacheDB)
				.then(oldKeys => {
					const promises = Array.from(voices.values())
						.map(voice => idbKeyval.set(voice.name, voice, voicesCacheDB));

					// remove any deleted voices
					oldKeys.forEach(key => {
						if (!voices.has(key)) {
							promises.push(idbKeyval.del(key, voicesCacheDB));
						}
					});

					return Promise.all(promises).then(() => voices);
				});
		})
		.catch(err => {
			console.warn('Error getting voices', err);
			reportError(err);

			// retrieve from indexed DB
			return idbKeyval.keys(voicesCacheDB)
				.then(oldKeys => {
					const voices = new Map();
					const promises = Array.from(oldKeys)
						.map(key =>
							idbKeyval.get(key, voicesCacheDB)
								.then(voice => voices.set(voice.name, voice)));
					return Promise.all(promises).then(() => voices);
				});
		})
		.then(voices => {
			voices.forEach(voice => {
				voice.languageCodes.forEach(lang => {
					let langGenders = voicesByLanguage.get(lang);
					if (!langGenders) {
						langGenders = new Map();
						voicesByLanguage.set(lang, langGenders);
					}

					let genderVoices = langGenders.get(voice.gender);
					if (!genderVoices) {
						genderVoices = new Map();
						langGenders.set(voice.gender, genderVoices);
					}
					genderVoices.set(voice.name, voice);
				});
			});
			return {
				voices,
				voicesByLanguage
			};
		});
}

export default function getVoices() {
	if (!loadVoicesPromise) {
		loadVoicesPromise = fetchVoices();
	}

	return loadVoicesPromise;
}

export function pickLanguage(availableLanguages, firstChoice) {
	const preferredLanguages = navigator.languages ? Array.from(navigator.languages) : [];
	if (!preferredLanguages.length) {
		const preferredLang = navigator.language || navigator.userLanguage;
		if (preferredLang) {
			preferredLanguages.push(preferredLang);
		}
	}

	if (firstChoice) {
		preferredLanguages.unshift(firstChoice);
	}

	for (let i = 0; i < preferredLanguages.length && availableLanguages; i++) {
		const lang = preferredLanguages[i];
		if (availableLanguages.has(lang)) {
			return lang;
		}

		if (lang.length === 2) {
			const match = Array.from(availableLanguages.keys())
				.find(longCode => longCode.substr(0, 2) === lang);
			if (match) {
				return match;
			}
		}
	}

	// assumes en-US is always an option
	return 'en-US';
}

export function getSpeechVoice(state) {
	const {
		speechLanguage,
		speechGender,
		speechVoiceId
	} = state;

	const selectedLanguageCode = pickLanguage(voicesByLanguage, speechLanguage);
	const voicesByGender = voicesByLanguage && voicesByLanguage.get(selectedLanguageCode);

	const availableGenders = voicesByGender ? Array.from(voicesByGender.keys()) : [];
	const gender = voicesByGender && genders.find(g => voicesByGender.has(g) && (!speechGender || speechGender === g)) ||
		availableGenders[0];

	const voices = voicesByGender && voicesByGender.get(gender);
	const voiceIds = voices ? Array.from(voices.keys()) : [];
	// const voiceList = voiceIds.map(id => voices.get(id)).sort(sortVoices);
	const selectedVoice = voices && voices.has(speechVoiceId) && speechVoiceId || voiceIds[0] || '';

	return selectedVoice;
}
