import lamejs from 'lamejs';
import ID3Writer from 'browser-id3-writer';

//can be anything but make it a multiple of 576 to make encoders life easier
const sampleBlockSize = 1152;

function defer() {
	return new Promise(resolve => setTimeout(resolve, 0));
}

const running = new Set();

function setTag(writer, key, val) {
	try {
		writer.setFrame(key, val);
	} catch (e) {
		console.warn('Unable to set mp3 metadata', key, e.message);
	}
}

async function encodeBuffer({
	arrays,
	sampleRate,
	bitRate,
	requestId,
	meta
}, progressCallback) {
	const mp3encoder = new lamejs.Mp3Encoder(2, sampleRate, bitRate);

	const encodedBufferChunks = [];

	// lamejs wants everything to be scaled up
	// https://github.com/zhuker/lamejs/issues/10#issuecomment-141718262
	const scaledArrays = arrays.map(original => {
		const scaled = new Float32Array(original.length);
		for (let i = 0; i < scaled.length; i++) {
			scaled[i] = original[i] * 32767.5;
		}
		return scaled;
	});

	let size = 0;
	const [left, right] = scaledArrays;
	for (let i = 0; i < left.length; i += sampleBlockSize) {
		const leftChunk = left.subarray(i, i + sampleBlockSize);
		const rightChunk = right.subarray(i, i + sampleBlockSize);
		const encodedChunk = mp3encoder.encodeBuffer(leftChunk, rightChunk);
		if (encodedChunk.length > 0) {
			encodedBufferChunks.push(encodedChunk);
			size += encodedChunk.length;
		}
		progressCallback(i / left.length);

		await defer();
		if (!running.has(requestId)) {
			const e = new Error('MP3 encoding task aborted');
			e.name = 'AbortError';
			throw e;
		}
	}

	// finish writing mp3
	const encodedChunk = mp3encoder.flush();
	if (encodedChunk.length > 0) {
		encodedBufferChunks.push(encodedChunk);
		size += encodedChunk.length;
	}

	if (!meta || !Object.keys(meta).length) {
		const blob = new Blob(encodedBufferChunks, { type: 'audio/mp3' });
		return blob;
	}

	const encoded = new Int8Array(size);
	for (let i = 0, offset = 0; i < encodedBufferChunks.length; i++) {
		const chunk = encodedBufferChunks[i];
		encoded.set(chunk, offset);
		offset += chunk.length;
	}

	const id3writer = new ID3Writer(encoded.buffer);
	id3writer.padding = 0;
	Object.keys(meta).forEach(key => {
		const val = meta[key];
		if (Array.isArray(val)) {
			val.forEach(v => setTag(id3writer, key, v));
		} else {
			setTag(id3writer, key, val);
		}
	});
	id3writer.addTag();

	const blob = new Blob([id3writer.arrayBuffer], { type: 'audio/mp3' });
	return blob;
}

self.addEventListener('message', async event => {
	const {
		requestId,
		command
	} = event.data;
	if (command === 'abort') {
		running.delete(requestId);
		return;
	}

	if (event.data.arrays) {
		const {
			arrays,
			sampleRate,
			meta,
			bitRate
		} = event.data;

		try {
			running.add(requestId);
			const blob = await encodeBuffer({
				arrays,
				sampleRate,
				bitRate,
				meta,
				requestId
			}, progress => {
				self.postMessage({
					progress,
					requestId
				});
			});

			self.postMessage({
				blob,
				requestId
			});
		} catch (error) {
			if (error.name !== 'AbortError') {
				console.log('mp3.worker error', error, error.stack);
				self.postMessage({
					requestId,
					error: error.message
				});
			}
		}
		running.delete(requestId);
	}
});