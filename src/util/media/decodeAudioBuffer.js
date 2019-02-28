import { requirements } from '../loadRequirements';

let context = null;
let lastUsed = 0;
let timeout = 0;

function cleanUp() {
	clearTimeout(timeout);
	if (context) {
		const diff = Date.now() - lastUsed;
		if (diff > 1) {
			context.close();
			context = null;
		} else {
			timeout = setTimeout(cleanUp, diff);
		}
	}
}

export default function decodeAudioBuffer(buffer) {
	const { AudioContext } = requirements.AudioContext;

	if (!context) {
		context = new AudioContext();
	}
	lastUsed = Date.now();

	// Safari doesn't support decodeAudioData returning a Promise
	return new Promise((resolve, reject) =>
		context.decodeAudioData(buffer, resolve, reject)
	).finally(cleanUp);
}
