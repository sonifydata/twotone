/* global SPEECH_API_KEY */
import liveEngine from './live';
import { store, actions } from '../store';
import { mapActions } from 'unistore/src/util';
import getVoices, { getSpeechVoice } from '../engine/speech-voices';
import normalizeSpaces from '../util/normalizeSpaces';

const changeProperties = [
	'data',
	'tracks',
	'rowDuration',
	'speechTitle',
	'speechTitleEnabled',
	'speechLanguage',
	'speechGender',
	'speechVoiceId'
];

let voicesByLanguage = null;

store.subscribe(state => {
	liveEngine.tracksVolume = state.tracksVolume;

	const needChange = changeProperties.some(prop => liveEngine[prop] !== state[prop]);

	if (!needChange) {
		return;
	}

	liveEngine.data = state.data;
	liveEngine.tracks = state.tracks || [];
	liveEngine.rowDuration = state.rowDuration;
	liveEngine.speechTitleEnabled = state.speechTitleEnabled;

	const speechText = normalizeSpaces(state.speechTitleEnabled && state.speechTitle);

	liveEngine.speechTitle = speechText;
	if (SPEECH_API_KEY && speechText) {
		if (voicesByLanguage) {
			liveEngine.speechVoiceId = getSpeechVoice(state);
		} else {
			getVoices().then(voices => {
				voicesByLanguage = voices.voicesByLanguage;
				liveEngine.speechVoiceId = getSpeechVoice(state);
				liveEngine.update();
			});
		}
	}

	liveEngine.update();
});

liveEngine.on('play', () => {
	store.setState({
		paused: false
	});
});

liveEngine.on('pause', () => {
	store.setState({
		paused: true
	});
});

const boundActions = mapActions(actions, store);
const loadingPlayBlocker = Symbol();
const updateLoaded = () => {
	const audioLoaded = liveEngine.loaded;
	if (audioLoaded) {
		boundActions.releasePlayback(loadingPlayBlocker);
	} else {
		boundActions.blockPlayback(loadingPlayBlocker);
	}

	store.setState({
		audioLoaded,
		duration: liveEngine.duration
	});
};

// liveEngine.on('loading', updateLoaded);
// liveEngine.on('loaded', updateLoaded);
// delay a tiny bit so we don't have to see a quick flash of button change
liveEngine.on('loading', () => setTimeout(updateLoaded, 250));
liveEngine.on('loaded', () => setTimeout(updateLoaded, 250));
liveEngine.on('durationchange', () => {
	store.setState({
		duration: liveEngine.duration
	});
});

liveEngine.on('timeupdate', () => {
	store.setState({
		// todo: make an action function to query this?
		currentTime: Math.round(liveEngine.currentTime * 12) / 12,
		currentRow: liveEngine.currentRow
	});
});
