import WavEncoder from 'wav-encoder';
const encodeSync = WavEncoder.encode.sync;

function encodeBuffer(arrays, sampleRate) {
	// convert and download buffer
	const audioExport = {
		sampleRate,
		channelData: arrays
	};

	const wavBuffer = encodeSync(audioExport);
	const blob = new Blob([wavBuffer], { type: 'audio/wav' });
	return blob;
}

self.addEventListener('message', event => {
	if (event.data.arrays) {
		const blob = encodeBuffer(event.data.arrays, event.data.sampleRate);
		self.postMessage({
			blob,
			requestId: event.data.requestId
		});
	}
});