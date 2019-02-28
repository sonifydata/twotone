import Worker from '!worker-loader!./mp3.worker.js';

let nextRequestId = 0;
let worker = null;
const pendingRequests = new Map();

function cleanUp() {
	if (!pendingRequests.size) {
		worker.terminate();
		worker = null;
	}
}

function receiveMessage(event) {
	const {
		requestId,
		error,
		blob
	} = event.data;

	const request = pendingRequests.get(requestId);

	if (error) {
		request.reject(error);
		pendingRequests.delete(requestId);
		setTimeout(cleanUp, 5000);
		return;
	}

	const progress = blob ? 1 : event.data.progress;
	if (progress && request.onProgress) {
		request.onProgress(progress);
	}

	if (blob) {
		request.resolve(blob);
		pendingRequests.delete(requestId);
		setTimeout(cleanUp, 5000);
	}
}

export default function encodeMp3(buffer, meta, bitRate = 128, onProgress, abortSignal) {
	const requestId = nextRequestId++;
	if (!worker) {
		worker = new Worker();
		worker.onmessage = receiveMessage;
	}

	return new Promise((resolve, reject) => {
		pendingRequests.set(requestId, {
			resolve,
			reject,
			onProgress
		});

		const arrays = [];
		for (let c = 0; c < buffer.numberOfChannels; c++) {
			arrays.push(buffer.getChannelData(c));
		}
		const buffers = arrays.map(a => a.buffer);

		worker.postMessage({
			arrays,
			sampleRate: buffer.sampleRate,
			bitRate,
			meta,
			requestId
		}, buffers);

		if (abortSignal) {
			abortSignal.addEventListener('abort', () => {
				if (pendingRequests.has(requestId) && worker) {
					worker.postMessage({
						requestId,
						command: 'abort'
					});
				}
			});
		}
	});
}