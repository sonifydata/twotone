import liveEngine from '../../engine/live';
import { store } from '../index';

export function pause() {
	liveEngine.pause();
}

export function play() {
	const { canPlay } = store.getState();
	const { midiOutPort, webMidiAvailable,  } = store.getState();
	if ( webMidiAvailable && midiOutPort === ''  ) {
		// todo: nudge more gently if no MIDI port selected
		//	alert( 'Please select a valid MIDI out port.');
	}

	if (canPlay) {
		liveEngine.play();
	}
}

export function  getCurrentTrackNumber() {
	return	liveEngine.trackNumber;
}

export function setCurrentTime(state, currentTime) {
	liveEngine.currentTime = currentTime;
}

export function setCurrentRow(state, currentRow) {
	liveEngine.currentRow = currentRow;
}

const playBlockers = new Set();
export function blockPlayback(state, symbol) {
	if (symbol) {
		playBlockers.add(symbol);
	}

	pause();
	return {
		canPlay: !playBlockers.size
	};
}

export function releasePlayback(state, symbol) {
	playBlockers.delete(symbol);
	return {
		canPlay: !playBlockers.size
	};
}
