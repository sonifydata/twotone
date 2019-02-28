import Worker from '!worker-loader!./wav.worker.js';

let nextRequestId = 0;
let worker = null;
const requestPromises = new WeakMap();
const pendingRequests = new Map();

function cleanUp() {
	if (!pendingRequests.size) {
		worker.terminate();
		worker = null;
	}
}

function receiveMessage(event) {
	const { requestId, blob } = event.data;
	const resolve = pendingRequests.get(requestId);
	pendingRequests.delete(requestId);
	resolve(blob);
	setTimeout(cleanUp, 5000);
}

export default function encodeWav(buffer) {
	let promise = requestPromises.get(buffer);

	if (!promise) {
		const requestId = nextRequestId++;
		if (!worker) {
			worker = new Worker();
			worker.onmessage = receiveMessage;
		}

		promise = new Promise((resolve/*, reject*/) => {
			pendingRequests.set(requestId, resolve);

			const arrays = [];
			for (let c = 0; c < buffer.numberOfChannels; c++) {
				arrays.push(buffer.getChannelData(c));
			}
			const buffers = arrays.map(a => a.buffer);

			worker.postMessage({
				arrays,
				sampleRate: buffer.sampleRate,
				requestId
			}, buffers);
		});
		requestPromises.set(buffer, promise);
	}
	return promise;
}