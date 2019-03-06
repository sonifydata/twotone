import { requirements } from '../loadRequirements';

const CONTEXT_TIME = 10; // milliseconds

const pending = new Set();

let context = null;
let lastUsed = 0;
let timeout = 0;
let req = 0;

function cleanUp() {
	clearTimeout(timeout);
	if (context) {
		const diff = Date.now() - lastUsed;
		if (diff > CONTEXT_TIME && !pending.size) {
			context.close();
			context = null;
		} else {
			timeout = setTimeout(cleanUp, CONTEXT_TIME);
		}
	}
}

export default function decodeAudioBuffer(buffer) {
	const { AudioContext } = requirements.AudioContext;

	if (!context) {
		context = new AudioContext();
	}
	lastUsed = Date.now();

	const reqId = req++;
	pending.add(reqId);

	const handle = callback => arg => {
		pending.delete(reqId);
		cleanUp();
		callback(arg);
	};

	// Safari doesn't support decodeAudioData returning a Promise
	return new Promise((resolve, reject) =>
		context.decodeAudioData(buffer, handle(resolve), handle(reject))
	);
}
