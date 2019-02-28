import { DEFAULT_TRACK_TYPE } from '../../constants';

export default function setTrack(state, trackData, id) {
	const tracks = [...state.tracks];
	const index = id && tracks.findIndex(t => t.id === id);
	const existing = index >= 0 && index < tracks.length;
	if (!trackData) {
		if (existing) {
			tracks.splice(index, 1);
		}
		return { tracks };
	}

	const newTrack = { ...trackData };
	if (!newTrack.type) {
		newTrack.type = DEFAULT_TRACK_TYPE;
	}
	if (!newTrack.id) {
		newTrack.id = 'track@' + Date.now();
	}
	if (existing) {
		tracks.splice(index, 1, newTrack);
	} else {
		tracks.push(newTrack);
	}

	return {
		tracks
	};
}